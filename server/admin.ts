import type { Context } from 'hono';
import { Hono } from 'hono';
import { currentUser, type SessionUser } from './auth.js';
import { clientLabel, type ClientLabel } from './client-label.js';
import { looksLikeId, sql } from './db.js';
import { QUOTA } from './limits.js';
import { deleteSources } from './source.js';
import { brevoEnabled, forgetContact, syncToBrevo } from './brevo.js';
import { OAUTH_STEPS } from '../shared/usage.js';

/*
 * The owner's page: every account, how it arrived, and what it has done since.
 *
 * Unlike db/radar-readonly.sql this one names people, which is why it is not a view a separate role
 * can read but a page behind the owner's own session. Two locks: the address has to be on
 * ADMIN_EMAILS, and Neon Auth has to say that address was confirmed — an account somebody made with
 * the owner's address and never proved is not the owner. Without the variable nobody gets in, and
 * anybody who is not on it gets the same 404 as a page that does not exist.
 *
 * Read-only, with one exception: deleting an account, which is a POST from the account's own page
 * that has to repeat the account's address, and cannot be aimed at the owner or another admin.
 *
 * "How they arrived" is worked out, not recorded. Neon Auth tells this application nothing at
 * registration, but an assistant's sign-in leaves a token whose first row is seconds after the
 * account's: an account whose first connection came within DOOR_WINDOW of its creation was made in
 * order to connect that app. Everything else came through the site.
 */

const DOOR_WINDOW_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

type Door = 'site' | ClientLabel;

/* The fixed order the chart and the badges use. The first five carry a colour; the rest are grey. */
const DOORS: Array<{ id: Door; name: string }> = [
  { id: 'site', name: 'Site' },
  { id: 'claude', name: 'Claude' },
  { id: 'obsidian', name: 'Obsidian' },
  { id: 'chatgpt', name: 'ChatGPT' },
  { id: 'extension', name: 'Extension' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'vscode', name: 'VS Code' },
  { id: 'windsurf', name: 'Windsurf' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'other', name: 'Other app' },
];

const doorName = (door: string) => DOORS.find((one) => one.id === door)?.name ?? door;
const doorSlot = (door: string) => {
  const at = DOORS.findIndex((one) => one.id === door);

  return at >= 0 && at < 5 ? `s${at + 1}` : 's0';
};

/* ------------------------------------------------------------------------------------ the gate */

export const admins = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((one) => one.trim().toLowerCase())
      .filter(Boolean)
  );

async function admitted(c: Context): Promise<SessionUser | 'sign-in' | 'no'> {
  const allowed = admins();

  if (allowed.size === 0) {
    return 'no';
  }

  const who = await currentUser(c);

  if (!who) {
    return 'sign-in';
  }

  if (!who.email || !allowed.has(who.email.toLowerCase())) {
    return 'no';
  }

  const found = await rows<{ verified: boolean }>(sql()`
    select "emailVerified" as verified from neon_auth."user" where id = ${who.id}
  `);

  return found[0]?.verified === true ? who : 'no';
}

const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
  // Avatars come from the providers' hosts; they need not learn this page's address.
  'referrer-policy': 'no-referrer',
};

function refused(c: Context, verdict: 'sign-in' | 'no') {
  if (verdict === 'sign-in') {
    return c.html(
      shell(
        'Sign in',
        `<main class="narrow"><h1>Sign in first</h1>
         <p class="dim">Sign in on <a href="/">the site</a> with the owner's account, then open this page again.</p></main>`
      ),
      401,
      PRIVATE_HEADERS
    );
  }

  return c.text('Not found', 404, PRIVATE_HEADERS);
}

/* ------------------------------------------------------------------------------------ the data */

interface Connection {
  client_id: string;
  name: string | null;
  first_at: string;
  last_used_at: string | null;
  active: boolean;
}

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  verified: boolean;
  image: string | null;
  created_at: string | Date;
  first_seen_at: string | Date | null;
  welcomed_at: string | Date | null;
  documents: number;
  doc_bytes: string | number;
  rev_bytes: string | number;
  revisions: number;
  first_doc_at: string | Date | null;
  last_doc_at: string | Date | null;
  shared_link: number;
  shared_people: number;
  share_views: number;
  summaries: number;
  kinds: Record<string, number> | null;
  connections: Connection[] | null;
  conn_last_used: string | Date | null;
  keys: number;
  active_keys: number;
  key_last_used: string | Date | null;
  webhooks: number;
}

interface SessionSummary {
  user_id: string;
  sessions: number;
  last_session_at: string | Date | null;
  user_agent: string | null;
}

interface ProviderRow {
  user_id: string;
  providers: string[];
}

/** One account as the page shows it. */
export interface Person {
  id: string;
  name: string;
  email: string;
  image: string | null;
  verified: boolean;
  providers: string[];
  created: number;
  door: Door;
  /** The app a door other than the site was, by its own name ("Claude Code", "claude.ai"). */
  doorClient: string | null;
  apps: Array<{ label: ClientLabel; name: string; first: number; lastUsed: number | null; active: boolean }>;
  documents: number;
  bytes: number;
  revisions: number;
  sharedLink: number;
  sharedPeople: number;
  shareViews: number;
  summaries: number;
  kinds: Record<string, number>;
  keys: number;
  activeKeys: number;
  webhooks: number;
  sessions: number;
  device: string | null;
  firstDoc: number | null;
  lastActive: number | null;
}

const ms = (value: string | Date | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : null;
};

const latest = (...values: Array<number | null>) =>
  values.reduce<number | null>((best, one) => (one !== null && (best === null || one > best) ? one : best), null);

/** A query's rows, typed: the driver's own type is a union of every result shape it can return. */
async function rows<T>(query: Promise<unknown>): Promise<T[]> {
  return (await query) as T[];
}

/*
 * Neon Auth's own tables beyond "user" are read as a bonus: if a later version renames them, the
 * page loses a column, not itself.
 */
async function optional<T>(query: Promise<unknown>): Promise<T[]> {
  try {
    return (await query) as T[];
  } catch {
    return [];
  }
}

export async function loadPeople(): Promise<Person[]> {
  const [users, sessions, providers] = await Promise.all([
    rows<UserRow>(sql()`
      with docs as (
        select user_id,
          count(*)::int as documents,
          coalesce(sum(size), 0)::bigint as doc_bytes,
          min(created_at) as first_doc_at,
          max(greatest(created_at, coalesce(updated_at, created_at))) as last_doc_at,
          count(*) filter (where share_mode = 'link')::int as shared_link,
          count(*) filter (where share_mode = 'people')::int as shared_people,
          coalesce(sum(share_views), 0)::int as share_views,
          count(*) filter (where summary is not null)::int as summaries
        from m2h_document
        group by user_id
      ),
      kinds as (
        select user_id, jsonb_object_agg(kind, n) as kinds
        from (select user_id, kind, count(*)::int as n from m2h_document group by 1, 2) k
        group by user_id
      ),
      revs as (
        select d.user_id, count(*)::int as revisions, coalesce(sum(r.size), 0)::bigint as rev_bytes
        from m2h_document_revision r
        join m2h_document d on d.id = r.document_id
        group by d.user_id
      ),
      conns as (
        select t.user_id,
          jsonb_agg(jsonb_build_object(
            'client_id', t.client_id,
            'name', c.name,
            'first_at', t.first_at,
            'last_used_at', t.last_used_at,
            'active', t.active
          ) order by t.first_at) as connections,
          max(t.last_used_at) as conn_last_used
        from (
          select user_id, client_id,
            min(created_at) as first_at,
            max(last_used_at) as last_used_at,
            bool_or(revoked_at is null and (expires_at is null or expires_at > now())) as active
          from m2h_oauth_token
          group by 1, 2
        ) t
        left join m2h_oauth_client c on c.id = t.client_id
        group by t.user_id
      ),
      keys as (
        select user_id,
          count(*)::int as keys,
          count(*) filter (where revoked_at is null)::int as active_keys,
          max(last_used_at) as key_last_used
        from m2h_api_key
        group by user_id
      ),
      hooks as (
        select user_id, count(*) filter (where revoked_at is null)::int as webhooks
        from m2h_webhook
        group by user_id
      )
      select
        u.id, u.name, u.email, u."emailVerified" as verified, u.image, u."createdAt" as created_at,
        m.first_seen_at, m.welcomed_at,
        coalesce(d.documents, 0) as documents,
        coalesce(d.doc_bytes, 0) as doc_bytes,
        coalesce(r.rev_bytes, 0) as rev_bytes,
        coalesce(r.revisions, 0) as revisions,
        d.first_doc_at, d.last_doc_at,
        coalesce(d.shared_link, 0) as shared_link,
        coalesce(d.shared_people, 0) as shared_people,
        coalesce(d.share_views, 0) as share_views,
        coalesce(d.summaries, 0) as summaries,
        k.kinds,
        cn.connections, cn.conn_last_used,
        coalesce(ky.keys, 0) as keys,
        coalesce(ky.active_keys, 0) as active_keys,
        ky.key_last_used,
        coalesce(h.webhooks, 0) as webhooks
      from neon_auth."user" u
      left join m2h_user m on m.user_id = u.id
      left join docs d on d.user_id = u.id
      left join kinds k on k.user_id = u.id
      left join revs r on r.user_id = u.id
      left join conns cn on cn.user_id = u.id
      left join keys ky on ky.user_id = u.id
      left join hooks h on h.user_id = u.id
      order by u."createdAt" desc
    `),
    optional<SessionSummary>(sql()`
      select "userId" as user_id,
        count(*)::int as sessions,
        max("updatedAt") as last_session_at,
        (array_agg("userAgent" order by "updatedAt" desc))[1] as user_agent
      from neon_auth.session
      group by 1
    `),
    optional<ProviderRow>(sql()`
      select "userId" as user_id, array_agg(distinct "providerId") as providers
      from neon_auth.account
      group by 1
    `),
  ]);

  const sessionOf = new Map(sessions.map((one) => [String(one.user_id), one]));
  const providersOf = new Map(providers.map((one) => [String(one.user_id), one.providers ?? []]));

  return users.map((row) => toPerson(row, sessionOf.get(row.id) ?? null, providersOf.get(row.id) ?? []));
}

