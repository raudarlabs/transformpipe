import type { Token, Tokens } from 'marked';
import { alertOf, lexMarkdown } from './markdown.js';
import { collectHeadings, decodeEntities, isWebAddress, unwrap, type Headings } from './to-markup.js';

/*
 * Markdown as Jira wiki markup — `h2.`, `*bold*`, `{code:java}`, `||head||`.
 *
 * What Jira Data Center's text mode, its REST API's version 2 and every automation rule that writes
 * a description or a comment read. It looks like Markdown's cousin and is not one: `*` is bold
 * rather than italic, `-` is a strikethrough, a list is `*` or `#` repeated rather than indented,
 * and a newline inside a paragraph is a line break — so Markdown pasted in as it is comes out with
 * the wrong words emphasised and the paragraphs broken at every place the source was wrapped.
 *
 * The part that takes care is the escaping. Jira reads a mark only at the edge of a word, so most
 * asterisks and hyphens in prose are safe as they are, and backslashing every one would fill the
 * text with them; what is escaped is what Jira would actually act on: brackets and braces always,
 * a mark at the edge of a word, an emoticon like `(i)`, and a line that would start a list.
 */

/** The `{code}` macro's names for languages. Anything else goes out as `{noformat}`. */
const LANGUAGES: Record<string, string> = {
  actionscript: 'actionscript', ada: 'ada', applescript: 'applescript',
  bash: 'bash', sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash',
  c: 'c', h: 'c',
  'c#': 'c#', csharp: 'c#', cs: 'c#',
  cpp: 'cpp', 'c++': 'cpp', hpp: 'cpp',
  css: 'css', scss: 'css', sass: 'css',
  erlang: 'erlang', erl: 'erlang',
  go: 'go', golang: 'go',
  groovy: 'groovy', haskell: 'haskell', hs: 'haskell',
  html: 'html', xhtml: 'html',
  java: 'java',
  javascript: 'javascript', js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  typescript: 'javascript', ts: 'javascript', tsx: 'javascript',
  json: 'json',
  lua: 'lua',
  objc: 'objc', 'objective-c': 'objc', objectivec: 'objc',
  perl: 'perl', pl: 'perl',
  php: 'php',
  python: 'python', py: 'python',
  r: 'r',
  ruby: 'ruby', rb: 'ruby',
  scala: 'scala',
  sql: 'sql',
  swift: 'swift',
  vb: 'visualbasic', vbnet: 'visualbasic', visualbasic: 'visualbasic',
  xml: 'xml', svg: 'xml',
  yaml: 'yaml', yml: 'yaml',
};

/** GitHub's alerts as panels, coloured the way Atlassian colours its own. */
const PANELS: Record<string, string> = {
  note: '#DEEBFF',
  important: '#EAE6FF',
  tip: '#E3FCEF',
  warning: '#FFFAE6',
  caution: '#FFEBE6',
};

/** Jira's emoticons — `(i)`, `(/)`, `:)` and the rest — which it draws as pictures wherever they turn up. */
const EMOTICON = /\((?:i|\/|x|!|\?|\+|-|\*|y|n|on|off|flag|flagoff)\)|[:;]-?[)(PpDd]/g;

const MARKS = '*_+\\-^~?';
const WORD = /[\p{L}\p{N}]/u;

/**
 * Text, made to mean only itself.
 *
 * `{`, `}`, `[`, `]` and `|` are always escaped: each opens a macro, a link or a table cell
 * wherever it stands. A mark — `*` `_` `+` `-` `^` `~` `?` — is escaped only where Jira would read
 * it: touching a word on one side and not the other, which is the shape of the start or end of
 * emphasis. `e-mail` and `a - b` stay as they are.
 */
function escapeText(raw: string): string {
  const text = decodeEntities(raw);
  let out = '';

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    /*
     * Not the backslash itself: Jira has no way to write a literal one, and `\\\\` — the only
     * candidate — is its forced line break. A lone backslash in prose shows as itself.
     */
    if ('{}[]|!'.includes(char)) {
      // `!` only matters where it could open a picture: followed by something that is not a space.
      if (char === '!' && !/\S/.test(text[index + 1] ?? '')) {
        out += char;
      } else {
        out += `\\${char}`;
      }

      continue;
    }

    if (MARKS.includes(char)) {
      const before = text[index - 1] ?? ' ';
      const after = text[index + 1] ?? ' ';
      const spaceBefore = /\s/.test(before);
      const spaceAfter = /\s/.test(after);

      if (spaceBefore !== spaceAfter && (WORD.test(before) || WORD.test(after) || spaceBefore)) {
        out += `\\${char}`;
        continue;
      }
    }

    out += char;
  }

  return out.replace(EMOTICON, (match) => `\\${match}`);
}

/** Whether a character sits against a mark so that Jira would not see the mark at all. */
const wordy = (char: string | undefined) => Boolean(char && WORD.test(char));

class Writer {
  private footnoteNumbers = new Map<string, number>();
  private headingIndex = 0;
  private inQuote = false;

