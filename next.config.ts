import { NextConfig } from 'next';

// Configurar PWA solo en producción para evitar conflictos con Turbopack
const isPWAEnabled = process.env.NODE_ENV === 'production' && 
                   process.env.DISABLE_PWA !== 'true' && 
                   process.env.IS_TESTING_ENVIRONMENT !== 'true';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignorar errores de tipado durante la compilación
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración de Turbopack (ahora estable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Configuración específica para testing
  ...(process.env.IS_TESTING_ENVIRONMENT === 'true' && {
    // Configuración más rápida para tests
    compiler: {
      removeConsole: false,
    },
  }),
};

// Solo aplicar PWA en producción
if (isPWAEnabled) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
  });
  
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
