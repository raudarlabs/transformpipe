import type { Token, Tokens } from 'marked';
import { alertOf, lexMarkdown } from './markdown.js';
import { collectHeadings, decodeEntities, isWebAddress, unwrap, withoutControls, type Headings } from './to-markup.js';

/*
 * Markdown as a Word document that a Word user can go on editing.
 *
 * The export this replaces went Markdown → HTML → .docx through a library that reads HTML, and it
 * produced what that route always produces: a document that looks right and is made of direct
 * formatting. Every heading was Normal text, bigger and bold; every list was paragraphs with a
 * bullet character typed in; the navigation pane was empty, a table of contents found nothing, and
 * changing the font of the headings meant changing each one by hand.
 *
 * This writes Word's own structure from the same token stream the preview uses:
 *
 * - **Styles, by their built-in names** — Heading 1 to 6, Quote, List Paragraph, Hyperlink, Table
 *   Grid, Footnote Text — so they appear in the Styles pane as Word's own, and a house template
 *   applied later restyles the whole document at once. Code, alerts and inline code get styles of
 *   their own, named so somebody can find them.
 * - **Real lists** — numbering definitions, nested by level, each numbered list restarting at its
 *   own start.
 * - **Real footnotes** at the foot of the page, numbered by Word.
 * - **Bookmarks** on headings, so a link to a heading in the Markdown is a link in Word.
 * - **Pictures** carried inside the file at their own proportions, when the document has their
 *   bytes.
 *
 * It needs no DOM and no network, so the browser makes it for a document that was never saved and
 * the server makes the same file for the API. A picture that lives at a web address is fetched only
 * by the caller that is allowed to — the browser — and handed in; the server never fetches one (see
 * `server/docx.ts`).
 */

export interface DocxOptions {
  /** The document's title, for File → Properties. Its first heading is used when there is one. */
  title: string;
  /**
   * The bytes of a picture at a web address, or null when they cannot be had. Optional: without it
   * such a picture is written as a link under its description.
   */
  fetchPicture?: (url: string) => Promise<Uint8Array | null>;
}

/* ------------------------------------------------------------------------ XML */

const xml = (text: string) =>
  withoutControls(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const NS =
  'xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
  'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
  'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';

/* ------------------------------------------------------------------------ pictures */

interface Picture {
  file: string;
  bytes: Uint8Array;
  width: number;
  height: number;
}

const PICTURE_TYPES: Record<string, string> = { png: 'image/png', jpeg: 'image/jpeg', gif: 'image/gif' };

/** A picture's kind and size in pixels, from its first bytes — or null for anything Word will not show. */
function measure(bytes: Uint8Array): { type: string; width: number; height: number } | null {
  const at = (i: number) => bytes[i] ?? 0;

  // PNG: the IHDR chunk, always first.
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) {
    const width = (at(16) << 24) | (at(17) << 16) | (at(18) << 8) | at(19);
    const height = (at(20) << 24) | (at(21) << 16) | (at(22) << 8) | at(23);

    return width > 0 && height > 0 ? { type: 'png', width, height } : null;
  }

  // GIF: the logical screen, little-endian.
  if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46) {
    return { type: 'gif', width: at(6) | (at(7) << 8), height: at(8) | (at(9) << 8) };
  }

  // JPEG: walk the segments to the first start-of-frame.
  if (at(0) === 0xff && at(1) === 0xd8) {
    let i = 2;

    while (i + 9 < bytes.length) {
      if (at(i) !== 0xff) return null;

      const marker = at(i + 1);
      const length = (at(i + 2) << 8) | at(i + 3);

      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { type: 'jpeg', height: (at(i + 5) << 8) | at(i + 6), width: (at(i + 7) << 8) | at(i + 8) };
      }

      i += 2 + length;
    }
  }

  return null;
}

