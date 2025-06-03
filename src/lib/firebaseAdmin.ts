import admin from 'firebase-admin';

// Función para inicializar Firebase Admin una sola vez
export function initAdmin() {
  if (!admin.apps.length) {
    try {
      // Configurar credenciales usando variables de entorno
      const currentNodeEnv = process.env.NODE_ENV;
      let credentials;
      let projectId;

      if (currentNodeEnv === 'test') {
        credentials = {
          type: 'service_account',
          project_id: process.env.FIREBASE_TEST_PROJECT_ID,
          private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
          // client_x509_cert_url can be omitted or set to undefined
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          universe_domain: 'googleapis.com'
        };
        projectId = process.env.FIREBASE_TEST_PROJECT_ID;
      } else {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        credentials = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: privateKey,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
          universe_domain: 'googleapis.com'
        };
        projectId = process.env.FIREBASE_PROJECT_ID;
      }

      admin.initializeApp({
        credential: admin.credential.cert(credentials as admin.ServiceAccount),
        projectId: projectId
      });
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