import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Leśny Quiz',
        short_name: 'Las Quiz',
        description: 'Edukacyjny quiz dla dzieci o lesie',
        theme_color: '#2d5016',
        background_color: '#a8e6a3',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        lang: 'pl',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],

  server: {
    port: 5173,
    // Proxy do backendu PHP NIE jest już potrzebne - używamy Supabase JS client
    // (zostawiam pustą sekcję serwera dla --host)
  },

  base: '/'
});
