import path from 'node:path';
import { defineConfig } from 'vitest/config';

/*
 * Unit tests: pure functions, no server, no database, no browser.
 *
 * Its own file rather than a `test` block in vite.config.ts, which brings the blog plugin, SVGR and
 * the rest of the app's build — none of which a test of a function needs, and all of which it
 * would wait for. The scripts in `scripts/check-*.mjs` remain what exercises a running server.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
