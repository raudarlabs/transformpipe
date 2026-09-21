/* Draws the Chrome Web Store assets out of the extension's own interface.
 *
 *   npm run ext:art        after npm run ext — reads dist-extension/
 *
 * Five screenshots at 1280×800, both promotional tiles — 440×280 and the 1400×560 marquee — and
 * the 128×128 store icon, into brand/store/: every picture the submission form asks for, in one
 * folder.
 *
 * The form is strict about two things and both are load-bearing here: the sizes are exact, and the
 * files must carry no alpha channel. A screenshot is drawn at twice the size and photographed at
 * `deviceScaleFactor: 2` so it is sharp; the tile is drawn at its own size, because 880×280 is not
 * 440×280 and the form measures rather than scales.
 *
 * Not mock-ups. The panel in these pictures is `dist-extension/popup.html` and the side panel is
 * `panel.html`, rendered by the build that is about to be uploaded — so a screenshot that looks
 * wrong means the extension looks wrong, and a change to the design is in the assets on the next
 * run rather than in a design file somebody has to remember to redraw.
 *
 * What is faked is the browser around them, and only that: a `chrome` object with the dozen calls
 * the extension makes, a sample page for it to convert, and `fetch` answering for the account so
 * the signed-in state can be photographed without a real token in the repository. Everything above
 * that line — the conversion, the preview, the words, the theme — is the product's own code.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const CHROME =
  process.env.CHROME_PATH ??
  {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  }[process.platform] ??
  'google-chrome';

const ROOT = resolve('.');
const DIST = join(ROOT, 'dist-extension');
const OUT = join(ROOT, 'brand', 'store');

if (!existsSync(join(DIST, 'manifest.json'))) {
  console.error('dist-extension is not built — run `npm run ext` first.');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

/* The store's own sizes. Chrome takes 1280×800 or 640×400 for screenshots; the bigger one is the
 * one that survives the store's own scaling. */
const SHOT = { width: 1280, height: 800 };
const TILE = { width: 440, height: 280 };
/* Shown when the store features an extension, and the only asset with room for a picture in it. */
const MARQUEE = { width: 1400, height: 560 };

const BRAND = '#14a8af';
const INK = '#f9fafb';
const PAGE = '#0f0e14';

const fontUrl = pathToFileURL(
  join(ROOT, 'public', 'fonts', 'dm-sans-latin-normal.woff2')
).href;

/*
 * The page the extension is photographed converting.
 *
 * Written rather than fetched: a screenshot has to be the same picture every time it is drawn, and
 * a real site is a moving target with somebody else's trademark in it. It carries the furniture a
 * real page has — a navigation bar, a sidebar, a cookie notice, a footer — because the whole point
 * of the first screenshot is that none of it survives into the Markdown.
 */
const SAMPLE_URL = 'https://docs.example.com/guide/webhooks';
const SAMPLE_TITLE = 'Webhooks — Example Docs';
const SAMPLE_HTML = `<!doctype html><html><head><title>${SAMPLE_TITLE}</title></head><body>
<nav><a href="/">Docs</a><a href="/api">API</a><a href="/guide">Guide</a></nav>
<aside><ul><li>Getting started</li><li>Authentication</li><li>Webhooks</li></ul></aside>
<div class="cookie-banner">We use cookies. <button>Accept all</button></div>
<article>
  <h1>Webhooks</h1>
  <p>A webhook is a request we make to an address you own, every time something happens that you
  asked to hear about. It is the opposite of polling: nothing is asked for, and the event arrives
  as it happens.</p>
  <h2>Subscribing</h2>
  <p>Create a subscription with the event you want and the address it should reach. The address has
  to answer <code>200</code> within five seconds, or the delivery is retried.</p>
  <pre><code>curl -X POST https://api.example.com/v1/webhooks \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"event":"document.created","url":"https://your.app/hook"}'</code></pre>
  <h2>What arrives</h2>
  <table>
    <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>id</td><td>string</td><td>The delivery, not the event.</td></tr>
      <tr><td>event</td><td>string</td><td>What happened, as <code>noun.verb</code>.</td></tr>
      <tr><td>created_at</td><td>string</td><td>ISO 8601, in UTC.</td></tr>
    </tbody>
  </table>
  <h2>Retries</h2>
  <p>A delivery that fails is retried five times over the following hour, with the delay doubling
  each time. After that the subscription is marked unhealthy and you are emailed.</p>
  <ul><li>Answer fast, work later.</li><li>Check the signature before you trust a body.</li>
  <li>Expect the same delivery twice — retries are at least once.</li></ul>
</article>
<footer><p>© Example Inc. <a href="/privacy">Privacy</a></p></footer>
</body></html>`;

