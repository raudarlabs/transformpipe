---
title: "Convert an EPUB to Markdown: Spine Order, Chapter Titles and Footnotes"
description: An EPUB is a website in a zip — what Pandoc, calibre and a direct read each give you, and the four things that break when a book becomes one Markdown file
date: 2026-09-21
tag: Converting
keywords: epub to markdown, convert epub to markdown, ebook to markdown, epub to text, calibre epub to markdown, pandoc epub markdown
---

An EPUB is a small website that happens to be sold as a book: XHTML files, a stylesheet, images, and an index that says which order to read them in. That makes it the friendliest of the document formats to convert, and it is why the interesting problems are not about parsing at all. They are about what happens when a hundred and eighty separate files become one Markdown document and every link between them stops pointing at anything.

### TL;DR

Rename a `.epub` to `.zip` and you can read the whole thing. `META-INF/container.xml` points at the package document, and the package document's spine is the reading order — which, as with every zipped format, is not the filename order (checked on w3.org, 21 September 2026). Pandoc reads EPUB directly and reads it well: `pandoc -f epub -t gfm book.epub -o book.md --extract-media=media`. calibre can also produce Markdown, through TXT output: `ebook-convert book.epub book.txt --txt-output-formatting=markdown`, but it strips links and image references unless you pass `--keep-links` and `--keep-image-references` (checked on manual.calibre-ebook.com, 21 September 2026). A converter that reads the parts directly — [EPUB → Markdown](/epub-to-markdown) is one — resolves the spine, takes chapter titles from the navigation document, and turns the cross-chapter links into something that still works inside one file.

What breaks regardless: links between chapters, `epub:type` footnotes, page-list references, and anything in a fixed-layout book, which is images with text drawn into them.

## What is inside an .epub

| Path | What it is |
| --- | --- |
| `mimetype` | The first entry in the zip, uncompressed, saying this is an EPUB |
| `META-INF/container.xml` | The one file at a fixed path — it names the package document |
| `OEBPS/content.opf` | The package document: metadata, a manifest of every file, and the spine |
| `OEBPS/nav.xhtml` | EPUB 3's navigation document — the table of contents, as a nested list |
| `OEBPS/toc.ncx` | EPUB 2's equivalent, still present in most books for compatibility |
| `OEBPS/chapter-12.xhtml` | One chapter, as ordinary XHTML |
| `OEBPS/images/` | The pictures, including the cover |

Two rules make this easy to read and one makes it easy to get wrong. The easy parts: `META-INF/container.xml` is the only path you have to know, because everything else is discovered from it, and the content is XHTML, which any HTML parser already handles. The hard part is the same one every zipped format has: the spine defines the reading sequence, and nothing else does. `chapter-12.xhtml` may be the third chapter, the appendix, or an unused file left in the manifest. Sorting by filename produces a book in an order nobody wrote.

## The three routes

| Route | Reading order | Chapter titles | Images | Cross-chapter links | Footnotes |
| --- | --- | --- | --- | --- | --- |
| Pandoc | From the spine | From the headings | `--extract-media` | Kept, pointing at files that are gone | Kept as links |
| calibre TXT/Markdown | From the spine | From the headings | Off by default | Off by default | Kept as links, if links are kept |
| Reading the parts directly | From the spine | Navigation document first, headings second | Embedded | Rewritable to in-document anchors | Resolvable to the note's text |
| Copy from a reader app | Whatever you selected | No | No | No | No |

## Pandoc, which does read EPUB

Unlike PowerPoint — where `pptx` is an output format only — `epub` is in Pandoc's list on both sides (checked on pandoc.org, 21 September 2026). This is the shortest good answer for a book you want as one file:

```bash
pandoc -f epub -t gfm book.epub -o book.md --extract-media=media
```

`--extract-media` writes every image out to the folder you name and rewrites the image links to point at it, which is what you want, because the alternative is Markdown referring to files still sealed inside the zip. Add `--wrap=none` if the hard-wrapped output bothers your diffs.

What you get is a faithful, flat document: every chapter's headings at the level the XHTML used them, the paragraphs in spine order, the images beside the file. What you do not get is any acknowledgement that the chapters used to be separate documents. Every `<a href="chapter-13.xhtml#note-4">` in the book is now a link to a file that does not exist, sitting in a Markdown document that contains the thing it was pointing at, a few hundred lines further down.

| Pros | Cons |
| --- | --- |
| One command, no configuration, high fidelity | Cross-chapter links survive as broken relative paths |
| Spine order handled correctly | Chapter titles come from the headings, so a book whose chapter openers are images has unnamed chapters |
| `--extract-media` solves images properly | Front matter, copyright pages and the index all come through as chapters |

**Who is this for?** Anybody with Pandoc already installed and a book whose structure is conventional. It is the right default, and the link problem is a find-and-replace away.

## calibre, and the two flags that matter

calibre's `ebook-convert` is the other tool most people already have, and it can reach Markdown through its TXT output:

```bash
ebook-convert book.epub book.txt \
  --txt-output-formatting=markdown \
  --keep-links \
  --keep-image-references
```

The formatting option takes `plain`, `markdown` or `textile`. The two `--keep` flags are the part worth knowing about, because their absence is silent: the documentation states that links are always removed with plain text output, and that keeping them is only meaningful once a formatting option is set (checked on manual.calibre-ebook.com, 21 September 2026). Run the command without them and you get a clean, readable, link-free book, and nothing tells you there were four hundred links in it.

`--keep-image-references` has the mirror-image catch to Pandoc's: it keeps the references and does not extract the files, so you end up with `![](../images/fig-3.png)` pointing into a zip you no longer have open. calibre will happily also produce an HTMLZ output containing the images, at which point you are doing the extraction by hand anyway.

