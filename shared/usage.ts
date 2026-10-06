import { CONVERSIONS } from './conversions.js';

/*
 * The first-party counter: what it counts, and the only shapes it will accept.
 *
 * Google Analytics sees almost nobody here — consent is denied until somebody says yes, and most
 * people never answer the banner — so a funnel read from it is a funnel of thirteen people. This
 * counts the same few things on our own server instead, as daily totals and nothing else: a row is
 * (day, event, key, language, source, campaign) and a number. No cookie, no id in storage, no
 * address, no user agent, and nothing about a document except which conversion or format it was.
 *
 * Shared because both halves need the same answers. The browser works out the key and the source;
 * the server refuses anything that is not already in the shape the browser would have produced, so
 * a hand-written POST can inflate a number but cannot add a column value nobody planned for. Every
 * field below is either a fixed list or a short pattern, which is what keeps the table small.
 */

/** What the browser reports. `visit` is a page load that arrived from somewhere else. */
export const BROWSER_EVENTS = [
  'visit',
  'view',
  'convert',
  'download',
  'save',
  'share',
  'nudge',
] as const;

/**
 * What the server counts on its own, where no browser is involved.
 *
 * `oauth` is a connection being made, one step at a time — see `OAUTH_STEPS` — with the assistant
 * as the source, so a funnel shows where people stop between asking to connect and connecting.
 */
export const SERVER_EVENTS = ['mcp', 'api', 'oauth'] as const;

/** The steps of a connection, in order. `deny` is the consent page's Cancel. */
export const OAUTH_STEPS = ['start', 'signin', 'consent', 'approve', 'deny', 'token'] as const;

export type BrowserEvent = (typeof BROWSER_EVENTS)[number];
export type ServerEvent = (typeof SERVER_EVENTS)[number];
export type UsageEvent = BrowserEvent | ServerEvent;

/** The five languages, written out: `shared` does not import from the app. Checked against
 * `src/lib/i18n/locales.ts` by `npm run usage:check`. */
export const USAGE_LANGS = ['en', 'de', 'fr', 'es', 'it'] as const;

/** Every format a download can be. Printing is not a download and is not counted. */
export const DOWNLOAD_FORMATS = ['md', 'html', 'txt', 'docx', 'obsidian'] as const;

/*
 * The note in the converter's corner that points at the assistants: which one it showed, and what
 * became of it — shown, followed, or closed. `variant:action`, from these two lists only.
 */
export const NUDGE_VARIANTS = ['assistants', 'obsidian'] as const;
export const NUDGE_ACTIONS = ['shown', 'click', 'dismiss'] as const;

/** `link` is a public link turned on; `people` is an address added to a document. */
export const SHARE_KINDS = ['link', 'people'] as const;

/*
 * Where a visit came from, as a site's name and never as an address.
 *
 * A fixed list rather than the referring host, because a host is unbounded and occasionally says
 * more than it should — a private wiki, an intranet, somebody's own domain. Anything not named here
 * is `other`, and that is the whole of what is kept about it.
 */
export const SOURCES = [
  'direct',
  'internal',
  'producthunt',
  'hackernews',
  'google',
  'bing',
  'duckduckgo',
  'yandex',
  'ecosia',
  'brave',
  'chatgpt',
  'claude',
  'perplexity',
  'gemini',
  'copilot',
  'github',
  'reddit',
  'x',
  'linkedin',
  'facebook',
  'youtube',
  'stackoverflow',
  'devto',
  'medium',
  'other',
] as const;

export type Source = (typeof SOURCES)[number];

/** Order matters where one domain sits inside another: Gemini lives under google.com. */
const SOURCE_DOMAINS: Array<[Source, string[]]> = [
  ['producthunt', ['producthunt.com']],
  ['hackernews', ['news.ycombinator.com', 'hn.algolia.com']],
  ['gemini', ['gemini.google.com', 'bard.google.com']],
  ['chatgpt', ['chatgpt.com', 'chat.openai.com']],
  ['claude', ['claude.ai']],
  ['perplexity', ['perplexity.ai']],
  ['copilot', ['copilot.microsoft.com']],
  ['bing', ['bing.com']],
  ['duckduckgo', ['duckduckgo.com']],
  ['yandex', ['ya.ru']],
  ['ecosia', ['ecosia.org']],
  ['brave', ['search.brave.com']],
  ['github', ['github.com', 'github.io']],
  ['reddit', ['reddit.com', 'redd.it']],
  ['x', ['x.com', 'twitter.com', 't.co']],
  ['linkedin', ['linkedin.com', 'lnkd.in']],
  ['facebook', ['facebook.com', 'fb.com']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['stackoverflow', ['stackoverflow.com', 'stackexchange.com']],
  ['devto', ['dev.to']],
  ['medium', ['medium.com']],
];

const within = (host: string, domain: string) =>
  host === domain || host.endsWith(`.${domain}`);

/**
 * The bucket a referrer falls in.
 *
 * `internal` is our own site, and the Google sign-in page on its way back: that round trip lands
 * with accounts.google.com as the referrer, and calling it a search would credit Google with every
 * sign-in.
 */
export function sourceOf(referrer: string, selfHost: string): Source {
  if (!referrer) {
    return 'direct';
  }

  let host: string;

  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'other';
  }

  if (!host) {
    return 'other';
  }

  const self = selfHost.toLowerCase().replace(/^www\./, '');

  if (within(host, self) || host === 'accounts.google.com') {
    return 'internal';
  }

  for (const [source, domains] of SOURCE_DOMAINS) {
    if (domains.some((domain) => within(host, domain))) {
      return source;
    }
  }

  /* Every national Google and Yandex: google.de, google.co.uk, yandex.com.tr. */
  if (/(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host)) {
    return 'google';
  }

  if (/(^|\.)yandex\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host)) {
    return 'yandex';
  }

  return 'other';
}

