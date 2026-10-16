import { createHash } from 'node:crypto';
import type { Context, Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { buildNoticePage, buildPasswordPage, buildSharedPage, buildStandaloneHtml } from '../shared/markdown.js';
import { obsidianHeadingLinks } from '../shared/to-obsidian.js';
import { attachment } from './attachment.js';
import { clientAddress } from './address.js';
import { selfOrigin } from './auth.js';
import { looksLikeId, sql, type DocumentRow } from './db.js';
import { folderGate, type FolderVerdict, type SharedFolder } from './folder-share.js';
import { countCall } from './limits.js';
import { fitsPage } from '../shared/limits.js';
import { edgeSeconds, writtenUtc } from './share-gate.js';
import { UNLOCK_SECONDS, passwordMatches, unlockCookie, unlockValue } from './share-password.js';
import { linkSharedMarkdown, linkSharedPages } from './page-links.js';
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
 * Who may open it is decided as for a document — a link, with an expiry and a password if the
 * owner set them, or named addresses that sign in (`folderGate` in server/folder-share.ts) — and
 * a link anyone can open is kept by the CDN for a minute, so turning it off takes about that.
 */

const html = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Tree {
  folders: Array<{ id: string; parent_id: string | null; name: string }>;
  documents: Array<Pick<DocumentRow, 'id' | 'name' | 'created_at' | 'size'> & { folder_id: string; position: number | null }>;
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

/** A transparent 1×1 GIF, as the document's page counts its opens. */
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

const NOT_A_READER =
  /bot\b|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|skype|embedly|preview/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctx = Context<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerFolderPages(app: Hono<any>, headers: Record<string, string>) {
  const missing = (c: Ctx) => {
    c.header('cache-control', 'no-store');
    c.status(404);

    return c.html(
      buildNoticePage(
        'This link does not open a folder',
        'It was never shared, or the person who shared it has since turned the link off.'
      )
    );
  };

  /** Every answer that is not the folder: gone, ended, behind a password, or for named readers. */
  const refused = (c: Ctx, token: string, verdict: Exclude<FolderVerdict, { ok: true }>, next?: string) => {
    switch (verdict.why) {
      case 'missing':
        return missing(c);
      case 'expired':
        c.header('cache-control', 'no-store');
        c.status(410);

        return c.html(
          buildNoticePage(
            'This link has expired',
            `The person who shared this folder set it to stop working on ${writtenUtc(verdict.expiredAt)}. Ask them for a new one.`
          )
        );
      case 'password':
        c.header('cache-control', 'private, no-store');
        c.status(401);

        return c.html(
          buildPasswordPage(token, undefined, {
            action: `/f/${encodeURIComponent(token)}${next ? `?next=${next}` : ''}`,
            noun: 'folder',
          })
        );
      default:
        // Shared with named people: the app asks who you are, then sends you back here.
        c.header('cache-control', 'no-store');

        return c.redirect(`/open-folder/${encodeURIComponent(token)}`, 302);
    }
  };

  /* A link anyone can open is the same for everybody, so the CDN may keep it for its minute. */
  const cache = (c: Ctx, verdict: Extract<FolderVerdict, { ok: true }>) => {
    const keep = edgeSeconds(verdict.expiresAt);

    c.header(
      'cache-control',
      verdict.folder.share_mode === 'people' || verdict.locked || keep === 0
        ? 'private, no-store'
        : `public, max-age=0, s-maxage=${keep}`
    );
  };

  app.get('/f/:token', async (c) => {
    for (const [header, value] of Object.entries(headers)) c.header(header, value);

    const token = c.req.param('token');
    const verdict = await folderGate(c, token);

    if (!verdict.ok) return refused(c, token, verdict);

    const { folder } = verdict;
    const tree = await treeOf(folder);

    cache(c, verdict);

    return c.html(
      buildSharedPage({
        title: folder.name,
        body: `<p>${tree.documents.length} ${tree.documents.length === 1 ? 'document' : 'documents'}</p>${listOf(token, tree, folder.id)}`,
        createdAt: new Date(folder.created_at).getTime(),
        /* The whole folder into the reader's own account — the app asks them to sign in first. */
        openHref: `/open-folder/${encodeURIComponent(token)}`,
        seenHref: `/f/${encodeURIComponent(token)}/seen`,
        watched: verdict.reader !== null && !verdict.reader.isOwner,
      })
    );
  });

  /* The password form's answer, paced as a document's is, and remembered for a day. */
  app.post('/f/:token', async (c) => {
    for (const [header, value] of Object.entries(headers)) c.header(header, value);

    c.header('cache-control', 'private, no-store');

    const token = c.req.param('token');
    const next = c.req.query('next');
    const back = `/f/${encodeURIComponent(token)}${next && looksLikeId(next) ? `/${next}` : ''}`;
    const verdict = await folderGate(c, token);

    if (verdict.ok || verdict.why !== 'password') return c.redirect(back, 303);

    const machine = createHash('sha256').update(`${clientAddress(c)}|${token}`).digest('base64url').slice(0, 22);
    const link = createHash('sha256').update(token).digest('base64url').slice(0, 22);
    const mine = await countCall(`unlock:${machine}`).catch(() => null);
    const all = await countCall(`unlock-link:${link}`).catch(() => null);
    const page = (problem: string) =>
      buildPasswordPage(token, problem, { action: `/f/${encodeURIComponent(token)}${next && looksLikeId(next) ? `?next=${next}` : ''}`, noun: 'folder' });

    if (!mine || !all || mine.calls > 10 || all.calls > 30) {
      c.status(429);

      return c.html(page('Too many tries. Wait a minute and try again.'));
    }

    const form = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
    const password = String(form.password ?? '').slice(0, 200);

    if (!password || !(await passwordMatches(password, verdict.hash))) {
      c.status(401);

      return c.html(page('That is not the password.'));
    }

    setCookie(c, unlockCookie(token), unlockValue(token, verdict.hash), {
      path: '/',
      httpOnly: true,
      secure: selfOrigin(c).startsWith('https:'),
      sameSite: 'Lax',
      maxAge: UNLOCK_SECONDS,
    });

    return c.redirect(back, 303);
  });

  /* One open, counted by the page's own picture — the page may come from the CDN, this never does. */
  app.get('/f/:token/seen', async (c) => {
    c.header('cache-control', 'no-store');
    c.header('content-type', 'image/gif');

    if (!NOT_A_READER.test(c.req.header('user-agent') ?? '')) {
      const token = c.req.param('token');
      const verdict = await folderGate(c, token).catch(() => null);
      const machine = createHash('sha256').update(`${clientAddress(c)}|f|${token}`).digest('base64url').slice(0, 22);
      const paced = await countCall(`seen:${machine}`).catch(() => null);

      if (verdict?.ok && paced && paced.calls <= 10) {
        await sql()`
          update m2h_folder set share_views = share_views + 1, share_viewed_at = now() where id = ${verdict.folder.id}
        `.catch(() => undefined);
      }
    }

    return c.body(PIXEL);
  });

  app.get('/f/:token/:id', async (c) => {
    for (const [header, value] of Object.entries(headers)) c.header(header, value);

    const token = c.req.param('token');
    const id = c.req.param('id');

    if (!looksLikeId(id)) return missing(c);

    const verdict = await folderGate(c, token);

    if (!verdict.ok) return refused(c, token, verdict, id);

    const { folder } = verdict;
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

    cache(c, verdict);

    if (download === 'md' || download === 'obsidian') {
      c.header('content-type', 'text/markdown; charset=utf-8');
      c.header('content-disposition', attachment(`${base}.md`));

      const portable = await linkSharedMarkdown(source, folder.user_id, {
        folder: { token, inside: new Set(tree.documents.map((one) => one.id)) },
        origin: selfOrigin(c),
      });

      return c.body(download === 'obsidian' ? obsidianHeadingLinks(portable) : portable);
    }

    const { markdownToHtml } = await import('./render.js');
    const inside = new Set(tree.documents.map((one) => one.id));
    const rendered = markdownToHtml(source);
    const linkOptions = { folder: { token, inside }, isOwner: verdict.reader?.isOwner };
    const body = await linkSharedPages(rendered, folder.user_id, linkOptions);
    const createdAt = new Date(document.created_at).getTime();
    const here = `/f/${encodeURIComponent(token)}/${id}`;

    const tooLarge = () => {
      c.status(413);

      return c.html(
        buildNoticePage(
          'This page is too large to show',
          'It is kept whole, but drawn as a page it is more than a browser is sent at once. Its Markdown downloads in full.',
          [
            { href: `${here}?download=md`, label: 'Download the Markdown' },
            { href: `/f/${encodeURIComponent(token)}`, label: `Back to ${folder.name}` },
          ]
        )
      );
    };

    if (download === '' || download === 'html') {
      // A saved file is opened from a disk, where a link has to carry the site's address.
      const whole = await linkSharedPages(rendered, folder.user_id, { ...linkOptions, origin: selfOrigin(c) });
      const html = buildStandaloneHtml({ title: document.name, body: whole, createdAt, theme: 'light' });

      if (!fitsPage(html)) return tooLarge();

      c.header('content-disposition', attachment(`${base}.html`));

      return c.html(html);
    }

    const page = buildSharedPage({
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
        watched: verdict.reader !== null && !verdict.reader.isOwner,
        size: document.size,
        stats: document.stats ?? undefined,
      });

    return fitsPage(page) ? c.html(page) : tooLarge();
  });
}
