import { htmlToMarkdown } from './from-html.js';
import { embedPictures, pictureBudget, pictureFinder } from './pictures.js';
import {
  buildTocDocument,
  readZipPictures,
  readZipTextFiles,
  withoutDuplicateTitle,
  type TocPage,
} from './zip-import.js';

/*
 * Confluence's "Export space → HTML": a .zip of one .html file per page. Nothing new to parse —
 * `htmlToMarkdown` already reads exactly this, one file at a time, in production — so this module
 * is the thin wrapper the plan called it: unzip, find a title for each page, convert each through
 * the existing converter, and merge with the same table-of-contents convention `from-notion.ts`
 * uses. No cross-page links survive here either, for the same reason: the pages they pointed at
 * are sections of one document now, not files of their own.
 */

/** A page's own `<title>`, if the export's markup kept one. */
function titleFromHtml(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);

  if (!match) {
    return null;
  }

  const title = match[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  return title || null;
}

/** Confluence page exports commonly carry a numeric page id in the file name; strip it. */
function titleFromFileName(path: string): string {
  const base = path.split('/').pop()!.replace(/\.html?$/i, '');

  return base.replace(/[_-]\d+$/, '').replace(/[_-]+/g, ' ').trim() || 'Untitled';
}

export async function confluenceZipToMarkdown(bytes: Uint8Array): Promise<string> {
  const [pages, pictures] = await Promise.all([
    readZipTextFiles(bytes, '.html'),
    readZipPictures(bytes),
  ]);

  if (pages.length === 0) {
    throw new Error(
      'No HTML pages found in that .zip — is it a Confluence "Export space → HTML"?'
    );
  }

  const budget = pictureBudget();

  const tocPages: TocPage[] = pages.map((page) => {
    const title = titleFromHtml(page.text) ?? titleFromFileName(page.path);
    const folder = page.path.split('/').slice(0, -1).join('/');
    const markdown = embedPictures(
      withoutDuplicateTitle(htmlToMarkdown(page.text), title),
      pictureFinder(pictures, folder),
      budget
    );

    return { title, markdown: `# ${title}\n\n${markdown}` };
  });

  return buildTocDocument('Contents', tocPages);
}
