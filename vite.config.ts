/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages sirve el proyecto en https://<usuario>.github.io/schoolwork/
const BASE = '/schoolwork/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Solo las letras latinas de las fuentes: el resto de alfabetos no se usa.
        globPatterns: ['**/*.{js,css,html}', '**/*-latin-wght-normal-*.woff2'],
      },
      manifest: {
        name: 'Schoolwork · a estudiar',
        short_name: 'Schoolwork',
        description: 'Apps para estudiar cada unidad de cada asignatura, con mascota y repasos.',
        lang: 'es',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'any',
        background_color: '#e9f5e1',
        theme_color: '#2b8a3e',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
