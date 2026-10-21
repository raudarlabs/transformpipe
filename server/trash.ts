import type { Hono } from 'hono';
import { checkQuota } from './limits.js';
import { looksLikeId, sql } from './db.js';
import { deleteSources } from './source.js';

/*
 * Deleting a document moves it here for TRASH_DAYS, and it can be put back until then.
 *
 * Because most deletes are not a person's: an assistant cleaning up, a script, a "remove the old
 * ones" that took one too many. 550 documents were deleted in a month, most of them by connected
 * assistants, and every one was gone the moment it was asked for.
 *
 * The document leaves m2h_document entirely, with who it was shared with and its kept versions
 * copied beside it (db/schema.sql, m2h_trash), so everything that reads documents goes on not
 * seeing it without being told to. Its share link stops opening at once, as before. Its files stay
 * in the store until the purge; it does not count against the account's room.
 */
export const TRASH_DAYS = 14;

export interface TrashEntry {
  id: string;
  name: string;
  kind: string;
  size: number;
  folder_path: string;
  deleted_at: string;
  /** When it goes for good. */
  purge_at: string;
}

/**
 * Moves the account's documents among `ids` to the trash, in one transaction: copied, then deleted,
 * so a failure half way leaves each document either here or there, never both and never neither.
 */
export async function trashDocuments(userId: string, ids: string[]): Promise<number> {
  const wanted = ids.filter(looksLikeId);

  if (wanted.length === 0) return 0;

  const [copied] = await sql().transaction((db) => [
    db`
      with recursive tree as (
        select id, name::text as path from m2h_folder where user_id = ${userId} and parent_id is null
        union all
        select f.id, tree.path || ' / ' || f.name from m2h_folder f join tree on f.parent_id = tree.id
        where f.user_id = ${userId}
      )
      insert into m2h_trash (id, user_id, name, kind, size, folder_path, document, shares, revisions)
      select d.id, d.user_id, d.name, d.kind, d.size, coalesce(tree.path, ''), to_jsonb(d),
        coalesce((select jsonb_agg(to_jsonb(s)) from m2h_document_share s where s.document_id = d.id), '[]'::jsonb),
        coalesce((select jsonb_agg(to_jsonb(r)) from m2h_document_revision r where r.document_id = d.id), '[]'::jsonb)
      from m2h_document d
      left join tree on tree.id = d.folder_id
      where d.user_id = ${userId} and d.id = any(${wanted}::uuid[])
      on conflict (id) do nothing
      returning id
    `,
    db`
      delete from m2h_document
      where user_id = ${userId} and id = any(${wanted}::uuid[])
        and id in (select id from m2h_trash where user_id = ${userId})
    `,
  ]);

  return (copied as unknown[]).length;
}

/** Every document of a set of folders, to the trash — for a folder deleted with what is in it. */
export async function trashFolderContents(userId: string, folderIds: string[]): Promise<number> {
  const rows = (await sql()`
    select id::text from m2h_document where user_id = ${userId} and folder_id = any(${folderIds}::uuid[])
  `) as Array<{ id: string }>;

  return trashDocuments(userId, rows.map((row) => row.id));
}

/**
 * Puts a document back as it was — its text, its sharing, its versions. Into its folder when the
 * folder is still there, and into All documents when it is not.
 */
