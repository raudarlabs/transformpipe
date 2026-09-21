import { PICTURES_BYTES, PICTURE_BYTES } from './limits.js';

/*
 * The pictures in an export, carried into the document instead of left behind in the archive.
 *
 * Every importer here had the same hole in it, and it was the loudest complaint about both formats
 * it affects. A Notion export keeps its images in folders named after the pages they belong to and
 * links to them relatively; a Confluence export keeps them under `attachments/`; an Obsidian vault
 * keeps them wherever you put them. All three arrive as one `.zip`, all three write
 * `![](some/path.png)` into the Markdown, and all three used to produce a document whose every
 * picture pointed at a file that was never unpacked. A person dropped a wiki in and got a
 * document with twenty broken images in it — which is worse than a document with no images,
 * because it looks like the converter lost them rather than never having had them.
 *
 * A picture is embedded rather than uploaded. That is not a shortcut, it is the constraint: every
 * conversion page here promises in five languages that the file stays in the browser, and putting
 * the images in blob storage on the way through would make that untrue. A `data:` URI carries its
 * own bytes and asks nobody for them, which is the same reason `server/docx.ts` already keeps
 * exactly those and drops every other kind of `<img>` on the way into a Word file.
 *
 * What it costs is size, and size has a ceiling that is not ours — see `limits.ts`. So there is a
 * budget, spent in document order, and two ways of running out:
 *
 *   - a picture that came from the archive and does not fit keeps the link it had. Nothing is
 *     lost that was not already lost, and the document is no worse than it is today.
 *   - a picture that was already a `data:` URI has no link to fall back to, so it is replaced by
 *     its own alt text in italics — the rule `notes.ts` already uses for an Obsidian embed it
 *     cannot carry over.
 */

/** Bytes of a picture, and what it is, ready to be written into a document. */
export interface Picture {
  bytes: Uint8Array;
  /** The media type, from the file's own extension. */
  type: string;
}

/**
 * What one document may still spend on pictures.
 *
 * Mutable and passed around on purpose: an archive becomes one document, so the twelve pages in it
 * share one allowance rather than each getting the whole of it and the twelfth page blowing the
 * ceiling on its own.
 */
export interface Budget {
  left: number;
}

export function pictureBudget(): Budget {
  return { left: PICTURES_BYTES };
}

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  tif: 'image/tiff',
  tiff: 'image/tiff',
};

/** Whether this path names a picture this can carry, and what it would be called. */
export function pictureType(path: string): string | null {
  const dot = path.lastIndexOf('.');

  return dot === -1 ? null : (TYPES[path.slice(dot + 1).toLowerCase()] ?? null);
}

/*
 * 8192 rather than the whole array: `String.fromCharCode(...bytes)` spreads every byte into an
 * argument, and a megabyte of them overflows the call stack in every engine. Chunking is the
 * usual answer and the chunk size is the usual one.
 */
const CHUNK = 8192;

function base64(bytes: Uint8Array): string {
  let binary = '';

  for (let at = 0; at < bytes.length; at += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(at, at + CHUNK));
  }

  return btoa(binary);
}

export function dataUri(picture: Picture): string {
  return `data:${picture.type};base64,${base64(picture.bytes)}`;
}

/** What a `data:` URI of these bytes will weigh, without building it. */
function weight(bytes: number): number {
  return Math.ceil(bytes / 3) * 4;
}

/**
 * Markdown's inline image, with the optional title and the optional angle brackets around the
 * address that CommonMark allows and Notion occasionally writes.
 */
const PICTURE = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*"|\s+'[^']*')?\s*\)/g;

/** An address that already points at something, and is nobody's file inside an archive. */
const ELSEWHERE = /^(?:https?:|mailto:|tel:|#|\/\/)/i;

/**
 * Every picture in this Markdown, embedded where it can be found and afforded.
 *
 * `find` answers for one address at a time, because where a relative path resolves to is the one
 * thing each archive does differently — Notion against the page's own folder, Obsidian against
 * the whole vault by file name. Pass `null` for Markdown that has no archive behind it, and the
 * only thing left to do is hold the already-inline pictures to the same budget.
 *
 * Fenced code is skipped. An `![](…)` inside a fence is an example of the syntax, not a picture,
 * and rewriting it would edit somebody's documentation about Markdown into base64.
 */
export function embedPictures(
  markdown: string,
  find: ((href: string) => Picture | null) | null,
  budget: Budget
): string {
  const lines = markdown.split('\n');
  let fence: string | null = null;

  const out = lines.map((line) => {
    const marker = /^\s{0,3}(```+|~~~+)/.exec(line);

    if (fence) {
      if (marker && line.trimStart().startsWith(fence)) fence = null;

      return line;
    }

    if (marker) {
      fence = marker[1];

      return line;
    }

    return line.replace(PICTURE, (whole, alt: string, href: string) => {
      if (href.startsWith('data:')) {
        const cost = href.length;

        if (cost > budget.left) return alt.trim() ? `*${alt.trim()}*` : '';

        budget.left -= cost;

        return whole;
      }

      if (!find || ELSEWHERE.test(href)) return whole;

      const picture = find(href);

      if (!picture) return whole;

      const cost = weight(picture.bytes.length);

      if (cost > PICTURE_BYTES || cost > budget.left) return whole;

      budget.left -= cost;

      return `![${alt}](${dataUri(picture)})`;
    });
  });

  return out.join('\n');
}

/**
 * A relative address inside an archive, as a path from its root.
 *
 * `base` is the folder the file doing the linking sits in. The `%20` that Notion writes for every
 * space has to come off, because the archive's own entry names are not encoded.
 */
export function resolveInArchive(base: string, href: string): string {
  let target = href.split('#')[0].split('?')[0];

  try {
    target = decodeURIComponent(target);
  } catch {
    /* A stray per cent sign is not an escape. The raw path is the better guess. */
  }

  if (target.startsWith('/')) return target.slice(1);

  const parts = base.split('/').filter(Boolean);

  for (const step of target.split('/')) {
    if (step === '..') parts.pop();
    else if (step && step !== '.') parts.push(step);
  }

  return parts.join('/');
}

/**
 * The lookup an archive-based importer hands to `embedPictures`.
 *
 * Two attempts, in order. The path the link actually wrote, resolved against the page's own
 * folder — which is what Notion and Confluence mean. Then the file name on its own, anywhere in
 * the archive, which is what Obsidian means: a vault resolves an embed by name, not by path, so
 * `![[diagram.png]]` finds the file wherever it was filed.
 */
export function pictureFinder(
  files: Map<string, Uint8Array>,
  base: string
): (href: string) => Picture | null {
  const byName = new Map<string, Uint8Array>();

  for (const [path, bytes] of files) {
    const name = path.split('/').pop()!.toLowerCase();

    if (!byName.has(name)) byName.set(name, bytes);
  }

  return (href) => {
    const type = pictureType(href.split('#')[0].split('?')[0]);

    if (!type) return null;

    const path = resolveInArchive(base, href);
    const bytes =
      files.get(path) ?? byName.get(path.split('/').pop()!.toLowerCase()) ?? null;

    return bytes ? { bytes, type } : null;
  };
}
