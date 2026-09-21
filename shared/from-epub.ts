import { htmlToMarkdown } from './from-html.js';
import {
  embedPictures,
  pictureBudget,
  pictureFinder,
  resolveInArchive,
} from './pictures.js';
import {
  buildTocDocument,
  readZipPictures,
  readZipTextEntries,
  withoutDuplicateTitle,
  type TocPage,
} from './zip-import.js';
import { attribute, blocks, decodeXml, openingTags, textOf } from './xml.js';

/*
 * An EPUB, as one document with its own contents.
 *
 * A book is the format this app has been shaped for without having it: several parts that are one
 * thing, a running order that is not the order of the files, a table of contents somebody wrote by
 * hand, and pictures inside the archive. Every one of those already has an answer here — the
 * Confluence importer converts XHTML with `htmlToMarkdown`, PowerPoint reads its running order out
 * of a manifest rather than off the file names, and `pictures.ts` carries the images. This is
 * mostly the joining up.
 *
 * The running order is the part worth saying twice. Open a real book and the chapters are called
 * `index_split_030.xhtml`, `index_split_002.xhtml`, `index_split_017.xhtml`, in that order inside
 * the zip — the numbers are the order a converter happened to write them, not the order anybody
 * reads them. The `<spine>` in the package document is the only statement of the reading order,
 * exactly as `<p:sldIdLst>` is for a deck, and sorting the file names would shuffle a novel.
 *
 * What is deliberately dropped: the cover image, because it is the jacket and not a page — it
 * would take a quarter of the picture allowance to say what the title already says; the book's own
 * table of contents when it is a page in the spine, because this writes one; and the address half
 * of every link between chapters, because a merged document has nowhere for them to land, which
 * is the same call the Notion and Confluence importers make.
 */

/** What the package document says about one file in the book. */
interface Item {
  href: string;
  type: string;
  properties: string;
}

const DOCUMENT = /\.x?html?$/i;

/** The package document's path, which is the one thing `META-INF/container.xml` is for. */
function packagePath(container: string | undefined): string | null {
  const full = attribute(openingTags(container ?? '', 'rootfile')[0] ?? null, 'full-path');

  return full ? decodeXml(full).replace(/^\//, '') : null;
}

/**
 * Chapter titles as the author wrote them.
 *
 * Two formats, because both are in the wild and neither is going away: EPUB 3 states the contents
 * in an XHTML document marked `properties="nav"`, and EPUB 2 in an NCX file of `<navPoint>`s. The
 * label in either is better than anything this could derive, because it is what the reader sees
 * in their own reading system's contents.
 *
 * Nesting is ignored on purpose. A part with chapters under it is a tree in the NCX and a flat
 * list of sections here; keeping the tree would mean a heading level per depth and an eight-level
 * document out of a book that has three.
 */
function tocLabels(nav: string | undefined, ncx: string | undefined, base: string): Map<string, string> {
  const labels = new Map<string, string>();

  const add = (href: string, label: string) => {
    const path = resolveInArchive(base, href);

    if (path && label && !labels.has(path)) labels.set(path, label);
  };

  if (ncx) {
    const pattern =
      /<navLabel>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<\/navLabel>\s*<content\b[^>]*\bsrc="([^"]*)"/g;

    for (const match of ncx.matchAll(pattern)) add(match[2], textOf(match[1]));
  }

  if (nav) {
    /* Only the contents nav: an EPUB 3 book may also carry a landmarks nav and a page list. */
    const toc =
      blocks(nav, 'nav').find((one) => /epub:type="[^"]*\btoc\b/.test(one)) ?? blocks(nav, 'nav')[0];

    if (toc) {
      for (const match of toc.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
        add(match[1], textOf(match[2]));
      }
    }
  }

  return labels;
}

/** A chapter's own name, when the contents did not give one. */
function titleFromDocument(html: string): string | null {
  for (const level of ['h1', 'h2', 'h3']) {
    const heading = blocks(html, level)[0];
    const text = heading ? textOf(heading) : '';

    if (text) return text;
  }

  const title = blocks(html, 'title')[0];

  return title ? textOf(title) || null : null;
}

/**
 * Links from one chapter to another, reduced to their words.
 *
 * A book is full of them — a footnote marker, a cross-reference, a return arrow — and every one
 * points at a file that is a section of this document now, or at an anchor this renderer did not
 * make. The words survive; the address cannot. Images are left alone, which is what the leading
 * `!` check is for.
 */
