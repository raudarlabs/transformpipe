/* Captures the screenshots the /docs page shows, from the app itself.
 *
 *   npm run docs:shots                    against http://127.0.0.1:5180
 *   npm run docs:shots -- --host https://transformpipe.com
 *
 * Every shot is taken twice, light and dark, because a dark screenshot on a light page reads as
 * somebody else's product. The files land in public/docs/<name>-<theme>.png and the page picks the
 * one matching the reader's theme.
 *
 * It drives an installed Chrome (puppeteer-core, no bundled browser) through the real app: it
 * uploads the fixtures in scripts/fixtures, opens the tabs, and ticks the boxes. Nothing here is a
 * mock-up — if a screenshot looks wrong, the app looks wrong.
 */
import { randomBytes, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import puppeteer from 'puppeteer-core';

config({ path: ['.env.local', '.env'], quiet: true });

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);

  return index === -1 ? fallback : args[index + 1];
};

const HOST = flag('host', 'http://127.0.0.1:5180');
const OUT = resolve('public/docs');
const FIXTURES = resolve('scripts/fixtures');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));

if (!chrome) {
  console.error(
    'No Chrome found. Set CHROME_PATH to the executable and run this again.'
  );
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

const fixtures = readdirSync(FIXTURES)
  .filter((name) => name.endsWith('.md'))
  .map((name) => join(FIXTURES, name));

/** Waits for whatever the click set off to settle, without guessing at a selector. */
const settle = (page, ms = 450) =>
  new Promise((done) => setTimeout(done, ms));

async function clickText(page, selector, text) {
  const handles = await page.$$(selector);

  for (const handle of handles) {
    /*
     * Any of the three names a control can have, not the first one that is non-empty.
     *
     * The header's navigation became icons with `aria-label` when the search box took the room its
     * words were using, so this script — which looked at `textContent` — had been failing at the
     * History step ever since, and the pictures on /docs are older than the screens they show. The
     * first fix was still wrong: History carries a badge with the number of documents, so its text
     * is "3" and a fallback chain never reaches the label.
     */
    const names = await handle.evaluate((node) => [
      node.textContent?.trim() ?? '',
      node.getAttribute('aria-label') ?? '',
      node.getAttribute('title') ?? '',
    ]);

    if (names.some((name) => name.includes(text))) {
      await handle.click();
      return true;
    }
  }

  const seen = await page
    .$$eval(selector, (nodes) =>
      nodes.map((n) => n.getAttribute('aria-label') || n.textContent?.trim() || '?')
    )
    .catch(() => []);

  /* What it did see, because "not found" on its own sends somebody to read the app rather than
   * the one line of markup that changed. */
  throw new Error(`No ${selector} reading "${text}" — saw: ${seen.join(' | ')}`);
}

/*
 * Toasts sit over the header, which is where the navigation is. They close themselves after a few
 * seconds; clicking them closed is faster and does not depend on how long that is.
 */
async function hushToasts(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const toasts = await page.$$('[data-sonner-toast]');

    if (toasts.length === 0) {
      return;
    }

    for (const toast of toasts) {
      await toast.evaluate((node) => {
        const close =
          node.querySelector('button[aria-label="Close"]') ??
          node.querySelector('button[data-close-button]');

        close?.click();
      });
    }

    await settle(page, 200);
  }
}

/**
 * One shot. `until` names an element the picture should end just below, so a short list does not
 * ship with half a screen of empty page under it.
 */
async function shoot(page, name, theme, until) {
  const file = join(OUT, `${name}-${theme}.png`);

  await hushToasts(page);

  const height = until
    ? await page.$eval(until, (node) => node.getBoundingClientRect().bottom)
    : null;

  await page.screenshot({
    path: file,
    ...(height
      ? { clip: { x: 0, y: 0, width: 1280, height: Math.ceil(height) + 28 } }
      : {}),
  });

  console.log(`  ${name}-${theme}.png`);
}

/*
 * The one shot that is not for the documentation: a phone-shaped picture of the converter, for the
 * install dialog.
 *
 * A manifest with only wide screenshots gets a line of text on Android instead of a picture, and
 * the app is installable now. It is taken here rather than by a script of its own because this is
 * where a browser is already driving the real app, and a second script would be a second thing to
 * remember to run.
 */
