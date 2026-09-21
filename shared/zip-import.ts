/*
 * What Notion's and Confluence's exports have in common: several files in one .zip, each a page,
 * that this app turns into one document rather than several — a `.zip` is one thing dropped, and
 * the app's existing "chain several files" convention already says what several parts joining into
 * one document looks like: trimmed, joined on `\n\n---\n\n`, oldest/first to last. This file is
 * that convention plus the zip reading both importers share; what a *page* inside the zip becomes
 * is each importer's own job — a Notion page and a Confluence page start from different markup
 * entirely.
 *
 * `fflate` rather than the more familiar `jszip`: pure JavaScript, no native bindings, and it is
 * the same code path in the browser (where every other conversion in this app already runs) and in
 * the one server-side case that needs it — see server/v1.ts's word-to-markdown handling for why an
 * API caller cannot run the browser's own copy.
 */

import { pictureType } from './pictures.js';

export interface ZipPage {
  /** The full path inside the archive, e.g. `Space/Sub page abc123….md`. */
  path: string;
  text: string;
}

/**
 * What all the entries of one archive may weigh unpacked.
 *
 * The size that was checked before this — four megabytes — is the size of the *compressed* file,
 * and compression is exactly what the check is blind to: a few megabytes of zeroes unpacks into
 * gigabytes, and `unzipSync` builds all of it in memory at once. Sixty-four megabytes is far above
 * any real export of a wiki and far below what takes a function down.
 */
const MAX_UNPACKED = 64 * 1024 * 1024;

/**
 * Refuses an archive that unpacks to more than `MAX_UNPACKED`, without unpacking any of it.
 *
 * For the archives this app does not open itself: a `.docx` is read by `mammoth` and an `.xlsx` by
 * `read-excel-file`, and both unpack the whole thing before anyone can object. The central
 * directory carries every entry's original size, so the question can be answered from the header
 * alone — which is what the filter below does, returning false for everything so that nothing is
 * decompressed on the way.
 */
export async function refuseIfItUnpacksTooFar(bytes: Uint8Array): Promise<void> {
  const { unzipSync } = await import('fflate');
  let unpacked = 0;

  unzipSync(bytes, {
    filter: (file) => {
      unpacked += file.originalSize ?? 0;

      if (unpacked > MAX_UNPACKED) {
        throw new Error('it unpacks to more than this app will read at once');
      }

      return false;
    },
  });
}

/**
 * The archive's entries whose path `wanted` accepts, as text, keyed by that path.
 *
 * For the formats where which file matters rather than which extension: a `.pptx` is a zip whose
 * every part is `.xml`, and the four it is read through — the presentation, its relationships, the
 * slides and their notes — are told apart by where they sit and by nothing else.
 *
 * The filter reads the central directory's own `originalSize` before anything is decompressed,
 * which is what makes the size check a check rather than a post-mortem. It also skips unpacking
 * every entry that would be thrown away afterwards.
 */
export async function readZipEntries(
  bytes: Uint8Array,
  wanted: (path: string) => boolean
): Promise<Map<string, Uint8Array>> {
  const { unzipSync } = await import('fflate');

  let files: Record<string, Uint8Array>;
  let unpacked = 0;

  try {
    files = unzipSync(bytes, {
      filter: (file) => {
        unpacked += file.originalSize ?? 0;

        if (unpacked > MAX_UNPACKED) {
          throw new Error('it unpacks to more than this app will read at once');
        }

        return file.size > 0 && wanted(file.name);
      },
    });
  } catch (cause) {
    throw new Error(
      `That is not a readable .zip: ${cause instanceof Error ? cause.message : 'it could not be opened'}`
    );
  }

  return new Map(
    Object.entries(files).filter(([path, data]) => data.length > 0 && wanted(path))
  );
}

/** The same entries, decoded as text. */
export async function readZipTextEntries(
  bytes: Uint8Array,
  wanted: (path: string) => boolean
): Promise<Map<string, string>> {
  const { strFromU8 } = await import('fflate');
  const files = await readZipEntries(bytes, wanted);

  return new Map([...files].map(([path, data]) => [path, strFromU8(data)]));
}

/**
 * Every picture in the archive, by its path.
 *
 * A separate pass over the zip rather than a second job for the one above: an importer reads text
 * by extension and pictures by what they are, and fflate is fast enough on the ten megabytes this
 * app accepts that the alternative — one pass handing back a mixture the caller has to sort — buys
 * nothing and reads worse at every call site.
 */
export async function readZipPictures(
  bytes: Uint8Array
): Promise<Map<string, Uint8Array>> {
  return readZipEntries(bytes, (path) => pictureType(path) !== null);
}

/** Every entry in the archive matching `extension`, as text — skips directories and empty files. */
export async function readZipTextFiles(
  bytes: Uint8Array,
  extension: string
): Promise<ZipPage[]> {
  const files = await readZipTextEntries(bytes, (path) =>
    path.toLowerCase().endsWith(extension)
  );

  return (
    [...files.entries()]
      // A stable order matters: it decides the order pages appear in the merged document, and the
      // path is the only thing here that does not change between two exports of the same space.
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, text]) => ({ path, text }))
  );
}

/**
 * A page's own first line is usually already its title as an H1 — printed once by whatever
 * produced this page's markdown, and once more by the `# ${title}` this importer is about to add
 * on top of every page for the table of contents to point at. Without this, every single page in
 * the merged document would carry its title twice.
 */
export function withoutDuplicateTitle(markdown: string, title: string): string {
  const lines = markdown.replace(/^﻿/, '').split('\n');
  const first = lines.findIndex((line) => line.trim().length > 0);

  if (first === -1) {
    return markdown;
  }

  const heading = lines[first].match(/^#+\s+(.*)$/);

  if (heading && plainly(heading[1]) && plainly(heading[1]) === plainly(title)) {
    return lines.slice(first + 1).join('\n');
  }

  return markdown;
}

/**
 * A heading reduced to the words in it, for comparing one against another.
 *
 * A chapter of a book routinely opens with its own title set in bold — `# **PROLOGUE**` under a
 * contents entry that says `PROLOGUE` — and trailing spaces survive the conversion from XHTML.
 * Comparing the two as written called them different and printed the title twice. Emphasis,
 * code marks and spacing are not part of what a heading says.
 */
function plainly(heading: string): string {
  return heading
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export interface TocPage {
  title: string;
  markdown: string;
}

/**
 * One document out of several pages: a table of contents, then every page in order, each
 * separated the same way "chain several files" already separates unrelated uploads — see
 * `src/lib/merge.ts`. Kept here rather than imported from there: that module is the browser app's
 * own merge feature, and this file has to run on the server too.
 */
export function buildTocDocument(
  title: string,
  pages: TocPage[],
  /** One line under the title, before the contents — a book's author, and nothing else so far. */
  lede?: string
): string {
  const toc = pages.map((page) => `- ${page.title}`).join('\n');

  const sections = pages.map((page) => page.markdown.trim());

  return [
    [`# ${title}`, lede, toc].filter(Boolean).join('\n\n'),
    ...sections,
  ].join('\n\n---\n\n');
}
