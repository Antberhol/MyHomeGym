import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function normalizeBasePath(value) {
  if (!value || value.trim() === '') {
    return '/'
  }

  const trimmed = value.trim()
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH)
const pwaCacheVersion = 'v20260325-update1'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  // La ilustración del mapa muscular se carga con new URL(..., import.meta.url); si Vite
  // preempaqueta la librería en desarrollo, pierde la ruta a las imágenes.
  optimizeDeps: {
    exclude: ['js-rich-body-highlighter'],
  },
  server: {
    // En desarrollo, /api se reenvía al backend Spring Boot: mismo origen, sin CORS y con la
    // cookie de refresco funcionando.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        // Las llamadas a la API nunca se sirven desde la caché del service worker.
        navigateFallbackDenylist: [/^\/api\//],
        // La interfaz completa, con sus tipografías, queda disponible sin conexión.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: `app-shell-${pwaCacheVersion}`,
              networkTimeoutSeconds: 8,
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'image' && !url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: `images-${pwaCacheVersion}`,
              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
      manifest: {
        name: 'MyHomeGym',
        short_name: 'MyHomeGym',
        description: 'Registro de entrenamientos de fuerza para tu gimnasio en casa',
        theme_color: '#14131B',
        background_color: '#14131B',
        display: 'standalone',
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
