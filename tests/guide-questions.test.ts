import { describe, expect, it } from 'vitest';
import { plainAnswer, splitGuide } from '../src/lib/guide-questions.js';

const GUIDE = [
  '## What it does',
  'Text.',
  '',
  '### Not a question',
  'Still the body.',
  '',
  '## Fragen',
  '',
  '### Is it free?',
  'Yes, see [pricing](/pricing).',
  '',
  '### Is it kept?',
  'Only when you **save** it.',
].join('\n');

describe('splitGuide', () => {
  it('takes the last section out when it is questions, whatever its heading', () => {
    const { body, questions } = splitGuide(GUIDE);

    expect(body).toBe(['## What it does', 'Text.', '', '### Not a question', 'Still the body.'].join('\n'));
    expect(questions).toEqual([
      { question: 'Is it free?', answer: 'Yes, see [pricing](/pricing).' },
      { question: 'Is it kept?', answer: 'Only when you **save** it.' },
    ]);
  });

  it('keeps all of a guide whose last section is prose', () => {
    const markdown = '## One\nText\n\n## Two\nMore text\n\n### A sub-heading\nx';

    expect(splitGuide(markdown)).toEqual({ body: markdown, questions: [] });
  });

  it('keeps all of a guide with no sections', () => {
    expect(splitGuide('Just text.')).toEqual({ body: 'Just text.', questions: [] });
  });

  it('drops a question with no answer', () => {
    expect(splitGuide('## Q\n\n### Empty?\n\n### Full?\nYes.').questions).toEqual([
      { question: 'Full?', answer: 'Yes.' },
    ]);
  });
});

describe('plainAnswer', () => {
  it('keeps link text and drops the markup', () => {
    expect(plainAnswer('See [the **pricing**](/pricing) and `code`,\n  _twice_.')).toBe('See the pricing and code, twice.');
  });
});
