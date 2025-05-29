// Configuración de duración de cookies de autenticación
const AUTH_COOKIE_CONFIG = {
  // Duraciones en segundos
  MOBILE: {
    STANDARD: 2592000, // 30 días (30 * 24 * 60 * 60)
    ADMIN: 604800,     // 7 días (7 * 24 * 60 * 60)
  },
  DESKTOP: {
    STANDARD: 1209600, // 14 días (14 * 24 * 60 * 60)
    ADMIN: 259200,     // 3 días (3 * 24 * 60 * 60)
  },
  REMEMBER_ME: 7776000, // 90 días (90 * 24 * 60 * 60)
};

// Función para determinar la duración de cookie apropiada
const getCookieDuration = (isAdmin: boolean, isMobile: boolean, rememberMe: boolean = false) => {
  if (rememberMe) {
    return AUTH_COOKIE_CONFIG.REMEMBER_ME;
  }
  
  if (isMobile) {
    return isAdmin ? AUTH_COOKIE_CONFIG.MOBILE.ADMIN : AUTH_COOKIE_CONFIG.MOBILE.STANDARD;
  } else {
    return isAdmin ? AUTH_COOKIE_CONFIG.DESKTOP.ADMIN : AUTH_COOKIE_CONFIG.DESKTOP.STANDARD;
  }
};