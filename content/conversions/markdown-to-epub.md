## What comes across

The book is made from the page the preview draws, cut into chapters and packed as EPUB 3.

| In the Markdown | In the book |
| --- | --- |
| headings | chapters, cut at `#` if used twice or more, otherwise at `##` on the same terms |
| `$…$`, `$$…$$` and `mermaid` blocks | formulas as MathML; diagrams drawn as SVG, in light colours |
| fenced code in a known language | monospace, keywords in bold, comments in italics |
| tables, quotes, `[!NOTE]`-style alerts | ruled tables, quotes with a left rule, alerts with a coloured edge and title |
| `==marked==`, `- [ ]`, `- [x]` | a highlight, ☐, ☑ |
| `[^1]` | a numbered note at the end of the book, linked both ways |
| links to headings, web and `mailto:` addresses | links; one to a heading finds whichever chapter it landed in |
| pictures embedded as `data:` | files inside the book: PNG, JPEG, GIF, WebP or SVG |
| pictures at web addresses | fetched by your browser and put inside the book, where the server allows |

The contents list each chapter by its first heading and, when there are several, the next heading level under each, as an EPUB 3 navigation page and an older `toc.ncx`. The title is the first heading at level 1 to 3, or the file name; the language is this site's, `en` here. No font or text colour is set for the prose, so the reader's own font, size and night mode apply.

## What is left behind

- **Front matter.** The YAML block at the top is removed; its `title:` and `author:` are not read ([more on front matter](/blog/front-matter-and-what-converters-do-with-it)).
- **Author and cover.** Neither is recorded: only a title, a language, a date and an identifier, new at every download.
- **Some pictures.** One on your disk, or embedded in another format, becomes its description in brackets, in italics; one at a web address the browser cannot fetch or a book cannot show becomes a link under that description.
- **Links out of the document.** A link to another file, or to a heading that does not exist, keeps only its words. So does a wikilink.
- **Colour.** Highlighted code is bold and italic, never coloured.
- **Raw HTML.** A `<details>` block is opened out, its summary left as plain text.

## An example

```markdown
---
title: Field notes
author: J. Hale
---

# Field notes

A year of walks round the reservoir.

## Spring

Snowdrops by the north gate.[^1]

![North gate](https://example.com/gate.jpg)

## Summer

The path floods in June; take [the dry route](#spring) instead.

- [x] Boots
- [ ] Map

[^1]: Counted on 4 March.
```

One `#` and two `##` put the cut at `##`. A bare title would open the first chapter; this one has a paragraph, so the two are a chapter of their own:

```text
mimetype
META-INF/container.xml
OEBPS/content.opf
OEBPS/toc.ncx
OEBPS/style.css
OEBPS/nav.xhtml
OEBPS/chapter-1.xhtml
OEBPS/chapter-2.xhtml
OEBPS/chapter-3.xhtml
```

The contents read Field notes, Spring, Summer. Here the picture's server is taken to refuse the browser, so chapter 2 links to it as `[North gate]`; otherwise it would be `OEBPS/images/picture-1.jpg`. Chapter 3 reads:

```html
<h2 id="doc-summer">Summer</h2>
<p>The path floods in June; take <a href="chapter-2.xhtml#doc-spring">the dry route</a> instead.</p>
<ul>
<li>☑ Boots</li>
<li>☐ Map</li>
</ul>
<hr class="md-fnrule" />
<ol class="md-footnotes">
<li id="doc-fn-1">Counted on 4 March. <a href="chapter-2.xhtml#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

## Limits

- `.md`, `.markdown`, `.mdown` and `.mkd` files up to 10 MB, or pasted Markdown. Several files dropped together share the 10 MB and become one book, separated by rules.
- The book is made in your browser, and only there: it needs the browser's HTML parser, so the API makes no EPUB. Nothing goes to an account unless you sign in and press Save; a saved document can be at most 4 MB.
- Pictures at web addresses are requested by your browser, ten seconds each at most.

## Questions

### How do I convert Markdown to EPUB?

Drop the .md file here or paste the Markdown, check the preview, and press Download .epub. [How to make an EPUB from Markdown](/how-to/make-epub) covers which readers open it and how to check it.

### Why is my book one long chapter?

Chapters are cut only at `#` or `##`, and only at a level used at least twice. A document headed with `###` throughout, or with one `#` and one `##`, stays one chapter.

### Can I set the author, the cover or the language?

Not here. The title comes from the first heading and the language from the site, so the German site makes a book marked `de`. Calibre can add the author and cover a store will want.

### Will it open on a Kindle?

Send to Kindle has taken EPUB since 2022, and Apple Books, Google Play Books and Kobo open it directly. Formulas and diagrams travel as MathML and SVG, which some older e-ink readers do not draw.
