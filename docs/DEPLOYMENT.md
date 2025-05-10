# Guía de Despliegue

Este documento proporciona instrucciones para desplegar el Sistema de Gestión de Voluntariado para Rescate Animal en diferentes entornos de producción.

## Preparación para despliegue

Antes de desplegar la aplicación, asegúrate de:

1. Tener una cuenta de Firebase configurada con los servicios necesarios
2. Configurar correctamente las variables de entorno
3. Ejecutar pruebas para verificar que todo funciona correctamente
4. Optimizar la aplicación para producción

## Opciones de despliegue

### 1. Despliegue en Vercel (Recomendado)

Vercel es la plataforma recomendada para desplegar aplicaciones Next.js.

#### Pasos:

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una
2. Instala la CLI de Vercel:
   ```bash
   npm i -g vercel
   ```

3. Inicia sesión en Vercel desde la terminal:
   ```bash
   vercel login
   ```

4. Desde el directorio raíz del proyecto, ejecuta:
   ```bash
   vercel
   ```

5. Sigue las instrucciones para configurar el proyecto:
   - Confirma el directorio de despliegue
   - Configura las variables de entorno necesarias (copia de tu archivo `.env.local`)
   - Selecciona la rama que deseas desplegar

6. Una vez completado, Vercel proporcionará una URL para tu aplicación desplegada

#### Configuración de variables de entorno en Vercel:

Navega a tu proyecto en el dashboard de Vercel y configura las siguientes variables de entorno:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 2. Despliegue en Netlify

Netlify es otra excelente opción para desplegar aplicaciones Next.js.

#### Pasos:

1. Crea una cuenta en [Netlify](https://netlify.com) si aún no tienes una
2. Desde el dashboard de Netlify, haz clic en "New site from Git"
3. Selecciona tu repositorio
4. Configura las opciones de construcción:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Configura las variables de entorno
6. Haz clic en "Deploy site"

### 3. Despliegue utilizando Docker

Para entornos más personalizados, puedes utilizar Docker para desplegar la aplicación.

#### Crear un Dockerfile:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Pasos para desplegar con Docker:

1. Construye la imagen Docker:
   ```bash
   docker build -t rescate-animal-voluntariado .
   ```

2. Ejecuta el contenedor:
   ```bash
   docker run -p 3000:3000 --env-file .env.local rescate-animal-voluntariado
   ```

## Consideraciones para producción

### Optimización de rendimiento

1. **Imágenes optimizadas**: Asegúrate de que todas las imágenes estén optimizadas para web.
2. **Análisis de paquetes**: Utiliza herramientas como `@next/bundle-analyzer` para identificar y optimizar paquetes grandes.

### SEO y Metadatos

1. Configura adecuadamente los metadatos en `src/app/metadata.ts` para mejorar el SEO.
2. Asegúrate de que las páginas tengan títulos y descripciones significativos.

### Caché y CDN

1. Firebase Hosting y Vercel incluyen CDN por defecto.
2. Configura encabezados de caché apropiados para recursos estáticos.

### Monitoreo y análisis

1. Considera implementar Google Analytics o similar para monitorear el uso.
2. Utiliza Firebase Performance Monitoring para seguimiento de rendimiento.
3. Configura alertas para comportamientos inesperados.

## Actualización de la aplicación desplegada

### Actualizaciones en Vercel/Netlify

Ambas plataformas se integran con tu repositorio Git. Simplemente actualiza tu rama principal (o la rama configurada para despliegue) y se desplegará automáticamente una nueva versión.

### Actualizaciones manuales

1. Actualiza el código en tu repositorio
2. Realiza una nueva compilación
3. Despliega la nueva versión

## Solución de problemas comunes

### Error en la autenticación de Firebase

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que los dominios de la aplicación estén autorizados en Firebase Console

### Problemas de rendimiento

- Verifica los logs de servidor para identificar cuellos de botella
- Utiliza herramientas de rendimiento como Lighthouse para detectar áreas de mejora

### Errores 404 o de enrutamiento

- Verifica la configuración de rutas en Next.js
- Asegúrate de que todas las páginas estén correctamente exportadas
- Comprueba la configuración de `next.config.js`

## Respaldo y recuperación

Es importante mantener un plan de respaldo y recuperación:

1. **Respaldo regular de Firestore**: Configura respaldos programados en Firebase
2. **Control de versiones del código**: Mantén todas las versiones en tu repositorio Git
3. **Documentación de configuración**: Mantén documentadas todas las configuraciones específicas del entorno de producción