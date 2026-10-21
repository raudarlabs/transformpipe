import type { Hono } from 'hono';
import { sql } from './db.js';

/*
 * A new account's first three steps, for the checklist in the history (src/components/StartHere.tsx):
 * a document saved, something shared, an assistant or a script connected. Each step is read from
 * what the account has actually done, never ticked by hand, so the list cannot say something is
 * done that is not — and a step done elsewhere (in Claude, from the plugin) counts the same.
 *
 * For accounts made from the day it shipped, and for older ones that had saved nothing by then.
 * Somebody who has used TransformPipe for a month does not need to be told how; and an account that
 * hides it, or finishes it, does not see it again.
 */
export const ONBOARDING_SINCE = '2026-10-21';

export interface Onboarding {
  show: boolean;
  steps: { saved: boolean; shared: boolean; connected: boolean };
  /** The newest document, for the share step's button to open. */
  latest: { id: string; name: string } | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerOnboarding(api: Hono<any>) {
  api.get('/onboarding', async (c) => {
    const userId = c.get('user').id as string;
    const [row] = (await sql()`
      select
        u."createdAt" >= ${ONBOARDING_SINCE}::date
          -- An older account that had kept nothing by then has never been shown what to do either. Asked
          -- of before that day, so the list does not vanish the moment its first step is done.
          or not exists (
            select 1 from m2h_document where user_id = u.id and created_at < ${ONBOARDING_SINCE}::date
          ) as is_new,
        (select onboarding_hidden_at is not null from m2h_user where user_id = u.id) as hidden,
        exists (select 1 from m2h_document where user_id = u.id) as saved,
        exists (select 1 from m2h_document where user_id = u.id and share_mode <> 'private')
          or exists (select 1 from m2h_folder where user_id = u.id and share_mode <> 'private') as shared,
        exists (select 1 from m2h_oauth_token where user_id = u.id and revoked_at is null)
          or exists (select 1 from m2h_api_key where user_id = u.id and revoked_at is null) as connected,
        (select json_build_object('id', id, 'name', name) from m2h_document
          where user_id = u.id order by created_at desc limit 1) as latest
      from neon_auth."user" u where u.id = ${userId}
    `) as Array<{
      is_new: boolean;
      hidden: boolean | null;
      saved: boolean;
      shared: boolean;
      connected: boolean;
      latest: { id: string; name: string } | null;
    }>;

    if (!row) return c.json({ show: false, steps: { saved: false, shared: false, connected: false }, latest: null });

    const steps = { saved: row.saved, shared: row.shared, connected: row.connected };
    const done = steps.saved && steps.shared && steps.connected;

    c.header('cache-control', 'private, no-store');

    return c.json({ show: row.is_new && !row.hidden && !done, steps, latest: row.latest } satisfies Onboarding);
  });

  /* Hidden for good, on every device: a choice about the account, not about this browser. */
  api.post('/onboarding/hide', async (c) => {
    const userId = c.get('user').id as string;

    await sql()`
      insert into m2h_user (user_id, onboarding_hidden_at) values (${userId}, now())
      on conflict (user_id) do update set onboarding_hidden_at = now()
    `;

    return c.json({ ok: true });
  });
}