function decodeDataUrl(url: string): Uint8Array | null {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(url);

  if (!match) return null;

  try {
    const binary = atob(match[2].replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    return bytes;
  } catch {
    return null;
  }
}

/** Every picture address in the document, so the web ones can be fetched before writing starts. */
function pictureAddresses(tokens: Token[], found = new Set<string>()): Set<string> {
  for (const token of tokens) {
    if (token.type === 'image') found.add((token as Tokens.Image).href);

    const nested = (token as { tokens?: Token[] }).tokens;

    if (nested) pictureAddresses(nested, found);
    if (token.type === 'list') (token as Tokens.List).items.forEach((item) => pictureAddresses(item.tokens, found));
    if (token.type === 'table') {
      const table = token as Tokens.Table;

      table.header.forEach((cell) => pictureAddresses(cell.tokens, found));
      table.rows.forEach((row) => row.forEach((cell) => pictureAddresses(cell.tokens, found)));
    }

    const alert = token.type === 'blockquote' ? alertOf(token as Tokens.Blockquote) : null;

    if (alert) pictureAddresses(alert.tokens, found);
  }

  return found;
}

/* ------------------------------------------------------------------------ the writer */

/** Character formatting in force for a run. */
interface Format {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  highlight?: boolean;
  sub?: boolean;
  sup?: boolean;
  code?: boolean;
  link?: boolean;
}

/** Where a paragraph sits: inside a list item, a quote, an alert. */
interface Place {
  /** Paragraph style for a plain paragraph here. */
  style?: string;
  /** Left indent in twips, for a paragraph that continues a list item. */
  indent?: number;
  /** Set on the first paragraph of a list item only: its numbering. */
  numbering?: { id: number; level: number };
}

const TWIPS_PER_LEVEL = 720;
/** Six and a quarter inches of A4 between the margins, in EMU. */
const MAX_PICTURE_WIDTH = 6 * 914400;
const EMU_PER_PIXEL = 9525;

class Writer {
  private relationships: Array<{ id: string; type: string; target: string; external?: boolean }> = [];
  private pictures: Picture[] = [];
  private footnoteIds = new Map<string, number>();
  private footnoteBodies: string[] = [];
  private nums: string[] = [];
  private bookmark = 0;
  private headingIndex = 0;
  private drawing = 0;
  private picturesByAddress = new Map<string, Picture | null>();

  constructor(
    private headings: Headings,
    private fetched: Map<string, Uint8Array | null>
  ) {}

  /* ---------------------------------------------------------------- relationships */

  private relationship(type: string, target: string, external = false): string {
    const id = `rId${this.relationships.length + 10}`;

    this.relationships.push({ id, type, target, external });

    return id;
  }

  private hyperlinkId(href: string): string {
    const existing = this.relationships.find((one) => one.external && one.target === href);

    return (
      existing?.id ??
      this.relationship('http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', href, true)
    );
  }

  /* ---------------------------------------------------------------- runs */

  private runProperties(format: Format): string {
    const parts: string[] = [];

    if (format.code) parts.push('<w:rStyle w:val="InlineCode"/>');
    else if (format.link) parts.push('<w:rStyle w:val="Hyperlink"/>');
    if (format.bold) parts.push('<w:b/><w:bCs/>');
    if (format.italic) parts.push('<w:i/><w:iCs/>');
    if (format.strike) parts.push('<w:strike/>');
    if (format.highlight) parts.push('<w:highlight w:val="yellow"/>');
    if (format.sub) parts.push('<w:vertAlign w:val="subscript"/>');
    if (format.sup) parts.push('<w:vertAlign w:val="superscript"/>');

    return parts.length ? `<w:rPr>${parts.join('')}</w:rPr>` : '';
  }

  /** Text as runs: a tab is a tab and a newline a line break, which `w:t` cannot hold. */
  private text(text: string, format: Format): string {
    if (!text) return '';

    const props = this.runProperties(format);

    return text
      .split('\n')
      .map((line, index) => {
        const pieces = line
          .split('\t')
          .map((piece) => (piece ? `<w:t xml:space="preserve">${xml(piece)}</w:t>` : ''))
          .join('<w:tab/>');

        return `<w:r>${props}${index > 0 ? '<w:br/>' : ''}${pieces}</w:r>`;
      })
      .join('');
  }

  inline(tokens: Token[] | undefined, format: Format = {}): string {
    return (tokens ?? []).map((token) => this.inlineOne(token, format)).join('');
  }

  private inlineOne(token: Token, format: Format): string {
    switch (token.type) {
      case 'text': {
        const text = token as Tokens.Text;

        return text.tokens ? this.inline(text.tokens, format) : this.text(decodeEntities(unwrap(text.text)), format);
      }
      case 'escape':
        return this.text(decodeEntities((token as Tokens.Escape).text), format);
      case 'strong':
        return this.inline((token as Tokens.Strong).tokens, { ...format, bold: true });
      case 'em':
        return this.inline((token as Tokens.Em).tokens, { ...format, italic: true });
      case 'del':
        return this.inline((token as Tokens.Del).tokens, { ...format, strike: true });
      case 'markHighlight':
        return this.text(String((token as Tokens.Generic).text), { ...format, highlight: true });
      case 'subscript':
        return this.text(String((token as Tokens.Generic).text), { ...format, sub: true });
      case 'superscript':
        return this.text(String((token as Tokens.Generic).text), { ...format, sup: true });
      case 'codespan':
      case 'mathInline':
      case 'mathParen':
      case 'mathBracket':
      case 'mathEnv':
        return this.text(String((token as Tokens.Codespan).text), { code: true });
      case 'br':
        return '<w:r><w:br/></w:r>';
      case 'link':
        return this.link(token as Tokens.Link, format);
      case 'image':
        return this.image(token as Tokens.Image, format);
      case 'html': {
        const html = (token as Tokens.HTML).text;

        return /^<br\s*\/?>$/i.test(html.trim()) ? '<w:r><w:br/></w:r>' : '';
      }
      case 'footnoteRef':
        return this.footnoteReference(String((token as Tokens.Generic).text));
      default:
        return this.text(String((token as { raw?: string }).raw ?? ''), format);
    }
  }

  private link(link: Tokens.Link, format: Format): string {
    const inner = this.inline(link.tokens, { ...format, link: true }) || this.text(link.href, { ...format, link: true });

    if (link.href.startsWith('#')) {
      const anchor = this.headings.anchorFor(link.href.slice(1));

      return anchor ? `<w:hyperlink w:anchor="${bookmarkName(anchor)}" w:history="1">${inner}</w:hyperlink>` : this.inline(link.tokens, format);
    }

    if (!/^(https?:|mailto:)/i.test(link.href)) {
      // A path to a file on somebody's disk goes nowhere in a document sent to somebody else.
      return this.inline(link.tokens, format);
    }

    return `<w:hyperlink r:id="${this.hyperlinkId(link.href)}" w:history="1">${inner}</w:hyperlink>`;
  }

  private image(image: Tokens.Image, format: Format): string {
    const picture = this.picture(image.href);

    if (!picture) {
      const words = `[${image.text || 'picture'}]`;

      // Inside a link already — a badge — the words are enough; Word has no link inside a link.
      return isWebAddress(image.href) && !format.link
        ? `<w:hyperlink r:id="${this.hyperlinkId(image.href)}" w:history="1">${this.text(words, { ...format, link: true })}</w:hyperlink>`
        : this.text(words, { ...format, italic: true });
    }

    this.drawing += 1;

    const scale = Math.min(1, MAX_PICTURE_WIDTH / (picture.width * EMU_PER_PIXEL));
    const cx = Math.round(picture.width * EMU_PER_PIXEL * scale);
    const cy = Math.round(picture.height * EMU_PER_PIXEL * scale);
    const id = this.relationship('http://schemas.openxmlformats.org/officeDocument/2006/relationships/image', `media/${picture.file}`);
    const alt = xml(image.text || '');

    return (
      `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` +
      `<wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${this.drawing}" name="Picture ${this.drawing}" descr="${alt}"/>` +
      `<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>` +
      `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>` +
      `<pic:nvPicPr><pic:cNvPr id="${this.drawing}" name="${xml(picture.file)}" descr="${alt}"/><pic:cNvPicPr/></pic:nvPicPr>` +
      `<pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
      `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
      `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
    );
  }

  /** A picture's bytes, once per address: from the document itself, or fetched beforehand by the caller. */
  private picture(href: string): Picture | null {
    if (this.picturesByAddress.has(href)) return this.picturesByAddress.get(href)!;

    const bytes = href.startsWith('data:') ? decodeDataUrl(href) : (this.fetched.get(href) ?? null);
    const size = bytes ? measure(bytes) : null;
    const picture =
      bytes && size
        ? { file: `picture-${this.pictures.length + 1}.${size.type === 'jpeg' ? 'jpg' : size.type}`, bytes, width: size.width, height: size.height }
        : null;

    if (picture) this.pictures.push(picture);
    this.picturesByAddress.set(href, picture);

    return picture;
  }

  /* ---------------------------------------------------------------- footnotes */

  private footnoteTokens = new Map<string, Token[]>();

  setFootnotes(notes: Array<{ id: string; tokens: Token[] }>) {
    notes.forEach((note) => this.footnoteTokens.set(note.id, note.tokens));
  }

  private footnoteReference(id: string): string {
    const tokens = this.footnoteTokens.get(id);

    if (!tokens) return '';

    let number = this.footnoteIds.get(id);

    if (number === undefined) {
      number = this.footnoteIds.size + 1;
      this.footnoteIds.set(id, number);
      this.footnoteBodies.push(
        `<w:footnote w:id="${number}"><w:p><w:pPr><w:pStyle w:val="FootnoteText"/></w:pPr>` +
          `<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/></w:rPr><w:footnoteRef/></w:r>` +
          `<w:r><w:t xml:space="preserve"> </w:t></w:r>${this.inline(tokens)}</w:p></w:footnote>`
      );
    }

    return `<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/></w:rPr><w:footnoteReference w:id="${number}"/></w:r>`;
  }

  /* ---------------------------------------------------------------- paragraphs */

  private paragraph(runs: string, place: Place, extra = ''): string {
    const props: string[] = [];

    if (place.style) props.push(`<w:pStyle w:val="${place.style}"/>`);
    if (place.numbering) {
      props.push(`<w:numPr><w:ilvl w:val="${place.numbering.level}"/><w:numId w:val="${place.numbering.id}"/></w:numPr>`);
    }
    if (extra) props.push(extra);
    if (place.indent && !place.numbering) props.push(`<w:ind w:left="${place.indent}"/>`);

    return `<w:p>${props.length ? `<w:pPr>${props.join('')}</w:pPr>` : ''}${runs}</w:p>`;
  }

  blocks(tokens: Token[], place: Place = {}, depth = 0): string {
    let first = true;

    return tokens
      .map((token) => {
        // Only the first paragraph of a list item carries its number; the rest sit under it.
        const here: Place = first ? place : { ...place, numbering: undefined };
        const out = this.block(token, here, depth);

        if (out) first = false;

        return out;
      })
      .filter(Boolean)
      .join('');
  }

  private block(token: Token, place: Place, depth: number): string {
    switch (token.type) {
      case 'heading':
        return this.heading(token as Tokens.Heading);
      case 'paragraph':
        return this.paragraph(this.inline((token as Tokens.Paragraph).tokens), { ...place, style: place.style ?? (place.numbering || place.indent ? 'ListParagraph' : undefined) });
      case 'text': {
        const text = token as Tokens.Text;
        const runs = text.tokens ? this.inline(text.tokens) : this.text(decodeEntities(unwrap(text.text)), {});

        return this.paragraph(runs, { ...place, style: place.style ?? (place.numbering || place.indent ? 'ListParagraph' : undefined) });
      }
      case 'code': {
        const code = token as Tokens.Code;
        const info = (code.lang ?? '').trim().split(/\s+/)[0].toLowerCase();

        return this.code(code.text, place, info === 'mermaid' ? 'Mermaid diagram' : undefined);
      }
      case 'mathBlock':
        return this.code(String((token as Tokens.Generic).text), place);
      case 'blockquote':
        return this.quote(token as Tokens.Blockquote, place, depth);
      case 'list':
        return this.list(token as Tokens.List, place, depth);
      case 'table':
        return this.table(token as Tokens.Table);
      case 'hr':
        return this.paragraph('', {}, '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="BFBFBF"/></w:pBdr>');
      case 'html': {
        const text = decodeEntities(
          (token as Tokens.HTML).text
            .replace(/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/[ \t]{2,}/g, ' ')
            .trim()
        );

        return text ? this.paragraph(this.text(text, {}), place) : '';
      }
      case 'space':
      case 'def':
      case 'footnoteDef':
        return '';
      default:
        return this.paragraph(this.text(String((token as { raw?: string }).raw ?? ''), {}), place);
    }
  }

  private heading(heading: Tokens.Heading): string {
    const slug = this.headings.slugs[this.headingIndex++];
    const level = Math.min(Math.max(heading.depth, 1), 6);
    const runs = this.inline(heading.tokens);

    if (!slug || !this.headings.linked.has(slug)) {
      return this.paragraph(runs, { style: `Heading${level}` });
    }

    const id = (this.bookmark += 1);

    return this.paragraph(
      `<w:bookmarkStart w:id="${id}" w:name="${bookmarkName(slug)}"/>${runs}<w:bookmarkEnd w:id="${id}"/>`,
      { style: `Heading${level}` }
    );
  }

  /** A block of code: one paragraph, its lines joined by breaks, so the shading is one box. */
  private code(text: string, place: Place, title?: string): string {
    const caption = title ? this.paragraph(this.text(title, { bold: true }), { style: 'CodeTitle', indent: place.indent }) : '';
    const indent = place.indent ?? (place.numbering ? (place.numbering.level + 1) * TWIPS_PER_LEVEL : 0);

    return `${caption}${this.paragraph(this.text(text.replace(/\n+$/, ''), {}), { style: 'Code', indent })}`;
  }

  private quote(quote: Tokens.Blockquote, place: Place, depth: number): string {
    const alert = alertOf(quote);

    if (!alert) {
      return this.blocks(quote.tokens, { ...place, style: 'Quote' }, depth);
    }

    const style = `Alert${alert.kind[0].toUpperCase()}${alert.kind.slice(1)}`;

    return (
      this.paragraph(this.text(alert.title, { bold: true }), { style }) +
      this.blocks(alert.tokens, { style }, depth)
    );
  }

  /** A numbering instance for one list: bullets share a definition, and every numbered list restarts. */
  private numberingFor(list: Tokens.List): number {
    const id = this.nums.length + 1;
    const start = list.ordered && list.start !== '' ? Number(list.start) : 1;
    const abstract = list.ordered ? 1 : 0;

    this.nums.push(
      `<w:num w:numId="${id}"><w:abstractNumId w:val="${abstract}"/>` +
        (list.ordered
          ? `<w:lvlOverride w:ilvl="0"><w:startOverride w:val="${start}"/></w:lvlOverride>`
          : '') +
        `</w:num>`
    );

    return id;
  }

  private list(list: Tokens.List, place: Place, depth: number): string {
    const level = Math.min(depth, 8);
    /* A task list has boxes for bullets: no number, the box drawn as the character it is. */
    const allTasks = list.items.length > 0 && list.items.every((item) => item.task);
    const id = allTasks ? 0 : this.numberingFor(list);

    return list.items
      .map((item) => {
        const box = item.task ? (item.checked ? '☑ ' : '☐ ') : '';
        const itemPlace: Place = allTasks
          ? { indent: (level + 1) * TWIPS_PER_LEVEL, style: place.style }
          : { numbering: { id, level }, style: place.style };
        const tokens = [...item.tokens];

        // The box goes in front of the item's first words.
        if (box) {
          const firstText = tokens.findIndex((one) => one.type === 'text' || one.type === 'paragraph');

          if (firstText >= 0) {
            const first = tokens[firstText] as Tokens.Text;

            tokens[firstText] = {
              ...first,
              tokens: [{ type: 'text', raw: box, text: box } as Tokens.Text, ...(first.tokens ?? [{ type: 'text', raw: first.text, text: first.text } as Tokens.Text])],
            } as Tokens.Text;
          }
        }

        return tokens
          .map((token, index) => {
            if (token.type === 'list') return this.list(token as Tokens.List, place, depth + 1);

            const continuing: Place =
              index === 0 || (index > 0 && tokens.slice(0, index).every((one) => one.type === 'space'))
                ? itemPlace
                : { indent: (level + 1) * TWIPS_PER_LEVEL, style: place.style };

            return this.block(token, continuing, depth);
          })
          .join('');
      })
      .join('');
  }

  private table(table: Tokens.Table): string {
    const columns = table.header.length || 1;
    const width = Math.floor(9360 / columns);
    const align = (index: number) => {
      const value = table.align[index];

      return value ? `<w:jc w:val="${value === 'right' ? 'right' : value === 'center' ? 'center' : 'left'}"/>` : '';
    };
    const cell = (tokens: Token[], index: number, header: boolean) =>
      `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>` +
      `<w:p><w:pPr><w:pStyle w:val="TableText"/>${align(index)}</w:pPr>${this.inline(tokens, header ? { bold: true } : {})}</w:p></w:tc>`;
    const head =
      `<w:tr><w:trPr><w:tblHeader/></w:trPr>` +
      table.header.map((one, index) => cell(one.tokens, index, true)).join('') +
      `</w:tr>`;
    const rows = table.rows
      .map(
        (row) =>
          `<w:tr>${Array.from({ length: columns }, (_, index) => cell(row[index]?.tokens ?? [], index, false)).join('')}</w:tr>`
      )
      .join('');

    return (
      `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>` +
      /* The style's borders again, on the table: Pages and Google Docs read these and not the style's. */
      `<w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>`).join('')}</w:tblBorders>` +
      `<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>` +
      `<w:tblGrid>${Array.from({ length: columns }, () => `<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid>` +
      `${head}${rows}</w:tbl>` +
      // Word joins two tables that touch into one; a paragraph between keeps them apart.
      this.paragraph('', {}, '<w:spacing w:after="0"/>')
    );
  }

  /* ---------------------------------------------------------------- the package */

  parts() {
    return {
      relationships: this.relationships,
      pictures: this.pictures,
      footnotes: this.footnoteBodies,
      nums: this.nums,
    };
  }
}

/** A heading's slug as a Word bookmark: letters, digits and underscores, under forty characters. */
function bookmarkName(slug: string): string {
  return `_h_${slug.replace(/[^A-Za-z0-9]+/g, '_')}`.slice(0, 40);
}

/* ------------------------------------------------------------------------ the fixed parts */

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults>
<w:rPrDefault><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/><w:unhideWhenUsed/></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
<w:style w:type="numbering" w:default="1" w:styleId="NoList"><w:name w:val="No List"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/></w:style>
${[1, 2, 3, 4, 5, 6]
  .map((level) => {
    const size = [32, 26, 24, 22, 22, 22][level - 1];
    const italic = level >= 4 ? '<w:i/><w:iCs/>' : '';

    return `<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:uiPriority w:val="9"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="${level === 1 ? 360 : 240}" w:after="${level <= 2 ? 120 : 80}"/><w:outlineLvl w:val="${level - 1}"/></w:pPr><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:b/><w:bCs/>${italic}<w:color w:val="1F3864"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`;
  })
  .join('\n')}
<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:uiPriority w:val="29"/><w:qFormat/><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="BFBFBF"/></w:pBdr><w:ind w:left="360"/></w:pPr><w:rPr><w:i/><w:iCs/><w:color w:val="404040"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="34"/><w:qFormat/><w:pPr><w:spacing w:after="60"/><w:ind w:left="720"/><w:contextualSpacing/></w:pPr></w:style>
<w:style w:type="paragraph" w:customStyle="1" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:keepLines/><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="D9D9D9"/><w:left w:val="single" w:sz="4" w:space="4" w:color="D9D9D9"/><w:bottom w:val="single" w:sz="4" w:space="4" w:color="D9D9D9"/><w:right w:val="single" w:sz="4" w:space="4" w:color="D9D9D9"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/><w:spacing w:after="160" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:noProof/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style>
<w:style w:type="paragraph" w:customStyle="1" w:styleId="CodeTitle"><w:name w:val="Code Title"/><w:basedOn w:val="Normal"/><w:next w:val="Code"/><w:pPr><w:keepNext/><w:spacing w:after="40"/></w:pPr><w:rPr><w:color w:val="595959"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>
<w:style w:type="character" w:customStyle="1" w:styleId="InlineCode"><w:name w:val="Inline Code"/><w:basedOn w:val="DefaultParagraphFont"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:noProof/><w:color w:val="C7254E"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/></w:rPr></w:style>
<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:basedOn w:val="DefaultParagraphFont"/><w:uiPriority w:val="99"/><w:unhideWhenUsed/><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style>
<w:style w:type="paragraph" w:customStyle="1" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr></w:style>
<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:uiPriority w:val="39"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/></w:tblBorders></w:tblPr><w:tblStylePr w:type="firstRow"><w:rPr><w:b/><w:bCs/></w:rPr><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/></w:tcPr></w:tblStylePr></w:style>
<w:style w:type="paragraph" w:styleId="FootnoteText"><w:name w:val="footnote text"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="99"/><w:unhideWhenUsed/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>
<w:style w:type="character" w:styleId="FootnoteReference"><w:name w:val="footnote reference"/><w:basedOn w:val="DefaultParagraphFont"/><w:uiPriority w:val="99"/><w:unhideWhenUsed/><w:rPr><w:vertAlign w:val="superscript"/></w:rPr></w:style>
${(
  [
    ['Note', '4A7BD0', 'EEF3FB'],
    ['Tip', '3F9A5A', 'EEF7F1'],
    ['Important', '8256D0', 'F3EFFB'],
    ['Warning', 'C79A1A', 'FBF6E8'],
    ['Caution', 'D0453A', 'FBEEEE'],
  ] as const
)
  .map(
    ([name, line, fill]) =>
      `<w:style w:type="paragraph" w:customStyle="1" w:styleId="Alert${name}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="${line}"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="${fill}"/><w:spacing w:after="0"/><w:ind w:left="240" w:right="240"/></w:pPr></w:style>`
  )
  .join('\n')}
</w:styles>
`;

/** Bullets, by level, and numbers, by level: Word's own defaults, so its list buttons agree with them. */
function abstractNumbering(): string {
  const bullets = ['•', '◦', '▪'];
  const formats = ['decimal', 'lowerLetter', 'lowerRoman'];
  const level = (index: number, ordered: boolean) => {
    const indent = (index + 1) * TWIPS_PER_LEVEL;

    return ordered
      ? `<w:lvl w:ilvl="${index}"><w:start w:val="1"/><w:numFmt w:val="${formats[index % 3]}"/><w:lvlText w:val="%${index + 1}."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${indent}" w:hanging="360"/></w:pPr></w:lvl>`
      : `<w:lvl w:ilvl="${index}"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="${bullets[index % 3]}"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${indent}" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:hint="default"/></w:rPr></w:lvl>`;
  };
  const levels = (ordered: boolean) => Array.from({ length: 9 }, (_, index) => level(index, ordered)).join('');

  return (
    `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${levels(false)}</w:abstractNum>` +
    `<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${levels(true)}</w:abstractNum>`
  );
}

