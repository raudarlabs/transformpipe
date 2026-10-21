#!/usr/bin/env node
/*
 * Holds the conversion guides in content/conversions to their shape, so a guide that is missing,
 * half-translated or pointing at nothing fails the build rather than the page.
 *
 * - every conversion in shared/conversions.ts has an English guide and all four translations
 * - no H1 (the page has one), and the English headings in the agreed order
 * - 4 to 6 questions under the last heading
 * - English 400 to 800 words outside code, and each translation at least two thirds of that
 * - at most 3 links, every one to a page that exists, and the product named at most twice
 *
 * See src/lib/conversion-guides.ts for why the guides exist.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'content/conversions';
const LOCALES = ['de', 'fr', 'es', 'it'];
const HEADINGS = ['What comes across', 'What is left behind', 'An example', 'Limits', 'Questions'];

const conversionsSource = readFileSync('shared/conversions.ts', 'utf8');
const ids = [...conversionsSource.matchAll(/^\s*id: '([a-z-]+)',$/gm)].map((match) => match[1]);
const conversionPaths = [...conversionsSource.matchAll(/^\s*path: '([^']+)',$/gm)].map(
  (match) => match[1]
);
const staticPaths = [
  ...readFileSync('src/lib/pages.ts', 'utf8').matchAll(/path: '(\/[^']*)'/g),
].map((match) => match[1]);
const known = new Set([...conversionPaths, ...staticPaths, '/blog', '/docs', '/history', '/changelog']);

const problems = [];
/*
 * The guide without its code: fenced blocks of three or more backticks or tildes, closed by a fence
 * at least as long, which is the CommonMark rule. An example's own `# Title` or link is not the
 * guide's, so headings, links and words are all counted on this.
 */
const withoutCode = (text) => {
  const out = [];
  let fence = null;

  for (const line of text.split(/\r?\n/)) {
    const opens = line.match(/^ {0,3}(`{3,}|~{3,})/);

    if (fence) {
      if (opens && opens[1][0] === fence[0] && opens[1].length >= fence.length && !line.trim().slice(opens[1].length).trim()) {
        fence = null;
      }
    } else if (opens) {
      fence = opens[1];
    } else {
      out.push(line);
    }
  }

  return out.join('\n');
};
const prose = (text) => withoutCode(text).replace(/`[^`]*`/g, ' x ');
const words = (text) => prose(text).split(/\s+/).filter(Boolean).length;

function checkLinks(file, text) {
  /* A link written inside `code` is an example of the syntax, not a link on the page. */
  const links = [...text.replace(/`[^`\n]*`/g, ' ').matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]);

  if (links.length > 3) {
    problems.push(`${file}: ${links.length} links, at most 3`);
  }

  for (const link of links) {
    const path = link.split('#')[0];

    if (!path.startsWith('/')) {
      problems.push(`${file}: ${link} is not a site path`);
    } else if (path.startsWith('/blog/')) {
      if (!existsSync(join('content/blog', `${path.slice(6)}.md`))) {
        problems.push(`${file}: ${link} is no article`);
      }
    } else if (!known.has(path)) {
      problems.push(`${file}: ${link} is no page`);
    }
  }
}

if (ids.length === 0) {
  problems.push('no conversion ids read from shared/conversions.ts');
}

for (const id of ids) {
  const english = join(ROOT, `${id}.md`);

  if (!existsSync(english)) {
    problems.push(`${english}: missing`);
    continue;
  }

  const raw = readFileSync(english, 'utf8');
  const text = withoutCode(raw);
  const h2 = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
  const questions = text.split(/^## Questions$/m)[1] ?? '';
  const asked = [...questions.matchAll(/^### .+$/gm)].length;
  const count = words(text);

  if (/^# /m.test(text)) problems.push(`${english}: has an H1`);
  if (/^---\r?\n/.test(raw)) problems.push(`${english}: has frontmatter`);
  if (h2.join('|') !== HEADINGS.join('|')) {
    problems.push(`${english}: headings are "${h2.join(' / ')}"`);
  }
  if (asked < 4 || asked > 6) problems.push(`${english}: ${asked} questions, want 4 to 6`);
  if (count < 400 || count > 800) problems.push(`${english}: ${count} words, want 400 to 800`);
  if ((text.match(/TransformPipe/g) ?? []).length > 2) problems.push(`${english}: names the product more than twice`);
  checkLinks(english, text);

  for (const locale of LOCALES) {
    const file = join(ROOT, locale, `${id}.md`);

    if (!existsSync(file)) {
      problems.push(`${file}: missing`);
      continue;
    }

    const translated = withoutCode(readFileSync(file, 'utf8'));
    const their = [...translated.matchAll(/^## (.+)$/gm)].length;
    const theirAsked = [...translated.matchAll(/^### .+$/gm)].length;

    if (/^# /m.test(translated)) problems.push(`${file}: has an H1`);
    if (their !== HEADINGS.length) problems.push(`${file}: ${their} H2 headings, want ${HEADINGS.length}`);
    if (theirAsked !== asked) problems.push(`${file}: ${theirAsked} questions, English has ${asked}`);
    if (words(translated) < (count * 2) / 3) {
      problems.push(`${file}: ${words(translated)} words, under two thirds of ${count}`);
    }
    if ((translated.match(/TransformPipe/g) ?? []).length > 2) problems.push(`${file}: names the product more than twice`);
    checkLinks(file, translated);
  }
}

/* A guide for a conversion that no longer exists would be shipped to nobody. */
for (const dir of [ROOT, ...LOCALES.map((locale) => join(ROOT, locale))]) {
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((one) => one.endsWith('.md'))) {
    if (!ids.includes(name.replace(/\.md$/, ''))) problems.push(`${join(dir, name)}: no such conversion`);
  }
}

if (problems.length > 0) {
  console.error(`Conversion guides: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

console.log(`Conversion guides: ${ids.length} conversions × 5 languages, all in shape.`);
