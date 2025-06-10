/**
 * Configuración para la extensión de Playwright en VS Code
 * Este archivo proporciona funciones para inicializar el entorno de prueba
 * específicamente para la extensión de Playwright en VS Code
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  verifyTestEnvironment,
  startTestServer,
  isServerRunning,
} from './setup-test-environment';
import { TestEnvironmentOptions } from './test-db-setup';

/**
 * Carga las variables de entorno para el entorno de prueba
 */
export function loadTestEnvironmentVariables() {
  // Intentar cargar .env.test primero, si no existe, cargar .env.test.example
  const envTestPath = path.resolve(process.cwd(), '.env.test');
  const envTestExamplePath = path.resolve(process.cwd(), '.env.test.example');

  if (fs.existsSync(envTestPath)) {
    console.log('📄 Cargando variables de entorno desde .env.test');
    dotenv.config({ path: envTestPath });
  } else if (fs.existsSync(envTestExamplePath)) {
    console.log('📄 Archivo .env.test no encontrado, cargando desde .env.test.example');
    dotenv.config({ path: envTestExamplePath });
  } else {
    console.warn('⚠️ No se encontraron archivos .env.test ni .env.test.example');
  }

  // Establecer variables de entorno críticas para el entorno de prueba
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    enumerable: true,
    configurable: true,
  });
  process.env.DISABLE_PWA = 'true';
  process.env.IS_TESTING_ENVIRONMENT = 'true';
  process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
}

/**
 * Inicializa el entorno de prueba para VS Code
 */
export async function initializeTestEnvironmentForVSCode(options: TestEnvironmentOptions = {}) {
  const {
    requireUsers = true,
    requireShifts = false,
    pastDays = 7,
    futureDays = 7,
    cleanupBeforeSetup = true,
  } = options;

  console.log('🔧 Inicializando entorno de prueba para VS Code...');

  // 1. Cargar variables de entorno
  loadTestEnvironmentVariables();

  // 2. Verificar si el servidor está en ejecución, si no, iniciarlo
  const serverRunning = await isServerRunning();
  if (!serverRunning) {
    console.log('🚀 Iniciando servidor de testing en puerto 3001...');
    const serverStarted = await startTestServer();
    if (!serverStarted) {
      console.error('❌ Error al iniciar el servidor de testing');
      return false;
    }
  } else {
    console.log('✅ Servidor de testing ya está en ejecución en puerto 3001');
  }

  // 3. Limpiar entorno si es necesario
  if (cleanupBeforeSetup) {
    console.log('🧹 Limpiando entorno antes de configurar...');
    await cleanupTestEnvironment();
  }

  // 4. Configurar entorno de prueba
  console.log('🔄 Configurando entorno de prueba...');
  const setupSuccess = await setupTestEnvironment({
    requireUsers,
    requireShifts,
    pastDays,
    futureDays,
  });

  if (!setupSuccess) {
    console.error('❌ Error al configurar el entorno de prueba');
    return false;
  }

  // 5. Verificar que todo esté correctamente configurado
  const isEnvironmentReady = await verifyTestEnvironment();
  if (!isEnvironmentReady) {
    console.error('❌ El entorno de prueba no está listo');
    return false;
  }

  console.log('✅ Entorno de prueba inicializado correctamente');
  return true;
}

/**
 * Limpia el entorno de prueba para VS Code
 */
export async function cleanupTestEnvironmentForVSCode() {
  console.log('🧹 Limpiando entorno de prueba para VS Code...');

  // Verificar si debemos limpiar automáticamente
  if (process.env.AUTO_CLEANUP_TEST_DATA === 'true') {
    console.log('🔄 Limpieza automática activada');
    const cleanupSuccess = await cleanupTestEnvironment();

    if (!cleanupSuccess) {
      console.error('❌ Error al limpiar el entorno de prueba');
      return false;
    }

    console.log('✅ Entorno de prueba limpiado correctamente');
    return true;
  } else {
    console.log('ℹ️ Limpieza automática desactivada');
    return false;
  }
}
