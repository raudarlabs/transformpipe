import { describe, expect, it } from 'vitest';
import { rewriteWikilinks, stripFrontmatter } from '../shared/notes.js';

describe('rewriteWikilinks', () => {
  it('reduces a wikilink to its words', () => {
    expect(rewriteWikilinks('See [[Project plan]] first.')).toBe('See Project plan first.');
  });

  it('prefers the shown text and drops the heading', () => {
    expect(rewriteWikilinks('[[Plan#Budget|the budget]]')).toBe('the budget');
    expect(rewriteWikilinks('[[Plan#Budget]]')).toBe('Plan');
  });

  it('turns an embedded picture into an image when the archive has it', () => {
    const has = (name: string) => name === 'chart.png';

    expect(rewriteWikilinks('![[chart.png]]', has)).toBe('![chart.png](chart.png)');
    expect(rewriteWikilinks('![[missing.png]]', has)).toBe('*missing.png*');
  });

  it('keeps an embed as words when there is no archive', () => {
    expect(rewriteWikilinks('![[chart.png|Sales]]')).toBe('*Sales*');
  });

  it('reads an embedded note, not a file, as its words', () => {
    expect(rewriteWikilinks('![[Other note]]')).toBe('Other note');
  });

  it('leaves inline code alone', () => {
    expect(rewriteWikilinks('Write `[[Note]]` to link [[Note]].')).toBe('Write `[[Note]]` to link Note.');
  });

  it('leaves fenced code alone, with backticks and tildes', () => {
    const markdown = ['[[A]]', '```md', '[[B]]', '```', '~~~', '[[C]]', '~~~', '[[D]]'].join('\n');

    expect(rewriteWikilinks(markdown)).toBe(['A', '```md', '[[B]]', '```', '~~~', '[[C]]', '~~~', 'D'].join('\n'));
  });

  it('does not close a fence on a shorter marker', () => {
    const markdown = ['````', '```', '[[Inside]]', '````', '[[Outside]]'].join('\n');

    expect(rewriteWikilinks(markdown)).toBe(['````', '```', '[[Inside]]', '````', 'Outside'].join('\n'));
  });
});

describe('stripFrontmatter', () => {
  it('removes the properties block at the top', () => {
    expect(stripFrontmatter('---\ntags: [a]\n---\n# Title\n')).toBe('# Title\n');
  });

  it('handles Windows line endings and a byte order mark', () => {
    expect(stripFrontmatter('﻿---\r\ntitle: x\r\n---\r\nText')).toBe('Text');
  });

  it('leaves a rule further down alone', () => {
    const markdown = '# Title\n\n---\n\nmore\n---\n';

    expect(stripFrontmatter(markdown)).toBe(markdown);
  });
});
