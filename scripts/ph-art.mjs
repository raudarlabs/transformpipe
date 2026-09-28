/* Draws the Product Hunt gallery out of the running app.
 *
 *   node scripts/ph-art.mjs [base-url]     defaults to https://transformpipe.com
 *
 * Production by default, so the address in the pictures is the real one rather than a dev port.
 * Nothing is written to the site: signed out, every conversion happens in the headless browser.
 *
 * Ten pictures at 1270×760 — the gallery's own size — photographed at twice that, into
 * brand/producthunt/. The same frame as `store-art.mjs` draws for the Chrome Web Store: a caption,
 * a line, and the product under them, on the page's near-black with the brand's light above it.
 *
 * Not mock-ups, the same rule as the store's: each picture is an element of the real app,
 * photographed where it is, so a gallery that looks wrong means the site looks wrong. The one
 * exception is the extension, which is not in this app — its picture is cut from the store's own
 * first screenshot, which `store-art.mjs` draws from the extension's build.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
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
const BASE = process.argv[2] ?? 'https://transformpipe.com';
const OUT = join(ROOT, 'brand', 'producthunt');
const SIZE = { width: 1270, height: 760 };
const INK = '#f9fafb';
const PAGE = '#0f0e14';

const fontUrl = pathToFileURL(join(ROOT, 'public', 'fonts', 'dm-sans-latin-normal.woff2')).href;

mkdirSync(OUT, { recursive: true });

/* The documents the converter is photographed with. Written here, so every run is the same. */
const MARKDOWN = `# Release notes 2.3

Version 2.3 brings **Evernote** imports, a faster preview, and links that can be limited to
named addresses.

## What changed

| Area | Change | Who notices |
| --- | --- | --- |
| Import | Evernote \`.enex\`, tags kept | Anyone leaving Evernote |
| Sharing | Links for named addresses only | Teams |
| Preview | Renders as you type | Everyone |

## Upgrading

\`\`\`bash
npm install transformpipe@2.3
\`\`\`

> Nothing to migrate: saved documents open as they did.

- [x] Evernote import
- [x] Named-address links
- [ ] Markdown to Word, styled
`;

const HTML = `<!doctype html><html><head><title>Onboarding — Acme Wiki</title></head><body>
<h1>Onboarding</h1>
<p>Welcome to the team. This page is the <strong>first week</strong>, in the order it happens.</p>
<h2>Day one</h2>
<ol><li>Collect your laptop from IT.</li><li>Sign in to <a href="https://example.com/sso">single sign-on</a>.</li><li>Join <code>#general</code> and <code>#help</code>.</li></ol>
<h2>Who to ask</h2>
<table><thead><tr><th>Topic</th><th>Person</th></tr></thead>
<tbody><tr><td>Access</td><td>IT desk</td></tr><tr><td>Payroll</td><td>People team</td></tr><tr><td>Your first task</td><td>Your lead</td></tr></tbody></table>
</body></html>`;

const files = {
  md: join(tmpdir(), 'release-notes-2.3.md'),
  md2: join(tmpdir(), 'q3-plan.md'),
  md3: join(tmpdir(), 'migration-spec.md'),
  html: join(tmpdir(), 'onboarding.html'),
};

writeFileSync(files.md, MARKDOWN);
writeFileSync(files.md2, '# Q3 plan\n\n> Ship the importer before the pricing change.\n\n- [x] Move billing\n- [ ] Write the migration guide\n');
writeFileSync(files.md3, '# Migration spec\n\n## Scope\n\nBilling moves to the new provider in two steps.\n');
writeFileSync(files.html, HTML);

const settle = (ms) => new Promise((done) => setTimeout(done, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars'],
});

const page = await browser.newPage();

await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

/* Somebody arriving for the first time sees the cookie question; the gallery is the product. */
async function go(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    [...document.querySelectorAll('button')]
      .find((button) => button.textContent.trim() === 'Only necessary')
      ?.click();
  });
  /* The sticky bar would otherwise sit over the top of whatever is being photographed. */
  await page.addStyleTag({
    content: 'header.sticky, .sticky { position: static !important; } [data-slot="toaster"], [data-sonner-toaster] { display: none !important; }',
  });
  await settle(500);
}

async function upload(file) {
  const input = await page.$('input[type=file]');

  await input.uploadFile(file);
  await settle(2200);
}