/*
 * The browser, as much of it as the extension touches.
 *
 * Installed with `evaluateOnNewDocument`, so it is there before the bundle runs — the panel reads
 * storage and queries the tabs in its first effect, and a stub installed after that is a stub that
 * arrived too late.
 */
function browserStub({ signedIn, html, url, title, handoff }) {
  const local = { 'tp.surface': 'popup' };
  const session = {};

  if (signedIn) {
    local['tp.oauth.tokens'] = {
      access: 'shot',
      expires: Date.now() + 86_400_000,
    };
    local['tp.oauth.client'] = { id: 'shot' };
  }

  if (handoff) {
    session['tp.handoff.shot'] = {
      source: { html, url, title, selection: false },
    };
  }

  const area = (backing) => ({
    get: async (key) => {
      if (key === undefined || key === null) {
        return { ...backing };
      }

      const keys = Array.isArray(key) ? key : [key];
      const answer = {};

      for (const one of keys) {
        if (one in backing) {
          answer[one] = backing[one];
        }
      }

      return answer;
    },
    set: async (values) => Object.assign(backing, values),
    remove: async (key) => {
      for (const one of Array.isArray(key) ? key : [key]) {
        delete backing[one];
      }
    },
  });

  const noListeners = { addListener() {}, removeListener() {} };

  globalThis.chrome = {
    storage: {
      local: area(local),
      session: area(session),
      onChanged: noListeners,
    },
    tabs: {
      query: async () => [{ id: 1, url, title, active: true }],
      create: async () => ({ id: 2 }),
      onActivated: noListeners,
      onUpdated: noListeners,
    },
    scripting: {
      executeScript: async () => [
        { result: { html, url, title, selection: false } },
      ],
    },
    permissions: {
      contains: async () => true,
      request: async () => true,
    },
    runtime: {
      getURL: (path) => `${location.origin}/${path}`,
      sendMessage: async () => undefined,
      openOptionsPage: async () => undefined,
      onMessage: noListeners,
      onInstalled: noListeners,
      onStartup: noListeners,
    },
    sidePanel: {
      open: async () => undefined,
      setOptions: async () => undefined,
      setPanelBehavior: async () => undefined,
    },
    action: {
      setPopup: async () => undefined,
      openPopup: async () => undefined,
    },
    contextMenus: {
      create() {},
      removeAll() {},
      onClicked: noListeners,
    },
    identity: {
      getRedirectURL: () => 'https://shot.chromiumapp.org/',
      launchWebAuthFlow: async () => 'https://shot.chromiumapp.org/?code=shot',
    },
  };

  /*
   * The account, answered here rather than reached.
   *
   * Three calls are photographed: who you are, saving, and reading a share back. They answer the
   * way the real API does — `{ document: … }` for a save, a flat object for a share — because the
   * panel reads those shapes, and a stub that answers differently photographs a bug that is not
   * there.
   */
  const SHARE = {
    mode: 'link',
    url: 'https://transformpipe.com/s/iO5c8xXw4vozoxPJ8qYLZw',
    emails: [],
    notified: [],
  };

  const inner = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input, init) => {
    const address = String(
      typeof input === 'string' ? input : (input?.url ?? input)
    );

    if (!address.includes('transformpipe.com')) {
      return inner(input, init);
    }

    const answer = (body) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });

    if (address.includes('/usage')) {
      return answer({ email: 'you@example.com', documents: 3, bytes: 20_000 });
    }

    if (address.includes('/share')) {
      return answer(SHARE);
    }

    return answer({
      document: {
        id: '11111111-2222-3333-4444-555555555555',
        name: 'webhooks.md',
        share: { mode: 'private', url: null },
      },
    });
  };
}

/** dist-extension, over http, because a module script will not load from file://. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
  const file = join(DIST, path === '/' ? 'popup.html' : path.replace(/^\/+/, ''));

  if (!file.startsWith(DIST) || !existsSync(file)) {
    response.writeHead(404).end('no');

    return;
  }

  response.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
  });
  response.end(readFileSync(file));
});

await new Promise((ready) => server.listen(0, '127.0.0.1', ready));

const origin = `http://127.0.0.1:${server.address().port}`;

/*
 * Press the button whose label contains this text, with the mouse.
 *
 * Not `element.click()`: Radix opens a menu on `pointerdown`, which a synthetic click does not
 * send, so the earlier version of this photographed a closed menu and looked like a bug in the
 * extension rather than in the camera.
 */
async function press(page, text) {
  const at = await page.evaluate((needle) => {
    const button = [...document.querySelectorAll('button')].find((one) =>
      one.textContent?.toLowerCase().includes(needle.toLowerCase())
    );

    if (!button) {
      return null;
    }

    const box = button.getBoundingClientRect();

    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }, text);

  if (!at) {
    throw new Error(`no button reading "${text}" on this surface`);
  }

  await page.mouse.click(at.x, at.y);
}

