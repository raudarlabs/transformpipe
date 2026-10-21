## What comes across

Jira's wiki markup looks like Markdown and reads differently: one asterisk is bold, a hyphen strikes through, a list is a run of `*` or `#`, and a newline inside a paragraph is a line break. Each element is rewritten to match:

| In the Markdown | In the Jira markup |
| --- | --- |
| `## Heading` | `h2. Heading` |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `-struck-` |
| `[words](https://example.com)` | `[words\|https://example.com]` |
| `![chart](https://example.com/a.png)` | `!https://example.com/a.png\|alt=chart!` |
| A fence in a language Jira knows | `{code:python}` |
| Any other fence | `{noformat}` |
| A table | `\|\|head\|\|` and `\|cell\|` |
| A quote | `{quote}` |
| An alert such as `> [!WARNING]` | `{panel}` in Atlassian's colour for it |
| A task list | `(/)` for done, `☐` for open |

Nested lists repeat the marker, so a bullet under a numbered item is `#*`. Lines wrapped inside a paragraph are joined, so Jira does not break them where your editor did. A link to a heading in the document still jumps, to an `{anchor}` at the start of that heading, and footnotes become raised numbers.

Brackets, braces and pipes are always backslashed, since each opens a link, a macro or a cell. A mark such as `*` or `-` is escaped only at the edge of a word, where Jira would act on it: `e-mail` stays, `-flag` becomes `\-flag`. Emoticons such as `(i)` are escaped so they stay text, and bold inside a word uses the braced form, `{*}un{*}believable`. Markdown's own rules are in [the escaping reference](/blog/markdown-escaping).

## What is left behind

- **Front matter** at the top of a note is removed, and **wikilinks** keep only their words.
- **Pictures without a web address**, a relative path or one embedded in the file, become their description in italics, `_\[diagram\]_`, or nothing without one, since Jira cannot load them; see [images and links that still work](/blog/images-and-links-that-still-work).
- **Raw HTML** keeps its text and loses its tags and comments.
- **A quote inside a quote** joins the outer one, because `{quote}` does not nest.
- **Column alignment** in tables.
- **Diagrams and formulas** arrive as their source, in `{noformat}` or `{{ }}`.

## An example

A bug report written in Markdown:

````markdown
## Steps to reproduce

1. Open **Billing** and pick a plan
2. Run `sync --force`, then check the [log](https://example.com/log)

> [!WARNING]
> The retry deletes the draft invoice.

| Field | Before | After |
| --- | --- | --- |
| Status | *open* | ~~paid~~ |

```ts
await retry(invoice);
```

- [x] Reproduced on staging
- [ ] Fixed
````

The Jira markup it becomes:

```text
h2. Steps to reproduce

# Open *Billing* and pick a plan
# Run {{sync \-\-force}}, then check the [log|https://example.com/log]

{panel:title=Warning|bgColor=#FFFAE6}
The retry deletes the draft invoice.
{panel}

||Field||Before||After||
|Status|_open_|-paid-|

{code:javascript}
await retry(invoice);
{code}

* (/) Reproduced on staging
* ☐ Fixed
```

Hyphens inside `{{ }}` are escaped because Jira still reads marks there; TypeScript becomes `javascript`, the nearest the `{code}` macro has.

## Limits

- `.md`, `.markdown`, `.mdown` and `.mkd` files up to 10 MB, or pasted Markdown. Files dropped together become one document, and the 10 MB is their total.
- It runs in your browser. Nothing is uploaded unless you sign in and press Save; an account keeps documents up to 4 MB.
- The download is a text file, `<name>.jira.txt`.
- A numbered list starts at 1, whatever number the Markdown began with. A code block or table in a list item goes after the item's line, and numbering restarts below it.

## Questions

### Does Jira support Markdown?

Partly. Jira Cloud's editor formats Markdown as you type, but Data Center's text mode, version 2 of the REST API and automation rules read wiki markup, and Markdown pasted into them comes out with the wrong words emphasised.

### How do I paste Markdown into Jira Cloud and keep the formatting?

Convert it here and press Copy for Jira. The clipboard gets the wiki markup as plain text and the rendered document as HTML, and Jira Cloud's editor takes the formatted one. More in [the paste guide](/how-to/paste-markdown).

### Can it convert Jira markup back to Markdown?

No. It goes one way, from Markdown to wiki markup.

### Why did my code block come out as {noformat}?

Its fence had no language, or one the `{code}` macro does not know. A `{code}` block with no language is highlighted as Java, so `{noformat}` shows it as it is instead. Aliases such as `sh` and `yml` are mapped to `bash` and `yaml`.

### Does it produce the JSON for version 3 of the REST API?

No. Version 3 of Jira Cloud's REST API takes Atlassian Document Format, which this does not write; version 2 takes the wiki markup.

### Is this the format Confluence uses?

No. Confluence keeps a page in storage format, XHTML with macros of its own, which the Markdown to Confluence converter writes.
