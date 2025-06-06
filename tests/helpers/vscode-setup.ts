/**
 * Configuración específica para la extensión de Playwright de VSCode
 * Este archivo proporciona funciones para inicializar el entorno de prueba
 * cuando se ejecutan tests individuales desde VSCode
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { setupTestEnvironment, cleanupTestEnvironment } from './setup-test-environment';

/**
 * Carga las variables de entorno necesarias para los tests
 */
export function loadTestEnvironmentVariables() {
  // Cargar variables de entorno para pruebas
  const testEnvPath = path.resolve(process.cwd(), '.env.test');
  
  if (fs.existsSync(testEnvPath)) {
    dotenv.config({ path: testEnvPath });
    console.log('✅ Variables de entorno de prueba cargadas desde .env.test');
  } else {
    // Si no existe, intentar cargar desde .env.test.example
    const exampleEnvPath = path.resolve(process.cwd(), 'tests/.env.test.example');
    
    if (fs.existsSync(exampleEnvPath)) {
      dotenv.config({ path: exampleEnvPath });
      console.log('⚠️ Variables de entorno de prueba cargadas desde .env.test.example');
    }
  }

  // Configurar variables de entorno necesarias
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
  
  if (process.env.DISABLE_PWA !== 'true') {
    process.env.DISABLE_PWA = 'true';
  }
  
  if (process.env.IS_TESTING_ENVIRONMENT !== 'true') {
    process.env.IS_TESTING_ENVIRONMENT = 'true';
  }
}

/**
 * Inicializa el entorno de prueba para tests individuales
 * Esta función se puede llamar desde beforeAll en tests específicos
 */
export async function initializeTestEnvironmentForVSCode(options: {
  requireUsers?: boolean;
  requireShifts?: boolean;
  cleanFirst?: boolean;
  pastDays?: number;
  futureDays?: number;
} = {}) {
  const {
    requireUsers = true,
    requireShifts = false,
    cleanFirst = true,
    pastDays = 7,
    futureDays = 14
  } = options;

  // Cargar variables de entorno
  loadTestEnvironmentVariables();

  // Limpiar datos existentes si se solicita
  if (cleanFirst) {
    console.log('🧹 Limpiando base de datos antes de inicializar...');
    await cleanupTestEnvironment();
  }

  // Configurar entorno de prueba
  const setupSuccess = await setupTestEnvironment({
    requireUsers,
    requireShifts,
    pastDays,
    futureDays
  });

  if (!setupSuccess) {
    throw new Error('❌ Error al inicializar el entorno de prueba');
  }

  console.log('✅ Entorno de prueba inicializado correctamente para VSCode');
  return true;
}

/**
 * Limpia el entorno de prueba después de los tests
 * Esta función se puede llamar desde afterAll en tests específicos
 */
export async function cleanupTestEnvironmentForVSCode() {
  // Solo limpiar si AUTO_CLEANUP_TEST_DATA está habilitado
  if (process.env.AUTO_CLEANUP_TEST_DATA === 'true') {
    console.log('🧹 Limpiando entorno de prueba después de los tests...');
    await cleanupTestEnvironment();
    console.log('✅ Entorno de prueba limpiado correctamente');
  } else {
    console.log('🔶 Limpieza automática desactivada, manteniendo datos de prueba');
  }
}