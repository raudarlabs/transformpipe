## What comes across

Zip the vault folder, or a vault-export plugin's output, and upload it. Every non-empty `.md` file becomes a note, in the folder it sat in.

| In the vault | In the Markdown |
| --- | --- |
| `Projects/Website.md` | A note "Website" in a Projects folder |
| Properties, the `---` block on top | Removed |
| `[[Pricing]]`, `[[Pricing#Plans]]` | `Pricing` |
| `[[Pricing\|the plan list]]` | `the plan list` |
| `![[sketch.png]]` | Embedded, found by name anywhere in the .zip |
| `![[brief.pdf]]` | `*brief.pdf*` |

A note's title is its file name, set as a level-one heading; an opening heading that only repeats it is dropped.

Headings, lists, tasks, tables, code, maths, `==highlights==` and callouts are left as written; the preview draws `> [!warning]` as a warning box. Wikilinks inside code are left alone.

By default the vault becomes **A folder of pages** in its own folders, and a folder note, `Projects.md` beside `Projects/`, goes first inside its folder. **One document**, below the drop area, gives one file: a Contents list, then every note under its heading, between horizontal rules.

## What is left behind

- **Where wikilinks point.** Without a vault, only the words stay. A same-note link, `[[#Tasks]]`, is left as written.
- **Embedded notes.** `![[Pricing]]` gives the name, not the text of Pricing.
- **Other attachments.** An embedded PDF, MP3, WAV, MP4 or MOV becomes its file name in italics.
- **Embeds with a folder in them.** Only a bare file name is looked up, so `![[assets/plan.png]]` becomes `*assets/plan.png*` even when the file is in the .zip.
- **Embeds with a space in the name**, such as Obsidian's `Pasted image …` files, which show as text.
- **Markdown links between notes**, left as written.
- **Canvases, settings and plugin data.** Only notes and pictures are read.

Block ids such as `^a1b2c3` and `%%comments%%` stay in the text, visible.

## An example

The folder My vault, zipped, holds `Pricing.md`, `attachments/sketch.png` and this note, `Projects/Website.md`:

```markdown
---
tags: [work]
status: active
---
# Website

Ship the new pricing page: see [[Pricing#Plans|the plan list]] and [[Roadmap]].

![[sketch.png]]
![[brief.pdf]]

> [!warning] Deadline
> Friday, not Monday.
```

As **A folder of pages**, the import is a folder My vault holding Pricing and a Projects folder with this document (base64 shortened):

```markdown
# Website


Ship the new pricing page: see the plan list and Roadmap.

![sketch.png](data:image/png;base64,iVBORw0KGgo…)
*brief.pdf*

> [!warning] Deadline
> Friday, not Monday.
```

## Limits

- **250 MB per .zip**, read in your browser. Signed out, nothing is uploaded; signed in, nothing reaches your account until you save it.
- **Pictures share an allowance**: 2 MB encoded in one document, about 4 MB less the text per note of a folder, 1 MB (about 750 KB on disk) each. A PNG, JPEG, WebP or BMP over 120 KB is first redrawn, at most 1,600 pixels on its long side, and kept if that makes it smaller. One that still does not fit keeps its link.
- **4 MB per saved document.** A larger note is named and left out when the folder is saved.
- **Every `.md` file is read**, hidden folders such as `.trash` included, so remove what you do not want first.
- **No sizes.** In `![[sketch.png|300]]`, the 300 becomes the picture's alt text.

## Questions

### How do I export an Obsidian vault to Markdown?

A vault is already a folder of `.md` files, so there is nothing to export: zip it and upload it.

### What happens to wikilinks?

A link to a note becomes its words: the text after the bar if there is one, otherwise the note's name. The heading or block goes too.

### Are my pictures kept?

Yes, when the file is in the .zip, fits the allowance and, if embedded, has no space in its name. An embed is found by name, a Markdown image by its path, then by name. [Converting an Obsidian vault](/blog/convert-obsidian-vault-to-markdown) covers the rest of Obsidian's syntax.

### Does it keep properties and tags?

Not as properties: the `---` block is removed, tags and aliases with it, because its keys only mean something inside the vault. A `#tag` in the text stays. [What converters do with front matter](/blog/front-matter-and-what-converters-do-with-it) explains the choice.

### Can I move notes from Obsidian to Confluence?

Not directly: nothing here publishes to Confluence. Convert the vault as **One document**, then pick Confluence storage format from the menu beside the download button.

### Is this a general Obsidian format converter?

It reads a vault, turning wikilinks into words and removing properties; as **One document**, the same menu offers HTML, plain text, Word, EPUB, Jira and Slack markup, and **Print or save as PDF**. Of Obsidian's own syntax it writes only heading links, in **Markdown for Obsidian**.
