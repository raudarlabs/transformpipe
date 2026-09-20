/*
 * Shared by the browser and the serverless function: the same parse, the same renderer overrides
 * and the same sanitiser settings run in both, or a document would look one way in the app and
 * another way to whoever it was sent to.
 *
 * Only the DOM differs. DOMPurify needs one, and the two runtimes get it from different places —
 * so each passes its own `sanitize` in, built from the shared config below.
 */
import { highlightCode } from './highlight.js';
import { rewriteWikilinks, stripFrontmatter } from './notes.js';
import katex from 'katex';
import { Marked, type Tokens } from 'marked';
import {
  mdDocPrintOverride,
  mdDocResponsiveTheme,
  mdDocTheme,
  MD_DOC_PAGE_STYLE,
  MD_DOC_STYLE,
} from './md-doc-css.js';

const marked = new Marked({
  gfm: true,
  breaks: false,
});

/**
 * TeX between dollars, rendered to MathML.
 *
 * MathML rather than KaTeX's own HTML, and the reason is the exported file. KaTeX's HTML output is
 * a stack of positioned spans that needs a 23 kB stylesheet and the best part of a megabyte of
 * fonts to mean anything; a document carrying those inline stops being a document. MathML needs
 * neither — every browser lays it out with its own maths font — so a formula survives being saved,
 * emailed and opened somewhere with no network, which is what this file promises everywhere else.
 *
 * It renders in both runtimes, which is the other half of the point: KaTeX runs in Node, so a
 * shared link and an API response carry the same formula the preview drew, with no second pass and
 * no browser involved.
 */
function renderMath(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, {
      output: 'mathml',
      displayMode: display,
      throwOnError: true,
      strict: false,
    });
  } catch {
    /*
     * Half-written TeX keeps its dollars and stays text — the same answer a broken mermaid fence
     * gets. KaTeX will happily render an error in red instead, and an error message in the middle
     * of a paragraph is worth less to whoever is still typing than the formula they typed.
     */
    return escapeHtml(display ? `$$${tex}$$` : `$${tex}$`);
  }
}

/**
 * Whether a run of text between two dollars is a formula or a sentence.
 *
 * "No space after the opening dollar, none before the closing one" — the rule every implementation
 * of this uses — is not enough on its own, and a page of ours proved it: *"It costs $5 to $10"
 * renders exactly as…* lost everything from the second dollar onwards to a formula, because the
 * second dollar opens cleanly and some dollar further along the line closes cleanly.
 *
 * So: strip the TeX out — commands and anything braced — and look at what is left. Real TeX is
 * operators and single letters once its commands are gone, because a bare word in maths renders as
 * its letters multiplied together and nobody writes that. Prose is words. Three letters in a row
 * that no backslash or brace accounts for means this is a sentence, and the dollars stay dollars.
 *
 * It errs toward text, which is the safe direction: a formula that does not render keeps its
 * source, the same fallback a fence that will not parse gets.
 */
function looksLikeMath(tex: string): boolean {
  let bare = tex.replace(/\\[a-zA-Z]+/g, ' ').replace(/\\./g, ' ');

  /* Innermost braces first, repeatedly, so `\\frac{a}{\\sqrt{b}}` empties out rather than stalling. */
  for (let pass = 0; pass < 8; pass += 1) {
    const next = bare.replace(/\{[^{}]*\}/g, ' ');

    if (next === bare) break;

    bare = next;
  }

  return !/[A-Za-z]{3}/.test(bare);
}

/*
 * The footnotes collected while one document is being parsed.
 *
 * Module state for something that is per-document, which is only safe because it is: `marked.parse`
 * runs synchronously here — `{ async: false }` — so one document is parsed start to finish before
 * another begins, and `renderMarkdown` resets this on the way in. The alternative, threading a
 * context through marked's extension API, is not offered by that API.
 */
let notes: { order: string[]; text: Map<string, string> } | null = null;

/** A footnote's id, made safe for an `id=` and prefixed like every other anchor in a document. */
function slugifyNote(id: string): string {
  return id.toLowerCase().replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '') || 'n';
}

/**
 * GitHub's five alert kinds, and the Obsidian callouts that mean the same thing.
 *
 * Obsidian ships a dozen more names than GitHub does, and a document written in one is read in the
 * other often enough that mapping them is worth more than rendering `[!success]` as literal text.
 * Anything not on this list stays an ordinary quote, which is what it looks like anyway.
 */
