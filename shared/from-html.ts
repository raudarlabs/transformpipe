import { NodeHtmlMarkdown } from 'node-html-markdown';

/*
 * HTML in, Markdown out — the same implementation in the browser and on the server.
 *
 * The library was chosen for that: it carries its own parser, so it runs where there is no DOM, and
 * the alternative that only works in a browser would have left the API, the command line and the
 * assistant tools unable to do a conversion the app offers on its own front page.
 *
 * It handles tables and strikethrough itself. Task lists it does not, so that is the one translator
 * written here: a checkbox inside a list item is the whole point of a task list, and a document that
 * loses its ticks on the way through has lost the thing somebody was tracking.
 */

const translators = {
  /*
   * `- [x] ` and `- [ ] `. The checkbox is rendered as the marker's text rather than as content of
   * the item, so the list item's own translator puts the dash in front of it and the two meet.
   */
  input: ({
    node,
  }: {
    node: { getAttribute(name: string): string | null | undefined };
  }) => {
    const type = (node.getAttribute('type') ?? '').toLowerCase();

    if (type !== 'checkbox') {
      return { ignore: true, recurse: false };
    }

    /*
     * `checked` is a boolean attribute: when it is there its value is the empty string, so presence
     * is the test. This parser answers `undefined` for an attribute that is absent, and comparing
     * against `null` alone turns every box into a ticked one — which is worse than losing them,
     * because a list of things to do arrives looking done.
     */
    const attribute = node.getAttribute('checked');
    const ticked =
      (attribute !== undefined && attribute !== null) ||
      node.getAttribute('data-checked') === 'true';

    /*
     * `ignore: false` is the load-bearing part. INPUT is on the library's own ignore list, and a
     * custom translator is merged over that entry rather than replacing it — so without this the
     * translator is registered, never runs, and the ticks disappear with no error anywhere.
     */
    return {
      content: ticked ? '[x] ' : '[ ] ',
      ignore: false,
      recurse: false,
      noEscape: true,
    };
  },
};

let converter: NodeHtmlMarkdown | null = null;

function instance(): NodeHtmlMarkdown {
  converter ??= new NodeHtmlMarkdown(
    {
      // Its own parser, everywhere. One parser means one set of results to explain.
      preferNativeParser: false,
      bulletMarker: '-',
      codeFence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      // A wrapped line inside a paragraph is not a line break in Markdown, and pretending it is
      // fills the output with trailing spaces nobody asked for.
      keepDataImages: false,
    },
    translators as never
  );

  return converter;
}

/** A row of a Markdown table, split on the pipes that are not escaped. */
function cellsOf(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());
}

const SEPARATOR = /^[\s|:-]+$/;

/**
 * Tables, tidied — the widths dropped and the empty columns with them.
 *
 * A table written by hand has short cells and reads better aligned, which is what the library does:
 * every cell is padded to the widest in its column and the separator row is padded to match. A
 * table lifted off a web page has neither property. One cell holding a sentence pads its whole
 * column to that width, so the separator becomes two hundred dashes on a line of its own, and the
 * spacer cells a layout uses arrive as columns that are empty in every row. Both were visible in a
 * dashboard somebody saved: a wall of dashes with `|  |  |` running through it.
 *
 * So: any column with nothing in it anywhere goes, and what is left is written compactly. Markdown
 * renders the two identically; only the source differs, and the compact one is the one a person can
 * read.
 */
function tidyTables(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].trim().startsWith('|')) {
      out.push(lines[i]);
      continue;
    }

    const block: string[] = [];

    while (i < lines.length && lines[i].trim().startsWith('|')) {
      block.push(lines[i]);
      i += 1;
    }

    i -= 1;

    const rows = block.map(cellsOf);
    const width = Math.max(...rows.map((row) => row.length));
    const separators = new Set(
      block.map((line, at) => (SEPARATOR.test(line) ? at : -1)).filter((at) => at >= 0)
    );

    /* A column is empty when no row that carries content has anything in it. */
    const keep: number[] = [];

    for (let column = 0; column < width; column += 1) {
      const used = rows.some(
        (row, at) => !separators.has(at) && (row[column] ?? '').length > 0
      );

      if (used) keep.push(column);
    }

    /* Every column empty means this was layout, not a table; the block is left alone. */
    if (keep.length === 0) {
      out.push(...block);
      continue;
    }

    for (const [at, row] of rows.entries()) {
      out.push(
        separators.has(at)
          ? `| ${keep.map(() => '---').join(' | ')} |`
          : `| ${keep.map((column) => row[column] ?? '').join(' | ')} |`
      );
    }
  }

  return out.join('\n');
}

/** Everything a browser or an editor wraps a fragment in, and none of it is the document. */
const STRIP = /<(script|style|noscript|template|svg|iframe|head|nav|footer)\b[\s\S]*?<\/\1>/gi;

export function htmlToMarkdown(html: string): string {
  const body = html
    // A saved page carries the whole browser chrome with it; the article is what was wanted.
    .replace(STRIP, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    /*
     * The XML declaration and the doctype, which are not text and are not tags either — so an
     * HTML parser hands them straight through as content. Invisible on a web page, which is why
     * this went unnoticed, and the first line of every chapter of an EPUB, which is XHTML: a
     * converted book opened with `<?xml version='1.0' encoding='utf-8'?>` above its title.
     */
    .replace(/<\?xml\b[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE\b[^>]*>/gi, '');

  return (
    tidyTables(
      instance()
        .translate(body)
    )
      // Three or more blank lines is what a converted page usually arrives as.
      .replace(/\n{3,}/g, '\n\n')
      /*
       * The checkbox and the text after it each bring their own space, so a task item arrives with
       * two. One is what a task list is written with, and some parsers accept only that.
       */
      .replace(/^(\s*(?:[-*+]|\d+\.)\s\[[ xX]\])\s+/gm, '$1 ')
      .trim() + '\n'
  );
}
