import type { Token, Tokens } from 'marked';
import { alertOf, lexMarkdown } from './markdown.js';
import { collectHeadings, isWebAddress, plainText, unwrap, type Headings } from './to-markup.js';

/*
 * Markdown as Confluence storage format — the XHTML a Confluence page is saved as.
 *
 * It is what the REST API takes in `body.storage`, what Data Center's source editor shows, and the
 * one form in which a page arrives with Confluence's own pieces rather than an approximation of
 * them: a fenced block becomes the code macro with its language, `> [!WARNING]` becomes the
 * warning panel, a task list becomes Confluence's task list with boxes somebody can tick, and a
 * link to a heading jumps to it. Pasting rendered HTML into the editor gets none of those.
 *
 * A renderer of its own rather than the HTML renderer with tags swapped afterwards, because the
 * two disagree about almost everything that matters here — a code block is a macro with a CDATA
 * body, a picture is `ac:image`, and the result has to be well-formed XML or Confluence refuses the
 * whole page, where a browser would shrug at the same mistake.
 *
 * What has no Confluence equivalent is kept as words, never dropped: a formula is its TeX in code
 * type, a Mermaid diagram is its source in a code block titled as one, and a picture embedded in
 * the document — which no Confluence page can hold without an upload — is its description.
 */

