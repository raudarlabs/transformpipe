## What comes across

Every character and line, with a backslash or an entity added nearly everywhere Markdown would read formatting into plain text:

| In the file | In the Markdown |
| --- | --- |
| `*`, `_`, `` ` ``, `[`, `]`, `~` anywhere | `\*`, `\_`, `` \` ``, `\[`, `\]`, `\~` |
| A backslash, as in `C:\Users` | Two: `C:\\Users` |
| `#` or `>` starting a line | `\#`, `\>` |
| `-`, `+`, `1.` or `1)` and a space starting a line | `\-`, `\+`, `1\.`, `1\)` |
| `<` before a letter, `/`, `!` or `?` | `&lt;` |
| `&` beginning an entity, as in `&amp;` | `&amp;amp;` |

Each line break gets a backslash, CommonMark's visible hard break, since Markdown would otherwise join the lines. A run of blank lines becomes one paragraph break, Windows line endings are normalised and a byte-order mark is dropped.

Everything else is copied as typed, `AT&T` and `a < b` included.

## What is left behind

No words are dropped. What stays behind is structure the text only implies:

- **Headings.** A title in capitals stays an ordinary line.
- **Lists.** A line starting with a dash or a number stays a line.
- **Alignment.** Leading spaces and tabs stay in the Markdown, but rendering collapses them.

## An example

A text file of meeting notes:

```text
Standup notes, 14 October
Owner: priya_k

- deploy moved to *Thursday*
1. fix the login bug first
# of open tickets: 12
Wrap key names in <kbd> in the docs

> 3 failing tests, see C:\ci\log.txt
```

becomes:

```markdown
Standup notes, 14 October\
Owner: priya\_k

\- deploy moved to \*Thursday\*\
1\. fix the login bug first\
\# of open tickets: 12\
Wrap key names in &lt;kbd> in the docs

\> 3 failing tests, see C:\\ci\\log.txt\
```

Rendered, it reads line for line as the file does, `<kbd>` included; only the final backslash is extra. Read as Markdown instead, the same file gives a bullet, italics, a numbered list, a heading and a quote.

## Limits

- `.txt` files, or pasted text, up to 10 MB at a time. Several files become one document, with a `---` between them.
- The file is converted in your browser, not uploaded. It reaches your account only if you sign in and press Save, and a saved document can be at most 4 MB.
- The file is read as UTF-8: text saved as Windows-1252 shows replacement marks for accented letters, and [how to open a .txt file](/how-to/open-txt) explains reopening it in the right encoding.
- A file ending with a single line break, as most editors save one, keeps a backslash after its last line, which the preview shows: the one ending the example.
- `$`, `=` and `^` are not escaped, so the preview draws `$x+1$` as a formula, `==word==` as a highlight and `x^2^` as superscript. A bracketed sum such as `[a+b]` becomes a formula too: escaped brackets are LaTeX's delimiters.
- A lone line of three or more dashes becomes a horizontal rule, and a line of `=` or `-` signs ending a paragraph makes it a heading. A table typed with pipes stays text.
- A paragraph indented by four spaces or a tab, other than the first, becomes a code block with its backslashes showing.
- A web address containing an underscore, or ending a line, shows a stray backslash when the preview links it.

## Questions

### Why not just rename the .txt to .md?

If the file was written as Markdown, yes: an `.md` goes to the Markdown to HTML page, which takes it as it is. If not, renaming turns a hyphen into a bullet and an asterisk into italics.

### Can it convert rich text to Markdown?

Not this converter. A `.txt` holds no formatting, and the paste box takes plain text, so bold and headings copied from a page arrive as plain words. An `.rtf` has its own Rich text to Markdown converter; a saved web page goes to HTML to Markdown.

### Will it turn my headings and lists into Markdown?

No. It cannot tell a heading from a short sentence, or a bullet from a minus sign, and a wrong guess would change what the text says.

### Why are there backslashes everywhere?

They are escapes, which a renderer hides: `\*` is drawn as an asterisk, and a backslash ending a line as a line break. [Markdown escape characters](/blog/markdown-escaping) lists what each protects; [line breaks and lists](/blog/markdown-line-breaks-and-lists) explains the break.

### Can I convert text to Markdown from a script?

Yes, with an account: post the text as the request body to `/api/v1/documents?kind=text-to-markdown` with an API key from your account menu. The same converter runs on the server and saves a document.
