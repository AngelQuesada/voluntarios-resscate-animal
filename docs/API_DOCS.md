# Documentación de API

Este documento detalla los endpoints de API disponibles en el Sistema de Gestión de Voluntariado para Rescate Animal.

## Información general

La API está construida utilizando las API Routes de Next.js y se comunica con Firebase para la persistencia de datos. Todos los endpoints requieren autenticación, a menos que se indique lo contrario.

## Autenticación

La autenticación se implementa utilizando Firebase Authentication. Para acceder a los endpoints protegidos, se requiere incluir un token JWT válido en el encabezado de autorización:

```
Authorization: Bearer {token}
```

## Endpoints disponibles

### Usuarios

#### Obtener usuario actual

```
GET /api/users/me
```

Devuelve la información del usuario autenticado actualmente.

**Respuesta exitosa (200):**
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "photoURL": "string|null",
  "roles": "number[]",
  "isActive": "boolean",
  "location": "string|null",
  "occupation": "string|null",
  "dateOfBirth": "string|null"
}
```

#### Obtener usuario por ID

```
GET /api/users/{uid}
```

Devuelve información de un usuario específico por ID. Requiere rol de administrador.

**Parámetros:**
- `uid`: ID único del usuario

**Respuesta exitosa (200):**
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "photoURL": "string|null",
  "roles": "number[]",
  "isActive": "boolean",
  "location": "string|null",
  "occupation": "string|null",
  "dateOfBirth": "string|null"
}
```

#### Listar usuarios

```
GET /api/users
```

Devuelve una lista de todos los usuarios. Requiere rol de administrador.

**Parámetros de consulta opcionales:**
- `active`: Filtrar por estado activo (true/false)
- `role`: Filtrar por rol (1, 2, 3)

**Respuesta exitosa (200):**
```json
[
  {
    "uid": "string",
    "displayName": "string",
    "email": "string",
    "photoURL": "string|null",
    "roles": "number[]",
    "isActive": "boolean",
    "location": "string|null",
    "occupation": "string|null",
    "dateOfBirth": "string|null"
  }
]
```

#### Crear usuario

```
POST /api/users
```

Crea un nuevo usuario. Requiere rol de administrador.

**Cuerpo de la solicitud:**
```json
{
  "displayName": "string",
  "email": "string",
  "password": "string",
  "roles": "number[]",
  "location": "string",
  "occupation": "string",
  "dateOfBirth": "string"
}
```

**Respuesta exitosa (201):**
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "roles": "number[]",
  "isActive": true
}
```

#### Actualizar usuario

```
PUT /api/users/{uid}
```

Actualiza la información de un usuario. Requiere rol de administrador.

**Parámetros:**
- `uid`: ID único del usuario

**Cuerpo de la solicitud:**
```json
{
  "displayName": "string",
  "email": "string",
  "roles": "number[]",
  "isActive": "boolean",
  "location": "string",
  "occupation": "string",
  "dateOfBirth": "string"
}
```

**Respuesta exitosa (200):**
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "roles": "number[]",
  "isActive": "boolean",
  "location": "string",
  "occupation": "string",
  "dateOfBirth": "string"
}
```

#### Eliminar usuario

```
DELETE /api/users/{uid}
```

Elimina un usuario. Requiere rol de administrador.

**Parámetros:**
- `uid`: ID único del usuario

**Respuesta exitosa (204):**
Sin contenido

### Turnos

#### Obtener turnos

```
GET /api/shifts
```

Devuelve los turnos disponibles.

**Parámetros de consulta opcionales:**
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)
- `myShifts`: Si es "true", devuelve solo los turnos del usuario actual

