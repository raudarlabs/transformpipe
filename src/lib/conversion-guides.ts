import type { ConversionId } from '@shared/conversions';
import { DEFAULT_LOCALE, type Locale } from './i18n/locales';

/*
 * The guide under each converter: what comes across, what is left behind, an example, the limits
 * and the questions people ask about that one conversion.
 *
 * Written as Markdown in `content/conversions/<id>.md`, with translations in
 * `content/conversions/<locale>/<id>.md`, and loaded the way an article body is: behind a lazy
 * `import.meta.glob`, so each guide is a chunk of its own and the front page does not carry
 * twenty of them in five languages. The prerenderer reads the same files from disk for the copy
 * a crawler gets (`scripts/prerender.ts`), and `scripts/check-guides.mjs` holds them to their
 * shape when the site is built.
 *
 * Why they exist: until October 2026 a conversion page had 40 to 66 words of its own and Search
 * Console ranked them 60th to 100th. A converter alone does not answer "what will this do to my
 * file". These pages do.
 */

const GUIDES = import.meta.glob('../../content/conversions/**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

function fileFor(id: ConversionId, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? `/conversions/${id}.md` : `/conversions/${locale}/${id}.md`;
}

/**
 * The guide in the language asked for, falling back to English, or null when nobody wrote one.
 *
 * The fallback keeps a page in a language with a missing translation useful. The build refuses
 * a missing translation anyway (`check-guides.mjs`), so it is a safety net, not a plan.
 */
export async function conversionGuide(id: ConversionId, locale: Locale): Promise<string | null> {
  for (const tail of [fileFor(id, locale), fileFor(id, DEFAULT_LOCALE)]) {
    const entry = Object.entries(GUIDES).find(([path]) => path.endsWith(tail));

    if (entry) {
      return entry[1]();
    }
  }

  return null;
}
