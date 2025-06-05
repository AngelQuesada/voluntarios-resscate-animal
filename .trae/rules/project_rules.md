Estilo General del Código: Seguir las convenciones de Prettier con la configuración de Airbnb. Si no es posible aplicar Prettier Airbnb directamente, priorizar código limpio, legible y consistente con las demás reglas de estilo.

Convención de Nombres para Variables/Funciones: camelCase.

Convención de Nombres para Componentes React: PascalCase.

Lenguaje Principal del Proyecto: TypeScript.

Framework Principal del Proyecto: Next.js (App Router).

Librería UI Principal: Material UI (MUI).

Librería de Iconos Preferida: Material Icons (usados a través de @mui/icons-material).

Gestión de Estado (General): Context API de React para estado global simple (como autenticación).

Base de Datos Principal: Firebase Firestore.

Autenticación: Firebase Authentication.

Restricción de API: Evitar el uso de localStorage para datos persistentes; usar Firestore en su lugar.

Formato de Fechas Preferido (para mostrar al usuario): dd 'de' MMMM 'de' yyyy (ej. "04 de junio de 2025") usando date-fns con locale es.

Comentarios en Código (Proyecto): Incluir JSDoc para funciones exportadas y componentes principales.

Versión de Node.js Mínima: Node.js >= 18.

Ignorar Tests de Playwright por Jest: Los tests E2E de Playwright ubicados en tests/e2e (según playwright.config.ts) deben ser ignorados por Jest (configurado en jest.config.js -> testPathIgnorePatterns).

Estructura de Directorios para Tests (Jest): Los tests unitarios/integración se ubican en carpetas **tests** dentro de src/ o como archivos _.test.ts(x) / _.spec.ts(x) en src/, o en una carpeta **tests** en la raíz del proyecto.

Configuración de Alias de Importación: Utilizar el alias @/_ para referirse a rutas desde src/_ (configurado en tsconfig.json y jest.config.js).

Mocks Globales para Jest: Los mocks para dependencias comunes (NextAuth, Next Navigation, MUI useMediaQuery, IntersectionObserver, ResizeObserver) se definen en jest.setup.js.

Manejo de Errores de Build/Linting (Next.js): No ignorar errores de TypeScript ni de ESLint durante el proceso de build (según next.config.ts).

Herramientas de IA del Proyecto: Utiliza Genkit con Google AI (Gemini) para funcionalidades de IA, como la optimización de turnos definida en src/ai/flows/shift-optimization.ts.

Funcionalidades Clave del Proyecto (según blueprint.md): Horario interactivo, gestión de roles (Voluntario, Manager, Administrador), panel de administración, optimización de turnos por IA.

Estilos de UI: La UI principal se está construyendo con Material UI (MUI). Dar preferencia a soluciones y componentes MUI al generar UI.

Paleta de Colores del Proyecto (General): Basada en la escala de grises definida en globals.css (modo claro y oscuro), con el rojo como color destructivo.

Configuración de PWA: El proyecto incluye site.webmanifest y tiene como objetivo ser una PWA instalable con funcionalidades offline. Los iconos para PWA se gestionan según las convenciones de Next.js y PWA.

Objetivo de Cobertura de Pruebas (Jest): Mínimo 70% para branches, funciones, líneas y statements, según jest.config.js.