**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "date": "string",
    "shift": "string",
    "assignments": [
      {
        "uid": "string",
        "displayName": "string",
        "roles": "number[]",
        "assignedAt": "string"
      }
    ],
    "notes": "string"
  }
]
```

#### Obtener turno por ID

```
GET /api/shifts/{id}
```

Devuelve información de un turno específico.

**Parámetros:**
- `id`: ID del turno (formato: YYYY-MM-DD_M o YYYY-MM-DD_T)

**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "date": "string",
  "shift": "string",
  "assignments": [
    {
      "uid": "string",
      "displayName": "string",
      "roles": "number[]",
      "assignedAt": "string"
    }
  ],
  "notes": "string"
}
```

#### Crear o actualizar turno

```
PUT /api/shifts/{id}
```

Crea o actualiza un turno. Requiere rol de responsable o administrador.

**Parámetros:**
- `id`: ID del turno (formato: YYYY-MM-DD_M o YYYY-MM-DD_T)

**Cuerpo de la solicitud:**
```json
{
  "date": "string",
  "shift": "string",
  "assignments": [
    {
      "uid": "string",
      "displayName": "string",
      "roles": "number[]"
    }
  ],
  "notes": "string"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "date": "string",
  "shift": "string",
  "assignments": [
    {
      "uid": "string",
      "displayName": "string",
      "roles": "number[]",
      "assignedAt": "string"
    }
  ],
  "notes": "string"
}
```

#### Asignar usuario a turno

```
POST /api/shifts/{id}/assign
```

Asigna un usuario a un turno específico.

**Parámetros:**
- `id`: ID del turno (formato: YYYY-MM-DD_M o YYYY-MM-DD_T)

**Cuerpo de la solicitud:**
```json
{
  "uid": "string",
  "displayName": "string",
  "roles": "number[]"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "date": "string",
  "shift": "string",
  "assignments": [
    {
      "uid": "string",
      "displayName": "string",
      "roles": "number[]",
      "assignedAt": "string"
    }
  ],
  "notes": "string"
}
```

#### Desasignar usuario de turno

```
POST /api/shifts/{id}/unassign
```

Elimina la asignación de un usuario de un turno.

**Parámetros:**
- `id`: ID del turno (formato: YYYY-MM-DD_M o YYYY-MM-DD_T)

**Cuerpo de la solicitud:**
```json
{
  "uid": "string"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "date": "string",
  "shift": "string",
  "assignments": [
    {
      "uid": "string",
      "displayName": "string",
      "roles": "number[]",
      "assignedAt": "string"
    }
  ],
  "notes": "string"
}
```

### Configuración

#### Obtener configuración del sistema

```
GET /api/settings
```

Devuelve la configuración global del sistema. Accesible para todos los usuarios autenticados.

**Respuesta exitosa (200):**
```json
{
  "minVolunteersPerShift": "number",
  "requireResponsable": "boolean",
  "advanceScheduleDays": "number"
}
```

#### Actualizar configuración del sistema

```
PUT /api/settings
```

Actualiza la configuración global del sistema. Requiere rol de administrador.

**Cuerpo de la solicitud:**
```json
{
  "minVolunteersPerShift": "number",
  "requireResponsable": "boolean",
  "advanceScheduleDays": "number"
}
```

**Respuesta exitosa (200):**
```json
{
  "minVolunteersPerShift": "number",
  "requireResponsable": "boolean",
  "advanceScheduleDays": "number"
}
```

## Códigos de error comunes

- **400 Bad Request**: Solicitud malformada o datos inválidos
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: No tiene permiso para acceder al recurso
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto en la operación (ej. email ya en uso)
- **500 Internal Server Error**: Error interno del servidor

## Ejemplos de uso

### Ejemplo: Asignar un usuario a un turno

```javascript
// Asignar usuario al turno de mañana del 1 de junio de 2023
fetch('/api/shifts/2023-06-01_M/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    uid: 'user123',
    displayName: 'Juan Pérez',
    roles: [3]
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Ejemplo: Listar todos los usuarios activos

```javascript
// Obtener todos los usuarios activos
fetch('/api/users?active=true', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```