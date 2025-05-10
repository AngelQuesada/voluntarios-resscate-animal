# Sistema de Gestión de Voluntariado para Rescate Animal

Este proyecto es una aplicación web diseñada para coordinar y gestionar voluntarios en organizaciones de rescate animal. Permite la planificación de turnos, asignación de roles y comunicación entre voluntarios.

## Características principales

- Gestión de turnos de voluntariado (mañana/tarde)
- Sistema de roles (Administrador, Responsable, Voluntario)
- Calendario interactivo para asignación de turnos
- Panel de administración para gestión de usuarios
- Notificaciones y recordatorios

## Tecnologías utilizadas

- **Frontend**: Next.js, React, TypeScript, Material-UI
- **Backend**: Firebase (Authentication, Firestore)
- **Estado**: React Context API y hooks personalizados
- **Despliegue**: Vercel (recomendado)

## Requisitos previos

- Node.js v16 o superior
- Cuenta en Firebase
- npm o yarn

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/rescate-animal-voluntariado.git
   cd rescate-animal-voluntariado
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno (ver sección de configuración)

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Configuración

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Documentación adicional

Para más información sobre la configuración y uso del sistema, consulta los siguientes documentos:

- [Guía de instalación](docs/INSTALLATION.md)
- [Configuración de Firebase](docs/FIREBASE_CONFIG.md)
- [Esquema de base de datos](docs/DATABASE_SCHEMA.md)
- [Roles de usuario](docs/USER_ROLES.md)
- [API Documentation](docs/API_DOCS.md)
- [Guía de despliegue](docs/DEPLOYMENT.md)
- [Consideraciones de seguridad](docs/SECURITY.md)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
