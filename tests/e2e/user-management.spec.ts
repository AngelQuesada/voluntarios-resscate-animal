import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Helper function for admin login
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'administradortest@voluntario.com');
  await page.fill('input[type="password"]', 'testing');
  await page.click('button[type="submit"]');
  // Wait for navigation to a known admin page, e.g., schedule or a generic admin landin
  await page.waitForURL((url) => url.toString().includes('/admin/schedule') || url.toString().includes('/admin'));
  // Add a small delay or wait for a specific element that indicates login is complete if needed
  await page.waitForTimeout(500); // Example delay
}

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL); // Navigate to base URL first
    await loginAsAdmin(page);
    // Navigate to the user management section
    // Assuming a link/button to '/admin/users' or similar for user management
    // Or if /admin is the user management page directly
    if (!page.url().includes('/admin/users')) { // Check if already on user page
        const adminLink = page.locator('a[href="/admin"], a[href="/admin/users"], button:has-text("Gestión de Usuarios")');
        if (await adminLink.count() > 0) {
            await adminLink.first().click();
        } else {
            // Fallback if direct link isn't obvious, try navigating directly
            await page.goto(`${BASE_URL}/admin`); // Or /admin/users
        }
    }
    // Wait for a known element on the user management page
    // e.g., a title "Gestión de Usuarios" or the user list itself
    await expect(page.locator('h1:has-text("Gestión de Usuarios"), h2:has-text("Usuarios"), #user-list-table')).toBeVisible({ timeout: 10000 });
  });

  test('should allow admin to create a new user', async ({ page }) => {
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    const userName = 'Test User Create';

    // Click button to open user creation form
    await page.locator('button:has-text("Crear Usuario"), button#create-user-btn').click();

    // Wait for UserForm to be visible
    await expect(page.locator('form#user-form, form:has-text("Nuevo Usuario")')).toBeVisible();

    // Fill form
    await page.fill('input#userName, input[name="name"]', userName);
    await page.fill('input#userEmail, input[name="email"]', uniqueEmail);
    await page.fill('input#userPassword, input[name="password"]', 'password123');
    await page.selectOption('select#userRole, select[name="role"]', { label: 'Voluntario' }); // Assuming 'Voluntario' is a visible label

    // Submit form
    await page.locator('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear")').click();

    // Verification
    await expect(page.locator('.notification.success, div[role="alert"]:has-text("Usuario creado")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`#user-list-table td:has-text("${uniqueEmail}")`)).toBeVisible();
    await expect(page.locator(`#user-list-table td:has-text("${userName}")`)).toBeVisible();
  });

  test('should allow admin to edit an existing user', async ({ page }) => {
    const uniqueEmail = `edituser_${Date.now()}@example.com`;
    const initialName = 'User To Edit';
    const editedName = 'Test User Edited';

    // Pre-requisite: Create a user to edit
    await page.locator('button:has-text("Crear Usuario"), button#create-user-btn').click();
    await expect(page.locator('form#user-form, form:has-text("Nuevo Usuario")')).toBeVisible();
    await page.fill('input#userName, input[name="name"]', initialName);
    await page.fill('input#userEmail, input[name="email"]', uniqueEmail);
    await page.fill('input#userPassword, input[name="password"]', 'password123');
    await page.selectOption('select#userRole, select[name="role"]', { label: 'Voluntario' });
    await page.locator('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear")').click();
    await expect(page.locator('.notification.success, div[role="alert"]:has-text("Usuario creado")')).toBeVisible();
    await expect(page.locator(`#user-list-table td:has-text("${uniqueEmail}")`)).toBeVisible(); // Ensure creation before editing

    // Find and Navigate to Edit
    await page.locator(`#user-list-table tr:has-text("${uniqueEmail}") button:has-text("Editar"), #user-list-table tr:has-text("${uniqueEmail}") button.edit-btn`).click();
    await expect(page.locator('form#user-form, form:has-text("Editar Usuario")')).toBeVisible();
    // Ensure form is populated, e.g., by checking current name
    await expect(page.locator('input#userName, input[name="name"]')).toHaveValue(initialName);


    // Modify Form
    await page.fill('input#userName, input[name="name"]', editedName);
    await page.selectOption('select#userRole, select[name="role"]', { label: 'Responsable' }); // Assuming 'Responsable'

    // Submit Form
    await page.locator('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Actualizar")').click();

    // Verification
    await expect(page.locator('.notification.success, div[role="alert"]:has-text("Usuario actualizado")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`#user-list-table tr:has-text("${uniqueEmail}") td:has-text("${editedName}")`)).toBeVisible();
    await expect(page.locator(`#user-list-table tr:has-text("${uniqueEmail}") td:has-text("Responsable")`)).toBeVisible(); // Check role in list if displayed
  });

  test('should allow admin to delete an existing user', async ({ page }) => {
    const uniqueEmail = `deleteuser_${Date.now()}@example.com`;
    const userName = 'User To Delete';

    // Pre-requisite: Create a user to delete
    await page.locator('button:has-text("Crear Usuario"), button#create-user-btn').click();
    await expect(page.locator('form#user-form, form:has-text("Nuevo Usuario")')).toBeVisible();
    await page.fill('input#userName, input[name="name"]', userName);
    await page.fill('input#userEmail, input[name="email"]', uniqueEmail);
    await page.fill('input#userPassword, input[name="password"]', 'password123');
    await page.selectOption('select#userRole, select[name="role"]', { label: 'Voluntario' });
    await page.locator('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear")').click();
    await expect(page.locator('.notification.success, div[role="alert"]:has-text("Usuario creado")')).toBeVisible();
    await expect(page.locator(`#user-list-table td:has-text("${uniqueEmail}")`)).toBeVisible();

    // Setup listener for dialogs (confirmations) BEFORE clicking delete
    page.on('dialog', dialog => dialog.accept());

    // Find and Delete
    await page.locator(`#user-list-table tr:has-text("${uniqueEmail}") button:has-text("Eliminar"), #user-list-table tr:has-text("${uniqueEmail}") button.delete-btn`).click();

    // If there's a custom confirmation modal instead of a native dialog, handle it here.
    // For example: await page.locator('button:has-text("Confirmar Eliminación")').click();

    // Verification
    await expect(page.locator('.notification.success, div[role="alert"]:has-text("Usuario eliminado")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`#user-list-table td:has-text("${uniqueEmail}")`)).not.toBeVisible();
  });
});