| Pros | Cons |
| --- | --- |
| Already installed wherever a library is managed | Two non-obvious flags stand between you and a lossless run |
| Handles a much wider range of malformed books than Pandoc | Image references are kept, image files are not |
| Batch conversion across a library is a one-liner | The Markdown is a byproduct of a text exporter, not a target format |

**Who is this for?** Somebody converting many books at once, or one book that Pandoc refuses. It is also the more forgiving reader of the two, which matters more than it should — a surprising share of real EPUBs are not valid.

## Reading the parts yourself

The whole format is four steps, and they are short enough to be worth knowing even if you never write them:

```text
1. unzip the file
2. read META-INF/container.xml → <rootfile full-path="OEBPS/content.opf">
3. read the opf:
     <manifest> → id → href, media-type
     <spine>    → ordered list of idrefs
4. for each idref in spine order: parse the XHTML, convert it, append
```

Doing it this way is worth the effort for exactly one reason: you have both the spine and the navigation document in hand at the same time, and that is what makes the chapter titles and the links come out right. Neither Pandoc nor calibre uses the navigation document for titles — they take what the XHTML headings say, which is usually the same thing and sometimes is not.

## The four things that break, and what to do about them

### Chapter titles that are not in the chapter

A book's chapter opener is frequently a designed image — the chapter number set in a display face, exported as a PNG — with the actual text appearing nowhere in the XHTML. The navigation document still knows the chapter is called "The Second Winter", because that is the string the reader app shows in its table of contents. A conversion that reads only the chapter files produces a document with no headings at all in it, and no obvious explanation for why.

The fix is to take the title from the navigation document, keyed by the file it points at, and to fall back to the first heading only when the navigation has nothing. [EPUB → Markdown here](/epub-to-markdown) reads both `nav.xhtml` and `toc.ncx` for exactly this, because plenty of EPUB 3 files carry an NCX with better labels than their nav.

### Links between chapters

This is the one that makes a book different from a document. Inside the EPUB, `<a href="ch13.xhtml#fn4">` is a working link to another file. In a single Markdown document, both the source and the target are in the same file, and the link is a relative path to a file that does not exist.

There are three defensible answers, and the wrong one is doing nothing:

- **Rewrite to an in-document anchor.** `ch13.xhtml#fn4` becomes `#fn4`, which works if the target's id survived into the Markdown and the renderer emits ids for headings. Best result, most work.
- **Drop the link, keep the text.** The sentence reads correctly and nothing is broken. This is what a conversion should do by default.
- **Leave the href alone.** The document now contains links that fail silently. This is what most conversions do.

### Footnotes

EPUB 3 marks footnotes with `epub:type="noteref"` on the link and `epub:type="footnote"` on the target, which usually lives at the end of the chapter or in a notes file of its own. Markdown has a footnote syntax in most flavours, and it is a genuinely good target: `[^4]` in the text, `[^4]: the note` at the bottom. Almost nothing makes that mapping, because it requires reading the `epub:type` attributes and matching the ids across files rather than just converting each file on its own. [What Markdown does and does not do with footnotes](/blog/markdown-footnotes-support) covers which renderers support the syntax once you have it.

### Fixed-layout books

Comics, children's books, cookbooks and most illustrated non-fiction ship as fixed-layout EPUB: one image per page, absolutely positioned, with the text baked into the picture. There is no text to convert. A conversion of such a book produces a list of images and a handful of page numbers, and this is not a tool failure — the words were never characters in the first place. Check for `<meta property="rendition:layout">pre-paginated</meta>` in the package document before spending time on it.

## The things that are not going to work

**A DRM-protected book.** Its content files are encrypted and listed in `META-INF/encryption.xml`, and every tool above reads the zip, finds ciphertext, and fails. This is the intended behaviour of the format, and nothing in this article is a way around it. Books bought without DRM, books published under a licence that allows it, and your own manuscripts are all ordinary EPUBs.

**Real typography.** Drop caps, small caps, hanging punctuation, kerned display type, and the careful control of widows and orphans are all stylesheet decisions. Markdown has no way to express any of them and, on the whole, should not. What it costs you is worth naming out loud when the thing you are converting is a designed book rather than a manuscript.

**The stylesheet's semantics.** A book that distinguishes an epigraph from a pull quote from a block quotation does so with three CSS classes on three blockquotes. Markdown has one blockquote. Something is going to be lost, and which of the three matters most is a decision only you can make — before conversion, by changing the markup, not after.

## A checklist for a book you actually care about

1. **Check the layout property** for `pre-paginated` before anything else. If it is fixed-layout, stop.
2. **Count the spine items** and count the chapters in the finished Markdown. A mismatch usually means front matter was merged or a section was skipped.
3. **Search the output for `.xhtml`.** Every hit is a link that used to work.
4. **Look at the first heading of each chapter.** If several chapters begin with a picture and no heading, the titles came from the wrong place.
5. **Decide about the front and back matter.** Copyright page, dedication, index and colophon all convert, and in a document you are going to edit they are usually noise. They are also the easiest thing to strip once, at the start.
6. **If the book has notes, check one of them end to end** — the marker in the text, the note itself, and whether anything still connects them.

## Where this leaves you

For one book, `pandoc -f epub -t gfm --extract-media=media` and ten minutes fixing links is the shortest honest path. For a shelf of books, calibre with the two `--keep` flags batches cleanly. For a book whose notes and chapter titles matter — a reference work, a manuscript coming back from a publisher, anything you intend to keep editing — the difference is in the parts the general-purpose tools do not read, and [the EPUB → Markdown conversion here](/epub-to-markdown) takes the titles from the navigation document and embeds the pictures so the result is a single file. Once it is Markdown, [merging and splitting it](/blog/merging-many-markdown-files) is a different and much easier problem.
