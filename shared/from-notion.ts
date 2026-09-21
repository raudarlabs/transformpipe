import { delimitedToMarkdown } from './from-table.js';
import { embedPictures, pictureBudget, pictureFinder } from './pictures.js';
import {
  buildTocDocument,
  readZipPictures,
  readZipTextFiles,
  withoutDuplicateTitle,
  type TocPage,
} from './zip-import.js';

/*
 * Notion's own "Export as Markdown & CSV": a .zip of one .md file per page (nested pages in a
 * folder named after their parent), plus one .csv per database. Every file — folders included —
 * is named `<Title> <32 lower-case hex characters>.md`, the hex being the page's internal id, and
 * cross-page links inside the Markdown point at that exact filename.
 *
 * That id is the one part of this format this converter cannot carry over: two pages merged into
 * one document have no separate address for a link to resolve to, so an internal link keeps its
 * visible words and drops the address rather than pointing at a file that will not exist. Everything
 * else — the title, the page order, a database's rows — survives.
 */

/** Notion's own naming rule for a page or a database, without its extension. */
const NOTION_ID_SUFFIX = /^(.*?)[ _]([0-9a-f]{32})$/i;

function titleFromFileName(name: string): string {
  const base = name
    .split('/')
    .pop()!
    .replace(/\.(md|csv)$/i, '');
  const match = base.match(NOTION_ID_SUFFIX);

  return (match ? match[1] : base).trim() || 'Untitled';
}

/**
 * Notion writes cross-page links as `[Some Page](Some%20Page%20<32 hex>.md)` — this app cannot
 * keep them as links once every page is one document, so only the words stay.
 */
function dropInternalLinks(markdown: string): string {
  return markdown.replace(
    /\[([^\]]+)\]\(([^)]+\.(?:md|csv))\)/gi,
    (whole, text: string, href: string) => {
      const withoutExtension = decodeURIComponent(href).replace(/\.(md|csv)$/i, '');

      return NOTION_ID_SUFFIX.test(withoutExtension) ? text : whole;
    }
  );
}

export async function notionZipToMarkdown(bytes: Uint8Array): Promise<string> {
  const [pages, tables, pictures] = await Promise.all([
    readZipTextFiles(bytes, '.md'),
    readZipTextFiles(bytes, '.csv'),
    readZipPictures(bytes),
  ]);

  if (pages.length === 0 && tables.length === 0) {
    throw new Error(
      'No Markdown pages found in that .zip — is it a Notion "Export as Markdown & CSV"?'
    );
  }

  /*
   * Notion puts a page's images in a folder beside it named after the page, and links to them
   * relatively and URL-encoded. So every link resolves against the folder the page itself sits
   * in — which is the one thing `%20` in a path is a sign of and a merged document destroys.
   */
  const budget = pictureBudget();

  const tocPages: TocPage[] = [
    ...pages.map((page) => {
      const title = titleFromFileName(page.path);
      const folder = page.path.split('/').slice(0, -1).join('/');
      const body = embedPictures(
        dropInternalLinks(withoutDuplicateTitle(page.text, title)),
        pictureFinder(pictures, folder),
        budget
      );

      return { title, markdown: `# ${title}\n\n${body}` };
    }),
    ...tables.flatMap((table) => {
      const title = titleFromFileName(table.path);
      const rendered = delimitedToMarkdown(table.text);

      // An empty database export is not an error worth stopping the whole import for.
      return rendered ? [{ title, markdown: `# ${title}\n\n${rendered}` }] : [];
    }),
  ];

  return buildTocDocument('Contents', tocPages);
}
