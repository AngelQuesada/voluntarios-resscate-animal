const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Carga las credenciales de la cuenta de servicio
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.error("Error: No se pudo cargar el archivo serviceAccountKey.json.");
  console.error("Asegúrate de que el archivo existe en la raíz del proyecto (../serviceAccountKey.json) o ajusta la ruta.");
  process.exit(1);
}

// Inicializar Firebase Admin SDK si no está ya inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();
const MOCK_FILE_PATH = path.join(__dirname, '../mocks/users.json');
const DEFAULT_PASSWORD = 'testing';

async function importUsersFromJson() {
  let usersToImport;
  try {
    const fileContents = fs.readFileSync(MOCK_FILE_PATH, 'utf8');
    usersToImport = JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error al leer o parsear el archivo ${MOCK_FILE_PATH}:`, error);
    return;
  }

  if (!usersToImport || usersToImport.length === 0) {
    console.log('No se encontraron usuarios en el archivo JSON para importar.');
    return;
  }

  console.log(`Importando ${usersToImport.length} usuarios desde ${MOCK_FILE_PATH}...`);

  const firestoreBatch = db.batch();
  let authUsersCreated = 0;
  let firestoreDocsCreated = 0;
  let errorsCount = 0;

  for (const userRecord of usersToImport) {
    const { uid, email, name, lastname, roles, ...firestoreData } = userRecord;

    if (!email) {
      console.error(`Usuario omitido: Falta el campo email. UID original: ${uid || 'N/A'}`);
      errorsCount++;
      continue;
    }

    let userAuthRecord;
    try {
      // Crear usuario en Firebase Authentication
      const createUserRequest = {
        email: email,
        password: DEFAULT_PASSWORD,
        displayName: `${name || ''} ${lastname || ''}`.trim(),
        disabled: !(firestoreData.isEnabled === true), // Si isEnabled no es true, se deshabilita
      };
      // Si el UID original existe en el JSON, intentamos usarlo.
      // Firebase Auth permite especificar el UID durante la creación.
      if (uid) {
        createUserRequest.uid = uid;
      }

      userAuthRecord = await auth.createUser(createUserRequest);
      console.log(`Usuario de Auth creado: ${userAuthRecord.uid} (Email: ${email})`);
      authUsersCreated++;

      // Asignar claims (roles) si existen
      if (roles && Array.isArray(roles) && roles.length > 0) {
        // Asumimos que UserRoles.VOLUNTARIO es un valor numérico como en tu API create-user
        // Si los roles en el JSON no son numéricos, necesitarás mapearlos aquí.
        const mainRole = roles[0]; // O alguna lógica para determinar el rol principal
        await auth.setCustomUserClaims(userAuthRecord.uid, { role: mainRole, roles: roles });
        console.log(`Claims personalizados (roles) asignados para ${userAuthRecord.uid}`);
      }

      // Preparar datos para Firestore (sin el email si ya está en Auth, y sin uid porque es el ID del doc)
      const userDocumentData = {
        email, // Guardamos el email también en Firestore por consistencia con tu estructura User
        name,
        lastname,
        roles,
        ...firestoreData, // El resto de los campos, incluyendo isEnabled
        uid: userAuthRecord.uid, // Aseguramos que el uid en Firestore coincida con el de Auth
        createdAt: firestoreData.createdAt || new Date().toISOString(), // Añadir createdAt si no existe
      };
      
      // Eliminar campos que no queremos duplicar o que no pertenecen a la colección users
      delete userDocumentData.password; // No guardar contraseñas en Firestore
      
      const userDocRef = db.collection('users').doc(userAuthRecord.uid);
      firestoreBatch.set(userDocRef, userDocumentData);
      firestoreDocsCreated++;

    } catch (error) {
      console.error(`Error al procesar/importar usuario (Email: ${email}, UID original: ${uid || 'N/A'}):`, error.message);
      errorsCount++;
      // Si la creación en Auth falló, no intentamos crear en Firestore para este usuario.
      // Si el error fue por UID duplicado y quieres actualizar, la lógica sería más compleja.
    }
  }

  if (firestoreDocsCreated > 0) {
    try {
      await firestoreBatch.commit();
      console.log('Batch de Firestore completado.');
    } catch (error) {
      console.error('Error al ejecutar el batch de Firestore:', error);
      errorsCount++; // Contar esto como un error adicional
    }
  }

  console.log('\nProceso de importación finalizado.');
  console.log(`- ${authUsersCreated} usuarios creados en Firebase Authentication.`);
  console.log(`- ${firestoreDocsCreated} documentos de usuario creados/actualizados en Firestore.`);
  if (errorsCount > 0) {
    console.log(`- ${errorsCount} errores durante la importación.`);
  }
}

importUsersFromJson().then(() => {
  console.log('\nScript de importación finalizado.');
}).catch(error => {
  console.error('\nEl script de importación falló con un error general:', error);
});