export async function restoreDocument(
  userId: string,
  id: string
): Promise<{ ok: true; name: string } | { ok: false; status: 403 | 404; error: string }> {
  const [entry] = (await sql()`
    select name, size from m2h_trash where id = ${id} and user_id = ${userId}
  `) as Array<{ name: string; size: number }>;

  if (!entry) return { ok: false, status: 404, error: 'Not in the trash' };

  const room = await checkQuota(userId, Number(entry.size));

  if (!room.ok) return { ok: false, status: 403, error: room.error };

  await sql().transaction((db) => [
    db`
      insert into m2h_document
      select (jsonb_populate_record(null::m2h_document, t.document || jsonb_build_object(
        'folder_id', case when exists (
          select 1 from m2h_folder f where f.id::text = t.document->>'folder_id' and f.user_id = t.user_id
        ) then t.document->'folder_id' else 'null'::jsonb end,
        'replaces', case when exists (
          select 1 from m2h_document x where x.id::text = t.document->>'replaces'
        ) then t.document->'replaces' else 'null'::jsonb end
      ))).*
      from m2h_trash t where t.id = ${id} and t.user_id = ${userId}
    `,
    db`
      insert into m2h_document_share
      select (jsonb_populate_record(null::m2h_document_share, one)).*
      from m2h_trash t, jsonb_array_elements(t.shares) one
      where t.id = ${id} and t.user_id = ${userId}
      on conflict do nothing
    `,
    db`
      insert into m2h_document_revision
      select (jsonb_populate_record(null::m2h_document_revision, one)).*
      from m2h_trash t, jsonb_array_elements(t.revisions) one
      where t.id = ${id} and t.user_id = ${userId}
      on conflict do nothing
    `,
    db`delete from m2h_trash where id = ${id} and user_id = ${userId}`,
  ]);

  return { ok: true, name: entry.name };
}

/** Gone for good: the rows and every file they kept. `ids` null is the whole of one account's trash. */
export async function purgeTrash(userId: string, ids: string[] | null): Promise<number> {
  const removed = (ids
    ? await sql()`delete from m2h_trash where user_id = ${userId} and id = any(${ids.filter(looksLikeId)}::uuid[]) returning document, revisions`
    : await sql()`delete from m2h_trash where user_id = ${userId} returning document, revisions`) as Array<{
    document: { blob_path?: string | null };
    revisions: Array<{ blob_path?: string | null }>;
  }>;

  await deleteSources(removed.flatMap((row) => [row.document.blob_path ?? null, ...row.revisions.map((one) => one.blob_path ?? null)]));

  return removed.length;
}

/** Everything older than TRASH_DAYS, from every account — the daily cron. */
export async function purgeExpired(): Promise<number> {
  const removed = (await sql()`
    delete from m2h_trash where deleted_at < now() - make_interval(days => ${TRASH_DAYS})
    returning document, revisions
  `) as Array<{ document: { blob_path?: string | null }; revisions: Array<{ blob_path?: string | null }> }>;

  await deleteSources(removed.flatMap((row) => [row.document.blob_path ?? null, ...row.revisions.map((one) => one.blob_path ?? null)]));

  return removed.length;
}

export async function listTrash(userId: string): Promise<TrashEntry[]> {
  return (await sql()`
    select id::text, name, kind, size::int, folder_path, deleted_at,
      deleted_at + make_interval(days => ${TRASH_DAYS}) as purge_at
    from m2h_trash where user_id = ${userId}
    order by deleted_at desc
    limit 5000
  `) as TrashEntry[];
}

/*
 * The same four things for the app (`/api/trash`, signed in) and the public API (`/api/v1/trash`,
 * a key or a connection): what is in it, put one back, delete one for good, empty it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerTrash(api: Hono<any>, who: (c: any) => string) {
  api.get('/trash', async (c) => {
    c.header('cache-control', 'private, no-store');

    return c.json({ documents: await listTrash(who(c)), days: TRASH_DAYS });
  });

  api.post('/trash/:id/restore', async (c) => {
    const id = c.req.param('id');

    if (!looksLikeId(id)) return c.json({ error: 'Not in the trash' }, 404);

    const done = await restoreDocument(who(c), id);

    return done.ok ? c.json({ ok: true, id, name: done.name }) : c.json({ error: done.error }, done.status);
  });

  api.delete('/trash/:id', async (c) => {
    const removed = await purgeTrash(who(c), [c.req.param('id')]);

    return removed > 0 ? c.json({ ok: true }) : c.json({ error: 'Not in the trash' }, 404);
  });

  api.delete('/trash', async (c) => c.json({ ok: true, deleted: await purgeTrash(who(c), null) }));
}