const settle = (ms) => new Promise((done) => setTimeout(done, ms));

/*
 * The five pictures, in the order the store shows them: what it does, where it lives, what comes
 * out, what else it converts, and what an account adds.
 */
const SHOTS = [
  {
    id: '1-page-to-markdown',
    surface: 'popup.html',
    size: { width: 460, height: 660 },
    trim: true,
    caption: 'The page you are on, as Markdown',
    blurb: 'One click. The article, without the navigation, the sidebar or the cookie notice.',
  },
  {
    id: '2-side-panel',
    surface: 'panel.html',
    size: { width: 460, height: 760 },
    caption: 'Or keep it open beside the page',
    blurb: 'The side panel follows you from tab to tab and converts each one as you arrive.',
  },
  {
    id: '3-save-the-page',
    surface: 'popup.html',
    size: { width: 460, height: 700 },
    trim: true,
    caption: 'Save the page as it looks, or as text',
    blurb: 'A self-contained .html file — its own design, its pictures inside it, no requests.',
    act: async (page) => {
      await press(page, 'Download .html');
      await settle(400);
    },
  },
  {
    // Named for what it shows rather than for how many, so the file does not need renaming
    // every time a conversion ships — which is how it came to be called `4-ten-formats` while
    // showing eleven.
    id: '4-formats',
    surface: 'viewer.html?doc=shot',
    size: { width: 1180, height: 780 },
    handoff: true,
    caption: 'Fifteen formats, converted in your browser',
    blurb: 'Word, slides, spreadsheets, HTML, CSV, JSON and more. Nothing is uploaded.',
  },
  {
    id: '5-save-and-share',
    surface: 'popup.html',
    size: { width: 460, height: 660 },
    trim: true,
    caption: 'Save it to your account, share a link',
    blurb: 'Or name the people who may read it. Signed out, the extension never talks to us.',
    act: async (page) => {
      await press(page, 'Share');
      await settle(900);
    },
  },
];

