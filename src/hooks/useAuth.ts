import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { UserRoles } from "@/lib/constants";

// Configuración de duración de cookies de autenticación
const AUTH_COOKIE_CONFIG = {
  // Duraciones en segundos
  MOBILE: {
    STANDARD: 30 * 24 * 60 * 60, // 30 días para móviles (uso frecuente)
    ADMIN: 7 * 24 * 60 * 60,     // 7 días para administradores en móvil
  },
  DESKTOP: {
    STANDARD: 14 * 24 * 60 * 60, // 14 días para escritorio
    ADMIN: 3 * 24 * 60 * 60,     // 3 días para administradores en escritorio
  },
  REMEMBER_ME: 90 * 24 * 60 * 60, // 90 días si el usuario marca "Recordarme"
};

// Función para determinar la duración de cookie apropiada
const getCookieDuration = (isAdmin: boolean, isMobile: boolean, rememberMe: boolean = false) => {
  if (rememberMe) {
    return AUTH_COOKIE_CONFIG.REMEMBER_ME;
  }
  
  if (isMobile) {
    return isAdmin ? AUTH_COOKIE_CONFIG.MOBILE.ADMIN : AUTH_COOKIE_CONFIG.MOBILE.STANDARD;
  } else {
    return isAdmin ? AUTH_COOKIE_CONFIG.DESKTOP.ADMIN : AUTH_COOKIE_CONFIG.DESKTOP.STANDARD;
  }
};

// Función para validar formato de email
const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export function useAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent, rememberMe: boolean = false) => {
    e.preventDefault();
    setError(null);
    
    // Validaciones previas al inicio de sesión
    if (!email.trim()) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Por favor, introduce un correo electrónico válido.");
      return;
    }
    
    if (!password) {
      setError("Por favor, introduce tu contraseña.");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar si el usuario está habilitado en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let isAdmin = false;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.isEnabled === false) {
          await auth.signOut();
          setError("Esta cuenta ha sido deshabilitada por el administrador. Por favor, contacta con el administrador para más información.");
          setIsLoading(false);
          return;
        }
        
        // Verificar si es administrador
        isAdmin = userData.roles?.includes(UserRoles.ADMINISTRADOR) || false;
      }
      
      // Obtener el token del usuario
      const token = await user.getIdToken();
      
      // Configurar duración de la cookie de forma inteligente
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const cookieMaxAge = getCookieDuration(isAdmin, isMobile, rememberMe);
      
      // Crear cookie con configuración de seguridad apropiada
      const cookieFlags = [
        `auth-token=${token}`,
        'path=/',
        `max-age=${cookieMaxAge}`,
        'SameSite=Strict',
        ...(window.location.protocol === 'https:' ? ['Secure'] : [])
      ].join('; ');
      
      document.cookie = cookieFlags;
      
      const duration = Math.floor(cookieMaxAge / (24 * 60 * 60));
      const userType = isAdmin ? 'Admin' : 'Usuario';
      const deviceType = isMobile ? 'móvil' : 'escritorio';
      const sessionType = rememberMe ? ' (Recordarme activado)' : '';
      
      console.log(`Cookie configurada: ${userType} en ${deviceType} por ${duration} días${sessionType}`);
      
      router.push("/schedule");
    } catch (error: any) {
      console.error("Error Iniciando Sesión:", error);
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/invalid-email":
        case "auth/invalid-credential":
          setError("Correo electrónico o contraseña incorrectos.");
          break;
        case "auth/wrong-password":
          setError("Correo electrónico o contraseña incorrectos.");
          break;
        default:
          setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    error, 
    isLoading, 
    handleSignIn 
  };
}