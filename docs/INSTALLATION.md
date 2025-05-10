# Guía de Instalación

Esta guía proporciona instrucciones detalladas para configurar el entorno de desarrollo para el Sistema de Gestión de Voluntariado para Rescate Animal.

## Requisitos previos

- Node.js v16 o superior
- npm o yarn
- Cuenta en Firebase
- Editor de código (recomendado: Visual Studio Code)

## Pasos de instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/rescate-animal-voluntariado.git
cd rescate-animal-voluntariado
```

### 2. Instalar dependencias

```bash
npm install
# o 
yarn install
```

### 3. Configurar Firebase

1. Crear un nuevo proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication con proveedores de email/password y Google
3. Crear una base de datos Firestore
4. Obtener las credenciales de la aplicación web:
   - En la consola de Firebase, ve a la configuración del proyecto
   - En la sección "Tus aplicaciones", selecciona la app web
   - Copia los valores de configuración

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5. Inicializar Firestore con colecciones básicas

Las colecciones principales que necesitarás crear son:
- `users` - Para almacenar información de los usuarios
- `shifts` - Para almacenar los turnos programados
- `settings` - Para configuraciones globales

La estructura de datos se detalla en el documento [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
# o
yarn dev
```

### 7. Acceder a la aplicación

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Solución de problemas comunes

- **Error de conexión a Firebase**: Verifica que las credenciales en el archivo `.env.local` sean correctas.
- **Errores de dependencias**: Intenta eliminar la carpeta `node_modules` y el archivo `package-lock.json` o `yarn.lock`, luego ejecuta `npm install` o `yarn install` nuevamente.
- **Problemas con las reglas de Firestore**: Revisa que las reglas de seguridad en Firebase Console permitan operaciones de lectura/escritura según sea necesario para desarrollo.