/**
 * A campaign tag: lowercase, short, and made of the characters a tag is made of.
 *
 * Kept because it is the one thing a referrer cannot say — a link in a newsletter, a Product Hunt
 * post opened from an app, a QR code. Anything longer or stranger is dropped rather than trimmed,
 * because a trimmed value is a new value nobody wrote.
 */
export const CAMPAIGN = /^[a-z0-9][a-z0-9._-]{0,31}$/;

export function campaignOf(search: string): string {
  let params: URLSearchParams;

  try {
    params = new URLSearchParams(search);
  } catch {
    return '';
  }

  /* `utm_source` first; `ref` is what Product Hunt and a good many directories append instead. */
  for (const name of ['utm_source', 'ref']) {
    const value = (params.get(name) ?? '').trim().toLowerCase();

    if (value) {
      return CAMPAIGN.test(value) ? value : '';
    }
  }

  return '';
}

/** Paths that are always themselves, whatever else exists. */
const FIXED_PAGES = [
  '/history',
  '/docs',
  '/blog',
  '/changelog',
  '/markdown-live-preview',
  '/embed',
  '/open',
];

/** Blog and changelog slugs are public, so a page is keyed by one; the pattern keeps it a slug. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,15}$/;

/**
 * The key a page view is counted under, from a path with the locale already removed.
 *
 * `staticPaths` is the list in `src/lib/pages.ts`, passed in rather than imported because `shared`
 * does not reach into the app. An address that is none of these is `other` — a mistyped URL, a
 * probe for /wp-admin — so the table cannot grow a row per thing somebody typed.
 *
 * The server checks a key by asking whether this returns it unchanged, which means there is one
 * definition of a valid key and it is this function.
 */
export function pageKeyFor(path: string, staticPaths: readonly string[]): string {
  const clean = path.replace(/\/+$/, '') || '/';

  if (/^\/(?:open|s)\/[^/]+$/.test(clean)) {
    return '/open';
  }

  if (
    staticPaths.includes(clean) ||
    FIXED_PAGES.includes(clean) ||
    CONVERSIONS.some((one) => one.path === clean)
  ) {
    return clean;
  }

  const slugged = clean.match(/^\/(blog|changelog)\/([^/]+)$/);

  if (slugged && slugged[2].length <= 100 && SLUG.test(slugged[2])) {
    return clean;
  }

  return 'other';
}

/** What a key may be for each browser event other than a page. */
const KEYS: Record<Exclude<BrowserEvent, 'visit' | 'view'>, readonly string[]> = {
  convert: CONVERSIONS.map((one) => one.id),
  save: CONVERSIONS.map((one) => one.id),
  download: DOWNLOAD_FORMATS,
  share: SHARE_KINDS,
  nudge: NUDGE_VARIANTS.flatMap((variant) => NUDGE_ACTIONS.map((action) => `${variant}:${action}`)),
};

/** One count, as the browser sends it and as the table stores it. */
export interface Tally {
  event: BrowserEvent;
  key: string;
  lang: string;
  source: Source;
  campaign: string;
}

/** The body the browser sends: short names, because it is sent on every page. */
export interface TallyBody {
  e: string;
  k: string;
  l: string;
  s: string;
  u?: string;
}

/**
 * A body the server will count, or null.
 *
 * Every field has to be exactly what the browser would have produced. Nothing is corrected: a
 * value that is nearly right is a value somebody made up.
 */
export function parseTally(
  value: unknown,
  staticPaths: readonly string[]
): Tally | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const { e, k, l, s, u = '' } = value as Partial<TallyBody>;

  if (
    typeof e !== 'string' ||
    typeof k !== 'string' ||
    typeof l !== 'string' ||
    typeof s !== 'string' ||
    typeof u !== 'string'
  ) {
    return null;
  }

  if (!(BROWSER_EVENTS as readonly string[]).includes(e)) {
    return null;
  }

  const event = e as BrowserEvent;
  const keyOk =
    event === 'visit' || event === 'view'
      ? pageKeyFor(k, staticPaths) === k
      : KEYS[event].includes(k);

  if (
    !keyOk ||
    !(USAGE_LANGS as readonly string[]).includes(l) ||
    !(SOURCES as readonly string[]).includes(s) ||
    (u !== '' && !CAMPAIGN.test(u))
  ) {
    return null;
  }

  return { event, key: k, lang: l, source: s as Source, campaign: u };
}
