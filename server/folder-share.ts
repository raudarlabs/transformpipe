import { randomBytes, randomUUID } from 'node:crypto';
import type { Context, Hono } from 'hono';
import { stream } from 'hono/streaming';
import { getCookie } from 'hono/cookie';
import { CONVERSIONS } from '../shared/conversions.js';
import { currentUser, selfOrigin } from './auth.js';
import { looksLikeId, searchText, sql } from './db.js';
import { room } from './folders.js';
import { PUBLISH_UNVERIFIED, countShareMail, mayPublishPublicly } from './limits.js';
import { sendShareNotice } from './mail.js';
import { normaliseEmail, readExpiry, type NamedReader, type ShareMode } from './share-gate.js';
import { hashPassword, readPassword, unlockCookie, unlocked } from './share-password.js';
import { deleteSources, putSource, readSource } from './source.js';

/*
 * A folder shared the way a document is.
 *
 * Three modes, as a document has: private; a link anybody holding it can read, with an expiry and
 * a password if the owner wants them; or named addresses, each of which has to sign in as itself.
 * The questions are asked in the order `shareGate` asks them for a document — a token nobody holds,
 * an ended link, the named reader, the password — and the password cookie is the document's own
 * mechanism (server/share-password.ts), keyed by this token.
 *
 * What a reader can do with it is read it, at /f/<token> (server/folder-page.ts), and — signed in —
 * keep a copy of all of it: every folder and every page, with the links between the pages pointed
 * at the copies, so the copy is a space of its own and not a list of links back into somebody
 * else's.
 */

export interface SharedFolder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  share_mode: Exclude<ShareMode, 'private'>;
  share_expires_at: string | null;
  share_password_hash: string | null;
}

export type FolderVerdict =
  | { ok: true; folder: SharedFolder; expiresAt: Date | null; reader: NamedReader | null; locked: boolean }
  | { ok: false; why: 'missing' }
  | { ok: false; why: 'expired'; expiredAt: Date }
  | { ok: false; why: 'sign-in' | 'not-yours' }
  | { ok: false; why: 'password'; hash: string };

/** Whether this caller may read the folder behind this token — see `shareGate`, whose order this keeps. */
export async function folderGate(c: Context, token: string): Promise<FolderVerdict> {
  if (!/^[A-Za-z0-9_-]{10,60}$/.test(token)) return { ok: false, why: 'missing' };

  const rows = (await sql()`
    select id::text, user_id::text, name, created_at, share_mode, share_expires_at, share_password_hash,
           coalesce(share_expires_at <= now(), false) as expired
    from m2h_folder
    where share_token = ${token}
  `) as Array<Omit<SharedFolder, 'share_mode'> & { share_mode: ShareMode; expired: boolean }>;
  const row = rows[0];

  if (!row || row.share_mode === 'private') return { ok: false, why: 'missing' };
  if (row.expired) return { ok: false, why: 'expired', expiredAt: new Date(row.share_expires_at!) };

  let reader: NamedReader | null = null;

  if (row.share_mode === 'people') {
    const user = await currentUser(c);

    if (!user) return { ok: false, why: 'sign-in' };

    const isOwner = user.id === row.user_id;
    const allowed =
      isOwner ||
      ((await sql()`
        select 1 from m2h_folder_share where folder_id = ${row.id} and email = ${normaliseEmail(user.email)}
      `) as unknown[]).length > 0;

    if (!allowed) return { ok: false, why: 'not-yours' };

    reader = { email: normaliseEmail(user.email), isOwner };
  }

  const locked = row.share_mode === 'link' && Boolean(row.share_password_hash);

  if (
    locked &&
    !unlocked(token, row.share_password_hash!, getCookie(c, unlockCookie(token))) &&
    (await currentUser(c))?.id !== row.user_id
  ) {
    return { ok: false, why: 'password', hash: row.share_password_hash! };
  }

  const { expired: _, ...folder } = row;

  return {
    ok: true,
    folder: folder as SharedFolder,
    expiresAt: row.share_expires_at ? new Date(row.share_expires_at) : null,
    reader,
    locked,
  };
}

export interface FolderTree {
  folders: Array<{ id: string; parent_id: string | null; name: string; source: string | null }>;
  documents: Array<{
    id: string;
    user_id: string;
    name: string;
    kind: string;
    created_at: string;
    size: number;
    stats: Record<string, number> | null;
    folder_id: string;
    position: number | null;
    markdown: string | null;
    blob_path: string | null;
  }>;
}

