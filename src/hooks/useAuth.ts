import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

export function useAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Verificar si el usuario está habilitado en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.isEnabled === false) {
          await auth.signOut();
          setError("Esta cuenta ha sido deshabilitada por el administrador. Por favor, contacta con el administrador para más información.");
          setIsLoading(false);
          return;
        }
      }
      
      // Obtener el token del usuario
      const token = await user.getIdToken();
      // Guardar el token en una cookie 
      //TODO: Cambiar el tiempo de expiración
      document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Strict`;
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