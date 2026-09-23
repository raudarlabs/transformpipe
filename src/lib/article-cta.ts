import {
  type Conversion,
  conversion,
  conversionForPath,
  CONVERSIONS,
  DEFAULT_CONVERSION,
} from '@shared/conversions';

/*
 * The one invitation inside an article, placed in the middle of it.
 *
 * An article on this site is two to five thousand words and ends on a link nobody scrolls to. The
 * reader who is going to convert something decides that halfway down, while the piece is still
 * explaining the thing they came for — so the offer belongs there, once, and it belongs to *this*
 * article: a piece about Word offers the Word conversion, not a generic front page.
 *
 * Done to the rendered HTML rather than to the Markdown. 350 files in five languages would be 350
 * places for it to drift, and the day the wording changes is the day 349 of them are wrong. The
 * prose in `content/blog` stays prose.
 */

/**
 * Which conversion an article should offer, taken from the article itself.
 *
 * The first conversion page the prose links to, because that is the writer's own judgement about
 * what this piece is about, already made. An article that links to none — a piece about Markdown
 * syntax rather than about a format — gets the default conversion, which is what the front page
 * offers anyway.
 *
 * Tolerant of the locale prefix: the same function runs on the app's raw hrefs and on the
 * prerenderer's localised ones, and `/de/word-to-markdown` is the same conversion as
 * `/word-to-markdown`.
 */
export function ctaConversionFor(html: string): Conversion {
  const paths = new Set(CONVERSIONS.map((one) => one.path));

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

    if (paths.has(href) && href !== '/') {
      return conversionForPath(href) ?? conversion(DEFAULT_CONVERSION);
    }
  }

  return conversion(DEFAULT_CONVERSION);
}

interface CtaWords {
  /** Where the button goes — this conversion's address, in the reader's language. */
  href: string;
  /** What the button says: the conversion's own label, so it is a promise and not a slogan. */
  action: string;
  title: string;
  blurb: string;
}

/**
 * The block itself, styled with the document stylesheet's own properties.
 *
 * Inline styles rather than classes, and `--md-*` rather than colours: this markup is injected
 * into the rendered article, which is the exported document's stylesheet scope in the app and in
 * the prerendered page both. The variables follow the theme in either place, and nothing here
 * depends on a class that might be sanitised, renamed or absent.
 *
 * Paragraphs rather than a heading, deliberately — `headingsFromHtml` builds the contents out of
 * this same HTML, and an invitation is not a section of the article.
 */
export function articleCtaHtml({ href, action, title, blurb }: CtaWords): string {
  const escape = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return (
    `<aside class="md-cta" style="margin:2.75rem 0;padding:1.25rem 1.5rem;border:1px solid var(--md-stroke);border-radius:14px;background:var(--md-card-2)">` +
    `<p style="margin:0 0 .35rem;font-weight:600;color:var(--md-ink)">${escape(title)}</p>` +
    `<p style="margin:0 0 .9rem;color:var(--md-secondary)">${escape(blurb)}</p>` +
    `<a href="${escape(href)}" style="display:inline-block;padding:.5rem .95rem;border-radius:10px;background:var(--md-brand);color:#ffffff;text-decoration:none;font-weight:600">${escape(action)}</a>` +
    `</aside>`
  );
}

/** Below this an article is short enough that the middle and the end are the same place. */
const MINIMUM = 2500;

/**
 * The rendered article with the block in the middle of it.
 *
 * "The middle" is the section boundary nearest the halfway point, not the halfway point itself: a
 * card dropped between two paragraphs of one argument interrupts it, and the same card between two
 * sections reads as the pause that is already there. Falls back to a paragraph boundary when the
 * piece has no sections to speak of, and returns the article untouched when it is too short to
 * have a middle.
 */
export function withArticleCta(html: string, cta: string): string {
  if (html.length < MINIMUM) {
    return html;
  }

  const middle = html.length / 2;

  const nearest = (pattern: RegExp) => {
    let best: number | null = null;

    for (const match of html.matchAll(pattern)) {
      if (best === null || Math.abs(match.index - middle) < Math.abs(best - middle)) {
        best = match.index;
      }
    }

    return best;
  };

  /* Never the first heading: a card above the article's own opening section is a banner. */
  const heading = nearest(/<h2\b/g);
  const at = heading !== null && heading > MINIMUM / 2 ? heading : nearest(/<p\b/g);

  if (at === null || at === 0) {
    return html;
  }

  return html.slice(0, at) + cta + html.slice(at);
}