/** A folder, everything under it, and every document in any of them — as they are filed now. */
export async function treeOf(folderId: string, userId: string, withSources = false): Promise<FolderTree> {
  const folders = (await sql()`
    with recursive tree as (
      select id, parent_id, name, source from m2h_folder where id = ${folderId} and user_id = ${userId}
      union all
      select f.id, f.parent_id, f.name, f.source from m2h_folder f join tree t on f.parent_id = t.id
    )
    select id::text, parent_id::text, name, source from tree
  `) as FolderTree['folders'];
  const ids = folders.map((one) => one.id);
  const documents = (withSources
    ? await sql()`
        select id::text, user_id::text, name, kind, created_at, size, stats, folder_id::text, position, markdown, blob_path
        from m2h_document where user_id = ${userId} and folder_id = any(${ids}::uuid[])
      `
    : await sql()`
        select id::text, user_id::text, name, kind, created_at, size, stats, folder_id::text, position,
               null as markdown, null as blob_path
        from m2h_document where user_id = ${userId} and folder_id = any(${ids}::uuid[])
      `) as FolderTree['documents'];

  return { folders, documents };
}

/** The folder's sharing, as the dialog needs it — the shape a document's share has. */
async function shareState(userId: string, folderId: string) {
  if (!looksLikeId(folderId)) return null;

  const rows = (await sql()`
    select share_mode, share_token, share_expires_at, share_views, share_viewed_at, share_password_hash
    from m2h_folder where id = ${folderId} and user_id = ${userId}
  `) as Array<{
    share_mode: ShareMode;
    share_token: string | null;
    share_expires_at: string | null;
    share_views: number;
    share_viewed_at: string | null;
    share_password_hash: string | null;
  }>;

  if (rows.length === 0) return null;

  const emails = (await sql()`
    select email from m2h_folder_share where folder_id = ${folderId} order by created_at
  `) as Array<{ email: string }>;
  const row = rows[0];

  return {
    mode: row.share_mode,
    token: row.share_token,
    emails: emails.map((one) => one.email),
    expiresAt: row.share_expires_at ? new Date(row.share_expires_at).toISOString() : null,
    views: row.share_views ?? 0,
    lastViewedAt: row.share_viewed_at ? new Date(row.share_viewed_at).toISOString() : null,
    hasPassword: Boolean(row.share_password_hash),
  };
}

async function ensureToken(userId: string, folderId: string) {
  if (!looksLikeId(folderId)) return null;

  const rows = (await sql()`
    update m2h_folder set share_token = coalesce(share_token, ${randomBytes(16).toString('base64url')})
    where user_id = ${userId} and id = ${folderId}
    returning share_token
  `) as Array<{ share_token: string }>;

  return rows[0]?.share_token ?? null;
}

const LINK_PATHS = CONVERSIONS.map((one) => one.path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|');

/** Links between pages of the copied folder, written as `/<conversion>?doc=<id>`, pointed at the copies. */
function relink(markdown: string, ids: Map<string, string>): string {
  return markdown.replace(new RegExp(`((?:${LINK_PATHS})\\?doc=)([0-9a-f-]{36})`, 'g'), (whole, head: string, id: string) => {
    const copy = ids.get(id);

    return copy ? `${head}${copy}` : whole;
  });
}

/** `limit` at a time, in order: hundreds of stored files read at once would be refused by the store. */
async function pooled<T, R>(items: T[], limit: number, work: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;

        results[index] = await work(items[index], index);
      }
    })
  );

  return results;
}

/**
 * Everything under a shared folder, copied into another account: the folders as they are nested,
 * the pages in their order, and the links between pages pointed at the copies. All or nothing —
 * a copy that fails half way is taken back out, so the reader is not left with half a space.
 */
export type CopyProgress = { stage: 'reading' | 'writing'; done: number; total: number };

