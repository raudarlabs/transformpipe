---
title: "Ten Markdown Converters Compared by What They Will Not Read"
description: Every comparison counts formats supported. The useful count is the other one — what each of ten converters refuses, and whether it tells you before or after
date: 2026-09-22
tag: Converting
keywords: markdown converter comparison, best markdown converter, pandoc vs markitdown, docling vs markitdown, document converter comparison, convert to markdown tool
---

Every converter's front page counts upward: three hundred formats, twenty-five thousand conversions. The number is real and almost useless, because a format list is a list of things that will not immediately error. What separates these tools is the other list — the one nobody publishes — of what each will not read at all, what it reads and quietly discards, and whether you find out before you rely on the output or three documents later.

### TL;DR

Ten tools, checked against their own documentation on 22 September 2026. Pandoc reads `docx` and `epub` and does not read `pptx` at all. calibre reaches Markdown through its text exporter and removes every link unless you pass two flags. LibreOffice Writer can now save Markdown directly, as CommonMark. Google Docs can export it, with the copy-and-paste half switched off by default. MarkItDown reads PowerPoint including the speaker notes. Docling reads the widest input list of anything here. CloudConvert converts a deck to Markdown and does not list EPUB as a source. Turndown reads HTML and nothing else, on purpose. Mammoth reads `.docx` and produces HTML, not Markdown. python-pptx gives you the parts and no output format at all.

None of them is bad. Each was built for a different shape of problem, and the mismatch between that shape and yours is where conversions go wrong.

## The seven questions that actually separate them

Counting formats hides the differences. These seven do not:

1. **Does the file leave your machine?**
2. **Does it read the container, or only the text?** A `.pptx` is a zip of XML parts; reading `ppt/slides/*.xml` and stopping is a different tool from one that also opens `ppt/notesSlides/` and `ppt/media/`.
3. **What happens to the pictures** — embedded, written out beside the file, or referenced into a folder that does not exist?
4. **Does it say what it dropped?** Silence is the expensive property.
5. **Is Markdown a target or a byproduct?** A text exporter that grew a Markdown mode behaves differently from a converter aimed at Markdown.
6. **Can it read a folder as one document?** An export from Notion, Confluence or Obsidian is many files and one document.
7. **Does it install, sign in, or neither?**

## The table

Checked against each project's own documentation, 22 September 2026.

| Tool | Runs | Reads pptx | Reads epub | Markdown is | Pictures |
| --- | --- | --- | --- | --- | --- |
| Pandoc | Locally | No — output only | Yes | A first-class target | `--extract-media` writes them out |
| calibre | Locally | No | Yes | A TXT output mode | References kept only with a flag |
| LibreOffice Writer | Locally | Opens the deck, saves from Writer | Yes | A save-as filter, CommonMark | Not addressed in the docs |
| Google Docs | Hosted | Opens it, exports from Docs | No | Download and import | Not addressed in the docs |
| MarkItDown | Locally | Yes, with notes | Yes | The only target | Filenames, or data URIs on request |
| Docling | Locally | Yes | Yes | One of several outputs | Embedded or referenced |
| CloudConvert | Hosted | Yes | Not listed for md | One output among hundreds | Server-side, per the service |
| Turndown | A library | No | No | The only target | Passed through from the HTML |
| Mammoth | A library | No | No | Not produced — HTML is | A callback you write |
| python-pptx | A library | Yes, including notes | No | Nothing is produced | `shape.image.blob`, yours to write |

## What each one is, in a paragraph

**Pandoc** is the reference implementation of the idea that documents have a common structure. Its format list is asymmetric in a way worth internalising: `docx` appears as both reader and writer, `epub` likewise, and `pptx` only as a writer. `pandoc -f pptx` is not a poor conversion, it is an error. For everything it does read, it is the most faithful tool here and the most scriptable. [Lighter alternatives](/blog/pandoc-alternatives-for-markdown-to-html) exist for the one-file case.

**calibre** converts ebooks, and Markdown is reachable through its text output: `--txt-output-formatting=markdown`. The catch is documented and silent in practice — links are always removed with plain text output, so without `--keep-links` and `--keep-image-references` you get a clean, readable, link-free book and no warning that four hundred links were in it. It is also the most forgiving reader of malformed EPUBs, which matters more than it should.

**LibreOffice Writer** now saves Markdown directly: File, Save as, Markdown Document (.md), and the documentation states that it implements the CommonMark specification. That is a meaningful change — the standard advice for years was to route through HTML — and the documentation does not say what becomes of images or tables, which is exactly the kind of gap worth testing on your own document before trusting it on fifty.

**Google Docs** imports and exports Markdown, with the export on by default; "Copy as Markdown" and "Paste from Markdown" are separate and off until you turn them on under Tools, Preferences, Enable Markdown. It is the converter most people already have, and its limits are the obvious ones: your document is already on somebody's server, and anything Docs cannot represent was lost on the way in, not on the way out.