const ALERTS: Record<string, { kind: string; label: string }> = {
  note: { kind: 'note', label: 'Note' },
  info: { kind: 'note', label: 'Note' },
  abstract: { kind: 'note', label: 'Note' },
  summary: { kind: 'note', label: 'Note' },
  quote: { kind: 'note', label: 'Note' },
  tip: { kind: 'tip', label: 'Tip' },
  hint: { kind: 'tip', label: 'Tip' },
  success: { kind: 'tip', label: 'Tip' },
  check: { kind: 'tip', label: 'Tip' },
  done: { kind: 'tip', label: 'Tip' },
  example: { kind: 'tip', label: 'Tip' },
  important: { kind: 'important', label: 'Important' },
  question: { kind: 'important', label: 'Important' },
  help: { kind: 'important', label: 'Important' },
  faq: { kind: 'important', label: 'Important' },
  todo: { kind: 'important', label: 'Important' },
  warning: { kind: 'warning', label: 'Warning' },
  attention: { kind: 'warning', label: 'Warning' },
  caution: { kind: 'caution', label: 'Caution' },
  danger: { kind: 'caution', label: 'Caution' },
  error: { kind: 'caution', label: 'Caution' },
  failure: { kind: 'caution', label: 'Caution' },
  bug: { kind: 'caution', label: 'Caution' },
  missing: { kind: 'caution', label: 'Caution' },
};

/*
 * Registered once, on the instance, rather than inside the render call.
 *
 * `use` appends tokenizers to an array; calling it per render would add another pair of them per
 * converted document and walk every one of them at every position in the source.
 */
