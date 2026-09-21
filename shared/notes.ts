/*
 * The two things a note carries that mean nothing once it leaves the app that wrote it.
 *
 * Both were already handled by the Obsidian importer, and for a while only there — so a vault
 * converted as a zip came out clean while the same note pasted on its own came out with a table of
 * YAML at the top and double brackets through the prose. They live here now, with no dependencies,
 * so the shared renderer and the importer make the same call.
 */

/** `[[Note]]`, `[[Note|Text]]`, `[[Note#Heading]]`, `[[Note#Heading|Text]]`, and `![[...]]`. */
const WIKILINK = /!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g;

const EMBEDDED_FILE = /\.(png|jpe?g|gif|svg|webp|bmp|pdf|mp3|mp4|wav|mov)$/i;

/**
 * Wikilinks, reduced to the words in them.
 *
 * They resolve against a vault, and a converted document has no vault — so there is nothing to
 * point at. The words are what survives, which is the same call this app already made for Notion's
 * internal links.
 */
export function rewriteWikilinks(
  markdown: string,
  hasPicture?: (name: string) => boolean
): string {
  return markdown.replace(WIKILINK, (whole, target: string, shown?: string) => {
    const text = (shown ?? target).trim();
    const embed = whole.startsWith('!') && EMBEDDED_FILE.test(target);

    if (!embed) return text;

    /*
     * An embed whose file is in the archive becomes an ordinary Markdown image, which is all this
     * does: the bytes are put in later, by `pictures.ts`, in one place for every importer. A note
     * pasted on its own has no archive behind it and no `hasPicture` — there the attachment has
     * nothing to carry over, and the words are what survives.
     */
    return hasPicture?.(target.trim()) ? `![${text}](${target.trim()})` : `*${text}*`;
  });
}

/**
 * The `---`-delimited properties block at the top of a note, removed.
 *
 * Obsidian writes one, and so does every static site generator; the keys in it describe the vault
 * or the site that defined them and mean nothing here. Left in, Markdown reads the delimiters as a
 * rule and a heading, so a note opens with a horizontal line and its own YAML set as a title —
 * which is how this was noticed.
 */
export function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^﻿?---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/);

  return match ? markdown.slice(match[0].length) : markdown;
}
