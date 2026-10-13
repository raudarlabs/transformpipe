import type { Token, Tokens } from 'marked';
import { githubSlug, slugify } from './markdown.js';

/*
 * What the three writers that are not HTML — Confluence, Jira, Slack — have in common.
 *
 * Each walks the same token stream (`lexMarkdown` in markdown.ts) and writes its own syntax, and
 * the parts that are not syntax are here once: the plain words of a run of inline tokens, which
 * links point at one of the document's own headings, and which pictures have an address another
 * program could ever load.
 */

/** The words of a run of inline tokens with every mark taken off — for an anchor, a title, a cell. */
export function plainText(tokens: Token[] | undefined, fallback = ''): string {
  if (!tokens) {
    return fallback;
  }

  return tokens
    .map((token) => {
      const nested = (token as { tokens?: Token[] }).tokens;

      if (nested) {
        return plainText(nested);
      }

      switch (token.type) {
        case 'image':
          return (token as Tokens.Image).text;
        case 'br':
          return ' ';
        case 'footnoteRef':
          return '';
        case 'html':
          return (token as Tokens.HTML).text.replace(/<[^>]*>/g, '');
        default:
          return String((token as { text?: string }).text ?? '');
      }
    })
    .join('');
}

/**
 * The document's headings, and every spelling of a link that means one of them.
 *
 * The same spellings `linkAnchors` in markdown.ts resolves — GitHub's slug, this site's, the bare
 * words, Obsidian's — so a table of contents that jumped in the preview jumps in the other format
 * too. `slug` is the one name each heading is given there, and `anchorFor` answers a link's
 * fragment with it, or null when the link is not to a heading of this document.
 */
export interface Headings {
  anchorFor(fragment: string): string | null;
  /** Every heading somebody links to, by slug: only those need an anchor written before them. */
  linked: Set<string>;
  /** The slug of the n-th heading in the document, in the order they come. */
  slugs: string[];
}

export function collectHeadings(tokens: Token[]): Headings {
  const plains: string[] = [];
  const links: string[] = [];

  const walk = (list: Token[]) => {
    for (const token of list) {
      if (token.type === 'heading') {
        plains.push(plainText((token as Tokens.Heading).tokens).trim());
      }

      if (token.type === 'link' && (token as Tokens.Link).href.startsWith('#')) {
        links.push((token as Tokens.Link).href.slice(1));
      }

      const nested = (token as { tokens?: Token[] }).tokens;

      if (nested) walk(nested);

      if (token.type === 'list') {
        (token as Tokens.List).items.forEach((item) => walk(item.tokens));
      }

      if (token.type === 'table') {
        const table = token as Tokens.Table;

        table.header.forEach((cell) => walk(cell.tokens));
        table.rows.forEach((row) => row.forEach((cell) => walk(cell.tokens)));
      }
    }
  };

  walk(tokens);

  const used = new Map<string, number>();
  const github = new Map<string, number>();
  const target = new Map<string, string>();
  const slugs = plains.map((plain) => {
    const slug = slugify(plain, used).replace(/^doc-/, '');
    const words = plain.toLowerCase();

    for (const spelling of [slug, githubSlug(plain, github), words, words.replace(/\s+/g, '-')]) {
      if (spelling && !target.has(spelling)) target.set(spelling, slug);
    }

    return slug;
  });

  const anchorFor = (fragment: string): string | null => {
    let wanted = fragment;

    try {
      wanted = decodeURIComponent(wanted);
    } catch {
      // A stray % is still a fragment somebody meant.
    }

    wanted = wanted.toLowerCase().replace(/^doc-/, '');

    return target.get(wanted) ?? null;
  };

  return {
    anchorFor,
    linked: new Set(links.map(anchorFor).filter((one): one is string => one !== null)),
    slugs,
  };
}

/**
 * Whether another program could ever load this picture.
 *
 * A picture carried inside the document is a `data:` address that can run to a megabyte, and
 * neither Confluence, Jira nor Slack will take one; a relative path points at a file that stayed on
 * somebody's disk. Only a web address survives being pasted somewhere else, and the rest are
 * written as their description instead — which is the part a reader still gets something from.
 */
export const isWebAddress = (href: string) => /^https?:\/\//i.test(href);

/** A soft line break inside a paragraph is a space; all three formats read a newline as a break. */
export const unwrap = (text: string) => text.replace(/\s*\n\s*/g, ' ');

/** A table's cells as text, header first, each cell written by `cell`. */
export function tableCells(
  table: Tokens.Table,
  cell: (tokens: Token[]) => string
): { head: string[]; rows: string[][] } {
  return {
    head: table.header.map((one) => cell(one.tokens)),
    rows: table.rows.map((row) => row.map((one) => cell(one.tokens))),
  };
}
