/**
 * Configuración global para Playwright
 * Este archivo se ejecuta una vez antes de todos los tests
 */

import { FullConfig } from '@playwright/test';
import { 
  setupTestEnvironment, 
  cleanupTestEnvironment, 
  startTestServer, 
  isServerRunning 
} from './setup-test-environment';
import { loadTestEnvironmentVariables } from './vscode-setup';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando configuración global para tests de Playwright...');
  
  // Cargar variables de entorno
  loadTestEnvironmentVariables();
  
  // Verificar si estamos en modo de prueba
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ NODE_ENV no está configurado como "test"');
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
      enumerable: true,
      configurable: true
    });
    console.log('✅ NODE_ENV configurado como "test"');
  }

  // Verificar si PWA está desactivado
  if (process.env.DISABLE_PWA !== 'true') {
    console.warn('⚠️ DISABLE_PWA no está configurado como "true"');
    process.env.DISABLE_PWA = 'true';
    console.log('✅ DISABLE_PWA configurado como "true"');
  }

  // Verificar que estamos en entorno de prueba
  if (process.env.IS_TESTING_ENVIRONMENT !== 'true') {
    console.warn('⚠️ IS_TESTING_ENVIRONMENT no está configurado como "true"');
    process.env.IS_TESTING_ENVIRONMENT = 'true';
    console.log('✅ IS_TESTING_ENVIRONMENT configurado como "true"');
  }

  // 1. Iniciar servidor de testing en puerto 3001
  console.log('🚀 Verificando/iniciando servidor de testing...');
  const serverRunning = await isServerRunning(3001);
  
  if (!serverRunning) {
    const serverStarted = await startTestServer(3001);
    if (!serverStarted) {
      console.error('❌ Error al iniciar el servidor de testing');
      process.exit(1);
    }
  } else {
    console.log('✅ Servidor de testing ya está ejecutándose');
  }

  // 2. Limpiar la base de datos antes de inicializar
  console.log('🧹 Limpiando base de datos antes de inicializar tests...');
  await cleanupTestEnvironment();
  
  // 3. Inicializar entorno de prueba con usuarios constantes
  // Los datos variables (turnos, usuarios adicionales) se crearán en cada test según sea necesario
  const setupSuccess = await setupTestEnvironment({
    requireUsers: true,
    requireShifts: false
  });

  if (!setupSuccess) {
    console.error('❌ Error al inicializar el entorno de prueba');
    process.exit(1);
  }

  console.log('✅ Configuración global completada correctamente');
  console.log('📋 Resumen:');
  console.log(`   - Servidor de testing: ${process.env.BASE_URL || 'http://localhost:3001'}`);
  console.log('   - Usuarios constantes: Creados');
  console.log('   - Base de datos: Limpia y lista');
}

export default globalSetup;