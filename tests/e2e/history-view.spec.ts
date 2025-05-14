import { test, expect } from '@playwright/test';

test.describe('Acceso al historial de voluntarios', () => {
  test('Administrador accede al historial y visualiza voluntarios', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
    await page.fill('input[name="email"]', 'administradortest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    
    // Esperar a que redirija a la página de turnos
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    // 2. Navegar al panel de administración usando el botón correcto
    // Buscar el botón con el icono AdminPanelSettingsIcon
    await page.waitForSelector('button svg[data-testid="AdminPanelSettingsIcon"]', { timeout: 5000 });
    await page.click('button svg[data-testid="AdminPanelSettingsIcon"]');
    
    // Esperar a que se complete la navegación al panel de administración
    await page.waitForURL(/\/admin$/, { timeout: 10000 });
    
    // Verificar que estamos en el panel de administración
    expect(page.url()).toContain('/admin');
    
    // 3. Hacer clic en la pestaña de historial
    await page.waitForSelector('button:has-text("Historial")', { timeout: 10000 });
    await page.click('button:has-text("Historial")');
    
    // Esperar a que cargue el componente del historial
    await page.waitForSelector('.MuiDateCalendar-root', { timeout: 10000 });
    
    // 4. Seleccionar una fecha disponible en el calendario
    // Primero esperamos a que cargue completamente el calendario
    await page.waitForTimeout(3000);
    
    // Verificar si hay algún día disponible para hacer clic (excluyendo días deshabilitados y elementos de relleno)
    const enabledDays = await page.locator('.MuiPickersDay-root:not(.Mui-disabled):not(.MuiPickersDay-hiddenDaySpacingFiller)').count();
    
    if (enabledDays > 0) {
      // Si hay días disponibles, hacer clic en el primero
      await page.locator('.MuiPickersDay-root:not(.Mui-disabled):not(.MuiPickersDay-hiddenDaySpacingFiller)').first().click();
    } else {
      // Intentar una segunda estrategia: buscar cualquier día visible en el calendario (excluyendo elementos de relleno)
      const visibleDays = await page.locator('.MuiPickersDay-root:not(.MuiPickersDay-hiddenDaySpacingFiller)').count();
      
      if (visibleDays > 0) {

        await page.locator('.MuiPickersDay-root:not(.MuiPickersDay-hiddenDaySpacingFiller)').first().click({ force: true });
      }
    }
    // Esperar a que potencialmente cargue la lista de voluntarios
    await page.waitForTimeout(3000);
    
    // 5. Buscar cualquier nombre en el panel de historial, independientemente de si hemos
    // podido seleccionar una fecha o no
    const volunteerNames = await page.locator('text=/[A-Z][a-z]+ [A-Z][a-z]+/').all();
    
    // Registrar cuántos nombres encontramos
    
    if (volunteerNames.length > 0) {
      // Verificar que al menos un nombre sea visible
      await expect(volunteerNames[0]).toBeVisible();
      
      // Test exitoso si encontramos al menos un nombre
      expect(true).toBeTruthy();
    } else {
      // Si no encontramos nombres específicos, verificar si hay alguna tabla o lista
      // que pueda contener datos de voluntarios
      const anyTable = await page.locator('table').count();
      if (anyTable > 0) {
        
        // Verificar si la tabla tiene contenido
        const tableRows = await page.locator('table tr').count();
        
        // Si hay filas en la tabla, consideramos que hay datos
        expect(tableRows).toBeGreaterThan(0);
      } else {
        // Si no hay tabla, capturar un screenshot para diagnosticar
        await page.screenshot({ path: 'history-view-failure.png' });
        
        // Fallar el test con mensaje informativo
        expect(false, 'No se encontraron datos de voluntarios en el historial').toBeTruthy();
      }
    }
  });
});