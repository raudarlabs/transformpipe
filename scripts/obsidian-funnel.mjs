// Where people stop between installing the Obsidian plugin and having an account that uses it.
//
//   node scripts/obsidian-funnel.mjs [days]
//
// Reads DATABASE_URL from .env.local and prints totals only — no address, name, id or document
// ever leaves the database through this script. Read-only: every statement is a select.
//
// What each table can still say: a pending sign-in is swept once it expires (half an hour), and a
// code a day after it expires, so those two show the last day or so at best. Tokens are kept, and
// the `oauth` counter in m2h_usage_daily keeps every day from the deploy that added it.

import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const days = Math.max(1, Math.min(90, Number(process.argv[2]) || 7));

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => {
      const at = line.indexOf('=');

      return [line.slice(0, at), line.slice(at + 1).trim().replace(/^"|"$/g, '')];
    })
);

if (!env.DATABASE_URL) {
  console.error('No DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(env.DATABASE_URL);
const OBSIDIAN = 'transformpipe-obsidian';

function show(title, rows) {
  console.log(`\n${title}`);

  if (rows.length === 0) {
    console.log('  (none)');
  } else {
    console.table(rows);
  }
}

const [signups, tokens, firstTokens, codes, pending, counter, pages] = await Promise.all([
  sql`
    select ("createdAt" at time zone 'UTC')::date::text as day,
           count(*)::int as signups,
           count(*) filter (where "emailVerified")::int as confirmed
    from neon_auth."user"
    where "createdAt" > now() - make_interval(days => ${days})
    group by 1 order by 1
  `,
  sql`
    select count(distinct user_id)::int as accounts_ever,
           count(distinct user_id) filter (where revoked_at is null
             and (expires_at is null or expires_at > now()))::int as accounts_connected_now,
           count(distinct user_id) filter (where last_used_at > now() - make_interval(days => ${days}))::int
             as accounts_used_recently
    from m2h_oauth_token where client_id = ${OBSIDIAN}
  `,
  sql`
    select (first at time zone 'UTC')::date::text as day, count(*)::int as accounts_first_signed_in
    from (
      select user_id, min(created_at) as first from m2h_oauth_token
      where client_id = ${OBSIDIAN} group by 1
    ) f
    where first > now() - make_interval(days => ${days})
    group by 1 order by 1
  `,
  sql`
    select (expires_at at time zone 'UTC')::date::text as day,
           count(*)::int as approved, count(used_at)::int as returned_to_obsidian
    from m2h_oauth_code where client_id = ${OBSIDIAN}
    group by 1 order by 1
  `,
  sql`
    select count(*)::int as started,
           count(shown_to)::int as reached_consent,
           count(approved_at)::int as approved,
           count(*) filter (where shown_to is null and expires_at < now())::int
             as gave_up_at_sign_in
    from m2h_oauth_pending where params->>'client_id' = ${OBSIDIAN}
  `,
  sql`
    select day::text, key as step, source as client, sum(count)::int as n
    from m2h_usage_daily
    where event = 'oauth' and day > current_date - ${days}::int
    group by 1, 2, 3 order by 1, 3, 2
  `,
  sql`
    select day::text, event, key, sum(count)::int as n
    from m2h_usage_daily
    where day > current_date - ${days}::int
      and (key ilike '%obsidian%' or (event = 'nudge' and key ilike '%obsidian%'))
    group by 1, 2, 3 order by 1, 2, 3
  `,
]);

console.log(`TransformPipe — the Obsidian sign-in, last ${days} days (UTC). Counts only.`);

show('Accounts registered, all doors', signups);
show('Obsidian connections (tokens, kept for good)', tokens);
show('Accounts that signed in from Obsidian for the first time', firstTokens);
show('Approvals and whether Obsidian collected them (last day or so only)', codes);
show('Sign-ins from Obsidian still on record (unexpired or not yet swept)', pending);
show('Connection funnel from the counter: start → signin → consent → approve → token', counter);
show('Obsidian page visits, nudges and downloads from the counter', pages);
