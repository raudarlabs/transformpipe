import { CONVERSIONS } from '../shared/conversions.js';
import { sql } from './db.js';

/*
 * Links from one of an owner's documents to another, made followable by whoever is reading.
 *
 * Such a link is written as the document's address in the app — `/<conversion>?doc=<id>`, with a
 * heading after `#` when it points at one. An import writes them between the pages of a space
 * (`src/lib/imports.ts`), and the Obsidian plugin writes them for a `[[note]]` that is published.
 * The app opens that address for the owner; a reader without the owner's account would land on an
 * empty converter. So wherever somebody else reads the document, each link is decided when it is
 * read, not when it was written: a page inside the shared folder opens there, a page shared on its
 * own opens at its own link, and any other page is the owner's private one and reads as its words.
 *
 * Decided when read, so a note linked before its target was published starts working the moment
 * the target is, and stops when the target is made private — nobody republishes anything.
 */

const PATHS = CONVERSIONS.map((one) => one.path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|');

/** The address part: a conversion's path, the id, and a heading if there is one. */
const ADDRESS = `(?:${PATHS})\\?doc=([0-9a-f-]{36})(#[^"\\s)]*)?`;

const HTML_LINK = new RegExp(`<a href="${ADDRESS}"([^>]*)>([\\s\\S]*?)</a>`, 'g');
/** `[words](address)` — not an image, which a `!` in front would make it. */
const MARKDOWN_LINK = new RegExp(`(?<!!)\\[([^\\]]*)\\]\\(<?${ADDRESS}>?\\)`, 'g');

export interface LinkOptions {
  /** A shared folder the page is read through: its pages open inside it. */
  folder?: { token: string; inside: Set<string> };
  /** The owner reading their own share keeps the app's address, which opens the page for them. */
  isOwner?: boolean;
  /** For a file that leaves the site — Word, PDF, a saved .html — where a link has to be whole. */
  origin?: string;
}

/** The owner's documents among `ids` that somebody else can open, by their share token. */
async function sharedTokens(ownerId: string, ids: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();

  if (ids.length === 0) return found;

  const rows = (await sql()`
    select id::text, share_token from m2h_document
    where user_id = ${ownerId} and id = any(${ids}::uuid[])
      and share_token is not null and share_mode in ('link', 'people')
      and (share_expires_at is null or share_expires_at > now())
  `.catch(() => [])) as Array<{ id: string; share_token: string }>;

  for (const row of rows) found.set(row.id, row.share_token);

  return found;
}

/** Where a link to `id` goes for this reader, or null when it should read as words. */
function targetOf(id: string, fragment: string, shared: Map<string, string>, options: LinkOptions): string | null {
  const origin = options.origin ?? '';

  if (options.folder?.inside.has(id)) {
    return `${origin}/f/${encodeURIComponent(options.folder.token)}/${id}${fragment}`;
  }

  const token = shared.get(id);

  return token ? `${origin}/s/${encodeURIComponent(token)}${fragment}` : null;
}

/** The same links in a page of HTML, as the renderer wrote them. */
export async function linkSharedPages(html: string, ownerId: string, options: LinkOptions = {}): Promise<string> {
  const ids = [...new Set([...html.matchAll(HTML_LINK)].map((match) => match[1]))];
  const shared = await sharedTokens(ownerId, ids.filter((id) => !options.folder?.inside.has(id)));

  return html.replace(HTML_LINK, (whole, id: string, fragment: string | undefined, rest: string, text: string) => {
    const target = targetOf(id, fragment ?? '', shared, options);

    if (target) return `<a href="${target}"${rest}>${text}</a>`;

    return options.isOwner && !options.origin
      ? whole
      : `<span class="md-unshared" title="A page that is not shared">${text}</span>`;
  });
}

/** The same links in Markdown, for a file built from it — Word and PDF read the source, not a page. */
export async function linkSharedMarkdown(markdown: string, ownerId: string, options: LinkOptions): Promise<string> {
  const ids = [...new Set([...markdown.matchAll(MARKDOWN_LINK)].map((match) => match[2]))];
  const shared = await sharedTokens(ownerId, ids.filter((id) => !options.folder?.inside.has(id)));

  return markdown.replace(MARKDOWN_LINK, (whole, text: string, id: string, fragment: string | undefined) => {
    const target = targetOf(id, fragment ?? '', shared, options);

    return target ? `[${text}](${target})` : text;
  });
}
