// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import { AstroPWAIntegration as AstroPWA } from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://tu-web-oficial.com',
  integrations: [ 
    react(), 
    sitemap(),
    AstroPWA({ // 👈 Configuración de la PWA
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mi Aplicación con Astro',
        short_name: 'AstroPWA',
        description: 'Proyecto veloz con Astro, React y Tailwind',
        theme_color: '#ffffff',
        display: 'standalone', // Simula una app nativa eliminando las barras del navegador
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});