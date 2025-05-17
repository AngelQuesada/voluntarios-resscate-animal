import admin from 'firebase-admin';

// Función para inicializar Firebase Admin una sola vez
export function initAdmin() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp();
    } catch (error) {
      console.error('Error inicializando Firebase Admin:', error);
    }
  }
  return admin;
}

export const getAdminAuth = () => {
  initAdmin();
  return admin.auth();
};

export const getAdminFirestore = () => {
  initAdmin();
  return admin.firestore();
};

export default admin;