/**
 * One element, found by a function run in the page, photographed on its own.
 *
 * Measured in the document, not the viewport, and captured beyond it: a tall element photographed
 * by its on-screen box came out as whatever happened to be on screen. `ratio` caps how tall the
 * picture may be for its width — the gallery's frame is wide, and a column as tall as a document
 * would be shrunk to nothing inside it — by keeping the top, which is where a page says what it is.
 */
async function shoot(find, { pad = 0, ratio = 0.62 } = {}) {
  const handle = await page.evaluateHandle(find);

  if (!handle.asElement()) {
    throw new Error('element not found');
  }

  await handle.evaluate((node) => node.scrollIntoView({ block: 'start' }));
  await settle(800);

  const box = await handle.evaluate((node) => {
    const r = node.getBoundingClientRect();

    return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
  });
  const width = box.width + pad * 2;

  return page.screenshot({
    encoding: 'base64',
    captureBeyondViewport: true,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width,
      height: Math.min(box.height + pad * 2, width * ratio),
    },
  });
}

/* The section around a heading with this text. */
const sectionOf = (text) =>
  new Function(
    `return [...document.querySelectorAll('article h2')].find((h) => h.textContent.includes(${JSON.stringify(
      text
    )}))?.closest('section');`
  );

const shots = [];

// 1 — the pipe
await go('/agents');
shots.push({
  id: '01-the-pipe',
  caption: 'What your assistant writes, kept',
  blurb: 'Markdown in a chat becomes a document in your account — versioned, searchable, shareable.',
  data: await shoot(() => document.querySelector('article header .lg\\:order-first'), { pad: 8, ratio: 1 }),
});

// 2 — connecting, on the Claude page
await go('/agents/claude');
shots.push({
  id: '02-one-click-in-claude',
  caption: 'One click in Claude',
  blurb: 'Listed in Claude’s connector directory. No key, no address to paste — just Connect.',
  data: await shoot(
    () =>
      [...document.querySelectorAll('article h2')]
        .find((h) => h.textContent.includes('three steps'))
        ?.closest('section')
        ?.querySelector('ol'),
    { pad: 8, ratio: 0.5 }
  ),
});

// 3 — what to ask
await go('/agents');
shots.push({
  id: '03-ask-in-plain-words',
  caption: 'Ask in plain words',
  blurb: 'Save it, publish it, find it again, keep the old version. Claude does the rest.',
  data: await shoot(
    () =>
      [...document.querySelectorAll('article h2')]
        .find((h) => h.textContent.includes('What it is for'))
        ?.closest('section')
        ?.querySelector('.grid'),
    { pad: 8, ratio: 0.55 }
  ),
});

// 4 — the converter, with a document in it
await go('/');
await upload(files.md);
shots.push({
  id: '04-markdown-to-a-page',
  caption: 'Markdown in, a finished page out',
  blurb: 'Tables, code, task lists and all — downloaded as one self-contained .html file.',
  data: await shoot(() => document.querySelector('.md-preview-frame'), { ratio: 0.5 }),
});
/* Two more, so the history has more than one row to show. */
await go('/');
await upload(files.md2);
await go('/');
await upload(files.md3);

// 5 — the fifteen
await go('/');
shots.push({
  id: '05-fifteen-conversions',
  caption: 'Fifteen conversions, in your browser',
  blurb: 'Word, PowerPoint, Excel, EPUB, Notion, Confluence, Obsidian and more. Nothing uploaded.',
  data: await shoot(
    () =>
      [...document.querySelectorAll('span, p')]
        .find((el) => el.textContent.trim().toLowerCase() === 'or convert something else')
        ?.closest('div.gap-3'),
    { pad: 8, ratio: 0.5 }
  ),
});

// 6 — HTML to Markdown, the source tab
await go('/html-to-markdown');
await upload(files.html);
/* A real click: the tabs are Radix's, which switch on pointer-down, not on a synthetic click. */
{
  const tabs = await page.$$('[role=tab]');

  for (const tab of tabs) {
    if ((await tab.evaluate((node) => node.textContent.trim())) === 'Markdown') {
      await tab.click();
      break;
    }
  }
}
await settle(700);
shots.push({
  id: '06-any-file-to-markdown',
  caption: 'Any file to clean Markdown',
  blurb: 'A saved page, a Word file, a spreadsheet: headings, lists, links and tables come across.',
  data: await shoot(() => document.querySelector('[role=tabpanel][data-state=active]') ?? document.querySelector('[role=tabpanel]'), { ratio: 0.5 }),
});

