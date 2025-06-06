import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno para pruebas
const testEnvPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
  console.log('✅ Variables de entorno de prueba cargadas desde .env.test');
} else {
  // Si no existe, intentar cargar desde .env.test.example
  const exampleEnvPath = path.resolve(process.cwd(), '.env.test.example');
  if (fs.existsSync(exampleEnvPath)) {
    dotenv.config({ path: exampleEnvPath });
    console.log('⚠️ Variables de entorno de prueba cargadas desde .env.test.example');
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2, 
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    // Timeouts aumentados para todas las acciones
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    // Proyectos funcionales (agrupan tests por funcionalidad)
    {
      name: 'login-tests',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'role-assignment-tests',
      testMatch: /shift-assignment-by-role\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'history-view-tests',
      testMatch: /history-view\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'user-history-tests',
      testMatch: /user-history\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin-features-tests',
      testMatch: /admin-permissions-and-features\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Proyectos de compatibilidad con navegadores
    {
      name: 'firefox-compatibility',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-compatibility',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Proyectos para dispositivos móviles
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-ios',
      use: { ...devices['iPhone 12'] },
    },
  ],
  // Configuración global para todos los tests
  globalSetup: './tests/helpers/global-setup.ts',
  globalTeardown: './tests/helpers/global-teardown.ts',
});