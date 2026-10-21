## What comes across

An `.odt` says what each part of it is, so its structure comes through as written.

| In the OpenDocument file | In the Markdown |
| --- | --- |
| Headings, and paragraph styles based on one | `#` to `######`, deeper levels as `######` |
| Bold, italic, strikethrough on words | `**bold**`, `*italic*`, `~~struck~~` |
| Bulleted and numbered lists | `-` and `1.` lists, two spaces in per level |
| A table | A Markdown table, its first row with text as the header |
| Merged cells | The text once, then empty cells, so columns stay in line |
| Footnotes and endnotes | `[^1]` in the text, the notes at the end, in one sequence |
| A hyperlink | A link to the same address |
| A picture | Embedded in the document, its title (not its description) as the alt text |
| A line break (Shift+Enter) | A line ending in a backslash |

Every numbered item is written `1.`, so a list that started at 5 starts at 1. If the document does not open with a Heading 1, one is added: the title set under File, Properties, or else the file name.

## What is left behind

- **Appearance.** Underlining, superscript and subscript, colours, fonts and sizes. Bold or italic set in a paragraph's style, not on its words, is lost too.
- **Styles that are not headings.** Title, Subtitle, Quotations and Preformatted Text become ordinary paragraphs.
- **Headers and footers,** with their page numbers: only the body is read.
- **Frames.** Words in a frame are dropped unless it is anchored to the page; a text box's words run into the sentence around it.

## An example

An `.odt` opening with a Heading 1, then a paragraph with bold, italic, a footnote and a link, a nested list, a table and a titled photograph, becomes this, the picture's base64 shortened:

```markdown
# Findings

The north gutter is **blocked** and two tiles are *cracked*.[^1] Prices are on the [supplier’s page](https://example.com/tiles).

- Clear the gutter
  - North side only
- Replace two tiles

| Job | Cost |
| --- | --- |
| Gutter | £80 |
| Tiles | £240 |

![The blocked north gutter](data:image/png;base64,iVBORw0KGgo…)

[^1]: Seen from the scaffold on 3 March.
```

Had `roof-survey.odt` opened with a Title-style line, that line would stay a plain paragraph under `# roof-survey`.

## Limits

- `.odt` only, up to 50 MB; not `.ods`, `.odp` or flat `.fodt`. Several files dropped together count together and become one document.
- The file is read in your browser, not uploaded. Nothing goes to an account unless you are signed in and press Save, and a saved document can be at most 4 MB.
- Pictures travel inside the Markdown, about 1 MB each once encoded and 2 MB per file. One that does not fit, or is a WMF or EMF, keeps its path inside the `.odt` and arrives as a broken picture.
- **Comments run into the text:** author, date and comment land inside the sentence. Delete them before converting.
- **Recorded tracked changes** put the name and date of every change, and each deleted passage, at the top. Accept or reject them all in Writer first.
- **A table of contents** arrives as its heading twice and its entries as links with page numbers.
- Lists nested under a numbered item fall out of it when rendered: two spaces is too little indent under `1.`.
- A password-protected `.odt` cannot be read; save a copy without the password.

## Questions

### How do I open an .odt file?

LibreOffice Writer opens one free on any desktop, and so do Word and Google Docs. To read one without installing anything, drop it here and read the preview; [how to open an .odt file](/how-to/open-odt) has the rest.

### How do I convert ODT to Markdown?

Drop the `.odt` here, check the preview and press Download .md. `notes.odt` comes down as `notes.md`; Copy Markdown puts the text on the clipboard instead.

### Are footnotes kept?

Yes, as Markdown footnotes, which the preview renders as numbered notes. Not every Markdown tool shows them: [Markdown footnotes](/blog/markdown-footnotes-support) lists which ones do.

### Why is my file name at the top as a heading?

The document did not begin with a Heading 1, or recorded changes came first. Set a title under File, Properties and that goes there instead, or start with a Heading 1 and nothing is added.

### Can it convert .ods or .odp files?

No, only text documents. Save a spreadsheet as `.xlsx` in LibreOffice Calc and use Excel to a Markdown table, or a presentation as `.pptx` in Impress and use PowerPoint to Markdown.
