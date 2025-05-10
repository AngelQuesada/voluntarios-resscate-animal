# Cómo verificar si estás autenticado en la aplicación

## Usando el hook useAuth

La aplicación ya cuenta con un sistema de autenticación implementado con Firebase Authentication. Para verificar si estás autenticado, puedes utilizar el hook `useAuth` que está disponible en el contexto de autenticación.

### Ejemplo de uso

```tsx
import { useAuth } from "@/context/AuthContext";

function MiComponente() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <p>No has iniciado sesión</p>;
  }

  return (
    <div>
      <p>Has iniciado sesión como: {user.email}</p>
      {/* Resto del contenido para usuarios autenticados */}
    </div>
  );
}
```

## Comportamiento automático de redirección

El sistema de autenticación está configurado para redirigir automáticamente:

1. Si no estás autenticado, serás redirigido a la página de inicio (`/`).
2. Si estás autenticado y te encuentras en la página de inicio, serás redirigido a la página de horarios (`/schedule`).

## Información disponible del usuario autenticado

Cuando un usuario está autenticado, el objeto `user` contiene información como:

- `user.email`: Correo electrónico del usuario
- `user.uid`: Identificador único del usuario
- `user.displayName`: Nombre mostrado (si está configurado)

## Verificación visual

Puedes saber que estás autenticado si:

1. Puedes ver tu nombre de usuario en la cabecera de la aplicación
2. Tienes acceso a las páginas protegidas como `/schedule`
3. Puedes ver el botón de cerrar sesión en la esquina superior derecha

## Cerrar sesión

Para cerrar sesión, puedes hacer clic en el botón con el icono de salida (LogoutIcon) ubicado en la cabecera de la aplicación.
