import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Writes robots.txt at build time, because the Sitemap line must be an absolute URL and the
 * site's address is only known from VITE_SITE_URL.
 */
function robotsTxt(): Plugin {
  return {
    name: 'robots-txt',
    apply: 'build',
    generateBundle() {
      const site = (process.env.VITE_SITE_URL ?? '').replace(/\/+$/, '');
      const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/'];
      if (site) {
        lines.push('', `Sitemap: ${site}/sitemap.xml`);
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${lines.join('\n')}\n` });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), robotsTxt()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: they change far less often than the app, so they stay cached.
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(id)) {
            return 'react';
          }
          if (
            /node_modules\/(motion|framer-motion|motion-dom|motion-utils|gsap|@gsap|lenis)\//.test(
              id,
            )
          ) {
            return 'animation';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY ?? 'http://localhost:8080',
        changeOrigin: true,
      },
      // Crawlers ask the site for /sitemap.xml; the API generates it.
      '/sitemap.xml': {
        target: process.env.VITE_DEV_API_PROXY ?? 'http://localhost:8080',
        changeOrigin: true,
        rewrite: () => '/api/sitemap.xml',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
  },
});
