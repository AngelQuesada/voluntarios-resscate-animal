import { test, expect } from '@playwright/test';

test.describe('Asignación y desasignación de turnos por roles', () => {
  // Prueba para el rol de administrador
  test('Administrador inicia sesión, se asigna y desasigna un turno', async ({ page }) => {
    // Iniciar sesión como administrador
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'administradortest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    
    // Añadir tiempo de espera para la redirección
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    // Verificar que se redirige a /schedule
    await expect(page).toHaveURL(/\/schedule$/);
    
    // Esperar a que cargue el contenido de la programación
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Verificar si hay algún turno ya asignado (texto "(Tú)")
    const alreadyAssigned = await page.locator('text="(Tú)"').count() > 0;
    
    if (alreadyAssigned) {
      // Si ya está asignado, buscar botón de eliminar en ese turno (DeleteIcon)
      const deleteButtons = await page.$$('button:has(svg[data-testid="DeleteIcon"])');
      
      if (deleteButtons.length > 0) {
        // Hacer click en el primer botón para desasignar
        await deleteButtons[0].click();
        
        // Esperar 4 segundos para que se complete la desasignación
        await page.waitForTimeout(4000);
      }
    }
    
    // Buscar botones para añadir turno
    const addButtons = await page.$$('button:has(svg[data-testid="PersonAddIcon"])');
    
    if (addButtons.length > 0) {
      // Obtener el botón
      const button = addButtons[0];
      
      // Obtener el índice de la fila que contiene el botón de forma segura 
      // para evitar "tr is possibly null"
      const rowIndex = await button.evaluate((btn) => {
        const tr = btn.closest('tr');
        if (!tr || !tr.parentElement) return -1;
        const rows = Array.from(tr.parentElement.children);
        return rows.indexOf(tr);
      });
      
      // Si encontramos una fila válida
      if (rowIndex >= 0) {
        // Construir un selector para la fila específica
        const rowSelector = `tbody > tr:nth-child(${rowIndex + 1})`;
        
        // Hacer click para asignar turno
        await button.click();
        
        // Si hay una ventana de confirmación, confirmar la asignación
        const confirmButton = await page.$('button:has-text("Confirmar")');
        if (confirmButton) {
          await confirmButton.click();
        }
        
        // Esperar 4 segundos para que se complete la asignación
        await page.waitForTimeout(4000);
        
        // Verificar que aparezca el nombre del usuario en la misma fila del botón
        await expect(page.locator(`${rowSelector} >> text=Administrador Test`)).toBeVisible({ timeout: 5000 });
        
        // Guardamos las coordenadas del botón antes de que cambie su estado
        const box = await button.boundingBox();
        
        if (box) {
          // Ahora hacemos click en el mismo botón (que ahora tendrá DeleteIcon) para desasignar
          await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
          
          // Esperar 4 segundos para que se complete la desasignación
          await page.waitForTimeout(4000);
          
          // Verificar que ya no aparece el nombre del usuario en la misma fila
          await expect(page.locator(`${rowSelector} >> text=Administrador Test`)).not.toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  // Prueba para el rol de responsable
  test('Responsable inicia sesión, se asigna y desasigna un turno', async ({ page }) => {
    // Iniciar sesión como responsable
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'responsabletest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    
    // Añadir tiempo de espera para la redirección
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    // Verificar que se redirige a /schedule
    await expect(page).toHaveURL(/\/schedule$/);
    
    // Esperar a que cargue el contenido de la programación
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Verificar si hay algún turno ya asignado (texto "(Tú)")
    const alreadyAssigned = await page.locator('text="(Tú)"').count() > 0;
    
    if (alreadyAssigned) {
      // Si ya está asignado, buscar botón de eliminar en ese turno (DeleteIcon)
      const deleteButtons = await page.$$('button:has(svg[data-testid="DeleteIcon"])');
      
      if (deleteButtons.length > 0) {
        // Hacer click en el primer botón para desasignar
        await deleteButtons[0].click();
        
        // Esperar 4 segundos para que se complete la desasignación
        await page.waitForTimeout(4000);
      }
    }
    
    // Buscar botones para añadir turno
    const addButtons = await page.$$('button:has(svg[data-testid="PersonAddIcon"])');
    
    if (addButtons.length > 0) {
      // Obtener el botón
      const button = addButtons[0];
      
      // Obtener el índice de la fila que contiene el botón de forma segura
      // para evitar "tr is possibly null"
      const rowIndex = await button.evaluate((btn) => {
        const tr = btn.closest('tr');
        if (!tr || !tr.parentElement) return -1;
        const rows = Array.from(tr.parentElement.children);
        return rows.indexOf(tr);
      });
      
      // Si encontramos una fila válida
      if (rowIndex >= 0) {
        // Construir un selector para la fila específica
        const rowSelector = `tbody > tr:nth-child(${rowIndex + 1})`;
        
        // Hacer click para asignar turno
        await button.click();
        
        // Si hay una ventana de confirmación, confirmar la asignación
        const confirmButton = await page.$('button:has-text("Confirmar")');
        if (confirmButton) {
          await confirmButton.click();
        }
        
        // Esperar 4 segundos para que se complete la asignación
        await page.waitForTimeout(4000);
        
        // Verificar que aparezca el nombre del usuario en la misma fila del botón
        await expect(page.locator(`${rowSelector} >> text=Responsable Test`)).toBeVisible({ timeout: 5000 });
        
        // Guardamos las coordenadas del botón antes de que cambie su estado
        const box = await button.boundingBox();
        
        if (box) {
          // Ahora hacemos click en el mismo botón (que ahora tendrá DeleteIcon) para desasignar
          await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
          
          // Esperar 4 segundos para que se complete la desasignación
          await page.waitForTimeout(4000);
          
          // Verificar que ya no aparece el nombre del usuario en la misma fila
          await expect(page.locator(`${rowSelector} >> text=Responsable Test`)).not.toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  // Prueba para el rol de voluntario
  test('Voluntario inicia sesión, se asigna y desasigna un turno', async ({ page }) => {
    // Iniciar sesión como voluntario
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'voluntariotest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    
    // Añadir tiempo de espera para la redirección
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    // Verificar que se redirige a /schedule
    await expect(page).toHaveURL(/\/schedule$/);
    
    // Esperar a que cargue el contenido de la programación
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Verificar si hay algún turno ya asignado (texto "(Tú)")
    const alreadyAssigned = await page.locator('text="(Tú)"').count() > 0;
    
    if (alreadyAssigned) {
      // Si ya está asignado, buscar botón de eliminar en ese turno (DeleteIcon)
      const deleteButtons = await page.$$('button:has(svg[data-testid="DeleteIcon"])');
      
      if (deleteButtons.length > 0) {
        // Hacer click en el primer botón para desasignar
        await deleteButtons[0].click();
        
        // Esperar 4 segundos para que se complete la desasignación
        await page.waitForTimeout(4000);
      }
    }
    
    // Buscar todos los botones de asignación
    const addButtons = await page.$$('button:has(svg[data-testid="PersonAddIcon"])');
    
    if (addButtons.length > 0) {
      // Obtener el botón
      const button = addButtons[0];
      
      // Obtener el índice de la fila que contiene el botón de forma segura
      // para evitar "tr is possibly null"
      const rowIndex = await button.evaluate((btn) => {
        const tr = btn.closest('tr');
        if (!tr || !tr.parentElement) return -1;
        const rows = Array.from(tr.parentElement.children);
        return rows.indexOf(tr);
      });
      
      // Si encontramos una fila válida
      if (rowIndex >= 0) {
        // Construir un selector para la fila específica
        const rowSelector = `tbody > tr:nth-child(${rowIndex + 1})`;
        
        // Hacer click para asignar turno
        await button.click();
        
        // Si hay una ventana de confirmación, confirmar la asignación
        const confirmButton = await page.$('button:has-text("Confirmar")');
        if (confirmButton) {
          await confirmButton.click();
        }
        
        // Esperar 4 segundos para que se complete la asignación
        await page.waitForTimeout(4000);
        
        // Verificar que aparezca el nombre del usuario en la misma fila del botón
        await expect(page.locator(`${rowSelector} >> text=Voluntario Test`)).toBeVisible({ timeout: 5000 });
        
        // Guardamos las coordenadas del botón antes de que cambie su estado
        const box = await button.boundingBox();
        
        if (box) {
          // Ahora hacemos click en el mismo botón (que ahora tendrá DeleteIcon) para desasignar
          await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
          
          // Esperar 4 segundos para que se complete la desasignación
          await page.waitForTimeout(4000);
          
          // Verificar que ya no aparece el nombre del usuario en la misma fila
          await expect(page.locator(`${rowSelector} >> text=Voluntario Test`)).not.toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});