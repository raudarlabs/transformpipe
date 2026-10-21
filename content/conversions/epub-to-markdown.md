## What comes across

An `.epub` is a zip of XHTML pages, and the whole book becomes one Markdown document: the title as a heading, the first author in italics, a list of the chapters, then each chapter as its own section under a `# Chapter title` heading, with a horizontal rule between them.

The order is the reading order in the spine of the book's package file, not the order of the file names. Titles come from the book's table of contents (the EPUB 3 navigation document or the older `toc.ncx`); for a chapter not listed there, its first `<h1>`, `<h2>` or `<h3>` is used, in that order, then its `<title>`, then "Chapter 4" by position.

| In the book | In the Markdown |
| --- | --- |
| Headings inside a chapter | `##`, `###` and so on, at the level the book set |
| Bold, italic, lists, tables | `**bold**`, `*italic*`, Markdown lists and tables |
| Links to websites | Kept, with their addresses |
| Links between chapters, footnote markers | Their words only, such as `\[1\]` |
| Pictures inside the archive | Embedded in the document |
| The EPUB 3 contents page | Left out; the document writes its own |

A chapter's opening heading is dropped when it repeats the title, unless it is numbered, like "1. The Light", or has brackets, underscores, asterisks or other characters Markdown escapes.

## What is left behind

- **The cover picture.** The picture the book names as its cover is never embedded. A cover page drawn as an SVG disappears with it; one written as a plain `<img>` leaves a short section linking to a missing picture.
- **Styling.** The stylesheet and embedded fonts are not read: typefaces, drop caps, colours and underlining go, and so does inline SVG, with any picture framed in it. Pictures placed with `<img>`, SVG files included, are carried.
- **Most of the metadata.** Only the title and the first author are read; the publisher, ISBN, language and date are not.
- **Nesting in the contents.** A part with chapters under it becomes one flat list, a section per file in the spine, and a page with only its title is left out.

## An example

*The Lighthouse Keeper* by Mary Hale is an EPUB 3 book with an SVG cover, two chapters stored as `index_split_030.xhtml` and `index_split_002.xhtml` (read in that order) and a Notes page, plus a map, a footnote marker, a table and a link back to chapter one. It becomes this, with the base64 shortened:

```markdown
# The Lighthouse Keeper

*Mary Hale*

- The Light
- The Storm
- Notes

---

# The Light


The lamp was lit at *dusk*, as it had been for forty years.\[1\]

![Map of the headland](data:image/png;base64,iVBORw0KGgo…)

See [the register](https://example.org/lighthouses).

---

# The Storm


| Night | Wind |
| --- | --- |
| Monday | Force 9 |

Back to the first chapter.

---

# Notes

\[1\] Since 1884.
```

## Limits

- **50 MB per upload.** Several books dropped at once are chained into one document, and the limit applies to their total.
- **Pictures share an allowance.** Each is embedded only if it is under about 750 KB, and a book's pictures together get about 1.5 MB, spent in reading order. Past that, a picture keeps its path inside the archive, which shows nothing.
- **It runs in your browser.** The book is not uploaded. The Markdown reaches an account only if you sign in and press Save, and a saved document can be up to 4 MB.
- **Only `.epub`.** A Kindle `.mobi` or `.azw3` is refused.

## Questions

### How do I open an EPUB file?

To read one, use an app such as Apple Books or Calibre; [How to open an .epub file](/how-to/open-epub) covers the options. To get the words out, convert it here and read, copy or download the book as one page.

### Will the chapters be in the right order?

Yes. The order comes from the spine, the one place an EPUB states it, and the file names are ignored. [Converting an EPUB to Markdown](/blog/convert-epub-to-markdown) explains why the names cannot be trusted.

### What happens to footnotes?

The marker keeps its text, `[1]`, but no longer links anywhere, and the note stays where the book kept it, usually in a Notes chapter at the end. Notes are not turned into Markdown's `[^1]` footnotes.

### Can it convert a Kindle book or a book with DRM?

No. Only `.epub` is accepted, and nothing here decrypts a protected book, so its chapters come out as noise.

### Can I get each chapter as a separate file?

No. A book always becomes one document, but each chapter starts at its own `# ` heading after a horizontal rule, so splitting it by hand is simple.
