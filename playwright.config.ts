import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2, // Un término medio: 2 workers permiten algo de paralelismo sin sobrecargar
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Primer proyecto: tests de login
    {
      name: 'login-tests',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Segundo proyecto: tests de asignación de roles
    {
      name: 'role-assignment-tests',
      testMatch: /shift-assignment-by-role\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['login-tests'], // Se ejecuta después de los tests de login
    },
    // Tercer proyecto: tests de historial de admin
    {
      name: 'history-view-tests',
      testMatch: /history-view\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['role-assignment-tests'], // Se ejecuta después de los tests de asignación de roles
    },
    // Browser projects para ejecución completa (opcional)
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});