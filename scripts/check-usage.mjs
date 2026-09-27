/* Checks the first-party counter's rules, without a server or a database.
 *
 *   npm run usage:check
 *
 * The counter's whole promise is about what it refuses — an address, a free-form value, a count
 * from somebody else's page — so this asks the functions that decide exactly that, with the
 * inputs somebody would actually send. It imports the TypeScript directly: Node strips the types
 * itself (22.18 and later), and the hook below lets a `.js` specifier find its `.ts` file, which is
 * the one thing the server's import style asks of a runtime that is not a bundler.
 *
 * Also checks db/radar-readonly.sql for the two mistakes that would quietly undo it: a grant on
 * anything outside the `radar` schema, and a view that runs with the reader's rights.
 */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && specifier.endsWith('.js')) {
        return next(`${specifier.slice(0, -3)}.ts`, context);
      }

      if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
        return next(`${specifier}.ts`, context);
      }

      throw error;
    }
  },
});

const shared = await import('../shared/usage.ts');
const server = await import('../server/usage.ts');
const { LOCALES } = await import('../src/lib/i18n/locales.ts');
const { STATIC_PAGES } = await import('../src/lib/pages.ts');
const { CONVERSIONS } = await import('../shared/conversions.ts');

let passed = 0;
let failed = 0;

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);

  if (ok) {
    passed += 1;
  } else {
    failed += 1;
    console.log(`  FAIL ${name}\n       got      ${JSON.stringify(actual)}\n       expected ${JSON.stringify(expected)}`);
  }
}

/* ---------------------------------------------------------------------------------- sources */

const SELF = 'transformpipe.com';

for (const [referrer, source] of [
  ['', 'direct'],
  ['https://www.producthunt.com/posts/transformpipe', 'producthunt'],
  ['https://producthunt.com/', 'producthunt'],
  ['https://evilproducthunt.com/', 'other'],
  ['https://news.ycombinator.com/item?id=1', 'hackernews'],
  ['https://www.google.com/', 'google'],
  ['https://www.google.co.uk/', 'google'],
  ['https://google.de/', 'google'],
  ['https://notgoogle.com/', 'other'],
  ['https://gemini.google.com/app', 'gemini'],
  ['https://accounts.google.com/o/oauth2', 'internal'],
  ['https://transformpipe.com/blog', 'internal'],
  ['https://www.transformpipe.com/', 'internal'],
  ['https://www.bing.com/search?q=x', 'bing'],
  ['https://chatgpt.com/', 'chatgpt'],
  ['https://claude.ai/chat/abc', 'claude'],
  ['https://www.perplexity.ai/', 'perplexity'],
  ['https://github.com/raudarlabs/transformpipe', 'github'],
  ['https://old.reddit.com/r/markdown', 'reddit'],
  ['https://t.co/abc', 'x'],
  ['https://www.linkedin.com/feed/', 'linkedin'],
  ['https://yandex.ru/search', 'yandex'],
  ['https://wiki.internal.example.com/secret-project', 'other'],
  ['android-app://com.google.android.gm/', 'other'],
  ['not a url', 'other'],
]) {
  check(`sourceOf(${referrer || "''"})`, shared.sourceOf(referrer, SELF), source);
}

for (const [search, campaign] of [
  ['', ''],
  ['?utm_source=ProductHunt', 'producthunt'],
  ['?ref=producthunt', 'producthunt'],
  ['?utm_source=newsletter&ref=producthunt', 'newsletter'],
  ['?utm_source=a%20b', ''],
  ['?utm_source=a/b', ''],
  [`?utm_source=${'x'.repeat(33)}`, ''],
  [`?utm_source=${'x'.repeat(32)}`, 'x'.repeat(32)],
  ['?utm_source=%3Cscript%3E', ''],
  ['?doc=123', ''],
]) {
  check(`campaignOf(${search || "''"})`, shared.campaignOf(search), campaign);
}

/* ------------------------------------------------------------------------------------ pages */

const STATIC_PATHS = STATIC_PAGES.map((page) => page.path);
const key = (path) => shared.pageKeyFor(path, STATIC_PATHS);

for (const [path, expected] of [
  ['/', '/'],
  ['/epub-to-markdown', '/epub-to-markdown'],
  ['/epub-to-markdown/', '/epub-to-markdown'],
  ['/privacy', '/privacy'],
  ['/agents/claude', '/agents/claude'],
  ['/docs', '/docs'],
  ['/blog', '/blog'],
  ['/blog/markdown-escaping', '/blog/markdown-escaping'],
  ['/blog/Markdown_Escaping', 'other'],
  ['/blog/a/b', 'other'],
  [`/blog/${'a'.repeat(101)}`, 'other'],
  ['/changelog/markdown-to-word', '/changelog/markdown-to-word'],
  ['/s/abc123', '/open'],
  ['/open/abc123', '/open'],
  ['/wp-admin', 'other'],
  ['/.env', 'other'],
]) {
  check(`pageKeyFor(${path})`, key(path), expected);
}

for (const one of CONVERSIONS) {
  check(`conversion ${one.id} is its own key`, key(one.path), one.path);
}

for (const path of STATIC_PATHS) {
  check(`page ${path} is its own key`, key(path), path);
}

check('the counter speaks the five languages', [...shared.USAGE_LANGS], [...LOCALES]);

/* ----------------------------------------------------------------------------------- bodies */

const view = { e: 'view', k: '/epub-to-markdown', l: 'en', s: 'producthunt', u: 'producthunt' };
const parse = (body) => shared.parseTally(body, STATIC_PATHS);

