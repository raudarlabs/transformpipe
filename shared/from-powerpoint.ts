import { markdownTable } from './from-table.js';
import { escapeMarkdownLine } from './from-text.js';
import { embedPictures, pictureBudget, pictureFinder } from './pictures.js';
import {
  buildTocDocument,
  readZipPictures,
  readZipTextEntries,
  type TocPage,
} from './zip-import.js';

/*
 * A .pptx deck, as one document: a slide is a section, in the order the deck actually plays, and
 * the speaker notes come with it.
 *
 * The notes are the reason this conversion is worth having. Every other tool that reads a deck
 * reads the slides — the part that was already legible, because somebody stood up and read it out.
 * What is lost is the half nobody ever sees: the notes pane, where the argument the slide is a
 * summary of was written down. A deck converted without them is a list of bullet fragments; with
 * them it is a document somebody can read instead of attending.
 *
 * There is no library here. A .pptx is a zip of XML and `fflate` already opens zips for the Notion,
 * Confluence and Obsidian imports, so what is left is reading a narrow, stable shape: DrawingML's
 * `<a:p>` paragraphs of `<a:r>` runs of `<a:t>` text, which has not changed since PowerPoint 2007
 * and is the same in Keynote's and Google Slides' exports. The alternative was a general Office
 * parser for the sake of four element names.
 *
 * Shapes are read in the order the file lists them, which is the order PowerPoint itself reads a
 * slide out in and the order it hands to a screen reader. Sorting them by where they sit on the
 * slide was the alternative and it is worse in both directions: a placeholder carries no position
 * of its own — it inherits one from a layout this does not read — and two text boxes side by side
 * would be interleaved line by line rather than read as the two columns they are.
 *
 * What it does not read, deliberately: charts and SmartArt. A chart's numbers live in an embedded
 * workbook and SmartArt's words in `ppt/diagrams/`, and both would come out as a shapeless list
 * with none of the arrangement that made them worth drawing. A slide that is only a diagram keeps
 * its heading and its notes and says so, which is honest about what was there.
 */

/*
 * Placeholders that hold the furniture rather than the slide: the page number, the date, the footer
 * somebody set once in the master. Their text is on every slide, and a document that repeats
 * "Confidential — 2026" forty times has made the deck harder to read, not easier.
 */
const FURNITURE = new Set(['sldNum', 'dt', 'ftr']);

const TITLE_PLACEHOLDERS = new Set(['title', 'ctrTitle']);

/**
 * Every `<tag …>…</tag>` in document order, with its attributes and its inner XML.
 *
 * The alternation is not decoration: `<a:tc vMerge="1"/>` is a real thing in a real table, and a
 * pattern that only knows the two-tag spelling reads that empty self-closing cell as the start of
 * the *next* cell and swallows its text. Matching the self-closing form first, and dropping it —
 * a tag with no content has none to report — keeps a row's cells lined up with its columns.
 *
 * These tags never nest inside themselves in this format, which is what makes a lazy match safe.
 */
