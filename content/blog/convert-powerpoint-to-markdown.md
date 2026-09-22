---
title: "Convert PowerPoint to Markdown: Slides, Speaker Notes and Reading Order"
description: What survives turning a .pptx into Markdown, where the speaker notes go, and what Pandoc's new deck reader still leaves behind — six routes compared
date: 2026-09-21
tag: Converting
keywords: powerpoint to markdown, convert pptx to markdown, pptx to markdown converter, powerpoint speaker notes to markdown, slides to markdown, convert presentation to text
---

A deck is the shortest version of an argument somebody has already made. That is exactly what makes it worth converting: the slides hold the structure, and the speaker notes hold the sentences the slides compressed away. Both are sitting in the `.pptx` file, in plain XML, and nearly every route out of PowerPoint throws one of them away — usually the notes, because they were never on screen to begin with.

### TL;DR

A `.pptx` is a zip of XML parts: one part per slide, one separate part per notes page, and the pictures in a `ppt/media/` folder. Converting it well is mostly a question of which of those parts a tool bothers to open. Pandoc will read one since version 3.8.3, released on 1 December 2025 — the widespread advice that it cannot is a year out of date — but its reader is marked alpha and opens no notes part at all, so "just use Pandoc" costs you the half of the deck that was never on screen (checked against the pandoc changelog and the reader's source, 22 September 2026). PowerPoint's own Outline/RTF export covers text in title and body placeholders and drops everything else, notes included. Exporting to PDF and converting the PDF turns a structured document into a page of positioned text and loses the structure that made the deck worth keeping. `python-pptx` reads both the slides and the notes and gives you the pieces, but you write the Markdown yourself. A converter that opens the parts directly — [TransformPipe's PowerPoint → Markdown](/powerpoint-to-markdown) is one — gives you a slide per heading with its notes underneath and its pictures embedded, in one pass.

What no route recovers: animations, transitions, build order, SmartArt as a diagram, and charts as anything but an image. Those were never text.

## What is actually inside a .pptx

Rename one to `.zip` and open it. The useful parts:

| Part | What it holds |
| --- | --- |
| `ppt/slides/slide1.xml` | One slide's shapes, in the order PowerPoint stores them |
| `ppt/slides/_rels/slide1.xml.rels` | That slide's links out: to pictures, to hyperlinks, to its notes page |
| `ppt/notesSlides/notesSlide1.xml` | The speaker notes for one slide, as a separate document |
| `ppt/media/image1.png` | Every picture, at full size, under its own name |
| `ppt/presentation.xml` | `<p:sldIdLst>` — the slide order, which is not the filename order |

Two of those rows are where most conversions go wrong.

The first is slide order. `slide1.xml` is not necessarily the first slide. The numbers are part identifiers assigned when a slide was created, and moving slides around in the editor does not renumber them. The real order lives in `<p:sldIdLst>` in `presentation.xml`, as a list of relationship ids that have to be resolved through `ppt/_rels/presentation.xml.rels` to get filenames. A converter that sorts by filename gives you a reordered deck, and a reordered deck is worse than no conversion, because it looks fine.

The second is the notes. They are not in the slide part at all. Each notes page is its own XML document, joined to its slide only through the relationship file. A tool that reads `ppt/slides/*.xml` and nothing else is not losing the notes through a bug — it never looked.

## The six routes, compared

| Route | Slides | Speaker notes | Pictures | Reading order | Effort |
| --- | --- | --- | --- | --- | --- |
| Copy and paste from the editor | Text only | No — not on screen | No | Whatever you clicked | High, per slide |
| PowerPoint → Outline/RTF | Placeholders only | No | No | Placeholder order | Low |
| PowerPoint → PDF → Markdown | As positioned text | Only if you print Notes Pages | Sometimes | Guessed from geometry | Medium |
| `python-pptx` script | Yes | Yes | With work | Yours to decide | High, once |
| Pandoc, 3.8.3 and later | Yes | No — no notes part is opened | Extracted | Slide order | Low |
| A converter that reads the parts | Yes | Yes | Embedded | Document order | Low |

## Pandoc reads a deck now, and still not the notes

This section used to say that Pandoc cannot read PowerPoint at all, which was true for nineteen years and stopped being true on 1 December 2025: version 3.8.3 added `pptx` as an input format, and `xlsx` in the same release. `pandoc -f pptx deck.pptx -t markdown` runs.

What it gives you is a slide's shapes as blocks, its tables as tables and its SmartArt flattened into text, in slide order. What it does not give you is the notes. The reader is four modules — the archive, the shapes, the slides and SmartArt — and not one of them opens `ppt/notesSlides/`, so every sentence the presenter wrote under the slide is dropped without a warning. Both new readers also carry `Stability : alpha` in their own headers, which is the authors being straight with you (checked against the reader's source on github.com/jgm/pandoc, 22 September 2026).

That is the whole of the difference now. The old advice failed loudly, at the first command; the new behaviour fails quietly, in the half of the file that was never on screen. If the notes are why you are converting the deck — and they usually are — the route has to be one that opens that part. [Alternatives to Pandoc for the Markdown side](/blog/pandoc-alternatives-for-markdown-to-html) covers what to do once the text is out.

## PowerPoint's own outline export

PowerPoint can save an outline: File, Save As, and pick Outline/RTF from the format list. On Windows this is a normal save-as option; on Mac the import side works with RTF but the export options differ by version, so check the format list in front of you (checked on support.microsoft.com, 21 September 2026).

What comes out is the text that lives in title and body placeholders, indented by outline level. What does not come out is everything else: text you typed into a shape or a free-floating text box rather than a placeholder, tables, pictures, and the speaker notes.

| Pros | Cons |
| --- | --- |
| Built in, no tool, no upload, no script | Placeholders only — a deck built out of text boxes exports nearly empty |
| Preserves heading levels as indentation | No notes, no tables, no pictures, no links |
| RTF converts on to Markdown cleanly | Silent about what it dropped |

**Who is this for?** A text-heavy deck built strictly from the standard layouts, where you want the bullet structure and nothing else. If you do take this route, the RTF that comes out still needs a second conversion — [RTF → Markdown](/rtf-to-markdown) handles that half.

## Export to PDF, then convert the PDF

Tempting, because every deck exports to PDF and there are a hundred PDF converters. The problem is what the export does: PDF has no headings, no lists and no tables, only glyphs at coordinates. A title is a title because it is large and near the top. A bullet list is a list because several lines start with the same character at the same indent. Every converter reading that PDF is reconstructing structure that the `.pptx` stated outright and the PDF threw away.

There is one thing this route can do that the others cannot without a script: File, Print, and choose Notes Pages as the layout, and you get the notes rendered under a picture of each slide. That is a PDF of the notes, not the notes as text, but it is the only click-only way out of the application that includes them.

| Pros | Cons |
| --- | --- |
| Works from any version, any platform | Structure is inferred from geometry, not read |
| Notes Pages layout is the only built-in route that includes notes | Notes come out as text under a rasterised slide image |
| Visual fidelity is exact | Tables usually arrive as loose text; two-column slides interleave |

**Who is this for?** A deck you cannot open in anything but the viewer that produced the PDF. Otherwise it converts a structured file into an unstructured one on purpose, which is a strange first move.

## A script, with python-pptx

If the decks are yours and there will be more of them, reading the file directly is the route that pays off. `python-pptx` opens any `.pptx` from PowerPoint 2007 onward, and it does expose the notes: `Slide.has_notes_slide` and `Slide.notes_slide.notes_text_frame` are part of the documented API (checked on python-pptx.readthedocs.io, 21 September 2026).

```python
from pptx import Presentation

deck = Presentation('deck.pptx')
out = []

for number, slide in enumerate(deck.slides, start=1):
    title = slide.shapes.title
    out.append(f'## {title.text}' if title and title.text else f'## Slide {number}')

    for shape in slide.shapes:
        if shape == slide.shapes.title or not shape.has_text_frame:
            continue
        for paragraph in shape.text_frame.paragraphs:
            text = ''.join(run.text for run in paragraph.runs).strip()
            if text:
                out.append(('  ' * paragraph.level) + f'- {text}')

    if slide.has_notes_slide:
        notes = slide.notes_slide.notes_text_frame.text.strip()
        if notes:
            out.append('> **Notes**')
            out.extend(f'> {line}' for line in notes.splitlines())

    out.append('')

print('\n'.join(out))
```

Note what the loop iterates: `deck.slides`, which python-pptx resolves through the slide id list, so the order is the deck's order and not the filenames'. That is the one hard part it does for you.

What the script above still does not do is the long tail: pictures (walk `shape.shape_type` for `PICTURE`, pull `shape.image.blob`, write it somewhere, emit a link), tables (`shape.has_table`, then rows and cells into a Markdown table), grouped shapes (a group is a shape containing shapes, so the loop needs to recurse), and hyperlinks (`run.hyperlink.address`, which is a different object from the run's text). Each is twenty lines. Together they are the reason this is a project rather than a snippet.

| Pros | Cons |
| --- | --- |
| Reads the real structure, notes included | You are writing and maintaining a converter |
| Repeatable across a folder of decks | Groups, tables, pictures and links are each their own pass |
| Nothing leaves the machine | Python dependency wherever it runs |

**Who is this for?** Somebody with a recurring pipeline and a specific output shape in mind — release decks into a repo, weekly readouts into a wiki.

## Reading order is the part nobody mentions

A slide's shapes are stored in the order they sit in the shape tree, which is roughly the order they were added and exactly the order they stack. That is not the order a person reads them. A slide with a heading, two columns and a caption underneath has a perfectly clear visual reading order and a shape tree that may well go caption, right column, heading, left column, because that is how it got built over three revisions.

Every converter picks a strategy, and they differ:

- **Document order** — emit shapes as the file lists them. Predictable, occasionally wrong, never surprising in a way you cannot see.
- **Geometric order** — sort by top, then left. Reads correctly more often, and scrambles a slide where a full-height sidebar starts above the main column.
- **Placeholder first** — title, then body placeholders, then everything else. Good on standard layouts, poor on designed slides.

There is no right answer, only a stated one. When a converted deck reads oddly, this is almost always why, and the fix is in the deck: put the shapes in reading order in PowerPoint itself, through the Selection pane, and convert again.

## Pictures, tables and the things that are not text

**Pictures** are the easy win, and the one most converters skip. They are already extracted — they sit in `ppt/media/` as ordinary PNG and JPEG files, at full resolution. A conversion that emits `![](image3.png)` and leaves you to find image3 has done half a job; one that embeds the bytes gives you a single file you can move. [What makes images and links survive a conversion](/blog/images-and-links-that-still-work) goes through the tradeoffs of each.

**Tables** convert if the tool reads `<a:tbl>`, which is the same table model Word uses. The catch is merged cells: a slide table with a merged header has no Markdown equivalent, and every tool resolves it differently — repeating the value, blanking the continuation cells, or dropping the row. [Tables that survive conversion](/blog/markdown-tables-that-survive-conversion) covers what to check.

**Charts** are a data table plus a rendering, stored in a separate chart part with an embedded workbook. The rendered chart is an image; the numbers behind it are real data. Most converters take the image. If the numbers are what you wanted, they are in `ppt/embeddings/` as a small `.xlsx`, and an [Excel → Markdown conversion](/excel-to-markdown) will read it.

**SmartArt** is a drawing generated from a small XML data model. The text in it is recoverable; the diagram is not, in any target that is not itself a diagram format.

**Animations, transitions and build order** hold real meaning in some decks — the whole point of a slide can be that three items appear one at a time. None of it has a Markdown form. If it matters, it belongs in the notes before the conversion, not after.

## A short checklist before converting a deck

1. **Open the Selection pane** and check the shape order on any slide with a non-standard layout. This costs a minute and fixes the single most common complaint about the output.
2. **Decide whether the notes are the point.** If they are, rule out the outline export and plain copy-paste immediately — neither can reach them.
3. **Check for text in pictures.** A slide whose content is a screenshot of a table converts to a picture of a table. Nothing downstream can read it.
4. **Look at what the charts are for.** If it is the shape of the line, take the image. If it is the numbers, go after the embedded workbook instead.
5. **Convert one slide's worth first** and read it. Reading order and notes handling are both visible in the first two slides, and both are cheap to discover early.

## Where this leaves you

For a single deck you need the text out of once, the outline export is thirty seconds and enough — as long as the deck was built from placeholders and the notes do not matter. For anything where the notes matter, and that is most decks worth converting, the choice is between writing a `python-pptx` script and using something that already reads the parts. [The PowerPoint → Markdown conversion here](/powerpoint-to-markdown) resolves the slide order through `<p:sldIdLst>`, puts each slide's notes under it as a blockquote, and embeds the pictures in the output so the result is one file — in the browser, so the deck is not uploaded anywhere. For the neighbouring format, [converting a .docx](/blog/convert-docx-to-markdown) runs into a different set of problems, most of them about styles rather than order.
