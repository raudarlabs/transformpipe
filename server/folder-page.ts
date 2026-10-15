import type { Context, Hono } from 'hono';
import { CONVERSIONS } from '../shared/conversions.js';
import { buildNoticePage, buildSharedPage, buildStandaloneHtml } from '../shared/markdown.js';
import { obsidianHeadingLinks } from '../shared/to-obsidian.js';
import { attachment } from './attachment.js';
import { looksLikeId, sql, type DocumentRow } from './db.js';
import { readSource } from './source.js';

/*
 * A folder shared as one link: `/f/<token>` is everything in it, as a tree, and `/f/<token>/<id>`
 * is one of its documents.
 *
 * The link reads; it does not write, and it opens only what is filed under that folder now — a
 * document moved out of it stops being reachable through it on the next request. The documents'
 * own sharing is untouched: a page that is private stays private everywhere else.
 *
 * Links between the pages of an import were written as addresses in the app (`/…?doc=<id>`, see
 * `src/lib/imports.ts`). Inside a shared folder they are pointed at the folder's own pages, so a
 * reader without an account moves through a space the way its owner does.
 *
 * Kept by the CDN for a minute like a shared document, so turning the link off takes about that.
 */

const html = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface SharedFolder {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

interface Tree {
  folders: Array<{ id: string; parent_id: string | null; name: string }>;
  documents: Array<Pick<DocumentRow, 'id' | 'name' | 'created_at' | 'size'> & { folder_id: string; position: number | null }>;
}

async function folderOf(token: string): Promise<SharedFolder | null> {
  if (!/^[A-Za-z0-9_-]{10,60}$/.test(token)) return null;

  const rows = (await sql()`
    select id::text, name, created_at, user_id::text from m2h_folder where share_token = ${token}
  `) as SharedFolder[];

  return rows[0] ?? null;
}

async function treeOf(folder: SharedFolder): Promise<Tree> {
  const folders = (await sql()`
    with recursive tree as (
      select id, parent_id, name from m2h_folder where id = ${folder.id}
      union all
      select f.id, f.parent_id, f.name from m2h_folder f join tree t on f.parent_id = t.id
    )
    select id::text, parent_id::text, name from tree
  `) as Tree['folders'];
  const documents = (await sql()`
    select id::text, name, created_at, size, folder_id::text, position
    from m2h_document
    where user_id = ${folder.user_id} and folder_id = any(${folders.map((one) => one.id)}::uuid[])
  `) as Tree['documents'];

  return { folders, documents };
}

const byOrder = (a: { position: number | null; name: string }, b: { position: number | null; name: string }) =>
  (a.position ?? 1e9) - (b.position ?? 1e9) || a.name.localeCompare(b.name, undefined, { numeric: true });

const titleOf = (name: string) => name.replace(/\.(md|markdown|mdown|mkd|txt)$/i, '');

/** The tree as nested lists: a folder's first page, its subfolders, then the rest of its pages. */
function listOf(token: string, tree: Tree, folderId: string): string {
  const pages = tree.documents.filter((one) => one.folder_id === folderId).sort(byOrder);
  const subfolders = tree.folders
    .filter((one) => one.parent_id === folderId)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const link = (doc: Tree['documents'][number]) =>
    `<li><a href="/f/${encodeURIComponent(token)}/${doc.id}">${html(titleOf(doc.name))}</a></li>`;

  return `<ul>${pages.slice(0, 1).map(link).join('')}${subfolders
    .map((one) => `<li><strong>${html(one.name)}</strong>${listOf(token, tree, one.id)}</li>`)
    .join('')}${pages.slice(1).map(link).join('')}</ul>`;
}

/** Where a document sits under the shared folder, as links back up. */
function trailOf(token: string, folder: SharedFolder, tree: Tree, folderId: string): string {
  const path: string[] = [];
  let at = tree.folders.find((one) => one.id === folderId);

  while (at && at.id !== folder.id) {
    path.unshift(html(at.name));
    at = tree.folders.find((one) => one.id === at!.parent_id);
  }

  return `<p><a href="/f/${encodeURIComponent(token)}">${html(folder.name)}</a>${path.map((one) => ` › ${one}`).join('')}</p>`;
}

/** Links to documents of this folder, written as app addresses by an import, pointed at this link. */
function withFolderLinks(body: string, token: string, inside: Set<string>): string {
  const paths = CONVERSIONS.map((one) => one.path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|');

  return body.replace(
    new RegExp(`href="(?:${paths})\\?doc=([0-9a-f-]{36})"`, 'g'),
    (whole, id: string) => (inside.has(id) ? `href="/f/${encodeURIComponent(token)}/${id}"` : whole)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerFolderPages(app: Hono<any>, headers: Record<string, string>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const missing = (c: Context<any>) => {
    c.header('cache-control', 'no-store');
    c.status(404);

    return c.html(
      buildNoticePage(
        'This link does not open a folder',
        'It was never shared, or the person who shared it has since turned the link off.'
      )
    );
  };

  app.get('/f/:token', async (c) => {
    for (const [header, value] of Object.entries(headers)) c.header(header, value);

    const token = c.req.param('token');
    const folder = await folderOf(token);

    if (!folder) return missing(c);

    const tree = await treeOf(folder);

    c.header('cache-control', 'public, max-age=0, s-maxage=60');

    return c.html(
      buildSharedPage({
        title: folder.name,
        body: `<p>${tree.documents.length} ${tree.documents.length === 1 ? 'document' : 'documents'}</p>${listOf(token, tree, folder.id)}`,
        createdAt: new Date(folder.created_at).getTime(),
      })
    );
  });

  app.get('/f/:token/:id', async (c) => {
    for (const [header, value] of Object.entries(headers)) c.header(header, value);

    const token = c.req.param('token');
    const id = c.req.param('id');
    const folder = await folderOf(token);

    if (!folder || !looksLikeId(id)) return missing(c);

    const tree = await treeOf(folder);
    const entry = tree.documents.find((one) => one.id === id);

    if (!entry) return missing(c);

    const [document] = (await sql()`
      select id, user_id, name, kind, size, stats, created_at, updated_at, markdown, blob_path
      from m2h_document where id = ${id}
    `) as Array<DocumentRow & { updated_at: string | null; blob_path: string | null }>;
    const source = document ? await readSource(document) : null;

    if (source === null) return missing(c);

    const base = titleOf(document.name);
    const download = c.req.query('download');

    if (download === 'md' || download === 'obsidian') {
      c.header('cache-control', 'public, max-age=0, s-maxage=60');
      c.header('content-type', 'text/markdown; charset=utf-8');
      c.header('content-disposition', attachment(`${base}.md`));

      return c.body(download === 'obsidian' ? obsidianHeadingLinks(source) : source);
    }

    const { markdownToHtml } = await import('./render.js');
    const inside = new Set(tree.documents.map((one) => one.id));
    const body = withFolderLinks(markdownToHtml(source), token, inside);
    const createdAt = new Date(document.created_at).getTime();
    const here = `/f/${encodeURIComponent(token)}/${id}`;

    c.header('cache-control', 'public, max-age=0, s-maxage=60');

    if (download === '' || download === 'html') {
      c.header('content-disposition', attachment(`${base}.html`));

      return c.html(buildStandaloneHtml({ title: document.name, body, createdAt, theme: 'light' }));
    }

    return c.html(
      buildSharedPage({
        title: document.name,
        body: trailOf(token, folder, tree, entry.folder_id) + body,
        createdAt,
        updatedAt: document.updated_at ? new Date(document.updated_at).getTime() : undefined,
        downloadHref: `${here}?download`,
        markdownHref: `${here}?download=md`,
        obsidianHref: `${here}?download=obsidian`,
        diagramsScript:
          process.env.VERCEL || process.env.NODE_ENV === 'production'
            ? '/share/diagrams.js'
            : '/src/share-diagrams.ts',
        size: document.size,
        stats: document.stats ?? undefined,
      })
    );
  });
}
