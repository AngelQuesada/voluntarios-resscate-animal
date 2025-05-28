import { useEffect, useRef } from 'react';

interface UseResidualStateCleanupOptions {
  onTimeout?: () => void;
  timeoutMs?: number;
  storageKeys?: string[];
}

/**
 * Hook para limpiar estados residuales que pueden causar problemas en móviles
 */
export function useResidualStateCleanup(options: UseResidualStateCleanupOptions = {}) {
  const {
    onTimeout,
    timeoutMs = 30000, // 30 segundos por defecto
    storageKeys = ['loginFormState', 'authRedirectPending', 'loginTimeout']
  } = options;
  
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCleanupActiveRef = useRef(false);

  const performCleanup = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Limpiar sessionStorage
      storageKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`No se pudo limpiar ${key} de sessionStorage:`, e);
        }
      });

      // Limpiar localStorage relacionado con auth si existe
      try {
        const authKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('firebase') || key.includes('auth'))) {
            authKeys.push(key);
          }
        }
        authKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`No se pudo limpiar ${key} de localStorage:`, e);
          }
        });
      } catch (e) {
        console.warn('Error limpiando localStorage:', e);
      }

      // En móviles, forzar garbage collection si está disponible
      const isMobile = window.innerWidth < 768;
      if (isMobile && 'gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignorar errores de GC
        }
      }

    } catch (error) {
      console.warn('Error durante limpieza de estados residuales:', error);
    }
  };

  const startCleanupTimer = () => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    cleanupTimeoutRef.current = setTimeout(() => {
      if (isCleanupActiveRef.current) {
        console.warn('Timeout de limpieza alcanzado, ejecutando limpieza forzada');
        performCleanup();
        onTimeout?.();
      }
    }, timeoutMs);
  };

  const stopCleanupTimer = () => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    isCleanupActiveRef.current = false;
  };

  useEffect(() => {
    isCleanupActiveRef.current = true;
    
    // Ejecutar limpieza inicial
    performCleanup();
    
    // Iniciar timer de seguridad
    startCleanupTimer();

    // Limpiar al desmontar
    return () => {
      stopCleanupTimer();
      isCleanupActiveRef.current = false;
    };
  }, []);

  // Detectar cambios de visibilidad (útil para móviles)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isCleanupActiveRef.current) {
        // La página se volvió visible, verificar si hay estados residuales
        const hasLoginTimeout = sessionStorage.getItem('loginTimeout');
        if (hasLoginTimeout) {
          const timeoutTime = parseInt(hasLoginTimeout);
          const now = Date.now();
          if (now - timeoutTime > 5000) { // 5 segundos desde el timeout
            console.log('Detectado timeout de login previo, ejecutando limpieza');
            performCleanup();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    performCleanup,
    startCleanupTimer,
    stopCleanupTimer
  };
}