import type { ConversionId } from '@shared/conversions';
import type { StaticPageId } from '@/lib/pages';

/*
 * The shape of everything the product says, in one type.
 *
 * English is the source: `messages/en/*` is written first, its `ui` object defines the key set, and
 * every other locale has to satisfy the same type. A key added in English and forgotten in German
 * stops the build rather than showing a German reader an English sentence — which is the failure
 * mode of every string table that is checked by hand.
 *
 * Types cannot check everything here. An array of five sections and an array of three both satisfy
 * `Section[]`, so `assertCatalogueShapes` in `catalogues.ts` walks each locale against English —
 * same keys, same array lengths, nothing empty, the same placeholders — and the prerenderer calls
 * it, which puts it inside `npm run build`.
 *
 * What is NOT in here, on purpose:
 *
 *   - the blog's articles. Fifty-six pieces averaging 6,150 words, so 345,000 words in English
 *     alone. They are not strings: an article is a file, and a translation of one is another file
 *     beside it — content/blog/<locale>/<slug>.md, read by `vite-plugin-blog.ts` into a list per
 *     language. So the blog is translated a piece at a time, and every part of the site that shows
 *     articles asks for the language it is drawing in. What a locale does not have, it does not
 *     list, link to, or claim an `hreflang` for.
 *   - the server's copy of the shared-document page, and the OAuth consent page. Both are rendered
 *     by the server for a reader we know nothing about, at an address with no locale in it, so there
 *     is nothing to choose a language from but `Accept-Language` — and guessing wrong on a consent
 *     page is worse than English. The app's own view of a shared document is a different thing: it
 *     is reached at `/open/<token>` by somebody the server sent here to sign in, it is drawn by the
 *     bundle, and its words are in `ui` under `shared.` like every other screen's.
 *   - the API's and the connector's messages. An API answers in one language; ours is English.
 */

/** One `key: sentence` table. The keys come from English; see `messages/en/ui.ts`. */
export type UiMessages = Record<string, string>;

export interface ConversionWords {
  /** In the header menu. */
  label: string;
  /** On a row in the history, where there is no room for the long form. */
  short: string;
  /** The heading of its screen. */
  title: string;
  blurb: string;
  /** The line under the dropzone's title. */
  hint: string;
  seo: { title: string; description: string };
}

export interface PageSectionWords {
  heading: string;
  body: string[];
  items?: string[];
}

/** A title and the sentences under it — a card, a step, a use case without its example. */
export interface TitledWords {
  title: string;
  body: string;
}

/**
 * The words of an assistant landing page, `/agents` and the pages under it.
 *
 * Its own shape rather than `sections`, because the page is not a document: the use cases, the
 * steps and the assistants still to come are each drawn their own way, and a list of headings and
 * paragraphs would leave the renderer guessing which is which. Which picture goes with which use
 * case is the renderer's business, by position — a picture is not language.
 */
export interface LandingWords {
  /** The small line above the title. */
  eyebrow: string;
  /**
   * The picture the page opens on, drawn from words: a document as it sits in a chat — Markdown,
   * asterisks and all — and the same document as it sits in the account afterwards.
   */
  demo: {
    /** Over the Markdown half, and over the finished half. */
    from: string;
    to: string;
    title: string;
    /** A line of prose, then two tasks — the first one done. */
    lines: [string, string, string];
    /** Who the finished document is shared with, and its versions. */
    shared: string;
    meta: string;
  };
  useCases: {
    heading: string;
    intro: string;
    /** Each with the sentence somebody would type, and what it leaves behind. */
    items: (TitledWords & { ask: string; result: string })[];
  };
  /**
   * The objection a page like this invites, answered side by side: what somebody does today
   * against what the connector does. Each row is one property, said both ways.
   */
  compare: {
    heading: string;
    intro: string;
    /** The column headings: the thing it is compared with, and this. */
    left: string;
    right: string;
    rows: { label: string; left: string; right: string }[];
  };
  steps: { heading: string; items: TitledWords[] };
  /** The terminal client, where there is one: a command rather than a settings screen. */
  command?: { heading: string; body: string; code: string };
  /** What the connector may do and may not, side by side, and the notes under them. */
  trust: { heading: string; can: string[]; cannot: string[]; notes: TitledWords[] };
  /**
   * The assistants, as a table: one row each, with how it connects and, opened, the detail. The
   * first is Claude, which works today and links to its page; the rest are being tested. Which is
   * which is the renderer's, by position.
   */
  clients: { heading: string; intro: string; items: { name: string; how: string; body: string }[] };
  /** Drawn by the same block as the front page's questions, so the site has one FAQ, not three. */
  faq: { heading: string; intro: string; items: { question: string; answer: string }[] };
  /** The two invitations: halfway down, after the use cases, and at the end. */
  middle: { title: string; text: string };
  bottom: { title: string; text: string };
}

export interface PageWords {
  label: string;
  title: string;
  lede: string;
  sections: PageSectionWords[];
  /** The one button a how-to page ends on. Its address is in `src/lib/pages.ts`. */
  action?: string;
  /** Present on the assistant landing pages, which draw it instead of `sections`. */
  landing?: LandingWords;
  seo: { title: string; description: string };
}

export interface FaqWords {
  question: string;
  answer: string;
}

export interface DocsSectionWords {
  title: string;
  summary: string;
}

export interface Content {
  ui: UiMessages;
  conversions: Record<ConversionId, ConversionWords>;
  pages: Record<StaticPageId, PageWords>;
  /** In the order `FAQ_ENTRIES` declares — the flags stay in the code, the words come from here. */
  faq: FaqWords[];
  docs: Record<string, DocsSectionWords>;
}