marked.use({
  extensions: [
    {
      name: 'mathBlock',
      level: 'block',
      start(src: string) {
        return src.indexOf('$$');
      },
      tokenizer(src: string) {
        const match = /^\$\$([\s\S]+?)\$\$(?:\n+|$)/.exec(src);

        if (!match) return undefined;

        return {
          type: 'mathBlock',
          raw: match[0],
          text: match[1].trim(),
        };
      },
      renderer(token: Tokens.Generic) {
        return `<div class="md-math">${renderMath(String(token.text), true)}</div>\n`;
      },
    },
    {
      /*
       * `[^1]: the note` — a footnote's text, taken out of the flow and kept for the end.
       *
       * The raw includes the indented continuation lines, so a footnote can be a paragraph rather
       * than a sentence, which is what people write them as.
       */
      name: 'footnoteDef',
      level: 'block',
      start(src: string) {
        return src.search(/^\[\^[^\]\s]+\]:/m);
      },
      tokenizer(src: string) {
        const match = /^\[\^([^\]\s]+)\]:[ \t]*([^\n]*(?:\n(?:[ \t]+[^\n]*|[ \t]*))*)/.exec(
          src
        );

        if (!match) return undefined;

        if (notes) {
          const id = match[1];

          if (!notes.text.has(id)) notes.order.push(id);

          notes.text.set(id, match[2].replace(/\n[ \t]+/g, ' ').trim());
        }

        return { type: 'footnoteDef', raw: match[0], text: '' };
      },
      renderer() {
        /* Nothing here: the note is printed once, at the end, in the order it was referenced. */
        return '';
      },
    },
    {
      /* `[^1]` in a sentence — the marker that points at it. */
      name: 'footnoteRef',
      level: 'inline',
      start(src: string) {
        return src.indexOf('[^');
      },
      /*
       * A marker only counts when there is a note under it.
       *
       * marked lexes every block before it parses any inline content, so by the time this runs the
       * definitions are all in hand — which means the question can be asked. Without it, writing
       * `[^1]` in a sentence *about* footnotes produced a superscript and an empty note at the
       * foot of the page, which is what happened to a changelog entry describing this very
       * feature. Nothing to define means nothing to refer to, and the brackets stay brackets.
       */
      tokenizer(src: string) {
        const match = /^\[\^([^\]\s]+)\]/.exec(src);

        if (!match || !notes?.text.has(match[1])) return undefined;

        const id = match[1];

        if (!notes.order.includes(id)) notes.order.push(id);

        return { type: 'footnoteRef', raw: match[0], text: id };
      },
      renderer(token: Tokens.Generic) {
        const id = String(token.text);
        const at = (notes?.order.indexOf(id) ?? 0) + 1;
        const slug = slugifyNote(id);

        return `<sup class="md-fnref" id="doc-fnref-${slug}"><a href="#doc-fn-${slug}">${at}</a></sup>`;
      },
    },
    {
      /* `==marked==`, Obsidian's highlight. `mark` was already on the allow-list. */
      name: 'markHighlight',
      level: 'inline',
      start(src: string) {
        return src.indexOf('==');
      },
      tokenizer(src: string) {
        const match = /^==(?!\s)([\s\S]+?)(?<!\s)==/.exec(src);

        if (!match) return undefined;

        return { type: 'markHighlight', raw: match[0], text: match[1] };
      },
      renderer(token: Tokens.Generic) {
        return `<mark>${escapeHtml(String(token.text))}</mark>`;
      },
    },
    {
      /*
       * `H~2~O` and `x^2^`, Pandoc's subscript and superscript.
       *
       * The subscript is a correction as much as an addition: a single tilde was being read as
       * strikethrough, so a chemical formula came out with a line through the number.
       */
      name: 'subscript',
      level: 'inline',
      start(src: string) {
        return src.indexOf('~');
      },
      tokenizer(src: string) {
        const match = /^~(?![~\s])([^~\s]+)~(?!~)/.exec(src);

        if (!match) return undefined;

        return { type: 'subscript', raw: match[0], text: match[1] };
      },
      renderer(token: Tokens.Generic) {
        return `<sub>${escapeHtml(String(token.text))}</sub>`;
      },
    },
    {
      name: 'superscript',
      level: 'inline',
      start(src: string) {
        return src.indexOf('^');
      },
      tokenizer(src: string) {
        const match = /^\^(?![\^\s])([^\^\s]+)\^/.exec(src);

        if (!match) return undefined;

        return { type: 'superscript', raw: match[0], text: match[1] };
      },
      renderer(token: Tokens.Generic) {
        return `<sup>${escapeHtml(String(token.text))}</sup>`;
      },
    },
    {
      /*
       * `\\[ … \\]`, LaTeX's own display delimiters, and inline rather than block on purpose.
       *
       * They almost never begin a block. What people write is a sentence introducing the formula
       * and the delimiter on the next line with no blank line between — which Markdown reads as
       * one paragraph, so a block-level tokenizer never sees it. As an inline token it is found
       * wherever it turns up, and the span below is display-styled by the stylesheet.
       */
      name: 'mathBracket',
      level: 'inline',
      start(src: string) {
        return src.indexOf('\\[');
      },
      tokenizer(src: string) {
        const match = /^\\\[([\s\S]+?)\\\]/.exec(src);

        if (!match || !looksLikeMath(match[1])) return undefined;

        return { type: 'mathBracket', raw: match[0], text: match[1].trim() };
      },
      renderer(token: Tokens.Generic) {
        return `<span class="md-math">${renderMath(String(token.text), true)}</span>`;
      },
    },
    {
      /* `\\( … \\)`, the inline pair. Unambiguous: nobody escapes a bracket this way in prose. */
      name: 'mathParen',
      level: 'inline',
      start(src: string) {
        return src.indexOf('\\(');
      },
      tokenizer(src: string) {
        const match = /^\\\(([\s\S]+?)\\\)/.exec(src);

        if (!match || !looksLikeMath(match[1])) return undefined;

        return { type: 'mathParen', raw: match[0], text: match[1].trim() };
      },
      renderer(token: Tokens.Generic) {
        return renderMath(String(token.text), false);
      },
    },
    {
      /*
       * A bare `\\begin{equation}` and its relatives, handed to KaTeX whole.
       *
       * KaTeX knows these environments, so the delimiters are the environment itself and there is
       * nothing to strip. No plausibility guard either: `\\begin{align}` in running prose is not a
       * thing that happens by accident.
       */
      name: 'mathEnv',
      level: 'inline',
      start(src: string) {
        return src.indexOf('\\begin{');
      },
      tokenizer(src: string) {
        const match =
          /^\\begin\{(equation|align|alignat|gather|multline|flalign|eqnarray|CD)(\*?)\}([\s\S]+?)\\end\{\1\2\}/.exec(
            src
          );

        if (!match) return undefined;

        return { type: 'mathEnv', raw: match[0], text: match[0] };
      },
      renderer(token: Tokens.Generic) {
        return `<span class="md-math">${renderMath(String(token.text), true)}</span>`;
      },
    },
    {
      name: 'mathInline',
      level: 'inline',
      start(src: string) {
        return src.indexOf('$');
      },
      /*
       * What stops `$5 and $10` becoming a formula: no space after the opening dollar, none before
       * the closing one, and no digit straight after it. Prices are written with the space in
       * exactly the place TeX never puts one.
       */
      tokenizer(src: string) {
        const match = /^\$(?![\s$])((?:\\.|[^$\\])+?)(?<![\s\\])\$(?!\d)/.exec(src);

        if (!match || !looksLikeMath(match[1])) return undefined;

        return {
          type: 'mathInline',
          raw: match[0],
          text: match[1],
        };
      },
      renderer(token: Tokens.Generic) {
        return renderMath(String(token.text), false);
      },
    },
  ],
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A slug for each heading, so a document stays linkable — prefixed on purpose.
 *
 * A bare `id="title"` is a DOM-clobbering risk (it shadows `document.title`), and the browser's
 * sanitiser drops exactly those while a server-side parser keeps them. The prefix removes the
 * hazard, which is also what keeps both renderers producing the same document.
 */
