## What comes across

The Markdown is read as GitHub Flavored Markdown, with the extensions common in notes and documentation on top:

| In the Markdown | In the HTML |
| --- | --- |
| Headings | `<h1>` to `<h6>`, each with an id such as `doc-setup` |
| A link to `#setup` | Pointed at that heading, written GitHub's way or Obsidian's |
| Task lists, tables | Checkboxes that cannot be clicked; tables that scroll on a narrow screen |
| Fenced code | Highlighted for Python, JavaScript, SQL, Bash, YAML and about twenty more |
| A `mermaid` fence | The diagram, drawn as SVG into the downloaded file |
| `$…$` maths, footnotes | MathML; notes numbered and listed at the end |
| `> [!NOTE]`, `==mark==`, `H~2~O` | An alert box, `<mark>`, `<sub>` |

Download .html saves one file: the document with its stylesheet inside, no script and no web font, in the light or dark palette the app is showing, and light when printed. A line at the foot names the document, gives the time it was converted and links to TransformPipe. The menu beside the button also offers Markdown, Markdown for Obsidian, plain text, Word, EPUB, Confluence, Jira, Slack and a PDF through the print dialog.

## What is left behind

- **Front matter.** A YAML block between `---` lines at the top is removed.
- **Wikilinks.** `[[Install guide]]` becomes the words "Install guide", and `![[diagram.png]]` its file name in italics.
- **HTML outside the allow-list.** `<script>`, `<style>` and `<iframe>` go with their contents, `style` and `onclick` attributes are dropped, and a tag such as `<details>` loses the tag but keeps its text.
- **Single line breaks.** A newline inside a paragraph is a space, as on GitHub. End the line with two spaces or a backslash for a `<br>`.
- **Pictures as files.** An image stays an `<img>` pointing at its address. A relative path such as `img/chart.png` shows only if that folder sits beside the downloaded file, because only the `.md` reaches the converter.

## An example

The input:

```markdown
---
title: Release notes
---

# Release 2.4

Read the [setup notes][setup] first.

- [x] Faster export
- [ ] Print in dark mode

| Format | Size |
| --- | ---: |
| HTML | 48 KB |

## Setup

Run `npm ci`.[^1]

[setup]: #setup
[^1]: Node 20 or later.
```

Inside the `<article>` of the downloaded file:

```html
<h1 id="doc-release-24">Release 2.4</h1>
<p>Read the <a href="#doc-setup">setup notes</a> first.</p>
<ul>
<li><input checked="" disabled="" type="checkbox"> Faster export</li>
<li><input disabled="" type="checkbox"> Print in dark mode</li>
</ul>
<div class="md-table"><table>
<thead>
<tr>
<th>Format</th>
<th align="right">Size</th>
</tr>
</thead>
<tbody><tr>
<td>HTML</td>
<td align="right">48 KB</td>
</tr>
</tbody></table>
</div>
<h2 id="doc-setup">Setup</h2>
<p>Run <code>npm ci</code>.<sup class="md-fnref" id="doc-fnref-1"><a href="#doc-fn-1">1</a></sup></p>
<hr class="md-fnrule">
<ol class="md-footnotes">
<li id="doc-fn-1">Node 20 or later. <a href="#doc-fnref-1" class="md-fnback">↩</a></li>
</ol>
```

The front matter is gone, the link reaches the heading's real id, and the footnote has moved to the end.

## Limits

- **10 MB per conversion**, counted across all the files dropped at once. Several files become one document, with a horizontal rule between them.
- **.md, .markdown, .mdown and .mkd**, or Markdown pasted as text. A `.txt` goes to the plain-text converter instead.
- **It runs in your browser**, conversion and download alike. Signed out, the file is not uploaded; signed in, the document reaches your account only when you press Save, up to 4 MB.
- **A diagram has to parse.** A Mermaid fence with a mistake in it stays as its source code.
- **One stylesheet.** There is no setting for your own CSS or template.

## Questions

### How do I convert an .md file to HTML?

Drop an `.md` file on this page, or paste the Markdown. The preview shows the page, and Download .html saves it under the same name. No account is needed. To read a file rather than convert it, see [How to open an .md file](/how-to/open-md).

### Is the HTML file self-contained?

Yes, apart from pictures linked by address. The stylesheet is inside, nothing is fetched for fonts or scripts, and diagrams and formulas are drawn in, so it opens the same way from an email or a disk with no network. [Self-contained HTML explained](/blog/self-contained-html-explained) goes further.

### Can I copy the HTML instead?

Yes. The HTML source tab shows the whole file, with any diagram still as Mermaid source, and Copy HTML puts that on the clipboard. For a fragment to paste into a CMS, take what is inside `<article>`.

### Does it support GitHub Flavored Markdown?

Yes: tables, task lists, `~~strikethrough~~`, fenced code and bare links are read as GitHub reads them, with footnotes, alerts, maths and Mermaid on top.

### Is my Markdown uploaded?

No. It is converted in your browser and kept in this browser's storage; it reaches a server only if you sign in and press Save. [How to convert Markdown to HTML online](/blog/convert-markdown-to-html-online) shows how to check that for any converter.

### Can I use my own CSS?

No. The file carries the document's own stylesheet. It is plain HTML, so the `<style>` block can be replaced afterwards.
