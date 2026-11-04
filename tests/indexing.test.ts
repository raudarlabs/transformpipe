import { describe, expect, it } from 'vitest';
import { INDEXED_TRANSLATIONS, QUIET_ARTICLES, articleIndexedIn } from '../src/lib/article-index.js';
import {
  CHANGELOG,
  CONVERSION_ENTRIES,
  INDEXED_ENTRIES,
  QUIET_ENTRIES,
  entryIndexedIn,
} from '../src/lib/changelog.js';

/* The rules in CLAUDE.md, "Which article pages are offered to search" and the entry pages. */

describe('articleIndexedIn', () => {
  it('indexes an English article unless it is quiet', () => {
    const quiet = [...QUIET_ARTICLES][0];

    expect(articleIndexedIn('a-new-article', 'en')).toBe(true);
    expect(articleIndexedIn(quiet, 'en')).toBe(false);
  });

  it('indexes a translation only when it is named', () => {
    const named = [...INDEXED_TRANSLATIONS][0];
    const [locale, slug] = named.split('/') as ['de', string];

    expect(articleIndexedIn(slug, locale)).toBe(true);
    expect(articleIndexedIn('a-new-article', 'de')).toBe(false);
  });

  it('names translations as locale/slug, never English', () => {
    for (const one of INDEXED_TRANSLATIONS) expect(one).toMatch(/^(de|fr|es|it)\/[a-z0-9-]+$/);
  });
});

describe('entryIndexedIn', () => {
  const withSlug = (slug: string) => ({ date: '2026-11-01', title: 't', body: 'b', slug });

  it('indexes a named entry in English only', () => {
    expect(entryIndexedIn(withSlug('mermaid-diagrams'), 'en')).toBe(true);
    expect(entryIndexedIn(withSlug('mermaid-diagrams'), 'de')).toBe(false);
  });

  it('keeps a new entry out by default', () => {
    expect(entryIndexedIn(withSlug('something-new'), 'en')).toBe(false);
    expect(entryIndexedIn({ date: '2026-11-01', title: 't', body: 'b' }, 'en')).toBe(false);
  });

  it('lets the sets that keep an entry out win', () => {
    for (const slug of [...CONVERSION_ENTRIES, ...QUIET_ENTRIES]) {
      expect(entryIndexedIn(withSlug(slug), 'en')).toBe(false);
    }
  });

  it('names only entries that exist', () => {
    const slugs = new Set(CHANGELOG.map((one) => one.slug).filter(Boolean));

    for (const slug of INDEXED_ENTRIES) expect(slugs).toContain(slug);
  });
});
