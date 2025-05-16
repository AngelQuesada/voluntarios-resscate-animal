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
    
    // Estrategia mejorada para esperar que cargue el contenido de la programación
    try {
      // Intentar múltiples selectores para identificar cuando la tabla ha cargado
      await Promise.race([
        page.waitForSelector('table', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('tbody', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('div:has-text("Mañana")', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('div:has-text("Tarde")', { timeout: 15000, state: 'visible' })
      ]);
      
      // Esperar un poco más para asegurar que todos los elementos interactivos están disponibles
      await page.waitForTimeout(1000);
    } catch (error) {
      console.error('Error esperando a que la tabla se cargue:', error);
      // Capturar screenshot para depuración
      await page.screenshot({ path: './test-results/table-loading-error.png' });
      throw new Error('No se pudo cargar la tabla de turnos a tiempo');
    }
    
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
    
    // Buscar botones para añadir turno para uno mismo
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
    } else {
      // Caso especial: si no hay botones de asignación visibles, buscar un turno vacío
      // y verificar si podemos encontrar un botón de añadir usuario en el DOM

      // Buscar filas de turno que contengan "Nadie asignado"
      const emptyShiftRows = await page.$$('tr:has-text("Nadie asignado")');
      
      if (emptyShiftRows.length > 0) {
        // Tomar la primera fila vacía
        const emptyRow = emptyShiftRows[0];
        
        // Hacer click en el área del turno para activar posibles controles
        await emptyRow.click();
        
        // Esperar brevemente
        await page.waitForTimeout(500);
        
        // Buscar texto que indique el tipo de turno (Mañana o Tarde) dentro de la fila
        const shiftTypeText = await emptyRow.$eval('td:first-child', (td) => td.textContent);
        console.log(`Turno vacío encontrado: ${shiftTypeText}`);
        
        // Verificar que esta prueba reconoce la limitación actual
        console.log('AVISO: En la implementación actual, los administradores no pueden añadir usuarios directamente a turnos vacíos.');
        
        // Esta parte debería pasar cuando se implemente la funcionalidad
        test.fail(true, 'Los administradores deberían poder añadir usuarios a turnos vacíos, pero esta funcionalidad no está implementada');
      } else {
        console.log('No se encontraron turnos vacíos para probar.');
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
    
    // Estrategia mejorada para esperar que cargue el contenido de la programación
    try {
      // Intentar múltiples selectores para identificar cuando la tabla ha cargado
      await Promise.race([
        page.waitForSelector('table', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('tbody', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('div:has-text("Mañana")', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('div:has-text("Tarde")', { timeout: 15000, state: 'visible' })
      ]);
      
      // Esperar un poco más para asegurar que todos los elementos interactivos están disponibles
      await page.waitForTimeout(1000);
    } catch (error) {
      console.error('Error esperando a que la tabla se cargue:', error);
      // Capturar screenshot para depuración
      await page.screenshot({ path: './test-results/table-loading-error-responsable.png' });
      throw new Error('No se pudo cargar la tabla de turnos a tiempo');
    }
    
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
    
    // Estrategia mejorada para esperar que cargue el contenido de la programación
    try {
      // Intentar múltiples selectores para identificar cuando la tabla ha cargado
      await Promise.race([
        page.waitForSelector('table', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('tbody', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('div:has-text("Mañana")', { timeout: 15000, state: 'visible' }),
        page.waitForSelector('div:has-text("Tarde")', { timeout: 15000, state: 'visible' })
      ]);
      
      // Esperar un poco más para asegurar que todos los elementos interactivos están disponibles
      await page.waitForTimeout(1000);
    } catch (error) {
      console.error('Error esperando a que la tabla se cargue:', error);
      // Capturar screenshot para depuración
      await page.screenshot({ path: './test-results/table-loading-error-voluntario.png' });
      throw new Error('No se pudo cargar la tabla de turnos a tiempo');
    }
    
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