  constructor(private headings: Headings, footnotes: Array<{ id: string }>) {
    footnotes.forEach((note, index) => this.footnoteNumbers.set(note.id, index + 1));
  }

  inline(tokens: Token[] | undefined): string {
    const list = tokens ?? [];
    let out = '';

    list.forEach((token, index) => {
      const before = out.slice(-1);
      const next = list[index + 1];
      const after = next ? String((next as { raw?: string }).raw ?? '').charAt(0) : undefined;

      out += this.inlineOne(token, before, after);
    });

    return out;
  }

  /**
   * A mark around some words, in the form Jira will read where it stands.
   *
   * `*bold*` only counts at the edge of a word, so Markdown's `**un**believable` would come out
   * with its asterisks showing. Jira's braced form, `{*}un{*}believable`, works anywhere, and is
   * used only where the plain one would not — it is uglier to read in the source.
   */
  private mark(sign: string, inner: string, before: string, after: string | undefined): string {
    const lead = inner.match(/^\s*/)?.[0] ?? '';
    const trail = inner.match(/\s*$/)?.[0] ?? '';
    const words = inner.trim();

    if (!words) return inner;

    const braced = wordy(before) || wordy(after);
    const open = braced ? `{${sign}}` : sign;

    return `${lead}${open}${words}${open}${trail}`;
  }

  private inlineOne(token: Token, before: string, after: string | undefined): string {
    switch (token.type) {
      case 'text': {
        const text = token as Tokens.Text;

        return text.tokens ? this.inline(text.tokens) : escapeText(unwrap(text.text));
      }
      case 'escape': {
        /*
         * Markdown's `\\*` means a literal asterisk, and here it has to stay one: an escaped
         * character is always backslashed, whatever stands beside it.
         */
        const char = decodeEntities((token as Tokens.Escape).text);

        return `${MARKS}{}[]|!#`.includes(char) ? `\\${char}` : escapeText(char);
      }
      case 'strong':
        return this.mark('*', this.inline((token as Tokens.Strong).tokens), before, after);
      case 'em':
        return this.mark('_', this.inline((token as Tokens.Em).tokens), before, after);
      case 'del':
        return this.mark('-', this.inline((token as Tokens.Del).tokens), before, after);
      case 'markHighlight':
        // Jira has no highlighter; bold is the nearest thing that still stands out.
        return this.mark('*', escapeText(String((token as Tokens.Generic).text)), before, after);
      case 'subscript':
        return this.mark('~', escapeText(String((token as Tokens.Generic).text)), before, after);
      case 'superscript':
        return this.mark('^', escapeText(String((token as Tokens.Generic).text)), before, after);
      case 'codespan':
      case 'mathInline':
      case 'mathParen':
      case 'mathBracket':
      case 'mathEnv': {
        // Jira goes on reading marks inside `{{ }}`, so `--verbose` and `arr[0]` need escaping too.
        const code = String((token as Tokens.Codespan).text).replace(/([{}[\]*_\-+^~?!|])/g, '\\$1');

        return code ? `{{${code}}}` : '';
      }
      case 'br':
        // A newline inside a paragraph is already a line break in Jira; `\\` as well would be two.
        return '\n';
      case 'link':
        return this.link(token as Tokens.Link);
      case 'image':
        return this.image(token as Tokens.Image);
      case 'html': {
        const html = (token as Tokens.HTML).text;

        return /^<br\s*\/?>$/i.test(html.trim()) ? '\n' : '';
      }
      case 'footnoteRef': {
        const n = this.footnoteNumbers.get(String((token as Tokens.Generic).text));

        return n ? `^${n}^` : '';
      }
      default:
        return escapeText(String((token as { raw?: string }).raw ?? ''));
    }
  }

  private link(link: Tokens.Link): string {
    const label = this.inline(link.tokens);
    let href = link.href;

    if (href.startsWith('#')) {
      const anchor = this.headings.anchorFor(href.slice(1));

      href = anchor ? `#${anchor}` : href;
    }

    const plain = link.tokens?.length === 1 && link.tokens[0].type === 'text' && link.text === link.href;

    return plain || !label ? `[${href}]` : `[${label}|${href}]`;
  }

  private image(image: Tokens.Image): string {
    if (!isWebAddress(image.href)) {
      return image.text ? `_\\[${escapeText(image.text)}\\]_` : '';
    }

    /* `alt=` is passed through to the picture; a value with a comma or a pipe would end it early. */
    const alt = image.text && !/[,|!]/.test(image.text) ? `|alt=${image.text}` : '';

    return `!${image.href}${alt}!`;
  }

  blocks(tokens: Token[]): string {
    return tokens
      .map((token) => this.block(token))
      .filter(Boolean)
      .join('\n\n');
  }

