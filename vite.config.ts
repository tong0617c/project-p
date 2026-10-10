import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { pagesBase } from './scripts/pages-base.mjs';
const base = pagesBase();
export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    base,
    scope: base,
    registerType: 'autoUpdate',
    manifest: {
      id: base,
      name: 'Project P · 小小日常', short_name: '小小日常', lang: 'zh-CN',
      theme_color: '#536451', background_color: '#f7f2e8', display: 'standalone',
      start_url: base, scope: base,
      icons: [
        { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      cacheId: `project-p-${base.replace(/[^a-zA-Z0-9]/g, '-')}`,
      navigateFallback: `${base}index.html`,
      globPatterns: ['**/*.{js,css,html,svg,png}'],
      cleanupOutdatedCaches: true,
    },
  })],
});
