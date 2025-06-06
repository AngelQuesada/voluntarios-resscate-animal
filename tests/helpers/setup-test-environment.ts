/**
 * Configuración del entorno de prueba
 * Este archivo se encarga de inicializar la base de datos de prueba y configurar el entorno
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {
  initTestFirebase,
  createAllTestUsers,
  generateTestShifts,
  cleanupTestData,
  cleanupTestFirebase
} from './test-db-setup';

// Cargar variables de entorno para pruebas
function loadTestEnv() {
  // Intentar cargar .env.test si existe
  const testEnvPath = path.resolve(process.cwd(), '.env.test');
  
  if (fs.existsSync(testEnvPath)) {
    dotenv.config({ path: testEnvPath });
    console.log('✅ Variables de entorno de prueba cargadas desde .env.test');
    return true;
  } else {
    // Si no existe, intentar cargar desde .env.test.example
    const exampleEnvPath = path.resolve(process.cwd(), '.env.test.example');
    
    if (fs.existsSync(exampleEnvPath)) {
      dotenv.config({ path: exampleEnvPath });
      console.log('⚠️ Variables de entorno de prueba cargadas desde .env.test.example');
      console.log('⚠️ Se recomienda crear un archivo .env.test con valores reales');
      return true;
    } else {
      console.error('❌ No se encontró ningún archivo de variables de entorno para pruebas');
      return false;
    }
  }
}

/**
 * Inicializa el entorno de prueba
 * @param options Opciones de inicialización
 */
export async function setupTestEnvironment(options: {
  requireUsers?: boolean;
  requireShifts?: boolean;
  pastDays?: number;
  futureDays?: number;
} = {}) {
  const {
    requireUsers = true,
    requireShifts = false,
    pastDays = 7,
    futureDays = 14
  } = options;

  console.log('🔄 Inicializando entorno de prueba...');
  
  // Cargar variables de entorno
  const envLoaded = loadTestEnv();
  if (!envLoaded) {
    console.error('❌ No se pudieron cargar las variables de entorno para pruebas');
    return false;
  }

  // Verificar que estamos en modo de prueba
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ No estamos en modo de prueba (NODE_ENV !== "test")');
  }

  // Verificar que PWA está desactivado
  if (process.env.DISABLE_PWA !== 'true') {
    console.warn('⚠️ PWA no está desactivado (DISABLE_PWA !== "true")');
  }

  try {
    // Inicializar Firebase
    initTestFirebase();
    console.log('✅ Firebase inicializado correctamente');

    // Crear usuarios si es necesario
    if (requireUsers) {
      const usersCreated = await createAllTestUsers();
      if (!usersCreated) {
        console.error('❌ No se pudieron crear todos los usuarios de prueba');
        return false;
      }
      console.log('✅ Usuarios de prueba creados correctamente');
    }

    // Generar turnos si es necesario
    if (requireShifts) {
      await generateTestShifts({
        pastDays,
        futureDays,
        includeAssignments: true
      });
      console.log('✅ Turnos de prueba generados correctamente');
    }

    console.log('✅ Entorno de prueba inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar el entorno de prueba:', error);
    return false;
  }
}

/**
 * Limpia el entorno de prueba
 */
export async function cleanupTestEnvironment() {
  console.log('🔄 Limpiando entorno de prueba...');
  
  try {
    // Limpiar datos de prueba
    await cleanupTestData();
    
    // Limpiar Firebase
    await cleanupTestFirebase();
    
    console.log('✅ Entorno de prueba limpiado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar el entorno de prueba:', error);
    return false;
  }
}