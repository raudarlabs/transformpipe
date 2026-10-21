## What comes across

The Markdown becomes Word's own structure: named styles, real numbering and real footnotes, not formatting laid over Normal text.

| In the Markdown | In the Word document |
| --- | --- |
| `#` to `######` | Heading 1 to Heading 6, listed in the navigation pane |
| `-` and `1.` lists, nested | Word numbering, nine levels deep; a top-level numbered list keeps its start |
| `- [ ]` and `- [x]` | ☐ and ☑ |
| `**bold**`, `*italic*`, `~~struck~~`, `==marked==`, `H~2~O`, `x^2^` | bold, italic, strikethrough, yellow highlight, subscript, superscript |
| `` `code` `` and fenced code | the Inline Code style; one shaded Code paragraph per block, in Consolas |
| `>` quotes and `[!NOTE]`-style alerts | the Quote style; a Note, Tip, Important, Warning or Caution style |
| a table | Table Grid, header row bold and repeated on each page, alignment kept |
| `[^1]` | a footnote at the foot of the page, numbered by Word |
| links to web or `mailto:` addresses, and to headings | hyperlinks; links to a bookmark on the heading |
| pictures | inside the file, shrunk to the page width if wider, alt text as the description |

The title property is the first heading, or the file name. Pages are A4, in Calibri 11 pt.

## What is left behind

- **Front matter.** The YAML block between `---` lines at the top is removed; its `title:` is not used.
- **Highlighting, diagrams and formulas.** Code has no syntax colours. A `mermaid` block is not drawn; its source stays, under a "Mermaid diagram" caption. `$…$` and `$$…$$` keep their TeX, set as code, not as Word equations.
- **Some pictures.** Only PNG, JPEG and GIF go in, and one embedded as a `data:` address always does. A WebP or SVG, a path on your disk, or a web address whose server will not let a browser read it becomes its description in brackets, as a link or in italics.
- **Links that lead nowhere.** A link to another file, or to a heading the document lacks, keeps only its words. So does a wikilink such as `[[Page|text]]`.
- **Raw HTML.** Tags are dropped and the words between them kept. A comment goes entirely, and so does a script or style written as a block of its own.
- **Page furniture.** No table of contents, header, footer or page number is added, though Word builds a contents table from the headings when asked. Columns come out equal in width, and the author property says TransformPipe.

## An example

```markdown
---
title: Release 2.4
---

# Release checklist

Before tagging, read [the build notes](#build-notes) and the
[runbook](https://example.com/runbook).[^1] The ==date== goes in
[the plan](../plans/q3.md).

1. Run the tests
2. Update `CHANGELOG.md`
   - [x] version bumped
   - [ ] date set

> [!WARNING]
> Do not tag on a Friday.

| Step  | Owner |
|:------|------:|
| Build | Ana   |

## Build notes

![Pipeline](pipeline.png)

[^1]: The runbook is internal.
```

The .docx holds these paragraphs, with their styles:

```text
Heading 1       Release checklist
Normal          Before tagging, read the build notes and the runbook.¹ The date goes in the plan.
List Paragraph  1. Run the tests
List Paragraph  2. Update CHANGELOG.md
List Paragraph       ☑ version bumped
List Paragraph       ☐ date set
Warning         Warning
Warning         Do not tag on a Friday.
Table Grid      Step  | Owner
                Build |   Ana
Heading 2       Build notes
Normal          [Pipeline]
Footnote Text   ¹ The runbook is internal.
```

"the build notes" jumps to its heading. "the plan" pointed at a file on disk, so it is plain words; `[Pipeline]` stands in for a picture the document never held.

## Limits

- `.md`, `.markdown`, `.mdown` and `.mkd` files up to 10 MB, or pasted Markdown. Several files dropped together share the 10 MB and become one document, separated by rules.
- The .docx is built in your browser. Nothing goes to an account unless you sign in and press Save; a saved document can be at most 4 MB.
- Pictures at web addresses are requested by your browser, ten seconds each at most.

## Questions

### How do I convert Markdown to Word?

Drop the .md file here or paste the Markdown, check the preview, and press Download .docx. To open the result without Word, see [How to open a .docx file](/how-to/open-docx).

### Can I import Markdown into a Word document I already have?

Convert it here first, then bring the .docx in with Word's Insert, Object, Text from File. Its headings arrive as Heading 1 to 6.

### Is this the same as Pandoc's Markdown to Word?

No. Pandoc is a program you install, and copies styles from a reference .docx. This takes no template, but its headings, text, lists, quotes, tables and footnotes carry Word's built-in style names, so applying your house template in Word restyles them all. [Markdown to Word](/blog/markdown-to-word) compares Pandoc's reference document with the other routes.

### Should the source be Markdown or .docx?

Keep the Markdown as the original when it lives in a repository or changes often; send the .docx to readers who work in Word. Their edits return only by converting the .docx back. [Markdown vs Word for documentation](/blog/markdown-vs-docx-for-documentation) works through the decision.
