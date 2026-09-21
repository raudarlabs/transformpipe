/*
 * The pages that are only words: about, contact, and the legal three — the half of them that is
 * not words.
 *
 * What each page *is* lives here: its id, its address, and, for the legal three, the date a reader
 * is entitled to see. What each page *says* lives in `src/lib/i18n/messages/en/pages.ts` and its
 * translations, keyed by the `StaticPageId` this file declares. An id and a path are the same in
 * five languages; a paragraph is not.
 *
 * Still one list, for the same reason the conversions are one list — the footer links to them, the
 * router resolves them, and the prerenderer builds the static page a crawler and a search result
 * get. All three ask this file which pages exist and where they live, and the catalogue for the
 * words. A second copy of either would be the copy that goes stale, and stale text on a privacy
 * page is worse than no page at all.
 */

export type StaticPageId =
  | 'about'
  | 'support'
  | 'extension'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'how-to-md'
  | 'how-to-html'
  | 'how-to-docx'
  | 'how-to-csv'
  | 'how-to-json'
  | 'how-to-txt'
  | 'how-to-xlsx'
  | 'how-to-pptx'
  | 'how-to-epub'
  | 'how-to-zip'
  | 'how-to-assistant';

/**
 * Which part of the footer a page belongs under.
 *
 * The footer used to name its own columns and pick pages by id, which meant adding a page was two
 * edits in two files and forgetting the second one shipped a page nothing linked to. The group
 * travels with the page now.
 */
export type PageGroup = 'company' | 'legal' | 'how-to';

export interface StaticPage {
  id: StaticPageId;
  path: string;
  group: PageGroup;
  /**
   * Another page whose sections this one shows first, before its own.
   *
   * About was a page of its own and is now the opening half of Contact: the two answered the same
   * question from different ends — what this is, and who to ask about it — and a reader who wanted
   * either had to guess which. Its words stay in the catalogue under their own key, translated as
   * they were, rather than being pasted into another entry in five languages.
   */
  also?: StaticPageId;
  /** Where those sections go. Before this page's own, unless this says otherwise. */
  alsoAfter?: boolean;
  /**
   * The conversion this page is about, for the one button it ends on.
   *
   * The address lives here and its words live in the catalogue, the same split as everything else:
   * `/csv-to-markdown` is the same in five languages and "Convert a CSV here" is not.
   */
  action?: string;
  /**
   * The other conversions this page answers for, where one file extension has several.
   *
   * A `.zip` is three conversions here — a Notion export, a Confluence space and an Obsidian vault
   * — and one guide covers opening the file in all three cases. Without this the converter screens
   * for two of them had no guide to point at, because `action` names the one conversion the page's
   * own button goes to, and it can only name one.
   */
  covers?: string[];
  /**
   * When it was last changed, for the pages where a reader is entitled to know. ISO, `2026-09-08`.
   *
   * A machine date, not a written one. It used to be the English "8 September 2026", which was the
   * one sentence on these pages that no translation could reach and which the sitemap then had to
   * parse back into a date to state `lastmod`. Stored as the day itself, it goes into the sitemap
   * as it stands and is written out by `Intl` — see `formatDate` — in whatever language is reading.
   */
  updated?: string;
}

/** The repository, named once: the header links to it, the footer links to it, and so do the pages. */
export const REPO_URL = 'https://github.com/raudarlabs/transformpipe';

/** Where a question goes. There is no support inbox yet; the repository is the honest answer. */
export const ISSUES_URL = `${REPO_URL}/issues`;

const UPDATED = '2026-09-08';

/*
 * The privacy page moves on its own, because it is the one that says it will: "if this page changes
 * in a way that affects what is collected, the date above changes with it". The browser extension
 * reads pages and keeps a token, which is exactly such a change — and the terms and the cookies
 * page did not change at all, so they keep the date they earned.
 */
const PRIVACY_UPDATED = '2026-09-17';

