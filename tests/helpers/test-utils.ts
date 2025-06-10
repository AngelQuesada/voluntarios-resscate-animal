/**
 * Utilidades para tests de Playwright
 * Este archivo proporciona funciones comunes para los tests de Playwright
 * 
 * NOTA: Este archivo redirige a las funciones optimizadas en e2e-utils.ts
 * para evitar duplicación de código y mantener consistencia.
 */

import { Page, expect, APIRequestContext } from '@playwright/test';
import { 
  loginUser, 
  navigateToAdminPanel,
  navigateToHistoryTab,
  waitForPageLoad,
  isElementVisible,
  waitAndClick,
  waitAndFill,
  checkServerStatus,
  checkPageLoad,
  locateShiftTable,
  locateShiftDay,
  findAssignButton,
  captureScreenshot,
  UserType,
  LoginOptions,
  ServerCheckOptions,
  ShiftElementOptions
} from '../e2e/helpers/e2e-utils';

// Re-exportar tipos para compatibilidad
export type { UserType, LoginOptions, ServerCheckOptions, ShiftElementOptions };

// Re-exportar todas las funciones para compatibilidad
export {
  loginUser,
  navigateToAdminPanel,
  navigateToHistoryTab,
  waitForPageLoad,
  isElementVisible,
  waitAndClick,
  waitAndFill,
  checkServerStatus,
  checkPageLoad,
  locateShiftTable,
  locateShiftDay,
  findAssignButton,
  captureScreenshot
};

/**
 * Inicia sesión con un usuario específico
 * @deprecated Usar loginUser de e2e-utils.ts en su lugar
 */
export async function login(page: Page, options: LoginOptions): Promise<boolean> {
  console.warn('⚠️ Función login() está deprecada. Usar loginUser() de e2e-utils.ts');
  return await loginUser(page, options);
}