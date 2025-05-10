import { test, expect } from '@playwright/test';

test.describe('Flujo de inicio de sesión', () => {
  test('Inicio de sesión', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await page.fill('input[name="email"]', 'angel.quesada@refugio.org');
    await page.fill('input[name="password"]', 'testing');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/schedule$/);
  });

  test('Redirección de usuario no autenticado', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/schedule`);
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });
});