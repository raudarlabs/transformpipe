## What comes across

The deck becomes one document: a list of the slide titles, then a section per slide, separated by horizontal rules. Slides come in the order the deck plays, so a slide dragged to the front stays there. Within a slide, shapes are read in the order the file stores them.

| On the slide | In the Markdown |
| --- | --- |
| The title | The heading, or a short first line, or "Slide 4" |
| Bullets and numbers set on the slide | A list, `-` or `1.`, indented by level |
| Other text | Paragraphs |
| Bold and italic words | `**bold**` and `*italic*`, unless the whole line is |
| A web link | A Markdown link to the same address |
| A table | A Markdown table, first row as the header |
| A picture | An embedded image with its alt text |
| Speaker notes | A quotation under the slide, headed **Notes** |

Outside tables, an asterisk or a hash typed on a slide is escaped, so it appears as typed. A picture used again on a later slide, such as a logo, is included only the first time.

## What is left behind

Charts and SmartArt are not read; a slide that holds only a diagram keeps its title and notes. Slide numbers, dates and footers are dropped, and so is the design: theme, colours, fonts, positions, animations and transitions. Anything on the slide master or a layout is not read, and neither are review comments. A link to another slide points at a path inside the file, such as `ppt/slides/slide3.xml`, and leads nowhere.

In a table, a merged cell is dropped rather than kept empty, so the rest of its row moves one column left: a heading spanning two columns sits over the first of them. A column empty in every row is removed.

## An example

`hiring-plan.pptx` has two slides. "Where the gaps are" has three bullet points set on the slide, the second indented, one word in bold and two paragraphs of speaker notes. "Budget" has a three-row table and a chart. Both carry a footer and a slide number.

  ```markdown
  # hiring-plan

  - Where the gaps are
  - Budget

  ---

  # Where the gaps are

  - Two backend engineers by September
    - One for search, one for payments
  - A designer shared with **Growth**

  > **Notes**
  >
  > We lost two people in June. **Search** is the hire that matters, because the index rebuild is blocked on it.
  >
  > Ask Finance about the designer before Thursday.

  ---

  # Budget

  | Role | Start | Cost |
  | --- | --- | --- |
  | Backend (search) | September | £78k |
  | Backend (payments) | October | £74k |
  ```

The chart, footer and slide numbers are gone; the notes sit under their slide.

## Limits

A file can be up to 50 MB. Several decks dropped together share that 50 MB and become one document. Only `.pptx` is read; the older binary `.ppt` is refused.

Bullets are read from the slide itself. Where a slide inherits them from its layout, as the content box of PowerPoint's Title and Content layout usually does, the points come out as separate paragraphs, without markers or levels. For the same reason a title slide's subtitle can arrive as a one-item list.

Pictures are carried inside the Markdown, up to about 750 KB each and 1.5 MB for the deck. One past either limit, or in a format that cannot be carried, such as EMF, becomes a line in italics, with its alt text if it has any.

Hidden slides are converted too. Signed in, a document you save can hold up to 4 MB of Markdown, pictures included.

## Questions

### How do I convert PowerPoint to Markdown?

Drop the `.pptx` on this page or choose it with the button. The document appears on screen, ready to copy or to download as a `.md` file named after the deck.

### Are the speaker notes included?

Yes, after each slide's content, as a quotation headed **Notes**. A PDF export usually loses them. Where the notes pane hides is covered in [how to open a .pptx file](/how-to/open-pptx).

### Can it convert an old .ppt file?

No. A `.ppt` is the binary format from before 2007, and this page reads only the zip-based `.pptx`. Save the deck as `.pptx` in whatever opens it, then convert that.

### Can it convert Markdown to PowerPoint?

No. Nothing here writes a `.pptx`: a document downloads as Markdown, HTML, plain text, Word, EPUB or the Confluence, Jira and Slack formats. The routes compared in [converting PowerPoint to Markdown](/blog/convert-powerpoint-to-markdown) all start from a deck.

### Is the presentation uploaded?

No. It is unpacked and converted in your browser, and the file never leaves your computer. Nothing from it is sent unless you are signed in and press Save, which keeps the Markdown, not the deck.