check('a view is counted', parse(view), {
  event: 'view',
  key: '/epub-to-markdown',
  lang: 'en',
  source: 'producthunt',
  campaign: 'producthunt',
});
check('no campaign is an empty one', parse({ ...view, u: undefined })?.campaign, '');
check('a conversion by id', parse({ e: 'convert', k: 'word-to-markdown', l: 'de', s: 'direct' })?.key, 'word-to-markdown');
check('a download by format', parse({ e: 'download', k: 'docx', l: 'fr', s: 'google' })?.key, 'docx');
check('a share by kind', parse({ e: 'share', k: 'link', l: 'it', s: 'direct' })?.key, 'link');

for (const [name, body] of [
  ['an unknown page', { ...view, k: '/wp-admin' }],
  ['a page that is not already normalised', { ...view, k: '/epub-to-markdown/' }],
  ['an unknown conversion', { ...view, e: 'convert', k: 'pdf-to-markdown' }],
  ['a file name as a key', { ...view, e: 'download', k: 'report-q3.docx' }],
  ['an email as a share', { ...view, e: 'share', k: 'someone@example.com' }],
  ['a language we do not have', { ...view, l: 'ru' }],
  ['a host as a source', { ...view, s: 'intranet.example.com' }],
  ['a campaign with spaces', { ...view, u: 'a b' }],
  ['a server event from a browser', { ...view, e: 'mcp', k: 'tp_help' }],
  ['a number for a key', { ...view, k: 42 }],
  ['an array', [view]],
  ['nothing', null],
]) {
  check(`refuses ${name}`, parse(body), null);
}

const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const read = (body, headers = {}) =>
  server.readTally(typeof body === 'string' ? body : JSON.stringify(body), {
    userAgent: CHROME,
    site: 'same-origin',
    ...headers,
  });

check('a browser on our page is counted', read(view)?.key, '/epub-to-markdown');
check('no Sec-Fetch-Site is still counted', read(view, { site: undefined })?.key, '/epub-to-markdown');
check('a count from another site is not', read(view, { site: 'cross-site' }), null);
check('a crawler is not', read(view, { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' }), null);
check('Lighthouse is not', read(view, { userAgent: `${CHROME} Chrome-Lighthouse` }), null);
check('headless Chrome is not', read(view, { userAgent: CHROME.replace('Chrome/', 'HeadlessChrome/') }), null);
check('curl is not', read(view, { userAgent: 'curl/8.7.1' }), null);
check('no user agent is not', read(view, { userAgent: '' }), null);
check('a body that is not JSON is not', read('view /epub-to-markdown'), null);
check('a body over the cap is not', read({ ...view, pad: 'x'.repeat(server.TALLY_MAX_BYTES) }), null);

const minute = 60_000 * 29_000_000;
const flood = Array.from({ length: server.TALLY_PER_MINUTE + 1 }, () =>
  server.tooFast('203.0.113.9', minute)
);
check('the limit lets a minute of browsing through', flood.slice(0, -1).every((fast) => !fast), true);
check('and stops the one after', flood.at(-1), true);
check('another address is its own count', server.tooFast('203.0.113.10', minute), false);
check('a new minute starts again', server.tooFast('203.0.113.9', minute + 60_000), false);

for (const [method, path, expected] of [
  ['GET', '/api/v1/documents', 'GET /documents'],
  ['POST', '/api/v1/documents', 'POST /documents'],
  ['GET', '/api/v1/documents/0b6f0c1e-8f7a-4c3e-9a51-4c1f2f6a7b10', 'GET /documents/:id'],
  ['GET', '/api/v1/documents/0b6f0c1e-8f7a-4c3e-9a51-4c1f2f6a7b10.html', 'GET /documents/:id'],
  ['PUT', '/api/v1/documents/abc/share', 'PUT /documents/:id/share'],
  ['GET', '/api/v1/usage', 'GET /usage'],
  ['GET', '/api/v1/nothing-here', 'other'],
  ['OPTIONS', '/api/v1/documents', 'other'],
]) {
  check(`apiRouteKey(${method} ${path})`, server.apiRouteKey(method, path), expected);
}

/* ------------------------------------------------------------------------ fits the columns */

const longest = (values) => Math.max(...values.map((value) => value.length));

check('every event fits its column', longest([...shared.BROWSER_EVENTS, ...shared.SERVER_EVENTS]) <= 16, true);
check('every source fits its column', longest([...shared.SOURCES, 'session', 'oauth', 'key']) <= 16, true);
check('every page key fits its column', longest([...STATIC_PATHS, ...CONVERSIONS.map((one) => one.path), `/changelog/${'a'.repeat(100)}`]) <= 120, true);
check('every API key fits its column', 'DELETE /documents/:id/versions'.length <= 120, true);

/* ---------------------------------------------------------------------------- the radar SQL */

const radar = readFileSync(new URL('../db/radar-readonly.sql', import.meta.url), 'utf8');
const statements = radar.replace(/^\s*--.*$/gm, '');
const granted = [...statements.matchAll(/grant\s+select\s+on\s+([\s\S]*?)\s+to\s+radar_reader/gi)]
  .flatMap((match) => match[1].split(','))
  .map((name) => name.trim());

check('select is granted on radar views only', granted.every((name) => /^radar\.[a-z_]+$/.test(name)), true);
check('and on every radar view', granted.sort(), [...statements.matchAll(/create or replace view (radar\.[a-z_]+)/gi)].map((match) => match[1]).sort());
check('no view runs with the reader’s rights', /security_invoker/i.test(statements), false);
check('no grant on a whole schema of tables', /on\s+all\s+tables/i.test(statements), false);
check('no password is set by running the file', /password/i.test(statements), false);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
