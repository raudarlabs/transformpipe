-- A read-only window for the owner's dashboard: counts, and nothing that says who.
--
-- Not part of db/schema.sql and not run by `npm run db:init`. It is run by hand, in the Neon SQL
-- editor, by the role that owns the tables (the one in DATABASE_URL). Safe to run again: every
-- statement below replaces or re-grants what it made last time.
--
-- The shape: a schema `radar` holding views, and a login role that can read those views and
-- nothing else. A view runs with its owner's rights, not the reader's, so `radar_reader` reads the
-- totals a view computes without holding any privilege on the tables underneath. That only holds
-- while the views are NOT created `with (security_invoker = true)`, and none of these are.
--
-- What no view exposes: an email, a name, a document's name or Markdown, a summary, a token or its
-- hash, an id of any kind, a URL, an address. Every column is a day or a week, a label from a
-- short fixed list, or a number. A new view added here has to keep to that, or it does not belong.
--
-- The role itself is created once, by hand, with a password generated for it — see the first
-- statement, which is commented out so that running this file can never set the placeholder as a
-- real password. No password is ever written in this repository.

-- create role radar_reader with login password '<set-in-neon-console>';

alter role radar_reader set default_transaction_read_only = on;
alter role radar_reader set statement_timeout = '15s';
alter role radar_reader set search_path = radar;
alter role radar_reader set timezone = 'UTC';

create schema if not exists radar;

-- Nobody but the grants below.
revoke all on schema radar from public;

-- The first-party counter, as it is: see db/schema.sql and shared/usage.ts. Already aggregate.
create or replace view radar.usage_daily as
  select day, event, key, lang, source, campaign, count
  from public.m2h_usage_daily;

-- Accounts registered per day, and how many of those have confirmed their address since.
create or replace view radar.signups_daily as
  select
    ("createdAt" at time zone 'UTC')::date as day,
    count(*)::int as signups,
    count(*) filter (where "emailVerified")::int as confirmed
  from neon_auth."user"
  group by 1;

-- Accounts used for the first time per day: the first save, the first connection.
create or replace view radar.first_use_daily as
  select
    (first_seen_at at time zone 'UTC')::date as day,
    count(*)::int as accounts
  from public.m2h_user
  group by 1;

-- Documents saved per day, by the conversion that made them, from every door: the app, the API,
-- an assistant. A deleted document is gone from these totals, because its row is gone.
create or replace view radar.documents_daily as
  select
    (created_at at time zone 'UTC')::date as day,
    kind,
    count(*)::int as documents,
    count(*) filter (where share_mode = 'link')::int as shared_by_link,
    count(*) filter (where share_mode = 'people')::int as shared_with_people
  from public.m2h_document
  group by 1, 2;

-- Addresses a document was shared with, per day. The count of them, never the addresses.
create or replace view radar.share_recipients_daily as
  select
    (created_at at time zone 'UTC')::date as day,
    count(*)::int as recipients,
    count(distinct document_id)::int as documents
  from public.m2h_document_share
  group by 1;

-- Assistants connected per day, by which assistant. One grant is one connection, however many
-- times its tokens were refreshed since. The client's own name is reduced to a label here, so a
-- name a client chose for itself never reaches the dashboard.
create or replace view radar.connections_daily as
  select
    (g.started at time zone 'UTC')::date as day,
    case
      when g.client_id ilike '%claude.ai%' or c.name ilike '%claude%' then 'claude'
      when g.client_id ilike '%chatgpt.com%' or g.client_id ilike '%openai.com%'
        or c.name ilike '%chatgpt%' or c.name ilike '%openai%' then 'chatgpt'
      when c.name ilike '%cursor%' then 'cursor'
      when c.name ilike '%visual studio code%' or c.name ilike '%vscode%' then 'vscode'
      when c.name ilike '%windsurf%' then 'windsurf'
      when c.name ilike '%gemini%' then 'gemini'
      when c.name ilike 'transformpipe for %' then 'extension'
      else 'other'
    end as client,
    count(*)::int as connections
  from (
    select grant_id, min(created_at) as started, min(client_id) as client_id
    from public.m2h_oauth_token
    where grant_id is not null
    group by grant_id
  ) g
  left join public.m2h_oauth_client c on c.id = g.client_id
  group by 1, 2;

-- API keys created per day.
create or replace view radar.api_keys_daily as
  select
    (created_at at time zone 'UTC')::date as day,
    count(*)::int as keys
  from public.m2h_api_key
  group by 1;

-- The funnel, a week at a time (weeks start on Monday). Visits to shares from the counter, sign-ups
-- from the accounts, documents from the table — so `saves` is the app's Save button and
-- `documents` is everything that was kept, whichever door it came through.
create or replace view radar.funnel_weekly as
  with counted as (
    select
      date_trunc('week', day)::date as week,
      sum(count) filter (where event = 'visit') as visits,
      sum(count) filter (where event = 'view') as views,
      sum(count) filter (where event = 'convert') as conversions,
      sum(count) filter (where event = 'download') as downloads,
      sum(count) filter (where event = 'save') as saves,
      sum(count) filter (where event = 'share') as shares,
      sum(count) filter (where event = 'mcp') as mcp_calls,
      sum(count) filter (where event = 'api') as api_calls
    from public.m2h_usage_daily
    group by 1
  ),
  registered as (
    select date_trunc('week', "createdAt" at time zone 'UTC')::date as week, count(*) as signups
    from neon_auth."user"
    group by 1
  ),
  kept as (
    select date_trunc('week', created_at at time zone 'UTC')::date as week, count(*) as documents
    from public.m2h_document
    group by 1
  )
  select
    week,
    coalesce(visits, 0)::int as visits,
    coalesce(views, 0)::int as views,
    coalesce(conversions, 0)::int as conversions,
    coalesce(downloads, 0)::int as downloads,
    coalesce(saves, 0)::int as saves,
    coalesce(signups, 0)::int as signups,
    coalesce(shares, 0)::int as shares,
    coalesce(documents, 0)::int as documents,
    coalesce(mcp_calls, 0)::int as mcp_calls,
    coalesce(api_calls, 0)::int as api_calls
  from counted
  full join registered using (week)
  full join kept using (week);

-- The grants: the schema, and these views by name. Nothing on public, nothing on neon_auth.
grant usage on schema radar to radar_reader;

grant select on
  radar.usage_daily,
  radar.signups_daily,
  radar.first_use_daily,
  radar.documents_daily,
  radar.share_recipients_daily,
  radar.connections_daily,
  radar.api_keys_daily,
  radar.funnel_weekly
to radar_reader;

-- To check, in the same editor. `has_table_privilege` answers for the role without switching to
-- it, and counts what it inherits from PUBLIC. The first query should list the eight radar views
-- and nothing else; in the second, only `funnel` should be true.
--
--   select n.nspname as schema, c.relname as relation
--   from pg_class c join pg_namespace n on n.oid = c.relnamespace
--   where c.relkind in ('r', 'v', 'm', 'p', 'f')
--     and n.nspname not in ('pg_catalog', 'information_schema')
--     and has_table_privilege('radar_reader', c.oid, 'select')
--   order by 1, 2;
--
--   select
--     has_table_privilege('radar_reader', 'public.m2h_document', 'select') as documents,
--     has_table_privilege('radar_reader', 'public.m2h_usage_daily', 'select') as raw_usage,
--     has_table_privilege('radar_reader', 'neon_auth."user"', 'select') as users,
--     has_table_privilege('radar_reader', 'radar.funnel_weekly', 'select') as funnel;