/** The 1280×800 picture: the surface photographed above, on a page with a line about it. */
function composition({ shot, caption, blurb, width, height }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {
  font-family: 'DM Sans';
  src: url('${fontUrl}') format('woff2');
  font-weight: 100 1000;
}
* { box-sizing: border-box; margin: 0; }
body {
  width: ${width}px;
  height: ${height}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.25rem;
  padding: 3.5rem 3rem 0;
  overflow: hidden;
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(20, 168, 175, 0.28), transparent 60%),
    ${PAGE};
  font-family: 'DM Sans', system-ui, sans-serif;
  color: ${INK};
  text-align: center;
}
h1 { font-size: 2.5rem; font-weight: 600; letter-spacing: -0.02em; }
p { max-width: 48rem; font-size: 1.125rem; color: #b9bfcb; }
.frame {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
/*
 * Whole, and scaled to fit. The surfaces are different shapes — a popup as tall as its content, a
 * side panel as tall as a window, a viewer as wide as a tab — and cropping any of them to a common
 * box cuts the buttons off the bottom of the tallest, which is what the first run did.
 */
.frame img {
  display: block;
  max-height: ${height - 250}px;
  max-width: 1040px;
  width: auto;
  height: auto;
}
</style></head><body>
<h1>${caption}</h1>
<p>${blurb}</p>
<div class="frame"><img src="${shot.data}"></div>
</body></html>`;
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});

/* The first surface, kept: the marquee is the same panel beside a sentence rather than under one. */
let hero = '';

for (const one of SHOTS) {
  const page = await browser.newPage();

  await page.setViewport({ ...one.size, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(browserStub, {
    signedIn: true,
    html: SAMPLE_HTML,
    url: SAMPLE_URL,
    title: SAMPLE_TITLE,
    handoff: Boolean(one.handoff),
  });
  await page.goto(`${origin}/${one.surface}`, { waitUntil: 'networkidle0' });
  /* The conversion is asynchronous and the preview renders after it; a second is enough for a
   * document this size and cheap enough not to measure. */
  await settle(1200);

  if (one.trim) {
    /* The popup sizes itself to its content, so the camera does too — otherwise the picture has a
     * strip of empty panel under the buttons that exists nowhere but here. */
    const tall = await page.evaluate(() =>
      Math.ceil(
        document.querySelector('#root > div')?.getBoundingClientRect().height ??
          document.body.scrollHeight
      )
    );

    await page.setViewport({
      width: one.size.width,
      height: Math.min(Math.max(tall, 360), 900),
      deviceScaleFactor: 2,
    });
    await settle(300);
  }

  if (one.act) {
    await one.act(page);
  }

  const surface = await page.screenshot({ encoding: 'base64', type: 'png' });

  if (!hero) {
    hero = `data:image/png;base64,${surface}`;
  }

  await page.close();

  const frame = await browser.newPage();

  await frame.setViewport({ ...SHOT, deviceScaleFactor: 1 });
  await frame.setContent(
    composition({
      shot: { data: `data:image/png;base64,${surface}` },
      caption: one.caption,
      blurb: one.blurb,
      ...SHOT,
    }),
    { waitUntil: 'networkidle0' }
  );
  await frame.screenshot({ path: join(OUT, `${one.id}.png`), type: 'png' });
  await frame.close();

  console.log(`${one.id}.png`);
}

/* The small tile: the mark, the name and the sentence, at the size the store shows it. */
const tile = await browser.newPage();

/* One, not two: the form takes 440×280 and nothing else, and rejects the same picture at 880×560. */
await tile.setViewport({ ...TILE, deviceScaleFactor: 1 });
await tile.setContent(
  `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'DM Sans'; src: url('${fontUrl}') format('woff2'); font-weight: 100 1000; }
* { box-sizing: border-box; margin: 0; }
body {
  width: ${TILE.width}px;
  height: ${TILE.height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background:
    radial-gradient(120% 90% at 100% 0%, rgba(20, 168, 175, 0.35), transparent 62%),
    ${PAGE};
  font-family: 'DM Sans', system-ui, sans-serif;
  color: ${INK};
}
.mark { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 1.5rem; font-weight: 600; }
.mark span { color: ${BRAND}; }
h1 { font-size: 1.5rem; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
p { font-size: 0.9375rem; color: #b9bfcb; }
</style></head><body>
<div class="mark">T<span>&gt;</span>pipe</div>
<h1>Any page, any file,<br>clean Markdown</h1>
<p>In your browser. Offline. No account needed.</p>
</body></html>`,
  { waitUntil: 'networkidle0' }
);
await tile.screenshot({ path: join(OUT, 'tile-440x280.png'), type: 'png' });
await tile.close();

console.log('tile-440x280.png');

/* The marquee: the same words as the tile, with the thing itself beside them. */
const marquee = await browser.newPage();

await marquee.setViewport({ ...MARQUEE, deviceScaleFactor: 1 });
await marquee.setContent(
  `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'DM Sans'; src: url('${fontUrl}') format('woff2'); font-weight: 100 1000; }
* { box-sizing: border-box; margin: 0; }
body {
  width: ${MARQUEE.width}px;
  height: ${MARQUEE.height}px;
  display: flex;
  align-items: center;
  gap: 4rem;
  padding: 0 5rem;
  overflow: hidden;
  background:
    radial-gradient(90% 120% at 85% 0%, rgba(20, 168, 175, 0.32), transparent 60%),
    ${PAGE};
  font-family: 'DM Sans', system-ui, sans-serif;
  color: ${INK};
}
.words { flex: 1; display: flex; flex-direction: column; gap: 0.9rem; }
.mark { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 1.5rem; font-weight: 600; }
.mark span { color: ${BRAND}; }
h1 { font-size: 2.75rem; font-weight: 600; line-height: 1.1; letter-spacing: -0.02em; }
p { max-width: 34ch; font-size: 1.125rem; line-height: 1.5; color: #b9bfcb; }
.shot {
  width: 340px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
  /* Cropped at the top rather than scaled: what a marquee shows is the panel, not all of it. */
  overflow: hidden;
  max-height: ${MARQUEE.height - 80}px;
}
.shot img { display: block; width: 100%; }
</style></head><body>
<div class="words">
  <div class="mark">T<span>&gt;</span>pipe</div>
  <h1>Any page, any file,<br>clean Markdown</h1>
  <p>Convert the page you are on in one click, or a file on your machine. In your browser, offline,
  no account needed.</p>
</div>
<div class="shot"><img src="${hero}"></div>
</body></html>`,
  { waitUntil: 'networkidle0' }
);
await marquee.screenshot({ path: join(OUT, 'marquee-1400x560.png'), type: 'png' });
await marquee.close();

console.log('marquee-1400x560.png');

await browser.close();
server.close();

/*
 * The store icon is the product's own mark at 128, drawn by `npm run icons` from `brand/mark.svg`.
 * Copied here rather than redrawn, and copied at all so that everything the form asks for is in
 * one folder on the day somebody is filling it in.
 */
copyFileSync(join(ROOT, 'public', 'icon-128.png'), join(OUT, 'store-icon-128.png'));

console.log('store-icon-128.png');
