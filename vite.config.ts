import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

/** GitHub Pages project site: https://USERNAME.github.io/To-Do-List/ */
const base = process.env.VITE_BASE_PATH ?? '/To-Do-List/'
const baseWithSlash = base.endsWith('/') ? base : `${base}/`
const baseNoSlash = baseWithSlash.replace(/\/$/, '')
/** Navigation fallback must match the deployed subpath; relative paths break on some mobile browsers. */
const navigateFallback = `${baseWithSlash}index.html`

export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      // Activate new SW without waiting for a manual prompt; refresh still
      // needed once to claim clients — pull-to-refresh / focus check handles that.
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: baseWithSlash,
        name: 'روزنو',
        short_name: 'روزنو',
        description: 'مدیریت کار روی همین دستگاه',
        lang: 'fa',
        dir: 'rtl',
        start_url: baseWithSlash,
        scope: baseWithSlash,
        display: 'standalone',
        background_color: '#eaf3ee',
        theme_color: '#1a7a4c',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback,
        navigateFallbackAllowlist: [new RegExp(`^${baseNoSlash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$)`)],
        globPatterns: ['**/*.{js,css,html,ico,svg,png,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    setupFiles: ['fake-indexeddb/auto', 'tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
  },
})
