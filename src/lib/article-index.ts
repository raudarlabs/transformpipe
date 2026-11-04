import type { Locale } from './i18n/locales';

/*
 * Which article pages are offered to search, decided from what search did with them.
 *
 * On 4 November 2026 Search Console showed impressions down from about 160 a day to about 20, and
 * the articles that had carried the site marked "crawled, currently not indexed" without being
 * crawled again: a judgement of the whole site, not an error on a page (content/gsc/2026-11-04.md).
 * Some 350 articles in five languages had gone out within weeks on a site two months old, which is
 * the pattern Google is strictest about. So, from that day, a page has to have earned its place.
 *
 * - An English article is indexed unless it is listed below: the sixteen that had fewer than 20
 *   impressions and no click in the three months before (2026-08-04 to 2026-11-03), six of them
 *   with none at all.
 * - A translation is indexed only when it is listed below: the 57 that had at least 10
 *   impressions or a click of their own in the same three months. The other 223 had almost none.
 *
 * Every page stays readable at its address, keeps its links and is linked from the blog: it is
 * served `noindex, follow`, left out of the sitemap and out of the `hreflang` sets. A page goes back
 * into search by being made better (merged, sourced, rewritten), and then by moving it here, not
 * on a timetable. The monthly snapshot in content/gsc/ is where the evidence for that comes from.
 */

/** English articles kept out of search. */
export const QUIET_ARTICLES = new Set([
  // No impressions at all.
  'convert-markdown-to-html-online',
  'how-to-open-md-file',
  'markdown-to-html-in-javascript',
  'static-site-generator-or-converter',
  'ten-markdown-converters-compared',
  'what-a-document-costs-an-assistant',
  // Fewer than 20 impressions and no click.
  'choosing-a-markdown-to-html-converter',
  'convert-csv-to-markdown-table',
  'convert-epub-to-markdown',
  'convert-json-to-markdown-table',
  'free-ai-document-summarizer',
  'is-an-online-converter-safe',
  'markdown-to-pdf',
  'pictures-in-a-document-export',
  'typora-alternatives',
  'what-not-to-keep-from-a-docx',
]);

/** Translations offered to search, as `<locale>/<slug>`. Any other translation is not. */
export const INDEXED_TRANSLATIONS = new Set([
  'de/code-blocks-in-markdown',
  'de/convert-confluence-page-to-markdown',
  'de/convert-docx-to-markdown',
  'de/convert-html-to-markdown',
  'de/convert-notion-export-to-markdown',
  'de/free-obsidian-to-markdown-converter',
  'de/front-matter-and-what-converters-do-with-it',
  'de/markdown-escaping',
  'de/markdown-footnotes-support',
  'de/markdown-line-breaks-and-lists',
  'de/markdown-to-html-in-python',
  'de/markdown-to-word',
  'de/markdown-vs-docx-for-documentation',
  'de/markdown-vs-html',
  'de/pictures-in-a-document-export',
  'de/what-is-pandoc',
  'es/best-online-document-converters',
  'es/convert-confluence-page-to-markdown',
  'es/convert-google-docs-to-markdown',
  'es/convert-html-to-markdown',
  'es/convert-notion-export-to-markdown',
  'es/convert-powerpoint-to-markdown',
  'es/converting-documents-with-an-api',
  'es/free-ai-document-summarizer',
  'es/free-obsidian-to-markdown-converter',
  'es/front-matter-and-what-converters-do-with-it',
  'es/how-to-open-md-file',
  'es/markdown-escaping',
  'es/markdown-line-breaks-and-lists',
  'es/markdown-to-html-in-vs-code',
  'es/markdown-to-word',
  'es/markdown-vs-docx-for-documentation',
  'es/markitdown-alternatives',
  'es/merging-many-markdown-files',
  'es/save-a-web-page-as-markdown',
  'es/self-contained-html-explained',
  'es/what-is-pandoc',
  'es/what-not-to-keep-from-a-docx',
  'fr/best-markdown-editors',
  'fr/code-blocks-in-markdown',
  'fr/convert-docx-to-markdown',
  'fr/convert-google-docs-to-markdown',
  'fr/converting-documents-with-an-api',
  'fr/front-matter-and-what-converters-do-with-it',
  'fr/markdown-footnotes-support',
  'fr/markdown-line-breaks-and-lists',
  'fr/markdown-to-html-in-python',
  'fr/markdown-vs-html',
  'fr/merging-many-markdown-files',
  'fr/save-a-web-page-as-markdown',
  'fr/self-contained-html-explained',
  'it/markdown-footnotes-support',
  'it/markdown-line-breaks-and-lists',
  'it/markitdown-alternatives',
  'it/pandoc-alternatives-for-markdown-to-html',
  'it/self-contained-html-explained',
  'it/what-is-pandoc',
]);

/** Whether one article's page in one language is listed and indexed. */
export function articleIndexedIn(slug: string, locale: Locale): boolean {
  return locale === 'en' ? !QUIET_ARTICLES.has(slug) : INDEXED_TRANSLATIONS.has(`${locale}/${slug}`);
}