function elements(xml: string, tag: string): { attributes: string; inner: string }[] {
  const pattern = new RegExp(
    `<${tag}(?:\\s[^>]*?)?/>|<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
    'g'
  );
  const found: { attributes: string; inner: string }[] = [];

  for (const match of xml.matchAll(pattern)) {
    if (match[2] === undefined) continue;

    found.push({ attributes: match[1] ?? '', inner: match[2] });
  }

  return found;
}

/** The same, when only the contents matter. */
function blocks(xml: string, tag: string): string[] {
  return elements(xml, tag).map((one) => one.inner);
}

/** The opening tag of the first `<tag …>` or `<tag …/>`, for reading its attributes. */
function openingTag(xml: string, tag: string): string | null {
  return new RegExp(`<${tag}(?:\\s[^>]*)?/?>`).exec(xml)?.[0] ?? null;
}

function attribute(tag: string | null, name: string): string | null {
  if (!tag) return null;

  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Last, so that an `&amp;lt;` in the source stays the text `&lt;` rather than becoming a `<`.
    .replace(/&amp;/g, '&');
}

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  href: string | null;
}

/**
 * One paragraph's runs, in order, with `<a:br/>` kept as a newline.
 *
 * `<a:fld>` is read alongside `<a:r>` because a field is a run whose text PowerPoint maintains —
 * most often a slide number, which the furniture filter has already dropped, but also a date or a
 * piece of linked text somebody typed into the slide on purpose.
 */
function runsIn(paragraph: string, links: Map<string, string>): Run[] {
  const pattern =
    /<a:r(?:\s[^>]*)?>([\s\S]*?)<\/a:r>|<a:fld\b[^>]*>([\s\S]*?)<\/a:fld>|<a:br\s*\/>/g;
  const runs: Run[] = [];

  for (const match of paragraph.matchAll(pattern)) {
    const inner = match[1] ?? match[2];

    if (inner === undefined) {
      runs.push({ text: '\n', bold: false, italic: false, href: null });

      continue;
    }

    const text = blocks(inner, 'a:t').map(decode).join('');

    if (!text) continue;

    const properties = openingTag(inner, 'a:rPr');
    const relationship = attribute(openingTag(inner, 'a:hlinkClick'), 'r:id');

    runs.push({
      text,
      bold: attribute(properties, 'b') === '1',
      italic: attribute(properties, 'i') === '1',
      href: relationship ? (links.get(relationship) ?? null) : null,
    });
  }

  return runs;
}

/**
 * A paragraph's runs as Markdown text.
 *
 * Emphasis is kept per run, except where every run in the paragraph carries it: a whole line set
 * in bold is a slide's way of writing a heading, and `**every word of it**` is not what the person
 * meant by it. Text is escaped before any markup is added, so an asterisk typed on a slide stays
 * an asterisk and the link syntax this adds is the only syntax in the line.
 */
function paragraphText(runs: Run[]): string {
  const speaking = runs.filter((run) => run.text.trim());

  if (speaking.length === 0) return '';

  const allBold = speaking.every((run) => run.bold);
  const allItalic = speaking.every((run) => run.italic);

  return runs
    .map((run) => {
      if (run.text === '\n') return '\\\n';

      let text = escapeMarkdownLine(run.text);

      if (run.bold && !allBold) text = `**${text}**`;
      if (run.italic && !allItalic) text = `*${text}*`;
      if (run.href) text = `[${text}](${run.href})`;

      return text;
    })
    .join('')
    .trim();
}

/**
 * A text body as Markdown blocks.
 *
 * Whether a paragraph is a bullet is never stated in the slide — it is inherited from the layout,
 * which is inherited from the master, which this does not read. What the slide does say is when it
 * differs: `<a:buNone/>` on a line inside a bulleted list, a `<a:buChar>` on a line inside a plain
 * text box. So the default comes from what the shape is — a body placeholder is a bulleted list
 * and a text box somebody drew is prose — and an explicit bullet property overrules it. That is
 * the rule real decks follow, and it is the reason a title slide's subtitle does not arrive as a
 * one-item list.
 */
function renderBody(body: string, bulletsByDefault: boolean, links: Map<string, string>): string {
  const out: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (list.length) out.push(list.join('\n'));

    list = [];
  };

  for (const paragraph of blocks(body, 'a:p')) {
    const text = paragraphText(runsIn(paragraph, links));

    if (!text) continue;

    const properties = blocks(paragraph, 'a:pPr')[0] ?? openingTag(paragraph, 'a:pPr') ?? '';
    const level = Number(attribute(openingTag(paragraph, 'a:pPr'), 'lvl') ?? '0') || 0;
    const numbered = /<a:buAutoNum\b/.test(properties);
    const bulleted =
      numbered || /<a:buChar\b/.test(properties)
        ? true
        : /<a:buNone\s*\/>/.test(properties)
          ? false
          : bulletsByDefault;

    if (!bulleted) {
      flush();
      out.push(text);

      continue;
    }

    const indent = '  '.repeat(Math.min(level, 6));

    // A hard break inside a list item has to be indented to stay inside it.
    list.push(`${indent}${numbered ? '1.' : '-'} ${text.replace(/\\\n/g, `\\\n${indent}  `)}`);
  }

  flush();

  return out.join('\n\n');
}

/**
 * A `<a:tbl>` as a Markdown table, taking the first row as the header the way a deck draws it.
 *
 * A merged cell is dropped rather than kept as an empty one. A table drawn on a slide is merged
 * all over — a heading across the top, a label down the side — and every one of those merges is
 * stored as the cell that holds the text followed by empty cells marked `hMerge` or `vMerge`.
 * Markdown has no spanning cell, so the choice is between a table with columns of nothing in it
 * and a ragged one; the ragged one is the table somebody drew.
 */
function renderTable(table: string, links: Map<string, string>): string {
  const rows = blocks(table, 'a:tr').map((row) =>
    elements(row, 'a:tc')
      .filter((cell) => !/\b[hv]Merge="(1|true)"/.test(cell.attributes))
      .map((cell) =>
        blocks(cell.inner, 'a:txBody')
          .map((body) =>
            blocks(body, 'a:p')
              .map((paragraph) => paragraphText(runsIn(paragraph, links)))
              .filter(Boolean)
              .join(' ')
          )
          .join(' ')
          .trim()
      )
  );

  if (rows.length === 0) return '';

  /*
   * A column that is empty in every row was a gutter, not a column — the same call
   * `from-html.ts`'s `tidyTables()` makes on a converted web page, for the same reason: a table
   * drawn to look right on a slide carries spacing the grid has no other way to express.
   */
  const width = Math.max(...rows.map((row) => row.length));
  const keep = [...Array(width).keys()].filter((column) =>
    rows.some((row) => (row[column] ?? '').trim())
  );

  if (keep.length === 0) return '';

  const kept = rows.map((row) => keep.map((column) => row[column] ?? ''));

  return markdownTable(kept[0], kept.slice(1));
}

/**
 * Whether a block of a slide's text reads as that slide's heading.
 *
 * The test for a deck that names no title: one short line of prose. A deck exported from Google
 * Slides or Keynote has no placeholders at all — every shape is a text box somebody drew, and the
 * words at the top of the slide are a heading only in the sense that they are at the top and set
 * large. Taking the first line when it is short enough to be a heading is what a reader does, and
 * it is the difference between a contents list of forty real titles and one that says "Slide 2".
 */
function readsAsHeading(text: string): boolean {
  /*
   * `](` catches the case that was actually shipping: a slide holding nothing but a picture has
   * one block, that block is an image, an image is short and has no line break in it — so the
   * picture was promoted to the slide's title and printed as `# ![](ppt/media/image14.png)`, in
   * the table of contents as well. A heading is words.
   */
  return (
    text.length <= 80 &&
    !text.includes('\n') &&
    !text.includes('](') &&
    !/^([-|!]|\d+[.)]\s|>|#)/.test(text)
  );
}

/** Everything a slide says, and what it is called. */
function renderSlide(
  xml: string,
  links: Map<string, string>,
  /*
   * Every picture already placed earlier in this deck. A picture repeated slide after slide is
   * the deck's furniture — a logo, a divider, a footer badge somebody pasted onto each one — and
   * forty copies of it in a document is forty copies of the budget spent on nothing. The first
   * time it appears it is content; after that it is wallpaper.
   */
  placed: Set<string>
): { title: string | null; body: string } {
  let title: string | null = null;
  const parts: string[] = [];

  const shapes = xml.matchAll(/<p:(sp|graphicFrame|pic)(?:\s[^>]*)?>([\s\S]*?)<\/p:\1>/g);

  for (const shape of shapes) {
    const inner = shape[2];
    const placeholder = attribute(openingTag(inner, 'p:ph'), 'type');

    if (placeholder && FURNITURE.has(placeholder)) continue;

    if (shape[1] === 'pic') {
      /*
       * Written as an ordinary Markdown image pointing at the path inside the archive, and turned
       * into the bytes themselves a few lines below by the one piece of code every importer here
       * shares. What is left pointing at `ppt/media/` afterwards is a picture that would not fit.
       */
      const media = links.get(attribute(openingTag(inner, 'a:blip'), 'r:embed') ?? '');

      if (media && !placed.has(media)) {
        placed.add(media);

        const alt = decode(attribute(openingTag(inner, 'p:cNvPr'), 'descr') ?? '').trim();

        parts.push(`![${escapeMarkdownLine(alt)}](${media})`);
      }

      continue;
    }

    if (shape[1] === 'graphicFrame') {
      for (const table of blocks(inner, 'a:tbl')) {
        const rendered = renderTable(table, links);

        if (rendered) parts.push(rendered);
      }

      continue;
    }

    const body = blocks(inner, 'p:txBody')[0];

    if (!body) continue;

    if (placeholder && TITLE_PLACEHOLDERS.has(placeholder) && title === null) {
      const text = blocks(body, 'a:p')
        .map((paragraph) => paragraphText(runsIn(paragraph, links)))
        .filter(Boolean)
        .join(' ');

      // A heading is one line: a title box with a line break in it is a wrapped title, not two.
      if (text) title = text.replace(/\\\n/g, ' ').replace(/\s+/g, ' ');

      continue;
    }

    const rendered = renderBody(body, Boolean(placeholder), links);

    if (rendered) parts.push(rendered);
  }

  if (title === null && parts.length && readsAsHeading(parts[0])) {
    title = parts.shift()!;
  }

  return { title, body: parts.join('\n\n') };
}

/**
 * A picture that could not be carried, named instead of left as a link to nothing.
 *
 * Unlike an archive of Markdown, where a picture that does not fit keeps the link it already had
 * and the document is no worse than before, nothing wrote these links but this converter. Leaving
 * one behind would be inventing a broken image, so what is left is the alt text if the deck had
 * one and a plain sentence if it did not.
 */
function nameWhatIsMissing(markdown: string): string {
  return markdown.replace(/!\[([^\]]*)\]\(ppt\/media\/[^)]*\)/g, (_, alt: string) =>
    alt.trim() ? `*A picture: ${alt.trim()}*` : '*A picture, which was too large to include.*'
  );
}