export function slugify(text: string, used: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-') || 'section';

  const seen = used.get(base) ?? 0;
  used.set(base, seen + 1);

  return `doc-${seen === 0 ? base : `${base}-${seen}`}`;
}

/**
 * What survives sanitising: exactly what this converter can produce, and nothing else.
 *
 * The list lives here because the two runtimes sanitise with different tools — DOMPurify against
 * the browser's own DOM, a parser in the function — and the one thing that must not drift between
 * them is what a document is allowed to contain. A DOM-based sanitiser was tried on the server
 * first: without a real DOM, DOMPurify quietly returns its input unchanged, script tag and all.
 */
export const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr', 'div', 'span',
  'strong', 'b', 'em', 'i', 'del', 's', 'mark', 'sub', 'sup', 'small',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'kbd', 'samp',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'a', 'img', 'input',
  /*
   * MathML, which is what a `$…$` becomes. A long list for one feature, and still the cheap
   * option: the vocabulary is inert — it has no event attributes, no URLs and nothing that
   * executes — where the alternative was allowing `style` on everything so KaTeX could position
   * its spans.
   */
  'math', 'semantics', 'annotation', 'mrow', 'mi', 'mn', 'mo', 'ms', 'mtext',
  'mspace', 'msup', 'msub', 'msubsup', 'mfrac', 'msqrt', 'mroot', 'munder',
  'mover', 'munderover', 'mmultiscripts', 'mprescripts', 'none', 'mtable',
  'mtr', 'mtd', 'mlabeledtr', 'mpadded', 'mphantom', 'menclose', 'mstyle',
  'merror', 'mglyph',
];

export const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'id', 'class', 'align',
  'target', 'rel', 'type', 'checked', 'disabled', 'colspan', 'rowspan',
  /* MathML's own. `xmlns` is the one that decides whether a browser treats `math` as maths. */
  'xmlns', 'display', 'displaystyle', 'scriptlevel', 'mathvariant', 'mathsize',
  'encoding', 'stretchy', 'symmetric', 'fence', 'separator', 'accent',
  'accentunder', 'largeop', 'movablelimits', 'form', 'minsize', 'maxsize',
  'linethickness', 'notation', 'lspace', 'rspace', 'voffset', 'width',
  'height', 'depth', 'columnalign', 'columnspacing', 'columnlines',
  'rowspacing', 'rowlines',
];

export type Sanitize = (html: string) => string;

