---
title: "The Best Free Confluence to Markdown Converter in 2026: Every Option Compared"
description: "Which free Confluence to Markdown converter is free in practice: where the trials stop, why the built-in export wants space-admin rights, and what to use instead"
date: 2026-09-14
tag: Converting
keywords: free confluence to markdown converter, confluence to markdown converter, confluence to markdown, export confluence to markdown free, confluence markdown export, confluence markdown app, confluence space export markdown
---

Search for a free Confluence to Markdown converter and every result says free. Then you try them. One is a thirty-day trial that calls itself free on the listing. One is genuinely free and does a page at a time, which is not what you wanted when the thing to convert is a four-hundred-page wiki. One is free and built into Confluence already, and stops you at a permission you cannot grant yourself. And one would work perfectly if you could get the content out of Confluence in a shape it could read, which is the whole problem.

That is an unusually thick field of asterisks for a simple-sounding job, and it is not an accident. Confluence has no Markdown export, so every route goes either through an export format designed for something else or through an app someone with administrator rights has to install. Free, in this niche, usually means free-for-you-if-somebody-else-says-yes.

This piece is about which of those routes is actually free, for whom, and at what scope. For the mechanics — which export format keeps what, what each macro turns into, why in-page links break — [how to convert a Confluence page to Markdown](/blog/convert-confluence-page-to-markdown) covers the export formats one by one and the damage each does. This one is the shopping list.

### TL;DR

**The free route at whole-space scale is one export plus one conversion.** Confluence's own HTML space export costs nothing, but it needs space-admin permission, and a space admin's export contains only what their own account can see, unless a site admin runs it, which exports everything regardless of visibility (checked on support.atlassian.com, 14 September 2026). Once you have that zip, converting it is free from every direction: drop it on [a browser converter](/confluence-to-markdown) for one merged document with a contents list, or point Pandoc or a turndown script at the HTML files for one Markdown file per page.

**On the Atlassian Marketplace, read the word above the button.** A listing headed **Free app** is free; one headed **Try it free** is a trial with a price behind it. Both are present in this category today, and the section below names which is which (checked on marketplace.atlassian.com, 14 September 2026). Either way somebody with admin rights has to install it, which is the same gate as the export.

**Word and PDF export are free and are not a route.** They are the two exports anyone can run without permission, which is exactly why people reach for them, and they are the two that throw away the structure a Markdown conversion needs.

## Why "free" is the hard part in this particular conversion

For most conversions, free is a boring question. A CSV is a file on your disk; a converter reads it; nobody approves anything. Confluence is different in two ways, and both turn into money or permission.

**There is no Markdown export, so every free option is doing two jobs.** A page is stored in Confluence's own XHTML-based storage format, and the export menu offers renderings of it — Word, PDF, HTML, XML, CSV — none of them Markdown. A converter therefore has to be either an app living inside Confluence and reading that format through the API, or a second step after an export. Apps cost money because they are software maintained against a moving API; second steps are free because the pieces already exist. That is the economics of this whole category.

**The useful exports are gated on permission rather than payment.** Single-page Word and PDF export are available to anyone who can read the page. Everything at space scale — HTML, XML, CSV — needs space-admin permission. The free built-in route costs no money and may cost a week of waiting on a ticket. Most people searching for a free converter are not space admins; they are a developer, a technical writer or a new starter handed a wiki and asked to get it into a repository.

That second point is worth being blunt about, because no tool page will tell you: **if you are not a space admin and cannot become one, the choice of converter is not your bottleneck.** The question you are actually answering is which of two asks is smaller — asking a space admin to run one export and send you a zip, or asking a site admin to install an app. The first is a one-off favour; the second is a standing decision about what software runs on the company's Confluence, and it is why the export-and-convert route wins more often than its ergonomics deserve.

One more thing about that free built-in export: a space admin's own export contains only what that admin can already see. Pages restricted away from them are quietly absent from the zip, and nothing downstream can tell you about a page that was never in the archive. A site admin running it gets everything (checked on support.atlassian.com, 14 September 2026). Blog posts are not in a space's HTML or PDF export at all, and comments are never in a PDF export, per the same documentation.

## Quick comparison: the cheat sheet

