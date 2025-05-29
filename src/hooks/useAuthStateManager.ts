import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthStateManager {
  user: User | null;
  loading: boolean;
  error: string | null;
  isStable: boolean;
  clearError: () => void;
}

/**
 * Hook para gestionar el estado de autenticación de manera robusta
 * Evita condiciones de carrera y estados residuales
 */
export const useAuthStateManager = (): AuthStateManager => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStable, setIsStable] = useState(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const stabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAuthStateChange = useCallback((newUser: User | null) => {
    if (!mountedRef.current) return;

    // Limpiar timeout anterior de estabilidad
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }

    setUser(newUser);
    setLoading(false);
    setIsStable(false);
    setError(null);

    // Marcar como estable después de un breve período
    stabilityTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsStable(true);
      }
    }, 500);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    try {
      // Limpiar listener anterior si existe
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Configurar nuevo listener
      unsubscribeRef.current = onAuthStateChanged(
        auth,
        handleAuthStateChange,
        (authError) => {
          if (mountedRef.current) {
            console.error('Error en autenticación:', authError);
            setError(authError.message);
            setLoading(false);
          }
        }
      );
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error al configurar listener de autenticación:', err);
        setError('Error al inicializar autenticación');
        setLoading(false);
      }
    }

    return () => {
      mountedRef.current = false;
      
      // Limpiar listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      // Limpiar timeout
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
        stabilityTimeoutRef.current = null;
      }
    };
  }, [handleAuthStateChange]);

  return {
    user,
    loading,
    error,
    isStable,
    clearError
  };
};