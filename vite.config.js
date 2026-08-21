import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'ThirtyOne Lab Catalog',
        short_name: 'ThirtyOneLab',
        theme_color: '#BA122B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'Image/Favicon/PWA.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Image/Favicon/PWA.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      }
    })
  ],
  base: process.env.CF_PAGES ? '/' : '/thirtyonelab.catalog_v3/',
  root: 'src',
  envDir: '../',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/about.html'),
        contact: resolve(__dirname, 'src/contact.html'),
        admin: resolve(__dirname, 'src/admin/index.html'),
      },
    },
  },
});
