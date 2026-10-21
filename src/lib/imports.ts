import { conversion, type ConversionId } from '@shared/conversions';
import { KEEP_BYTES } from '@shared/limits';
import { PAGE_LINK, PAGE_LINKS, folderKey, foldersOf } from '@shared/split-export';
import { api } from './api';
import type { SplitResult } from './conversion';
import { saveBlob } from './download';

/*
 * Keeping an export that arrived as its pages: into the account as a folder tree, or onto disk as
 * a .zip of Markdown files laid out the same way.
 *
 * Into the account is two kinds of request. The whole tree first, in one, so every page knows its
 * folder's id before any page is sent. Then the pages in batches, each kept under the platform's
 * 4.5 MB body limit with room to spare, so a space of six hundred pages is a few dozen requests
 * rather than six hundred — and the progress the screen shows is pages actually stored.
 */

/** A saved document's name: its title as written, with only what no name can hold taken out. */
const documentName = (title: string) =>
  `${title.replace(/[\/\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled'}.md`;

/** A page's file name: its title, minus what a file name cannot hold. */
const fileName = (title: string) =>
  `${
    title
      // "Release: 2.0" reads as "Release - 2.0"; a colon is the one a title uses most and no disk allows.
      .replace(/\s*:\s*/g, ' - ')
      .replace(/[\\/*?"<>|\u0000-\u001f]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim() || 'Untitled'
  }.md`;

/*
 * Windows opens a .zip itself, and refuses the whole archive — "the Compressed (zipped) Folder is
 * invalid" — when any one path inside it is 260 bytes or more. Bytes, not letters: names are UTF-8,
 * so a Cyrillic title gets there at about 130. Folders share part of the room, so a deep tree still
 * leaves a page some of its title; what is cut stays unique, numbered like any two pages of one name.
 */
const PATH_BYTES = 240;
const FOLDERS_BYTES = 180;
const FOLDER_BYTES = 80;

const utf8 = new TextEncoder();
const bytesOf = (text: string) => utf8.encode(text).length;

/** At most `max` bytes, on a whole character, with no space or dot at the end — Windows drops those. */
const cut = (text: string, max: number) => {
  let out = '';

  for (const char of text) {
    if (bytesOf(out + char) > max) break;
    out += char;
  }

  return out.replace(/[\s.]+$/, '') || 'Untitled';
};

const BATCH_BYTES = 3 * 1024 * 1024;
const BATCH_PAGES = 200;

export async function saveImport(
  split: SplitResult,
  kind: ConversionId,
  onProgress: (saved: number, total: number) => void
): Promise<{ folderId: string; saved: number; failed: number; tooLarge: string[] }> {
  const root = 'root';
  const paths = foldersOf(split);
  const ids = await api.createFolderTree(null, [
    { ref: root, parent: null, name: split.title, source: split.source },
    ...paths.map((path) => ({
      ref: folderKey(path),
      parent: path.length === 1 ? root : folderKey(path.slice(0, -1)),
      name: path[path.length - 1],
    })),
  ]);
  const folderOf = (path: string[]) => (path.length === 0 ? ids[root] : ids[folderKey(path)]);

  /*
   * Every page's id is chosen here, before any is sent, so a link from one page to another can
   * name the saved document it will be — in the same request that saves it.
   */
  const pageIds = split.pages.map(() => crypto.randomUUID());
  const address = (at: number) => `${conversion(kind).path}?doc=${pageIds[at]}`;

  let saved = 0;
  let failed = 0;
  /* By title, so the person is told which pages stayed behind, not only how many. */
  const tooLarge: string[] = [];
  let batch: Parameters<typeof api.saveBatch>[0] = [];
  let bytes = 0;

  const flush = async () => {
    if (batch.length === 0) return;

    const done = await api.saveBatch(batch);

    saved += done.saved.length;
    failed += done.failed;
    batch = [];
    bytes = 0;
    onProgress(saved, split.pages.length);
  };

  onProgress(0, split.pages.length);

  for (let at = 0; at < split.pages.length; at += 1) {
    const page = split.pages[at];
    const markdown = page.markdown.replace(PAGE_LINKS, (whole, n: string) =>
      pageIds[Number(n)] ? address(Number(n)) : whole
    );
    const size = new Blob([markdown]).size;

    /*
     * Larger than one document may be: the server would refuse it, and a page this size sent at
     * all is a request the platform turns away whole, with the pages beside it. Counted, not sent.
     */
    if (size > KEEP_BYTES) {
      tooLarge.push(page.title);
      continue;
    }

    if (batch.length > 0 && (bytes + size > BATCH_BYTES || batch.length >= BATCH_PAGES)) {
      await flush();
    }

    batch.push({
      id: pageIds[at],
      name: documentName(page.title),
      kind,
      markdown,
      stats: page.stats,
      folder_id: folderOf(page.folder),
      position: page.position,
    });
    bytes += size;
  }

  await flush();

  return { folderId: ids[root], saved, failed, tooLarge };
}