function toPerson(row: UserRow, session: SessionSummary | null, providers: string[]): Person {
  const created = ms(row.created_at) ?? 0;
  const apps = (row.connections ?? []).map((one) => ({
    label: clientLabel(one.client_id, one.name),
    name: one.name || one.client_id,
    first: ms(one.first_at) ?? 0,
    lastUsed: ms(one.last_used_at),
    active: Boolean(one.active),
  }));

  // The earliest connection, if it came right after the account did.
  const first = apps.reduce<(typeof apps)[number] | null>(
    (best, one) => (best === null || one.first < best.first ? one : best),
    null
  );
  const viaApp = first !== null && first.first - created <= DOOR_WINDOW_MS;

  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    image: row.image,
    verified: Boolean(row.verified),
    providers: providers.map((one) => (one === 'credential' ? 'email' : one)),
    created,
    door: viaApp ? first.label : 'site',
    doorClient: viaApp ? first.name : null,
    apps,
    documents: row.documents,
    bytes: Number(row.doc_bytes) + Number(row.rev_bytes),
    revisions: row.revisions,
    sharedLink: row.shared_link,
    sharedPeople: row.shared_people,
    shareViews: row.share_views,
    summaries: row.summaries,
    kinds: row.kinds ?? {},
    keys: row.keys,
    activeKeys: row.active_keys,
    webhooks: row.webhooks,
    sessions: session?.sessions ?? 0,
    device: session?.user_agent ? device(session.user_agent) : null,
    firstDoc: ms(row.first_doc_at),
    lastActive: latest(
      ms(row.last_doc_at),
      ms(row.conn_last_used),
      ms(row.key_last_used),
      ms(session?.last_session_at)
    ),
  };
}

/** A user agent, as the two words anybody wants from it. */
function device(agent: string): string {
  const os = /iPhone|iPad|iPod/.test(agent)
    ? 'iOS'
    : /Android/.test(agent)
      ? 'Android'
      : /Mac OS X|Macintosh/.test(agent)
        ? 'macOS'
        : /Windows/.test(agent)
          ? 'Windows'
          : /CrOS/.test(agent)
            ? 'ChromeOS'
            : /Linux/.test(agent)
              ? 'Linux'
              : '';
  const browser = /obsidian/i.test(agent)
    ? 'Obsidian'
    : /Edg\//.test(agent)
      ? 'Edge'
      : /OPR\//.test(agent)
        ? 'Opera'
        : /Firefox\//.test(agent)
          ? 'Firefox'
          : /Chrome\//.test(agent)
            ? 'Chrome'
            : /Safari\//.test(agent)
              ? 'Safari'
              : '';

  return [browser, os].filter(Boolean).join(' · ') || agent.slice(0, 40);
}

interface FunnelRow {
  client: string;
  step: string;
  n: number;
}

interface NamedRating {
  user_id: string;
  score: number;
  campaign: string;
  at: number;
  email: string;
  name: string;
}

interface SourceRow {
  source: string;
  n: number;
}

async function loadCounters(days: number) {
  const [funnel, sources, ratings, named] = await Promise.all([
    rows<FunnelRow>(sql()`
      select source as client, key as step, sum(count)::int as n
      from m2h_usage_daily
      where event = 'oauth' and day > current_date - ${days}::int
      group by 1, 2
    `),
    rows<SourceRow>(sql()`
      select source, sum(count)::int as n
      from m2h_usage_daily
      where event = 'visit' and day > current_date - ${days}::int
      group by 1
      order by 2 desc
    `),
    // All time: there are few of these, and a score is worth keeping in view.
    rows<{ score: string; n: number }>(sql()`
      select key as score, sum(count)::int as n
      from m2h_usage_daily
      where event = 'rating'
      group by 1
    `),
    /*
     * The scores whose link named the account (`rate-token.ts`). Caught rather than allowed to
     * fail the page: a deployment whose database predates the table still has everything else.
     */
    rows<NamedRating>(sql()`
      select r.user_id, r.score, r.campaign, extract(epoch from r.updated_at) * 1000 as at,
             coalesce(u.email, '') as email, coalesce(u.name, '') as name
      from m2h_rating r
      left join neon_auth."user" u on u.id::text = r.user_id
      order by r.updated_at desc
      limit 100
    `).catch(() => [] as NamedRating[]),
  ]);

  return { funnel, sources, ratings, named };
}

/* ------------------------------------------------------------------------------------ the pages */

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const bytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(1)} MB`;

const date = (time: number | null) => (time === null ? '—' : new Date(time).toISOString().slice(0, 10));
const dateTime = (time: number | null) =>
  time === null ? '—' : new Date(time).toISOString().slice(0, 16).replace('T', ' ');

function ago(time: number | null, now: number): string {
  if (time === null) {
    return '—';
  }

  const minutes = Math.max(0, Math.round((now - time) / 60000));

  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 48 * 60) return `${Math.round(minutes / 60)} h ago`;

  return `${Math.round(minutes / 60 / 24)} d ago`;
}

const badge = (door: string, title?: string) =>
  `<span class="badge ${doorSlot(door)}"${title ? ` title="${escapeHtml(title)}"` : ''}><i></i>${escapeHtml(
    doorName(door)
  )}</span>`;

const avatar = (person: Pick<Person, 'image' | 'name' | 'email'>, size = 28) =>
  person.image
    ? `<img class="av" src="${escapeHtml(person.image)}" width="${size}" height="${size}" alt="" loading="lazy">`
    : `<span class="av" style="width:${size}px;height:${size}px">${escapeHtml(
        (person.name || person.email || '?').slice(0, 1).toUpperCase()
      )}</span>`;

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} — TransformPipe admin</title>
<style>${STYLE}</style>
</head>
<body>
${body}
<div id="tip" role="tooltip" hidden></div>
</body>
</html>`;
}