/** Text, made safe to stand in XML: the three characters that end text, and the quote for attributes. */
const xml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A CDATA section, split where the text itself contains the sequence that would end one. */
const cdata = (text: string) => `<![CDATA[${text.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

/**
 * The code macro's own names for languages, from the names a fence is written with.
 *
 * The macro knows a fixed list and Data Center shows an error box in place of the code when given a
 * name outside it, so anything not here goes out with no language at all — plain, and readable —
 * rather than as a guess.
 */
const LANGUAGES: Record<string, string> = {
  actionscript: 'actionscript3',
  applescript: 'applescript',
  bash: 'bash', sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash',
  'c#': 'c#', csharp: 'c#', cs: 'c#',
  c: 'cpp', cpp: 'cpp', 'c++': 'cpp', h: 'cpp', hpp: 'cpp',
  css: 'css',
  coldfusion: 'coldfusion', cfm: 'coldfusion',
  delphi: 'delphi', pascal: 'delphi',
  diff: 'diff', patch: 'diff',
  erlang: 'erl', erl: 'erl',
  groovy: 'groovy',
  html: 'xml', xml: 'xml', xhtml: 'xml', svg: 'xml',
  java: 'java',
  javafx: 'jfx',
  javascript: 'js', js: 'js', jsx: 'js', mjs: 'js', cjs: 'js', json: 'js',
  typescript: 'js', ts: 'js', tsx: 'js',
  php: 'php',
  perl: 'perl', pl: 'perl',
  powershell: 'powershell', ps1: 'powershell', pwsh: 'powershell',
  python: 'py', py: 'py',
  ruby: 'ruby', rb: 'ruby',
  sass: 'sass', scss: 'sass',
  scala: 'scala',
  sql: 'sql',
  vb: 'vb', vbnet: 'vb', vbscript: 'vb',
  yaml: 'yml', yml: 'yml',
  text: 'text', txt: 'text', plaintext: 'text',
};

/**
 * GitHub's five alerts as Confluence's four panels, by colour rather than by name: Confluence's
 * "note" is the yellow one and its "warning" the red, so GitHub's yellow Warning is a note here and
 * its red Caution a warning.
 */
const PANELS: Record<string, string> = {
  note: 'info',
  important: 'info',
  tip: 'tip',
  warning: 'note',
  caution: 'warning',
};

function macro(
  name: string,
  parameters: Record<string, string>,
  body?: { rich?: string; plain?: string }
): string {
  const params = Object.entries(parameters)
    .map(([key, value]) => `<ac:parameter ac:name="${xml(key)}">${xml(value)}</ac:parameter>`)
    .join('');
  const inner =
    body?.rich !== undefined
      ? `<ac:rich-text-body>${body.rich}</ac:rich-text-body>`
      : body?.plain !== undefined
        ? `<ac:plain-text-body>${cdata(body.plain)}</ac:plain-text-body>`
        : '';

  return `<ac:structured-macro ac:name="${name}" ac:schema-version="1">${params}${inner}</ac:structured-macro>`;
}

function codeMacro(text: string, lang: string | undefined, title?: string): string {
  const info = (lang ?? '').trim().split(/\s+/)[0].toLowerCase();
  const language = LANGUAGES[info];
  const parameters: Record<string, string> = {};

  if (language) parameters.language = language;
  if (title) parameters.title = title;

  return macro('code', parameters, { plain: text });
}

class Writer {
  private task = 0;
  private footnoteNumbers = new Map<string, number>();

  constructor(private headings: Headings, footnotes: Array<{ id: string }>) {
    footnotes.forEach((note, index) => this.footnoteNumbers.set(note.id, index + 1));
  }

  inline(tokens: Token[] | undefined): string {
    return (tokens ?? []).map((token) => this.inlineOne(token)).join('');
  }

  private inlineOne(token: Token): string {
    switch (token.type) {
      case 'text': {
        const text = token as Tokens.Text;

        return text.tokens ? this.inline(text.tokens) : xml(unwrap(text.text));
      }
      case 'escape':
        return xml((token as Tokens.Escape).text);
      case 'strong':
        return `<strong>${this.inline((token as Tokens.Strong).tokens)}</strong>`;
      case 'em':
        return `<em>${this.inline((token as Tokens.Em).tokens)}</em>`;
      case 'del':
        return `<s>${this.inline((token as Tokens.Del).tokens)}</s>`;
      case 'codespan':
        return `<code>${xml((token as Tokens.Codespan).text)}</code>`;
      case 'br':
        return '<br />';
      case 'link':
        return this.link(token as Tokens.Link);
      case 'image':
        return this.image(token as Tokens.Image);
      case 'html':
        return this.rawHtml((token as Tokens.HTML).text);
      case 'markHighlight':
        return `<span style="background-color: rgb(255,240,179);">${xml(String((token as Tokens.Generic).text))}</span>`;
      case 'subscript':
        return `<sub>${xml(String((token as Tokens.Generic).text))}</sub>`;
      case 'superscript':
        return `<sup>${xml(String((token as Tokens.Generic).text))}</sup>`;
      case 'mathInline':
      case 'mathParen':
      case 'mathBracket':
      case 'mathEnv':
        return `<code>${xml(String((token as Tokens.Generic).text))}</code>`;
      case 'footnoteRef': {
        const n = this.footnoteNumbers.get(String((token as Tokens.Generic).text));

        return n ? `<sup>${n}</sup>` : '';
      }
      default:
        return xml(String((token as { raw?: string }).raw ?? ''));
    }
  }

  private link(link: Tokens.Link): string {
    const label = this.inline(link.tokens);

    if (link.href.startsWith('#')) {
      const anchor = this.headings.anchorFor(link.href.slice(1));

      /*
       * A link to a heading is Confluence's own link to an anchor, and the anchor is one this
       * writer puts in front of the heading (see `heading`) — not the id Confluence makes up for a
       * heading by itself, which is spelled differently in Cloud and in Data Center.
       */
      if (anchor) {
        return `<ac:link ac:anchor="${xml(anchor)}"><ac:link-body>${label}</ac:link-body></ac:link>`;
      }
    }

    const title = link.title ? ` title="${xml(link.title)}"` : '';

    return `<a href="${xml(link.href)}"${title}>${label || xml(link.href)}</a>`;
  }

  private image(image: Tokens.Image): string {
    if (!isWebAddress(image.href)) {
      return image.text ? `<em>[${xml(image.text)}]</em>` : '';
    }

    const alt = image.text ? ` ac:alt="${xml(image.text)}"` : '';
    const title = image.title ? ` ac:title="${xml(image.title)}"` : '';

    return `<ac:image${alt}${title}><ri:url ri:value="${xml(image.href)}" /></ac:image>`;
  }

  /**
   * HTML written into the Markdown, which Confluence would refuse if it is not well-formed XML —
   * and most hand-written HTML is not. A line break survives as one; every other tag gives up its
   * words, which are what a reader needed from it.
   */
  private rawHtml(html: string, gap = ''): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .split(/(<br\s*\/?>)/i)
      .map((part, index) =>
        index % 2 === 1 ? '<br />' : xml(part.replace(/<[^>]*>/g, gap).replace(/[ \t]{2,}/g, ' '))
      )
      .join('');
  }

  blocks(tokens: Token[]): string {
    return tokens
      .map((token) => this.block(token))
      .filter(Boolean)
      .join('\n');
  }

  private block(token: Token): string {
    switch (token.type) {
      case 'heading':
        return this.heading(token as Tokens.Heading);
      case 'paragraph':
        return `<p>${this.inline((token as Tokens.Paragraph).tokens)}</p>`;
      case 'text': {
        const text = token as Tokens.Text;

        return `<p>${text.tokens ? this.inline(text.tokens) : xml(unwrap(text.text))}</p>`;
      }
      case 'code': {
        const code = token as Tokens.Code;
        const info = (code.lang ?? '').trim().split(/\s+/)[0].toLowerCase();

        return info === 'mermaid'
          ? codeMacro(code.text, undefined, 'Mermaid diagram')
          : codeMacro(code.text, code.lang);
      }
      case 'mathBlock':
        return codeMacro(String((token as Tokens.Generic).text), undefined, 'LaTeX');
      case 'blockquote':
        return this.quote(token as Tokens.Blockquote);
      case 'list':
        return this.list(token as Tokens.List);
      case 'table':
        return this.table(token as Tokens.Table);
      case 'hr':
        return '<hr />';
      case 'html': {
        const text = this.rawHtml((token as Tokens.HTML).text, ' ').trim();

        return text ? `<p>${text}</p>` : '';
      }
      case 'space':
      case 'def':
      case 'footnoteDef':
        return '';
      default:
        return `<p>${xml(String((token as { raw?: string }).raw ?? ''))}</p>`;
    }
  }

  private headingIndex = 0;

  private heading(heading: Tokens.Heading): string {
    const slug = this.headings.slugs[this.headingIndex++];
    const level = Math.min(Math.max(heading.depth, 1), 6);
    const anchor =
      slug && this.headings.linked.has(slug) ? macro('anchor', { '': slug }) : '';

    return `<h${level}>${anchor}${this.inline(heading.tokens)}</h${level}>`;
  }

  private quote(quote: Tokens.Blockquote): string {
    const alert = alertOf(quote.tokens);

    if (!alert) {
      return `<blockquote>${this.blocks(quote.tokens)}</blockquote>`;
    }

    /*
     * The panel carries its own icon, so the alert's default name would only repeat it; a title
     * the writer gave it is kept.
     */
    const defaultTitle = alert.title.toLowerCase() === alert.kind;

    return macro(
      PANELS[alert.kind] ?? 'info',
      defaultTitle ? {} : { title: alert.title },
      { rich: this.blocks(alert.tokens) }
    );
  }

  /** What an item holds: a tight item's words straight in the `li`, a loose one's paragraphs as paragraphs. */
  private itemBody(item: Tokens.ListItem): string {
    if (item.loose) {
      return this.blocks(item.tokens);
    }

    return item.tokens
      .map((token) =>
        token.type === 'text'
          ? (token as Tokens.Text).tokens
            ? this.inline((token as Tokens.Text).tokens)
            : xml(unwrap((token as Tokens.Text).text))
          : this.block(token)
      )
      .join('');
  }

  private list(list: Tokens.List): string {
    /*
     * A list whose every item is a task is Confluence's own task list, where the boxes can be
     * ticked on the page. A list with only some is an ordinary list with the boxes drawn as
     * characters, because a Confluence task list has no item that is not a task.
     */
    if (list.items.length > 0 && list.items.every((item) => item.task)) {
      const tasks = list.items
        .map((item) => {
          this.task += 1;

          return (
            `<ac:task><ac:task-id>${this.task}</ac:task-id>` +
            `<ac:task-status>${item.checked ? 'complete' : 'incomplete'}</ac:task-status>` +
            `<ac:task-body>${this.itemBody(item)}</ac:task-body></ac:task>`
          );
        })
        .join('');

      return `<ac:task-list>${tasks}</ac:task-list>`;
    }

    const tag = list.ordered ? 'ol' : 'ul';
    const start =
      list.ordered && list.start !== '' && Number(list.start) !== 1
        ? ` start="${Number(list.start)}"`
        : '';
    const items = list.items
      .map((item) => {
        const box = item.task ? (item.checked ? '☑ ' : '☐ ') : '';
        const body = this.itemBody(item);

        // In a loose item the words are in a paragraph, and the box belongs inside it with them.
        return `<li>${box && body.startsWith('<p>') ? `<p>${box}${body.slice(3)}` : `${box}${body}`}</li>`;
      })
      .join('');

    return `<${tag}${start}>${items}</${tag}>`;
  }

  private table(table: Tokens.Table): string {
    const align = (index: number) => {
      const value = table.align[index];

      return value ? ` style="text-align: ${value};"` : '';
    };
    const head = table.header
      .map((cell, index) => `<th><p${align(index)}>${this.inline(cell.tokens)}</p></th>`)
      .join('');
    const rows = table.rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell, index) => `<td><p${align(index)}>${this.inline(cell.tokens)}</p></td>`)
            .join('')}</tr>`
      )
      .join('');

    return `<table><tbody><tr>${head}</tr>${rows}</tbody></table>`;
  }

  footnotes(notes: Array<{ id: string; tokens: Token[] }>): string {
    if (notes.length === 0) return '';

    const items = notes.map((note) => `<li>${this.inline(note.tokens)}</li>`).join('');

    return `\n<hr />\n<ol>${items}</ol>`;
  }
}

export function markdownToConfluence(markdown: string): string {
  const { tokens, footnotes } = lexMarkdown(markdown);
  const writer = new Writer(collectHeadings(tokens), footnotes);

  return `${writer.blocks(tokens)}${writer.footnotes(footnotes)}\n`;
}
