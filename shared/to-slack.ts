import type { Token, Tokens } from 'marked';
import { alertOf, lexMarkdown } from './markdown.js';
import { isWebAddress, plainText, unwrap } from './to-markup.js';

/*
 * Markdown as Slack's mrkdwn — what a bot, a webhook, a workflow step or an API call posts.
 *
 * Slack calls it markdown and it is not: one asterisk is bold, an underscore is italic, one tilde
 * strikes through, a link is `<address|words>`, and there are no headings, no tables and no nested
 * lists as such. A Markdown message posted as it is arrives with doubled asterisks, hash marks at
 * the start of lines and a table drawn in pipes.
 *
 * So the things Slack lacks are written as the nearest thing it has. A heading is a bold line. A
 * list is bullets drawn as characters, indented by depth. A table is a code block with its columns
 * padded, because monospace is the only alignment a message has. An alert is a quote led by the
 * emoji Slack would use for it. A formula and a diagram are their source in code type.
 *
 * `&`, `<` and `>` are written as entities, which is what Slack's API asks for: those three are its
 * own control characters, and a `<` left bare starts a link that was never meant.
 */

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** What Slack's own alerts would lead with. */
const ALERT_EMOJI: Record<string, string> = {
  note: ':information_source:',
  important: ':exclamation:',
  tip: ':bulb:',
  warning: ':warning:',
  caution: ':rotating_light:',
};

const BULLETS = ['•', '◦', '▪'];
const WORD = /[\p{L}\p{N}]/u;
/** A zero-width space: what lets a mark stand against a letter and still be read as a mark. */
const JOIN = '​';

class Writer {
  private footnoteNumbers = new Map<string, number>();

  constructor(footnotes: Array<{ id: string }>) {
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
   * Bold, italic or struck words, with the mark where Slack will see it.
   *
   * Slack reads a mark only at the edge of a word, like Jira — and unlike Jira has no braced form
   * for the middle of one. A zero-width space between the mark and the letter is what Slack's own
   * clients do about it, so `**un**believable` still comes out bold.
   */
  private mark(sign: string, inner: string, before: string, after: string | undefined): string {
    const lead = inner.match(/^\s*/)?.[0] ?? '';
    const trail = inner.match(/\s*$/)?.[0] ?? '';
    const words = inner.trim();

    if (!words) return inner;

    const open = before && WORD.test(before) ? `${JOIN}${sign}` : sign;
    const close = after && WORD.test(after) ? `${sign}${JOIN}` : sign;

    return `${lead}${open}${words}${close}${trail}`;
  }

  private inlineOne(token: Token, before: string, after: string | undefined): string {
    switch (token.type) {
      case 'text': {
        const text = token as Tokens.Text;

        return text.tokens ? this.inline(text.tokens) : escape(unwrap(text.text));
      }
      case 'escape':
        return escape((token as Tokens.Escape).text);
      case 'strong':
        return this.mark('*', this.inline((token as Tokens.Strong).tokens), before, after);
      case 'em':
        return this.mark('_', this.inline((token as Tokens.Em).tokens), before, after);
      case 'del':
        return this.mark('~', this.inline((token as Tokens.Del).tokens), before, after);
      case 'markHighlight':
        return this.mark('*', escape(String((token as Tokens.Generic).text)), before, after);
      case 'subscript':
      case 'superscript':
        // No raised or lowered text in a message: H2O reads as H2O.
        return escape(String((token as Tokens.Generic).text));
      case 'codespan':
      case 'mathInline':
      case 'mathParen':
      case 'mathBracket':
      case 'mathEnv': {
        const code = String((token as Tokens.Codespan).text).replace(/`/g, 'ˋ');

        return code ? `\`${escape(code)}\`` : '';
      }
      case 'br':
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

        return n ? `[${n}]` : '';
      }
      default:
        return escape(String((token as { raw?: string }).raw ?? ''));
    }
  }

  private link(link: Tokens.Link): string {
    /*
     * A link to a heading has nowhere to go in a message, which has no headings to go to: its
     * words are kept and the address is not.
     */
    if (link.href.startsWith('#')) {
      return this.inline(link.tokens);
    }

    // Formatting inside a link's words is not read; the words are.
    const label = escape(plainText(link.tokens)).replace(/\|/g, '¦');
    const href = link.href.replace(/[<>|]/g, encodeURIComponent);

    return !label || label === escape(link.href) ? `<${href}>` : `<${href}|${label}>`;
  }

  private image(image: Tokens.Image): string {
    const words = escape(image.text || 'picture').replace(/\|/g, '¦');

    // Slack unfurls a picture's address into the picture, so a link to one is as good as showing it.
    return isWebAddress(image.href) ? `<${image.href}|${words}>` : `_[${words}]_`;
  }

  blocks(tokens: Token[], depth = 0): string {
    return tokens
      .map((token) => this.block(token, depth))
      .filter(Boolean)
      .join('\n\n');
  }

  private block(token: Token, depth: number): string {
    switch (token.type) {
      case 'heading':
        return `*${escape(plainText((token as Tokens.Heading).tokens).trim().replace(/\*/g, '∗'))}*`;
      case 'paragraph':
        return this.inline((token as Tokens.Paragraph).tokens);
      case 'text': {
        const text = token as Tokens.Text;

        return text.tokens ? this.inline(text.tokens) : escape(unwrap(text.text));
      }
      case 'code':
        return this.fence((token as Tokens.Code).text);
      case 'mathBlock':
        return this.fence(String((token as Tokens.Generic).text));
      case 'blockquote':
        return this.quote(token as Tokens.Blockquote);
      case 'list':
        return this.list(token as Tokens.List, depth);
      case 'table':
        return this.table(token as Tokens.Table);
      case 'hr':
        return '───────────';
      case 'html': {
        const text = (token as Tokens.HTML).text
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, ' ')
          .replace(/[ \t]{2,}/g, ' ')
          .trim();

        return escape(text);
      }
      case 'space':
      case 'def':
      case 'footnoteDef':
        return '';
      default:
        return escape(String((token as { raw?: string }).raw ?? ''));
    }
  }