async function pwaShot(browser) {
  console.log('pwa:');

  const page = await browser.newPage();

  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(HOST, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('m2h.theme', 'dark');
    /* Answered, so the banner is not the picture. Only necessary — the honest answer for a
     * screenshot, and the one that turns analytics off. */
    localStorage.setItem(
      'm2h.consent',
      JSON.stringify({ version: 1, analytics: false, at: Date.now() })
    );
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await settle(page, 700);
  await hushToasts(page);

  const file = join(OUT, 'pwa-narrow.png');

  await page.screenshot({ path: file });
  await page.close();

  console.log('  pwa-narrow.png');
}

async function capture(browser, theme) {
  console.log(`${theme}:`);

  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  // Land on the app once so the origin exists, then say which theme and which history to start from.
  await page.goto(HOST, { waitUntil: 'networkidle2' });
  await page.evaluate((value) => {
    localStorage.setItem('m2h.theme', value);
    localStorage.removeItem('md2html.history.v1');
    /* Answered, so the cookie banner is not in ten screenshots of a converter. */
    localStorage.setItem(
      'm2h.consent',
      JSON.stringify({ version: 1, analytics: false, at: Date.now() })
    );
  }, theme);
  await page.reload({ waitUntil: 'networkidle2' });
  await settle(page);

  await shoot(page, 'converter', theme);

  // Upload the fixtures one at a time so the history has rows; the last one stays open.
  for (const fixture of fixtures) {
    const input = await page.$('input[type="file"]');

    await input.uploadFile(fixture);
    await settle(page, 700);

    if (fixture !== fixtures.at(-1)) {
      await page.click('button[aria-label="New file"]');
      await settle(page);
    }
  }

  await shoot(page, 'preview', theme);

  await clickText(page, 'button[role="tab"]', 'HTML source');
  await settle(page);
  await shoot(page, 'source', theme);

  await clickText(page, 'nav button', 'History');
  await settle(page, 700);
  await shoot(page, 'history', theme, 'table');

  const boxes = await page.$$('td button[role="checkbox"], td [role="checkbox"]');

  for (const box of boxes.slice(0, 2)) {
    await box.click();
    await settle(page, 150);
  }

  await settle(page, 400);
  await shoot(page, 'selection', theme, 'table');

  await page.close();
}

/** One element, with room around it — a dialog or a tab, not the whole screen it sits on. */
async function shootElement(page, name, theme, selector, pad = 24) {
  const file = join(OUT, `${name}-${theme}.png`);

  await hushToasts(page);

  const box = await page.$eval(selector, (node) => {
    const rect = node.getBoundingClientRect();

    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });

  await page.screenshot({
    path: file,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });

  console.log(`  ${name}-${theme}.png`);
}

/*
 * The sharing shots: the Share dialog, the Views tab, and the page a link with a password opens on.
 *
 * The first two need somebody signed in, and a script cannot sign in — the account lives at the
 * authentication provider. So for these two the app's own API answers are fixtures: every /api
 * request is intercepted and answered with one document, its share and its opens, in the shapes
 * the server sends. Everything on the screen is still the app drawing them; only the account is a
 * stand-in. The password page needs nobody, and is the real route on a row made for the purpose.
 */
const SAMPLE_ID = '00000000-0000-4000-8000-000000000001';
const SAMPLE_MARKDOWN = `# Q3 launch plan

We are moving billing from Stripe to Paddle before the pricing change on 14 October.

## Owners

- Anna leads the migration and signs off each phase.
- Marco writes the customer email, which goes out on 3 October.
`;

function sampleAnswer(url) {
  const now = Date.now();
  const at = (minutesAgo) => new Date(now - minutesAgo * 60_000).toISOString();
  const document = {
    id: SAMPLE_ID,
    name: 'q3-launch-plan.md',
    kind: 'markdown-to-html',
    size: SAMPLE_MARKDOWN.length,
    stats: { words: 36, headings: 2, tables: 0 },
    created_at: at(60 * 26),
  };

  switch (url.pathname) {
    case '/api/auth/get-session':
      return {
        user: { id: 'sample', name: 'Alex', email: 'alex@example.com', image: null, emailVerified: true },
      };
    case '/api/documents':
      return { documents: [document] };
    case `/api/documents/${SAMPLE_ID}`:
      return { document: { ...document, markdown: SAMPLE_MARKDOWN } };
    case `/api/documents/${SAMPLE_ID}/share`:
      return {
        mode: 'link',
        token: 'q7XkP2vNcR9wLmT4hB8sJd',
        emails: [],
        expiresAt: new Date(now + 7 * 24 * 3_600_000).toISOString(),
        views: 12,
        lastViewedAt: at(38),
        hasPassword: true,
      };
    case `/api/documents/${SAMPLE_ID}/views`:
      return {
        mode: 'people',
        views: 5,
        lastViewedAt: at(12),
        limit: 200,
        you: 'alex@example.com',
        people: [
          { email: 'anna@example.com', opens: 3, lastAt: at(12) },
          { email: 'marco@example.com', opens: 0, lastAt: null },
        ],
        events: [
          { at: at(12), via: 'page', who: 'anna@example.com' },
          { at: at(95), via: 'app', who: 'anna@example.com' },
          { at: at(180), via: 'page', who: 'alex@example.com' },
          { at: at(60 * 24 + 20), via: 'page', who: 'anna@example.com' },
          { at: at(60 * 24 + 65), via: 'page', who: 'alex@example.com' },
        ],
      };
    case '/api/usage':
      return {
        bytes: SAMPLE_MARKDOWN.length,
        documents: 1,
        limits: { bytes: 100 * 1024 * 1024, documents: 500, documentBytes: 4 * 1024 * 1024 },
      };
    case '/api/shared-with-me':
      return { documents: [] };
    default:
      // Everything else a signed-in app asks for — keys, grants, the usage counter — is empty.
      return {};
  }
}

async function sharingShots(browser, theme) {
  console.log(`sharing, ${theme}:`);

  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = new URL(request.url());

    if (!url.pathname.startsWith('/api/')) {
      request.continue();

      return;
    }

    request.respond({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sampleAnswer(url)),
    });
  });

  await page.goto(HOST, { waitUntil: 'networkidle2' });
  await page.evaluate((value) => {
    localStorage.setItem('m2h.theme', value);
    localStorage.removeItem('md2html.history.v1');
    localStorage.setItem(
      'm2h.consent',
      JSON.stringify({ version: 1, analytics: false, at: Date.now() })
    );
  }, theme);
  await page.goto(`${HOST}/?doc=${SAMPLE_ID}`, { waitUntil: 'networkidle2' });
  await settle(page, 900);

  await clickText(page, 'button', 'Share');
  await page.waitForSelector('[role="dialog"]');
  await settle(page, 700);
  await shootElement(page, 'share-dialog', theme, '[role="dialog"]');

  await page.keyboard.press('Escape');
  await settle(page, 500);
  await clickText(page, 'button[role="tab"]', 'Views');
  await settle(page, 900);
  await shootElement(page, 'views-tab', theme, '[role="tabpanel"][data-state="active"]');

  await page.close();
}