/** Markdown -> sanitized HTML fragment (no <html> wrapper). */
export function renderMarkdown(markdown: string, sanitize: Sanitize): string {
  const used = new Map<string, number>();

  notes = { order: [], text: new Map() };

  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        /*
         * Tags out, then entities back to characters, then slugify.
         *
         * In that order, because the text arriving here is already HTML: a heading reading
         * Why "it converts Markdown" tells you nothing has its quotes as `&quot;` by now, and
         * slugifying that leaves `quotit-converts-markdownquot` in the middle of the anchor —
         * which is the URL somebody copies to point at the section.
         */
        const plain = text
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
        const id = slugify(plain, used);

        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      /*
       * A ```mermaid fence, marked for the browser and left readable for everything else.
       *
       * Mermaid measures text to lay a diagram out, which needs a real DOM — so nothing is drawn
       * here. What this emits is the code block marked would have emitted anyway, wearing a class,
       * so the shared page, the API and any runtime without mermaid keep showing the diagram's
       * source rather than a blank. The browser swaps it for the picture once it has drawn one.
       *
       * `false` hands every other fence back to marked's own renderer: this file has no business
       * owning the markup for code blocks in general.
       */
      code({ text, lang }) {
        const info = (lang ?? '').trim().split(/\s+/)[0].toLowerCase();

        if (info === 'mermaid') {
          return `<pre class="md-mermaid"><code class="language-mermaid">${escapeHtml(text)}</code></pre>\n`;
        }

        const lit = info ? highlightCode(text, info) : null;

        /* An unknown language, or none at all, is marked's own code block and always was. */
        if (!lit) return false;

        return `<pre><code class="hljs language-${escapeHtml(info)}">${lit}</code></pre>\n`;
      },
      /*
       * `> [!NOTE]` and its relatives — an alert, not a quote.
       *
       * GitHub renders five of these and Obsidian a dozen more under the name "callout", and both
       * are common enough in the documents this converts that leaving `[!WARNING]` sitting as text
       * at the top of a quote reads as a converter that did not know what it was looking at.
       *
       * The first line of the quote is replaced rather than parsed as markup: whatever follows the
       * marker on that line is the writer's own title for the box, which Obsidian allows and
       * GitHub ignores.
       */
      blockquote({ tokens }) {
        const first = tokens[0];
        const opener =
          first?.type === 'paragraph' && typeof first.raw === 'string'
            ? /^\[!([A-Za-z]+)\][ \t]*([^\n]*)/.exec(first.raw.trim())
            : null;
        const alert = opener ? ALERTS[opener[1].toLowerCase()] : undefined;

        if (!opener || !alert) return false;

        const rest = first.raw.trim().slice(opener[0].length).replace(/^\r?\n/, '');
        const body = this.parser.parse([
          ...(rest ? marked.lexer(rest) : []),
          ...tokens.slice(1),
        ]);
        const title = opener[2].trim() || alert.label;

        return `<blockquote class="md-alert md-alert-${alert.kind}"><p class="md-alert-title">${escapeHtml(title)}</p>\n${body}</blockquote>\n`;
      },
      /*
       * A table in a box that scrolls, rather than a table squeezed into the column.
       *
       * `max-width: 100%` on the table itself does not hold the columns apart — it makes the table
       * layout shrink them, and a ten-column compatibility table in a side panel came out one
       * letter per line. The wrapper takes the width limit and the overflow, and the table inside
       * it keeps the width its content needs. The same bargain a diagram gets.
       */
      table(token) {
        const rendered = this.parser.renderer.constructor.prototype.table.call(
          this,
          token
        );

        return `<div class="md-table">${rendered}</div>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const targetAttr = /^https?:\/\//i.test(href)
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';

        return `<a href="${escapeHtml(href)}"${titleAttr}${targetAttr}>${text}</a>`;
      },
    },
  });

  /*
   * Two rewrites before the parser sees any of it, both of them about a note that came out of
   * somewhere else: the properties block at the top, and the double-bracket links through the
   * prose. `notes.ts` explains why both are dropped rather than shown.
   */
  const source = rewriteWikilinks(stripFrontmatter(markdown));
  const body = marked.parse(source, { async: false }) as string;
  const collected = notes;

  notes = null;

  return sanitize(body + footnoteSection(collected));
}

/** The notes themselves, once, at the end, numbered in the order the document referred to them. */
function footnoteSection(collected: typeof notes): string {
  if (!collected || collected.order.length === 0) return '';

  const items = collected.order
    .map((id, index) => {
      const slug = slugifyNote(id);
      /* Only a defined note reaches this list now, so there is always something to print. */
      const inner = marked.parseInline(collected.text.get(id) ?? '', {
        async: false,
      }) as string;

      return `<li id="doc-fn-${slug}">${inner} <a href="#doc-fnref-${slug}" class="md-fnback">\u21a9</a></li>`;
    })
    .join('\n');

  return `<hr class="md-fnrule">\n<ol class="md-footnotes">\n${items}\n</ol>\n`;
}

interface StandaloneOptions {
  title: string;
  body: string;
  createdAt?: number;
  /** Matches whatever the preview is showing, so the file looks like what was seen. */
  theme?: 'dark' | 'light';
}

/**
 * Wraps the converted fragment into a self-contained .html file: styles are
 * inlined, no build step needed, prints cleanly.
 */
export function buildStandaloneHtml({
  title,
  body,
  createdAt = Date.now(),
  theme = 'dark',
}: StandaloneOptions): string {
  const stamp = new Date(createdAt).toLocaleString();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="${theme}">
<title>${escapeHtml(title)}</title>
<!--
  No font link, deliberately. This file is the deliverable: it gets emailed, dropped on a share, and
  opened on a machine with no network, and until recently it asked Google for DM Sans on the way —
  which made "self-contained, no requests" false in the one place it was promised loudest, and left
  a document that phoned home every time somebody opened it. The stack below falls back through
  ui-sans-serif to the system face, which costs a typeface and buys back the promise.
-->
<style>
${mdDocTheme(theme, ':root, .md-doc')}
${mdDocPrintOverride(':root, .md-doc')}
${MD_DOC_PAGE_STYLE}
${MD_DOC_STYLE}
</style>
</head>
<body>
<article class="md-page md-doc">
${body}
</article>
<p class="md-footer">${escapeHtml(title)} · converted ${escapeHtml(stamp)} · <a href="https://transformpipe.com/?from=file">made with TransformPipe</a></p>
</body>
</html>
`;
}

/*
 * The card above a shared document: what the document is, and the two things to do with it.
 *
 * It matches the one the app puts above a document it has just converted — the name, what it
 * weighs, when it was made, what is in it, and the actions on the right — because it is the same
 * object and a reader who has seen one should recognise the other. What it cannot match is the
 * behaviour: this page runs no script, so the actions are links, and "save this to your account"
 * is a link into the app, which knows how to ask somebody to sign in.
 */
const SHARED_CHROME_STYLE = `
.md-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  box-sizing: border-box;
  max-width: 48rem;
  margin: 0 auto 1.25rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--md-stroke);
  border-radius: 0.875rem;
  background: var(--md-card);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 0.8125rem;
  color: var(--md-secondary);
}

.md-bar .doc {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.md-bar .doc-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.md-bar .doc-name .name {
  font-weight: 600;
  color: var(--md-ink);
  font-size: 0.9375rem;
}

.md-bar .badge {
  flex: none;
  padding: 0.05rem 0.5rem;
  border: 1px solid var(--md-stroke);
  border-radius: 999px;
  font-size: 0.6875rem;
  white-space: nowrap;
}

.md-bar .doc-meta { font-size: 0.75rem; }

.md-bar .doc-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.1rem 0.9rem;
  font-size: 0.75rem;
}

.md-bar .doc-stats b { color: var(--md-ink); font-weight: 600; }

.md-bar .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: auto;
}

/*
 * Monospace, like the wordmark in the app.
 *
 * This bar is set in DM Sans, and the long form of the mark tolerated that because it read as a
 * word with a caret in it. The short form is half punctuation, and a proportional font renders the
 * caret as something someone forgot to delete.
 */
.md-bar .brand {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-weight: 600;
  color: var(--md-ink);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.md-bar .brand span { color: var(--md-brand-3); }

.md-bar .name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-bar .keep,
.md-bar .save {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--md-stroke);
  border-radius: 999px;
  color: var(--md-ink);
  text-decoration: none;
  white-space: nowrap;
}

.md-bar .keep:hover,
.md-bar .save:hover { border-color: var(--md-brand-3); color: var(--md-brand-3); }

/* The one thing this page wants a stranger to do, so it is the one thing that is painted. */
.md-bar .save {
  border-color: transparent;
  background: var(--md-brand);
  color: #ffffff;
}

.md-bar .save:hover { background: var(--md-brand-2); border-color: transparent; color: #ffffff; }

@media print { .md-bar { display: none; } }

/*
 * Back to the top of a long document — a link, not a button.
 *
 * This page carries somebody else's content and is served with script-src 'none', which is the
 * one thing standing between an injection that survived the sanitiser and a page that runs it. So
 * the control is an anchor to the top of the document and nothing else. It is rendered only when
 * the document is long enough to need it, which the server knows because it has the document.
 */
.md-top {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--md-stroke);
  border-radius: 999px;
  background: var(--md-card-2);
  color: var(--md-ink);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 1.125rem;
  line-height: 1;
  text-decoration: none;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
}

.md-top:hover { border-color: var(--md-brand-3); color: var(--md-brand-3); }

.md-top:focus-visible { outline: 2px solid var(--md-brand-3); outline-offset: 2px; }

@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}

@media print { .md-top { display: none; } }

/*
 * The one thing this page is for, after the document: telling the person reading it what made it.
 *
 * A shared link is the only page of this product a stranger reliably sees, and until this block
 * existed it ended at a footer — somebody read a colleague's document, liked it enough to wonder,
 * and had a wordmark in the corner to go on. No script, like the rest of the page: two links.
 */
.md-cta {
  box-sizing: border-box;
  max-width: 48rem;
  margin: 2.5rem auto 3rem;
  padding: 1.5rem;
  border: 1px solid var(--md-stroke);
  border-radius: 0.875rem;
  background: var(--md-card-2);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--md-secondary);
}

.md-cta h2 {
  margin: 0 0 0.35rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--md-ink);
}

.md-cta p {
  margin: 0;
  max-width: 54ch;
  font-size: 0.9375rem;
  line-height: 1.55;
}

.md-cta ul {
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  font-size: 0.8125rem;
}

.md-cta li::before {
  content: "✓";
  margin-right: 0.4rem;
  color: var(--md-brand-3);
}

.md-cta .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.25rem;
}

.md-cta .go,
.md-cta .also {
  display: inline-block;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.md-cta .go {
  background: var(--md-brand);
  color: #ffffff;
}

.md-cta .go:hover { background: var(--md-brand-2); }

.md-cta .also {
  border: 1px solid var(--md-stroke);
  color: var(--md-ink);
}

.md-cta .also:hover { border-color: var(--md-brand-3); color: var(--md-brand-3); }

.md-cta a:focus-visible { outline: 2px solid var(--md-brand-3); outline-offset: 2px; }

@media print { .md-cta { display: none; } }
`;

interface SharedPageOptions {
  title: string;
  body: string;
  createdAt?: number;
  /** Where the Download link points; omitted for a page nobody should save from. */
  downloadHref?: string;
  /** Where a reader can say this document should not be here. */
  reportHref?: string;
  /** The document in the app, where somebody signed in can keep a copy of it. */
  openHref?: string;
  /** Bytes of Markdown, as the app counts them. */
  size?: number;
  /** The counts the app shows under a document's name. Only the three that fit are used. */
  stats?: { words?: number; headings?: number; tables?: number };
}

/**
 * The page a share link opens.
 *
 * Rendered here rather than in the browser: a link is opened by people who have no reason to wait
 * for an app to boot, and a page built on the server can be handed to the CDN, which is what keeps
 * a popular document off the database entirely.
 */
/*
 * Is this document long enough that a scroll-to-top link earns its place?
 *
 * Characters of rendered HTML, because that is what this function has, and the number comes from
 * measuring rather than taste: rendered at 1280x900 this page passes a viewport plus a scroll of
 * 320px at about 1,240 characters, and at 390x844 at about 940. 1,200 is where a reader is far
 * enough down for the link to be the shortest way back, and below it the page barely moves.
 *
 * Pictures break the proxy — a few of them make a very tall page out of very little markup — so
 * they count separately.
 */
function worthAScrollLink(body: string): boolean {
  return body.length > 1200 || (body.match(/<img\b/g)?.length ?? 0) >= 3;
}

/** `39 words`, `1 heading` — English, like the rest of this page, and skipped when it is zero. */
const count = (n: number | undefined, noun: string): string =>
  n && n > 0
    ? `<span><b>${n.toLocaleString('en-GB')}</b> ${noun}${n === 1 ? '' : 's'}</span>`
    : '';

/** Bytes, in the same words the app uses for them. */
const weigh = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} kB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function buildSharedPage({
  title,
  body,
  createdAt = Date.now(),
  downloadHref,
  reportHref,
  openHref,
  size,
  stats,
}: SharedPageOptions): string {
  const stamp = new Date(createdAt).toISOString().slice(0, 10);
  const counts = [
    count(stats?.words, 'word'),
    count(stats?.headings, 'heading'),
    count(stats?.tables, 'table'),
  ]
    .filter(Boolean)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
<style>
${mdDocResponsiveTheme(':root, .md-doc')}
${mdDocPrintOverride(':root, .md-doc')}
${MD_DOC_PAGE_STYLE}
${MD_DOC_STYLE}
${SHARED_CHROME_STYLE}
</style>
</head>
<body id="md-top-of-page">
<div class="md-bar">
  <a class="brand" href="/">T<span>&gt;</span>pipe</a>
  <div class="doc">
    <div class="doc-name">
      <span class="name">${escapeHtml(title)}</span>
      <span class="badge">shared</span>
    </div>
    <div class="doc-meta">${size ? `${weigh(size)} · ` : ''}converted ${escapeHtml(stamp)}</div>
    ${counts ? `<div class="doc-stats">${counts}</div>` : ''}
  </div>
  <div class="actions">
    ${openHref ? `<a class="save" href="${escapeHtml(openHref)}">Save to your account</a>` : ''}
    ${downloadHref ? `<a class="keep" href="${escapeHtml(downloadHref)}">Download .html</a>` : ''}
  </div>
</div>
<article class="md-page md-doc">
${body}
</article>
<p class="md-footer">Shared document · converted ${escapeHtml(stamp)}${
    reportHref
      ? ` · <a href="${escapeHtml(reportHref)}">Report this document</a>`
      : ''
  }</p>
<section class="md-cta">
  <h2>This page was made with TransformPipe</h2>
  <p>A web page, a Word file, a PDF, a spreadsheet or Markdown, turned into a clean document you can
  read, download or share as a link like this one. The conversion runs in your browser — the file
  never leaves it.</p>
  <ul>
    <li>Ten formats, no upload</li>
    <li>Free, and no account to try it</li>
    <li>An account keeps and shares them</li>
  </ul>
  <p class="actions">
    <a class="go" href="/?from=shared">Convert a file — free</a>
    <a class="also" href="/history?from=shared">Keep your documents in an account</a>
  </p>
</section>
${
    worthAScrollLink(body)
      ? '<a class="md-top" href="#md-top-of-page" aria-label="Back to the top" title="Back to the top">↑</a>'
      : ''
  }
</body>
</html>
`;
}

/** A dead end that still looks like the product rather than a platform error. */
export function buildNoticePage(title: string, message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap" rel="stylesheet">
<style>
${mdDocResponsiveTheme(':root')}
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  background: var(--md-page);
  color: var(--md-secondary);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
h1 { margin: 0; font-size: 1.25rem; color: var(--md-ink); }
p { margin: 0; max-width: 34ch; }
a { color: var(--md-brand-3); }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<p><a href="/">Convert your own file</a></p>
</body>
</html>
`;
}