  /** A block of code. Slack's has no language, and the fence must not be broken by the code inside. */
  private fence(text: string): string {
    return `\`\`\`\n${escape(text.replace(/```/g, 'ˋˋˋ'))}\n\`\`\``;
  }

  private quote(quote: Tokens.Blockquote): string {
    const alert = alertOf(quote.tokens);
    const body = alert
      ? `${ALERT_EMOJI[alert.kind] ?? ''} *${escape(alert.title)}*\n${this.blocks(alert.tokens)}`
      : this.blocks(quote.tokens);

    // Every line, blank ones included, or the quote ends at the first gap between paragraphs.
    return body
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n');
  }

  private list(list: Tokens.List, depth: number): string {
    const pad = '    '.repeat(depth);
    const start = list.ordered && list.start !== '' ? Number(list.start) : 1;
    const lines: string[] = [];

    list.items.forEach((item, index) => {
      const box = item.task ? (item.checked ? '☑' : '☐') : '';
      // A box is a bullet already; a numbered task keeps its number.
      const marker = list.ordered
        ? `${start + index}.${box ? ` ${box}` : ''}`
        : box || BULLETS[depth % BULLETS.length];
      const parts: string[] = [];
      const after: string[] = [];

      for (const token of item.tokens) {
        if (token.type === 'list') {
          after.push(this.list(token as Tokens.List, depth + 1));
        } else if (token.type !== 'space') {
          parts.push(this.block(token, depth + 1));
        }
      }

      // Lines after an item's first sit under its words, not under its bullet.
      const [first = '', ...rest] = parts.join('\n').split('\n');

      lines.push(
        `${pad}${marker} ${first}`.trimEnd(),
        ...rest.map((line) => (line ? `${pad}    ${line}` : '')),
        ...after
      );
    });

    return lines.join('\n');
  }

  /**
   * A table, as the one kind of table a message can hold: monospace, columns padded to their
   * widest cell, inside a code block. Formatting in the cells is dropped — inside a code block it
   * would be shown as the asterisks rather than read.
   */
  private table(table: Tokens.Table): string {
    const head = table.header.map((cell) => plainText(cell.tokens).trim());
    const rows = table.rows.map((row) => row.map((cell) => plainText(cell.tokens).trim()));
    const width = (text: string) => [...text].length;
    const widths = head.map((_, column) =>
      Math.max(width(head[column]), ...rows.map((row) => width(row[column] ?? '')))
    );
    const line = (cells: string[]) =>
      cells
        .map((value, column) => {
          const gap = ' '.repeat(Math.max(0, widths[column] - width(value)));

          return table.align[column] === 'right' ? `${gap}${value}` : `${value}${gap}`;
        })
        .join('  ')
        .trimEnd();

    return this.fence(
      [line(head), widths.map((one) => '─'.repeat(one)).join('  '), ...rows.map(line)].join('\n')
    );
  }

  footnotes(notes: Array<{ id: string; tokens: Token[] }>): string {
    if (notes.length === 0) return '';

    return `\n\n───────────\n${notes
      .map((note, index) => `[${index + 1}] ${this.inline(note.tokens)}`)
      .join('\n')}`;
  }
}

export function markdownToSlack(markdown: string): string {
  const { tokens, footnotes } = lexMarkdown(markdown);
  const writer = new Writer(footnotes);

  return `${writer.blocks(tokens)}${writer.footnotes(footnotes)}\n`;
}