async function copyFolder(
  userId: string,
  source: SharedFolder,
  onProgress: (progress: CopyProgress) => void = () => undefined
): Promise<{ folderId: string; documents: number }> {
  const tree = await treeOf(source.id, source.user_id, true);
  let read = 0;

  onProgress({ stage: 'reading', done: 0, total: tree.documents.length });

  const texts = await pooled(tree.documents, 8, async (one) => {
    const text = await readSource(one);

    onProgress({ stage: 'reading', done: ++read, total: tree.documents.length });

    return text;
  });
  const pages = tree.documents
    .map((one, index) => ({ ...one, text: texts[index] }))
    .filter((one): one is typeof one & { text: string } => one.text !== null);
  const bytes = pages.reduce((sum, one) => sum + new TextEncoder().encode(one.text).length, 0);
  const fits = await room(userId, pages.length, bytes);

  if (!fits.ok) throw Object.assign(new Error(fits.error), { status: 403 });

  const folderIds = new Map(tree.folders.map((one) => [one.id, randomUUID()]));
  const documentIds = new Map(pages.map((one) => [one.id, randomUUID()]));
  const stored: Array<string | null> = [];
  let written = 0;

  await sql()`insert into m2h_user (user_id) values (${userId}) on conflict (user_id) do nothing`.catch(() => undefined);

  try {
    // Parents before children: the tree came out of a recursive query top down, but say so.
    const depth = (id: string): number => {
      const one = tree.folders.find((folder) => folder.id === id);

      return one?.parent_id && one.id !== source.id ? 1 + depth(one.parent_id) : 0;
    };

    onProgress({ stage: 'writing', done: 0, total: pages.length });

    for (const one of [...tree.folders].sort((a, b) => depth(a.id) - depth(b.id))) {
      await sql()`
        insert into m2h_folder (id, user_id, parent_id, name, source)
        values (${folderIds.get(one.id)!}, ${userId},
                ${one.id === source.id ? null : folderIds.get(one.parent_id!) ?? null},
                ${one.name}, ${one.source})
      `;
    }

    await pooled(pages, 6, async (one) => {
      const id = documentIds.get(one.id)!;
      const text = relink(one.text, documentIds);

      await sql()`
        insert into m2h_document (id, user_id, name, kind, size, markdown, stats, search, folder_id, position)
        values (${id}, ${userId}, ${one.name}, ${one.kind}, ${new TextEncoder().encode(text).length}, null,
                ${JSON.stringify(one.stats ?? {})}::jsonb, to_tsvector('simple', ${searchText(text)}),
                ${folderIds.get(one.folder_id)!}, ${one.position})
      `;

      const kept = await putSource(userId, id, text);

      stored.push(kept.blobPath);
      await sql()`update m2h_document set blob_path = ${kept.blobPath}, markdown = ${kept.markdown} where id = ${id}`;
      onProgress({ stage: 'writing', done: ++written, total: pages.length });
    });
  } catch (cause) {
    const made = [...documentIds.values()];

    await sql()`delete from m2h_document where user_id = ${userId} and id = any(${made}::uuid[])`.catch(() => undefined);
    await sql()`delete from m2h_folder where user_id = ${userId} and id = ${folderIds.get(source.id)!}`.catch(() => undefined);
    await deleteSources(stored).catch(() => undefined);

    throw cause;
  }

  return { folderId: folderIds.get(source.id)!, documents: pages.length };
}

/** What a reader is told when a copy fails: the room it needed, or that nothing was kept. */
const copyError = (cause: unknown) => {
  console.error('folder copy', cause instanceof Error ? cause.message : cause);

  return (cause as { status?: number }).status === 403
    ? (cause as Error).message
    : 'The copy could not be made. Nothing was kept; try again.';
};

const copyFailed = (c: Context, cause: unknown) =>
  c.json({ error: copyError(cause) }, (cause as { status?: number }).status === 403 ? 403 : 500);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Api = Hono<any>;

/**
 * A folder shared with you: what is in it, and keeping a copy. Registered before the routes that
 * need a session, because a link anyone can open is read without one; the copy asks for one itself.
 */
