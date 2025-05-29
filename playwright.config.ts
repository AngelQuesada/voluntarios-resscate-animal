import { defineConfig, devices } from '@playwright/test';

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
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // Proyectos específicos para comandos concretos
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
    // Navegadores adicionales
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
    timeout: 60000, 
  },
});