/*
 * Where the extension lives in the Chrome Web Store.
 *
 * `null` until it is published, and the page's button is hidden while it is: a store link written
 * ahead of the review is a 404 on the one page whose whole job is to send somebody to the store.
 * Flipping this to the address is the last step of the submission, not the first.
 */
export const STORE_URL: string | null = null;

export const STATIC_PAGES: StaticPage[] = [
  {
    id: 'support',
    path: '/support',
    group: 'company',
    also: 'about',
    /*
     * About's sections used to open this page, from when it was Contact and the two answered the
     * same question from different ends. On a support page they would push the thing somebody came
     * for below the fold, so they run after it: what to do first, then who is doing it.
     */
    alsoAfter: true,
  },
  {
    id: 'extension',
    path: '/extension',
    group: 'company',
    ...(STORE_URL ? { action: STORE_URL } : {}),
  },
  { id: 'privacy', path: '/privacy', group: 'legal', updated: PRIVACY_UPDATED },
  { id: 'terms', path: '/terms', group: 'legal', updated: UPDATED },
  { id: 'cookies', path: '/cookies', group: 'legal', updated: UPDATED },

  /*
   * One page per extension the dropzone accepts, answering the question somebody types before they
   * know a converter exists: what this file is, what opens it, and what to do with it.
   *
   * Deliberately not blog articles. The blog argues; these answer. `content/blog/how-to-open-md-file.md`
   * is the long piece about Markdown and stays where it is — this is the short page a person lands
   * on from a search and leaves from, having opened their file.
   */
  { id: 'how-to-md', path: '/how-to/open-md', group: 'how-to', action: '/' },
  { id: 'how-to-html', path: '/how-to/open-html', group: 'how-to', action: '/html-to-markdown' },
  { id: 'how-to-docx', path: '/how-to/open-docx', group: 'how-to', action: '/word-to-markdown' },
  { id: 'how-to-csv', path: '/how-to/open-csv', group: 'how-to', action: '/csv-to-markdown' },
  { id: 'how-to-json', path: '/how-to/open-json', group: 'how-to', action: '/json-to-markdown' },
  { id: 'how-to-txt', path: '/how-to/open-txt', group: 'how-to', action: '/text-to-markdown' },
  { id: 'how-to-xlsx', path: '/how-to/open-xlsx', group: 'how-to', action: '/excel-to-markdown' },
  {
    id: 'how-to-pptx',
    path: '/how-to/open-pptx',
    group: 'how-to',
    action: '/powerpoint-to-markdown',
  },
  { id: 'how-to-epub', path: '/how-to/open-epub', group: 'how-to', action: '/epub-to-markdown' },
  {
    id: 'how-to-zip',
    path: '/how-to/open-zip',
    group: 'how-to',
    action: '/notion-to-markdown',
    covers: ['/confluence-to-markdown', '/obsidian-to-markdown'],
  },

  /*
   * The odd one in this group: not a file extension but the other way documents arrive here — an
   * assistant holding Markdown it just wrote, with no file and no repository behind it. Its button
   * goes to the documentation rather than to a conversion, because the thing to do next is connect
   * something rather than drop something.
   */
  { id: 'how-to-assistant', path: '/how-to/assistant', group: 'how-to', action: '/docs' },
];

/** The pages of one group, in the order declared — what the footer builds a column from. */
export function pagesIn(group: PageGroup): StaticPage[] {
  return STATIC_PAGES.filter((one) => one.group === group);
}

const BY_ID = new Map(STATIC_PAGES.map((one) => [one.id, one]));

export function staticPage(id: StaticPageId): StaticPage {
  return BY_ID.get(id)!;
}

export function staticPageForPath(path: string): StaticPage | null {
  const clean = path.replace(/\/$/, '') || '/';

  return STATIC_PAGES.find((one) => one.path === clean) ?? null;
}
