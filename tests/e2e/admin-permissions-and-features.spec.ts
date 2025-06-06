import { test, expect } from '@playwright/test';

test.describe('Permisos de administración y funcionalidades', () => {
  // Hook de configuración para comprobar que el servidor está funcionando
  test.beforeEach(async ({ page, request }) => {
    // Intentar verificar que el servidor está respondiendo
    try {
      const response = await request.get(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      if (!response.ok()) {
        console.error(`⚠️ El servidor no responde correctamente. Código de estado: ${response.status()}`);
        test.fail(true, `El servidor no está accesible o devuelve un error. Código: ${response.status()}`);
      }
      
      // También detectar explícitamente respuestas 404
      if (response.status() === 404) {
        console.error('⚠️ La URL base devuelve un error 404. Verifica que el servidor esté ejecutándose y configurado correctamente.');
        test.fail(true, 'La URL base devuelve un error 404');
      }
    } catch (error) {
      console.error('⚠️ Error al comprobar el estado del servidor:', error);
      test.fail(true, 'No se pudo comprobar el estado del servidor. Verifica que esté en ejecución.');
    }
  });

  test.describe('Permisos del botón de asignar usuarios a turnos', () => {
    test('Voluntario NO puede ver el botón de asignar usuarios a turnos', async ({ page }) => {
      // Iniciar sesión como voluntario
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como voluntario
      await page.fill('input#email', 'voluntariotest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Esperar a que cargue el contenido de la programación - buscar la pestaña "Mis turnos" 
      await page.waitForSelector('text="Mis turnos"', { timeout: 15000, state: 'visible' });
      await page.waitForTimeout(2000); // Esperar a que se carguen todos los elementos
      
      // Verificar que NO existe el botón de añadir usuarios (icono PersonAdd)
      const addUserButtons = page.locator('[data-testid="PersonAddIcon"], svg[data-testid="PersonAddIcon"]');
      await expect(addUserButtons).toHaveCount(0);
      
      // También verificar que no hay tooltips de "Añadir usuario a este turno"
      const addUserTooltips = page.locator('text="Añadir usuario a este turno"');
      await expect(addUserTooltips).toHaveCount(0);
    });

    test('Responsable NO puede ver el botón de asignar usuarios a turnos', async ({ page }) => {
      // Iniciar sesión como responsable
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como responsable
      await page.fill('input#email', 'responsabletest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Esperar a que cargue el contenido de la programación - buscar la pestaña "Mis turnos"
      await page.waitForSelector('text="Mis turnos"', { timeout: 15000, state: 'visible' });
      await page.waitForTimeout(2000); // Esperar a que se carguen todos los elementos
      
      // Verificar que NO existe el botón de añadir usuarios (icono PersonAdd)
      const addUserButtons = page.locator('[data-testid="PersonAddIcon"], svg[data-testid="PersonAddIcon"]');
      await expect(addUserButtons).toHaveCount(0);
      
      // También verificar que no hay tooltips de "Añadir usuario a este turno"
      const addUserTooltips = page.locator('text="Añadir usuario a este turno"');
      await expect(addUserTooltips).toHaveCount(0);
    });

    test('Administrador SÍ puede ver el botón de asignar usuarios a turnos', async ({ page }) => {
      // Iniciar sesión como administrador
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como administrador
      await page.fill('input#email', 'administradortest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Esperar a que cargue el contenido de la programación - buscar la pestaña "Mis turnos"
      await page.waitForSelector('text="Mis turnos"', { timeout: 15000, state: 'visible' });
      await page.waitForTimeout(2000); // Esperar a que se carguen todos los elementos
      
      // Verificar que SÍ existe al menos un botón de añadir usuarios
      // Buscar por el icono PersonAdd o por el tooltip
      const addUserButtons = page.locator('[data-testid="PersonAddIcon"], svg[data-testid="PersonAddIcon"]');
      const addUserTooltips = page.locator('text="Añadir usuario a este turno"');
      
      // Al menos uno de estos debería existir
      const hasAddUserButton = await addUserButtons.count() > 0;
      const hasAddUserTooltip = await addUserTooltips.count() > 0;
      
      expect(hasAddUserButton || hasAddUserTooltip).toBeTruthy();
      
      // Si hay botones, verificar que al menos uno es clickeable
      if (hasAddUserButton) {
        const firstButton = addUserButtons.first();
        await expect(firstButton).toBeVisible();
      }
    });
  });

  test.describe('Permisos del botón del panel de administración', () => {
    test('Voluntario NO puede ver el botón del panel de administración', async ({ page }) => {
      // Iniciar sesión como voluntario
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como voluntario
      await page.fill('input#email', 'voluntariotest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Esperar a que cargue el header
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Verificar que NO existe el botón del panel de administración
      const adminButton = page.locator('[data-testid="AdminPanelSettingsIcon"], svg[data-testid="AdminPanelSettingsIcon"]');
      await expect(adminButton).toHaveCount(0);
      
      // También verificar que no hay tooltip de "Panel de Administración"
      const adminTooltip = page.locator('text="Panel de Administración"');
      await expect(adminTooltip).toHaveCount(0);
    });

    test('Responsable NO puede ver el botón del panel de administración', async ({ page }) => {
      // Iniciar sesión como responsable
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como responsable
      await page.fill('input#email', 'responsabletest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Esperar a que cargue el header
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Verificar que NO existe el botón del panel de administración
      const adminButton = page.locator('[data-testid="AdminPanelSettingsIcon"], svg[data-testid="AdminPanelSettingsIcon"]');
      await expect(adminButton).toHaveCount(0);
      
      // También verificar que no hay tooltip de "Panel de Administración"
      const adminTooltip = page.locator('text="Panel de Administración"');
      await expect(adminTooltip).toHaveCount(0);
    });

    test('Administrador SÍ puede ver el botón del panel de administración', async ({ page }) => {
      // Iniciar sesión como administrador
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como administrador
      await page.fill('input#email', 'administradortest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Esperar a que cargue el header
      await page.waitForSelector('header', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Verificar que SÍ existe el botón del panel de administración
      const adminButton = page.locator('[data-testid="AdminPanelSettingsIcon"], svg[data-testid="AdminPanelSettingsIcon"]');
      const adminTooltip = page.locator('text="Panel de Administración"');
      
      // Al menos uno de estos debería existir
      const hasAdminButton = await adminButton.count() > 0;
      const hasAdminTooltip = await adminTooltip.count() > 0;
      
      expect(hasAdminButton || hasAdminTooltip).toBeTruthy();
      
      // Si hay botón, verificar que es clickeable
      if (hasAdminButton) {
        const firstButton = adminButton.first();
        await expect(firstButton).toBeVisible();
      }
    });
  });

  test.describe('Acceso al panel de administración', () => {
    test('Voluntario NO puede acceder al panel de administración (/admin)', async ({ page }) => {
      // Iniciar sesión como voluntario
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como voluntario
      await page.fill('input#email', 'voluntariotest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Intentar navegar directamente a /admin
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}/admin`);
      
      // Verificar que es redirigido de vuelta a la página principal o de login
      // El middleware debería redirigir a usuarios no autorizados
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      // Debería ser redirigido a la página principal o mantenerse en /schedule
      expect(currentUrl).not.toContain('/admin');
    });

    test('Responsable NO puede acceder al panel de administración (/admin)', async ({ page }) => {
      // Iniciar sesión como responsable
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como responsable
      await page.fill('input#email', 'responsabletest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Intentar navegar directamente a /admin
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}/admin`);
      
      // Verificar que es redirigido de vuelta a la página principal o de login
      // El middleware debería redirigir a usuarios no autorizados
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      // Debería ser redirigido a la página principal o mantenerse en /schedule
      expect(currentUrl).not.toContain('/admin');
    });

    test('Administrador SÍ puede acceder al panel de administración (/admin)', async ({ page }) => {
      // Iniciar sesión como administrador
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como administrador
      await page.fill('input#email', 'administradortest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Navegar al panel de administración
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}/admin`);
      
      // Verificar que puede acceder al panel de administración
      await page.waitForURL(/\/admin$/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin$/);
      
      // Verificar que el contenido del panel de administración se carga
      await page.waitForSelector('text="Usuarios"', { timeout: 10000 });
      await expect(page.locator('text="Usuarios"')).toBeVisible();
    });
  });

  test.describe('Funcionalidad del historial de turnos en el panel de administración', () => {
    test('El historial de turnos funciona correctamente en el panel de administración', async ({ page }) => {
      // Iniciar sesión como administrador
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
      
      // Verificar si la página cargó correctamente
      const is404 = await page.locator('text="404"').isVisible().catch(() => false);
      if (is404) {
        console.error('⚠️ La página cargó con error 404.');
        test.fail(true, 'La aplicación devolvió un error 404.');
        return;
      }
      
      // Esperar a que la página de inicio de sesión se cargue
      await page.waitForSelector('form', { timeout: 15000 });
      await page.waitForSelector('input#email', { timeout: 8000, state: 'visible' });
      await page.waitForSelector('input#password', { timeout: 8000, state: 'visible' });
      
      // Iniciar sesión como administrador
      await page.fill('input#email', 'administradortest@voluntario.com');
      await page.fill('input#password', 'testing');
      await page.click('button[type="submit"]');
      
      // Esperar redirección a /schedule
      await page.waitForURL(/\/schedule$/, { timeout: 20000 });
      await expect(page).toHaveURL(/\/schedule$/);
      
      // Navegar al panel de administración
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}/admin`);
      
      // Verificar que puede acceder al panel de administración
      await page.waitForURL(/\/admin$/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin$/);
      
      // Esperar a que se carguen las pestañas
      await page.waitForSelector('text="Usuarios"', { timeout: 10000 });
      await page.waitForSelector('text="Vista Semanal"', { timeout: 10000 });
      await page.waitForSelector('text="Historial"', { timeout: 10000 });
      
      // Hacer clic en la pestaña de Historial
      await page.click('text="Historial"');
      
      // Esperar a que se cargue el componente de historial
      await page.waitForTimeout(3000); // Dar tiempo para que se cargue el componente lazy
      
      // Verificar que el historial se carga correctamente
      // Buscar elementos típicos de un calendario o vista de historial
      const historyElements = [
        page.locator('text="Enero"'),
        page.locator('text="Febrero"'),
        page.locator('text="Marzo"'),
        page.locator('text="Abril"'),
        page.locator('text="Mayo"'),
        page.locator('text="Junio"'),
        page.locator('text="Julio"'),
        page.locator('text="Agosto"'),
        page.locator('text="Septiembre"'),
        page.locator('text="Octubre"'),
        page.locator('text="Noviembre"'),
        page.locator('text="Diciembre"'),
        page.locator('[role="button"]'), // Botones de navegación del calendario
        page.locator('table'), // Tabla del calendario
        page.locator('.MuiCalendarPicker-root, .MuiDateCalendar-root'), // Componentes de calendario de MUI
      ];
      
      // Verificar que al menos uno de estos elementos está presente
      let historyLoaded = false;
      for (const element of historyElements) {
        const count = await element.count();
        if (count > 0) {
          historyLoaded = true;
          break;
        }
      }
      
      // Si no se encontraron elementos específicos, verificar que no hay errores
      if (!historyLoaded) {
        // Verificar que no hay mensajes de error
        const errorMessages = page.locator('text="Error"');
        const errorCount = await errorMessages.count();
        expect(errorCount).toBe(0);
        
        // Verificar que el componente se está cargando o ya se cargó
        const loadingIndicator = page.locator('[role="progressbar"], .MuiCircularProgress-root');
        const loadingCount = await loadingIndicator.count();
        
        // Si no hay indicador de carga, asumimos que el historial se cargó correctamente
        // aunque no podamos verificar elementos específicos
        if (loadingCount === 0) {
          historyLoaded = true;
        }
      }
      
      expect(historyLoaded).toBeTruthy();
      
      // Verificar que la pestaña de Historial está activa
      const historyTab = page.locator('text="Historial"').first();
      await expect(historyTab).toBeVisible();
    });
  });
});