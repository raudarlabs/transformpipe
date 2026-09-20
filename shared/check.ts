import { Marked, type Token, type Tokens } from 'marked';
import { slugify } from './markdown.js';

/*
 * What is wrong with a document, without touching it.
 *
 * The converter's job ends at a faithful document; this is the question people ask next, and it is
 * a different one — "does the thing I have actually work". A link to a section that was renamed, an
 * image whose alt text nobody wrote, two headings competing for the same anchor: none of it stops a
 * conversion and all of it is broken by the time somebody else opens the file.
 *
 * Nothing here rewrites anything. A checker that quietly fixes what it finds is a checker nobody
 * can trust with a document they care about, and the fixes are one-line edits a person can make in
 * the source they are looking at. So this reports, with a line number, and stops.
 *
 * It reads the same Markdown the renderer does, through the same parser, which is the only way the
 * anchors it checks against are the anchors the document actually has. Regular expressions over the
 * source were the alternative and they cannot tell a link from a link inside a code fence.
 */

export type Problem =
  /** `[text](#section)` where no heading makes `#section`. */
  | 'dead-anchor'
  /** Two headings that want the same anchor, so one of them silently becomes `-1`. */
  | 'duplicate-anchor'
  /** `##` with nothing after it: an entry in the contents that says nothing. */
  | 'empty-heading'
  /** `![](picture.png)` — invisible to a screen reader, and to anyone whose images fail. */
  | 'missing-alt'
  /** `[](somewhere)` — a link with nothing to click. */
  | 'empty-link'
  /** `[text]()` — text dressed as a link that goes nowhere. */
  | 'empty-href';

export interface Finding {
  problem: Problem;
  /** 1-based, in the Markdown source, so the person reading the source can go straight there. */
  line: number;
  /** What was found — a heading's words, a link's target. Shown as written. */
  subject: string;
  /** The anchor a dead link should have been, where the checker can name one. */
  suggestion?: string;
}

/*
 * A parser of its own, deliberately.
 *
 * The renderer's instance carries the extensions that make maths, diagrams and footnotes — and a
 * `$` here is not the checker's business. This one is plain GitHub Markdown, which is the language
 * the links and headings it looks at are written in either way.
 */
const reader = new Marked({ gfm: true, breaks: false });

/** Every heading in the document, in order, with the anchor it will be given. */
function headings(tokens: Token[]): { text: string; id: string }[] {
  const used = new Map<string, number>();
  const found: { text: string; id: string }[] = [];

  const walk = (list: Token[]) => {
    for (const token of list) {
      if (token.type === 'heading') {
        const heading = token as Tokens.Heading;
        const text = plain(heading.tokens ?? []);

        found.push({ text, id: slugify(text, used) });

        continue;
      }

      const nested = (token as { tokens?: Token[] }).tokens;

      if (nested) walk(nested);
    }
  };

  walk(tokens);

  return found;
}

/** A token's words, with the markup dropped — what a heading is called, in a person's terms. */
function plain(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'text' || token.type === 'codespan') {
        return (token as Tokens.Text).text;
      }

      const nested = (token as { tokens?: Token[] }).tokens;

      return nested ? plain(nested) : '';
    })
    .join('')
    .trim();
}

/**
 * Everything wrong with a document, in the order it is written.
 *
 * The line number comes from where a token's own source sits in the document, found by walking the
 * blocks in order and keeping count — marked does not carry positions, and a search for the text
 * would land on the first of several identical links rather than on this one.
 */
