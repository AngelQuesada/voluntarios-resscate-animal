import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turnos Rescate Animal Granada",
  description: "Aplicación para gestionar turnos del refugio de perros Rescate Animal Granada",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default", // Asegura que la barra de estado sea visible en iOS
    title: "Rescate Animal",
    startupImage: [
      {
        url: "/icons/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      }
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  formatDetection: {
    telephone: true,
  },
  // Asegurar metaetiquetas adicionales para control de la barra de estado
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#ffffff',
  },
};