const STYLE = `
:root { color-scheme: light; --page: #f6f6f4; --card: #fcfcfb; --line: #e4e3df; --ink: #0b0b0b;
  --dim: #52514e; --mute: #8a8984; --brand: #0f8f95; --track: #ecebe7;
  --s1: #2a78d6; --s2: #eb6834; --s3: #1baf7a; --s4: #eda100; --s5: #e87ba4; --s0: #a3a29c; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; --page: #0f0e14; --card: #17171e; --line: #2a2a35;
    --ink: #f4f4f5; --dim: #b4b4bc; --mute: #7d7d88; --brand: #14a8af; --track: #23232c;
    --s1: #3987e5; --s2: #d95926; --s3: #199e70; --s4: #c98500; --s5: #d55181; --s0: #6b6b75; }
}
:root[data-theme="dark"] { color-scheme: dark; --page: #0f0e14; --card: #17171e; --line: #2a2a35;
  --ink: #f4f4f5; --dim: #b4b4bc; --mute: #7d7d88; --brand: #14a8af; --track: #23232c;
  --s1: #3987e5; --s2: #d95926; --s3: #199e70; --s4: #c98500; --s5: #d55181; --s0: #6b6b75; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--page); color: var(--ink);
  font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
a { color: inherit; }
main { max-width: 1280px; margin: 0 auto; padding: 24px 16px 64px; }
main.narrow { max-width: 32rem; padding-top: 15vh; }
h1 { font-size: 22px; margin: 0; letter-spacing: -0.01em; }
h2 { font-size: 15px; margin: 0 0 12px; }
.dim { color: var(--dim); } .mute { color: var(--mute); }
.top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.top .links { display: flex; gap: 14px; font-size: 13px; }
.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 16px; }
.tile, .card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; }
.tile { padding: 12px 14px; }
.tile b { display: block; font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.tile span { color: var(--dim); font-size: 12px; }
.tile small { color: var(--mute); font-size: 12px; display: block; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 12px; margin-bottom: 16px; }
.card { padding: 16px; min-width: 0; }
.card p.note { color: var(--mute); font-size: 12px; margin: 10px 0 0; }
.bars { display: grid; grid-template-columns: max-content 1fr max-content; gap: 6px 10px; align-items: center; font-size: 13px; }
.bars .track { height: 8px; background: var(--track); border-radius: 4px; overflow: hidden; }
.bars .fill { height: 100%; border-radius: 4px; background: var(--brand); }
.bars .num { font-variant-numeric: tabular-nums; color: var(--dim); text-align: right; }
.badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 1px 8px 1px 6px;
  border: 1px solid var(--line); border-radius: 999px; white-space: nowrap; color: var(--ink); }
.badge i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); flex: none; }
.s1 { --c: var(--s1); } .s2 { --c: var(--s2); } .s3 { --c: var(--s3); } .s4 { --c: var(--s4); } .s5 { --c: var(--s5); } .s0 { --c: var(--s0); }
.chips { display: flex; gap: 4px; flex-wrap: wrap; }
.legend { display: flex; gap: 6px 14px; flex-wrap: wrap; font-size: 12px; color: var(--dim); margin-bottom: 8px; }
.legend span { display: inline-flex; align-items: center; gap: 5px; }
.legend i { width: 10px; height: 10px; border-radius: 2px; background: var(--c); }
svg text { fill: var(--mute); font-size: 11px; }
svg .grid-line { stroke: var(--line); stroke-width: 1; }
svg rect.seg { fill: var(--c); stroke: var(--card); stroke-width: 2px; }
svg rect.hit { fill: transparent; }
svg rect.hit:hover { fill: var(--ink); fill-opacity: 0.05; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: middle; }
th { font-weight: 500; color: var(--dim); font-size: 12px; white-space: nowrap; position: sticky; top: 0; background: var(--card); }
th[data-sort] { cursor: pointer; user-select: none; }
th[data-sort]:hover { color: var(--ink); }
th.asc::after { content: " ↑"; } th.desc::after { content: " ↓"; }
td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; }
td { white-space: nowrap; }
td.wrap { white-space: normal; min-width: 200px; }
tbody tr:hover { background: color-mix(in srgb, var(--ink) 3%, transparent); }
tr.row { cursor: pointer; }
.who { display: flex; align-items: center; gap: 10px; min-width: 220px; }
.who div { min-width: 0; }
.who b { font-weight: 500; display: block; }
.who small { color: var(--dim); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px; }
.av { border-radius: 50%; flex: none; display: inline-grid; place-items: center; background: var(--track); color: var(--dim); font-size: 12px; object-fit: cover; }
.meter { width: 70px; height: 6px; background: var(--track); border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-left: 6px; }
.meter i { display: block; height: 100%; background: var(--brand); border-radius: 3px; }
.scroll { overflow-x: auto; }
.toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
input[type=search] { flex: 1 1 220px; min-width: 0; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--line);
  background: var(--page); color: var(--ink); font: inherit; }
button.f { padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--dim);
  font: inherit; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
button.f i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
button.f[aria-pressed=true] { color: var(--ink); border-color: var(--ink); }
.ok { color: var(--s3); } .no { color: var(--mute); }
.hl td { background: color-mix(in srgb, var(--s3) 8%, transparent); }
dl.facts { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0; font-size: 13px; }
dl.facts dt { color: var(--dim); } dl.facts dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.head { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
.head h1 { font-size: 20px; }
code { font: 12px ui-monospace, Menlo, Consolas, monospace; }
#tip { position: fixed; pointer-events: none; z-index: 10; background: var(--ink); color: var(--page);
  font-size: 12px; padding: 6px 8px; border-radius: 6px; white-space: pre; line-height: 1.4; }
.danger { margin-top: 12px; border-color: color-mix(in srgb, var(--s2) 45%, var(--line)); }
.danger ul { margin: 0 0 10px; padding-left: 18px; }
.danger label { display: block; margin: 12px 0 8px; color: var(--dim); }
.danger input[type=text] { flex: 1 1 220px; min-width: 0; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--line);
  background: var(--page); color: var(--ink); font: inherit; }
button.destroy { padding: 7px 14px; border-radius: 8px; border: 1px solid #c2410c; background: #c2410c; color: #fff;
  font: inherit; font-weight: 500; cursor: pointer; }
.notice { border: 1px solid var(--line); border-left: 3px solid var(--s3); border-radius: 8px; background: var(--card);
  padding: 10px 14px; margin: 0 0 16px; }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .tile b { font-size: 20px; } }
`;

/* The hover layer for every [data-tip], and the users table's search, filters and sorting. */
const SCRIPT = `
(() => {
  const tip = document.getElementById('tip');
  document.addEventListener('mousemove', (e) => {
    const t = e.target.closest && e.target.closest('[data-tip]');
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.getAttribute('data-tip');
    tip.hidden = false;
    const x = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8);
    tip.style.left = x + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
  });

  const table = document.getElementById('people');
  if (!table) return;
  const body = table.tBodies[0];
  const rows = Array.from(body.rows);
  const search = document.getElementById('q');
  const count = document.getElementById('shown');
  let door = '';

  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const ok = (!door || row.dataset.door === door || (door === 'active' && row.dataset.active === '1')
        || (door === 'idle' && row.dataset.idle === '1'))
        && (!q || row.dataset.text.includes(q));
      row.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = shown;
  };

  search.addEventListener('input', apply);
  for (const b of document.querySelectorAll('button.f')) {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      for (const o of document.querySelectorAll('button.f')) o.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-pressed', String(on));
      door = on ? b.dataset.door : '';
      apply();
    });
  }

  for (const th of table.tHead.querySelectorAll('th[data-sort]')) {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      const desc = !th.classList.contains('desc');
      for (const o of table.tHead.querySelectorAll('th')) o.classList.remove('asc', 'desc');
      th.classList.add(desc ? 'desc' : 'asc');
      const val = (r) => { const v = r.dataset[key]; const n = Number(v); return v !== '' && !isNaN(n) ? n : (v || ''); };
      rows.sort((a, b) => { const x = val(a), y = val(b); const c = x < y ? -1 : x > y ? 1 : 0; return desc ? -c : c; });
      for (const r of rows) body.appendChild(r);
    });
  }

  body.addEventListener('click', (e) => {
    const row = e.target.closest('tr.row');
    if (row && !e.target.closest('a')) location.href = row.dataset.href;
  });
})();
`;