/** The notes pane, as a quotation: prose, never bullets, and marked as what it is. */
function renderNotes(xml: string, links: Map<string, string>): string {
  const parts: string[] = [];

  for (const shape of xml.matchAll(/<p:sp(?:\s[^>]*)?>([\s\S]*?)<\/p:sp>/g)) {
    const placeholder = attribute(openingTag(shape[1], 'p:ph'), 'type');

    if (placeholder && FURNITURE.has(placeholder)) continue;

    const body = blocks(shape[1], 'p:txBody')[0];

    if (body) parts.push(renderBody(body, false, links));
  }

  const text = parts.filter(Boolean).join('\n\n').trim();

  if (!text) return '';

  return ['> **Notes**', '>', ...text.split('\n').map((line) => (line ? `> ${line}` : '>'))].join(
    '\n'
  );
}

/** A relationship file as `rId3` → its target, resolved against the folder the file sits in. */
function relationships(xml: string | undefined, base: string): Map<string, string> {
  const found = new Map<string, string>();

  if (!xml) return found;

  for (const match of xml.matchAll(/<Relationship\b[^>]*>/g)) {
    const tag = match[0];
    const id = attribute(tag, 'Id');
    const target = attribute(tag, 'Target');

    if (!id || !target) continue;

    found.set(
      id,
      attribute(tag, 'TargetMode') === 'External' ? decode(target) : resolve(base, decode(target))
    );
  }

  return found;
}

