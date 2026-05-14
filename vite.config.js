import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Horarios UTJ-CCD',
        short_name: 'Horarios',
        description: 'Horarios UTJ-CCD',
        theme_color: '#863bff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp',
          },
          {
            src: '/pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
