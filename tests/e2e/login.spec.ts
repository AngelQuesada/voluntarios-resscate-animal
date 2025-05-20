import { test, expect } from '@playwright/test';

test.describe('Flujo de inicio de sesión', () => {
  // Hook de configuración para todos los tests
  test.beforeEach(async ({ page }) => {
    // Navegar a la URL base y verificar que carga correctamente
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
    
    // Verificar si la página cargó correctamente o si hay un error 404
    const is404 = await page.locator('text="404"').isVisible().catch(() => false);
    
    if (is404) {
      console.error('⚠️ La página cargó con error 404. Comprueba que el servidor esté ejecutándose y que BASE_URL sea correcto.');
      // Capturar una captura de pantalla para diagnóstico
      await page.screenshot({ path: './test-results/server-not-running.png' });
      // También obtener el HTML actual para mejor diagnóstico
      const html = await page.content();
      console.log('HTML actual:', html.substring(0, 500) + '...');
      test.fail(true, 'La aplicación devolvió un error 404. Verifica que el servidor esté en ejecución.');
    }
    
    // Esperar a que el formulario de inicio de sesión se cargue
    await page.waitForSelector('form', { timeout: 5000 }).catch((error) => {
      console.error('⚠️ No se encontró el formulario de inicio de sesión.', error);
    });
  });

  test('Inicio de sesión de administrador', async ({ page }) => {
    // Verificar que estamos en la página de inicio de sesión
    const loginFormExists = await page.locator('form').isVisible().catch(() => false);
    if (!loginFormExists) {
      test.fail(true, 'No se detectó el formulario de inicio de sesión');
      return;
    }
    
    // Encontrar campos por ID en lugar de por nombre
    await page.fill('#email', 'administradortest@voluntario.com');
    await page.fill('#password', 'testing');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test('Inicio de sesión de responsable', async ({ page }) => {
    // Verificar que estamos en la página de inicio de sesión
    const loginFormExists = await page.locator('form').isVisible().catch(() => false);
    if (!loginFormExists) {
      test.fail(true, 'No se detectó el formulario de inicio de sesión');
      return;
    }
    
    await page.fill('#email', 'responsabletest@voluntario.com');
    await page.fill('#password', 'testing');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test('Inicio de sesión de voluntario', async ({ page }) => {
    // Verificar que estamos en la página de inicio de sesión
    const loginFormExists = await page.locator('form').isVisible().catch(() => false);
    if (!loginFormExists) {
      test.fail(true, 'No se detectó el formulario de inicio de sesión');
      return;
    }
    
    await page.fill('#email', 'voluntariotest@voluntario.com');
    await page.fill('#password', 'testing');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test('Redirección de usuario no autenticado', async ({ page, request }) => {
    // Verificar primero si la aplicación está funcionando
    const response = await request.get(`${process.env.BASE_URL || 'http://localhost:3000'}`);
    if (!response.ok()) {
      test.fail(true, `La aplicación no está accesible. Estado: ${response.status()}`);
      return;
    }
    
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}/schedule`);
    await page.waitForURL(/^http:\/\/localhost:3000\/?$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });
});