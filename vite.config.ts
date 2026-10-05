import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { apiDevServer } from './server/vite-plugin-api';
import { blogIndex } from './vite-plugin-blog';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), apiDevServer(), blogIndex()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The converter the function also imports; one implementation, two runtimes.
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  /*
   * One Node-ism, replaced rather than shimmed.
   *
   * node-html-markdown guards two timing calls with `if (process.env.LOG_PERF)`, and in a browser
   * there is no `process` at all — so the HTML converter threw "process is not defined" the first
   * time anything used it, and the app reported it as a file it could not read. Defining the one
   * expression turns the branch into `if (false)`, which then disappears. A global `process` shim
   * would have covered this and hidden the next one.
   */
  define: {
    'process.env.LOG_PERF': 'false',
  },
  /*
   * The stylesheet keeps its name across deployments; everything else keeps its hash.
   *
   * A hashed name exists so a new build cannot be served an old file out of a cache. The host
   * already answers `max-age=0, must-revalidate` for everything under /assets, so on this site the
   * hash was buying nothing — and it was costing something. A session recorder stores the page's
   * markup and fetches the stylesheet from us when somebody plays the session back; deploy twice
   * and `index-CuR8xdKN.css` is gone, so every recording made before that deploy replays as
   * unstyled markup and reads like the site was broken for that visitor.
   *
   * So: one stable name for the one file a replay needs. Anything that caches /assets for long
   * has to treat this file differently, or a visitor with yesterday's CSS and today's markup is the
   * exact failure the hash was there to prevent. Two days after this was written the service worker
   * did cache /assets forever, and did exactly that to every returning visitor until 29 September;
   * `public/sw.js` now decides by whether a name carries a hash, and sends this one to the network.
   */
  build: {
    rollupOptions: {
      /*
       * Two entries: the app, and the one script a shared page runs to draw its diagrams. The
       * second keeps a fixed name, because the server writes it into every shared page and has no
       * manifest to look a hash up in; the chunks it imports are hashed like everything else.
       */
      /* The client build only: the prerenderer's SSR build names its own entry on the command line. */
      ...(isSsrBuild
        ? {}
        : {
            input: {
              index: path.resolve(__dirname, 'index.html'),
              'share-diagrams': path.resolve(__dirname, 'src/share-diagrams.ts'),
            },
          }),
      output: {
        ...(isSsrBuild
          ? {}
          : {
              entryFileNames: (chunk: { name: string }) =>
                chunk.name === 'share-diagrams' ? 'share/diagrams.js' : 'assets/[name]-[hash].js',
            }),
        assetFileNames: (asset) => {
          const names = asset.names ?? (asset.name ? [asset.name] : []);

          return names.some((name) => name.endsWith('.css'))
            ? 'assets/app.css'
            : 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    port: 5180,
    host: '127.0.0.1',
  },
}));
