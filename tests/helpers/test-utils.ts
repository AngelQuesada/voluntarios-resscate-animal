/**
 * Utilidades para tests de Playwright
 * Este archivo proporciona funciones comunes para los tests de Playwright
 */

import { Page, expect } from '@playwright/test';
import { TEST_USERS } from './test-db-setup';

/**
 * Tipos de usuario para iniciar sesión
 */
export type UserType = 'ADMIN' | 'RESPONSABLE' | 'VOLUNTARIO';

/**
 * Opciones para iniciar sesión
 */
export interface LoginOptions {
  userType: UserType;
  checkRedirect?: boolean;
  expectedRedirectUrl?: string | RegExp;
  timeout?: number;
}

/**
 * Inicia sesión con un usuario específico
 */
export async function login(page: Page, options: LoginOptions): Promise<boolean> {
  const {
    userType,
    checkRedirect = true,
    expectedRedirectUrl = /\/schedule$/,
    timeout = 15000
  } = options;

  // Obtener credenciales del usuario
  const { email, password } = TEST_USERS[userType];

  try {
    // Navegar a la página principal
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}`);
    
    // Verificar si la página cargó correctamente o si hay un error 404
    const is404 = await page.locator('text="404"').isVisible().catch(() => false);
    
    if (is404) {
      console.error('⚠️ La página cargó con error 404. Comprueba que el servidor esté ejecutándose y que BASE_URL sea correcto.');
      await page.screenshot({ path: `./test-results/${userType.toLowerCase()}-login-404.png` });
      return false;
    }
    
    // Esperar a que el formulario de inicio de sesión se cargue
    await page.waitForSelector('form', { timeout: 10000 }).catch((error) => {
      console.error('⚠️ No se encontró el formulario de inicio de sesión.', error);
      return false;
    });

    // Verificar que estamos en la página de inicio de sesión
    const loginFormExists = await page.locator('form').isVisible().catch(() => false);
    if (!loginFormExists) {
      console.error('⚠️ No se detectó el formulario de inicio de sesión');
      return false;
    }
    
    // Rellenar el formulario de inicio de sesión
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    
    // Verificar redirección si es necesario
    if (checkRedirect) {
      await page.waitForURL(expectedRedirectUrl, { timeout });
      await expect(page).toHaveURL(expectedRedirectUrl);
    }
    
    console.log(`✅ Inicio de sesión exitoso como ${userType}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al iniciar sesión como ${userType}:`, error);
    await page.screenshot({ path: `./test-results/${userType.toLowerCase()}-login-error.png` });
    return false;
  }
}

/**
 * Navega al panel de administración
 */
export async function navigateToAdminPanel(page: Page, timeout: number = 10000): Promise<boolean> {
  try {
    // Buscar el botón con el icono AdminPanelSettingsIcon
    await page.waitForSelector('button svg[data-testid="AdminPanelSettingsIcon"]', { timeout });
    await page.click('button svg[data-testid="AdminPanelSettingsIcon"]');
    
    // Esperar a que se complete la navegación al panel de administración
    await page.waitForURL(/\/admin$/, { timeout });
    
    // Verificar que estamos en el panel de administración
    expect(page.url()).toContain('/admin');
    
    console.log('✅ Navegación al panel de administración exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al navegar al panel de administración:', error);
    await page.screenshot({ path: './test-results/admin-navigation-error.png' });
    return false;
  }
}

/**
 * Navega a la pestaña de historial en el panel de administración
 */
export async function navigateToHistoryTab(page: Page, timeout: number = 10000): Promise<boolean> {
  try {
    // Hacer clic en la pestaña de historial
    await page.waitForSelector('button:has-text("Historial")', { timeout });
    await page.click('button:has-text("Historial")');
    
    console.log('✅ Navegación a la pestaña de historial exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al navegar a la pestaña de historial:', error);
    await page.screenshot({ path: './test-results/history-tab-navigation-error.png' });
    return false;
  }
}

/**
 * Espera a que la página se cargue completamente
 */
export async function waitForPageLoad(page: Page, timeout: number = 10000): Promise<boolean> {
  try {
    // Esperar a que la página se cargue completamente
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForLoadState('domcontentloaded', { timeout });
    
    console.log('✅ Página cargada completamente');
    return true;
  } catch (error) {
    console.error('❌ Error al esperar a que la página se cargue:', error);
    await page.screenshot({ path: './test-results/page-load-error.png' });
    return false;
  }
}

/**
 * Verifica si un elemento está visible en la página
 */
export async function isElementVisible(page: Page, selector: string, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Espera a que un elemento sea visible y luego hace clic en él
 */
export async function waitAndClick(page: Page, selector: string, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    await page.click(selector);
    return true;
  } catch (error) {
    console.error(`❌ Error al hacer clic en ${selector}:`, error);
    return false;
  }
}

/**
 * Espera a que un elemento sea visible y luego rellena un campo
 */
export async function waitAndFill(page: Page, selector: string, value: string, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    await page.fill(selector, value);
    return true;
  } catch (error) {
    console.error(`❌ Error al rellenar ${selector}:`, error);
    return false;
  }
}