/*
 * A conversion guide's last section, the questions, taken out so the page can ask them where it
 * asks the others: in its FAQ, above the questions every page shares.
 *
 * The guides are written with five H2 sections, the last of them questions as H3s with their
 * answers beneath (`scripts/check-guides.mjs` holds them to that). The heading is in the guide's own
 * language — "Questions", "Fragen", "Domande" — so the section is found by its shape, not its name:
 * the last H2, when what is under it is H3s. A guide that ends any other way keeps all of its text.
 *
 * Pure, so the app (src/components/ConversionGuide.tsx) and the prerenderer (scripts/prerender.ts)
 * split a guide the same way and a crawler reads the same questions a visitor opens.
 */

export interface GuideQuestion {
  question: string;
  /** Markdown, as the guide wrote it: links stay links. */
  answer: string;
}

export function splitGuide(markdown: string): { body: string; questions: GuideQuestion[] } {
  const headings = [...markdown.matchAll(/^## .+$/gm)];
  const last = headings.at(-1);

  if (!last || last.index === undefined) return { body: markdown, questions: [] };

  const section = markdown.slice(last.index + last[0].length);
  const parts = section.split(/^### (.+)$/m);

  // parts: [text before the first H3, question, answer, question, answer, ...]
  if (parts.length < 3 || parts[0].trim() !== '') return { body: markdown, questions: [] };

  const questions: GuideQuestion[] = [];

  for (let at = 1; at < parts.length; at += 2) {
    const question = parts[at].trim();
    const answer = (parts[at + 1] ?? '').trim();

    if (question && answer) questions.push({ question, answer });
  }

  return { body: markdown.slice(0, last.index).trimEnd(), questions };
}

/** An answer as plain text, for the structured data a search engine reads. */
export function plainAnswer(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