export function registerSharedFolders(api: Api) {
  api.get('/shared-folders/:token', async (c) => {
    c.header('cache-control', 'private, no-store');

    const verdict = await folderGate(c, c.req.param('token'));

    if (!verdict.ok) {
      switch (verdict.why) {
        case 'missing':
          return c.json({ error: 'Not found' }, 404);
        case 'expired':
          return c.json({ error: 'This link has expired' }, 410);
        case 'sign-in':
          return c.json({ error: 'Sign in to open this folder' }, 401);
        case 'not-yours':
          return c.json({ error: 'This folder was not shared with you' }, 403);
        case 'password':
          return c.json({ error: 'This link has a password. Open the link itself and enter it there.', password: true }, 401);
      }
    }

    const { folder } = verdict;
    const tree = await treeOf(folder.id, folder.user_id);
    const [owner] = (await sql()`
      select coalesce(email, '') as email from neon_auth."user" where id = ${folder.user_id}
    `.catch(() => [])) as Array<{ email: string }>;

    return c.json({
      folder: { name: folder.name, created_at: folder.created_at, owner: owner?.email ?? '' },
      folders: tree.folders.map(({ id, parent_id, name }) => ({ id, parent_id: id === folder.id ? null : parent_id, name })),
      documents: tree.documents.map(({ id, name, size, folder_id, position }) => ({ id, name, size, folder_id, position })),
      root: folder.id,
      mine: (await currentUser(c))?.id === folder.user_id,
    });
  });

  api.post('/shared-folders/:token/save', async (c) => {
    const user = await currentUser(c);

    if (!user) return c.json({ error: 'Sign in to keep a copy of this folder' }, 401);

    const verdict = await folderGate(c, c.req.param('token'));

    if (!verdict.ok) {
      return c.json({ error: verdict.why === 'expired' ? 'This link has expired' : 'This folder is not shared with you' }, verdict.why === 'expired' ? 410 : 404);
    }

    if (verdict.folder.user_id === user.id) {
      return c.json({ error: 'This folder is already yours' }, 409);
    }

    /*
     * A space of a few hundred pages takes a while to copy, so the answer is a stream of where it
     * has got to — one JSON object a line, `{stage, done, total}` — ending with the copy's id or
     * what went wrong. A caller that wants one answer asks without `?progress` and waits for it.
     */
    if (c.req.query('progress') === undefined) {
      try {
        return c.json(await copyFolder(user.id, verdict.folder), 201);
      } catch (cause) {
        return copyFailed(c, cause);
      }
    }

    c.header('content-type', 'application/x-ndjson; charset=utf-8');
    c.header('cache-control', 'no-store');
    c.header('x-accel-buffering', 'no');

    return stream(c, async (out) => {
      let last = 0;
      const line = (value: unknown) => out.write(`${JSON.stringify(value)}\n`);

      try {
        const copy = await copyFolder(user.id, verdict.folder, (progress) => {
          // A line a page is plenty; more than ten a second is noise for a progress bar.
          const now = Date.now();

          if (now - last > 100 || progress.done === progress.total || progress.done === 0) {
            last = now;
            void line(progress);
          }
        });

        await line({ done: true, ...copy });
      } catch (cause) {
        await line({ error: copyError(cause) });
      }
    });
  });

  /* Taking yourself off a folder shared with you — see `DELETE /shared-with-me/:id` for why quietly. */
  api.delete('/shared-folders/:id', async (c) => {
    const user = await currentUser(c);
    const id = c.req.param('id');

    if (!user) return c.json({ error: 'Not authenticated' }, 401);
    if (!looksLikeId(id)) return c.json({ error: 'Not found' }, 404);

    const removed = (await sql()`
      delete from m2h_folder_share where folder_id = ${id} and email = ${normaliseEmail(user.email)}
      returning folder_id
    `) as unknown[];

    return removed.length > 0 ? c.json({ ok: true }) : c.json({ error: 'Not shared with you' }, 404);
  });

  /* Folders other people shared with this address by name — a link is not addressed to anyone. */
  api.get('/shared-folders', async (c) => {
    const user = await currentUser(c);

    if (!user) return c.json({ error: 'Not authenticated' }, 401);

    const rows = (await sql()`
      select f.id::text, f.name, f.share_token, s.created_at as shared_at, coalesce(u.email, '') as owner_email,
             (with recursive tree as (
                select f.id as id
                union all
                select c.id from m2h_folder c join tree t on c.parent_id = t.id
              )
              select count(*)::int from m2h_document d where d.folder_id in (select id from tree)) as documents
      from m2h_folder_share s
      join m2h_folder f on f.id = s.folder_id
      left join neon_auth."user" u on u.id = f.user_id
      where s.email = ${normaliseEmail(user.email)}
        and f.share_mode = 'people'
        and f.user_id <> ${user.id}
        and (f.share_expires_at is null or f.share_expires_at > now())
      order by s.created_at desc
      limit 200
    `) as Array<{ id: string; name: string; share_token: string; shared_at: string; owner_email: string; documents: number }>;

    return c.json({ folders: rows });
  });
}

