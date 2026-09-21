import { markdownTable } from './from-table.js';
import { escapeMarkdownLine } from './from-text.js';

/*
 * Rich Text Format, which is what a Mac writes when you drag text out of anything.
 *
 * The odd one among the formats here: not a zip, not XML, not a markup language — a stream of
 * control words and braces that a word processor replays in order. There is no document tree to
 * read, only what the writer did, so this reads it the same way: a cursor, a stack of formatting
 * states that a `{` copies and a `}` restores, and paragraphs collected as they end.
 *
 * What the format does not say, and has to be worked out:
 *
 * **A heading.** Word writes `\outlinelevel0` and means it. TextEdit, Pages and everything else
 * on a Mac write `\b\fs48` — bold, and twenty-four point — and mean exactly the same thing with
 * no way to say so. So the outline level is used where there is one, and where there is not, a
 * paragraph that is bold from end to end and set larger than the body is a heading, at a level
 * ranked by its size. That is a guess, and it is the guess a reader makes too.
 *
 * **A list.** `\ls1\ilvl0` says which list and how deep, and nothing says whether it is numbered.
 * What does say is the marker the writer drew: `{\listtext ● }` against `{\listtext 1. }`. A
 * digit is a number and anything else is a bullet.
 *
 * **Which bytes are text.** Half the file is furniture — the font table, the colour table, the
 * stylesheet, the list definitions, the revision history — and every one of those is a group
 * that has to be skipped whole rather than read and discarded, because the text inside them
 * reads exactly like content.
 */

interface Format {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  /* Half-points, as RTF counts them. 24 is twelve point, which is most documents' body. */
  size: number;
  /* Characters to skip after a `\u`, which is what `\ucN` is for. */
  skip: number;
  href: string | null;
}

interface Piece extends Omit<Format, 'skip'> {
  text: string;
}

interface Para {
  pieces: Piece[];
  outline: number | null;
  list: { level: number; ordered: boolean } | null;
}

/** Groups whose contents are never the document. `\pict` is here until pictures are worth it. */
const FURNITURE = new Set([
  'fonttbl',
  'colortbl',
  'stylesheet',
  'listtable',
  'listoverridetable',
  'info',
  'pict',
  'header',
  'footer',
  'headerl',
  'headerr',
  'footerl',
  'footerr',
  'pgdsctbl',
  'expandedcolortbl',
  'themedata',
  'colorschememapping',
  'latentstyles',
  'datastore',
  'generator',
  'xmlnstbl',
  'rsidtbl',
]);

/** `\'hh` bytes, decoded together so a two-byte codepage survives. */
function decodeBytes(bytes: number[], codepage: number): string {
  if (bytes.length === 0) return '';

  try {
    return new TextDecoder(`windows-${codepage}`).decode(new Uint8Array(bytes));
  } catch {
    /* An encoding this engine does not carry: Latin-1 is the closest thing to a safe default. */
    return bytes.map((byte) => String.fromCharCode(byte)).join('');
  }
}

/** The index just past the `}` that closes the `{` at `from`. */
function closingBrace(rtf: string, from: number): number {
  let depth = 0;

  for (let at = from; at < rtf.length; at += 1) {
    const char = rtf[at];

    if (char === '\\') {
      at += 1;

      continue;
    }

    if (char === '{') depth += 1;

    if (char === '}') {
      depth -= 1;

      if (depth === 0) return at + 1;
    }
  }

  return rtf.length;
}

