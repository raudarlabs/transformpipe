/*
 * An export as the pages it is made of, each where the export filed it.
 *
 * The importers used to stitch an export into one document with a contents list on top. That is
 * still offered, and it is right for handing a whole space to an assistant — but a Confluence
 * section came out as one document of 275,000 words, which nobody reads, nobody can find a page
 * in, and which the account could not even keep. So by default an export becomes a folder, its
 * sections subfolders, and every page a document of its own.
 *
 * Each importer says, for every page, which folders it sits in — a Confluence page's breadcrumbs,
 * a Notion page's folders with their ids taken off, a vault's own directories — and this file turns
 * that into the tree:
 *
 * - A page that has pages under it becomes a folder of the same name, and the page itself is the
 *   first document inside it. That is how Notion lays out an export and how Confluence's page tree
 *   reads, and it means a section's own text is not left beside the folder it introduces.
 * - A folder every page shares — the one a zip is wrapped in, a space's own name — becomes the
 *   folder the whole import goes into, rather than one level of nesting with nothing else in it.
 * - The order is the importer's, kept as each page's position in its folder.
 */

export type ExportSource = 'confluence' | 'notion' | 'obsidian' | 'epub';

export interface SplitPage {
  /** Folder names from the import's own folder down; empty for a page at its top. */
  folder: string[];
  title: string;
  markdown: string;
}

export interface SplitExport {
  source: ExportSource;
  /** The folder the import goes into. */
  title: string;
  pages: Array<SplitPage & { position: number }>;
}

const key = (path: string[]) => path.join('\u0000');

export function arrange(source: ExportSource, fallbackTitle: string, input: SplitPage[]): SplitExport {
  let pages = input.map((page) => ({ ...page, folder: page.folder.filter(Boolean) }));
  let title = fallbackTitle;

  /* One folder around everything is the import's own folder, not a level of the tree. */
  const first = pages[0]?.folder[0];

  if (first !== undefined && pages.every((page) => page.folder[0] === first)) {
    title = first;
    pages = pages.map((page) => ({ ...page, folder: page.folder.slice(1) }));
  }

  /* A page with pages under it moves into the folder those pages are in, ahead of them. */
  const folders = new Set<string>();

  for (const page of pages) {
    for (let depth = 1; depth <= page.folder.length; depth += 1) {
      folders.add(key(page.folder.slice(0, depth)));
    }
  }

  const leads = new Set<SplitPage>();

  pages = pages.map((page) => {
    const own = [...page.folder, page.title];

    if (folders.has(key(own))) {
      const moved = { ...page, folder: own };

      leads.add(moved);

      return moved;
    }

    return page;
  });

  /* Positions within each folder: the page that introduces a folder first, then the export's order. */
  const counters = new Map<string, number>();
  const ordered = [...pages.filter((page) => leads.has(page)), ...pages.filter((page) => !leads.has(page))];
  const positions = new Map<SplitPage, number>();

  for (const page of ordered) {
    const at = counters.get(key(page.folder)) ?? 0;

    positions.set(page, at);
    counters.set(key(page.folder), at + 1);
  }

  return {
    source,
    title,
    pages: pages.map((page) => ({ ...page, position: positions.get(page) ?? 0 })),
  };
}

/** Every folder the pages need, parents before children, as paths. */
export function foldersOf(split: SplitExport): string[][] {
  const seen = new Map<string, string[]>();

  for (const page of split.pages) {
    for (let depth = 1; depth <= page.folder.length; depth += 1) {
      const path = page.folder.slice(0, depth);

      if (!seen.has(key(path))) seen.set(key(path), path);
    }
  }

  return [...seen.values()].sort((a, b) => a.length - b.length);
}

export const folderKey = key;

/**
 * A link from one page of an export to another, before either has an address of its own.
 *
 * Exports link their pages by file name — `Jetbrains-Assistant_176306816.html` — which means
 * nothing once the pages are documents. An importer rewrites each such link to this, naming the
 * page by its place in the export, and whoever keeps the pages gives it its real address: the
 * saved document, the page in the preview's tree, the file beside it in a .zip.
 */
export const PAGE_LINK = '#tp-page-';

export const PAGE_LINKS = /#tp-page-(\d+)/g;

/** Links to other pages of the same export, by their file name, rewritten to `PAGE_LINK`. */
export function linkPages(pages: Array<{ markdown: string; file?: string }>): void {
  const index = new Map<string, number>();

  pages.forEach((page, at) => {
    if (page.file) index.set(page.file.split('/').pop()!.toLowerCase(), at);
  });

  for (const page of pages) {
    page.markdown = page.markdown.replace(
      /\]\(<?([^)\s#>]+\.(?:html?|md))(#[^)\s>]*)?>?\)/gi,
      (whole, target: string) => {
        let name = target.split('/').pop()!;

        try {
          name = decodeURIComponent(name);
        } catch {
          // A stray % is still the file somebody meant.
        }

        const at = index.get(name.toLowerCase());

        return at === undefined ? whole : `](${PAGE_LINK}${at})`;
      }
    );
  }
}
