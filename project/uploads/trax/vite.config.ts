import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'TRAX',
        short_name: 'TRAX',
        description: 'Studio management panel',
        display: 'standalone',
        background_color: '#0b0809',
        theme_color: '#0b0809',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: 'any', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firebase-cache', networkTimeoutSeconds: 10 },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
})