/** The words inside a group, with the control words dropped — a list's marker, a link's text. */
function plainly(rtf: string): string {
  return rtf
    .replace(/\\'[0-9a-f]{2}/gi, ' ')
    .replace(/\\u-?\d+\s?/g, ' ')
    .replace(/\\[a-z]+-?\d*\s?/gi, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function rtfToMarkdown(rtf: string, fallbackTitle: string): string {
  if (!/^\s*\{\s*\\rtf\d/.test(rtf)) {
    throw new Error('That is not an .rtf — a rich text file starts with {\\rtf.');
  }

  const codepage = Number(/\\ansicpg(\d+)/.exec(rtf)?.[1] ?? '1252') || 1252;

  const paragraphs: Para[] = [];
  const tables: Map<number, string[][]> = new Map();

  let format: Format = {
    bold: false,
    italic: false,
    strike: false,
    size: 24,
    skip: 1,
    href: null,
  };
  const stack: Format[] = [];

  let pieces: Piece[] = [];
  let outline: number | null = null;
  /*
   * Two variables rather than one object: the depth comes from `\ilvl` and whether it is
   * numbered comes from the marker the writer drew, and the two arrive at different moments.
   */
  let listLevel: number | null = null;
  let listOrdered = false;
  let bytes: number[] = [];

  /* A table under construction: cells since the last `\cell`, rows since the last `\row`. */
  let inTable = false;
  let cell: Piece[] = [];
  let row: string[] = [];

  const flushBytes = () => {
    if (bytes.length === 0) return;

    add(decodeBytes(bytes, codepage));
    bytes = [];
  };

  function add(text: string) {
    if (!text) return;

    const last = pieces[pieces.length - 1];

    if (
      last &&
      last.bold === format.bold &&
      last.italic === format.italic &&
      last.strike === format.strike &&
      last.href === format.href &&
      last.size === format.size
    ) {
      last.text += text;

      return;
    }

    pieces.push({
      text,
      bold: format.bold,
      italic: format.italic,
      strike: format.strike,
      size: format.size,
      href: format.href,
    });
  }

  const endParagraph = () => {
    flushBytes();

    if (pieces.some((piece) => piece.text.trim())) {
      paragraphs.push({
        pieces,
        outline,
        list: listLevel === null ? null : { level: listLevel, ordered: listOrdered },
      });
    }

    pieces = [];
    outline = null;
    listLevel = null;
    listOrdered = false;
  };

  /* `\row` follows the last `\cell`, so ending a cell again there would add an empty column. */
  let cellOpen = false;

  const endCell = () => {
    flushBytes();
    cell.push(...pieces);
    pieces = [];
    row.push(render(cell).replace(/\s+/g, ' ').trim());
    cell = [];
    cellOpen = false;
  };

  const endRow = () => {
    if (cellOpen) endCell();

    if (row.some((one) => one)) {
      const at = paragraphs.length;
      const rows = tables.get(at) ?? [];

      rows.push(row);
      tables.set(at, rows);
    }

    row = [];
  };

  let at = 0;

  while (at < rtf.length) {
    const char = rtf[at];

    if (char === '{') {
      /*
       * A group that is furniture, or one that has to be read whole rather than streamed: a
       * field carries its address in one child and its words in another, and a list's marker is
       * read for one character and never printed.
       */
      const word = /^\{\s*\\(\*\s*\\)?([a-z]+)/i.exec(rtf.slice(at, at + 40));
      const name = word?.[2]?.toLowerCase();

      if (name === 'field') {
        const end = closingBrace(rtf, at);
        const group = rtf.slice(at, end);
        const href = /HYPERLINK\s+"([^"]*)"/i.exec(plainly(group).replace(/ "/g, ' "'))?.[1] ?? /HYPERLINK\s+"?([^"}\\]+)"?/i.exec(group)?.[1];
        const shown = /\{\\fldrslt([\s\S]*)\}/.exec(group)?.[1] ?? '';

        flushBytes();

        const before = format.href;

        format = { ...format, href: href?.trim() || null };

        for (const text of [plainly(shown)]) add(text);

        format = { ...format, href: before };
        at = end;

        continue;
      }

      if (name === 'listtext') {
        const end = closingBrace(rtf, at);
        const marker = plainly(rtf.slice(at, end));

        listLevel ??= 0;
        listOrdered = /^\(?\d+[.)]?$/.test(marker);
        at = end;

        continue;
      }

      if (name && (FURNITURE.has(name) || word?.[1])) {
        at = closingBrace(rtf, at);

        continue;
      }

      flushBytes();
      stack.push(format);
      at += 1;

      continue;
    }

    if (char === '}') {
      flushBytes();
      format = stack.pop() ?? format;
      at += 1;

      continue;
    }

    if (char === '\\') {
      const control = /^\\([a-z]+)(-?\d+)?[ ]?/i.exec(rtf.slice(at));

      if (control) {
        const [whole, name, argument] = control;
        const value = argument === undefined ? null : Number(argument);

        at += whole.length;

        switch (name) {
          case 'par':
          case 'sect':
            endParagraph();
            break;
          case 'line':
            flushBytes();
            add('\n');
            break;
          case 'tab':
            flushBytes();
            add(' ');
            break;
          case 'cell':
            endCell();
            break;
          case 'nestcell':
            endCell();
            break;
          case 'row':
          case 'nestrow':
            endRow();
            inTable = false;
            break;
          case 'intbl':
            inTable = true;
            cellOpen = true;
            break;
          case 'pard':
            flushBytes();
            outline = null;
            listLevel = null;
            listOrdered = false;
            format = { ...format, bold: false, italic: false, strike: false, href: format.href };
            break;
          case 'plain':
            flushBytes();
            format = { ...format, bold: false, italic: false, strike: false };
            break;
          case 'b':
            flushBytes();
            format = { ...format, bold: value !== 0 };
            break;
          case 'i':
            flushBytes();
            format = { ...format, italic: value !== 0 };
            break;
          case 'strike':
          case 'striked':
            flushBytes();
            format = { ...format, strike: value !== 0 };
            break;
          case 'fs':
            flushBytes();
            format = { ...format, size: value ?? 24 };
            break;
          case 'uc':
            format = { ...format, skip: value ?? 1 };
            break;
          case 'outlinelevel':
            outline = value === null ? null : value + 1;
            break;
          case 'ilvl':
            listLevel = value ?? 0;
            break;
          case 'ls':
            listLevel ??= 0;
            break;
          case 'u': {
            flushBytes();

            const code = value ?? 0;

            add(String.fromCodePoint(code < 0 ? code + 65536 : code));

            /*
             * The characters after a `\u` are the same character again for a reader that cannot
             * do Unicode, and printing both would double every letter of a Russian sentence.
             */
            let skipped = 0;

            while (skipped < format.skip && at < rtf.length) {
              if (rtf.startsWith("\\'", at)) at += 4;
              else if (rtf[at] === '\\') at += 2;
              else at += 1;

              skipped += 1;
            }

            break;
          }
          default:
            break;
        }

        continue;
      }

      /* A control symbol: an escaped brace, a byte, a non-breaking space, a paragraph mark. */
      const symbol = rtf[at + 1];

      if (symbol === "'") {
        bytes.push(parseInt(rtf.slice(at + 2, at + 4), 16) || 0);
        at += 4;

        continue;
      }

      flushBytes();

      if (symbol === '\n' || symbol === '\r') {
        endParagraph();
        at += 2;

        continue;
      }

      if (symbol === '\\' || symbol === '{' || symbol === '}') {
        add(symbol);
        at += 2;

        continue;
      }

      if (symbol === '~') add(' ');
      if (symbol === '_') add('-');

      at += 2;

      continue;
    }

    if (char === '\n' || char === '\r') {
      at += 1;

      continue;
    }

    flushBytes();
    add(char);
    at += 1;
  }

  endParagraph();

  if (inTable) endRow();

  if (paragraphs.length === 0 && tables.size === 0) {
    throw new Error('Nothing came out of that .rtf — it has no text in it');
  }

  /*
   * The body's size, which is whatever most of the document is set in rather than a number
   * chosen here: a document typeset at ten point has no twelve-point text in it, and every
   * heading in it would go unrecognised against a fixed 24.
   */
  const weights = new Map<number, number>();

  for (const para of paragraphs) {
    for (const piece of para.pieces) {
      weights.set(piece.size, (weights.get(piece.size) ?? 0) + piece.text.length);
    }
  }

  const body = [...weights].sort((one, other) => other[1] - one[1])[0]?.[0] ?? 24;

  /* Every size used by a bold-throughout paragraph, largest first: heading one, two, three. */
  const headingSizes = [
    ...new Set(
      paragraphs
        .filter((para) => para.pieces.every((piece) => piece.bold || !piece.text.trim()))
        .map((para) => Math.max(...para.pieces.map((piece) => piece.size)))
        .filter((size) => size > body)
    ),
  ].sort((one, other) => other - one);

  const headingOf = (para: Para): number | null => {
    if (para.outline !== null) return Math.min(para.outline, 6);
    if (para.list) return null;
    if (!para.pieces.every((piece) => piece.bold || !piece.text.trim())) return null;

    const size = Math.max(...para.pieces.map((piece) => piece.size));
    const rank = headingSizes.indexOf(size);

    return rank === -1 ? null : Math.min(rank + 1, 6);
  };

  const out: { text: string; kind: 'bullet' | 'number' | 'other' }[] = [];

  paragraphs.forEach((para, index) => {
    const table = tables.get(index);

    if (table) out.push({ text: markdownTable(table[0], table.slice(1)).trim(), kind: 'other' });

    const text = render(para.pieces).trim();

    if (!text) return;

    const heading = headingOf(para);

    if (heading) {
      /*
       * Without the bold. On a Mac the bold *is* the heading — there is no other signal — so
       * carrying it through prints `# **A quarterly report**`, which says the same thing twice
       * and in a way no writer of Markdown ever does.
       */
      const words = render(para.pieces.map((piece) => ({ ...piece, bold: false }))).trim();

      out.push({ text: `${'#'.repeat(heading)} ${words.replace(/\n/g, ' ')}`, kind: 'other' });

      return;
    }

    if (para.list) {
      const indent = '  '.repeat(Math.min(para.list.level, 6));

      out.push({
        text: `${indent}${para.list.ordered ? '1.' : '-'} ${text.replace(/\n/g, `\n${indent}  `)}`,
        kind: para.list.ordered ? 'number' : 'bullet',
      });

      return;
    }

    out.push({ text, kind: 'other' });
  });

  for (const [index, table] of tables) {
    if (index >= paragraphs.length) {
      out.push({ text: markdownTable(table[0], table.slice(1)).trim(), kind: 'other' });
    }
  }

  /*
   * Consecutive list items are joined tightly; everything else gets a blank line. A blank line
   * between two bullets ends the list and starts another, which renders as extra space between
   * every item.
   */
  const joined = out.reduce((text, block, index) => {
    if (index === 0) return block.text;

    /*
     * Tight only between items of the *same* list. A bulleted list followed straight by a
     * numbered one is two lists, and running them together makes the numbers continue the
     * bullets.
     */
    const together = block.kind !== 'other' && out[index - 1].kind === block.kind;

    return `${text}${together ? '\n' : '\n\n'}${block.text}`;
  }, '');

  const document = joined.trim();
  const heading = /^#{1,6} /.test(document) ? '' : `# ${fallbackTitle}\n\n`;

  return `${heading}${document}\n`;
}

/** A paragraph's runs as Markdown, with a marker put on once around each run rather than each word. */
function render(pieces: Piece[]): string {
  return pieces
    .map((piece) => {
      if (!piece.text) return '';

      const escaped = piece.text
        .split('\n')
        .map(escapeMarkdownLine)
        .join('\\\n');

      if (!piece.text.trim()) return escaped;

      let text = escaped;

      if (piece.strike) text = `~~${text}~~`;
      if (piece.italic) text = `*${text}*`;
      if (piece.bold) text = `**${text}**`;
      if (piece.href) text = `[${text}](${piece.href})`;

      return text;
    })
    .join('');
}
