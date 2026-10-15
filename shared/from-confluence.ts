import { htmlToMarkdown } from './from-html.js';
import { githubSlug } from './markdown.js';
import { arrange, type SplitExport } from './split-export.js';
import { embedPictures, pictureBudget, pictureFinder } from './pictures.js';
import {
  type Progress,
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

const decodeEntities = (text: string) =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

/**
 * A page's links to its own headings, pointed at the anchors the converted page will have.
 *
 * Confluence gives a heading an id of its own making — the page title and the heading's words with
 * the spaces taken out, `DevartAI:AINativeConcept-1.ExecutiveSummary` — and its table of contents
 * links to that. The id does not survive becoming Markdown, which has no ids, so every entry in
 * the contents went nowhere. Each such link is rewritten to the heading's GitHub-style slug, which
 * is what the renderer gives a heading and what any other Markdown reader would.
 */
function withLocalAnchors(html: string): string {
  const used = new Map<string, number>();
  const anchors = new Map<string, string>();

  for (const match of html.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const words = decodeEntities(match[3].replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

    if (words) anchors.set(decodeEntities(match[2]), githubSlug(words, used));
  }

  if (anchors.size === 0) return html;

  return html.replace(/href="#([^"]+)"/g, (whole, raw: string) => {
    let id = decodeEntities(raw);

    try {
      id = decodeURIComponent(id);
    } catch {
      // A stray % is still the id somebody meant.
    }

    const slug = anchors.get(id);

    return slug ? `href="#${slug}"` : whole;
  });
}

/** A page's breadcrumbs, the space first: where Confluence filed it. */
function breadcrumbs(html: string): string[] {
  const list = html.match(/<ol[^>]*id="breadcrumbs"[^>]*>([\s\S]*?)<\/ol>/i)?.[1] ?? '';

  return [...list.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map((match) =>
    match[1]
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  );
}

/*
 * The pages, read once for either shape. Pictures share one budget when the pages become one
 * document and get one each when they stay separate, since each is then a document of its own.
 */
async function confluencePages(bytes: Uint8Array, onProgress: Progress | undefined, perPage: boolean) {
  const [pages, pictures] = await Promise.all([
    readZipTextFiles(bytes, '.html'),
    readZipPictures(bytes),
  ]);

  if (pages.length === 0) {
    throw new Error(
      'No HTML pages found in that .zip — is it a Confluence "Export space → HTML"?'
    );
  }

  const shared = pictureBudget();
  /* The space's home page is its index.html, and it comes first, the way the space opens on it. */
  const ordered = [
    ...pages.filter((page) => /(^|\/)index\.html$/i.test(page.path)),
    ...pages.filter((page) => !/(^|\/)index\.html$/i.test(page.path)),
  ];

  return ordered.map((page, index) => {
    onProgress?.(index + 1, ordered.length);

    const title = titleFromHtml(page.text) ?? titleFromFileName(page.path);
    const folder = page.path.split('/').slice(0, -1).join('/');
    const markdown = embedPictures(
      // The breadcrumbs are where the page is filed, which the folders now say; as text they are noise.
      withoutDuplicateTitle(
        htmlToMarkdown(
          withLocalAnchors(page.text.replace(/<div[^>]*id="breadcrumb-section"[^>]*>[\s\S]*?<\/ol>\s*<\/div>/i, ''))
        ),
        title
      ),
      pictureFinder(pictures, folder),
      perPage ? pictureBudget() : shared
    );
    const crumbs = breadcrumbs(page.text);

    return {
      title,
      markdown: `# ${title}\n\n${markdown}`,
      space: crumbs[0],
      // The space is the import's own folder; the pages above this one are the folders it is in.
      folder: crumbs.slice(1),
    };
  });
}

export async function confluenceZipToMarkdown(
  bytes: Uint8Array,
  onProgress?: Progress
): Promise<string> {
  const tocPages: TocPage[] = await confluencePages(bytes, onProgress, false);

  return buildTocDocument('Contents', tocPages);
}

export async function confluenceZipToPages(bytes: Uint8Array, onProgress?: Progress): Promise<SplitExport> {
  const pages = await confluencePages(bytes, onProgress, true);
  const space = pages.find((page) => page.space)?.space ?? 'Confluence export';

  return arrange('confluence', space, pages);
}
