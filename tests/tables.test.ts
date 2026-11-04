import { describe, expect, it } from 'vitest';
import { delimitedToMarkdown, markdownTable, parseDelimited } from '../shared/from-table.js';
import { conversionForFile, conversionForPath } from '../shared/conversions.js';

describe('parseDelimited', () => {
  it('reads quoted fields with delimiters, quotes and line breaks inside', () => {
    expect(parseDelimited('a,"b, c","say ""hi""","two\nlines"\n1,2,3,4\n', ',')).toEqual([
      ['a', 'b, c', 'say "hi"', 'two\nlines'],
      ['1', '2', '3', '4'],
    ]);
  });

  it('ignores a byte order mark, Windows line endings and a trailing newline', () => {
    expect(parseDelimited('﻿a;b\r\n1;2\r\n', ';')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('keeps a quote in the middle of a field as a character', () => {
    expect(parseDelimited('5" screen,b\n', ',')).toEqual([['5" screen', 'b']]);
  });

  it('keeps empty fields', () => {
    expect(parseDelimited('a,,c\n,,', ',')).toEqual([
      ['a', '', 'c'],
      ['', '', ''],
    ]);
  });
});

describe('markdownTable', () => {
  it('escapes pipes and backslashes and folds line breaks', () => {
    expect(markdownTable(['a|b'], [['c\\d'], ['one\ntwo']])).toBe(
      ['| a\\|b |', '| --- |', '| c\\\\d |', '| one<br>two |', ''].join('\n')
    );
  });

  it('pads short rows to the widest', () => {
    expect(markdownTable(['a', 'b'], [['1']])).toBe(['| a | b |', '| --- | --- |', '| 1 |  |', ''].join('\n'));
  });
});

describe('delimitedToMarkdown', () => {
  it('finds the delimiter on its own', () => {
    expect(delimitedToMarkdown('name\tage\nAnn\t30\n')).toContain('| Ann | 30 |');
    expect(delimitedToMarkdown('name;age\nAnn;30\n')).toContain('| Ann | 30 |');
  });

  it('is not fooled by a delimiter inside quotes', () => {
    expect(delimitedToMarkdown('"a;b",c\n1,2\n')).toContain('| a;b | c |');
  });

  it('gives nothing for nothing', () => {
    expect(delimitedToMarkdown('')).toBe('');
  });
});

describe('conversions', () => {
  it('finds a conversion by its path, with or without a trailing slash', () => {
    expect(conversionForPath('/csv-to-markdown')?.id).toBe('csv-to-markdown');
    expect(conversionForPath('/csv-to-markdown/')?.id).toBe('csv-to-markdown');
    expect(conversionForPath('/nowhere')).toBeNull();
  });

  it('breaks a shared extension by the page the file landed on', () => {
    const zip = conversionForFile('export.ZIP');

    expect(zip).not.toBeNull();
    expect(conversionForFile('export.zip', 'confluence-to-markdown')?.id).toBe('confluence-to-markdown');
    expect(conversionForFile('no-extension')).toBeNull();
  });
});