/** A relationship target as a path inside the archive. */
function resolve(base: string, target: string): string {
  if (/^[a-z]+:/i.test(target)) return target;
  if (target.startsWith('/')) return target.slice(1);

  const parts = base.split('/').filter(Boolean);

  for (const step of target.split('/')) {
    if (step === '..') parts.pop();
    else if (step !== '.') parts.push(step);
  }

  return parts.join('/');
}

export async function powerpointToMarkdown(bytes: Uint8Array, title: string): Promise<string> {
  const wanted = (path: string) => {
    const at = path.toLowerCase();

    return (
      at === 'ppt/presentation.xml' ||
      at === 'ppt/_rels/presentation.xml.rels' ||
      at.startsWith('ppt/slides/') ||
      at.startsWith('ppt/notesslides/')
    );
  };

  const [files, media] = await Promise.all([
    readZipTextEntries(bytes, wanted),
    readZipPictures(bytes),
  ]);
  const at = (path: string) => files.get(path) ?? files.get(path.toLowerCase());
  const deck = at('ppt/presentation.xml');

  if (!deck) {
    throw new Error(
      'No slides found in that file — is it a .pptx? PowerPoint’s older .ppt format is not a zip and cannot be read here.'
    );
  }

  /*
   * The order slides play in is not the order their files are numbered in. `slide3.xml` keeps its
   * name when it is dragged to the front, so the only true order is `<p:sldIdLst>` in the
   * presentation, read through the relationship ids it names.
   */
  const deckLinks = relationships(at('ppt/_rels/presentation.xml.rels'), 'ppt/');
  const listed = [...(blocks(deck, 'p:sldIdLst')[0] ?? '').matchAll(/<p:sldId\b[^>]*>/g)]
    .map((match) => deckLinks.get(attribute(match[0], 'r:id') ?? ''))
    .filter((path): path is string => Boolean(path && files.has(path)));

  const order = listed.length
    ? listed
    : // A deck with no slide list is broken, but its slides are still readable in file order.
      [...files.keys()]
        .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
        .sort((one, other) => Number(/(\d+)/.exec(one)![1]) - Number(/(\d+)/.exec(other)![1]));

  if (order.length === 0) {
    throw new Error('That .pptx has no slides in it');
  }

  const budget = pictureBudget();
  const find = pictureFinder(media, '');
  const placed = new Set<string>();

  const pages: TocPage[] = order.map((path, index) => {
    const xml = at(path)!;
    const file = path.split('/').pop()!;
    const links = relationships(at(`ppt/slides/_rels/${file}.rels`), 'ppt/slides/');
    const slide = renderSlide(xml, links, placed);

    const notesPath = [...links.entries()].find(([, target]) =>
      /^ppt\/notesslides\//i.test(target)
    )?.[1];
    const notesXml = notesPath ? at(notesPath) : undefined;
    const notes = notesXml ? renderNotes(notesXml, links) : '';

    const heading = slide.title ?? `Slide ${index + 1}`;
    const body = nameWhatIsMissing(
      embedPictures([slide.body, notes].filter(Boolean).join('\n\n'), find, budget)
    );

    return { title: heading, markdown: `# ${heading}\n\n${body}`.trimEnd() };
  });

  return buildTocDocument(title, pages);
}