/** The owner's side: who may open the folder, until when, behind what. Behind `requireUser`. */
export function registerFolderSharing(api: Api) {
  api.get('/folders/:id/share', async (c) => {
    const state = await shareState(c.get('user').id, c.req.param('id'));

    return state ? c.json(state) : c.json({ error: 'Not found' }, 404);
  });

  /*
   * The document's own rules: a link asks for a confirmed address; going private forgets the token,
   * so a link that was sent stops, and the expiry and the count go with it; a password guards a
   * link and can be set ahead while still private. `shared: true|false` is the older form the first
   * folder link used, kept so a tab open across the deploy still works.
   */
  api.put('/folders/:id/share', async (c) => {
    const userId = c.get('user').id;
    const id = c.req.param('id');
    const body = (await c.req.json().catch(() => ({}))) as {
      mode?: unknown;
      shared?: unknown;
      expiresAt?: unknown;
      password?: unknown;
    };
    const mode =
      typeof body.shared === 'boolean' ? (body.shared ? 'link' : 'private') : (body.mode as ShareMode | undefined);

    if (!mode || !['private', 'link', 'people'].includes(mode)) {
      return c.json({ error: 'mode must be private, link or people' }, 400);
    }

    const expiry = readExpiry(body.expiresAt);

    if (!expiry.ok) return c.json({ error: expiry.error }, 400);

    const password = readPassword(body.password);

    if (!password.ok) return c.json({ error: password.error }, 400);

    if (typeof password.value === 'string' && mode === 'people') {
      return c.json(
        { error: 'A password protects a link. A share with specific people asks each of them to sign in instead.' },
        400
      );
    }

    if (mode === 'link' && !(await mayPublishPublicly(userId))) {
      return c.json({ error: PUBLISH_UNVERIFIED }, 403);
    }

    const hash = typeof password.value === 'string' ? await hashPassword(password.value) : null;

    if (mode === 'private') {
      await sql()`
        update m2h_folder
        set share_mode = 'private', share_token = null, share_expires_at = null, share_views = 0, share_viewed_at = null,
            share_password_hash = case when ${password.value !== undefined} then ${hash} else share_password_hash end
        where user_id = ${userId} and id = ${id}
      `;
    } else {
      if (!(await ensureToken(userId, id))) return c.json({ error: 'Not found' }, 404);

      await sql()`
        update m2h_folder
        set share_mode = ${mode},
            share_expires_at = case
              when ${expiry.value !== undefined} then ${expiry.value?.toISOString() ?? null}::timestamptz
              else share_expires_at
            end,
            share_password_hash = case when ${password.value !== undefined} then ${hash} else share_password_hash end
        where user_id = ${userId} and id = ${id}
      `;
    }

    const state = await shareState(userId, id);

    // `token` alone is what the older caller read.
    return state ? c.json(state) : c.json({ error: 'Not found' }, 404);
  });

  /* An address added, and told — once, rationed per account like a document's notices. */
  api.post('/folders/:id/share/people', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = (await c.req.json().catch(() => ({}))) as { email?: string };
    const email = normaliseEmail(body.email);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return c.json({ error: 'That does not look like an email address' }, 400);
    }

    if (!(await ensureToken(user.id, id))) return c.json({ error: 'Not found' }, 404);

    const inserted =
      ((await sql()`
        insert into m2h_folder_share (folder_id, email) values (${id}, ${email})
        on conflict do nothing returning email
      `) as unknown[]).length === 1;

    await sql()`
      update m2h_folder set share_mode = 'people' where user_id = ${user.id} and id = ${id} and share_mode <> 'link'
    `;

    const state = await shareState(user.id, id);
    let notified = false;

    if (state?.mode === 'people' && state.token && inserted) {
      const [folder] = (await sql()`select name from m2h_folder where id = ${id}`) as Array<{ name: string }>;

      if ((await countShareMail(user.id).catch(() => ({ ok: true }))).ok) {
        const sent = await sendShareNotice({
          to: email,
          from: user.email ?? 'Somebody',
          documentName: folder?.name ?? 'a folder',
          url: `${selfOrigin(c)}/f/${state.token}`,
          expiresAt: state.expiresAt,
          kind: 'folder',
        });

        notified = sent.ok;
        if (!sent.ok) console.error(`folder share notice to ${email} not sent: ${sent.reason}`);
      } else {
        console.error(`folder share notice to ${email} not sent: past today's mail limit`);
      }
    }

    return state ? c.json({ ...state, notified }) : c.json({ error: 'Not found' }, 404);
  });

  api.delete('/folders/:id/share/people', async (c) => {
    const userId = c.get('user').id;
    const id = c.req.param('id');

    if (!looksLikeId(id)) return c.json({ error: 'Not found' }, 404);

    await sql()`
      delete from m2h_folder_share
      where folder_id = ${id} and email = ${normaliseEmail(c.req.query('email'))}
        and exists (select 1 from m2h_folder where id = ${id} and user_id = ${userId})
    `;

    const state = await shareState(userId, id);

    return state ? c.json(state) : c.json({ error: 'Not found' }, 404);
  });
}
