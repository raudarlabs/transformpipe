## What comes across

Everything inside `<body>` that has a Markdown form gets one. A stray asterisk or underscore in the text is escaped. Entities are decoded: `&copy;` arrives as ©, and `&lt;b&gt;` as a real `<b>` tag.

| In the HTML | In the Markdown |
| --- | --- |
| `<h1>` to `<h6>` | `#` to `######` |
| `<strong>`, `<em>`, `<del>` and their short forms | `**bold**`, `*italic*`, `~~struck~~` |
| `<a href>` | `[text](address)`, or `<address>` when the text is the address |
| `<img>` | `![alt](src)`, the `src` exactly as written |
| `<ul>`, `<ol>` | `-` and `1.` lists, each level indented two spaces |
| A checkbox in a `<ul>` item | `- [x]` or `- [ ]` |
| `<table>` | A table, the first row as its header |
| `<pre><code class="language-js">` | A fenced block marked `js` |
| `<code>`, `<blockquote>`, `<hr>`, `<br>` | `` `code` ``, `>`, `---`, a line break |

Tables are tidied: columns empty in every row are dropped and cells are not padded. A `<caption>` becomes a bold line above the table.

## What is left behind

- **The `<head>`**: title, meta tags, stylesheets and scripts, so a page titled only in `<title>` arrives untitled.
- **`<script>`, `<style>`, `<noscript>`, `<template>`, `<svg>` and `<iframe>`**, with everything inside them, so an embedded video or map leaves nothing.
- **`<nav>` and `<footer>`**, contents included, wherever they sit. `<header>` and `<aside>` are kept.
- **Comments, and every `class`, `id` and `style`.** `<u>`, `<mark>`, `<sub>` and `<sup>` keep their words and lose the mark: `H<sub>2</sub>O` arrives as H2O.
- **Pictures embedded as `data:` addresses**, alt text and all, so a self-contained page loses its pictures.

## An example

A saved release page:

```html
<!DOCTYPE html>
<html>
<head><title>Release 2.4</title><style>h1 { color: navy; }</style></head>
<body>
<nav><a href="/">Home</a> <a href="/blog">Blog</a></nav>
<h1>Release 2.4</h1>
<p>Adds <strong>offline mode</strong> and fixes the <em>sync</em> bug.
See <a href="https://example.com/changes">the changelog</a>.</p>
<ul>
  <li><input type="checkbox" checked> Update the docs</li>
  <li><input type="checkbox"> Tell support</li>
</ul>
<table>
  <tr><th>Platform</th><th>Status</th></tr>
  <tr><td>macOS</td><td>Shipped</td></tr>
  <tr><td>Windows</td><td><del>Beta</del> Shipped</td></tr>
</table>
<pre><code class="language-bash">npm install app@2.4</code></pre>
<footer>© 2026 Example Ltd</footer>
</body>
</html>
```

becomes:

````markdown
# Release 2.4

Adds **offline mode** and fixes the *sync* bug. See [the changelog](https://example.com/changes).

- [x] Update the docs
- [ ] Tell support

| Platform | Status |
| --- | --- |
| macOS | Shipped |
| Windows | ~~Beta~~ Shipped |

```bash
npm install app@2.4
```
````

The menu, footer, stylesheet and title are gone, and the wrapped line is joined.

## Limits

- `.html`, `.htm` or `.xhtml` files, or pasted HTML source, up to 10 MB at a time. Several files count together and become one document, with a `---` between them.
- The file is converted in your browser, not uploaded. It reaches your account only if you sign in and press Save, and a saved document can be at most 4 MB.
- The file is read as UTF-8, whatever its `<meta charset>` says: a Windows-1252 page loses its accented letters to replacement marks.
- There is no article detection: cookie notices and sidebars come through. [How to convert HTML to Markdown](/blog/convert-html-to-markdown) shows how to clear them out first.
- A code block needs a `<code>` alone in its `<pre>`, with no whitespace around it, and takes its language only from a `language-…` class. A bare `<pre>` becomes unescaped text whose line breaks vanish when rendered.
- Merged cells are not spread: a `colspan` or `rowspan` cell takes one place and the rest of the row moves left. Nested tables flatten, and a `<br>` in a cell runs its words together.
- A list inside a numbered item is indented two spaces, fewer than CommonMark needs, so it does not nest.

## Questions

### Can I convert a web page from its URL?

No: this page needs the file or its source. Save the page as HTML and drop it here, or use the browser extension, which converts the open page and finds its article first.

### Is there an HTML to Markdown API?

Yes: post the HTML as the request body to `/api/v1/documents?kind=html-to-markdown` with an API key from your account menu. The same converter runs on the server and saves a document; `GET /api/v1/documents/:id` returns its Markdown.

```bash
curl -H "Authorization: Bearer tp_live_…" \
     --data-binary @page.html \
     "https://transformpipe.com/api/v1/documents?kind=html-to-markdown&name=page.md"
```

### How do I convert HTML to Markdown in Python?

There is no Python package. A script can call the API with `requests`; for a conversion inside Python, [this comparison of libraries](/blog/turndown-and-html-to-markdown-libraries) covers html2text and Pandoc.

### Will an HTML table become a Markdown table?

Yes, with its first row as the header, since a Markdown table needs one. Bold, italic, struck text, links and pictures in a cell survive; inline code loses its backticks.

### Why are the pictures missing?

Either they were `data:` addresses, which are dropped, or they live in the folder a browser saves beside the page. Paths are kept as written, so they show only with that folder next to the Markdown; [how to open an .html file](/how-to/open-html) explains it.
