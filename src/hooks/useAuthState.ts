import { useState, useEffect, useRef, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface UseAuthStateOptions {
  timeoutMs?: number;
  onAuthError?: (error: string) => void;
}

export function useAuthState(options: UseAuthStateOptions = {}) {
  const {
    timeoutMs = 10000,
    onAuthError
  } = options;

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isInitialized: false,
    error: null
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  const lastUserRef = useRef<User | null>(null);

  // Función para actualizar el estado de manera segura
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    if (isUnmountedRef.current) return;
    
    setAuthState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Función para manejar errores de autenticación
  const handleAuthError = useCallback((error: string) => {
    console.error('Error de autenticación:', error);
    updateAuthState({
      error,
      isLoading: false,
      isInitialized: true
    });
    
    if (onAuthError) {
      onAuthError(error);
    }
  }, [updateAuthState, onAuthError]);

  // Función para limpiar el estado de autenticación
  const clearAuthState = useCallback(() => {
    updateAuthState({
      user: null,
      isLoading: false,
      isInitialized: true,
      error: null
    });
    lastUserRef.current = null;
  }, [updateAuthState]);

  // Función para validar consistencia del usuario
  const validateUserConsistency = useCallback((user: User | null) => {
    try {
      if (user) {
        // Verificar que el usuario tenga propiedades básicas requeridas
        if (!user.uid || !user.email) {
          console.warn('Usuario con propiedades incompletas detectado');
          return false;
        }

        // Verificar que el token no haya expirado
        const userWithToken = user as any;
        if (userWithToken.stsTokenManager) {
          const now = Date.now();
          const expirationTime = Number(userWithToken.stsTokenManager.expirationTime);
          
          if (expirationTime && expirationTime <= now) {
            console.warn('Token de usuario expirado detectado');
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validando consistencia del usuario:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      updateAuthState({ isLoading: true, error: null });
      
      // Limpiar el listener antes del logout
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      await signOut(auth);
      
      // Limpiar localStorage relacionado con auth
      Object.keys(localStorage).forEach(key => {
        if (key.includes('firebase:authUser:') || key.includes('firebase:persistence:')) {
          localStorage.removeItem(key);
        }
      });

      clearAuthState();
      
    } catch (error) {
      console.error('Error durante logout:', error);
      handleAuthError('Error al cerrar sesión');
    }
  }, [updateAuthState, clearAuthState, handleAuthError]);

  // Inicializar listener de autenticación
  useEffect(() => {
    let mounted = true;
    isUnmountedRef.current = false;

    const initializeAuth = async () => {
      try {
        // Timeout para evitar carga indefinida
        initTimeoutRef.current = setTimeout(() => {
          if (mounted && !authState.isInitialized) {
            console.warn('Timeout en inicialización de auth, forzando estado inicial');
            updateAuthState({
              user: null,
              isLoading: false,
              isInitialized: true,
              error: 'Timeout en inicialización'
            });
          }
        }, timeoutMs);

        // Configurar listener de cambios de autenticación
        unsubscribeRef.current = onAuthStateChanged(
          auth,
          (user) => {
            if (!mounted) return;

            try {
              // Limpiar timeout ya que recibimos una respuesta
              if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
              }

              // Validar consistencia del usuario
              if (user && !validateUserConsistency(user)) {
                console.warn('Usuario inconsistente detectado, limpiando estado');
                clearAuthState();
                return;
              }

              // Evitar actualizaciones innecesarias
              if (lastUserRef.current?.uid === user?.uid && authState.isInitialized) {
                return;
              }

              lastUserRef.current = user;

              updateAuthState({
                user,
                isLoading: false,
                isInitialized: true,
                error: null
              });

              console.log('Estado de autenticación actualizado:', {
                hasUser: !!user,
                userId: user?.uid,
                email: user?.email
              });

            } catch (error) {
              console.error('Error procesando cambio de autenticación:', error);
              handleAuthError('Error procesando estado de autenticación');
            }
          },
          (error) => {
            if (!mounted) return;

            console.error('Error en listener de autenticación:', error);
            handleAuthError(error.message);
          }
        );

      } catch (error) {
        if (mounted) {
          console.error('Error inicializando autenticación:', error);
          handleAuthError('Error al inicializar autenticación');
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      isUnmountedRef.current = true;
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [timeoutMs, updateAuthState, handleAuthError, clearAuthState, validateUserConsistency]);

  // Función para refrescar el estado de autenticación
  const refreshAuthState = useCallback(() => {
    if (authState.isLoading) return;
    
    updateAuthState({ isLoading: true, error: null });
    
    // Forzar re-evaluación del estado actual
    const currentUser = auth.currentUser;
    
    if (currentUser && validateUserConsistency(currentUser)) {
      updateAuthState({
        user: currentUser,
        isLoading: false,
        isInitialized: true,
        error: null
      });
    } else {
      clearAuthState();
    }
  }, [authState.isLoading, updateAuthState, validateUserConsistency, clearAuthState]);

  return {
    ...authState,
    logout,
    refreshAuthState,
    isAuthenticated: !!authState.user && authState.isInitialized,
    isReady: authState.isInitialized && !authState.isLoading
  };
}