| Tool | Best for | Key capability | Price |
| --- | --- | --- | --- |
| Confluence's HTML space export | Getting the content out at all | One HTML file per page, plus attachments, in a zip | Free, needs space-admin permission |
| The browser converter at /confluence-to-markdown | Turning that zip into one readable document | Drop the export zip, get one document with a contents list | Free; nothing uploaded when signed out |
| Pandoc | A scripted bulk migration | `html` in, `gfm` or `commonmark` out, one command per file | Free, GPL |
| A turndown script | Rules you need to control yourself | Custom rules for the wrapper markup Confluence emits | Free, MIT |
| Marketplace app, listed Free app | Markdown export from inside Confluence | Export without leaving the page | Free as listed; an admin installs it |
| Marketplace app, listed Try it free | Evaluating before a purchase decision | Same, with the page tree and attachments handled for you | A trial; the price is on the pricing tab |
| Export to Word | One page you need in an editor | A `.docx` of a single page | Free, no permission needed |
| Export to PDF | Sending one page to somebody | A rendered, static page | Free, no permission needed, no route to Markdown |

## The options, one at a time

### Confluence's HTML space export, then any HTML to Markdown converter

This is the baseline every other free option is measured against, and it is two free things in a row rather than one tool. From the space sidebar: More actions, Space settings, General, Export space, HTML. Back comes a zip of one rendered HTML file per page, an attachments folder and an index listing the pages. Converting that is an ordinary [HTML to Markdown conversion](/blog/convert-html-to-markdown), with no Confluence-specific step.

| Pros | Cons |
| --- | --- |
| Free with no account, no install and no app to approve | Space-admin permission, which is the gate most people hit |
| Real markup: headings, lists, tables and links survive as elements | The zip only contains what the exporting account can see |
| Attachments are packaged alongside the pages that reference them | Filenames are machine-generated; the page tree lives only in the index file |
| Depends on nothing that can change its pricing or leave the Marketplace | Blog posts are not included in the HTML export |

**Price:** free. The export is part of Confluence, and every converter worth pointing at the result is free as well.

**Technical details.** The exported HTML is dense — inline styles, macro wrapper `div`s, icon `span`s carrying no text — which is why the second step wants a real HTML parser rather than a script that deletes angle brackets. The index file is the only place the page hierarchy exists, because the filenames are flat and carry generated ids rather than titles. If your destination needs folders mirroring the wiki's tree, that mapping is yours to build from the index.

**Who is this for?** Anybody who has space-admin rights or knows somebody who does, and anybody who wants a route with no ongoing dependency.

### The browser converter — drop the export zip, get one document

