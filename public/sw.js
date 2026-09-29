/*
 * The service worker, and it is deliberately the smallest one that earns its keep.
 *
 * Two things it is for. The app is installable — Chrome asks for a worker with a fetch handler
 * before it offers that — and the conversions genuinely run in the browser, so an installed
 * TransformPipe with no network should still open and still convert. That is the whole promise;
 * anything else it could cache is somebody else's data or a page that changes without us.
 *
 * What it will not do, because a service worker that gets these wrong is worse than none:
 *
 *   - `/api/**` is never touched. An answer about somebody's account has no business in a cache,
 *     and a stale one is a lie with a long tail.
 *   - `/s/**` and `/open/**` are never cached: a shared document can be revoked, and a page that
 *     outlives its revocation is exactly the failure the share dialog promises will not happen.
 *   - HTML is network-first. The bundle's names carry hashes, so a cached page that outlives a
 *     deploy points at files that no longer exist — the white screen every hand-rolled worker
 *     eventually ships. The cache is the fallback, not the source.
 *
 * What it does cache: files under `/assets` whose names carry a build hash, which are safe forever,
 * the fonts and icons, which change about twice a year and are fine slightly stale, and every page
 * that has actually been visited — under its own address, so a deep link opened offline comes back
 * as that page rather than as the home page wearing its URL.
 *
 * Not everything under `/assets` is hashed, and the first version of this worker assumed it was.
 * The stylesheet is `assets/app.css` on every deploy — its name is fixed so that session replays
 * keep their styles (see `vite.config.ts`) — and it was answered from this cache forever. So from
 * the day the worker shipped, a returning visitor got today's markup and scripts with whichever
 * stylesheet they first happened to load: a layout change was a hard refresh away, for everybody,
 * and nobody could tell. An unhashed file under `/assets` now goes to the network first and uses
 * the cache only when there is no network, which keeps the offline promise and not the old file.
 *
 * Every cache name carries VERSION. Bump it and the old one is deleted on the next activation,
 * which is the manual kill switch as well: a worker shipped with a bug is replaced by bumping this
 * and deploying, and `clients.claim()` means it takes over without waiting for every tab to close.
 */
/* v2: clears the tp-assets-v1 cache, which holds a stylesheet from whenever each visitor installed
 * the worker. See "Not everything under /assets is hashed" above. */
const VERSION = 'v2';
const SHELL = `tp-shell-${VERSION}`;
const ASSETS = `tp-assets-${VERSION}`;

/* The page an install opens on, kept so a cold start with no network has something to show. */
const START = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);

      /* One request, and a failure is not fatal: an install that cannot reach the network still
       * produces a worker, and the first successful navigation fills this in. */
      await cache.add(new Request(START, { cache: 'reload' })).catch(() => undefined);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, ASSETS]);

      await Promise.all(
        (await caches.keys())
          .filter((name) => name.startsWith('tp-') && !keep.has(name))
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

/** Everything this worker refuses to have an opinion about. */
function mine(url, request) {
  if (url.origin !== self.location.origin) {
    return false;
  }

  if (request.method !== 'GET') {
    return false;
  }

  return !/^\/(api|s|open|report)(\/|$)/.test(url.pathname);
}

/*
 * A build hash is Vite's eight characters before the extension: `index-CZx6NlDk.js`,
 * `elk-276RUBZZ-CuA1whoD.js`. Decided by the name rather than by a list of exceptions, so the next
 * file somebody gives a fixed name lands on the safe side without anybody remembering this rule.
 */
const contentHashed = (pathname) =>
  /^\/assets\/.+-[A-Za-z0-9_-]{8}\.[a-z0-9]+$/.test(pathname);

/* Not hashed, and fine to serve slightly stale. */
const settled = (pathname) =>
  pathname.startsWith('/fonts/') || /^\/(icon|favicon|apple-touch)/.test(pathname);

/** The network when there is one; this cache when there is not. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      void cache.put(request, response.clone());
    }

    return response;
  } catch (offline) {
    const hit = await cache.match(request);

    if (hit) {
      return hit;
    }

    throw offline;
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!mine(url, event.request)) {
    return;
  }

  /*
   * Unhashed, under /assets: the same URL across deploys, so the cache cannot be trusted to still be
   * the file the page was built with. The host answers `max-age=0, must-revalidate` with an ETag,
   * so going to the network is a 304 and costs a round trip, not a download.
   */
  if (url.pathname.startsWith('/assets/') && !contentHashed(url.pathname)) {
    event.respondWith(networkFirst(event.request, ASSETS));

    return;
  }

  /* Hashed or good-as-hashed: answer from the cache and fill it on the way past. */
  if (contentHashed(url.pathname) || settled(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS);
        const hit = await cache.match(event.request);

        if (hit) {
          return hit;
        }

        const response = await fetch(event.request);

        if (response.ok) {
          void cache.put(event.request, response.clone());
        }

        return response;
      })()
    );

    return;
  }

  if (event.request.mode !== 'navigate') {
    return;
  }

  /* A page: the network decides, and the cache catches somebody who is offline. */
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        if (response.ok) {
          const cache = await caches.open(SHELL);

          /*
           * Under its own address, and under the start URL as well when that is what it is. The
           * first version put every page at the start URL, so an offline visit to the home page
           * could answer with whatever had been read last — the right document in the wrong place.
           */
          void cache.put(event.request, response.clone());

          if (url.pathname === START) {
            void cache.put(START, response.clone());
          }
        }

        return response;
      } catch (offline) {
        /* This page, then any page: the shell boots the app either way and the address decides
         * what it draws, so the start URL is a usable answer for a page never visited. */
        const cached =
          (await caches.match(event.request)) ?? (await caches.match(START));

        if (cached) {
          return cached;
        }

        throw offline;
      }
    })()
  );
});
