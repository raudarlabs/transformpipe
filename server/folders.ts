import type { Hono } from 'hono';
import { CONVERSIONS, DEFAULT_CONVERSION } from '../shared/conversions.js';
import { looksLikeId, sql, searchText } from './db.js';
import { QUOTA, UNVERIFIED, cleanStats, isVerified, usageOf } from './limits.js';
import { deleteSources, putSource, readSource } from './source.js';

/*
 * Folders, and the documents an export is made of.
 *
 * A folder is a row with a parent, so the tree is as deep as an export's own: a Confluence space,
 * its sections, their pages. Everything here is the account's own and answers 404 for anybody
 * else's, the way documents do.
 *
 * Renaming is the name. Moving is the parent — refused when it would put a folder inside itself.
 * Deleting comes in two kinds, because the two mean different things: the folder alone, which lifts
 * whatever it held one level up and loses nothing, and the folder with everything in it, which
 * deletes those documents the way deleting them one by one would, stored files included.
 *
 * Importing an export is two requests rather than hundreds: the whole folder tree in one, its ids
 * handed back by the caller's own references, then the pages in batches that each fit under the
 * platform's 4.5 MB body limit (`POST /documents/batch`).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Api = Hono<any>;

interface FolderRow {
  id: string;
  parent_id: string | null;
  name: string;
  source: string | null;
  created_at: string;
  share_token?: string | null;
}

const KINDS = new Set<string>(CONVERSIONS.map((one) => one.id));
const SOURCES = new Set(['confluence', 'notion', 'obsidian', 'epub']);

const cleanName = (value: unknown) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 200) : '';

/** The folder, when it is this account's; null otherwise. A null id is the top level, and is always ours. */
async function owned(userId: string, id: string | null): Promise<boolean> {
  if (id === null) return true;
  if (!looksLikeId(id)) return false;

  const rows = (await sql()`select 1 from m2h_folder where id = ${id} and user_id = ${userId}`) as unknown[];

  return rows.length > 0;
}

/** A folder and every folder under it. */
async function subtree(userId: string, id: string): Promise<string[]> {
  const rows = (await sql()`
    with recursive tree as (
      select id from m2h_folder where id = ${id} and user_id = ${userId}
      union all
      select f.id from m2h_folder f join tree t on f.parent_id = t.id where f.user_id = ${userId}
    )
    select id::text from tree
  `) as Array<{ id: string }>;

  return rows.map((row) => row.id);
}

/** Whether `n` more documents of `bytes` fit in the account — the batch version of `checkQuota`. */
export async function room(userId: string, n: number, bytes: number) {
  const usage = await usageOf(userId);

  if (usage.documents + n > UNVERIFIED.documents && !(await isVerified(userId))) {
    return {
      ok: false as const,
      error: `An unconfirmed account can keep ${UNVERIFIED.documents} documents. Confirm your email address from the account menu and this limit goes away.`,
      usage,
    };
  }

  if (usage.documents + n > QUOTA.documents) {
    return {
      ok: false as const,
      error: `That is ${n} documents, and the account has room for ${Math.max(0, QUOTA.documents - usage.documents)} more.`,
      usage,
    };
  }

  if (usage.bytes + bytes > usage.limits.bytes) {
    return {
      ok: false as const,
      error: `That needs ${(bytes / 1048576).toFixed(1)} MB, and the account has ${(Math.max(0, usage.limits.bytes - usage.bytes) / 1048576).toFixed(1)} MB left.`,
      usage,
    };
  }

  return { ok: true as const };
}

