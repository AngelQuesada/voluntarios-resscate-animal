1. Estilo General del Código: Seguir las convenciones de Prettier con la configuración de Airbnb. Si no es posible aplicar Prettier Airbnb directamente, priorizar código limpio, legible y consistente con las demás reglas de estilo.
2. Convención de Nombres para Variables/Funciones: camelCase.
3. Convención de Nombres para Componentes React: PascalCase.
4. Lenguaje Principal del Proyecto: TypeScript.
5. Framework Principal del Proyecto: Next.js (App Router).
6. Librería UI Principal: Material UI (MUI).
7. Librería de Iconos Preferida: Material Icons (usados a través de @mui/icons-material).
8. Gestión de Estado (General): Context API de React para estado global simple (como autenticación).
9. Base de Datos Principal: Firebase Firestore.
10. Autenticación: Firebase Authentication.
11. Restricción de API: Evitar el uso de localStorage para datos persistentes; usar Firestore en su lugar.
12. Formato de Fechas Preferido (para mostrar al usuario): dd 'de' MMMM 'de' yyyy (ej. "04 de junio de 2025") usando date-fns con locale es.
13. Comentarios en Código (Proyecto): Incluir JSDoc para funciones exportadas y componentes principales.
14. Versión de Node.js Mínima: Node.js >= 18.
15. Ignorar Tests de Playwright por Jest: Los tests E2E de Playwright ubicados en tests/e2e (según playwright.config.ts) deben ser ignorados por Jest (configurado en jest.config.js -> testPathIgnorePatterns).
16. Estructura de Directorios para Tests (Jest): Los tests unitarios/integración se ubican en carpetas tests dentro de src/ o como archivos .test.ts(x) / .spec.ts(x) en src/, o en una carpeta tests en la raíz del proyecto.
17. Configuración de Alias de Importación: Utilizar el alias @/ para referirse a rutas desde src/ (configurado en tsconfig.json y jest.config.js).
18. Mocks Globales para Jest: Los mocks para dependencias comunes (NextAuth, Next Navigation, MUI useMediaQuery, IntersectionObserver, ResizeObserver) se definen en jest.setup.js.
19. Manejo de Errores de Build/Linting (Next.js): No ignorar errores de TypeScript ni de ESLint durante el proceso de build (según next.config.ts).
20. Herramientas de IA del Proyecto: Utiliza Genkit con Google AI (Gemini) para funcionalidades de IA, como la optimización de turnos definida en src/ai/flows/shift-optimization.ts.
21. Funcionalidades Clave del Proyecto (según blueprint.md): Horario interactivo, gestión de roles (Voluntario, Manager, Administrador), panel de administración, optimización de turnos por IA.
22. Estilos de UI: La UI principal se está construyendo con Material UI (MUI). Dar preferencia a soluciones y componentes MUI al generar UI.
23. Paleta de Colores del Proyecto (General): Basada en la escala de grises definida en globals.css (modo claro y oscuro), con el rojo como color destructivo.
24. Configuración de PWA: El proyecto incluye site.webmanifest y tiene como objetivo ser una PWA instalable con funcionalidades offline. Los iconos para PWA se gestionan según las convenciones de Next.js y PWA.
25. Objetivo de Cobertura de Pruebas (Jest): Mínimo 70% para branches, funciones, líneas y statements, según jest.config.js.