  /** A paragraph's lines, each made safe from being read as the start of a list, a heading or a quote. */
  private paragraph(text: string): string {
    return text
      .split('\n')
      .map((line) => line.replace(/^(\s*)([*#-]+\s|h[1-6]\.\s|bq\.\s)/, '$1\\$2'))
      .join('\n');
  }

  private block(token: Token): string {
    switch (token.type) {
      case 'heading': {
        const heading = token as Tokens.Heading;
        const slug = this.headings.slugs[this.headingIndex++];
        const anchor = slug && this.headings.linked.has(slug) ? `{anchor:${slug}}` : '';
        const level = Math.min(Math.max(heading.depth, 1), 6);

        return `h${level}. ${anchor}${this.inline(heading.tokens)}`;
      }
      case 'paragraph':
        return this.paragraph(this.inline((token as Tokens.Paragraph).tokens));
      case 'text': {
        const text = token as Tokens.Text;

        return this.paragraph(text.tokens ? this.inline(text.tokens) : escapeText(unwrap(text.text)));
      }
      case 'code': {
        const code = token as Tokens.Code;
        const info = (code.lang ?? '').trim().split(/\s+/)[0].toLowerCase();
        const language = LANGUAGES[info];

        /*
         * `{code}` with no language highlights as Java — so a block with no language, or one Jira
         * does not know, is `{noformat}`, which shows the text as it is.
         */
        return language
          ? `{code:${language}}\n${code.text}\n{code}`
          : `{noformat}\n${code.text}\n{noformat}`;
      }
      case 'mathBlock':
        return `{noformat}\n${String((token as Tokens.Generic).text)}\n{noformat}`;
      case 'blockquote':
        return this.quote(token as Tokens.Blockquote);
      case 'list':
        return this.list(token as Tokens.List, '');
      case 'table':
        return this.table(token as Tokens.Table);
      case 'hr':
        return '----';
      case 'html': {
        const text = (token as Tokens.HTML).text
          .replace(/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, ' ')
          .replace(/[ \t]{2,}/g, ' ')
          .trim();

        return text ? this.paragraph(escapeText(text)) : '';
      }
      case 'space':
      case 'def':
      case 'footnoteDef':
        return '';
      default:
        return this.paragraph(escapeText(String((token as { raw?: string }).raw ?? '')));
    }
  }

  private quote(quote: Tokens.Blockquote): string {
    const alert = alertOf(quote);

    if (!alert) {
      /*
       * `{quote}` does not nest: a second one inside closes the first. A quote within a quote is
       * written as part of the outer one, which is how it reads anyway.
       */
      if (this.inQuote) return this.blocks(quote.tokens);

      this.inQuote = true;

      try {
        return `{quote}\n${this.blocks(quote.tokens)}\n{quote}`;
      } finally {
        this.inQuote = false;
      }
    }

    const title = alert.title.replace(/[|}=]/g, ' ').trim();

    return `{panel:title=${title}|bgColor=${PANELS[alert.kind] ?? PANELS.note}}\n${this.blocks(alert.tokens)}\n{panel}`;
  }

  /**
   * A list, every item on one line behind its markers — `*`, `#`, or both for a nested one.
   *
   * Jira's list item is one line: a second paragraph, or a code block, ends the list. So an item's
   * paragraphs are joined with a forced line break, which keeps them in the item, and a block that
   * cannot be put on a line — code, a table — is written after the item's line, where it at least
   * stays next to the words it belonged to.
   */
  private list(list: Tokens.List, prefix: string): string {
    const marker = `${prefix}${list.ordered ? '#' : '*'}`;
    const lines: string[] = [];

    for (const item of list.items) {
      const words: string[] = [];
      const after: string[] = [];

      for (const token of item.tokens) {
        if (token.type === 'list') {
          after.push(this.list(token as Tokens.List, marker));
        } else if (token.type === 'text' || token.type === 'paragraph') {
          const text = token as Tokens.Text;

          words.push(text.tokens ? this.inline(text.tokens) : escapeText(unwrap(text.text)));
        } else if (token.type !== 'space') {
          after.push(this.block(token));
        }
      }

      const box = item.task ? (item.checked ? '(/) ' : '☐ ') : '';

      lines.push(`${marker} ${box}${words.join(' \\\\ ').replace(/\n/g, ' ')}`.trimEnd(), ...after);
    }

    return lines.join('\n');
  }

  private table(table: Tokens.Table): string {
    const cell = (tokens: Token[]) =>
      this.inline(tokens).replace(/\n/g, ' ') || ' ';
    const head = `||${table.header.map((one) => cell(one.tokens)).join('||')}||`;
    const rows = table.rows.map((row) => `|${row.map((one) => cell(one.tokens)).join('|')}|`);

    return [head, ...rows].join('\n');
  }

  footnotes(notes: Array<{ id: string; tokens: Token[] }>): string {
    if (notes.length === 0) return '';

    return `\n\n----\n${notes.map((note) => `# ${this.inline(note.tokens)}`).join('\n')}`;
  }
}

export function markdownToJira(markdown: string): string {
  const { tokens, footnotes } = lexMarkdown(markdown);
  const writer = new Writer(collectHeadings(tokens), footnotes);

  return `${writer.blocks(tokens)}${writer.footnotes(footnotes)}\n`;
}