/** The form a reader fills in to say a shared document should not be here. */
export function buildReportPage(token: string, problem?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<title>Report a document</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap" rel="stylesheet">
<style>
${mdDocResponsiveTheme(':root')}
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-content: center;
  padding: 2rem 1.25rem;
  background: var(--md-page);
  color: var(--md-secondary);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(30rem, 100%);
  padding: 1.75rem;
  border: 1px solid var(--md-stroke);
  border-radius: 1rem;
  background: var(--md-card);
}
h1 { margin: 0; font-size: 1.125rem; color: var(--md-ink); }
p { margin: 0; font-size: 0.875rem; }
label { font-size: 0.8125rem; color: var(--md-secondary); }
textarea, input {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--md-stroke);
  border-radius: 0.5rem;
  background: var(--md-page);
  color: var(--md-ink);
  font: inherit;
  font-size: 0.875rem;
  box-sizing: border-box;
}
textarea { min-height: 7rem; resize: vertical; }
button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--md-brand);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.problem { color: #b91c1c; font-size: 0.8125rem; }
</style>
</head>
<body>
<form method="post" action="/report/${escapeHtml(token)}">
  <h1>Report this document</h1>
  <p>Tell us what is wrong with it — impersonation, a scam, someone else's private file.</p>
  ${problem ? `<p class="problem">${escapeHtml(problem)}</p>` : ''}
  <label for="reason">What is wrong</label>
  <textarea id="reason" name="reason" required></textarea>
  <label for="reporter">Your email, if you want an answer (optional)</label>
  <input id="reporter" name="reporter" type="email" autocomplete="email">
  <button type="submit">Send report</button>
</form>
</body>
</html>
`;
}

/** Rough document stats shown next to the preview. */
export function getDocStats(markdown: string, html: string) {
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const headings = (html.match(/<h[1-6][\s>]/g) ?? []).length;
  const links = (html.match(/<a\s/g) ?? []).length;
  const codeBlocks = (html.match(/<pre[\s>]/g) ?? []).length;
  const tables = (html.match(/<table[\s>]/g) ?? []).length;
  const images = (html.match(/<img[\s>]/g) ?? []).length;

  return { words, headings, links, codeBlocks, tables, images };
}
