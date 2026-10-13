/*
 * An EPUB 3 book, packed: the zip, the manifest, the spine, the contents.
 *
 * The inverse of `from-epub.ts`, and the half with no judgement in it — this takes chapters that
 * are already XHTML and pictures that are already bytes and lays them out the way a reading
 * system expects to find them. Splitting a document into chapters and turning HTML into XHTML both
 * need a DOM, so they happen in the browser (`src/lib/epub.ts`) and this file needs nothing but a
 * zip writer.
 *
 * Two things a reader will refuse a book over, both handled here: `mimetype` must be the first
 * entry and stored rather than compressed, so it can be read at a fixed offset without unzipping
 * anything; and every file in the zip must be in the manifest with the properties it uses — a
 * chapter holding an SVG, MathML or a picture from the web says so, or a strict reader drops it.
 */

export interface EpubChapter {
  /** File name inside `OEBPS/`, e.g. `chapter-1.xhtml`. */
  file: string;
  title: string;
  /** The inside of `<body>`, already well-formed XHTML. */
  body: string;
  /** `svg`, `mathml` — what the chapter contains that a reader has to be told about. */
  properties: string[];
}

export interface EpubTocEntry {
  title: string;
  /** `chapter-1.xhtml#doc-setup` */
  href: string;
  children: EpubTocEntry[];
}

export interface EpubPicture {
  /** File name inside `OEBPS/`, e.g. `images/picture-1.png`. */
  file: string;
  mediaType: string;
  bytes: Uint8Array;
}

export interface EpubBook {
  title: string;
  /** A BCP 47 tag: what the reader hyphenates and reads aloud by. */
  language: string;
  /** `urn:uuid:…` — a book's identity, the same however many times it is opened. */
  identifier: string;
  /** When it was made, as EPUB wants it: to the second, in UTC. */
  modified: Date;
  chapters: EpubChapter[];
  toc: EpubTocEntry[];
  pictures: EpubPicture[];
}

const xml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The book's typography: the reader's own font and size, and only what a document needs on top.
 *
 * Deliberately not the app's stylesheet. A reading system owns the page — its font, its size, its
 * margins, its night mode — and a book that fixes those fights the person reading it. So no font
 * family for prose, no colours for text, sizes in `em`; what is set is what Markdown means and a
 * reader would otherwise lose: code in monospace, tables with rules, an alert as a box, a picture
 * that fits the page.
 */
export const EPUB_CSS = `
body { margin: 0 5%; line-height: 1.5; }
h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.4em 0 0.5em; page-break-after: avoid; break-after: avoid; }
h1 { font-size: 1.6em; }
h2 { font-size: 1.3em; }
h3 { font-size: 1.1em; }
p { margin: 0 0 0.8em; }
a { color: inherit; }
img, svg { max-width: 100%; height: auto; }
code, kbd, samp, pre { font-family: monospace; font-size: 0.9em; }
pre { white-space: pre-wrap; word-wrap: break-word; padding: 0.6em 0.8em; border: 1px solid #ccc; border-radius: 0.3em; margin: 0 0 1em; page-break-inside: avoid; }
:not(pre) > code { padding: 0 0.15em; }
blockquote { margin: 0 0 1em; padding: 0 0 0 1em; border-left: 0.2em solid #ccc; }
table { border-collapse: collapse; margin: 0 0 1em; }
th, td { border: 1px solid #bbb; padding: 0.25em 0.5em; vertical-align: top; }
th { font-weight: bold; }
hr { border: 0; border-top: 1px solid #bbb; margin: 1.5em 0; }
mark { background: #fff0b3; color: inherit; }
.md-alert { border-left-width: 0.3em; }
.md-alert-title { font-weight: bold; margin-bottom: 0.3em; }
.md-alert-note { border-left-color: #4a7bd0; }
.md-alert-tip { border-left-color: #3f9a5a; }
.md-alert-important { border-left-color: #8256d0; }
.md-alert-warning { border-left-color: #c79a1a; }
.md-alert-caution { border-left-color: #d0453a; }
.md-diagram { margin: 0 0 1em; text-align: center; page-break-inside: avoid; }
.md-math { display: block; margin: 0 0 1em; text-align: center; }
.md-footnotes { font-size: 0.9em; }
.md-fnback { text-decoration: none; }
.hljs-comment, .hljs-quote { font-style: italic; opacity: 0.75; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-type { font-weight: bold; }
nav ol { list-style: none; padding-left: 1em; }
`.trimStart();

