/**
 * Configuración global para Playwright
 * Este archivo se ejecuta una vez antes de todos los tests
 */

import { FullConfig } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from './setup-test-environment';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando configuración global para tests de Playwright...');
  
  // Verificar si estamos en modo de prueba
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ NODE_ENV no está configurado como "test"');
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
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

  // Limpiar la base de datos antes de inicializar
  console.log('🧹 Limpiando base de datos antes de inicializar tests...');
  await cleanupTestEnvironment();
  
  // Inicializar entorno de prueba con configuración básica
  // Esto creará los usuarios pero no los turnos
  // Los turnos se crearán en cada test según sea necesario
  const setupSuccess = await setupTestEnvironment({
    requireUsers: true,
    requireShifts: false
  });

  if (!setupSuccess) {
    console.error('❌ Error al inicializar el entorno de prueba');
    process.exit(1);
  }

  console.log('✅ Configuración global completada correctamente');
}

export default globalSetup;