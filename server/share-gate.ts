import type { Context } from 'hono';
import { currentUser } from './auth.js';
import { sql } from './db.js';

/*
 * Who may open a shared document, decided in one place.
 *
 * A token is read in three places — the page at /s/<token> with its two downloads, the app's own
 * reader behind /open/<token>, and the "shared with you" list — and until this existed the first
 * two each carried their own copy of the rules. Two copies of an access check are how a new rule
 * lands in one of them: an expiry that ends the page and leaves "Save a copy" working is a link that
 * did not expire. So every reader asks this, and the order of the questions is written once.
 */

export type ShareMode = 'private' | 'link' | 'people';

export const normaliseEmail = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/** Five years. Further than that is not an expiry anybody means; it is "never" with extra steps. */
const MAX_EXPIRY_MS = 5 * 365 * 24 * 60 * 60 * 1000;

export interface SharedDocument {
  id: string;
  user_id: string;
  name: string;
  markdown: string | null;
  blob_path: string | null;
  created_at: string;
  share_mode: Exclude<ShareMode, 'private'>;
  size: number;
  stats: Record<string, number> | null;
  share_expires_at: string | null;
}

export type ShareVerdict =
  | { ok: true; document: SharedDocument; expiresAt: Date | null }
  | { ok: false; why: 'missing' }
  | { ok: false; why: 'expired'; expiredAt: Date }
  | { ok: false; why: 'sign-in' | 'not-yours' };

/**
 * Whether this caller may read the document behind this token, and the document if so.
 *
 * In this order: a token nobody holds, then an expired link, then — for a share addressed to named
 * people — whether the session is one of them. The clock is the database's (`<= now()`), not this
 * function's, so the moment a link ends is the moment the row says rather than whichever instance
 * happens to answer.
 */
export async function shareGate(c: Context, token: string): Promise<ShareVerdict> {
  const rows = (await sql()`
    select id, user_id, name, markdown, blob_path, created_at, share_mode, size, stats,
           share_expires_at, coalesce(share_expires_at <= now(), false) as expired
    from m2h_document
    where share_token = ${token}
  `) as Array<Omit<SharedDocument, 'share_mode'> & { share_mode: ShareMode; expired: boolean }>;

  const row = rows[0];

  if (!row || row.share_mode === 'private') {
    return { ok: false, why: 'missing' };
  }

  if (row.expired) {
    return { ok: false, why: 'expired', expiredAt: new Date(row.share_expires_at!) };
  }

  if (row.share_mode === 'people') {
    const user = await currentUser(c);

    if (!user) {
      return { ok: false, why: 'sign-in' };
    }

    const allowed =
      user.id === row.user_id ||
      ((await sql()`
        select 1 from m2h_document_share
        where document_id = ${row.id}
          and email = ${normaliseEmail(user.email)}
      `) as unknown[]).length > 0;

    if (!allowed) {
      return { ok: false, why: 'not-yours' };
    }
  }

  const { expired: _, ...document } = row;

  return {
    ok: true,
    document: document as SharedDocument,
    expiresAt: row.share_expires_at ? new Date(row.share_expires_at) : null,
  };
}

/**
 * A moment as a sentence written on the server can say it: date, time and "UTC".
 *
 * The server does not know the reader's time zone, and a date on its own is a day off for half the
 * world — a link set to end at midnight in Kyiv ends on the previous day in UTC, and at the end of
 * the day in California it ends on the next one. The time and the zone make it exact everywhere.
 */
export function writtenUtc(at: Date | string): string {
  const moment = new Date(at);
  const day = moment.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return `${day}, ${moment.toISOString().slice(11, 16)} UTC`;
}

/**
 * How long the CDN may keep a link's page: a minute, or less when the link ends sooner.
 *
 * Zero means do not keep it at all. There is deliberately no `stale-while-revalidate` beside this:
 * a stale copy served while the next one is fetched is a page shown after its link was revoked or
 * ran out, which is the one thing a revoke and an expiry exist to stop.
 */
export function edgeSeconds(expiresAt: Date | null): number {
  if (!expiresAt) {
    return 60;
  }

  return Math.max(0, Math.min(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000)));
}

export type ExpiryInput =
  | { ok: true; value: Date | null | undefined }
  | { ok: false; error: string };

/**
 * An expiry as a caller sent it: absent leaves it alone, null or empty clears it, a date sets it.
 *
 * An ISO 8601 date-time, because a bare date means midnight in somebody's time zone and the caller
 * and this server do not share one. In the future, and at most five years away.
 */
export function readExpiry(value: unknown): ExpiryInput {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (value === null || value === '') {
    return { ok: true, value: null };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: 'The expiry must be an ISO 8601 date-time, or null for never' };
  }

  const at = new Date(value);

  if (Number.isNaN(at.getTime())) {
    return {
      ok: false,
      error: 'The expiry must be an ISO 8601 date-time, like 2026-12-31T18:00:00Z',
    };
  }

  if (at.getTime() <= Date.now()) {
    return { ok: false, error: 'That expiry is in the past; a link has to end later than now' };
  }

  if (at.getTime() > Date.now() + MAX_EXPIRY_MS) {
    return { ok: false, error: 'An expiry can be at most five years away' };
  }

  return { ok: true, value: at };
}

/** How many opens a list shows: the newest ones, which are the ones anybody is asking about. */
export const VIEW_LIST_LIMIT = 200;

export interface ShareView {
  at: string;
  /** `page` is the shared page at /s/<token>; `app` is the app's reader behind /open/<token>. */
  via: 'page' | 'app';
}

/** A document's recent opens, newest first — see `m2h_share_view` in db/schema.sql. */
export async function recentViews(documentId: string): Promise<ShareView[]> {
  const rows = (await sql()`
    select viewed_at, via from m2h_share_view
    where document_id = ${documentId}
    order by viewed_at desc
    limit ${VIEW_LIST_LIMIT}
  `) as Array<{ viewed_at: string; via: string }>;

  return rows.map((row) => ({
    at: new Date(row.viewed_at).toISOString(),
    via: row.via === 'app' ? 'app' : 'page',
  }));
}