function navList(entries: EpubTocEntry[]): string {
  if (entries.length === 0) return '';

  const items = entries
    .map(
      (entry) =>
        `<li><a href="${xml(entry.href)}">${xml(entry.title)}</a>${navList(entry.children)}</li>`
    )
    .join('\n');

  return `<ol>\n${items}\n</ol>`;
}

function page(title: string, language: string, body: string, nav = false): string {
  const epub = nav ? ' xmlns:epub="http://www.idpf.org/2007/ops"' : '';

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"${epub} xml:lang="${xml(language)}" lang="${xml(language)}">
<head>
<meta charset="utf-8" />
<title>${xml(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
${body}
</body>
</html>
`;
}

/** The old table of contents, for the readers that still look for one — older Kindles, older Kobos. */
function ncx(book: EpubBook): string {
  let order = 0;
  const points = (entries: EpubTocEntry[]): string =>
    entries
      .map((entry) => {
        order += 1;

        return `<navPoint id="nav-${order}" playOrder="${order}"><navLabel><text>${xml(entry.title)}</text></navLabel><content src="${xml(entry.href)}"/>${points(entry.children)}</navPoint>`;
      })
      .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="${xml(book.identifier)}"/></head>
<docTitle><text>${xml(book.title)}</text></docTitle>
<navMap>
${points(book.toc)}
</navMap>
</ncx>
`;
}

function opf(book: EpubBook): string {
  const modified = `${book.modified.toISOString().slice(0, 19)}Z`;
  const items = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="css" href="style.css" media-type="text/css"/>',
    ...book.chapters.map((chapter, index) => {
      const properties = chapter.properties.length
        ? ` properties="${chapter.properties.join(' ')}"`
        : '';

      return `<item id="chapter-${index + 1}" href="${xml(chapter.file)}" media-type="application/xhtml+xml"${properties}/>`;
    }),
    ...book.pictures.map(
      (picture, index) =>
        `<item id="picture-${index + 1}" href="${xml(picture.file)}" media-type="${xml(picture.mediaType)}"/>`
    ),
  ];
  const spine = book.chapters
    .map((_, index) => `<itemref idref="chapter-${index + 1}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${xml(book.language)}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="book-id">${xml(book.identifier)}</dc:identifier>
<dc:title>${xml(book.title)}</dc:title>
<dc:language>${xml(book.language)}</dc:language>
<meta property="dcterms:modified">${modified}</meta>
</metadata>
<manifest>
${items.join('\n')}
</manifest>
<spine toc="ncx">
${spine}
</spine>
</package>
`;
}

const CONTAINER = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>
`;

export async function packEpub(book: EpubBook): Promise<Uint8Array> {
  const { strToU8, zipSync } = await import('fflate');
  const files: Record<string, [Uint8Array, { level: 0 | 9 }]> = {};
  const add = (path: string, data: Uint8Array | string, level: 0 | 9 = 9) => {
    files[path] = [typeof data === 'string' ? strToU8(data) : data, { level }];
  };

  // First, and stored: see the comment at the top.
  add('mimetype', 'application/epub+zip', 0);
  add('META-INF/container.xml', CONTAINER);
  add('OEBPS/content.opf', opf(book));
  add('OEBPS/toc.ncx', ncx(book));
  add('OEBPS/style.css', EPUB_CSS);
  add(
    'OEBPS/nav.xhtml',
    page(
      book.title,
      book.language,
      `<nav epub:type="toc" id="toc">\n<h1>${xml(book.title)}</h1>\n${navList(book.toc)}\n</nav>`,
      true
    )
  );

  for (const chapter of book.chapters) {
    add(`OEBPS/${chapter.file}`, page(chapter.title, book.language, chapter.body));
  }

  // Pictures are compressed already; squeezing them again costs time and saves nothing.
  for (const picture of book.pictures) {
    add(`OEBPS/${picture.file}`, picture.bytes, 0);
  }

  return zipSync(files);
}
