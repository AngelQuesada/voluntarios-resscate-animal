import { test, expect, Page } from '@playwright/test';

// --- Test Setup Considerations ---
// 1. Test Users:
//    - An admin user (e.g., admin@example.com / password123) must exist in the database.
//    - A target user for editing (e.g., testuser@example.com) must exist in the database.
//    - The target user's initial password should be known if the optional advanced login test is implemented.
// 2. `data-testid` attributes:
//    - For robust selection, it's highly recommended to add `data-testid` attributes to:
//      - User table rows (e.g., `data-testid="user-row-${user.id}"`)
//      - Edit buttons within the user table (e.g., `data-testid="edit-user-btn-${user.id}"`)
//      - The "Cambiar Contraseña" switch.
//      - Password input fields within the UserForm.
//      - The "Guardar Cambios" button in UserForm.
//      - Form error message containers in UserForm.

const ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME || 'admin@example.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password123';
const TARGET_USER_EMAIL = process.env.TEST_TARGET_USER_EMAIL || 'testuser@example.com'; // User to be edited
const TARGET_USER_USERNAME = process.env.TEST_TARGET_USER_USERNAME || 'testuser'; // Username of the user to be edited

// Helper function for login
async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.fill('input[name="email"]', ADMIN_USERNAME);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page.getByText('Dashboard')).toBeVisible(); // Wait for dashboard to confirm login
}

test.describe('User Edit Functionality in Admin Panel', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAsAdmin(page);
  });

  test.beforeEach(async () => {
    // Navigate to the Users tab in the admin panel
    // This assumes a navigation structure where "Admin" and then "Usuarios" are clickable
    // Adjust selectors if your navigation is different
    await page.getByRole('button', { name: /admin/i }).click();
    await page.getByRole('menuitem', { name: /usuarios/i }).click();
    await expect(page.getByRole('heading', { name: /lista de usuarios/i })).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should allow successful password change for a user', async () => {
    // Locate the user row. Using text for now, data-testid would be better.
    // This assumes the target user's username or email is visible in the table.
    const userRow = page.locator(`tr:has-text("${TARGET_USER_USERNAME}")`);
    if (await userRow.count() === 0) {
        console.warn(`Test user "${TARGET_USER_USERNAME}" not found in the table. Skipping test.`);
        test.skip(true, `Test user "${TARGET_USER_USERNAME}" not found.`);
        return;
    }
    await userRow.locator('button[aria-label="Editar usuario"]').click();
    
    await expect(page.getByRole('heading', { name: /editar usuario/i })).toBeVisible();

    // Activate "Cambiar Contraseña" switch
    // Using getByLabelText, assuming the switch is associated with a label.
    // A data-testid would be more robust.
    await page.getByLabel('Cambiar Contraseña').check();

    const newPassword = 'newSecurePassword123';
    await page.getByLabel('Contraseña', { exact: true }).fill(newPassword);
    await page.getByLabel('Confirmar Contraseña').fill(newPassword);

    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    await expect(page.getByText('Usuario actualizado correctamente')).toBeVisible({ timeout: 10000 });

    // Optional: Logout and login as the user with the new password
    // This would require knowing the user's original credentials or having a way to log them out
    // and then log in as them. This part is complex and depends heavily on app auth flow.
  });

  test('should show error when new passwords do not match', async () => {
    const userRow = page.locator(`tr:has-text("${TARGET_USER_USERNAME}")`);
     if (await userRow.count() === 0) {
        console.warn(`Test user "${TARGET_USER_USERNAME}" not found in the table. Skipping test.`);
        test.skip(true, `Test user "${TARGET_USER_USERNAME}" not found.`);
        return;
    }
    await userRow.locator('button[aria-label="Editar usuario"]').click();
    await expect(page.getByRole('heading', { name: /editar usuario/i })).toBeVisible();

    await page.getByLabel('Cambiar Contraseña').check();

    await page.getByLabel('Contraseña', { exact: true }).fill('newPassword123');
    await page.getByLabel('Confirmar Contraseña').fill('mismatchedPassword');

    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    // Assuming the error message is displayed within the dialog context
    // The exact selector might need adjustment based on how error messages are rendered.
    // A data-testid on the error message container would be ideal.
    await expect(page.getByText('Las nuevas contraseñas no coinciden')).toBeVisible();
  });

  test('should show error when new password is too short', async () => {
    const userRow = page.locator(`tr:has-text("${TARGET_USER_USERNAME}")`);
     if (await userRow.count() === 0) {
        console.warn(`Test user "${TARGET_USER_USERNAME}" not found in the table. Skipping test.`);
        test.skip(true, `Test user "${TARGET_USER_USERNAME}" not found.`);
        return;
    }
    await userRow.locator('button[aria-label="Editar usuario"]').click();
    await expect(page.getByRole('heading', { name: /editar usuario/i })).toBeVisible();
    
    await page.getByLabel('Cambiar Contraseña').check();

    const shortPassword = 'short';
    await page.getByLabel('Contraseña', { exact: true }).fill(shortPassword);
    await page.getByLabel('Confirmar Contraseña').fill(shortPassword);

    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    await expect(page.getByText('La nueva contraseña debe tener al menos 6 caracteres')).toBeVisible();
  });
});
