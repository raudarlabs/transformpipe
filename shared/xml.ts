/*
 * Enough XML to read the two archive formats this app opens itself, and no more.
 *
 * Extracted when the second one arrived. A `.pptx` and an `.epub` are both a zip of XML with a
 * manifest that decides the reading order, and both are read the same way: find the elements,
 * read their attributes, unescape the text. The alternative was a parser dependency for four
 * functions, in a bundle that already ships a Markdown parser, an HTML parser and a diagram
 * renderer to the browser.
 *
 * What makes this safe rather than the usual advice about regular expressions and XML: neither
 * format nests the tags these are asked about inside themselves — a slide's `<a:tc>` holds no
 * `<a:tc>`, a package's `<item>` holds nothing at all — so a lazy match ends where it should.
 * Anything with genuinely recursive structure, an XHTML chapter above all, goes to a real parser:
 * `htmlToMarkdown` carries one.
 */

export interface XmlElement {
  /** The opening tag's attributes, as written, or an empty string. */
  attributes: string;
  inner: string;
}

/**
 * Every `<tag …>…</tag>` in document order, with its attributes and its inner XML.
 *
 * The alternation is not decoration: `<a:tc vMerge="1"/>` is a real thing in a real table, and a
 * pattern that only knows the two-tag spelling reads that empty self-closing cell as the start of
 * the *next* cell and swallows its text. Matching the self-closing form first, and dropping it —
 * a tag with no content has none to report — keeps a row's cells lined up with its columns.
 */
export function elements(xml: string, tag: string): XmlElement[] {
  const pattern = new RegExp(
    `<${tag}(?:\\s[^>]*?)?/>|<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
    'g'
  );
  const found: XmlElement[] = [];

  for (const match of xml.matchAll(pattern)) {
    if (match[2] === undefined) continue;

    found.push({ attributes: match[1] ?? '', inner: match[2] });
  }

  return found;
}

/** The same, when only the contents matter. */
export function blocks(xml: string, tag: string): string[] {
  return elements(xml, tag).map((one) => one.inner);
}

/** Every opening tag of `<tag …>` or `<tag …/>`, for the elements that are only attributes. */
export function openingTags(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*?)?/?>`, 'g'))].map((one) => one[0]);
}

/** The opening tag of the first `<tag …>` or `<tag …/>`, for reading its attributes. */
export function openingTag(xml: string, tag: string): string | null {
  return new RegExp(`<${tag}(?:\\s[^>]*)?/?>`).exec(xml)?.[0] ?? null;
}

export function attribute(tag: string | null, name: string): string | null {
  if (!tag) return null;

  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

export function decodeXml(text: string): string {
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

/** An element's text with every tag inside it removed — a title, a navigation label. */
export function textOf(xml: string): string {
  return decodeXml(xml.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}