/* Weekly sign-ups, stacked by the door they came through. */
function signupChart(people: Person[], now: number): string {
  const WEEKS = 16;
  const monday = (time: number) => {
    const d = new Date(time);
    const day = (d.getUTCDay() + 6) % 7;

    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
  };
  const thisWeek = monday(now);
  const weeks = Array.from({ length: WEEKS }, (_, i) => thisWeek - (WEEKS - 1 - i) * 7 * DAY_MS);
  // Five coloured doors and everything else folded into one grey segment.
  const stacks = ['site', 'claude', 'obsidian', 'chatgpt', 'extension', 'rest'];
  const counts = weeks.map(() => Object.fromEntries(stacks.map((s) => [s, 0])) as Record<string, number>);

  for (const person of people) {
    const at = weeks.indexOf(monday(person.created));

    if (at >= 0) {
      counts[at][stacks.includes(person.door) ? person.door : 'rest'] += 1;
    }
  }

  const max = Math.max(1, ...counts.map((one) => stacks.reduce((sum, s) => sum + one[s], 0)));
  const step = max <= 5 ? 1 : max <= 12 ? 2 : max <= 30 ? 5 : Math.ceil(max / 6 / 5) * 5;
  const top = Math.ceil(max / step) * step;
  const W = 640;
  const H = 200;
  const left = 28;
  const bottom = 20;
  const plot = H - bottom - 6;
  const slot = (W - left) / WEEKS;
  const bar = Math.min(26, slot - 6);
  const y = (v: number) => 6 + plot - (v / top) * plot;

  let svg = '';

  for (let v = 0; v <= top; v += step) {
    svg += `<line class="grid-line" x1="${left}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/>`;
    svg += `<text x="${left - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  }

  weeks.forEach((week, i) => {
    const x = left + i * slot + (slot - bar) / 2;
    let base = 0;
    const lines = [`Week of ${date(week)}`];

    stacks.forEach((s, at) => {
      const n = counts[i][s];

      if (n === 0) return;

      const slotClass = s === 'rest' ? 's0' : `s${at + 1}`;
      const y0 = y(base);
      const y1 = y(base + n);

      // A 4px rounded end only on the top segment would need a path; a plain rect reads fine at this size.
      svg += `<rect class="seg ${slotClass}" x="${x}" y="${y1}" width="${bar}" height="${Math.max(0, y0 - y1)}" rx="2"/>`;
      base += n;
      lines.push(`${s === 'rest' ? 'Other apps' : doorName(s)}: ${n}`);
    });

    if (base > 0) lines.splice(1, 0, `Sign-ups: ${base}`);
    else lines.push('No sign-ups');

    svg += `<rect class="hit" x="${left + i * slot}" y="0" width="${slot}" height="${H - bottom}" data-tip="${escapeHtml(
      lines.join('\n')
    )}"/>`;

    if (i % 2 === WEEKS % 2) {
      svg += `<text x="${x + bar / 2}" y="${H - 4}" text-anchor="middle">${new Date(week)
        .toISOString()
        .slice(5, 10)}</text>`;
    }
  });

  const legend = stacks
    .map((s, at) => `<span class="${s === 'rest' ? 's0' : `s${at + 1}`}"><i></i>${s === 'rest' ? 'Other apps' : doorName(s)}</span>`)
    .join('');

  return `<div class="legend">${legend}</div>
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Sign-ups per week by how they arrived">${svg}</svg>`;
}

function barList(items: Array<{ label: string; n: number; tip?: string }>, total: number): string {
  if (items.length === 0) {
    return '<p class="mute">Nothing yet.</p>';
  }

  const max = Math.max(1, ...items.map((one) => one.n));

  return `<div class="bars">${items
    .map(
      (one) => `<div>${one.label}</div>
      <div class="track" data-tip="${escapeHtml(one.tip ?? `${one.n}`)}"><div class="fill" style="width:${(one.n / max) * 100}%"></div></div>
      <div class="num">${one.n}${total > 0 ? ` <span class="mute">· ${Math.round((one.n / total) * 100)}%</span>` : ''}</div>`
    )
    .join('')}</div>`;
}

