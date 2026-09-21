/*
 * The store listing may not name a format this extension does not convert.
 *
 * Google rejected version 1.0.0 under "Spam and Placement in the Store", quoting one sentence from
 * the description: "Word documents, PDFs, spreadsheets, HTML, CSV, JSON, EPUB". The policy calls
 * that excessive keywords, and it was. The part the policy did not have to mention is that two of
 * those seven formats were fiction — nothing here has ever read a PDF or an EPUB — and a reviewer
 * who installed the extension looking for the PDF option would have filed something worse than a
 * spam rejection.
 *
 * So this walks the listing for format names and asks `shared/conversions.ts` whether each one is
 * real. It cannot judge whether a sentence reads like a keyword list; a person has to. It can make
 * sure the sentence is true.
 *
 * Run by `npm run store:check`, and by `npm run build` through `deploy:check`'s siblings, so a
 * listing that drifts from the converters fails before it is pasted into a form.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

const listing = readFileSync(path.join(root, 'content/extension-store.md'), 'utf8');
const conversions = readFileSync(path.join(root, 'shared/conversions.ts'), 'utf8');

/*
 * The screenshots are part of the listing, and this check used not to read them.
 *
 * That is not hypothetical. The sentence Google quoted when it rejected 1.0.0 — "Word documents,
 * PDFs, spreadsheets, HTML, CSV, JSON, EPUB" — was taken out of the description, and the
 * description was rewritten, and this script was written to stop it happening again. The caption
 * drawn onto screenshot four still read "Word, PDF, spreadsheets, HTML, CSV, JSON and more", and
 * it was uploaded to the same store page. A guard that covers the text and not the pictures
 * beside it is a guard that reports success while the claim is still on the shelf.
 */
const art = readFileSync(path.join(root, 'scripts/store-art.mjs'), 'utf8');

/*
 * Which extensions the converters actually take, read out of the source rather than imported: this
 * script is plain Node, and the one thing it needs is a list of quoted `.xyz` strings.
 */
const supported = new Set(
  [...conversions.matchAll(/'(\.[a-z0-9]{1,5})'/g)].map((match) => match[1].toLowerCase())
);

/**
 * Format names a reader would take as "this converts that", and the extension each one claims.
 *
 * Deliberately a short list of the words that mean a file format in a shopfront sentence. A word
 * like "text" or "document" is too vague to hold to an extension and is left out — this is here to
 * catch a concrete false claim, not to police prose.
 */
const CLAIMS = {
  pdf: '.pdf',
  pdfs: '.pdf',
  epub: '.epub',
  epubs: '.epub',
  docx: '.docx',
  xlsx: '.xlsx',
  csv: '.csv',
  tsv: '.tsv',
  json: '.json',
  rtf: '.rtf',
  odt: '.odt',
  latex: '.tex',
  powerpoint: '.pptx',
  pptx: '.pptx',
  keynote: '.key',
  /* Not `pages`: it is an ordinary English word here — "a set of pages" — long before it is Apple's
   * word processor, and a check that fires on that gets deleted rather than obeyed. */
  mobi: '.mobi',
  azw: '.azw',
  djvu: '.djvu',
};

/* Only the blockquoted lines: those are the text that goes into the form. The prose around them is
 * ours, and it is allowed to discuss a format we do not convert — this file does exactly that. */
const quoted = listing
  .split('\n')
  .filter((line) => line.startsWith('> '))
  .join('\n')
  .toLowerCase();

/* The words drawn onto the screenshots, which reach the same store page the description does. */
const drawn = [...art.matchAll(/^\s*(?:caption|blurb):\s*'([^']*)'/gm)]
  .map((match) => match[1])
  .join('\n')
  .toLowerCase();

const sources = [
  ['content/extension-store.md', quoted],
  ['scripts/store-art.mjs, drawn onto a screenshot', drawn],
];

const problems = [];

for (const [where, text] of sources) {
  for (const [word, extension] of Object.entries(CLAIMS)) {
    if (!new RegExp(`\\b${word}\\b`).test(text)) {
      continue;
    }

    if (!supported.has(extension)) {
      problems.push(
        `${where} says "${word}", but no conversion in shared/conversions.ts takes ${extension}`
      );
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s) in the store listing:`);

  for (const one of problems) {
    console.error(`  ${one}`);
  }

  console.error(
    '\nA store listing that names a format the extension does not convert is a rejection ' +
      'waiting to happen, and a worse one than keyword stuffing.\n'
  );
  process.exit(1);
}

console.log(
  `store listing and screenshots name no format the converters lack ` +
    `(${supported.size} extensions supported)`
);
