"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { UserRoles } from "@/lib/constants";
import { CircularProgress, Box } from "@mui/material";

type AuthContextType = {
  user:
    | (User & {
        name?: string;
        lastname?: string;
        roles?: number[];
      })
    | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Componente de carga para mostrar mientras se verifica la autenticación
const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      zIndex: 9999,
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Control de la navegación hacia atrás
  useEffect(() => {
    // Solo aplicar esta lógica cuando ya se ha inicializado completamente
    // y tenemos un usuario autenticado confirmado
    if (user && !loading && isInitialized && typeof window !== "undefined") {
      const handlePopState = () => {
        // Verificar si la URL a la que se quiere navegar es la página raíz (login)
        if (window.location.pathname === "/") {
          // Redirigir programáticamente a la página de turnos
          router.push("/schedule");
        }
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [user, loading, isInitialized, router]);

  // Verificar permisos para rutas de administración
  useEffect(() => {
    if (!loading && user && isInitialized && pathname?.startsWith("/admin")) {
      // Verificar si el usuario tiene rol de administrador
      const isAdmin = user.roles?.includes(UserRoles.ADMINISTRADOR);
      if (!isAdmin) {
        console.log(
          "Usuario sin permisos de administrador intentando acceder a ruta /admin"
        );
        router.push("/schedule");
      }
    }
  }, [pathname, user, loading, isInitialized, router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                ...firebaseUser,
                name: userData.name,
                lastname: userData.lastname,
                roles:
                  userData.roles === undefined
                    ? [UserRoles.VOLUNTARIO]
                    : userData.roles,
              });

              // Si estamos en la página de login, redirigir a /schedule
              if (pathname === "/") {
                router.push("/schedule");
              }
            } else {
              setUser(firebaseUser);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(firebaseUser);
          }
        } else {
          setUser(null);
          // Solo redirigir si ya está inicializada la app y estamos en una ruta protegida
          if (
            isInitialized &&
            pathname !== "/" &&
            (pathname?.startsWith("/schedule") || pathname?.startsWith("/admin"))
          ) {
            router.push("/");
          }
        }
      } finally {
        // No establecer loading a false inmediatamente si estamos en una ruta protegida
        // para evitar parpadeo de contenido no autorizado
        const isProtectedRoute =
          pathname !== "/" &&
          (pathname?.startsWith("/schedule") || pathname?.startsWith("/admin"));

        // Si no hay usuario y estamos en una ruta protegida, mantener loading hasta la redirección
        if (!firebaseUser && isProtectedRoute) {
          setTimeout(() => {
            setLoading(false);
            setIsInitialized(true);
          }, 100);
        } else {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    });

    return unsubscribe;
  }, [router, isInitialized, pathname]);

  // Mostrar pantalla de carga durante la verificación de autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
