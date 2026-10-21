## What comes across

A `.docx` is read for what each part of it is, not for how it looks on the page.

| In the Word file | In the Markdown |
| --- | --- |
| Heading 1 to Heading 6 | `#` to `######` |
| Bold, italic, strikethrough | `**bold**`, `*italic*`, `~~struck~~` |
| Bulleted and numbered lists | `-` and `1.` lists, two spaces in per level |
| Ticked and empty checkboxes in a list | `- [x]` and `- [ ]` |
| A table | A Markdown table, its first row as the header |
| A hyperlink | A link to the same address |
| A picture | Embedded in the document, with its alt text |
| Footnotes and endnotes | A numbered list at the end, `[1]` in the text |
| A line break (Shift+Enter) | A line ending in two spaces |
| A text box | Its words, after the paragraph it was anchored to |

`report.docx` becomes `report.md`, and an asterisk or underscore in the text is escaped so it stays a character.

## What is left behind

- **Styles that are not headings.** Title, Subtitle, Quote, Heading 7 to 9 and your own styles become ordinary paragraphs.
- **Appearance.** Fonts, sizes, colours, highlighting and underlining. Subscript and superscript lose their position, so H₂O arrives as H2O, and a monospaced font does not make code.
- **Comments,** with no marker where they were.
- **Page furniture.** Headers, footers, page numbers and page breaks.
- **Equations.** Anything from Word's equation editor disappears and the sentence closes up.
- **Merged cells.** A merged cell is written once and the cells after it shift left into the space it covered. Two paragraphs in one cell run together.
- **Working footnotes.** The `[1]` and `↑` links point at anchors the Markdown lacks; these are not Markdown `[^1]` footnotes.
- **A working table of contents.** Its entries arrive as links with page numbers, to bookmarks that are gone.

## An example

A `.docx` with a Title-style line, a Heading 1, a paragraph with bold, italic, a footnote and a link, a nested list, a table and a photograph becomes this, the picture's base64 shortened:

```markdown
Roof survey

# Findings

The north gutter is **blocked** and two tiles are *cracked*.[\[1\]](#footnote-1) Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

1. Seen from the scaffold on 3 March. [↑](#footnote-ref-1)
```

"Roof survey" stays a plain paragraph because it was in the Title style.

## Limits

- `.docx` only, up to 50 MB. Several files dropped together count together and become one document, separated by rules.
- The file is read in your browser, not uploaded. Nothing goes to an account unless you are signed in and press Save, and a saved document can be at most 4 MB.
- Pictures travel inside the Markdown: about 1 MB each once encoded (a 750 KB file) and 2 MB in all for each `.docx`. One that does not fit becomes its alt text in italics, or nothing if it had none.
- Lists nested under a numbered item are indented two spaces, which is not enough for Markdown: rendered, the sub-items leave their item. Nesting under bullets is fine.
- A password-protected `.docx` cannot be read; remove the password in Word first.

## Questions

### How do I convert a Word document (.docx) to Markdown (.md)?

Drop the `.docx` here, check the preview and press Download .md. [How to convert DOCX to Markdown](/blog/convert-docx-to-markdown) compares this with Pandoc and with mammoth in your own code.

### Can it convert an old .doc file?

No, only `.docx`. Save a `.doc` as `.docx` in Word or LibreOffice first; [how to open a .docx file](/how-to/open-docx) covers one that arrives with the wrong extension.

### Can I convert a Google Doc?

Yes, by way of Word's format. In Google Docs choose File, Download, Microsoft Word, then drop that `.docx` here.

### Why did my title not become a heading?

Word's Title style is not a heading style. Restyle the line as Heading 1 before converting, or put `# ` in front of it afterwards.

### What happens to comments and tracked changes?

Comments are dropped. Tracked changes come out as if all were accepted: inserted text stays and deleted text is gone, but text moved while tracking was on is lost from both places. Accept or reject every change in Word before you convert.

### Which formatting is worth keeping?

Less than it looks. [What not to keep from a .docx](/blog/what-not-to-keep-from-a-docx) goes through what Markdown cannot say and which losses matter.