/** The same tree as a .zip of Markdown files, for somebody who keeps it on disk instead. */
export async function downloadImport(
  split: SplitResult,
  /**
   * Obsidian finds a heading by its words, not by GitHub's slug, so a contents list written for
   * one does not jump in the other — this writes the vault's spelling (`shared/to-obsidian.ts`).
   */
  forObsidian = false
): Promise<void> {
  const [{ zipSync, strToU8 }, { obsidianHeadingLinks }] = await Promise.all([
    import('fflate'),
    import('@shared/to-obsidian'),
  ]);
  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();

  /* Where each page lands first, so a link between two pages can be a path from one to the other. */
  const paths = split.pages.map((page) => {
    // Each folder is cut by what lies above it alone, so its pages and its subfolders agree on its name.
    const folder = [split.title, ...page.folder].reduce(
      (above, one) => {
        const name = cut(fileName(one).replace(/\.md$/, ''), Math.max(8, Math.min(FOLDER_BYTES, FOLDERS_BYTES - bytesOf(above))));

        return above ? `${above}/${name}` : name;
      },
      ''
    );
    const named = (suffix: string) =>
      `${folder}/${cut(fileName(page.title).replace(/\.md$/, ''), PATH_BYTES - bytesOf(`${folder}/${suffix}.md`))}${suffix}.md`;
    let path = named('');

    // Two pages of one name in one folder keep both, numbered.
    for (let n = 2; used.has(path); n += 1) {
      path = named(` ${n}`);
    }

    used.add(path);

    return path;
  });

  const relative = (from: string, to: string) => {
    const a = from.split('/').slice(0, -1);
    const b = to.split('/');
    let common = 0;

    while (common < a.length && a[common] === b[common]) common += 1;

    // Brackets too: a `)` left bare would end the Markdown link in the middle of a file name.
    return [...a.slice(common).map(() => '..'), ...b.slice(common)]
      .map((part) => encodeURIComponent(part).replace(/\(/g, '%28').replace(/\)/g, '%29'))
      .join('/');
  };

  split.pages.forEach((page, at) => {
    const markdown = page.markdown.replace(PAGE_LINKS, (whole, n: string) =>
      paths[Number(n)] ? relative(paths[at], paths[Number(n)]) : whole
    );

    files[paths[at]] = strToU8(forObsidian ? obsidianHeadingLinks(markdown) : markdown);
  });

  saveBlob(`${fileName(split.title).replace(/\.md$/, '')}${forObsidian ? ' (Obsidian)' : ''}.zip`, new Blob([new Uint8Array(zipSync(files))], { type: 'application/zip' }));
}

/**
 * A saved folder, everything under it, as a .zip laid out like the tree — the same archive an
 * import offers before it is saved, so a space can go back out the way it came in.
 *
 * Read in pieces of about 3 MB (a function's answer cannot carry a whole space), and put together
 * here. Links between the folder's pages — written as `/<conversion>?doc=<id>` when they were
 * imported — become paths from one file to the other; a link to anything outside the folder is
 * left as it was.
 */
export async function downloadFolder(
  folderId: string,
  forObsidian: boolean,
  onProgress: (done: number) => void = () => undefined
): Promise<void> {
  const { api } = await import('./api');
  let after: string | null = null;
  let tree: Array<{ id: string; parent_id: string | null; name: string }> = [];
  const documents: Array<{ id: string; name: string; folder_id: string; position: number | null; markdown: string }> = [];

  do {
    const piece = await api.exportFolder(folderId, after);

    if (piece.folders) tree = piece.folders;
    documents.push(...piece.documents);
    onProgress(documents.length);
    after = piece.next;
  } while (after);

  const root = tree.find((one) => one.id === folderId);
  const pathOf = (id: string): string[] => {
    const names: string[] = [];
    let at = tree.find((one) => one.id === id);

    while (at && at.id !== folderId) {
      names.unshift(at.name);
      at = tree.find((one) => one.id === at!.parent_id);
    }

    return names;
  };
  const index = new Map(documents.map((one, at) => [one.id, at]));
  const appLink = /\]\((?:\/[a-z0-9-]+)?\?doc=([0-9a-f-]{36})(?:#[^)\s]*)?\)/g;

  await downloadImport({
    source: 'confluence',
    title: root?.name ?? 'Folder',
    pages: documents.map((one) => ({
      folder: pathOf(one.folder_id),
      title: one.name.replace(/\.(md|markdown|txt)$/i, ''),
      position: one.position ?? 0,
      markdown: one.markdown.replace(appLink, (whole, id: string) =>
        index.has(id) ? `](${PAGE_LINK}${index.get(id)})` : whole
      ),
    })),
  } as SplitResult, forObsidian);
}
