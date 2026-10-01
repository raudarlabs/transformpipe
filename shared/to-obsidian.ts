import { marked, type Token, type Tokens } from 'marked';
import { githubSlug, slugify } from './markdown.js';

/*
 * The same Markdown, with every link to one of its own headings written the way Obsidian reads it.
 *
 * A table of contents is almost always written as GitHub writes it — `[Setup](#setup)`,
 * `[Tier 2 — x](#tier-2--x)` — and Obsidian does not read that: it finds a heading by the heading's
 * own words, `[Setup](#Setup)`, spaces as `%20`. There is no spelling both of them follow, so the
 * plain Markdown download stays exactly the source (it is right for GitHub, VS Code and this site),
 * and this is the other download, for the person moving the document into a vault.
 *
 * Only a link whose fragment matches one of the document's headings is touched, by the same
 * spellings the renderer resolves (`linkAnchors` in markdown.ts); a link to a heading that does not
 * exist stays as it was, and so does everything inside a code block or an inline code span.
 */

/** Each heading's own text, in order, as written after its hashes. */
function headingTexts(markdown: string): string[] {
  const found: string[] = [];
  const walk = (tokens: Token[]) => {
    for (const token of tokens) {
      if (token.type === 'heading') {
        found.push((token as Tokens.Heading).text.trim());
        continue;
      }

      const nested = (token as { tokens?: Token[] }).tokens;

      if (nested) {
        walk(nested);
      }
    }
  };

  walk(marked.lexer(markdown));

  return found;
}

/** A heading's words as an Obsidian fragment: the characters a link's address cannot carry, encoded. */
const obsidianFragment = (text: string) =>
  text
    .replace(/%/g, '%25')
    .replace(/ /g, '%20')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');

export function obsidianHeadingLinks(markdown: string): string {
  const headings = headingTexts(markdown);

  if (headings.length === 0) {
    return markdown;
  }

  const target = new Map<string, string>();
  const used = new Map<string, number>();
  const github = new Map<string, number>();
  const add = (spelling: string, heading: string) => {
    if (spelling && !target.has(spelling)) {
      target.set(spelling, heading);
    }
  };

  for (const heading of headings) {
    const words = heading.toLowerCase();

    add(slugify(heading, used).replace(/^doc-/, ''), heading);
    add(githubSlug(heading, github), heading);
    add(words, heading);
    add(words.replace(/\s+/g, '-'), heading);
  }

  const rewrite = (fragment: string): string | null => {
    let wanted = fragment.slice(1);

    try {
      wanted = decodeURIComponent(wanted);
    } catch {
      // Matched as written.
    }

    wanted = wanted.toLowerCase();

    const heading = target.get(wanted) ?? target.get(wanted.replace(/^doc-/, ''));

    return heading ? `#${obsidianFragment(heading)}` : null;
  };

  /* `[text](#x)`, `[text](<#x>)` and `[text](#x "title")`, and a reference definition `[id]: #x`. */
  const inline = /(\]\(\s*)<?(#[^)\s>]+)>?((?:\s+"[^"]*")?\s*\))/g;
  const reference = /^(\s{0,3}\[[^\]]+\]:\s*)<?(#\S+?)>?(\s|$)/;

  const outsideCode = (line: string) =>
    line
      .split(/(`+[^`]*`+)/)
      .map((piece, index) =>
        index % 2 === 1
          ? piece
          : piece.replace(inline, (whole, open: string, fragment: string, close: string) => {
              const next = rewrite(fragment);

              return next ? `${open}${next}${close}` : whole;
            })
      )
      .join('');

  let fence: string | null = null;

  return markdown
    .split('\n')
    .map((line) => {
      const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];

      if (fence) {
        if (marker && marker[0] === fence[0] && marker.length >= fence.length) {
          fence = null;
        }

        return line;
      }

      if (marker) {
        fence = marker;

        return line;
      }

      const definition = reference.exec(line);

      if (definition) {
        const next = rewrite(definition[2]!);

        return next ? line.replace(definition[0], `${definition[1]}${next}${definition[3]}`) : line;
      }

      return outsideCode(line);
    })
    .join('\n');
}
