# Guía para Testing con VSCode y Playwright

## Configuración para la Extensión de Playwright en VSCode

Esta guía explica cómo configurar y ejecutar tests de Playwright tanto desde la línea de comandos como desde la extensión de VSCode.

## Problemas Resueltos

### 1. Limpieza de Base de Datos

**Problema**: Los tests fallaban porque los usuarios ya existían en la base de datos.

**Solución**: Se implementó un sistema de limpieza automática que:
- Limpia la base de datos **antes** de ejecutar los tests (en `global-setup.ts`)
- Maneja usuarios existentes actualizando sus datos en lugar de fallar
- Proporciona limpieza condicional basada en `AUTO_CLEANUP_TEST_DATA`

### 2. Compatibilidad con VSCode

**Problema**: Los tests no funcionaban correctamente cuando se ejecutaban individualmente desde la extensión de Playwright en VSCode.

**Solución**: Se creó un sistema dual:
- **Global Setup**: Para ejecución masiva de tests
- **VSCode Setup**: Para tests individuales con `vscode-setup.ts`

## Configuración de Variables de Entorno

### Archivo `.env.test`

Crea un archivo `.env.test` en la raíz del proyecto con:

```env
# Configuración de entorno
NODE_ENV=test
BASE_URL=http://localhost:3000
DISABLE_PWA=true
IS_TESTING_ENVIRONMENT=true

# Configuración de Firebase (usa tu proyecto de prueba)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Configuración de limpieza automática
AUTO_CLEANUP_TEST_DATA=true
```

## Métodos de Ejecución

### 1. Desde la Línea de Comandos

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar tests específicos
npm run test:e2e:login
npm run test:e2e:history

# Ejecutar con el script personalizado
node tests/scripts/run-tests.js --project=login-tests
```

### 2. Desde VSCode con la Extensión de Playwright

1. **Instalar la extensión**: `Playwright Test for VSCode`
2. **Configurar**: La extensión detectará automáticamente `playwright.config.ts`
3. **Ejecutar**: 
   - Usar el panel de Testing en VSCode
   - Hacer clic en el ícono de "play" junto a cada test
   - Usar `Ctrl+Shift+P` → "Test: Run Test at Cursor"

## Estructura de Tests

### Tests con Setup Automático (Recomendado para VSCode)

```typescript
import { test, expect } from '@playwright/test';
import { initializeTestEnvironmentForVSCode, cleanupTestEnvironmentForVSCode } from '../../helpers/vscode-setup';
import { login } from '../../helpers/test-utils';

test.beforeAll(async () => {
  await initializeTestEnvironmentForVSCode({
    requireUsers: true,
    requireShifts: false, // Solo si necesitas turnos
    cleanFirst: true // Limpiar antes de crear datos
  });
});

test.afterAll(async () => {
  await cleanupTestEnvironmentForVSCode();
});

test('mi test', async ({ page }) => {
  await login(page, 'ADMIN');
  // ... resto del test
});
```

### Tests con Setup Global (Para ejecución masiva)

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../../helpers/test-utils';

test('mi test', async ({ page }) => {
  // Los usuarios ya están creados por global-setup.ts
  await login(page, 'ADMIN');
  // ... resto del test
});
```

## Configuración de Limpieza

### Variables de Control

- `AUTO_CLEANUP_TEST_DATA=true`: Habilita limpieza automática
- `AUTO_CLEANUP_TEST_DATA=false`: Mantiene datos para debugging

### Comportamiento de Limpieza

1. **Global Setup**: Siempre limpia antes de crear datos
2. **Global Teardown**: Limpia solo si `AUTO_CLEANUP_TEST_DATA=true`
3. **VSCode Setup**: Limpia según configuración individual

## Tipos de Datos de Prueba

### Usuarios Predefinidos

```typescript
const TEST_USERS = {
  ADMIN: {
    email: 'administradortest@voluntario.com',
    password: 'testing',
    roles: [UserRoles.ADMINISTRADOR]
  },
  RESPONSABLE: {
    email: 'responsabletest@voluntario.com', 
    password: 'testing',
    roles: [UserRoles.RESPONSABLE]
  },
  VOLUNTARIO: {
    email: 'voluntariotest@voluntario.com',
    password: 'testing',
    roles: [UserRoles.VOLUNTARIO]
  }
};
```

### Turnos de Prueba

- **Turnos Pasados**: Para tests de historial
- **Turnos Futuros**: Para tests de asignación
- **Configurables**: `pastDays` y `futureDays`

## Debugging

### Logs Útiles

```bash
# Ver logs detallados
DEBUG=pw:api npm run test:e2e

# Ejecutar en modo headed (con navegador visible)
npx playwright test --headed

# Ejecutar un test específico
npx playwright test tests/e2e/login.spec.ts
```

### Mantener Datos para Debugging

```env
# En .env.test
AUTO_CLEANUP_TEST_DATA=false
```

Esto mantendrá los datos en Firebase para inspección manual.

## Mejores Prácticas

1. **Para desarrollo individual**: Usar VSCode setup con `cleanFirst: true`
2. **Para CI/CD**: Usar global setup con limpieza automática
3. **Para debugging**: Deshabilitar `AUTO_CLEANUP_TEST_DATA`
4. **Para tests de historial**: Incluir `requireShifts: true`
5. **Para tests de login**: Solo `requireUsers: true`

## Troubleshooting

### Error: "Usuario ya existe"

**Solución**: El sistema ahora maneja esto automáticamente actualizando los datos.

### Error: "No se pueden cargar variables de entorno"

**Solución**: 
1. Verificar que existe `.env.test` o `tests/.env.test.example`
2. Verificar que las variables de Firebase están configuradas

### Tests lentos en VSCode

**Solución**: 
1. Usar `cleanFirst: false` si los datos ya están limpios
2. Configurar `requireShifts: false` si no necesitas turnos

### Error de timeout

**Solución**:
1. Aumentar timeouts en `playwright.config.ts`
2. Verificar que el servidor de desarrollo está ejecutándose
3. Verificar conectividad con Firebase