import { inlineDiagrams } from './mermaid';
import { markdownToHtml } from './markdown';
import type { EpubChapter, EpubPicture, EpubTocEntry } from '@shared/to-epub';
import { withoutControls } from '@shared/to-markup';
import { fetchPicture as fetchAny } from './fetch-picture';

/*
 * A document as an EPUB book — the half that needs a browser.
 *
 * The document is rendered exactly as the preview renders it, diagrams drawn, and then taken apart
 * with the browser's own parser: cut into chapters at its top headings, its embedded pictures
 * lifted out into files of their own, and every chapter written back out as XHTML by the browser's
 * XML serialiser — which is the only thing that can be trusted to produce well-formed XML from
 * HTML, and a book with one unclosed tag in it is a book a reader refuses to open.
 *
 * Chapters, because a reader's contents and its "next chapter" are built from files, not from
 * headings: one long file is a book with no chapters, however well it is headed. The cut is at
 * the first heading level that occurs more than once — two `#` headings make two chapters; one
 * `#` title over several `##` sections makes a chapter per section, with the title on the first.
 */

const XHTML = 'http://www.w3.org/1999/xhtml';

const MEDIA_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

function decodeDataUrl(url: string): { mediaType: string; bytes: Uint8Array } | null {
  const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(url);

  if (!match || !MEDIA_TYPES[match[1].toLowerCase()]) return null;

  try {
    const mediaType = match[1].toLowerCase();

    if (match[2]) {
      const binary = atob(match[3]);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);

      return { mediaType, bytes };
    }

    return { mediaType, bytes: new TextEncoder().encode(decodeURIComponent(match[3])) };
  } catch {
    return null;
  }
}

/** A picture from the web, in a format a reader shows. */
async function fetchPicture(url: string) {
  const got = await fetchAny(url);

  return got && MEDIA_TYPES[got.mediaType] ? got : null;
}

/** Which heading level the book is cut at, or 0 for one chapter. */
function cutLevel(body: HTMLElement): number {
  for (const level of [1, 2]) {
    if (body.querySelectorAll(`:scope > h${level}`).length >= 2) return level;
  }

  return 0;
}

export interface EpubOptions {
  /** The document's name, which titles the book when it has no heading to do it. */
  name: string;
  markdown: string;
  /** The reader's language, which is the best guess this has at the book's. */
  language: string;
}

