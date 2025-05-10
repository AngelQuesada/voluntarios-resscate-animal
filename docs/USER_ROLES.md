# Roles de Usuario

Este documento describe el sistema de roles implementado en el Sistema de Gestión de Voluntariado para Rescate Animal, detallando las responsabilidades y permisos asignados a cada rol.

## Introducción al sistema de roles

El sistema utiliza un enfoque basado en números para asignar roles a los usuarios. Un usuario puede tener múltiples roles simultáneamente, lo que permite una gestión flexible de permisos.

Los roles se almacenan en la propiedad `roles` de cada documento de usuario como un array de números.

## Roles disponibles

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | Voluntario | Participación en turnos programados |
| 2 | Responsable | Coordinación de turnos y voluntarios |
| 3 | Administrador | Control total del sistema, gestión de usuarios y configuración |

## Detalles de permisos por rol

### 1. Voluntario

**Identificador:** `1`

**Permisos:**
- Visualización de la programación de turnos
- Autoasignación a turnos disponibles
- Visualización de sus propias asignaciones
- Cancelación de sus propias asignaciones (con restricciones)
- No puede acceder al panel de administración

**Responsabilidades:**
- Cumplir con los turnos asignados
- Informar con antelación sobre imposibilidad de asistencia

### 2. Responsable

**Identificador:** `2`

**Permisos:**
- Visualización de todos los turnos y asignaciones
- Asignación y modificación de turnos
- Gestión de asistencia de voluntarios
- No puede acceder al panel de administración

**Responsabilidades:**
- Coordinar la participación de voluntarios
- Asegurar la cobertura adecuada de todos los turnos
- Comunicar incidencias al Administrador

### 3. Administrador

**Identificador:** `3`

**Permisos:**
- Gestión completa de usuarios (crear, editar, desactivar, eliminar)
- Asignación y revocación de roles
- Visualización de todos los turnos y asignaciones
- Asignación y modificación de turnos
- Acceso al panel de administración
- Configuración del sistema

**Responsabilidades:**
- Mantener la integridad del sistema
- Gestionar altas y bajas de usuarios
- Supervisar el funcionamiento general de la programación

## Gestión de roles múltiples

Un usuario puede tener múltiples roles asignados. Por ejemplo:
- Un usuario con roles `[1, 3]` es Voluntario y Administrador
- Un usuario con roles `[1, 2]` es Voluntario y Responsable

En caso de roles múltiples, el sistema reconoce el rol de mayor privilegio para determinar el acceso a funcionalidades específicas.

## Implementación técnica

Los roles se definen como constantes en el archivo `src/lib/constants.ts`:

```typescript
export const UserRoles = {
  VOLUNTARIO: 1,
  RESPONSABLE: 2,
  ADMINISTRADOR: 3,
} as const;
```

### Verificación de roles

Para verificar si un usuario tiene un rol específico, se utiliza la función:

```typescript
// Verificar si el usuario es administrador
const isAdmin = (user) => {
  return user.roles && user.roles.includes(UserRoles.ADMINISTRADOR);
};

// Verificar si el usuario es responsable o administrador
const isResponsable = (user) => {
  return user.roles && 
    (user.roles.includes(UserRoles.RESPONSABLE) || 
     user.roles.includes(UserRoles.ADMINISTRADOR));
};
```

## Proceso de asignación de roles

1. **Creación de usuario:** Al registrar un nuevo usuario, se asigna por defecto el rol de Voluntario (`[1]`).
2. **Modificación de roles:** Solo los Administradores pueden modificar roles a través del panel de administración.
3. **Asignación de rol de Administrador:** Por seguridad, el primer Administrador debe ser creado manualmente en la base de datos.

## Consideraciones de seguridad

- Los permisos se verifican tanto en el cliente como en el servidor
- Las reglas de seguridad de Firestore utilizan funciones específicas para validar roles
- Se recomienda limitar el número de usuarios con rol de Administrador