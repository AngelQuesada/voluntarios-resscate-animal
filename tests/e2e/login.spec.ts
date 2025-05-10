import { test, expect } from '@playwright/test';

test.describe('Flujo de inicio de sesión', () => {
  test('Inicio de sesión de administrador', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'administradortest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test('Inicio de sesión de responsable', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'responsabletest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/\/schedule$/);
  });
  test('Inicio de sesión de voluntario', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'voluntariotest@voluntario.com');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/schedule$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test('Redirección de usuario no autenticado', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/schedule`);
    await page.waitForURL(/^http:\/\/localhost:3000\/?$/, { timeout: 10000 });
    
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });
});