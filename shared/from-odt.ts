import { markdownTable } from './from-table.js';
import { escapeMarkdownLine } from './from-text.js';
import { embedPictures, pictureBudget, pictureFinder } from './pictures.js';
import { readZipPictures, readZipTextEntries } from './zip-import.js';
import {
  attribute,
  childNodes,
  decodeXml,
  elements,
  openingTags,
  textOf,
  type XmlNode,
} from './xml.js';

/*
 * An OpenDocument text file — what LibreOffice, OpenOffice and Google Docs write.
 *
 * The third zip-of-XML format here, and the one whose XML actually describes a document rather
 * than a drawing: `<text:h>` is a heading and says its own level, `<text:list>` nests for every
 * indent, `<table:table>` is a table. There is no guessing what a thing is, which makes this the
 * most faithful of the readers and the least interesting to write.
 *
 * The one indirection is emphasis. Bold is not on the run — it is a style name on the run, and
 * the style is defined elsewhere, possibly inheriting from another style, possibly in the other
 * file. So the styles are read first, from both `content.xml` and `styles.xml`, and resolved
 * through their parents before a single word is converted.
 */

interface Style {
  parent: string | null;
  bold: boolean;
  italic: boolean;
  strike: boolean;
  /* A paragraph style that is a heading, for the documents that use one instead of `<text:h>`. */
  heading: number | null;
}

/** `Heading_20_2` is how OpenDocument spells "Heading 2" in a name. */
const HEADING_STYLE = /^Heading(?:_20_|\s)(\d)$/;

/**
 * The `<style:style>` and `<text:list-style>` elements of a document, whichever container holds
 * them, including the ones written self-closing.
 *
 * That last part is the reason this walks rather than matching: a style that sets no properties
 * of its own — `<style:style style:name="P9" style:parent-style-name="Heading_20_2"/>` — is one
 * tag, and a pattern that wants an opening and a closing tag does not see it at all. Which is
 * precisely the style that makes a paragraph a heading.
 */
function styleNodes(xml: string): XmlNode[] {
  const containers = [
    ...elements(xml, 'office:automatic-styles'),
    ...elements(xml, 'office:styles'),
  ];

  return containers.flatMap((one) => childNodes(one.inner));
}

function readStyles(...documents: (string | undefined)[]): Map<string, Style> {
  const styles = new Map<string, Style>();

  for (const xml of documents) {
    if (!xml) continue;

    for (const style of styleNodes(xml)) {
      if (style.kind !== 'element' || style.name !== 'style:style') continue;

      const name = attribute(`<x${style.attributes}>`, 'style:name');

      if (!name) continue;

      const parent = attribute(`<x${style.attributes}>`, 'style:parent-style-name');
      const text = openingTags(style.inner, 'style:text-properties')[0] ?? null;

      styles.set(name, {
        parent,
        bold: attribute(text, 'fo:font-weight') === 'bold',
        italic: attribute(text, 'fo:font-style') === 'italic',
        strike: (attribute(text, 'style:text-line-through-style') ?? 'none') !== 'none',
        heading: Number(HEADING_STYLE.exec(parent ?? '')?.[1]) || null,
      });
    }
  }

  return styles;
}

/** A style with everything it inherits folded in. Depth-capped: a cycle is a broken file. */
function resolve(styles: Map<string, Style>, name: string | null): Style {
  const flat: Style = { parent: null, bold: false, italic: false, strike: false, heading: null };

  for (let at = name, step = 0; at && step < 12; step += 1) {
    const style = styles.get(at);

    if (!style) {
      flat.heading ??= Number(HEADING_STYLE.exec(at)?.[1]) || null;

      break;
    }

    flat.bold ||= style.bold;
    flat.italic ||= style.italic;
    flat.strike ||= style.strike;
    flat.heading ??= style.heading;
    at = style.parent;
  }

  return flat;
}

/**
 * Which list levels are numbered.
 *
 * A list's style says, level by level, whether it draws a number or a character. Markdown has
 * only the two kinds, so that one bit per level is the whole of what is worth reading here.
 */
