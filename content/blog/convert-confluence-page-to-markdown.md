---
title: "Convert a Confluence Page to Markdown: Every Export, and the HTML Underneath"
description: How to get a Confluence page or space into Markdown — why there is no native export, what the HTML export keeps, and what every macro loses on the way
date: 2026-09-14
tag: Converting
keywords: confluence to markdown, convert confluence page to markdown, confluence export markdown, confluence html to markdown, confluence page export, confluence space export html
---

Confluence has an Export button, several formats behind it, and none of them are Markdown. That is not an oversight: a Confluence page is not stored as Markdown, or as anything close to it. It is stored in Confluence's own storage format — XHTML-based markup with two custom namespaces layered on top for macros and resource references — and every export format Confluence offers is a rendering of that storage format into something else. Getting to Markdown means picking one of those renderings and converting it a second time.

The practical consequence is that "convert Confluence to Markdown" is always a two-step job: export in a format that keeps enough structure to be worth converting, then run a real HTML-to-Markdown conversion over what came out. Skipping straight to Word or PDF throws away the structure before the second step has anything to work with.

### TL;DR

**HTML is the only export worth converting.** Confluence's storage format is XHTML-based, so a space's HTML export keeps headings, lists, tables and links as real markup a converter can read — Word and PDF exports of the same content compress into styling that recovers worse. Space export needs space-admin permission and only exports what your own account can already see, unless a site admin runs it, which exports everything regardless of visibility (checked on support.atlassian.com, 14 September 2026). Whatever comes out, convert it with [an HTML to Markdown conversion](/html-to-markdown) rather than a script that strips tags with regular expressions — Confluence's HTML is dense with `mso`-style attributes and macro wrapper `div`s that a naive stripper leaves behind as visible noise. For a whole space merged into one readable document, [TransformPipe's Confluence → Markdown conversion](/confluence-to-markdown) takes the HTML export zip directly and produces one document with a table of contents, no directory walk required.

What none of the routes below recover: a macro that ran a live query — a Jira issue macro, an included page — comes back as whatever it happened to show on export day, not a query. Page comments never make it into an HTML or PDF export. And in-page anchors change, because Confluence generates heading ids that include the page title, so a link written against the old id format stops resolving the moment a different renderer writes ids its own way.

## Why there is no native Markdown export

A Confluence page's content lives in what Atlassian calls storage format: technically XML rather than strict XHTML, with Confluence's own elements in an `ac:` namespace and resource references — attachments, page links — in an `ri:` namespace. A macro is an `ac:structured-macro` with a name attribute; an image is an `ac:image` wrapping an `ri:attachment`; a link to another page is an `ac:link` wrapping an `ri:page`. None of that has a Markdown equivalent, because Markdown has no concept of a macro at all — a macro is a named, parameterised piece of behaviour, and Markdown's entire feature set is static text formatting.

So Confluence's export menu offers renderings of the storage format instead: Word, PDF, HTML, XML, and CSV for a space. Every one of them is what the storage format looks like once rendered, at whatever fidelity that export format supports, and Markdown is reached by converting one of those renderings a second time.

## Quick comparison: the export formats, and what survives each

| Export | Scope | Permission needed | What comes out | Worth converting to Markdown? |
| --- | --- | --- | --- | --- |
| Export to Word | One page | Anyone with page access | A `.docx` many other editors render imperfectly | Only via a Word-to-Markdown conversion; structure survives, faked headings do not |
| Export to PDF | One page | Anyone with page access | A rendered, static page; comments never included | No — a rendered page has no structure left to extract |
| Space export, HTML | Whole space | Space admin | Zip of rendered HTML files, one per page, plus attachments | Yes — this is the route |
| Space export, XML | Whole space | Space admin | Confluence's own storage-format XML, for re-import into Confluence | Not directly — it is built for Confluence, not for a converter |
| Space export, CSV | Whole space | Space admin | Content as CSV rows, attachments and comments included by default | No — flattens structure a Markdown conversion needs |
| A Marketplace app | Page, tree, or space, depending on the app | Whatever the app requires | Markdown directly, in the app's own shape | Sometimes — check the current listing; several free options exist |

Every scope and permission claim in that table is from Atlassian's own documentation: HTML, XML and CSV exist only as space-level exports and need space-admin permission, and "only content that is visible to you will be exported" for a space admin's own export — a site admin running the same CSV or XML export gets everything, visibility restrictions included (checked on support.atlassian.com, 14 September 2026). Blog posts are left out of a space's PDF and HTML export, and comments are never included in a PDF export, both according to the same page.

## Space export to HTML — the route that keeps structure

From the space sidebar, More actions, Space settings, General, Export space, choose HTML. What comes back is a zip: one HTML file per page, an attachments folder, and an index file listing the pages.

| Pros | Cons |
| --- | --- |
| Real markup — headings, lists, tables and links survive as elements, not as rendered pixels | Requires space-admin permission; a page author without it cannot run this export themselves |
| Attachments are packaged alongside the pages that use them | The page hierarchy lives only in the index file — filenames are flat, so folders have to be rebuilt from it if you want them |
| Works offline once downloaded — no ongoing dependency on Confluence being reachable | Macros render to whatever HTML they produced on export day, not to anything Markdown understands |

