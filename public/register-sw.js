// Registrar el service worker solo si está disponible en el navegador
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registrado correctamente:', registration.scope);
      })
      .catch(function(error) {
        console.log('Error al registrar el Service Worker:', error);
      });
  });

  // Escuchar cuando la app ha sido instalada
  window.addEventListener('appinstalled', (evt) => {
    console.log('Aplicación instalada correctamente');
    
    // Forzar actualización de la caché cuando se instala la app
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  });

  // Actualizar automáticamente el service worker cuando hay cambios
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then(registration => {
      // Verificar si hay actualizaciones del service worker cada vez que la app se carga
      registration.update();
    });
  });
}

// Función para comprobar si la app está en modo pantalla completa
function isInStandaloneMode() {
  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const displayModeFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  // Para Safari en iOS - verificar de forma segura
  const iosStandalone = typeof window.navigator.standalone !== 'undefined' && window.navigator.standalone === true;
  const androidApp = document.referrer.includes('android-app://');
  
  return displayModeStandalone || displayModeFullscreen || iosStandalone || androidApp;
}

// Detectar si la app está en modo standalone/instalado
if (isInStandaloneMode()) {
  console.log('La aplicación está corriendo en modo standalone/instalado');
  // Añadir clase para estilos específicos de PWA
  document.documentElement.classList.add('pwa-mode');
  document.body.classList.add('pwa-mode');
} else {
  console.log('La aplicación está corriendo en el navegador normal');
}