function readListStyles(...documents: (string | undefined)[]): Map<string, boolean[]> {
  const lists = new Map<string, boolean[]>();

  for (const xml of documents) {
    if (!xml) continue;

    for (const style of styleNodes(xml)) {
      if (style.kind !== 'element' || style.name !== 'text:list-style') continue;

      const name = attribute(`<x${style.attributes}>`, 'style:name');

      if (!name) continue;

      const levels: boolean[] = [];

      for (const tag of openingTags(style.inner, 'text:list-level-style-[a-z]+')) {
        const level = Number(attribute(tag, 'text:level') ?? '1') || 1;

        levels[level - 1] = tag.startsWith('<text:list-level-style-number');
      }

      lists.set(name, levels);
    }
  }

  return lists;
}

export async function odtToMarkdown(bytes: Uint8Array, fallbackTitle: string): Promise<string> {
  const [files, media] = await Promise.all([
    readZipTextEntries(bytes, (path) =>
      ['content.xml', 'styles.xml', 'meta.xml'].includes(path.toLowerCase())
    ),
    readZipPictures(bytes),
  ]);

  const content = files.get('content.xml');

  if (!content) {
    throw new Error('No content.xml in that file — is it an .odt? An OpenDocument file is a zip with one.');
  }

  const stylesXml = files.get('styles.xml');
  const styles = readStyles(content, stylesXml);
  const lists = readListStyles(content, stylesXml);

  const body = elements(content, 'office:text')[0]?.inner;

  if (!body) {
    throw new Error('That .odt has no text in it');
  }

  /* Footnotes and endnotes, collected as they are met and printed once at the end. */
  const notes: string[] = [];

  const inline = (xml: string, style: Style): string => {
    let out = '';

    for (const node of childNodes(xml)) {
      if (node.kind === 'text') {
        out += escapeMarkdownLine(decodeXml(node.text));

        continue;
      }

      const tag = `<x${node.attributes}>`;

      switch (node.name) {
        case 'text:span': {
          const own = resolve(styles, attribute(tag, 'text:style-name'));
          const text = inline(node.inner, {
            ...style,
            bold: style.bold || own.bold,
            italic: style.italic || own.italic,
            strike: style.strike || own.strike,
          });

          /* Applied here rather than inside, so one `**` wraps the run instead of every word. */
          out += wrap(text, own, style);

          break;
        }

        case 'text:a': {
          const href = decodeXml(attribute(tag, 'xlink:href') ?? '');
          const text = inline(node.inner, style);

          out += href ? `[${text}](${href})` : text;

          break;
        }

        case 'text:line-break':
          out += '\\\n';
          break;

        case 'text:tab':
          out += ' ';
          break;

        case 'text:s':
          out += ' '.repeat(Number(attribute(tag, 'text:c') ?? '1') || 1);
          break;

        case 'text:note': {
          const note = elements(node.inner, 'text:note-body')[0];
          const text = note ? blocks(note.inner).replace(/\s+/g, ' ').trim() : '';

          if (text) {
            notes.push(text);
            out += `[^${notes.length}]`;
          }

          break;
        }

        case 'draw:frame': {
          const image = openingTags(node.inner, 'draw:image')[0] ?? null;
          const href = decodeXml(attribute(image, 'xlink:href') ?? '');
          const alt = textOf(elements(node.inner, 'svg:title')[0]?.inner ?? '');

          if (href) out += `![${escapeMarkdownLine(alt)}](${href})`;

          break;
        }

        /* Anything else is a wrapper — a bookmark, a change mark, a field — around its own text. */
        default:
          out += inline(node.inner, style);
      }
    }

    return out;
  };

  /** The markers a run needs that its surroundings do not already provide. */
  const wrap = (text: string, own: Style, around: Style): string => {
    if (!text.trim()) return text;

    let out = text;

    if (own.strike && !around.strike) out = `~~${out}~~`;
    if (own.italic && !around.italic) out = `*${out}*`;
    if (own.bold && !around.bold) out = `**${out}**`;

    return out;
  };

  const plain: Style = { parent: null, bold: false, italic: false, strike: false, heading: null };

  const listItems = (xml: string, style: string | null, level: number): string => {
    const numbered = (style ? lists.get(style) : undefined)?.[level] ?? false;
    const out: string[] = [];

    for (const item of childNodes(xml)) {
      if (item.kind !== 'element') continue;
      if (item.name !== 'text:list-item' && item.name !== 'text:list-header') continue;

      const body = blocks(item.inner, style, level);

      if (!body.trim()) continue;

      /* Every line after the first is indented to stay inside the item it belongs to. */
      const [first, ...rest] = body.split('\n');

      /*
       * No indent of its own. A nested list is rendered inside the item that carries it, and
       * that item indents everything after its first line — so adding the level's own indent
       * here as well put a third-level bullet eight spaces in and out of its list entirely.
       */
      out.push(
        [
          `${numbered ? '1.' : '-'} ${first}`,
          ...rest.map((line) => (line ? `  ${line}` : line)),
        ].join('\n')
      );
    }

    return out.join('\n');
  };

  const table = (xml: string): string => {
    const rows: string[][] = [];

    const rowsIn = (fragment: string) => {
      for (const node of childNodes(fragment)) {
        if (node.kind !== 'element') continue;

        /* A header group holds rows too, and a row can be repeated rather than written twice. */
        if (node.name === 'table:table-header-rows' || node.name === 'table:table-row-group') {
          rowsIn(node.inner);

          continue;
        }

        if (node.name !== 'table:table-row') continue;

        const cells: string[] = [];

        for (const cell of childNodes(node.inner)) {
          if (cell.kind !== 'element') continue;
          if (!cell.name.startsWith('table:')) continue;

          const repeat = Number(attribute(`<x${cell.attributes}>`, 'table:number-columns-repeated') ?? '1') || 1;
          const text = blocks(cell.inner).replace(/\n+/g, ' ').trim();

          for (let n = 0; n < Math.min(repeat, 64); n += 1) cells.push(text);
        }

        rows.push(cells);
      }
    };

    rowsIn(xml);

    const filled = rows.filter((row) => row.some((cell) => cell));

    return filled.length ? markdownTable(filled[0], filled.slice(1)) : '';
  };

  function blocks(xml: string, listStyle: string | null = null, level = -1): string {
    const out: string[] = [];

    for (const node of childNodes(xml)) {
      if (node.kind === 'text') {
        const text = escapeMarkdownLine(decodeXml(node.text)).trim();

        if (text) out.push(text);

        continue;
      }

      const tag = `<x${node.attributes}>`;

      switch (node.name) {
        case 'text:h': {
          const text = inline(node.inner, plain).trim();
          const depth = Math.min(Number(attribute(tag, 'text:outline-level') ?? '1') || 1, 6);

          if (text) out.push(`${'#'.repeat(depth)} ${text}`);

          break;
        }

        case 'text:p': {
          const style = resolve(styles, attribute(tag, 'text:style-name'));
          const text = inline(node.inner, plain).trim();

          if (!text) break;

          out.push(style.heading ? `${'#'.repeat(Math.min(style.heading, 6))} ${text}` : text);

          break;
        }

        case 'text:list': {
          const own = attribute(tag, 'text:style-name') ?? listStyle;
          const rendered = listItems(node.inner, own, level + 1);

          if (rendered) out.push(rendered);

          break;
        }

        case 'table:table': {
          const rendered = table(node.inner).trim();

          if (rendered) out.push(rendered);

          break;
        }

        /* A section, a frame's text box, a change region: a wrapper around ordinary blocks. */
        default:
          if (node.inner) {
            const rendered = blocks(node.inner, listStyle, level);

            if (rendered) out.push(rendered);
          }
      }
    }

    /*
     * Inside a list item the blocks are joined tightly: a paragraph and the nested list under it
     * are one item, and a blank line between them would end the list and start another.
     */
    return out.join(level >= 0 ? '\n' : '\n\n');
  }

  const title =
    textOf(elements(files.get('meta.xml') ?? '', 'dc:title')[0]?.inner ?? '') || fallbackTitle;

  const document = blocks(body);

  if (!document.trim()) {
    throw new Error('Nothing came out of that .odt — it has no text in it');
  }

  const footnotes = notes.map((note, index) => `[^${index + 1}]: ${note}`).join('\n');

  /*
   * A heading only where the document does not open with one. An `.odt` written from a template
   * usually starts with its own title as Heading 1, and printing the file name above it would be
   * the second title on the page.
   */
  const heading = document.startsWith('# ') ? '' : `# ${title}\n\n`;

  return embedPictures(
    `${heading}${document}${footnotes ? `\n\n${footnotes}` : ''}\n`,
    pictureFinder(media, ''),
    pictureBudget()
  );
}
