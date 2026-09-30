import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownToHtml } from './render.js';

/*
 * Markdown → .pdf, through the same HTML this app already produces, walked into pdfmake's own
 * document model rather than run through a headless Chrome. That trade was made deliberately: no
 * bundled Chromium, no memory-heavy function, no cold start measured in seconds — at the cost of a
 * second, simpler renderer to maintain, and a page that looks like a document rather than like the
 * site. Loaded lazily, like `mammoth` in `v1.ts`, so no request that isn't asking for a .pdf pays
 * for it.
 *
 * One font family, not several: pdfmake needs an actual font file for every face it uses, and
 * Roboto's four faces (regular, medium standing in for bold, the two italics) already ship inside
 * the `pdfmake` package itself — nothing to download, nothing to license separately. Code gets a
 * shaded background instead of a true monospace face for the same reason: one more embedded font
 * for one element type was not worth it.
 */

const FONT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../node_modules/pdfmake/fonts/Roboto'
);

const FONTS = {
  Roboto: {
    normal: join(FONT_DIR, 'Roboto-Regular.ttf'),
    bold: join(FONT_DIR, 'Roboto-Medium.ttf'),
    italics: join(FONT_DIR, 'Roboto-Italic.ttf'),
    bolditalics: join(FONT_DIR, 'Roboto-MediumItalic.ttf'),
  },
};

/** The only files on disk this renderer may open. */
const FONT_FILES = new Set(Object.values(FONTS.Roboto).map((path) => resolve(path)));

type Inline = string | { text: string; bold?: boolean; italics?: boolean; decoration?: string };
type Content = Record<string, unknown>;