**Price:** free — the export is part of Confluence itself, and every converter worth running on the far side is free too.

**Technical details.** The exported filenames are machine-generated and not human-readable, so identifying which file is which page means reading the index rather than the directory listing. Heading anchors are Confluence's own generated ids, which include the page title as part of the id string — a link written against `#PageTitle-Heading` breaks the moment a different HTML-to-Markdown converter generates a plain `#heading` slug instead, because the two id schemes do not match.

**Who is this for?** Anybody converting more than a couple of pages, and specifically anybody who needs the result to be more than a snapshot — HTML is the one export format dense enough that a real conversion can recover tables, links and lists rather than a paragraph of run-together text.

## Converting the HTML: a real parser, not a regex

Once the HTML is out, the second step is an ordinary HTML-to-Markdown conversion — [the same job](/html-to-markdown) as converting any saved web page — with one Confluence-specific wrinkle: the markup is dense with `mso-`-prefixed inline styles and macro wrapper `div`s that a naive tag-stripping script leaves behind as visible junk in the output. A real HTML parser that builds a tree and walks it, rather than a sequence of string replacements, is the difference between clean Markdown and a paragraph full of stray class names.

| What the macro rendered to | What a converter sees | After conversion |
| --- | --- | --- |
| Info, note, warning, tip panel | A `div` with a class name and an icon image | A plain paragraph — give it a blockquote convention by hand |
| Code block macro | A `pre` element, often with syntax-highlighting spans | A fenced code block, usually with the language attribute lost |
| Table of contents macro | A rendered list of anchor links | A list of links to anchors that may no longer resolve after conversion |
| Page tree or children-display macro | A rendered list of links back to the live Confluence site | Links pointing at Confluence, not at the converted files |
| Excerpt or include macro | The included text, already inlined at export time | Duplicated text, once per page that included it — no way to tell it apart from original content |
| Jira issue or filter macro | A snapshot table, or a plain link, depending on the macro's own rendering | A table frozen on export day, or a dead link if it rendered as a reference |
| Expand macro | The contents, already expanded in the static export | Plain content — the collapse/expand behaviour does not exist in Markdown |
| Attachments macro | A list of links to `/download/attachments/...` | Links that need an active Confluence session to resolve |

The attachments row is the one worth checking before publishing anything. Those links point at Confluence's own download endpoint, which expects you to be signed in — a page that looks complete while you are logged into Confluence has broken image boxes for anyone who is not, and a space export packages the actual files into the zip specifically so the converter can rewrite those links to point at the local copies instead of leaving them pointed at a session-gated URL.

**What the raw HTML actually looks like.** A note panel is not a `<blockquote>` — it is closer to this, trimmed of the attributes a naive stripper leaves behind:

```html
<div class="confluence-information-macro confluence-information-macro-note">
  <span class="aui-icon aui-icon-small aui-iconfont-warning"></span>
  <div class="confluence-information-macro-body">
    <p>Deploys are frozen after Thursday.</p>
  </div>
</div>
```

A tag-stripping regex over that produces a paragraph plus a stray empty line where the icon `span` was. A real parser recognises the wrapper `div`'s class, discards the icon element entirely, and keeps only the text — which is the entire argument for a converter that builds a tree rather than one that deletes angle brackets.

### Heading anchors: why an in-page link breaks even when the page does not

Confluence generates a heading's id from the page title and the heading text combined, so two pages with an identically worded heading do not collide, and an in-page link is written against that full id. A converter that generates ids the ordinary way — lower-cased heading text, spaces turned to hyphens, nothing else — produces a different id for the same heading, so any link written as `#PageTitle-SectionName` stops resolving even though the section itself converted perfectly. The fix is mechanical once you know to look for it: after conversion, rewrite in-page links against the new heading's own generated id rather than assuming the old one survived.

## Upload the export zip directly, merged into one document