function funnelTable(rows: FunnelRow[]): string {
  const clients = [...new Set(rows.map((one) => one.client))];
  const at = (client: string, step: string) =>
    rows.filter((one) => one.client === client && one.step === step).reduce((sum, one) => sum + one.n, 0);

  if (clients.length === 0) {
    return '<p class="mute">No connection attempts counted in this period.</p>';
  }

  clients.sort((a, b) => at(b, 'start') - at(a, 'start'));

  const head = OAUTH_STEPS.map((step) => `<th class="n">${step}</th>`).join('');
  const body = clients
    .map((client) => {
      const start = at(client, 'start');
      const token = at(client, 'token');
      const rate = start > 0 ? `${Math.round((token / start) * 100)}%` : '—';

      return `<tr${client === 'obsidian' ? ' class="hl"' : ''}><td>${badge(client)}</td>${OAUTH_STEPS.map(
        (step) => `<td class="n">${at(client, step) || '<span class="mute">0</span>'}</td>`
      ).join('')}<td class="n"><b>${rate}</b></td></tr>`;
    })
    .join('');

  return `<div class="scroll"><table><thead><tr><th>App</th>${head}<th class="n">start→token</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

/** Who gave what, newest first — the scores whose link named the account. */
function namedRatings(named: NamedRating[], now: number): string {
  if (named.length === 0) {
    return '<p class="note">No score has said whose it is yet. Links carry that from the sync after this change.</p>';
  }

  const body = named
    .map(
      (one) =>
        `<tr><td><a href="/admin/u/${encodeURIComponent(one.user_id)}">${escapeHtml(one.email || one.user_id)}</a>${
          one.name ? ` <span class="mute">${escapeHtml(one.name)}</span>` : ''
        }</td><td class="n"><b>${one.score}</b></td><td class="mute">${escapeHtml(one.campaign)}</td><td class="mute">${ago(Number(one.at), now)}</td></tr>`
    )
    .join('');

  return `<div class="scroll" style="margin-top:12px"><table><thead><tr><th>Who</th><th class="n">Score</th><th>Email</th><th>When</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function ratingsCard(rows: Array<{ score: string; n: number }>): string {
  const total = rows.reduce((sum, one) => sum + one.n, 0);

  if (total === 0) {
    return '<p class="mute">No scores yet. They arrive from the 1–10 scale in the day-3 email.</p>';
  }

  const at = (score: number) => rows.filter((one) => Number(one.score) === score).reduce((sum, one) => sum + one.n, 0);
  const mean = rows.reduce((sum, one) => sum + Number(one.score) * one.n, 0) / total;
  const promoters = [9, 10].reduce((sum, n) => sum + at(n), 0);
  const detractors = [1, 2, 3, 4, 5, 6].reduce((sum, n) => sum + at(n), 0);
  const nps = Math.round(((promoters - detractors) / total) * 100);

  return `<dl class="facts" style="margin-bottom:12px"><dt>Scores</dt><dd>${total}</dd><dt>Average</dt><dd>${mean.toFixed(1)} / 10</dd>
    <dt>NPS</dt><dd>${nps} <span class="mute">(${promoters} gave 9–10, ${detractors} gave 1–6)</span></dd></dl>
    ${barList(Array.from({ length: 10 }, (_, i) => ({ label: String(10 - i), n: at(10 - i) })), total)}
    <p class="note">Counted when somebody clicks a score. Below, the ones whose link said whose they are — each also arrives as an email to ADMIN_EMAILS.</p>`;
}

function overviewPage(
  people: Person[],
  counters: Awaited<ReturnType<typeof loadCounters>>,
  days: number,
  deleted = false,
  notice = ''
): string {
  const now = Date.now();
  const since = (d: number) => people.filter((one) => one.created > now - d * DAY_MS).length;
  const activeIn = (d: number) => people.filter((one) => one.lastActive !== null && one.lastActive > now - d * DAY_MS).length;
  const activated = people.filter((one) => one.documents > 0 || one.apps.length > 0 || one.keys > 0).length;
  const docs = people.reduce((sum, one) => sum + one.documents, 0);
  const stored = people.reduce((sum, one) => sum + one.bytes, 0);
  const verified = people.filter((one) => one.verified).length;

  const doorCounts = DOORS.map((door) => ({
    door: door.id,
    n: people.filter((one) => one.door === door.id).length,
  })).filter((one) => one.n > 0);

  const appUsers = DOORS.filter((door) => door.id !== 'site')
    .map((door) => {
      const users = people.filter((one) => one.apps.some((app) => app.label === door.id));

      return {
        door: door.id,
        n: users.length,
        active: users.filter((one) => one.apps.some((app) => app.label === door.id && app.active)).length,
      };
    })
    .filter((one) => one.n > 0);

  const obsidian = people.filter((one) => one.apps.some((app) => app.label === 'obsidian'));
  const obsidianStarts = counters.funnel
    .filter((one) => one.client === 'obsidian' && one.step === 'start')
    .reduce((sum, one) => sum + one.n, 0);

  const filters = [
    `<button class="f" type="button" data-door="active" aria-pressed="false">Active 30d</button>`,
    `<button class="f" type="button" data-door="idle" aria-pressed="false">Never used</button>`,
    ...doorCounts.map(
      (one) =>
        `<button class="f ${doorSlot(one.door)}" type="button" data-door="${one.door}" aria-pressed="false"><i></i>${escapeHtml(
          doorName(one.door)
        )} ${one.n}</button>`
    ),
  ].join('');

  const rows = people
    .map((p) => {
      const idle = p.documents === 0 && p.apps.length === 0 && p.keys === 0;
      const share = Math.min(100, (p.bytes / QUOTA.bytes) * 100);
      const apps = [...new Set(p.apps.map((one) => one.label))]
        .map((label) => {
          const app = p.apps.find((one) => one.label === label)!;

          return badge(label, `${app.name} · since ${date(app.first)}${app.active ? '' : ' · disconnected'}`);
        })
        .join('');
      const text = [p.name, p.email, doorName(p.door), p.doorClient ?? '', ...p.apps.map((a) => a.name), p.providers.join(' ')]
        .join(' ')
        .toLowerCase();

      return `<tr class="row" data-href="/admin/u/${p.id}" data-door="${p.door}" data-text="${escapeHtml(text)}"
        data-active="${p.lastActive !== null && p.lastActive > now - 30 * DAY_MS ? 1 : 0}" data-idle="${idle ? 1 : 0}"
        data-name="${escapeHtml((p.name || p.email).toLowerCase())}" data-created="${p.created}" data-docs="${p.documents}"
        data-bytes="${p.bytes}" data-shared="${p.sharedLink + p.sharedPeople}" data-views="${p.shareViews}"
        data-apps="${p.apps.length}" data-keys="${p.activeKeys}" data-last="${p.lastActive ?? 0}" data-doorsort="${p.door}">
        <td><div class="who">${avatar(p)}<div><b>${escapeHtml(p.name || '—')}</b><small>${escapeHtml(p.email)}</small></div></div></td>
        <td>${badge(p.door, p.doorClient ?? 'Signed up on the site')}</td>
        <td data-tip="${escapeHtml(dateTime(p.created))} UTC">${date(p.created)}</td>
        <td>${p.verified ? '<span class="ok">✓</span>' : '<span class="no">no</span>'} <span class="mute">${escapeHtml(
          p.providers.join(', ')
        )}</span></td>
        <td class="n">${p.documents || '<span class="mute">0</span>'}</td>
        <td class="n" data-tip="${escapeHtml(`${bytes(p.bytes)} of ${bytes(QUOTA.bytes)} (${share.toFixed(1)}%)`)}">${
          p.bytes ? bytes(p.bytes) : '<span class="mute">—</span>'
        }<span class="meter"><i style="width:${Math.max(share, p.bytes ? 2 : 0)}%"></i></span></td>
        <td class="n">${p.sharedLink + p.sharedPeople || '<span class="mute">0</span>'}${
          p.shareViews ? ` <span class="mute">· ${p.shareViews} views</span>` : ''
        }</td>
        <td><div class="chips">${apps || '<span class="mute">—</span>'}</div></td>
        <td class="n">${p.activeKeys || '<span class="mute">0</span>'}</td>
        <td data-tip="${escapeHtml(dateTime(p.lastActive))}">${idle && p.lastActive === null ? '<span class="mute">never</span>' : ago(p.lastActive, now)}</td>
      </tr>`;
    })
    .join('');

  const body = `<main>
  <div class="top">
    <div><h1>Users</h1><div class="mute">Generated ${dateTime(now)} UTC · counters cover the last ${days} days</div></div>
    <div class="links">${
      brevoEnabled()
        ? '<form method="POST" action="/admin/brevo-sync" style="display:inline"><button class="f" type="submit">Sync to Brevo now</button></form>'
        : ''
    }<a href="?days=7">7d</a><a href="?days=30">30d</a><a href="?days=90">90d</a><a href="/admin/users.csv">Download CSV</a></div>
  </div>

  ${deleted ? '<p class="notice">Account deleted, with its documents, files, connections and keys.</p>' : ''}
  ${notice ? `<p class="notice">${escapeHtml(notice)}</p>` : ''}
  <section class="tiles">
    <div class="tile"><span>Accounts</span><b>${people.length}</b><small>+${since(7)} this week · +${since(30)} in 30 days</small></div>
    <div class="tile"><span>Confirmed address</span><b>${verified}</b><small>${people.length ? Math.round((verified / people.length) * 100) : 0}% of accounts</small></div>
    <div class="tile"><span>Ever used it</span><b>${activated}</b><small>saved, connected or made a key</small></div>
    <div class="tile"><span>Active</span><b>${activeIn(7)}</b><small>7 days · ${activeIn(30)} in 30</small></div>
    <div class="tile"><span>Documents</span><b>${docs}</b><small>${people.filter((one) => one.documents > 0).length} accounts have some</small></div>
    <div class="tile"><span>Stored</span><b>${bytes(stored)}</b><small>documents and revisions</small></div>
  </section>

  <section class="grid">
    <div class="card"><h2>How they arrived</h2>
      ${barList(
        doorCounts.map((one) => ({ label: badge(one.door), n: one.n, tip: `${one.n} accounts signed up through ${doorName(one.door)}` })),
        people.length
      )}
      <p class="note">An app is the door when its first connection came within two hours of the account being made — the
      sign-up happened to connect it. Everybody else signed up on the site.</p>
    </div>
    <div class="card"><h2>Connected apps, ever</h2>
      ${barList(
        appUsers.map((one) => ({ label: badge(one.door), n: one.n, tip: `${one.n} accounts connected it · ${one.active} still connected` })),
        0
      )}
      <p class="note">Accounts with at least one token for that app, whenever they joined. Hover for how many are still connected.</p>
    </div>
  </section>

  <section class="grid">
    <div class="card"><h2>Sign-ups per week</h2>${signupChart(people, now)}</div>
    <div class="card"><h2>Obsidian, end to end</h2>
      <dl class="facts">
        <dt>Sign-in started from the plugin (${days}d)</dt><dd>${obsidianStarts}</dd>
        <dt>Accounts that ever connected Obsidian</dt><dd>${obsidian.length}</dd>
        <dt>…of them still connected</dt><dd>${obsidian.filter((one) => one.apps.some((a) => a.label === 'obsidian' && a.active)).length}</dd>
        <dt>…signed up through Obsidian</dt><dd>${people.filter((one) => one.door === 'obsidian').length}</dd>
        <dt>…used it in the last 30 days</dt><dd>${
          obsidian.filter((one) => one.apps.some((a) => a.label === 'obsidian' && a.lastUsed !== null && a.lastUsed > now - 30 * DAY_MS)).length
        }</dd>
      </dl>
      <p class="note">The plugin's download count on obsidian.md counts every download of every release, updates included,
      and an install that never presses Sign in leaves nothing here. The funnel below shows where the rest stop.</p>
    </div>
  </section>

  <section class="grid">
    <div class="card"><h2>Connection funnel, last ${days} days</h2>${funnelTable(counters.funnel)}
      <p class="note">start: the app asked · signin: sent to sign in · consent: saw the approval page · approve / deny · token: the app
      collected its token. Daily totals from the counter, not people.</p>
    </div>
    <div class="card"><h2>Ratings from the emails</h2>${ratingsCard(counters.ratings)}${namedRatings(counters.named, now)}</div>
  </section>

  <section class="grid">
    <div class="card"><h2>Site visits by source, last ${days} days</h2>
      ${barList(
        counters.sources.slice(0, 12).map((one) => ({ label: escapeHtml(one.source || '—'), n: one.n })),
        counters.sources.reduce((sum, one) => sum + one.n, 0)
      )}
    </div>
  </section>

  <section class="card">
    <div class="toolbar">
      <input type="search" id="q" placeholder="Search name, email, app…" autocomplete="off">
      <span class="mute"><span id="shown">${people.length}</span> shown</span>
    </div>
    <div class="toolbar chips">${filters}</div>
    <div class="scroll">
      <table id="people">
        <thead><tr>
          <th data-sort="name">Person</th><th data-sort="doorsort">Arrived via</th><th data-sort="created" class="desc">Joined</th>
          <th>Confirmed</th><th class="n" data-sort="docs">Docs</th><th class="n" data-sort="bytes">Storage</th>
          <th class="n" data-sort="shared">Shared</th><th data-sort="apps">Apps</th><th class="n" data-sort="keys">API keys</th>
          <th data-sort="last">Last active</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>
</main>
<script>${SCRIPT}</script>`;

  return shell('Users', body);
}

/* ------------------------------------------------------------------------- one account in detail */

interface DocumentLine {
  id: string;
  name: string;
  kind: string;
  size: number;
  created_at: string | Date;
  updated_at: string | Date | null;
  share_mode: string;
  share_views: number;
  share_viewed_at: string | Date | null;
  share_expires_at: string | Date | null;
  has_password: boolean;
  recipients: number;
  revisions: number;
  has_summary: boolean;
}

interface KeyLine {
  name: string;
  prefix: string;
  created_at: string | Date;
  last_used_at: string | Date | null;
  revoked_at: string | Date | null;
}

interface HookLine {
  url: string;
  events: string[];
  created_at: string | Date;
  last_attempted_at: string | Date | null;
  last_status: number | null;
  revoked_at: string | Date | null;
}

interface SessionLine {
  created_at: string | Date;
  updated_at: string | Date;
  expires_at: string | Date;
  user_agent: string | null;
  ip: string | null;
}

async function personPage(id: string, viewer: SessionUser, saved = false): Promise<string | null> {
  const people = await loadPeople();
  const person = people.find((one) => one.id === id);

  if (!person) {
    return null;
  }

  /* The room this account has: a grant from the form below, or the default. */
  const granted = await rows<{ bytes_limit: string | null }>(sql()`
    select bytes_limit from m2h_user where user_id = ${id}
  `);
  const limit = granted[0]?.bytes_limit ? Number(granted[0].bytes_limit) : QUOTA.bytes;

  const [documents, keys, hooks, sessions] = await Promise.all([
    rows<DocumentLine>(sql()`
      select d.id, d.name, d.kind, d.size, d.created_at, d.updated_at, d.share_mode, d.share_views,
        d.share_viewed_at, d.share_expires_at, d.share_password_hash is not null as has_password,
        d.summary is not null as has_summary,
        (select count(*)::int from m2h_document_share s where s.document_id = d.id) as recipients,
        (select count(*)::int from m2h_document_revision r where r.document_id = d.id) as revisions
      from m2h_document d
      where d.user_id = ${id}
      order by d.created_at desc
      limit 500
    `),
    rows<KeyLine>(sql()`
      select name, prefix, created_at, last_used_at, revoked_at
      from m2h_api_key where user_id = ${id} order by created_at desc
    `),
    rows<HookLine>(sql()`
      select url, events, created_at, last_attempted_at, last_status, revoked_at
      from m2h_webhook where user_id = ${id} order by created_at desc
    `),
    optional<SessionLine>(sql()`
      select "createdAt" as created_at, "updatedAt" as updated_at, "expiresAt" as expires_at,
        "userAgent" as user_agent, "ipAddress" as ip
      from neon_auth.session where "userId" = ${id}
      order by "updatedAt" desc
      limit 20
    `),
  ]);

  const now = Date.now();
  const p = person;
  const kinds = Object.entries(p.kinds).sort((a, b) => b[1] - a[1]);

  const table = (head: string[], rows: string[], empty: string) =>
    rows.length === 0
      ? `<p class="mute">${empty}</p>`
      : `<div class="scroll"><table><thead><tr>${head.map((h) => `<th${h.startsWith('#') ? ' class="n"' : ''}>${escapeHtml(h.replace(/^#/, ''))}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;

  const appRows = p.apps.map(
    (a) => `<tr><td>${badge(a.label)}</td><td>${escapeHtml(a.name)}</td><td>${dateTime(a.first)}</td>
      <td>${ago(a.lastUsed, now)}</td><td>${a.active ? '<span class="ok">connected</span>' : '<span class="no">ended</span>'}</td></tr>`
  );
  const keyRows = keys.map(
    (k) => `<tr><td>${escapeHtml(k.name)}</td><td><code>${escapeHtml(k.prefix)}…</code></td><td>${dateTime(ms(k.created_at))}</td>
      <td>${ago(ms(k.last_used_at), now)}</td><td>${k.revoked_at ? `<span class="no">revoked ${date(ms(k.revoked_at))}</span>` : '<span class="ok">active</span>'}</td></tr>`
  );
  const hookRows = hooks.map(
    (h) => `<tr><td class="wrap"><code>${escapeHtml(h.url)}</code></td><td>${escapeHtml((h.events ?? []).join(', '))}</td><td>${date(ms(h.created_at))}</td>
      <td>${ago(ms(h.last_attempted_at), now)}${h.last_status ? ` · ${h.last_status}` : ''}</td>
      <td>${h.revoked_at ? '<span class="no">revoked</span>' : '<span class="ok">active</span>'}</td></tr>`
  );
  const sessionRows = sessions.map(
    (s) => `<tr><td>${dateTime(ms(s.created_at))}</td><td>${ago(ms(s.updated_at), now)}</td>
      <td data-tip="${escapeHtml(s.user_agent ?? '')}">${escapeHtml(s.user_agent ? device(s.user_agent) : '—')}</td>
      <td><code>${escapeHtml(s.ip ?? '—')}</code></td>
      <td>${(ms(s.expires_at) ?? 0) > now ? '<span class="ok">live</span>' : '<span class="no">expired</span>'}</td></tr>`
  );
  const docRows = documents.map((d) => {
    const share =
      d.share_mode === 'link'
        ? `link${d.has_password ? ' · password' : ''}${d.share_expires_at ? ` · until ${date(ms(d.share_expires_at))}` : ''}`
        : d.share_mode === 'people'
          ? `${d.recipients} ${d.recipients === 1 ? 'person' : 'people'}`
          : '<span class="mute">private</span>';

    return `<tr><td class="wrap">${escapeHtml(d.name)}${d.has_summary ? ' <span class="mute" title="Has an AI summary">✦</span>' : ''}</td>
      <td class="mute">${escapeHtml(d.kind)}</td><td class="n">${bytes(d.size)}</td><td>${dateTime(ms(d.created_at))}</td>
      <td>${d.updated_at ? dateTime(ms(d.updated_at)) : '<span class="mute">—</span>'}</td><td class="n">${d.revisions || '<span class="mute">0</span>'}</td>
      <td>${share}</td><td class="n">${d.share_views || '<span class="mute">0</span>'}${d.share_viewed_at ? ` <span class="mute">· ${ago(ms(d.share_viewed_at), now)}</span>` : ''}</td></tr>`;
  });

  const body = `<main>
  <div class="top"><a href="/admin" class="dim">← All users</a></div>
  <div class="head">${avatar(p, 56)}<div><h1>${escapeHtml(p.name || p.email)}</h1><div class="dim">${escapeHtml(p.email)}</div></div></div>

  <section class="tiles">
    <div class="tile"><span>Documents</span><b>${p.documents}</b><small>${p.revisions} revisions kept</small></div>
    <div class="tile"><span>Storage</span><b>${bytes(p.bytes)}</b><small>${((p.bytes / limit) * 100).toFixed(1)}% of ${bytes(limit)}${limit !== QUOTA.bytes ? ' · granted' : ''}</small></div>
    <div class="tile"><span>Shared</span><b>${p.sharedLink + p.sharedPeople}</b><small>${p.sharedLink} by link · ${p.sharedPeople} with people</small></div>
    <div class="tile"><span>Share views</span><b>${p.shareViews}</b><small>all links together</small></div>
    <div class="tile"><span>AI summaries</span><b>${p.summaries}</b><small>documents with one</small></div>
    <div class="tile"><span>Last active</span><b>${ago(p.lastActive, now)}</b><small>${dateTime(p.lastActive)}</small></div>
  </section>

  <section class="grid">
    <div class="card"><h2>Account</h2><dl class="facts">
      <dt>Arrived via</dt><dd>${badge(p.door)} ${p.doorClient ? `<span class="dim">${escapeHtml(p.doorClient)}</span>` : ''}</dd>
      <dt>Joined</dt><dd>${dateTime(p.created)} UTC</dd>
      <dt>Signs in with</dt><dd>${escapeHtml(p.providers.join(', ') || '—')}</dd>
      <dt>Address confirmed</dt><dd>${p.verified ? '<span class="ok">yes</span>' : '<span class="no">no</span>'}</dd>
      <dt>First document</dt><dd>${dateTime(p.firstDoc)}</dd>
      <dt>Last device</dt><dd>${escapeHtml(p.device ?? '—')}</dd>
      <dt>Webhooks</dt><dd>${p.webhooks}</dd>
      <dt>Id</dt><dd><code>${escapeHtml(p.id)}</code></dd>
    </dl></div>
    <div class="card"><h2>Conversions used</h2>
      ${barList(kinds.map(([kind, n]) => ({ label: escapeHtml(kind), n })), p.documents)}
    </div>
  </section>

  <section class="card" style="margin-bottom:12px"><h2>Connected apps</h2>
    ${table(['App', 'Client', 'First connected', 'Last used', 'Status'], appRows, 'No app has been connected.')}</section>
  <section class="card" style="margin-bottom:12px"><h2>API keys</h2>
    ${table(['Name', 'Prefix', 'Created', 'Last used', 'Status'], keyRows, 'No API keys.')}</section>
  ${hookRows.length ? `<section class="card" style="margin-bottom:12px"><h2>Webhooks</h2>${table(['URL', 'Events', 'Created', 'Last delivery', 'Status'], hookRows, '')}</section>` : ''}
  <section class="card" style="margin-bottom:12px"><h2>Sign-in sessions</h2>
    ${table(['Started', 'Last seen', 'Device', 'IP', 'Status'], sessionRows, 'No sessions on record.')}</section>
  <section class="card"><h2>Documents${documents.length === 500 ? ' (newest 500)' : ''}</h2>
    ${table(['Name', 'Conversion', '#Size', 'Created', 'Updated', '#Revisions', 'Shared', '#Views'], docRows, 'No documents.')}</section>
  ${limitCard(p.id, limit, saved)}
  ${dangerZone(p, viewer)}
</main>
<script>${SCRIPT}</script>`;

  return shell(p.name || p.email || 'User', body);
}

/*
 * Whether a POST came from this site's own page.
 *
 * The session cookie is SameSite=Lax, so a form posted from another site arrives without it and is
 * refused by the gate anyway; this is the second lock. A browser says where a request came from in
 * Sec-Fetch-Site, and failing that in Origin, which is compared by host with the Host the request
 * arrived on — not with selfOrigin(), which behind Vercel's proxy can name a different host from
 * the one in the browser's address bar, and refused the owner's own clicks.
 */
function sameSite(c: Context): boolean {
  const site = c.req.header('sec-fetch-site');

  if (site) {
    return site === 'same-origin';
  }

  const origin = c.req.header('origin');

  if (!origin) {
    return true;
  }

  try {
    const host = new URL(origin).host;

    return [c.req.header('host'), c.req.header('x-forwarded-host')].includes(host);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------------- deleting an account */

/** Why this account cannot be deleted from here, or null when it can. */
function undeletable(target: { id: string; email: string | null }, viewer: SessionUser): string | null {
  if (target.id === viewer.id) {
    return 'This is your own account. It cannot be deleted from here.';
  }

  if (target.email && admins().has(target.email.toLowerCase())) {
    return 'This address is on ADMIN_EMAILS. Take it off the list first.';
  }

  return null;
}

/** What has to be typed to confirm: the address, or the id for an account without one. */
const confirmation = (target: { id: string; email: string | null }) => target.email || target.id;

/** The sizes the form offers, in MB: the default first, then steps a person might ask for. */
const LIMIT_STEPS = [500, 1024, 2048, 5120, 10240];

/**
 * More room for one account, by hand — for the person moving a whole Confluence into it. A grant
 * is a number on `m2h_user`; every quota check reads it through `usageOf`, and "Default" clears it
 * so the account follows `QUOTA.bytes` again, wherever that moves.
 */
function limitCard(id: string, limit: number, saved: boolean): string {
  const mbOf = (n: number) => Math.round(n / 1048576);
  const current = limit === QUOTA.bytes ? 'default' : String(mbOf(limit));
  const options = [
    ['default', `Default — ${bytes(QUOTA.bytes)}`],
    ...LIMIT_STEPS.filter((one) => one !== mbOf(QUOTA.bytes)).map((one) => [String(one), bytes(one * 1048576)]),
    ...(current !== 'default' && !LIMIT_STEPS.includes(Number(current)) ? [[current, bytes(limit)]] : []),
  ];

  return `<section class="card"><h2>Storage limit</h2>
    ${saved ? '<p class="notice">Saved. The account has the new limit from its next request.</p>' : ''}
    <p class="dim">How much this account may store. Lowering it below what is already stored deletes nothing; the next save is refused.</p>
    <form method="POST" action="/admin/u/${escapeHtml(id)}/limit">
      <div class="toolbar">
        <select name="limit" aria-label="Storage limit">${options
          .map(([value, label]) => `<option value="${value}"${value === current ? ' selected' : ''}>${escapeHtml(label)}</option>`)
          .join('')}</select>
        <button type="submit" class="f">Save</button>
      </div>
    </form>
  </section>`;
}

function dangerZone(p: Person, viewer: SessionUser): string {
  const why = undeletable({ id: p.id, email: p.email || null }, viewer);
  const of = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const shared = p.sharedLink + p.sharedPeople;
  const what = [
    `${of(p.documents, 'document')} and their files`,
    p.revisions ? of(p.revisions, 'kept revision') : '',
    shared ? `${of(shared, 'shared document')}, whose links stop working` : '',
    p.apps.length ? `${of(p.apps.length, 'app connection')} (${[...new Set(p.apps.map((a) => doorName(a.label)))].join(', ')})` : '',
    p.keys ? of(p.keys, 'API key') : '',
    p.webhooks ? of(p.webhooks, 'webhook') : '',
    'the sign-in itself, with its sessions',
  ].filter(Boolean);

  if (why) {
    return `<section class="card danger"><h2>Delete account</h2><p class="mute">${escapeHtml(why)}</p></section>`;
  }

  return `<section class="card danger"><h2>Delete account</h2>
    <p class="dim">Deletes, permanently and at once:</p>
    <ul class="dim">${what.map((one) => `<li>${escapeHtml(one)}</li>`).join('')}</ul>
    <p class="dim">There is no undo and no trash. The person is not told. They can sign up again with the same address and start empty.</p>
    <form method="POST" action="/admin/u/${escapeHtml(p.id)}/delete" class="confirm">
      <label for="confirm">Type <code>${escapeHtml(confirmation({ id: p.id, email: p.email || null }))}</code> to confirm</label>
      <div class="toolbar">
        <input type="text" id="confirm" name="confirm" autocomplete="off" spellcheck="false" required>
        <button type="submit" class="destroy">Delete this account</button>
      </div>
    </form>
  </section>`;
}

/*
 * Everything the account owns, and the account: one transaction, so a statement that fails —
 * Neon Auth's tables refusing this role, say — leaves the account exactly as it was. The files in
 * the store go after the commit, from the paths the deletes returned; a file that fails to go is a
 * file nobody can reach, which is what `npm run blob:reconcile` sweeps.
 *
 * What stays: documents other people shared WITH this address (theirs, not this account's), and
 * the counter, which never knew who anybody was.
 */
async function deleteAccount(id: string): Promise<{ documents: number; files: number }> {
  const db = sql();
  const results = (await db.transaction([
    db`delete from m2h_document_revision
       where document_id in (select id from m2h_document where user_id = ${id})
       returning blob_path`,
    db`delete from m2h_document where user_id = ${id} returning blob_path`,
    db`delete from m2h_api_key where user_id = ${id}`,
    db`delete from m2h_webhook where user_id = ${id}`,
    db`delete from m2h_oauth_token where user_id = ${id}`,
    db`delete from m2h_oauth_code where user_id = ${id}`,
    db`delete from m2h_oauth_pending where shown_to = ${id}`,
    db`delete from m2h_user where user_id = ${id}`,
    db`delete from m2h_rating where user_id = ${id}`,
    // Rate and budget rows are keyed by a caller string that carries the id.
    db`delete from m2h_call where position(${id}::text in caller) > 0`,
    db`delete from m2h_ai_summary_call where position(${id}::text in caller) > 0`,
    db`delete from m2h_mail_call where position(${id}::text in caller) > 0`,
    db`delete from neon_auth.session where "userId" = ${id}`,
    db`delete from neon_auth.account where "userId" = ${id}`,
    db`delete from neon_auth."user" where id = ${id}`,
  ])) as unknown as Array<Array<{ blob_path?: string | null }>>;

  const files = [...results[0], ...results[1]].map((row) => row.blob_path ?? null);

  await deleteSources(files);

  return { documents: results[1].length, files: files.filter(Boolean).length };
}

/* ---------------------------------------------------------------------------------- the routes */

const admin = new Hono();

admin.get('/admin', async (c) => {
  const verdict = await admitted(c);

  if (typeof verdict === 'string') {
    return refused(c, verdict);
  }

  const days = Math.max(1, Math.min(365, Number(c.req.query('days')) || 30));
  const [people, counters] = await Promise.all([loadPeople(), loadCounters(days)]);

  const synced = c.req.query('synced');

  return c.html(
    overviewPage(people, counters, days, c.req.query('deleted') === '1', synced ? `Brevo: ${synced}` : ''),
    200,
    PRIVATE_HEADERS
  );
});

admin.get('/admin/u/:id', async (c) => {
  const verdict = await admitted(c);

  if (typeof verdict === 'string') {
    return refused(c, verdict);
  }

  const id = c.req.param('id');
  const page = looksLikeId(id) ? await personPage(id, verdict, c.req.query('saved') === 'limit') : null;

  return page ? c.html(page, 200, PRIVATE_HEADERS) : c.text('No such account', 404, PRIVATE_HEADERS);
});

/* A grant of room for one account — see `limitCard`. Locked the way deleting is. */
admin.post('/admin/u/:id/limit', async (c) => {
  const verdict = await admitted(c);

  if (typeof verdict === 'string') {
    return refused(c, verdict);
  }

  if (!sameSite(c)) {
    return c.text('Forbidden', 403, PRIVATE_HEADERS);
  }

  const id = c.req.param('id');

  if (!looksLikeId(id)) {
    return c.text('No such account', 404, PRIVATE_HEADERS);
  }

  const form = await c.req.parseBody();
  const asked = String(form.limit ?? '');
  // Megabytes, between the default's floor of 1 MB and 100 GB; anything else is not a size.
  const mbAsked = asked === 'default' ? null : Number(asked);

  if (mbAsked !== null && (!Number.isInteger(mbAsked) || mbAsked < 1 || mbAsked > 102400)) {
    return c.text('That is not a size', 400, PRIVATE_HEADERS);
  }

  const exists = await rows<{ id: string }>(sql()`select id from neon_auth."user" where id = ${id}`);

  if (!exists[0]) {
    return c.text('No such account', 404, PRIVATE_HEADERS);
  }

  const value = mbAsked === null ? null : mbAsked * 1048576;

  /*
   * A row made here for an account that had none is marked as welcomed: a row with no welcome is
   * an account owed the welcome email, and granting it room is not a reason to send one.
   */
  await sql()`
    insert into m2h_user (user_id, bytes_limit, welcomed_at) values (${id}, ${value}, now())
    on conflict (user_id) do update set bytes_limit = excluded.bytes_limit
  `;
  // Who and how much, for the function log; no address.
  console.info(`admin: storage limit for ${id} set to ${value === null ? 'default' : `${mbAsked} MB`}`);

  return c.redirect(`/admin/u/${id}?saved=limit`, 303);
});

admin.post('/admin/u/:id/delete', async (c) => {
  const verdict = await admitted(c);

  if (typeof verdict === 'string') {
    return refused(c, verdict);
  }

  /*
   * The session cookie is SameSite=Lax, so a form posted from another site arrives without it and
   * stops above. This is the second lock: a browser that says where the post came from has to say
   * here.
   */
  if (!sameSite(c)) {
    return c.text('Forbidden', 403, PRIVATE_HEADERS);
  }

  const id = c.req.param('id');

  if (!looksLikeId(id)) {
    return c.text('No such account', 404, PRIVATE_HEADERS);
  }

  const found = await rows<{ id: string; email: string | null }>(sql()`
    select id, email from neon_auth."user" where id = ${id}
  `);
  const target = found[0];

  if (!target) {
    return c.text('No such account', 404, PRIVATE_HEADERS);
  }

  const back = (message: string, status: 400 | 409 | 500) =>
    c.html(
      shell(
        'Not deleted',
        `<main class="narrow"><h1>Not deleted</h1><p class="dim">${escapeHtml(message)}</p>
         <p><a href="/admin/u/${escapeHtml(id)}">← Back to the account</a></p></main>`
      ),
      status,
      PRIVATE_HEADERS
    );

  const why = undeletable(target, verdict);

  if (why) {
    return back(why, 409);
  }

  const form = await c.req.parseBody();
  const typed = String(form.confirm ?? '').trim().toLowerCase();

  if (typed !== confirmation(target).toLowerCase()) {
    return back('What was typed did not match, so nothing was deleted.', 400);
  }

  try {
    const done = await deleteAccount(id);

    // Brevo would otherwise go on writing to the address of an account that no longer exists.
    if (target.email) {
      await forgetContact(target.email);
    }

    // The id and the counts, for the function log; no address.
    console.info(`admin: deleted account ${id} (${done.documents} documents, ${done.files} files)`);
  } catch (error) {
    console.error(`admin: deleting account ${id} failed`, error);

    return back(
      `The database refused (${error instanceof Error ? error.message : 'unknown error'}). Nothing was deleted: it all runs in one transaction.`,
      500
    );
  }

  return c.redirect('/admin?deleted=1', 303);
});

/** Runs the Brevo sync and says what it did, in words for the notice line. */
async function runSync(): Promise<string> {
  const done = await syncToBrevo(await loadPeople(), admins());
  const enrolled = Object.entries(done.enrolled)
    .map(([flow, n]) => `${n} into ${flow}`)
    .join(', ');

  return `${done.updated} contacts written, ${done.removed} removed, ${done.skipped} unconfirmed skipped; ${
    done.enrolling ? `enrolled ${enrolled || 'nobody new'}` : 'enrolment is off (BREVO_ENROLL_SINCE is not set)'
  }.`;
}

admin.post('/admin/brevo-sync', async (c) => {
  const verdict = await admitted(c);

  if (typeof verdict === 'string') {
    return refused(c, verdict);
  }

  if (!sameSite(c)) {
    return c.text('Forbidden', 403, PRIVATE_HEADERS);
  }

  let said: string;

  try {
    said = await runSync();
  } catch (error) {
    said = `failed — ${error instanceof Error ? error.message : 'unknown error'}`;
  }

  return c.redirect(`/admin?synced=${encodeURIComponent(said)}`, 303);
});

/*
 * The ten-minute run, from vercel.json's `crons`. Vercel sends `Authorization: Bearer $CRON_SECRET`;
 * without the variable set nothing can call this, so it cannot be set off from outside.
 */
admin.get('/api/cron/brevo', async (c) => {
  const secret = process.env.CRON_SECRET;

  if (!secret || c.req.header('authorization') !== `Bearer ${secret}`) {
    return c.text('Unauthorized', 401);
  }

  if (!brevoEnabled()) {
    return c.json({ ok: true, skipped: 'BREVO_API_KEY is not set' });
  }

  try {
    const said = await runSync();

    console.info(`brevo: ${said}`);

    return c.json({ ok: true, said });
  } catch (error) {
    console.error('brevo: sync failed', error);

    return c.json({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }, 500);
  }
});

admin.get('/admin/users.csv', async (c) => {
  const verdict = await admitted(c);

  if (typeof verdict === 'string') {
    return refused(c, verdict);
  }

  const people = await loadPeople();
  const cell = (value: unknown) => {
    const text = String(value ?? '');

    // A leading = + - @ would be a formula to a spreadsheet; names are typed by strangers.
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;

    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const head = [
    'id', 'name', 'email', 'verified', 'providers', 'joined', 'arrived_via', 'arrived_client', 'apps', 'documents',
    'bytes', 'revisions', 'shared_link', 'shared_people', 'share_views', 'summaries', 'active_api_keys', 'webhooks',
    'last_active',
  ];
  const lines = people.map((p) =>
    [
      p.id, p.name, p.email, p.verified, p.providers.join(' '), new Date(p.created).toISOString(), p.door,
      p.doorClient ?? '', [...new Set(p.apps.map((a) => a.label))].join(' '), p.documents, p.bytes, p.revisions,
      p.sharedLink, p.sharedPeople, p.shareViews, p.summaries, p.activeKeys, p.webhooks,
      p.lastActive === null ? '' : new Date(p.lastActive).toISOString(),
    ]
      .map(cell)
      .join(',')
  );

  return c.body([head.join(','), ...lines].join('\n'), 200, {
    ...PRIVATE_HEADERS,
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="transformpipe-users-${new Date().toISOString().slice(0, 10)}.csv"`,
  });
});

export default admin;
