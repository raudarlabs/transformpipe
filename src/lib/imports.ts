import type { ConversionId } from '@shared/conversions';
import { folderKey, foldersOf } from '@shared/split-export';
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

/** A page's file name: its title, minus what a file name cannot hold. */
const fileName = (title: string) => `${title.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').trim() || 'Untitled'}.md`;

const BATCH_BYTES = 3 * 1024 * 1024;
const BATCH_PAGES = 200;

export async function saveImport(
  split: SplitResult,
  kind: ConversionId,
  onProgress: (saved: number, total: number) => void
): Promise<{ folderId: string; saved: number; failed: number }> {
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

  let saved = 0;
  let failed = 0;
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

  for (const page of split.pages) {
    const size = new Blob([page.markdown]).size;

    if (batch.length > 0 && (bytes + size > BATCH_BYTES || batch.length >= BATCH_PAGES)) {
      await flush();
    }

    batch.push({
      name: fileName(page.title),
      kind,
      markdown: page.markdown,
      stats: page.stats,
      folder_id: folderOf(page.folder),
      position: page.position,
    });
    bytes += size;
  }

  await flush();

  return { folderId: ids[root], saved, failed };
}

/** The same tree as a .zip of Markdown files, for somebody who keeps it on disk instead. */
export async function downloadImport(split: SplitResult): Promise<void> {
  const { zipSync, strToU8 } = await import('fflate');
  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();

  for (const page of split.pages) {
    const folder = [split.title, ...page.folder].map((one) => fileName(one).replace(/\.md$/, '')).join('/');
    let path = `${folder}/${fileName(page.title)}`;

    // Two pages of one name in one folder keep both, numbered.
    for (let n = 2; used.has(path); n += 1) {
      path = `${folder}/${fileName(`${page.title} ${n}`)}`;
    }

    used.add(path);
    files[path] = strToU8(page.markdown);
  }

  saveBlob(`${fileName(split.title).replace(/\.md$/, '')}.zip`, new Blob([new Uint8Array(zipSync(files))], { type: 'application/zip' }));
}