For a space where the destination was always one readable document rather than a directory of files with a working page-tree structure, [TransformPipe's Confluence → Markdown conversion](/confluence-to-markdown) takes the space's HTML export zip as it comes out of Confluence, converts each page's HTML with the same converter behind the HTML-to-Markdown page, and merges every page in order into one document with a generated table of contents.

| Pros | Cons |
| --- | --- |
| No directory walk, no index file to read by hand | Produces one document — not the shape you want if each page needs to stay its own file with its own URL |
| Every page in order, with a table of contents built for you, and an attachment that is a picture carried into the document rather than left pointing at `/download/attachments/` | Does not reconstruct the page tree — nothing does that without deciding where files will live — and an attachment that is not a picture keeps the link it had |
| Runs in the browser; the zip is not uploaded when signed out | Macro losses are identical to any other HTML-to-Markdown route, because the source HTML is the same either way |

**Price:** free, runs locally.

**Who is this for?** A space being archived, a wiki handed off as a single document, or any case where a person reading the result cares about the content in order more than about each page keeping a URL of its own.

## A Marketplace app, if Markdown export fits your workflow better

Several apps on the Atlassian Marketplace export a page, a page tree, or a whole space directly to Markdown, with free options available alongside paid ones (checked on marketplace.atlassian.com, 14 September 2026) — the category exists and changes often enough that naming a specific app here would be stale within a year, which is exactly why the export-then-convert route above is worth knowing regardless: it depends on nothing but Confluence's own built-in export and a converter, neither of which is a subscription that can change its pricing or get pulled from a marketplace listing.

| Pros | Cons |
| --- | --- |
| Direct Markdown, no separate HTML-conversion step | Adds a Marketplace app to the site, which someone has to approve and maintain |
| Some preserve folder hierarchy in the output automatically | Free tiers and feature sets change; check the current listing rather than trusting an old review |
| Can be faster for a one-off single-page export | A paid tier is often needed for a whole space rather than one page |

**Who is this for?** A team that already installs Marketplace apps freely and wants Markdown in one step, rather than an export-and-convert pipeline they maintain themselves.

## The Confluence Server and Data Center difference

Everything about the export dialog above describes Confluence Cloud. Server and Data Center instances have the same underlying storage format and the same category of HTML space export, but the exact menu path and the exact permission model differ by version, and — since there is no scripted API push equivalent to Jira's Automation on these instances by default — reaching for a Marketplace app (ScriptRunner is a common choice on Server/Data Center specifically) is more often the practical route to anything beyond the built-in export dialog. If your instance is Server or Data Center, check the export options under your own admin console rather than assuming the Cloud menu path applies unchanged.

## How to choose

1. **Confirm HTML export is available to you before planning around it.** It needs space-admin permission; if you do not have it, the practical first step is asking whoever does, not searching for a workaround.
2. **Decide whether the destination is separate files or one document.** Separate files with their own URLs wants the export-then-convert pipeline, kept as one file per page. One document wants the merge route.
3. **Check for macros that were live queries before converting anything.** A Jira issue macro or a page-tree macro renders to a snapshot; if the live version matters, note it separately before the export captures a frozen copy.
4. **Read one converted page fully before trusting the rest.** Attachment links, heading anchors and macro-rendered `div`s are the three things that look fine in a diff and wrong when actually read.

If the blocker turns out to be cost rather than mechanics — which Marketplace listings are actually free rather than free to try, and which routes need an administrator at all — [the free Confluence converters compared](/blog/free-confluence-to-markdown-converter) answers that separately.

## Conclusion

Confluence to Markdown is a two-step conversion wearing the name of a one-step export: pick the HTML output, because it is the only one dense enough to convert well, then run a real HTML-to-Markdown pass over it rather than a script of string replacements. What survives is everything the storage format expressed as static structure — headings, lists, tables, links; what does not is anything that was a macro's live behaviour rather than its rendered output on the day you exported. For a whole space meant to become one document, skip the directory walk and hand the export zip to a converter that merges it directly. [How Notion and Obsidian compare](/blog/markdown-from-notion-obsidian-and-confluence) on the same export-then-repair problem is worth reading if Confluence is not the only source in play.

## FAQ

### Can I export a Confluence page directly to Markdown?

Not with anything built into Confluence. Every native export — Word, PDF, HTML, XML, CSV — is a different rendering of the page's own storage format, and none of them is Markdown; getting there means converting one of those exports a second time, or installing a Marketplace app that does the two steps for you.

### Which Confluence export format should I convert?

HTML. It is the only export dense enough to keep headings, lists, tables and links as real markup rather than flattened text or rendered pixels, which is what an HTML-to-Markdown converter needs to do a good job.

### Do I need to be a space admin to export a Confluence space?

Yes, for HTML, XML and CSV space-level exports specifically — a single page's Word or PDF export only needs the access you already have to read that page. If you are not a space admin, exporting a whole space means asking someone who is.

### What happens to Jira issue macros and other live content when I export?

They freeze. A Jira issue macro, a page-tree display, an included excerpt — each one exports as whatever it happened to render on export day, a snapshot rather than a query, and nothing about the export format keeps it live.

### Why do my converted images show as broken links?

Because Confluence's inline attachment links point at `/download/attachments/...` URLs that expect an active, signed-in session. A space export packages the actual attachment files into its zip for this reason — the fix is rewriting the links to point at those local files, not to the original Confluence URLs.

### Can I convert a Confluence page without uploading it anywhere?

Yes, if the converter runs in your browser rather than sending the file to a server — worth confirming for anything that should not leave your machine, by watching the network panel while converting.

### Why do in-page links break after I convert a Confluence page?

Because Confluence generates heading ids from the page title and the heading text together, and a standard HTML-to-Markdown converter generates a plainer id from the heading text alone. The section still converted correctly — only the id changed — so the fix is rewriting the link against the new id, not re-converting the content.

### Is Confluence Server or Data Center different from Cloud for this?

The storage format and the HTML export are the same idea on both, but the exact menu path, permission model and available Marketplace apps differ by version and edition. Server and Data Center more often lean on a Marketplace app such as ScriptRunner for anything beyond the built-in export dialog, since there is no Cloud-style Automation rule to fall back on.
