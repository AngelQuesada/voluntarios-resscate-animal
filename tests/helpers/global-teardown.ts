/**
 * Limpieza global para Playwright
 * Este archivo se ejecuta una vez después de todos los tests
 */

import { FullConfig } from '@playwright/test';
import { cleanupTestDataConditional } from './test-db-setup';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando limpieza global después de los tests de Playwright...');
  
  // Verificar si debemos limpiar automáticamente los datos de prueba
  if (process.env.AUTO_CLEANUP_TEST_DATA === 'true') {
    console.log('🔄 Limpieza automática de datos de prueba activada');
    
    const cleanupSuccess = await cleanupTestDataConditional();
    
    if (!cleanupSuccess) {
      console.error('⚠️ Error durante la limpieza del entorno de prueba');
      // No salimos con error para no interrumpir el flujo de CI/CD
    } else {
      console.log('✅ Limpieza global completada correctamente');
    }
  } else {
    console.log('ℹ️ Limpieza automática de datos de prueba desactivada');
  }
}

export default globalTeardown;