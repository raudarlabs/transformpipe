## What comes across

The Markdown becomes Confluence storage format, the XHTML a page is saved as, shown in the **Confluence** tab beside the preview:

| In the Markdown | In Confluence |
| --- | --- |
| `#` to `######` | `<h1>` to `<h6>` |
| A fenced block | The code macro, with its language where the macro's list has one |
| `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` | The info, tip, info, note and warning panels |
| A task list, every item `- [ ]` or `- [x]` | Confluence's own task list, with boxes that tick |
| A link to `#a-heading` | A link to an anchor macro at the start of that heading |
| A table | A table with a header row, column alignment kept |
| Footnotes | Raised numbers, the notes listed at the end |
| A picture at an `https://` address | An image pointing at that address |
| `==marked==`, `H~2~O`, `x^2^` | Highlight, subscript, superscript |

Panels go by colour, not name: Confluence's note is yellow and its warning red, so GitHub's Warning becomes a note and its Caution a warning. A title after the marker, `> [!TIP] Before you start`, becomes the panel's title. Nested lists and a numbered list's starting number are kept.

## What is left behind

- **Diagrams and formulas.** A Mermaid block is its source in a code macro titled "Mermaid diagram", a display formula its TeX in one titled "LaTeX", an inline formula code.
- **Pictures without a web address.** A relative path or a picture embedded in the file cannot reach a page without an upload, so it is written as its description in italics, `[Screenshot]`, or dropped when it has none.
- **Raw HTML.** Tags go and their words stay; a `<br>` is still a line break.
- **Front matter** is removed, and **wikilinks** keep only their words.
- **A list mixing tasks and plain items** is an ordinary list, the boxes drawn as ☑ and ☐.
- **Languages the code macro does not list**, such as Go or Rust: the block goes out with none.

## An example

````markdown
## Before you deploy

- [x] Tests pass on `main`
- [ ] Changelog updated

> [!WARNING]
> Deploys are frozen after **Thursday**.

```bash
npm run build
```

Back to [the checklist](#before-you-deploy).
````

becomes:

```xml
<h2><ac:structured-macro ac:name="anchor" ac:schema-version="1"><ac:parameter ac:name="">before-you-deploy</ac:parameter></ac:structured-macro>Before you deploy</h2>
<ac:task-list><ac:task><ac:task-id>1</ac:task-id><ac:task-status>complete</ac:task-status><ac:task-body>Tests pass on <code>main</code></ac:task-body></ac:task><ac:task><ac:task-id>2</ac:task-id><ac:task-status>incomplete</ac:task-status><ac:task-body>Changelog updated</ac:task-body></ac:task></ac:task-list>
<ac:structured-macro ac:name="note" ac:schema-version="1"><ac:rich-text-body><p>Deploys are frozen after <strong>Thursday</strong>.</p></ac:rich-text-body></ac:structured-macro>
<ac:structured-macro ac:name="code" ac:schema-version="1"><ac:parameter ac:name="language">bash</ac:parameter><ac:plain-text-body><![CDATA[npm run build]]></ac:plain-text-body></ac:structured-macro>
<p>Back to <ac:link ac:anchor="before-you-deploy"><ac:link-body>the checklist</ac:link-body></ac:link>.</p>
```

## Limits

Drop a file of up to 10 MB or paste the Markdown. It is converted in your browser; signed out, nothing is uploaded. **Download .confluence.xml** saves the storage format as a file.

Nothing here connects to Confluence: you paste or send the result yourself. **Copy for Confluence** puts two versions on the clipboard, and the destination decides which counts:

- **Confluence Cloud.** The editor takes the formatted version, the preview's HTML, and rebuilds it by its own paste rules. For the code macro, panels and task list exactly as written, send the storage format to the REST API's `body.storage`.
- **Data Center.** The source editor and the REST API take the storage format. The code macro gets only languages from its own list, because Data Center shows an error box for any other.
- **Both.** Links to headings use anchor macros, because Confluence spells its own heading ids differently in Cloud and Data Center.

The output is a page's body: a `# Title` at the top stays in it as a heading.

## Questions

### How do I paste Markdown into Confluence?

Convert the file, press **Copy for Confluence** and paste. The Cloud editor takes the formatted version and a field that wants markup takes the storage format; [pasting Markdown into Confluence, Jira or Slack](/how-to/paste-markdown) covers both.

### Can it import or upload Markdown into Confluence for me?

No. There is no Confluence connection, so it cannot create, update or upload a page. It hands over storage format for you to paste, or for a script to send to the REST API.

### Does it produce Atlassian Document Format (ADF)?

No. The only Confluence output is storage format, the XHTML that `body.storage` takes. ADF is a separate JSON format that nothing here writes.

### How do Markdown tables come out in Confluence?

As Confluence tables: the first row as header cells, and the alignment from the separator row's colons kept on every cell. Markdown has no merged cells, so none are made; [Markdown tables that survive conversion](/blog/markdown-tables-that-survive-conversion) shows how to write one that parses.

### Is there an HTML to Confluence converter here?

No, and no plugin: this page takes Markdown. An HTML file must go through the HTML to Markdown conversion first, then come back here.