const THEME_FONTS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements>
<a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme>
<a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
<a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
</a:themeElements></a:theme>
`;

const SETTINGS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:footnotePr><w:footnote w:id="-1"/><w:footnote w:id="0"/></w:footnotePr><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>
`;

/* ------------------------------------------------------------------------ the document */

export async function markdownToDocx(markdown: string, options: DocxOptions): Promise<Uint8Array> {
  const { tokens, footnotes } = lexMarkdown(markdown);

  /* Pictures at web addresses, fetched by whoever is allowed to before a word is written. */
  const fetched = new Map<string, Uint8Array | null>();

  if (options.fetchPicture) {
    const addresses = [...pictureAddresses(tokens)].filter(isWebAddress);

    await Promise.all(
      addresses.map(async (url) => fetched.set(url, await options.fetchPicture!(url).catch(() => null)))
    );
  }

  const writer = new Writer(collectHeadings(tokens), fetched);

  writer.setFootnotes(footnotes);

  const body = writer.blocks(tokens) || '<w:p/>';
  const { relationships, pictures, footnotes: notes, nums } = writer.parts();
  const firstHeading = tokens.find((one) => one.type === 'heading') as Tokens.Heading | undefined;
  const title = (firstHeading?.text ?? options.title).replace(/[*_`#]/g, '').trim() || options.title;
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${body}` +
    `<w:sectPr><w:footnotePr><w:numFmt w:val="decimal"/></w:footnotePr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1260" w:bottom="1440" w:left="1260" w:header="708" w:footer="708" w:gutter="0"/><w:cols w:space="708"/></w:sectPr>` +
    `</w:body></w:document>\n`;

  const footnotesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:footnotes ${NS}>` +
    `<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p></w:footnote>` +
    `<w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>` +
    `${notes.join('')}</w:footnotes>\n`;

  const numberingXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `${abstractNumbering()}${nums.join('')}</w:numbering>\n`;

  const fixedRelationships = [
    ['rId1', 'styles', 'styles.xml'],
    ['rId2', 'numbering', 'numbering.xml'],
    ['rId3', 'settings', 'settings.xml'],
    ['rId4', 'footnotes', 'footnotes.xml'],
    ['rId5', 'theme', 'theme/theme1.xml'],
  ];
  const documentRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    fixedRelationships
      .map(([id, type, target]) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`)
      .join('') +
    relationships
      .map(
        (one) =>
          `<Relationship Id="${one.id}" Type="${one.type}" Target="${xml(one.target)}"${one.external ? ' TargetMode="External"' : ''}/>`
      )
      .join('') +
    `</Relationships>\n`;

  /*
   * A link in a footnote is resolved against the footnotes' own relationships, not the
   * document's — so they get the same list, and a link that works in the text works in a note.
   */
  const footnoteRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    relationships
      .map(
        (one) =>
          `<Relationship Id="${one.id}" Type="${one.type}" Target="${xml(one.target)}"${one.external ? ' TargetMode="External"' : ''}/>`
      )
      .join('') +
    `</Relationships>\n`;

  const extensions = [...new Set(pictures.map((one) => one.file.split('.').pop()!))];
  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    extensions.map((ext) => `<Default Extension="${ext}" ContentType="${PICTURE_TYPES[ext === 'jpg' ? 'jpeg' : ext]}"/>`).join('') +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
    `<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>` +
    `<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>` +
    `<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>` +
    `<Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>` +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>` +
    `</Types>\n`;

  const rootRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` +
    `</Relationships>\n`;

  const core =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${xml(title)}</dc:title><dc:creator>TransformPipe</dc:creator>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>` +
    `</cp:coreProperties>\n`;

  const app =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>TransformPipe</Application></Properties>\n`;

  const { strToU8, zipSync } = await import('fflate');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(rootRels),
    'docProps/core.xml': strToU8(core),
    'docProps/app.xml': strToU8(app),
    'word/document.xml': strToU8(documentXml),
    'word/styles.xml': strToU8(STYLES),
    'word/numbering.xml': strToU8(numberingXml),
    'word/settings.xml': strToU8(SETTINGS),
    'word/footnotes.xml': strToU8(footnotesXml),
    'word/theme/theme1.xml': strToU8(THEME_FONTS),
    'word/_rels/document.xml.rels': strToU8(documentRels),
    'word/_rels/footnotes.xml.rels': strToU8(footnoteRels),
  };

  for (const picture of pictures) {
    files[`word/media/${picture.file}`] = picture.bytes;
  }

  return zipSync(files, { level: 6 });
}