/** One run of styled text per leaf, so `<strong>bold <em>and italic</em></strong>` keeps both. */
function inlineRuns(
  node: import('node-html-parser').Node,
  style: { bold?: boolean; italics?: boolean; decoration?: string } = {}
): Inline[] {
  const { TextNode, HTMLElement } = requireParser();

  if (node instanceof TextNode) {
    const text = node.text.replace(/\s+/g, ' ');

    return text ? [{ text, ...style }] : [];
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  const next = { ...style };

  if (node.tagName === 'STRONG' || node.tagName === 'B') {
    next.bold = true;
  } else if (node.tagName === 'EM' || node.tagName === 'I') {
    next.italics = true;
  } else if (node.tagName === 'DEL' || node.tagName === 'S') {
    next.decoration = 'lineThrough';
  } else if (node.tagName === 'BR') {
    return [{ text: '\n' }];
  }

  return node.childNodes.flatMap((child) => inlineRuns(child, next));
}

/*
 * `node-html-parser` is loaded once, lazily, and handed back here rather than imported at module
 * scope — this whole file already exists to be loaded lazily itself, and importing its own import
 * at the top would defeat that for the one caller who does not need it.
 */
let parserModule: typeof import('node-html-parser') | null = null;

function requireParser() {
  if (!parserModule) {
    throw new Error('node-html-parser was not loaded yet');
  }

  return parserModule;
}

/** The handful of entities `marked()` actually emits inside a code fence — not a general decoder. */
function decodeCodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function blockContent(nodes: import('node-html-parser').Node[]): Content[] {
  const { TextNode, HTMLElement } = requireParser();
  const content: Content[] = [];

  for (const node of nodes) {
    if (node instanceof TextNode) {
      const text = node.text.trim();

      if (text) {
        content.push({ text, margin: [0, 0, 0, 8] });
      }

      continue;
    }

    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const tag = node.tagName;

    if (/^H[1-6]$/.test(tag)) {
      const level = Number(tag[1]);

      content.push({
        text: inlineRuns(node),
        fontSize: 22 - level * 2,
        bold: true,
        margin: [0, level === 1 ? 4 : 12, 0, 6],
      });
      continue;
    }

    if (tag === 'P') {
      const runs = inlineRuns(node);

      if (runs.length > 0) {
        content.push({ text: runs, margin: [0, 0, 0, 8] });
      }

      continue;
    }

    if (tag === 'UL' || tag === 'OL') {
      const items = node.childNodes
        .filter((child): child is InstanceType<typeof HTMLElement> => child instanceof HTMLElement && child.tagName === 'LI')
        .map((li) => ({ text: inlineRuns(li) }));

      content.push({ [tag === 'UL' ? 'ul' : 'ol']: items, margin: [0, 0, 0, 8] });
      continue;
    }

    if (tag === 'TABLE') {
      const rows: Content[][] = [];

      for (const section of node.childNodes) {
        if (!(section instanceof HTMLElement)) {
          continue;
        }

        const trs =
          section.tagName === 'TR' ? [section] : section.childNodes.filter(
            (child): child is InstanceType<typeof HTMLElement> => child instanceof HTMLElement && child.tagName === 'TR'
          );

        for (const tr of trs) {
          const cells = tr.childNodes
            .filter((child): child is InstanceType<typeof HTMLElement> => child instanceof HTMLElement && (child.tagName === 'TD' || child.tagName === 'TH'))
            .map((cell) => ({
              text: inlineRuns(cell),
              bold: cell.tagName === 'TH',
              fillColor: cell.tagName === 'TH' ? '#eeeeee' : undefined,
            }));

          if (cells.length > 0) {
            rows.push(cells);
          }
        }
      }

      if (rows.length > 0) {
        content.push({
          table: { headerRows: 1, widths: rows[0].map(() => '*'), body: rows },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 8],
        });
      }

      continue;
    }

    if (tag === 'PRE') {
      // `<pre>` is one of the few tags this parser does not recurse into — its content comes back
      // as a single raw text node, markup and all, the same way it treats <script> and <style>.
      // The `<code>` wrapper and the entities marked() escapes code with have to be undone by hand.
      const raw = node.childNodes.map((child) => child.rawText ?? '').join('');

      content.push({
        text: decodeCodeEntities(raw.replace(/<\/?[a-z][^>]*>/gi, '')).replace(/\n$/, ''),
        fontSize: 9,
        fillColor: '#f2f2f2',
        margin: [0, 0, 0, 8],
      });
      continue;
    }

    if (tag === 'BLOCKQUOTE') {
      content.push({
        stack: blockContent(node.childNodes),
        italics: true,
        margin: [16, 0, 0, 8],
      });
      continue;
    }

    if (tag === 'HR') {
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cccccc' }],
        margin: [0, 8, 0, 8],
      });
      continue;
    }

    // An element this converter has no specific rule for — its own text still reaches the page.
    content.push(...blockContent(node.childNodes));
  }

  return content;
}

export async function markdownToPdf(markdown: string, title: string): Promise<Buffer> {
  const [{ default: PdfPrinter }, parser] = await Promise.all([
    import('pdfmake'),
    import('node-html-parser'),
  ]);

  parserModule = parser;

  PdfPrinter.setFonts(FONTS);
  /*
   * Both refused. No document reaches here with an image in it — `blockContent` does not carry an
   * `<img>` into pdfmake at all — so today these decide nothing, which is exactly why they should
   * both say no: the day somebody adds picture support, the policy that was a formality becomes
   * the policy, and "read any local file this function can see" is not one to inherit by accident.
   */
  PdfPrinter.setUrlAccessPolicy(() => false);
  /*
   * Except the four font files, which pdfmake reads from disk for every document. Refusing those
   * too — as this did from 18 September — failed every export with "Access to local file denied"
   * for Roboto-Medium.ttf, and nothing in the build noticed, because nothing built a PDF.
   */
  PdfPrinter.setLocalAccessPolicy((path: string) => FONT_FILES.has(resolve(path)));

  const root = parser.parse(markdownToHtml(markdown));

  const pdf = PdfPrinter.createPdf({
    info: { title },
    content: blockContent(root.childNodes),
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.3 },
    pageMargins: [50, 50, 50, 50],
  });

  return pdf.getBuffer();
}