export function registerFolders(api: Api) {
  api.get('/folders', async (c) => {
    const userId = c.get('user').id;
    const folders = (await sql()`
      select f.id::text, f.parent_id::text, f.name, f.source, f.created_at, f.share_token, f.share_mode,
             (select count(*)::int from m2h_document d where d.folder_id = f.id) as documents
      from m2h_folder f
      where f.user_id = ${userId}
      order by f.name
    `) as Array<FolderRow & { documents: number }>;

    return c.json({ folders });
  });

  api.post('/folders', async (c) => {
    const userId = c.get('user').id;
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; parent_id?: unknown };
    const name = cleanName(body.name);
    const parent = typeof body.parent_id === 'string' ? body.parent_id : null;

    if (!name) return c.json({ error: 'A folder needs a name' }, 400);
    if (!(await owned(userId, parent))) return c.json({ error: 'No such folder' }, 404);

    const [folder] = (await sql()`
      insert into m2h_folder (user_id, parent_id, name)
      values (${userId}, ${parent}, ${name})
      returning id::text, parent_id::text, name, source, created_at
    `) as FolderRow[];

    return c.json({ folder: { ...folder, documents: 0 } }, 201);
  });

  /*
   * A whole tree at once, for an import. Each folder names its parent by the caller's own
   * reference, so the caller can describe the tree before any id exists; parents come first.
   */
  api.post('/folders/tree', async (c) => {
    const userId = c.get('user').id;
    const body = (await c.req.json().catch(() => ({}))) as {
      parent_id?: unknown;
      folders?: Array<{ ref?: unknown; parent?: unknown; name?: unknown; source?: unknown }>;
    };
    const root = typeof body.parent_id === 'string' ? body.parent_id : null;
    const folders = Array.isArray(body.folders) ? body.folders : [];

    // Refused rather than cut: pages whose folder was dropped would be saved loose, outside the tree.
    if (folders.length > 2000) {
      return c.json({ error: `That is ${folders.length} folders; one import may make 2000.` }, 413);
    }

    if (!(await owned(userId, root))) return c.json({ error: 'No such folder' }, 404);

    const ids: Record<string, string> = {};

    for (const one of folders) {
      const ref = String(one.ref ?? '');
      const name = cleanName(one.name);
      const parentRef = one.parent === null || one.parent === undefined ? null : String(one.parent);

      if (!ref || !name || (parentRef !== null && !ids[parentRef])) {
        return c.json({ error: `Folder "${ref}" names a parent that is not before it` }, 400);
      }

      const source = typeof one.source === 'string' && SOURCES.has(one.source) ? one.source : null;
      const [made] = (await sql()`
        insert into m2h_folder (user_id, parent_id, name, source)
        values (${userId}, ${parentRef === null ? root : ids[parentRef]}, ${name}, ${source})
        returning id::text
      `) as Array<{ id: string }>;

      ids[ref] = made.id;
    }

    return c.json({ ids }, 201);
  });

  api.patch('/folders/:id', async (c) => {
    const userId = c.get('user').id;
    const id = c.req.param('id');
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; parent_id?: unknown };

    if (!(await owned(userId, id))) return c.json({ error: 'No such folder' }, 404);

    if (body.name !== undefined) {
      const name = cleanName(body.name);

      if (!name) return c.json({ error: 'A folder needs a name' }, 400);

      await sql()`update m2h_folder set name = ${name} where id = ${id} and user_id = ${userId}`;
    }

    if (body.parent_id !== undefined) {
      const parent = typeof body.parent_id === 'string' ? body.parent_id : null;

      if (!(await owned(userId, parent))) return c.json({ error: 'No such folder' }, 404);

      // A folder inside itself, or inside anything under it, would be a loop with no top.
      if (parent !== null && (await subtree(userId, id)).includes(parent)) {
        return c.json({ error: 'A folder cannot go inside itself' }, 400);
      }

      await sql()`update m2h_folder set parent_id = ${parent} where id = ${id} and user_id = ${userId}`;
    }

    const [folder] = (await sql()`
      select id::text, parent_id::text, name, source, created_at from m2h_folder where id = ${id}
    `) as FolderRow[];

    return c.json({ folder });
  });

  api.delete('/folders/:id', async (c) => {
    const userId = c.get('user').id;
    const id = c.req.param('id');
    const withContents = c.req.query('contents') === 'delete';

    if (!(await owned(userId, id))) return c.json({ error: 'No such folder' }, 404);

    if (!withContents) {
      const [folder] = (await sql()`select parent_id from m2h_folder where id = ${id}`) as Array<{ parent_id: string | null }>;

      await sql().transaction((db) => [
        db`update m2h_folder set parent_id = ${folder.parent_id} where parent_id = ${id} and user_id = ${userId}`,
        db`update m2h_document set folder_id = ${folder.parent_id} where folder_id = ${id} and user_id = ${userId}`,
        db`delete from m2h_folder where id = ${id} and user_id = ${userId}`,
      ]);

      return c.json({ ok: true, deleted: 0 });
    }

    const folders = await subtree(userId, id);
    const revisions = (await sql()`
      select r.blob_path from m2h_document_revision r
      join m2h_document d on d.id = r.document_id
      where d.user_id = ${userId} and d.folder_id = any(${folders}::uuid[])
    `) as Array<{ blob_path: string | null }>;
    const removed = (await sql()`
      delete from m2h_document
      where user_id = ${userId} and folder_id = any(${folders}::uuid[])
      returning blob_path
    `) as Array<{ blob_path: string | null }>;

    await sql()`delete from m2h_folder where id = ${id} and user_id = ${userId}`;
    await deleteSources([...removed.map((row) => row.blob_path), ...revisions.map((row) => row.blob_path)]);

    return c.json({ ok: true, deleted: removed.length });
  });

  /*
   * A folder and everything under it, as text, for a .zip the browser puts together.
   *
   * In pieces, because a function's answer stops at 4.5 MB and a Confluence space is fifty: each
   * piece is the next documents by id up to about 3 MB of text — sizes are on the rows, so the cut
   * is planned before a single file is read — and `next` says where the following piece starts.
   * The first piece carries the folders as well, so the archive can be laid out as the tree is.
   */
  api.get('/folders/:id/export', async (c) => {
    const userId = c.get('user').id;
    const id = c.req.param('id');
    const after = c.req.query('after') ?? null;

    if (!(await owned(userId, id)) || (after !== null && !looksLikeId(after))) {
      return c.json({ error: 'No such folder' }, 404);
    }

    const ids = await subtree(userId, id);
    const candidates = (await sql()`
      select id::text, size from m2h_document
      where user_id = ${userId} and folder_id = any(${ids}::uuid[])
        and (${after}::uuid is null or id > ${after}::uuid)
      order by id
      limit 400
    `) as Array<{ id: string; size: number }>;
    const PIECE = 3 * 1024 * 1024;
    const SEND = 4 * 1024 * 1024;
    const take: string[] = [];
    let bytes = 0;

    for (const one of candidates) {
      if (take.length > 0 && bytes + one.size > PIECE) break;
      take.push(one.id);
      bytes += one.size;
    }

    const rows = (take.length
      ? await sql()`
          select id::text, user_id::text, name, folder_id::text, position, markdown, blob_path
          from m2h_document where user_id = ${userId} and id = any(${take}::uuid[])
          order by id
        `
      : []) as Array<{ id: string; user_id: string; name: string; folder_id: string; position: number | null; markdown: string | null; blob_path: string | null }>;
    const documents: Array<{ id: string; name: string; folder_id: string; position: number | null; markdown: string }> = [];

    // Eight files at a time from the store: hundreds at once are refused.
    for (let at = 0; at < rows.length; at += 8) {
      const read = await Promise.all(rows.slice(at, at + 8).map((row) => readSource(row)));

      rows.slice(at, at + 8).forEach((row, index) => {
        if (read[index] !== null) {
          documents.push({ id: row.id, name: row.name, folder_id: row.folder_id, position: row.position, markdown: read[index]! });
        }
      });
    }

    /*
     * The plan above trusts the rows' sizes; what is sent is JSON, where every newline and quote
     * costs a second byte. Measured again as it will go, and cut short of the platform's limit —
     * the next piece starts after the last one kept.
     */
    const encoder = new TextEncoder();
    let sending = 0;
    let kept = documents.length;

    for (const [index, one] of documents.entries()) {
      sending += encoder.encode(JSON.stringify(one)).length;

      if (index > 0 && sending > SEND) {
        kept = index;
        break;
      }
    }

    const cut = kept < documents.length;

    documents.length = kept;

    const folders =
      after === null
        ? ((await sql()`
            select id::text, parent_id::text, name from m2h_folder
            where user_id = ${userId} and id = any(${ids}::uuid[])
          `) as Array<{ id: string; parent_id: string | null; name: string }>)
        : undefined;
    // More when this piece stopped short of what was found, or what was found hit the query's cap.
    const more = cut || candidates.length > take.length || candidates.length === 400;
    const last = cut ? documents[documents.length - 1].id : take[take.length - 1];

    c.header('cache-control', 'private, no-store');

    return c.json({ folders, documents, next: more ? last : null });
  });

  // Sharing a folder — link, people, expiry, password — is server/folder-share.ts.

  /* Documents into a folder, or out of every folder with `folder_id: null`. */
  api.patch('/documents/move', async (c) => {
    const userId = c.get('user').id;
    const body = (await c.req.json().catch(() => ({}))) as { ids?: unknown; folder_id?: unknown };
    const ids = Array.isArray(body.ids) ? body.ids.filter((one): one is string => typeof one === 'string' && looksLikeId(one)) : [];
    const folder = typeof body.folder_id === 'string' ? body.folder_id : null;

    if (ids.length === 0) return c.json({ error: 'ids are required' }, 400);
    if (!(await owned(userId, folder))) return c.json({ error: 'No such folder' }, 404);

    const moved = (await sql()`
      update m2h_document set folder_id = ${folder}
      where user_id = ${userId} and id = any(${ids}::uuid[])
      returning id
    `) as unknown[];

    return c.json({ moved: moved.length });
  });

  /*
   * Several documents in one request, for the pages of an export. The caller keeps each request
   * under the platform's body limit; this checks the room for all of them before writing any, so
   * an import that does not fit is refused whole rather than half kept.
   */
  api.post('/documents/batch', async (c) => {
    const userId = c.get('user').id;
    const body = (await c.req.json().catch(() => ({}))) as {
      documents?: Array<{
        id?: unknown;
        name?: unknown;
        kind?: unknown;
        markdown?: unknown;
        stats?: unknown;
        folder_id?: unknown;
        position?: unknown;
      }>;
    };
    const incoming = (Array.isArray(body.documents) ? body.documents : []).slice(0, 500);
    let documents = incoming
      .map((one) => ({
        // The caller's own id, when it gave one, so pages of an import can link to each other.
        id: typeof one.id === 'string' && looksLikeId(one.id) ? one.id : null,
        name: cleanName(one.name),
        kind: typeof one.kind === 'string' && KINDS.has(one.kind) ? one.kind : DEFAULT_CONVERSION,
        markdown: typeof one.markdown === 'string' ? one.markdown : '',
        stats: cleanStats(one.stats),
        folder: typeof one.folder_id === 'string' ? one.folder_id : null,
        position: Number.isInteger(one.position) ? (one.position as number) : null,
      }))
      .filter((one) => one.name && one.markdown);

    if (documents.length === 0) return c.json({ error: 'documents are required' }, 400);

    const folders = [...new Set(documents.map((one) => one.folder).filter((one): one is string => one !== null))];

    for (const folder of folders) {
      if (!(await owned(userId, folder))) return c.json({ error: 'No such folder' }, 404);
    }

    const measured = documents.map((one) => new TextEncoder().encode(one.markdown).length);
    /*
     * A page larger than one document may be is one page not kept, counted with the failures —
     * refusing the batch for it lost the two hundred pages around it, and left an import half made.
     */
    const tooBig = documents.filter((_, index) => measured[index] > QUOTA.documentBytes);

    if (tooBig.length === documents.length) {
      return c.json({ error: `"${documents[0].name}" is larger than one document may be` }, 413);
    }

    if (tooBig.length > 0) {
      console.error('batch skipped', tooBig.length, 'oversized');
      documents = documents.filter((_, index) => measured[index] <= QUOTA.documentBytes);
    }

    const sizes = measured.filter((size) => size <= QUOTA.documentBytes);

    const fits = await room(userId, documents.length, sizes.reduce((sum, size) => sum + size, 0));

    if (!fits.ok) return c.json({ error: fits.error, usage: fits.usage }, 403);

    await sql()`insert into m2h_user (user_id) values (${userId}) on conflict (user_id) do nothing`.catch(() => undefined);

    const saved: Array<{ id: string; name: string }> = [];

    for (const [index, one] of documents.entries()) {
      // One page the database refuses is one page not kept, not a batch thrown away with it.
      const rows = (await sql()`
        insert into m2h_document (id, user_id, name, kind, size, markdown, stats, search, folder_id, position)
        values (
          coalesce(${one.id}::uuid, gen_random_uuid()),
          ${userId}, ${one.name}, ${one.kind}, ${sizes[index]}, null,
          ${JSON.stringify(one.stats)}::jsonb, to_tsvector('simple', ${searchText(one.markdown)}),
          ${one.folder}, ${one.position}
        )
        on conflict (id) do nothing
        returning id::text, name
      `.catch((cause: unknown) => {
        console.error('batch insert', one.name, cause instanceof Error ? cause.message : cause);

        return [];
      })) as Array<{ id: string; name: string }>;
      const row = rows[0];

      // An id already taken — somebody else's, or this import sent twice — is not overwritten.
      if (!row) continue;

      try {
        const stored = await putSource(userId, row.id, one.markdown);

        await sql()`
          update m2h_document set blob_path = ${stored.blobPath}, markdown = ${stored.markdown}
          where id = ${row.id}
        `;
        saved.push(row);
      } catch {
        // A page that could not be stored is not kept half-made; the rest still are.
        await sql()`delete from m2h_document where id = ${row.id}`;
      }
    }

    return c.json({ saved, failed: documents.length + tooBig.length - saved.length }, 201);
  });
}
