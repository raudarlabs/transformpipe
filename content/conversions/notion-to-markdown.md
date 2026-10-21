## What comes across

Upload the .zip Notion exports in the "Markdown & CSV" format. Every non-empty `.md` file becomes a page and every `.csv` a table, at any depth.

| In the export | In the Markdown |
| --- | --- |
| `Project plan 0f1e…e1f0.md` | A page titled "Project plan", id taken off |
| The page's own `# Project plan` | One title heading, not two |
| A folder of subpages | A folder of the same name, parent page first |
| A database, `Tasks 9f8e…b1a0.csv` | A table under "Tasks", first row as the header |
| A picture in the page's folder | Embedded in the page |

Headings, lists, to-dos, quotes, code, emphasis, links to websites and HTML such as an `<aside>` block stay as Notion wrote them. In a database table, a line break in a cell becomes `<br>`.

By default the export becomes **A folder of pages**, one document per page in the export's folders. **One document**, below the drop area, gives a single file instead: a Contents list, then every page under its heading, between horizontal rules, databases last.

A picture is found by its relative path, then by its file name anywhere in the archive, and written into the page as a `data:` address.

## What is left behind

- **Where links between pages point.** Notion links pages by their exported file names, which no document here has. A link keeps its words and drops its address, in both modes; so does a link to a database's `.csv`.
- **The ids**, from titles and folder names. When everything sits inside Notion's `Export-…` folder, the import's folder takes your .zip's name.
- **Other files.** PDFs and other attachments are not read, and a .zip inside the .zip is not opened.
- **Pictures over the allowance**, which keep their old address instead of being embedded.

## An example

A Notion export holds a page called Project plan and, in its folder, a picture, a Tasks database and a subpage called Meeting notes with a short list. The page's Markdown reads:

```markdown
# Project plan

Launch is planned for **March**. Notes from the kick-off are in [Meeting notes](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/Meeting%20notes%20a1b2c3d4e5f60718293a4b5c6d7e8f90.md); wording follows the [style guide](https://example.com/style).

![Timeline](Project%20plan%200f1e2d3c4b5a69788796a5b4c3d2e1f0/timeline.png)
```

With **One document** chosen, the export becomes this (the picture's base64 shortened):

```markdown
# Contents

- Project plan
- Meeting notes
- Tasks

---

# Project plan


Launch is planned for **March**. Notes from the kick-off are in Meeting notes; wording follows the [style guide](https://example.com/style).

![Timeline](data:image/png;base64,iVBORw0KGgo…)

---

# Meeting notes


- Scope agreed
- [ ] Book the room

---

# Tasks

| Name | Status | Owner |
| --- | --- | --- |
| Draft brief | Done | Ana |
| Review, round 2 | In progress | Tom |
```

As **A folder of pages**, the import holds a folder Project plan with three documents, in this order: Project plan, Meeting notes, Tasks.

## Limits

- **250 MB per .zip**, read in your browser. Signed out, nothing is uploaded; signed in, nothing reaches your account until you save it.
- **Pictures share an allowance**: 2 MB encoded in one document, about 4 MB less the text per page of a folder, 1 MB (about 750 KB on disk) each. A PNG, JPEG, WebP or BMP over 120 KB is first redrawn, at most 1,600 pixels on its long side, and kept if that makes it smaller.
- **4 MB per saved document.** A larger page is named and left out when the folder is saved; a larger single document can still be downloaded.
- **Order by path**: alphabetical, with "Page 2" before "Page 10".

## Questions

### How do I convert Notion to Markdown?

Export the page or workspace from Notion with "Markdown & CSV" as the format and upload the .zip here. Pages arrive under their titles, databases as tables.

### What are the 32-character codes in the exported file names?

Each is a page's id in Notion, added to its file and folder names and used in every link to it. The conversion removes them; [how to open an export .zip](/how-to/open-zip) explains why renaming files by hand breaks links.

### Should I turn on "Include subpages" when exporting?

Yes, if you want the pages under the one you export: only what is in the .zip is converted. With "Create folders for subpages" on too, a page with subpages becomes a folder, the page first.

### Do links between pages still work?

No: their words stay and their addresses go. For separate files that still link to each other, [converting a Notion export](/blog/convert-notion-export-to-markdown) covers the rewrite that takes.

### Is this the same as notion-to-md?

No. notion-to-md is a Node package that reads pages through Notion's API with an integration token; this page reads the exported .zip and never connects to your workspace.

### Can I move a Notion export into Obsidian?

Partly. With **A folder of pages**, choose **Download .zip**, then **For Obsidian**: the same folders, one `.md` file per page, heading links in Obsidian's spelling. Links between pages arrive as plain words.