// 7 — live preview
await go('/markdown-live-preview');
await page.evaluate((value) => {
  const field = document.querySelector('textarea');

  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}, MARKDOWN);
await settle(900);
shots.push({
  id: '07-live-preview',
  caption: 'Write Markdown, see the page',
  blurb: 'A live preview that renders as you type, then saves or downloads what you wrote.',
  data: await shoot(() => document.querySelector('textarea').closest('.grid'), { ratio: 0.5 }),
});

// 8 — what it can reach
await go('/agents');
shots.push({
  id: '08-your-account',
  caption: 'Your documents, your account',
  blurb: 'The assistant acts as you, on your documents only. It cannot change the account or see keys.',
  data: await shoot(
    () =>
      [...document.querySelectorAll('article h2')]
        .find((h) => h.textContent.includes('can reach'))
        ?.closest('section'),
    { pad: 8, ratio: 0.55 }
  ),
});

// 9 — the history
await go('/history');
shots.push({
  id: '09-one-library',
  caption: 'One library, not forty chats',
  blurb: 'Every document in one list, with search, a chip per format, and versions side by side.',
  data: await shoot(() => document.querySelector('main > *'), { ratio: 0.5 }),
});

// 10 — the extension, cut from the store's first screenshot
{
  const store = readFileSync(join(ROOT, 'brand', 'store', '1-page-to-markdown.png')).toString('base64');
  const cut = await browser.newPage();

  await cut.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await cut.setContent(
    `<body style="margin:0"><img id="s" src="data:image/png;base64,${store}"></body>`,
    { waitUntil: 'load' }
  );

  /* The panel is the one box on that picture with an edge: find it rather than hard-code it. */
  const box = await cut.evaluate(() => {
    const img = document.getElementById('s');
    const canvas = document.createElement('canvas');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const context = canvas.getContext('2d');

    context.drawImage(img, 0, 0);

    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    const lum = (x, y) => {
      const i = (y * width + x) * 4;

      return data[i] + data[i + 1] + data[i + 2];
    };
    let top = height, bottom = 0, left = width, right = 0;

    for (let y = 170; y < height; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (Math.abs(lum(x, y) - lum(x - 1, y)) > 60) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
      }
    }

    return { top, bottom, left, right };
  });

  const data = await cut.screenshot({
    encoding: 'base64',
    clip: {
      x: box.left - 2,
      y: box.top - 2,
      width: box.right - box.left + 4,
      height: Math.min(800, box.bottom + 2) - box.top + 2,
    },
  });

  await cut.close();

  shots.push({
    id: '10-the-extension',
    caption: 'Any web page, as Markdown',
    blurb: 'The Chrome and Firefox extension: the article without the navigation or the cookie banner.',
    data,
  });
}

/* The frame: the store's, at the gallery's size. */
function composition({ caption, blurb, data }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'DM Sans'; src: url('${fontUrl}') format('woff2'); font-weight: 100 1000; }
* { box-sizing: border-box; margin: 0; }
body {
  width: ${SIZE.width}px; height: ${SIZE.height}px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem;
  padding: 2.5rem 3rem; overflow: hidden;
  background: radial-gradient(120% 80% at 50% -10%, rgba(20, 168, 175, 0.28), transparent 60%), ${PAGE};
  font-family: 'DM Sans', system-ui, sans-serif; color: ${INK}; text-align: center;
}
h1 { font-size: 2.6rem; font-weight: 600; letter-spacing: -0.02em; }
p { max-width: 50rem; font-size: 1.15rem; color: #b9bfcb; margin-top: -0.5rem; }
.frame {
  margin-top: 0.5rem;
  border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); overflow: hidden;
  background: ${PAGE};
}
.frame img { display: block; max-height: ${SIZE.height - 250}px; max-width: 1110px; width: auto; height: auto; }
</style></head><body>
<h1>${caption}</h1>
<p>${blurb}</p>
<div class="frame"><img src="data:image/png;base64,${data}"></div>
</body></html>`;
}

const frame = await browser.newPage();

await frame.setViewport({ ...SIZE, deviceScaleFactor: 2 });

for (const one of shots) {
  /* `load`, not `networkidle0`: the picture is a data URL of several megabytes and there is no
   * network to go idle; waiting for it is waiting for a timeout. */
  await frame.setContent(composition(one), { waitUntil: 'load' });
  await frame.evaluate(() => document.fonts.ready);
  await frame.screenshot({ path: join(OUT, `${one.id}.png`), type: 'png' });
  console.log(`${one.id}.png`);
}

await browser.close();