/** The form a reader meets, from the real route, on a row that exists for the length of one shot. */
async function passwordShot(browser, theme) {
  if (!process.env.DATABASE_URL) {
    console.log('  share-password: skipped, no DATABASE_URL to make a protected link in');

    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const token = randomBytes(16).toString('base64url');
  const salt = randomBytes(16);
  const key = scryptSync('a sample password', salt, 32, { N: 16_384, r: 8, p: 1 });
  const hash = `scrypt$16384$8$1$${salt.toString('base64url')}$${key.toString('base64url')}`;
  const [row] = await sql`
    insert into m2h_document (user_id, name, size, markdown, stats, share_mode, share_token, share_password_hash)
    values (${randomBytes(16).toString('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/, '$1-$2-$3-$4-$5')},
            'q3-launch-plan.md', ${SAMPLE_MARKDOWN.length}, ${SAMPLE_MARKDOWN}, '{}'::jsonb, 'link', ${token}, ${hash})
    returning id
  `;

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
    await page.goto(`${HOST}/s/${token}`, { waitUntil: 'networkidle2' });
    await settle(page, 400);
    await shootElement(page, 'share-password', theme, 'form', 48);
    await page.close();
  } finally {
    await sql`delete from m2h_document where id = ${row.id}`;
  }
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--force-color-profile=srgb', '--hide-scrollbars'],
});

/* `--only pwa` takes the one the manifest needs and skips the documentation's five, which need the
 * app signed in with a history behind it. */
const only = flag('only', '');

try {
  if (only === 'sharing') {
    for (const theme of ['dark', 'light']) {
      await sharingShots(browser, theme);
      await passwordShot(browser, theme);
    }
  } else {
    if (only !== 'pwa') {
      for (const theme of ['dark', 'light']) {
        await capture(browser, theme);
        await sharingShots(browser, theme);
        await passwordShot(browser, theme);
      }
    }

    await pwaShot(browser);
  }
} finally {
  await browser.close();
}

console.log(`\nWritten to ${OUT}`);
