import { describe, expect, it, vi } from 'vitest';
import { ARCHIVE_BYTES, DOCUMENT_BYTES, PACKAGE_BYTES, PAGE_BYTES, fitsPage, uploadLimit } from '../shared/limits.js';

vi.mock('../server/db.js', () => ({ sql: () => { throw new Error('no database in unit tests'); } }));

const { cleanStats } = await import('../server/limits.js');

describe('uploadLimit', () => {
  it('gives an export archive the most room', () => {
    expect(uploadLimit(['.zip', '.md'])).toBe(ARCHIVE_BYTES);
  });

  it('gives a package more than plain text', () => {
    expect(uploadLimit(['.docx'])).toBe(PACKAGE_BYTES);
    expect(uploadLimit(['.md', '.txt'])).toBe(DOCUMENT_BYTES);
  });
});

describe('fitsPage', () => {
  it('counts bytes, not characters', () => {
    // Three bytes each in UTF-8: as characters it fits, as bytes it does not.
    const cyrillicLimit = Math.floor(PAGE_BYTES / 2) + 10;

    expect(fitsPage('я'.repeat(cyrillicLimit))).toBe(false);
    expect(fitsPage('a'.repeat(cyrillicLimit))).toBe(true);
  });

  it('allows up to the limit and nothing over', () => {
    expect(fitsPage('a'.repeat(Math.floor(PAGE_BYTES)))).toBe(true);
    expect(fitsPage('a'.repeat(Math.floor(PAGE_BYTES) + 1))).toBe(false);
  });
});

describe('cleanStats', () => {
  it('keeps only finite numbers under short keys', () => {
    expect(cleanStats({ words: 10, headings: 2, note: 'x', bad: Number.NaN, big: Infinity, ['k'.repeat(33)]: 1 })).toEqual({
      words: 10,
      headings: 2,
    });
  });

  it('refuses anything that is not a plain object', () => {
    expect(cleanStats(null)).toEqual({});
    expect(cleanStats([1, 2])).toEqual({});
    expect(cleanStats('words')).toEqual({});
  });

  it('keeps at most sixteen counts', () => {
    const many = Object.fromEntries(Array.from({ length: 40 }, (_, at) => [`k${at}`, at]));

    expect(Object.keys(cleanStats(many))).toHaveLength(16);
  });
});
