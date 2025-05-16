// Nombre del caché
const CACHE_NAME = 'rescate-animal-cache-v1';

// Archivos a cachear inicialmente
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/schedule',
  '/apple-touch-icon.png'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('[Service Worker] Cache error:', error);
      })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Estrategia de caché: Cache first, falling back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANTE: Clonar la solicitud.
        // La solicitud es un stream y solo puede ser consumida una vez.
        // Necesitamos clonarla para que podamos consumirla dos veces.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Verificar si obtuvimos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANTE: Clonar la respuesta.
            // La respuesta es un stream y solo puede ser consumida una vez.
            // Necesitamos clonarla para que podamos guardarla en caché y servirla.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Solo cachear solicitudes GET
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(() => {
          // Si la red falla y es un HTML o recurso importante, 
          // podemos devolver una página fuera de línea personalizada
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      // Tomar control inmediato de todas las páginas
      return self.clients.claim();
    })
  );
});

// Evento para recibir mensajes desde la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});