import type { Context } from 'hono';
import { clientAddress } from './address.js';
import { sql } from './db.js';
import { STATIC_PAGES } from '../src/lib/pages.js';
import { parseTally, type ServerEvent, type Tally } from '../shared/usage.js';

/*
 * The first-party counter's server half: one table of daily totals, and the door into it.
 *
 * See `shared/usage.ts` for what is counted and why. What this file adds is the part a browser
 * cannot be trusted with — which requests are counted at all — and the one write.
 *
 * Nothing that identifies anybody reaches the table, and the address is not even kept for the rate
 * limit. `countCall` in limits.ts would have been the obvious limiter, and it writes its caller key
 * to `m2h_call` for a day; keyed by address, that is an address in the database, which is the one
 * thing this counter promises not to keep. So the limit here lives in this instance's memory for
 * the current minute, and is forgotten with it.
 */

const STATIC_PATHS = STATIC_PAGES.map((page) => page.path);

/** A body larger than this is not a count. The real one is under 120 bytes. */
export const TALLY_MAX_BYTES = 512;

/** Per address per instance per minute. A person does not open two pages a second for a minute. */
export const TALLY_PER_MINUTE = 120;

/*
 * Not a person. Crawlers, link previews, uptime checks, Lighthouse and the headless browser that
 * takes our own screenshots — every one of them runs the page, and every one would be a visit.
 */
const BOT =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|prerender|puppeteer|playwright|phantom|selenium|facebookexternalhit|embedly|whatsapp|curl|wget|python|httpie|axios|node-fetch|undici|go-http|okhttp|java\/|libwww|scrapy/i;

export const looksLikeBot = (userAgent: string) =>
  !userAgent || userAgent.length > 512 || BOT.test(userAgent);

/**
 * A request's body as a count, or null when it should not be counted.
 *
 * Pure, so `npm run usage:check` can ask it everything the endpoint would be asked. `site` is the
 * browser's own `Sec-Fetch-Site`: a count posted from somebody else's page is refused, and one with
 * no header at all is not a browser, which the user agent then has to vouch for.
 */
export function readTally(
  body: string,
  headers: { userAgent: string; site: string | undefined }
): Tally | null {
  if (body.length > TALLY_MAX_BYTES || looksLikeBot(headers.userAgent)) {
    return null;
  }

  if (headers.site && headers.site !== 'same-origin') {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }

  return parseTally(parsed, STATIC_PATHS);
}

let minute = 0;
const recent = new Map<string, number>();

/** Whether this address has sent too many this minute. Held in memory and gone within one. */
export function tooFast(address: string, now = Date.now()): boolean {
  const current = Math.floor(now / 60_000);

  if (current !== minute) {
    minute = current;
    recent.clear();
  }

  const seen = (recent.get(address) ?? 0) + 1;

  // Bounded: a flood of distinct addresses stops being tracked rather than growing the map.
  if (recent.size < 10_000 || recent.has(address)) {
    recent.set(address, seen);
  }

  return seen > TALLY_PER_MINUTE;
}

/**
 * One more in today's total. UTC, so a day is the same day whoever reads it.
 *
 * Never throws: a count that could not be written is a count lost, and nothing a person is doing
 * should wait on it or fail because of it.
 */
export async function addToTally(row: {
  event: string;
  key: string;
  lang: string;
  source: string;
  campaign: string;
}): Promise<void> {
  try {
    await sql()`
      insert into m2h_usage_daily (day, event, key, lang, source, campaign, count)
      values (
        (now() at time zone 'utc')::date,
        ${row.event}, ${row.key}, ${row.lang}, ${row.source}, ${row.campaign}, 1
      )
      on conflict (day, event, key, lang, source, campaign)
      do update set count = m2h_usage_daily.count + 1
    `;
  } catch {
    /* No table yet, no database, a timeout: the page does not care, and neither does this. */
  }
}

/**
 * `POST /api/tally`, which the page sends with `navigator.sendBeacon`.
 *
 * Always 204, counted or not. A beacon never reads its answer, and one that said which bodies were
 * refused would be a guide to writing a body that is not.
 */
export async function tallyRoute(c: Context) {
  try {
    const length = Number(c.req.header('content-length') ?? 0);

    if (length > TALLY_MAX_BYTES || tooFast(clientAddress(c))) {
      return c.body(null, 204);
    }

    const tally = readTally((await c.req.text()).slice(0, TALLY_MAX_BYTES + 1), {
      userAgent: c.req.header('user-agent') ?? '',
      site: c.req.header('sec-fetch-site'),
    });

    if (tally) {
      await addToTally(tally);
    }
  } catch {
    /* Counting must never be the reason a request failed. */
  }

  return c.body(null, 204);
}

/*
 * The server's own counts: a tool an assistant called, a route the API answered.
 *
 * Neither is visible from the tables that exist — `m2h_call` holds a minute per caller and is swept
 * after a day, and it keys on the account, which this must not. So these land in the same daily
 * table, with `source` saying how the caller arrived (`key`, `oauth`, `session`) rather than where
 * from, and no language or campaign, which a server call does not have.
 */
export function countServerEvent(
  event: ServerEvent,
  key: string,
  via: string
): Promise<void> {
  return addToTally({ event, key, lang: '', source: via, campaign: '' });
}

/**
 * A request `server/mcp.ts` makes to /api/v1 on a tool's behalf.
 *
 * The tool call is counted as a tool call; counting the API request inside it as well would report
 * every save from an assistant twice. The header decides nothing but that — somebody who sends it
 * on purpose has only made their own requests go uncounted.
 */
export const INTERNAL_CALL_HEADER = 'x-tp-internal';

const API_ROUTES = new Set([
  '/usage',
  '/documents',
  '/documents/:id',
  '/documents/:id/summary',
  '/documents/:id/versions',
  '/documents/:id/share',
]);

/** A /api/v1 request as the route it hit, without the id in it. */
export function apiRouteKey(method: string, path: string): string {
  const shape =
    path
      .replace(/^\/api\/v1/, '')
      .replace(/\/+$/, '')
      .replace(/^\/documents\/[^/]+/, '/documents/:id') || '/';

  return ['GET', 'POST', 'PUT', 'DELETE'].includes(method) && API_ROUTES.has(shape)
    ? `${method} ${shape}`
    : 'other';
}
