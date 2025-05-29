import { test, expect, Page } from '@playwright/test';
import { UserHistoryShift } from '../../src/hooks/history/useUserHistory';
import { format, subMonths, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Credenciales del usuario de prueba para autenticación
const TEST_USER_EMAIL = 'voluntariotest@voluntario.com';
const TEST_USER_PASSWORD = 'testing';

// Configuración de datos mock para simular turnos en diferentes fechas
const today = new Date();
const yesterday = subDays(today, 1);
const tomorrow = addDays(today, 1);
const oneMonthAgo = subMonths(today, 1);
const twoMonthsAgo = subMonths(today, 2);
const fourMonthsAgo = subMonths(today, 4);

// Configuración de turnos mock con diferentes escenarios temporales
const MOCK_SHIFTS_CONFIG = {
  yesterdayShift: {
    id: `${format(yesterday, 'yyyy-MM-dd')}_M`,
    date: format(yesterday, 'yyyy-MM-dd'),
    area: 'Mañana',
    startTime: '09:00',
    endTime: '13:00',
  },
  oneMonthAgoShift: {
    id: `${format(oneMonthAgo, 'yyyy-MM-dd')}_M`,
    date: format(oneMonthAgo, 'yyyy-MM-dd'),
    area: 'Mañana',
    startTime: '09:00',
    endTime: '13:00',
  },
  twoMonthsAgoShift: {
    id: `${format(twoMonthsAgo, 'yyyy-MM-dd')}_T`,
    date: format(twoMonthsAgo, 'yyyy-MM-dd'),
    area: 'Tarde',
    startTime: '16:00',
    endTime: '20:00',
  },
  todayShift: {
    id: `${format(today, 'yyyy-MM-dd')}_T`,
    date: format(today, 'yyyy-MM-dd'),
    area: 'Tarde',
    startTime: '16:00',
    endTime: '20:00',
  },
  tomorrowShift: {
    id: `${format(tomorrow, 'yyyy-MM-dd')}_M`,
    date: format(tomorrow, 'yyyy-MM-dd'),
    area: 'Mañana',
    startTime: '09:00',
    endTime: '13:00',
  },
  // Turno anterior a 3 meses - debe ser filtrado por el hook
  fourMonthsAgoShift: {
    id: `${format(fourMonthsAgo, 'yyyy-MM-dd')}_M`,
    date: format(fourMonthsAgo, 'yyyy-MM-dd'),
    area: 'Mañana',
    startTime: '09:00',
    endTime: '13:00',
  },
};

const ALL_MOCK_SHIFTS: UserHistoryShift[] = Object.values(MOCK_SHIFTS_CONFIG);

// Función para inyectar datos mock en el navegador durante las pruebas
async function mockUserHistoryData(page: Page, data: UserHistoryShift[] | null, isLoading: boolean = false) {
  await page.evaluate((mockData) => {
    // @ts-ignore
    window.__E2E_MOCK_USER_HISTORY__ = mockData;
  }, { data, isLoading, error: null });
}

test.describe('User Shift History Tab', () => {
  // Configuración previa: autenticar usuario antes de cada prueba
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Esperar a que los elementos del formulario estén disponibles
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    
    // Llenar credenciales de login
    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    
    // Hacer clic en el botón de envío
    await page.click('button[type="submit"]');
    
    // Esperar navegación con timeout más largo y múltiples opciones
    try {
      await page.waitForURL(/\/schedule$/, { timeout: 45000 });
    } catch (error) {
      // Si falla, intentar esperar por elementos específicos de la página de programación
      console.log('Intentando esperar por elementos específicos de la página...');
      await page.waitForSelector('h1, h2, [data-testid="schedule-page"]', { timeout: 15000 });
    }
  });

  // Prueba 1: Verifica que la pestaña de historial sea visible y navegable
  test('Test 1: Tab Visibility and Navigation', async ({ page }) => {
    const historyTab = page.locator('button[aria-controls="tabpanel-2"]');
    await expect(historyTab).toBeVisible();
    await expect(historyTab).toHaveText('Mi historial');

    await historyTab.click();

    const historyTabTitle = page.locator('h6:has-text("Mi historial de turnos")');
    await expect(historyTabTitle).toBeVisible();
    
    // Verifica mensaje cuando no hay turnos
    const noShiftsMessage = page.locator('text="No hay turnos para mostrar."');
    await expect(noShiftsMessage).toBeVisible();
  });

  // Prueba 2: Verifica que los datos mockeados se muestren correctamente
  test('Test 2: Data Fetching and Display (Mocked)', async ({ page }) => {
    // Solo incluye turnos pasados dentro de los últimos 3 meses
    const shiftsForTest2 = [
      MOCK_SHIFTS_CONFIG.oneMonthAgoShift,
      MOCK_SHIFTS_CONFIG.twoMonthsAgoShift,
    ];
    await mockUserHistoryData(page, shiftsForTest2);

    const historyTab = page.locator('button[aria-controls="tabpanel-2"]');
    await historyTab.click();
    await expect(page.locator('h6:has-text("Mi historial de turnos")')).toBeVisible();

    // Verifica que los turnos esperados se muestren en la tabla
    for (const shift of shiftsForTest2) {
      const shiftDateFormatted = format(parseISO(shift.date), 'dd MMM yyyy', { locale: es });
      const shiftEntryDate = page.locator(`td:has-text("${shiftDateFormatted}")`);
      const shiftEntryArea = page.locator(`td:has-text("${shift.area}")`);
      await expect(shiftEntryDate.first()).toBeVisible();
      await expect(shiftEntryArea.first()).toBeVisible();
    }
    
    // Verifica que turnos anteriores a 3 meses NO se muestren
    const olderShiftDateFormatted = format(parseISO(MOCK_SHIFTS_CONFIG.fourMonthsAgoShift.date), 'dd MMM yyyy', { locale: es });
    const olderShiftEntry = page.locator(`td:has-text("${olderShiftDateFormatted}")`);
    await expect(olderShiftEntry).not.toBeVisible();
  });

  // Prueba 3: Verifica el estado vacío cuando no hay turnos
  test('Test 3: Empty State (Mocked)', async ({ page }) => {
    await mockUserHistoryData(page, []);

    const historyTab = page.locator('button[aria-controls="tabpanel-2"]');
    await historyTab.click();
    await expect(page.locator('h6:has-text("Mi historial de turnos")')).toBeVisible();

    // Verifica que se muestre el mensaje de estado vacío
    const noShiftsMessage = page.locator('text="No hay turnos para mostrar."');
    await expect(noShiftsMessage).toBeVisible();
  });
  
  // Prueba 4: Verifica el filtrado correcto - solo turnos pasados
  test('Test 4: Displays Only Past Shifts (Excludes Today & Future)', async ({ page }) => {
    // Usa el conjunto completo de datos para probar el filtrado del hook:
    // 1. Filtra turnos de los últimos 3 meses (excluye fourMonthsAgoShift)
    // 2. Filtra solo turnos anteriores a hoy (excluye todayShift, tomorrowShift)
    await mockUserHistoryData(page, ALL_MOCK_SHIFTS);

    const historyTab = page.locator('button[aria-controls="tabpanel-2"]');
    await historyTab.click();
    await expect(page.locator('h6:has-text("Mi historial de turnos")')).toBeVisible();

    // Turnos que deben ser visibles (pasados, últimos 3 meses)
    const expectedVisibleShifts = [
      MOCK_SHIFTS_CONFIG.yesterdayShift,
      MOCK_SHIFTS_CONFIG.oneMonthAgoShift,
      MOCK_SHIFTS_CONFIG.twoMonthsAgoShift,
    ];

    // Turnos que NO deben ser visibles (hoy, futuros, o muy antiguos)
    const expectedHiddenShifts = [
      MOCK_SHIFTS_CONFIG.todayShift,
      MOCK_SHIFTS_CONFIG.tomorrowShift,
      MOCK_SHIFTS_CONFIG.fourMonthsAgoShift,
    ];

    // Verifica que los turnos esperados sean visibles
    for (const shift of expectedVisibleShifts) {
      const shiftDateFormatted = format(parseISO(shift.date), 'dd MMM yyyy', { locale: es });
      const shiftEntry = page.locator(`tr:has(td:text-is("${shiftDateFormatted}")):has(td:text-is("${shift.area}"))`);
      await expect(shiftEntry).toBeVisible();
    }

    // Verifica que los turnos no esperados NO sean visibles
    for (const shift of expectedHiddenShifts) {
      const shiftDateFormatted = format(parseISO(shift.date), 'dd MMM yyyy', { locale: es });
      const shiftEntry = page.locator(`tr:has(td:text-is("${shiftDateFormatted}")):has(td:text-is("${shift.area}"))`);
      await expect(shiftEntry).not.toBeVisible();
    }
  });
});

// Función auxiliar para parsear fechas en formato ISO
function parseISO(dateString: string): Date {
  return new Date(dateString);
}