**MarkItDown**, from Microsoft, is aimed squarely at Markdown and reads PowerPoint properly — including `slide.has_notes_slide`, which it writes out under a `### Notes:` heading. Pictures come out as filename references by default and as data URIs when asked; charts become tables where it can read them and an explicit `[unsupported chart]` where it cannot. That last detail is the good habit: it says what it could not do. Where it stops, and what to reach for instead, is [a list of its own](/blog/markitdown-alternatives).

**Docling**, from IBM, reads the widest list here — Office formats, OpenDocument, PDF, EPUB, HTML, images, and more — and writes Markdown among several outputs. It is the heaviest of the local tools, and the one to reach for when the input is a pile of mixed formats rather than one known one.

**CloudConvert** converts a deck to Markdown, which most tools here cannot, along with `docx`, `odt`, `rtf`, `pdf` and about twenty others. EPUB is not among the sources it lists for Markdown output. It is a server, so the document is uploaded, and that is the first question rather than the last. [Whether an online converter is safe](/blog/is-an-online-converter-safe) is about how to check that rather than assume it.

**Turndown** converts HTML into Markdown and takes nothing else. That is not a limitation, it is the design, and it is why every other JavaScript tool in this space ends up with Turndown or a sibling underneath it. [The HTML-to-Markdown libraries](/blog/turndown-and-html-to-markdown-libraries) differ mostly in how they handle the awkward cases.

**Mammoth** reads `.docx` and produces HTML, deliberately: it maps Word's styles to semantic elements and ignores the visual detail. It does not produce Markdown, so it is half of a pipeline, and its own documentation is clear that the mismatch between `.docx` structure and HTML structure means complicated documents will not convert perfectly. [How mammoth and the docx parsers differ](/blog/mammoth-js-and-docx-parsers) covers the rest.

**python-pptx** reads a deck properly — slide order resolved through the id list, `Slide.notes_slide.notes_text_frame` for the notes, `shape.image.blob` for the pictures — and produces nothing. It is a library for building your own converter, and the reason it appears in a comparison of converters is that for recurring PowerPoint work it is frequently the right answer. [Converting PowerPoint to Markdown](/blog/convert-powerpoint-to-markdown) has a working script.

## Where the tool behind this site sits, including what it does not do

TransformPipe converts fifteen things to and from Markdown in the browser, which answers questions one, three and seven: the file is not uploaded, the pictures are embedded as data URIs so the output is a single file, and there is nothing to install. It reads the containers rather than the text — slide order from `<p:sldIdLst>`, chapter titles from an EPUB's navigation document, Evernote resources matched by MD5 — and it reads an export folder as one document with a table of contents, which answers question six.

The honest other half:

- **No PDF input.** A PDF is glyphs at coordinates and reconstructing structure from it is a different discipline. CloudConvert, Docling and MarkItDown all read PDF; this does not.
- **No LaTeX, no reStructuredText, no legacy `.doc` or `.ppt`.** Pandoc covers the first two, LibreOffice the second two.
- **A four megabyte ceiling** on a saved document, which follows from a platform limit rather than a choice, and two megabytes of that for pictures.
- **Not a batch tool.** Converting five hundred files belongs in a script with Pandoc or Docling in it, not in a browser tab.
- **Browser-side means your machine does the work,** so a very large file is limited by the tab's memory rather than by a server's patience.

A comparison where the tool being sold wins every row is not a comparison. These five rows are where somebody else's tool is the right answer, and knowing which row you are standing on is the whole exercise.

## How to choose in one pass

- **The document is confidential.** Browser-side or offline. This eliminates the hosted services before any feature question, and it is not a matter of trusting a policy — it is observable in a network tab.
- **The conversion repeats.** Pandoc or Docling in a script. A web page that a person has to open is not a pipeline.
- **The input is a pile of mixed formats, including PDFs.** Docling.
- **It is a deck and the notes matter.** MarkItDown, python-pptx, or a converter that opens the notes parts.
- **It is a book.** Pandoc with `--extract-media`, or calibre with both `--keep` flags.
- **It is one file, now, and you want to look at the result.** A browser-side converter, because the round trip through upload, queue and download is longer than the conversion.
- **You are building this into software.** A library — Turndown, Mammoth, python-pptx — and accept that you are now maintaining a converter.

## The test document worth keeping

Whichever you pick, the way to compare them honestly takes ten minutes. Build one document that contains the six things that break: a heading that came from bold text rather than a heading style, a table with a merged cell, a picture, a footnote, a nested list, and a link to another file in the same export. Run it through the two or three candidates and read the output.

Every difference in the table above will show up in that one document, and it will show up for your documents rather than for a reviewer's. The format count on the front page will not have told you any of it. For the broader field — including the hosted services, the office suites and the browser's own Save As — [the roundup of online document converters](/blog/best-online-document-converters) sorts them by where the file goes instead.
