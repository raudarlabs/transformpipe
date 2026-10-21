## What comes across

Slack's format is called mrkdwn, and it is not Markdown: one asterisk is bold, an underscore is italic, one tilde strikes through, a link is `<address|words>`, and it has no headings or tables. Each element is written as the nearest thing a message has:

| In the Markdown | In the mrkdwn |
| --- | --- |
| `## Heading` | `*Heading*`, a bold line of its own |
| `**bold**`, `*italic*`, `~~struck~~` | `*bold*`, `_italic_`, `~struck~` |
| `[words](https://example.com)` | `<https://example.com\|words>` |
| `![chart](https://example.com/a.png)` | `<https://example.com/a.png\|chart>` |
| Bullets, nested | `•`, then `◦`, then `▪`, four spaces deeper at each level |
| `3. item` | `3. item`, counting on from the Markdown's first number |
| A task list | `☑` for done, `☐` for open |
| A fenced code block | a code block, without its language |
| A table | a code block with the columns padded |
| A quote | `>` on every line |
| An alert such as `> [!TIP]` | a quote led by `:bulb:` and the title in bold |
| A footnote | `[1]`, with the notes at the end |

A picture with a web address becomes a link to it, which Slack unfurls into the picture. A highlight becomes bold. Bold inside a word, as in `**un**believable`, gets a zero-width space beside the asterisk so Slack still reads it. Other alerts lead with their own emoji, such as `:warning:`.

A table is padded to its widest cell in each column, with a rule of `─` under the header, and a right-aligned column stays right-aligned.

`&`, `<` and `>` are written as `&amp;`, `&lt;` and `&gt;`, the entities Slack's API asks for.

## What is left behind

- **Formatting inside headings, link text and table cells.** The words stay and the marks go.
- **Links to the document's own headings** keep their words and lose the address, since a message has no headings to jump to.
- **The language of a code block**, which Slack's code blocks have no place for.
- **Subscript and superscript**: `H~2~O` arrives as H2O.
- **Pictures without a web address** become `_[description]_`, or `_[picture]_` when there is none; see [images and links that still work](/blog/images-and-links-that-still-work).
- **Front matter** is removed, **wikilinks** keep their words, and **raw HTML** keeps only its text.
- **Diagrams and formulas** arrive as their source, set as code.

## An example

A release note written in Markdown:

```markdown
## Release 4.2

Exports are **twice as fast**. Details in the [changelog](https://example.com/changes).

- Word export
  - tables keep their widths
- [ ] Update the docs

| Plan | Price |
| :--- | ---: |
| Team | 8 |
| Business | 15 |

> [!TIP]
> Restart the app to pick it up.
```

The mrkdwn it becomes:

````text
*Release 4.2*

Exports are *twice as fast*. Details in the <https://example.com/changes|changelog>.

• Word export
    ◦ tables keep their widths
☐ Update the docs

```
Plan      Price
────────  ─────
Team          8
Business     15
```

> :bulb: *Tip*
> Restart the app to pick it up.
````

## Limits

- `.md`, `.markdown`, `.mdown` and `.mkd` files up to 10 MB, or pasted Markdown. Files dropped together become one document, and the 10 MB is their total.
- It runs in your browser. Nothing is uploaded unless you sign in and press Save; an account keeps documents up to 4 MB.
- The download is a text file, `<name>.slack.txt`.
- The output is mrkdwn text, not Block Kit JSON.

## Questions

### Does Slack support Markdown?

Not in a message's `text`, which Slack reads as mrkdwn: single marks, angle-bracket links, no headings or tables. Markdown posted there through the API or a webhook arrives with doubled asterisks, hash marks at the start of lines and a table drawn in pipes.

### How do I paste Markdown into Slack and keep the formatting?

Convert it here and press Copy for Slack. The clipboard gets the mrkdwn as plain text and the rendered document as HTML, and Slack's message box takes the formatted one. More in [the paste guide](/how-to/paste-markdown).

### Can a Slack message show a table?

Not in mrkdwn, which has none. The table is written as a code block with its columns padded, which lines up because a code block is monospace. Formatting inside the cells is dropped, since a code block would show the asterisks rather than read them.

### Why does the output say `&amp;` instead of `&`?

Slack treats `&`, `<` and `>` as control characters, and its API expects them written as entities. A message posted through the API or a webhook shows them as the characters.

### Does it produce Block Kit JSON?

No. It writes the mrkdwn text, which goes in the `text` of a `chat.postMessage` call or an incoming webhook, or in a section block. The JSON around it is yours to write.