Once you have that zip, the shortest free path is to hand the whole archive to a converter that reads it directly. [TransformPipe's Confluence to Markdown conversion](/confluence-to-markdown) takes the export zip as it comes out of Confluence, converts each page's HTML with the same converter behind its HTML to Markdown page, and merges everything into one document with a contents list at the top.

| Pros | Cons |
| --- | --- |
| No unzipping, no directory walk, no index file to read by hand | One document out, not one file per page — the wrong shape for a docs site |
| A contents list is generated from every page's title | The contents list is plain titles, not links |
| Runs in the browser; signed out, the zip is not uploaded anywhere, and an attachment that is a picture is carried into the document | An attachment that is not a picture keeps the link it had, which still wants a Confluence session |
| Free, no account, no install, nothing for an admin to approve | Page order follows the archive's paths, not the wiki's hierarchy |

**Price:** free. An account adds history, sharing and an API, also free.

**Technical details and features**

- Every `.html` entry is read, directories and empty entries skipped, and entries are sorted by path, so two exports of the same space produce the same document in the same order
- Each page's title comes from its own `<title>` element, falling back to the filename with the trailing numeric page id stripped and separators turned back into spaces, so a page whose export kept no title still lands in the contents list readably
- A page already opening with its own title as a heading does not get it twice; the duplicate is dropped before merging
- Pages are joined with a horizontal rule, the same convention used for merging several uploaded files by hand
- The unzipping is `fflate`, pure JavaScript with no native bindings, which lets the same code run in a browser tab and on the server for API callers

**Who is this for?** A space being archived, a wiki handed to a new team as one document, or the case where somebody sent you an export zip and you want to read it without installing anything. Not the tool if each page has to stay its own file with its own URL.

### Pandoc — free, and the right answer for a bulk migration

Pandoc reads `html` and writes `gfm`, `commonmark` and `markdown_strict` among many others, which makes the second half of the export-and-convert route a shell loop (checked on pandoc.org, 14 September 2026). It is the free option that scales, for when the output has to be hundreds of files with a structure you control.

| Pros | Cons |
| --- | --- |
| Free and GPL licensed, with no account and no service behind it | An install, and a large one |
| `-t gfm` gives you the Markdown flavour GitHub and most static site generators expect | No knowledge of Confluence: wrapper `div`s come through as whatever HTML they were |
| `--extract-media` pulls linked media out to a directory and rewrites the references | You write the loop, the naming and the folder structure yourself |
| Also has a `jira` reader for Jira and Confluence wiki markup | That wiki markup is not what a modern Cloud page is stored as |

**Price:** free, GPL licensed.

**Technical details and features**

- `pandoc -f html -t gfm page.html -o page.md` is the whole conversion for one page; a loop over the export directory is the whole conversion for a space
- `--wrap=none` stops Pandoc hard-wrapping the output at a column width, which matters if the result lands in a repository where diffs should be per-sentence
- `--extract-media=media` extracts media referenced by the source and adjusts the references to point at the extracted files — the closest free thing to a fix for Confluence's session-gated attachment URLs
- The `jira` format is listed as both input and output, described as Jira and Confluence wiki markup — useful for old Server pages authored that way, and not a route for Cloud pages, which are stored in the XHTML-based storage format instead
- `gfm` is the variant to ask for if tables matter; `markdown_strict` has no table syntax at all

**Who is this for?** Anybody moving a wiki into a repository once, properly — where the result is a directory tree, a naming scheme and a build that regenerates cleanly. A migration you will run twice should be a script, and this is the script.

### A turndown script — free, when you need the rules to be yours

Turndown is a JavaScript library that converts HTML to Markdown, MIT licensed, accepting HTML strings or DOM nodes (checked on github.com/mixmark-io/turndown, 14 September 2026). The reason to script around it rather than run Pandoc is that Confluence's exported HTML has recognisable shapes in it — macro panels, code block wrappers, expand macros — and turndown lets you add a rule per shape.

| Pros | Cons |
| --- | --- |
| Free, MIT, and a dependency rather than an install | You are writing a program, with everything that implies |
| Rules can match Confluence's own class names and emit exactly what you want | Every rule is a maintenance liability when Confluence's rendering changes |
| `turndown-plugin-gfm` adds tables and strikethrough on top of the core rules | Core turndown without that plugin does not emit tables |
| Runs anywhere Node runs, including in CI | Needs a DOM: in Node that means supplying one |

**Price:** free, MIT licensed.

**Technical details and features**

- A rule is a filter plus a replacement function, so `div.confluence-information-macro-note` becoming a blockquote is a few lines rather than a post-processing pass over the output
- Because turndown accepts DOM nodes, a script can prune before it converts — dropping the icon `span`s and navigation furniture that a generic converter faithfully turns into stray empty lines
- The GFM plugin is the piece to add first: tables are the most common thing in an exported wiki, and the core library leaves them as HTML

**Who is this for?** A migration where the output has to match an existing style guide, or where one macro appears on two hundred pages and must come out the same way every time. For a one-off conversion it is more work than the result justifies.

### Atlassian Marketplace apps — read the word above the button

Several apps export Confluence pages to Markdown from inside Confluence, with no intermediate HTML export. This is where "free" needs the most care, because the Marketplace shows two different things in almost the same place: a listing headed **Free app** is free, and one headed **Try it free** is a trial with a price on the pricing tab.

Both are present today. Listed as free apps: "Markdown Exporter for Confluence (API, Bulk & Attachments)" from Yamuno Software US, and "Markdown | Source Editor | Markdown Exporter (FREE)" from Agilva Solutions. Listed as Try it free: "Easy Markdown Exporter for Confluence" from AppLiger, "Markdown Exporter for Confluence" from Narva Software, "Export to Markdown for Confluence Cloud" from Atly Apps, and "Instant Markdown Exporter for Confluence" from Philip Lindner, which states a 30-day free trial (all checked on marketplace.atlassian.com, 14 September 2026).

| Pros | Cons |
| --- | --- |
| Markdown directly, with no separate export-and-convert step | Installing an app is an administrator's decision, not a page author's |
| Some rewrite links to relative paths and keep the page tree, which the free route does not | A listing that says Try it free is a trial, and the price is a tab away |
| Runs against the live content, so nothing is a snapshot of an export day | Listings, vendors and pricing in this category change often |
| Forge apps run inside your own Atlassian environment | An app is a standing dependency somebody has to maintain |

**Price:** varies, and the listing header is the fastest signal — Free app or Try it free (checked on marketplace.atlassian.com, 14 September 2026). Check the current listing rather than any article, this one included: it is the part most likely to be out of date by the time you read it.

**Technical details.** The differences worth comparing are the ones the free route cannot do at all: whether the page hierarchy is preserved as folders, whether attachments come down with the pages, and whether internal links are rewritten to relative paths so the result navigates offline. Those three are the actual product; converting HTML to Markdown is the commodity part, and the reason so many of these apps exist with so little between them.

**Who is this for?** Teams that install Marketplace apps routinely and want Markdown export as an ongoing capability. For a single migration, the export-and-convert route gets you there without a procurement conversation.

### Word or PDF export — free, no permission needed, and a dead end

These are the two exports available to anyone who can read a page, which is why they are the first thing people try when the HTML export is greyed out. They are here for honesty rather than as a recommendation.

| Pros | Cons |
| --- | --- |
| No permission beyond reading the page | One page at a time; there is no space-scale version of either that helps |
| Free, built in, two clicks | PDF is rendered output — the structure is gone before a converter sees it |
| A `.docx` at least keeps headings, lists and tables as structure | Word's headings are only as good as the export's use of real heading styles |
| Fine when the destination was Word or PDF all along | Comments are never included in a PDF export |

**Price:** free.

**Technical details.** The `.docx` route is not hopeless — a Word document has a real document model, and [converting it to Markdown](/blog/best-word-to-markdown-converters) recovers headings, lists and tables. It is the long way round: storage format to Word to Markdown, losing something at each hop, where HTML to Markdown is one hop with less loss. PDF is genuinely a dead end, because a PDF describes where ink goes on a page and the heading structure Markdown needs no longer exists in it.

**Who is this for?** Somebody with one page, no space-admin rights and no appetite for a ticket. For that person the Word export plus a Word to Markdown conversion is a legitimate free route, and it is worth saying so rather than pretending the only correct answer needs permission they do not have.

## Where the obvious free choice falls down

The export-then-convert route is this article's recommendation, so it deserves a section on where it does not hold up. There are four places, and three are not the converter's fault.

**It produces files, and files are not a wiki.** A Confluence space is a tree with cross-links. The HTML export flattens that tree into a directory of generated filenames, and every converter downstream inherits the flattening. You get the content and lose the navigation, unless you rebuild it from the index yourself. Marketplace apps advertising "preserves hierarchy" are advertising the one thing the free route does not do.

**Cross-page links do not survive the move.** A link from one page to another was a Confluence URL, and after conversion it still is — correct if Confluence is staying, wrong if this is a migration off it. Rewriting those links needs a mapping from page to new file path, and that mapping does not exist until you have decided the file layout. It is the single biggest piece of manual work in a real migration.

**Attachments point at a session.** Confluence's inline attachment links target its own download endpoint, which expects you to be signed in, so a page that looks complete in your browser has broken images for everyone else. The space export packages the files into the zip for this reason; the fix is repointing the links at those local copies. Pandoc's `--extract-media` gets partway there; the rest is a find and replace you write.

**What was a macro is now a snapshot.** Anything that was a live query — a Jira issue macro, an included page, a page tree — exported as whatever it rendered that day, and no converter can restore behaviour that was never in the file. The [how-to article](/blog/convert-confluence-page-to-markdown) has the macro-by-macro table if you need that before you commit.

And one about "free" rather than structure: **a free converter that uploads your wiki is a free converter that now has your wiki.** Internal documentation holds customer names, architecture and incident write-ups — half the things a company would rather not hand to a service nobody evaluated. Browser-side conversion and local command line tools are the two shapes where the question does not arise, and the difference shows up in no feature table; you check it by watching the network tab. [Whether an online converter is safe](/blog/is-an-online-converter-safe) is worth ten minutes before dropping a space export on anything.

## How to choose

1. **Settle the permission question before comparing anything.** Without space-admin rights the HTML export is unavailable to you, and a Marketplace app needs a site admin to install it. Both roads start with asking somebody, and which person is easier to reach decides your route more than any feature does.
2. **Decide the shape of the output first.** One document to read, or a directory of files? One document is a file drop on a converter that merges. A directory is Pandoc or a script, and a decision about folder layout before you start.
3. **Count the pages.** Under ten, manual work is cheaper than automation, and a single page's Word export is a legitimate free answer. Over a hundred, only a scripted route survives, because the hand-fixing afterwards will already consume your patience.
4. **Check whether the content can leave the machine.** Internal documentation usually cannot, which rules out any hosted converter that uploads and leaves browser-side conversion, a local tool, or a Forge app running in your own Atlassian environment.
5. **On the Marketplace, read the header and then the pricing tab.** Free app and Try it free sit in the same place and mean different things. Confirm the scope too: an app that exports one page free is a different product from one that exports a space.
6. **Convert one difficult page before converting four hundred.** Pick the page with the most macros, the widest table and the most attachments, and read the result properly. Everything that will go wrong across the space is already visible in that one file.

## Conclusion

The free Confluence to Markdown converter that works for almost everybody is not one tool: it is Confluence's own HTML space export followed by a free conversion of your choice. That route costs nothing, depends on nothing that can change its pricing, and works the same on Cloud, Server and Data Center. Its price is a permission — space admin — and saying so plainly is more useful than any feature comparison, because for a large share of the people searching this phrase the permission is the entire problem and no converter solves it.

From there the choice is easy. One readable document out of a space export zip is a file drop on [the Confluence conversion here](/confluence-to-markdown), free, with the zip staying on your machine when you are signed out. A repository full of files is Pandoc in a loop, or turndown with rules you wrote. And on the Marketplace, free means what the listing header says and nothing more — worth checking today rather than trusting an article, this one included.

## FAQ

### Is there a genuinely free Confluence to Markdown converter?

Yes, more than one, but the free part is rarely the converter itself. Confluence's HTML space export is free and needs space-admin permission; converting that export is free with Pandoc, a turndown script, or a browser converter that takes the zip directly. On the Marketplace, some apps are listed as free apps and others show Try it free, which is a trial.

### Can I convert Confluence to Markdown without being an admin?

Not at space scale. HTML, XML and CSV exports are space-level operations needing space-admin permission, and installing a Marketplace app needs an administrator too. For a single page you can already read, the Word export plus a Word to Markdown conversion is a free route requiring no extra permission.

### Why does the free export not include every page?

Because a space admin's own export contains only what their account can see — restricted pages are absent from the zip, with no warning. A site admin running the same export gets everything regardless of visibility (checked on support.atlassian.com, 14 September 2026). If a migration comes up short, check that first.

### Does a free Confluence to Markdown app keep the page hierarchy?

Some do, and it is the main thing worth comparing between them, because the export-and-convert route does not: the HTML export flattens pages into generated filenames and keeps the tree only in an index file. Check each listing for hierarchy, attachments and relative link rewriting — those three are what separates these apps.

### What is the fastest free way to read a Confluence space offline?

Export the space to HTML and hand the zip to a converter that merges it into one document with a contents list. That skips unzipping, the index file and any decision about folder structure, at the cost of the per-page file boundaries, which do not matter if reading is the goal.

### Should I use Pandoc or a browser converter for this?

Pandoc if the output is many files with a layout you control, because it scales and scripts. A browser converter if the output is one document and you want it without an install. Both are free and both run locally; the difference is the shape you need at the end, not conversion quality.

### Are the Marketplace app names here current?

They are what the listings showed on 14 September 2026, and this category changes faster than most. Vendors join and leave, free tiers appear and close, and pricing tabs move independently of listing headers. Treat the names as a starting point and read the current listing before deciding anything.
