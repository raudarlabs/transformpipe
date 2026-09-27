/*
 * Where a page's cover lives.
 *
 * `npm run og` draws them into public/og, so these are static files the browser fetches like any
 * other image. Named in one place because three things ask for the same path: the card in the blog
 * index, the card on the front page, and the prerenderer, which needs an absolute URL for
 * `og:image` — a relative one is ignored by every scraper that matters.
 */

/*
 * One picture per article, shared by every language.
 *
 * The covers used to be drawn per locale, because the headline was printed into the image and an
 * English headline on a German card is wrong. The pictures carry no words now, so there is nothing
 * left to translate — and a sixth language would cost no images at all.
 */

/**
 * A blog article's share image: 1200 by 630, JPEG.
 *
 * This is what `og:image` points at, because a share with no headline is a coloured rectangle.
 * JPEG rather than the WebP the card gets, and rather than the PNG both used to be: every scraper
 * that matters handles JPEG, WebP support among them is uneven, and PNG was three times the bytes
 * for a picture nobody inspects at full size.
 */
export function articleCover(slug: string): string {
  return `/og/blog/${slug}.jpg`;
}

/**
 * The same picture at two thirds the size, for the card in a list: 800 by 420, WebP.
 *
 * The card is shown about 390px wide in a three-column grid, so the share image was four times the
 * pixels the browser needed, on every card on the page. WebP is safe here in a way it is not for
 * `og:image`, because the only thing that fetches this one is a browser.
 */
export function articleCardImage(slug: string): string {
  return `/og/card/${slug}.webp`;
}

/**
 * Any other page's cover, by route.
 *
 * The front page is `home.jpg` rather than `index.jpg`, and a conversion page uses its own path
 * with the leading slash dropped. Every changelog entry shares the changelog's one cover: there are
 * fifty-odd of them and a new one most days, and a picture each would be fifty files to draw for
 * pages that are mostly `noindex`.
 *
 * Nothing here can tell whether the file was ever drawn, so the prerenderer checks that every
 * cover it names is in dist and fails the build when one is not — a route added without a line in
 * `scripts/og-images.mjs` is caught there, not by somebody sharing a link to it.
 */
export function pageCover(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');

  if (clean === '') {
    return '/og/home.jpg';
  }

  if (clean === 'changelog' || clean.startsWith('changelog/')) {
    return '/og/changelog.jpg';
  }

  if (clean === 'markdown-to-html') {
    return '/og/markdown-to-html.jpg';
  }

  return `/og/${clean}.jpg`;
}

/** 1200 by 630, which is what the generator draws and what every scraper expects to be told. */
export const COVER_SIZE = { width: 1200, height: 630 };
