# Esquema de Base de Datos

Este documento detalla la estructura de la base de datos utilizada en el Sistema de Gestión de Voluntariado para Rescate Animal. El sistema utiliza Firebase Firestore como base de datos NoSQL.

## Estructura general

La base de datos se organiza en tres colecciones principales:
- `users`: Información de usuarios y sus roles
- `shifts`: Información de turnos y asignaciones
- `settings`: Configuraciones globales del sistema

## Colección: `users`

### Estructura de documento

```
users/
  |-- {uid}/  # ID generado por Firebase Authentication
      |-- displayName: string         # Nombre completo del usuario
      |-- email: string               # Email del usuario
      |-- photoURL: string            # URL de foto de perfil (opcional)
      |-- roles: array<number>        # Array de roles del usuario (1: Voluntario, 2: Responsable, 3: Administrador)
      |-- createdAt: timestamp        # Fecha de creación de la cuenta
      |-- lastLogin: timestamp        # Última fecha de inicio de sesión
      |-- isActive: boolean           # Estado del usuario (activo/inactivo)
      |-- location: string            # Ubicación/ciudad del usuario (opcional)
      |-- occupation: string          # Ocupación del usuario (opcional)
      |-- dateOfBirth: string         # Fecha de nacimiento (opcional, formato YYYY-MM-DD)
```

### Ejemplos

```json
{
  "displayName": "Juan Pérez",
  "email": "juan.perez@example.com",
  "photoURL": "https://example.com/profile/juan.jpg",
  "roles": [1],
  "createdAt": "2023-05-15T10:30:00Z",
  "lastLogin": "2023-06-01T08:45:00Z",
  "isActive": true,
  "location": "Madrid",
  "occupation": "Estudiante",
  "dateOfBirth": "1995-08-22"
}
```

```json
{
  "displayName": "Ana García",
  "email": "ana.garcia@example.com",
  "photoURL": null,
  "roles": [1, 3],
  "createdAt": "2023-04-10T14:20:00Z",
  "lastLogin": "2023-06-02T16:30:00Z",
  "isActive": true,
  "location": "Barcelona",
  "occupation": "Veterinaria",
  "dateOfBirth": "1988-03-15"
}
```

## Colección: `shifts`

### Estructura de documento

```
shifts/
  |-- {dateKey_shiftKey}/  # ID compuesto: YYYY-MM-DD_M o YYYY-MM-DD_T
      |-- date: string                # Fecha del turno (formato YYYY-MM-DD)
      |-- shift: string               # Identificador del turno (M: mañana, T: tarde)
      |-- assignments: array<object>  # Array de voluntarios asignados
          |-- uid: string                 # ID del usuario asignado (único campo almacenado)
      |-- notes: string               # Notas adicionales para el turno (opcional)
      |-- lastUpdated: timestamp      # Fecha de última actualización (opcional)
```

### Ejemplos

```json
{
  "date": "2023-06-05",
  "shift": "M",
  "assignments": [
    {
      "uid": "user123"
    },
    {
      "uid": "user456"
    }
  ],
  "notes": "Llevar provisiones extra para los nuevos cachorros",
  "lastUpdated": "2023-06-01T10:15:00Z"
}
```

```json
{
  "date": "2023-06-05",
  "shift": "T",
  "assignments": [
    {
      "uid": "user789"
    }
  ],
  "notes": "",
  "lastUpdated": "2023-06-03T09:00:00Z"
}
```

## Colección: `settings`

### Estructura de documento

```
settings/
  |-- system/
      |-- minVolunteersPerShift: number  # Número mínimo de voluntarios por turno
      |-- requireResponsable: boolean    # Indicador si se requiere responsable en cada turno
      |-- advanceScheduleDays: number    # Días de antelación para programar turnos
```

### Ejemplo

```json
{
  "minVolunteersPerShift": 2,
  "requireResponsable": true,
  "advanceScheduleDays": 14
}
```

## Consultas comunes

### Obtener todos los usuarios activos
```javascript
db.collection('users').where('isActive', '==', true).get()
```

### Obtener administradores
```javascript
db.collection('users').where('roles', 'array-contains', 3).get()
```

### Obtener turnos para una semana específica
```javascript
const startDate = '2023-06-05';
const endDate = '2023-06-11';
db.collection('shifts')
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .get()
```

### Obtener turnos asignados a un usuario específico
```javascript
db.collection('shifts')
  .where('assignments', 'array-contains', {uid: 'user123'})
  .get()
```

## Consideraciones de escalabilidad

1. **Consultas eficientes**: Mantener las consultas filtradas para evitar descargar grandes conjuntos de datos.
2. **Límites de documento**: Firestore tiene un límite de 1MB por documento, lo que debería ser suficiente para el uso esperado.
3. **Índices compuestos**: Crear índices compuestos para consultas frecuentes (ver documento FIREBASE_CONFIG.md).
4. **Crecimiento de datos**: Considerar estrategias de archivado para datos históricos si la aplicación escala significativamente.