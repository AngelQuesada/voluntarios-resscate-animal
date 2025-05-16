// Registrar el service worker solo si está disponible en el navegador
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('Service Worker registrado correctamente:', registration.scope);
      })
      .catch(function(error) {
        console.log('Error al registrar el Service Worker:', error);
      });
  });
}