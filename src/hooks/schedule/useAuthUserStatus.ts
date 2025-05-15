import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CurrentUser } from '@/types/common';

export interface AuthUserStatus {
  currentUser: CurrentUser | null;
  authLoading: boolean;
  error: string | null;
}

interface UseAuthUserStatusProps {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

export function useAuthUserStatus({ showSnackbar }: UseAuthUserStatusProps): AuthUserStatus {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    setAuthLoading(true);
    setError(null);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const combinedUserData: CurrentUser = {
              ...(firebaseUser as Omit<FirebaseUser, 'providerData'> & { providerData?: any[] }),
              ...userDocSnap.data(),
              uid: firebaseUser.uid,
            };
            setCurrentUser(combinedUserData);
          } else {
            console.warn('User document not found in Firestore:', firebaseUser.uid);
            setCurrentUser(firebaseUser as Omit<FirebaseUser, 'providerData'> & { providerData?: any[] });
            showSnackbar('Perfil no encontrado. Funcionalidad limitada.', 'warning');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setCurrentUser(firebaseUser as Omit<FirebaseUser, 'providerData'> & { providerData?: any[] });
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(`Error al cargar datos del perfil: ${errorMessage}`);
          showSnackbar('Error al cargar datos del perfil.', 'error');
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth, showSnackbar]);

  return { currentUser, authLoading, error };
}