export function checkDocument(markdown: string): Finding[] {
  const blocks = reader.lexer(markdown);

  /*
   * Both spellings of every anchor.
   *
   * This renderer prefixes an id with `doc-`, because a bare `id="title"` shadows
   * `document.title` and a browser's sanitiser drops exactly those. Nobody writes links that way:
   * a document written anywhere else says `[Setup](#setup)`, which is what GitHub makes. Checking
   * only against the prefixed form would have called every internal link in every ordinary
   * document dead, which is the kind of checker people switch off.
   */
  const anchors = new Set(
    headings(blocks).flatMap((heading) => [
      heading.id,
      heading.id.replace(/^doc-/, ''),
    ])
  );
  const findings: Finding[] = [];

  /* Two headings with the same words: the second quietly becomes `…-1`, which nobody links to. */
  const seen = new Map<string, number>();

  const lineAt = (at: number) =>
    markdown.slice(0, at).split('\n').length;

  const add = (
    problem: Problem,
    at: number,
    subject: string,
    suggestion?: string
  ) => {
    findings.push({ problem, line: lineAt(at), subject, suggestion });
  };

  /*
   * `within` is where this token's source begins. A nested token is found inside its parent's raw
   * rather than in the whole document, so the third `[here](#gone)` in a paragraph is reported on
   * its own line rather than on the first one's.
   */
  const walk = (tokens: Token[], within: number, scope: string) => {
    let cursor = 0;

    for (const token of tokens) {
      const raw = (token as { raw?: string }).raw ?? '';
      const at = raw ? scope.indexOf(raw, cursor) : -1;
      const start = at >= 0 ? within + at : within;

      if (at >= 0) cursor = at + raw.length;

      if (token.type === 'heading') {
        const heading = token as Tokens.Heading;
        const text = plain(heading.tokens ?? []);

        if (!text) {
          add('empty-heading', start, '#'.repeat(heading.depth));
        } else {
          const count = seen.get(text.toLowerCase()) ?? 0;

          seen.set(text.toLowerCase(), count + 1);

          if (count === 1) add('duplicate-anchor', start, text);
        }
      }

      if (token.type === 'image') {
        const image = token as Tokens.Image;

        if (!image.text.trim()) add('missing-alt', start, image.href);
      }

      if (token.type === 'link') {
        const link = token as Tokens.Link;
        const text = plain(link.tokens ?? []);

        if (!link.href.trim()) {
          add('empty-href', start, text);
        } else if (!text) {
          add('empty-link', start, link.href);
        } else if (link.href.startsWith('#') && !anchors.has(link.href.slice(1))) {
          /*
           * A near miss is worth naming: a link written before a heading was reworded is the
           * common case, and the anchor it wants is usually one edit away from one that exists.
           */
          const wanted = link.href.slice(1);

          add('dead-anchor', start, link.href, nearest(wanted, anchors));
        }
      }

      const nested = (token as { tokens?: Token[] }).tokens;

      if (nested) walk(nested, start, raw || scope);

      const rows = (token as Tokens.Table).rows;

      if (rows) {
        for (const row of rows) {
          for (const cell of row) walk(cell.tokens, start, raw || scope);
        }
      }

      const header = (token as Tokens.Table).header;

      if (header) {
        for (const cell of header) walk(cell.tokens, start, raw || scope);
      }

      const items = (token as Tokens.List).items;

      if (items) {
        for (const item of items) walk(item.tokens, start, raw || scope);
      }
    }
  };

  walk(blocks, 0, markdown);

  return findings.sort((one, other) => one.line - other.line);
}

/**
 * The anchor a dead link probably meant, or nothing.
 *
 * Only offered when it is close — one that shares most of its letters is a rename, and one that
 * does not is a guess. A wrong suggestion in a checker costs more than no suggestion, because
 * somebody will take it.
 */
function nearest(wanted: string, anchors: Set<string>): string | undefined {
  let best: string | undefined;
  let bestScore = 0;

  for (const anchor of anchors) {
    const score = overlap(wanted, anchor);

    if (score > bestScore) {
      bestScore = score;
      best = anchor;
    }
  }

  return bestScore >= 0.7 ? best : undefined;
}

/** How much of the shorter word the two share, by three-letter runs. */
function overlap(one: string, other: string): number {
  const runs = (word: string) => {
    const out = new Set<string>();

    for (let at = 0; at + 3 <= word.length; at += 1) out.add(word.slice(at, at + 3));

    return out;
  };

  const first = runs(one);
  const second = runs(other);

  if (first.size === 0 || second.size === 0) return one === other ? 1 : 0;

  let shared = 0;

  for (const run of first) if (second.has(run)) shared += 1;

  return shared / Math.min(first.size, second.size);
}
