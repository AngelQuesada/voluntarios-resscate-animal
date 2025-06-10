import { test, expect } from '@playwright/test';
import { loginUser, checkServerStatus, checkPageLoad } from './helpers/e2e-utils';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    // Verificar estado del servidor antes de cada test
    const serverOk = await checkServerStatus(page, request, { 
      timeout: 5000, 
      failOnError: false 
    });
    
    if (!serverOk) {
      throw new Error('❌ El servidor no está disponible en el puerto 3001');
    }
    
    // Navegar a la página principal
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}`);
    
    // Verificar que la página cargó correctamente
    const pageLoaded = await checkPageLoad(page);
    if (!pageLoaded) {
      throw new Error('❌ La página no cargó correctamente');
    }
  });

  test('should login as administrator', async ({ page }) => {
    console.log('🧪 [INICIANDO] Login como administrador');
    
    const loginSuccess = await loginUser(page, {
      userType: 'ADMIN',
      checkRedirect: true,
      expectedRedirectUrl: /\/schedule$/,
      timeout: 10000
    });
    
    if (!loginSuccess) {
      console.log('❌ [FALLÓ] Login como administrador | Error: No se pudo completar el login');
      throw new Error('Login como administrador falló');
    }
    
    // Verificar que estamos en la página de schedule
    expect(page.url()).toMatch(/\/schedule$/);
    
    console.log('✅ [CORRECTO] Login como administrador');
  });

  test('should login as responsible', async ({ page }) => {
    console.log('🧪 [INICIANDO] Login como responsable');
    
    const loginSuccess = await loginUser(page, {
      userType: 'RESPONSABLE',
      checkRedirect: true,
      expectedRedirectUrl: /\/schedule$/,
      timeout: 10000
    });
    
    if (!loginSuccess) {
      console.log('❌ [FALLÓ] Login como responsable | Error: No se pudo completar el login');
      throw new Error('Login como responsable falló');
    }
    
    // Verificar que estamos en la página de schedule
    expect(page.url()).toMatch(/\/schedule$/);
    
    console.log('✅ [CORRECTO] Login como responsable');
  });

  test('should login as volunteer', async ({ page }) => {
    console.log('🧪 [INICIANDO] Login como voluntario');
    
    const loginSuccess = await loginUser(page, {
      userType: 'VOLUNTARIO',
      checkRedirect: true,
      expectedRedirectUrl: /\/schedule$/,
      timeout: 10000
    });
    
    if (!loginSuccess) {
      console.log('❌ [FALLÓ] Login como voluntario | Error: No se pudo completar el login');
      throw new Error('Login como voluntario falló');
    }
    
    // Verificar que estamos en la página de schedule
    expect(page.url()).toMatch(/\/schedule$/);
    
    console.log('✅ [CORRECTO] Login como voluntario');
  });

  test('Redirección de usuario no autenticado', async ({ page, request }) => {
    // Verificar primero si la aplicación está funcionando
    const response = await request.get(`${process.env.BASE_URL || 'http://localhost:3000'}`);
    if (!response.ok()) {
      test.fail(true, `La aplicación no está accesible. Estado: ${response.status()}`);
      return;
    }
    
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}/schedule`);
    await page.waitForURL(`${process.env.BASE_URL}` || 'http://localhost:3001', { timeout: 10000 });
    
    await expect(page).toHaveURL(/^http:\/\/localhost:3001\/?$/);
  });
});