function dropInternalLinks(markdown: string): string {
  /*
   * Two things a book does that a wiki page does not, both found in the same footnote.
   *
   * The title is not optional decoration: a marker converts to
   * `[1](chapter.xhtml#n_1 "the whole note, in a tooltip")`, and a pattern that stops at the
   * first space matches none of it. The title may itself contain brackets and line breaks, so it
   * is matched to its closing quote rather than to the next `)`.
   *
   * And the marker's own text is `\[1\]` — a number in square brackets, escaped, inside the
   * brackets of the link. A text pattern of "anything but a closing bracket" cannot read that
   * and left every footnote in the trilogy pointing at a file that is a section now.
   */
  return markdown.replace(
    /(!?)\[((?:\\.|[^\][])*)\]\(\s*<?([^\s<>)]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
    (whole, bang: string, text: string, href: string) => {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return whole;

      if (!DOCUMENT.test(href.split('#')[0]) && !href.startsWith('#')) return whole;

      /*
       * The `!` is the sentence's, not Markdown's. "Aiya elenion ancalima!" followed by a
       * footnote marker converts to `!\[5\](chapter.xhtml#n_5)`, which is the image syntax by
       * accident — the exclamation belongs to the Elvish. A link into the book is never an
       * image, so where the address is one of the book's own documents the mark goes back to
       * the words it came from.
       */
      return bang + text;
    }
  );
}

export async function epubToMarkdown(bytes: Uint8Array, fallbackTitle: string): Promise<string> {
  const [files, pictures] = await Promise.all([
    readZipTextEntries(bytes, (path) => /\.(x?html?|opf|ncx|xml)$/i.test(path)),
    readZipPictures(bytes),
  ]);

  const at = (path: string) => files.get(path) ?? files.get(path.toLowerCase());
  const opfPath = packagePath(at('META-INF/container.xml'));
  const opf = opfPath ? at(opfPath) : undefined;

  if (!opf) {
    throw new Error(
      'No package document found in that .zip — is it an .epub? An .epub names one in META-INF/container.xml.'
    );
  }

  /* Every href in the package is relative to the package document, not to the archive's root. */
  const base = opfPath!.split('/').slice(0, -1).join('/');

  const items = new Map<string, Item>();

  for (const tag of openingTags(opf, 'item')) {
    const id = attribute(tag, 'id');
    const href = attribute(tag, 'href');

    if (!id || !href) continue;

    items.set(id, {
      href: resolveInArchive(base, href),
      type: (attribute(tag, 'media-type') ?? '').toLowerCase(),
      properties: attribute(tag, 'properties') ?? '',
    });
  }

  const order = openingTags(opf, 'itemref')
    .map((tag) => attribute(tag, 'idref'))
    .filter((id): id is string => Boolean(id && items.has(id)));

  if (order.length === 0) {
    throw new Error('That .epub has no reading order in it');
  }

  const metadata = blocks(opf, 'metadata')[0] ?? opf;
  const title = textOf(blocks(metadata, 'dc:title')[0] ?? '') || fallbackTitle;
  const author = textOf(blocks(metadata, 'dc:creator')[0] ?? '');

  /*
   * The cover is the jacket. Dropping the file rather than the markup is what makes the rest fall
   * out on its own: the spine's cover page holds nothing but that one image, so with the image
   * gone the page converts to nothing and is skipped like any other empty one.
   */
  const coverId =
    attribute(
      openingTags(metadata, 'meta').find((tag) => attribute(tag, 'name') === 'cover') ?? null,
      'content'
    ) ?? [...items].find(([, one]) => /\bcover-image\b/.test(one.properties))?.[0];
  const cover = coverId ? items.get(coverId)?.href : undefined;

  if (cover) pictures.delete(cover);

  const navItem = [...items.values()].find((one) => /\bnav\b/.test(one.properties));
  const ncxItem = [...items.values()].find((one) => one.type === 'application/x-dtbncx+xml');
  const labels = tocLabels(
    navItem ? at(navItem.href) : undefined,
    ncxItem ? at(ncxItem.href) : undefined,
    base
  );

  const budget = pictureBudget();
  const chapters: TocPage[] = [];

  for (const id of order) {
    const item = items.get(id)!;

    /* The book's own contents page is a page in the spine; this document writes its own. */
    if (navItem && item.href === navItem.href) continue;
    if (!DOCUMENT.test(item.href)) continue;

    const html = at(item.href);

    if (!html) continue;

    const heading = labels.get(item.href) ?? titleFromDocument(html) ?? `Chapter ${chapters.length + 1}`;
    const folder = item.href.split('/').slice(0, -1).join('/');
    const body = embedPictures(
      dropInternalLinks(withoutDuplicateTitle(htmlToMarkdown(html), heading)),
      pictureFinder(pictures, folder),
      budget
    );

    if (!body.trim()) continue;

    chapters.push({ title: heading, markdown: `# ${heading}\n\n${body}` });
  }

  if (chapters.length === 0) {
    throw new Error('Nothing came out of that .epub — every document in it was empty');
  }

  return buildTocDocument(title, chapters, author ? `*${author}*` : undefined);
}