export async function markdownToEpub({ name, markdown, language }: EpubOptions): Promise<Uint8Array> {
  const [{ packEpub }] = await Promise.all([import('@shared/to-epub')]);

  /* Light diagrams: a reader's page is white unless its reader says otherwise. */
  const html = await inlineDiagrams(markdownToHtml(withoutControls(markdown)), 'light');
  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const body = parsed.body;

  /*
   * Pictures, all of them inside the book: EPUB allows a picture from the web only as a fallback
   * nobody relies on, and EPUBCheck — the validator the stores run — rejects one.
   *
   * An embedded picture becomes a file. A picture at a web address is fetched and becomes a file
   * too, where the server it lives on allows that; where it does not, it is a link to the picture
   * under its description, which a reader can still follow. One on somebody's disk is its words.
   */
  const pictures: EpubPicture[] = [];
  const keep = (data: { mediaType: string; bytes: Uint8Array }) => {
    const file = `images/picture-${pictures.length + 1}.${MEDIA_TYPES[data.mediaType]}`;

    pictures.push({ file, ...data });

    return file;
  };
  const words = (img: Element, href?: string) => {
    const alt = img.getAttribute('alt') || 'picture';
    // A link inside a link is not XHTML — a badge is a picture inside one — so there it is words.
    const element = parsed.createElement(href && !img.closest('a') ? 'a' : 'em');

    if (href && element.tagName === 'A') element.setAttribute('href', href);
    element.textContent = `[${alt}]`;
    img.replaceWith(element);
  };
  const fetched = new Map<string, Promise<{ mediaType: string; bytes: Uint8Array } | null>>();

  for (const img of [...body.querySelectorAll('img')]) {
    const src = img.getAttribute('src') ?? '';

    if (!img.hasAttribute('alt')) img.setAttribute('alt', '');

    if (src.startsWith('data:')) {
      const data = decodeDataUrl(src);

      if (data) img.setAttribute('src', keep(data));
      else words(img);
    } else if (/^https?:\/\//i.test(src)) {
      if (!fetched.has(src)) fetched.set(src, fetchPicture(src));

      const data = await fetched.get(src)!;

      if (data) img.setAttribute('src', keep(data));
      else words(img, src);
    } else {
      words(img);
    }
  }

  /*
   * A task's box is a form control, which a book has no business holding and a strict reader
   * rejects. The box is drawn as the character it looks like.
   */
  body.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.replaceWith(parsed.createTextNode((box as HTMLInputElement).hasAttribute('checked') ? '☑' : '☐'));
  });

  /*
   * What the sanitiser leaves at the top level without an element around it — the words of a
   * `<details>` it took apart — would be skipped by a walk over elements, so it gets a paragraph.
   */
  for (const node of [...body.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const paragraph = parsed.createElement('p');

      node.replaceWith(paragraph);
      paragraph.append(node);
    }
  }

  /* `align` is not XHTML 5; the same thing as a style is. */
  body.querySelectorAll('[align]').forEach((element) => {
    const value = element.getAttribute('align');

    element.removeAttribute('align');

    if (value && /^(left|center|right|justify)$/i.test(value)) {
      element.setAttribute('style', `text-align: ${value.toLowerCase()}`);
    }
  });

  /* An id twice — a footnote referred to from two places — is an error in a book. The first keeps it. */
  const seen = new Set<string>();

  body.querySelectorAll('[id]').forEach((element) => {
    if (seen.has(element.id)) element.removeAttribute('id');
    else seen.add(element.id);
  });

  /* A new window is meaningless in a book. */
  body.querySelectorAll('a[target]').forEach((link) => link.removeAttribute('target'));

  /* Cut into chapters. */
  const level = cutLevel(body);
  const groups: Element[][] = [[]];

  /*
   * A heading at the cut starts a chapter — unless all the current one holds so far is a title
   * above it, which then stays on the first page of the first chapter rather than alone on a page.
   */
  const hasMatter = (group: Element[]) =>
    group.some(
      (one) =>
        one.tagName === `H${level}` ||
        (!/^H[1-6]$/.test(one.tagName) &&
          Boolean(one.textContent?.trim() || one.querySelector('img, svg, math')))
    );

  for (const node of [...body.children]) {
    if (level && node.tagName === `H${level}` && hasMatter(groups[groups.length - 1])) {
      groups.push([]);
    }

    groups[groups.length - 1].push(node);
  }

  const chapters = groups.filter((group) => group.length > 0);
  const firstHeading = body.querySelector('h1, h2, h3');
  const title = firstHeading?.textContent?.trim() || name.replace(/\.[^.]+$/, '') || 'Untitled';
  const fileOf = new Map<string, string>();

  chapters.forEach((group, index) => {
    const file = `chapter-${index + 1}.xhtml`;

    for (const node of group) {
      if (node.id) fileOf.set(node.id, file);
      node.querySelectorAll('[id]').forEach((one) => fileOf.set(one.id, file));
    }
  });

  /*
   * A link the book cannot follow — to another file that stayed on somebody's disk, or to a part
   * of the document that does not exist — keeps its words and loses the link.
   */
  body.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const followable = href.startsWith('#')
      ? fileOf.has(href.slice(1))
      : /^(https?:|mailto:)/i.test(href);

    if (!followable) link.replaceWith(...link.childNodes);
  });

  /* A link to a part of the document now has to say which file that part ended up in. */
  chapters.forEach((group, index) => {
    const here = `chapter-${index + 1}.xhtml`;

    for (const node of group) {
      node.querySelectorAll('a[href^="#"]').forEach((link) => {
        const id = (link.getAttribute('href') ?? '').slice(1);
        const file = fileOf.get(id);

        if (file && file !== here) link.setAttribute('href', `${file}#${id}`);
      });
    }
  });

  const serializer = new XMLSerializer();
  const holder = document.implementation.createDocument(XHTML, 'html', null);
  const toc: EpubTocEntry[] = [];

  const out: EpubChapter[] = chapters.map((group, index) => {
    const file = `chapter-${index + 1}.xhtml`;
    const heading = group.find((node) => /^H[1-6]$/.test(node.tagName));
    const chapterTitle = heading?.textContent?.trim() || title;
    const properties = new Set<string>();
    const parts = group.map((node) => {
      if (node.querySelector('svg') || node.tagName === 'svg') properties.add('svg');
      if (node.querySelector('math') || node.tagName === 'math') properties.add('mathml');

      /*
       * The serialiser declares the XHTML namespace on the element it starts from; the page
       * declares it once. Only there — a diagram's labels are XHTML inside SVG, and theirs has to stay.
       */
      return serializer
        .serializeToString(holder.importNode(node, true))
        .replace(/^(<[A-Za-z0-9]+) xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/, '$1');
    });

    /* The contents: each chapter, and under it the next level of heading inside it. */
    const sub = level
      ? group
          .flatMap((node) => [...node.querySelectorAll(`h${level + 1}`), ...(node.tagName === `H${level + 1}` ? [node] : [])])
          .filter((one) => one.id)
          .map((one) => ({ title: one.textContent?.trim() ?? '', href: `${file}#${one.id}`, children: [] }))
      : [];

    toc.push({ title: chapterTitle, href: file, children: sub });

    return {
      file,
      title: chapterTitle,
      body: parts.join('\n'),
      properties: [...properties],
    };
  });

  return packEpub({
    title,
    language,
    identifier: `urn:uuid:${crypto.randomUUID()}`,
    modified: new Date(),
    chapters: out,
    toc,
    pictures,
  });
}
