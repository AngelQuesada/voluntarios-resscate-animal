# Configuración de Firebase

Este documento detalla la configuración necesaria de Firebase para el Sistema de Gestión de Voluntariado para Rescate Animal.

## Variables de entorno requeridas

### Firebase Client (Frontend)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Admin SDK (Backend/API Routes)
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

### Obtener credenciales de Firebase

1. **Para credenciales del cliente** (Frontend):
   - Ve a Configuración del proyecto > General
   - En "Tus aplicaciones", selecciona tu app web
   - Copia los valores de configuración

2. **Para credenciales de Firebase Admin** (Backend):
   - Ve a Configuración del proyecto > Cuentas de servicio
   - Haz clic en "Generar nueva clave privada"
   - Descarga el archivo JSON
   - Extrae los valores correspondientes a las variables de entorno

**⚠️ Importante**: Nunca incluyas archivos de credenciales en tu repositorio Git. Usa siempre variables de entorno.

## Servicios de Firebase requeridos

- **Authentication**: Para gestión de usuarios y autenticación
- **Firestore**: Base de datos NoSQL para almacenar datos de la aplicación
- **Cloud Storage** (opcional): Para almacenamiento de archivos e imágenes si se implementa carga de fotos de perfil

## Configuración de Firebase Authentication

### Proveedores de autenticación a habilitar:

1. **Email/Password**
   - Habilitar inicio de sesión con email y contraseña
   - Activar verificación de email (recomendado)

2. **Google** (opcional pero recomendado)
   - Configurar OAuth consent screen
   - Agregar dominios autorizados

### Configuración recomendada:

- Habilitar protección contra reutilización de sesión
- Configurar plantillas de email personalizadas para:
  - Verificación de email
  - Restablecimiento de contraseña

## Estructura de Firestore

### Colecciones principales:

#### 1. `users`
Almacena información de los usuarios registrados:
```
users/
  |-- {uid}/
      |-- displayName: string
      |-- email: string
      |-- photoURL: string (opcional)
      |-- roles: array<number> (1: Voluntario, 2: Responsable, 3: Administrador)
      |-- createdAt: timestamp
      |-- lastLogin: timestamp
      |-- isActive: boolean
      |-- location: string (opcional)
      |-- occupation: string (opcional)
      |-- dateOfBirth: string (opcional)
```

#### 2. `shifts`
Almacena los turnos programados:
```
shifts/
  |-- {dateKey_shiftKey}/  (formato: YYYY-MM-DD_M o YYYY-MM-DD_T)
      |-- date: string (YYYY-MM-DD)
      |-- shift: string (M: mañana, T: tarde)
      |-- assignments: array<object>
          |-- uid: string  # Único campo almacenado
      |-- notes: string (opcional)
      |-- lastUpdated: timestamp (opcional)
```

#### 3. `settings`
Configuraciones globales de la aplicación:
```
settings/
  |-- system/
      |-- minVolunteersPerShift: number
      |-- requireResponsable: boolean
      |-- advanceScheduleDays: number
```

## Reglas de seguridad de Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función para verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función para verificar si el usuario es admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny([3]);
    }
    
    // Función para verificar si el usuario es responsable
    function isResponsable() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny([2, 3]);
    }
    
    // Reglas para la colección users
    match /users/{userId} {
      // Los usuarios pueden leer sus propios datos
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      // Solo los administradores pueden crear/actualizar/eliminar usuarios
      allow write: if isAdmin();
    }
    
    // Reglas para la colección shifts
    match /shifts/{shiftId} {
      // Todos los usuarios autenticados pueden leer los turnos
      allow read: if isAuthenticated();
      // Solo administradores y responsables pueden modificar turnos
      allow write: if isResponsable();
    }
    
    // Reglas para la colección settings
    match /settings/{document=**} {
      // Todos los usuarios autenticados pueden leer configuración
      allow read: if isAuthenticated();
      // Solo administradores pueden modificar configuración
      allow write: if isAdmin();
    }
  }
}
```

## Índices compuestos recomendados

Para mejorar el rendimiento en consultas frecuentes, es recomendable crear los siguientes índices compuestos:

1. Colección `shifts`:
   - `date` (ascending) + `shift` (ascending)

2. Colección `users`:
   - `roles` (ascending) + `isActive` (ascending)

## Respaldo y recuperación

Se recomienda configurar respaldos automáticos de Firestore:

1. En la consola de Firebase, ir a Firestore > Backups
2. Configurar respaldos programados (diarios o semanales)
3. Establecer una política de retención adecuada (30-90 días)