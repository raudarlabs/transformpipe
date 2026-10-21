## What comes across

Every note in the `.enex` becomes a section of one Markdown document. It opens with a heading named after the file and a list of the note titles; each note then follows under its own heading, with a horizontal rule between notes.

| In the note | In the Markdown |
| --- | --- |
| Title | `# Title`; an untitled note becomes `# Note 3`, by its place in the file |
| Created date and tags | One line in italics under the title: `*2026-09-14 · travel, 2026*` |
| Bold, italic, strikethrough, links, lists, tables | Their Markdown forms; a table's first row becomes its header |
| Checkboxes | A task list: `- [x]` and `- [ ]` |
| Pictures (PNG, JPEG, GIF, WebP, BMP, AVIF, TIFF) | Embedded, with the file name as alt text |
| Other attachments | The file name in italics, where it was |
| Encrypted text | A line saying it needs its passphrase |

A note points at each picture by the MD5 hash of its bytes, not by name. The converter computes that hash for every attachment, so each picture lands in its own note, where it was.

## What is left behind

- **Other note details.** The updated date, author, source URL and location are not read.
- **Styling.** Underline, text colour, highlighting and fonts have no Markdown form. The words stay; the styling goes.
- **Evernote's code blocks.** They arrive as ordinary paragraphs, one per line, not as a fenced block.
- **The attachment files.** A PDF or a recording keeps its name in the note; the file itself stays in Evernote.
- **Links between notes.** They keep their `evernote:///` address, which opens nothing outside Evernote.
- **Empty notes.** A note with no content, date or tags is skipped and left out of the contents list.

## An example

`Travel.enex` holds two notes: "Lisbon trip", tagged travel and 2026, with a line that opens in bold, two checkboxes (one ticked) and a PDF boarding pass attached; and "Where to eat", tagged travel, with a bulleted list. It becomes:

```markdown
# Travel

- Lisbon trip
- Where to eat

---

# Lisbon trip

*2026-09-14 · travel, 2026*

**Flight:** TP 1351, 07:40 from Heathrow

- [x] Book the hotel
- [ ] Renew the travel insurance

*boarding-pass.pdf*

---

# Where to eat

*2026-09-16 · travel*

Recommended by Ana:

- Cervejaria Ramiro
- Taberna da Rua das Flores
```

A photo attached instead would stand in the same place, as an image carrying its own bytes in a data URI.

## Limits

- **50 MB per conversion**, counted across every file dropped at once. Several `.enex` files dropped together become one document, one export after another.
- **Pictures have a budget**, because they travel inside the document: up to 1 MB each once encoded (about 750 KB on disk), and 2 MB for all of them in one export. They are carried in order, and one past the budget is replaced by its file name in italics.
- **One document, not a file per note.** There is no option to split an export into separate notes.
- **Saving holds up to 4 MB of Markdown.** A larger document stays on screen and can still be downloaded.
- **It runs in your browser.** Signed out, the file is not uploaded. Signed in, the document reaches your account only when you press Save.

## Questions

### What is an .enex file?

It is what Evernote writes when you export notes: one XML file holding every note, each note's content in ENML, Evernote's restricted XHTML, and its attachments as base64. [How to open an .enex file](/how-to/open-enex) covers what is inside.

### How do I convert ENEX to Markdown?

Export the notes from Evernote with File, Export notes, then drop the `.enex` on this page. The Markdown appears on screen, and the download button saves it as a `.md` file of the same name.

### Are tags kept?

Yes, in italics under each note's title, after the date it was created. In the Markdown they are plain text, not tags another app will recognise.

### Can I get one Markdown file per note?

Not from this converter. Every note becomes a section of one document under its own heading, and each download is a single file.

### What happens to pictures and attachments?

Pictures are embedded as data URIs, so the document needs no folder beside it. Any other attachment is reduced to its name in italics. [Where the pictures go when you export a document](/blog/pictures-in-a-document-export) explains what embedding costs.

### What about encrypted text?

It cannot be read without the passphrase, and the converter does not ask for one. In its place the note says "Encrypted text, which needs the passphrase it was written with".
