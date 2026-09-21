---
title: "Free Obsidian to Markdown Converter: Every Option Compared"
description: An Obsidian vault is already Markdown, so nothing needs buying — compare the free tools that fix wikilinks, embeds, block references and callouts
date: 2026-09-14
tag: Converting
keywords: free obsidian to markdown converter, obsidian markdown export tool, obsidian to markdown free, export obsidian vault free, obsidian markdown converter online, obsidian export plugin free
---

Somebody searching for a free Obsidian to Markdown converter has usually already found the awkward part: there is nothing to buy, because there is nothing to convert. An Obsidian vault is a folder of `.md` files on disk. You can open one in Notepad, or commit the whole thing to a repository, without touching a converter at all. The format is the destination format.

And yet the search happens constantly, because the files do not work once they leave. A note that reads perfectly inside Obsidian arrives somewhere else carrying `[[Project Brief]]` in double brackets, a `> [!warning]` marker printed as literal text at the top of a blockquote, and an `![[diagram.png]]` that shows nothing. What people are shopping for is not a format change. It is a repair job on four constructs Obsidian invented, and every tool worth comparing is a different answer to how those four get repaired.

That reframes the price question usefully. When the base format is free and the source files are already yours, "free" stops being a discount and becomes the default. What the options actually cost is setup, control, and how much of the vault's structure you are willing to lose in the trade.

### TL;DR

Every serious option here is free, so pick on shape rather than price. **The browser converter at [/obsidian-to-markdown](/obsidian-to-markdown)** takes a zipped vault and returns one document with a table of contents, wikilinks collapsed to the words they displayed and frontmatter stripped — no install, nothing uploaded when signed out, and the right answer when the destination is a single readable document. **[obsidian-export](https://github.com/zoni/obsidian-export)** is a free Rust CLI (BSD-2-Clause-Patent, checked on github.com/zoni/obsidian-export, 14 September 2026) that walks a vault and writes CommonMark files out the other side with links and embeds resolved — what you want when the vault must stay a folder of separate files. **Obsidian's own "Use \[\[Wikilinks\]\]" setting** costs nothing and fixes nothing retroactively. **A community export plugin** exports a note or folder with its images bundled, from inside Obsidian itself. **Pandoc** is free and GPL, and reads wikilinks only behind a non-default extension — with no vault index, it cannot resolve `[[Note]]` to a path the way Obsidian does. **A script you write yourself** is the only route that lets you decide what happens to a duplicate filename. For the syntax detail behind all of this, [the full how-to covers the dialect note by note](/blog/convert-obsidian-vault-to-markdown).

## Why a folder of Markdown files still needs a converter

The reason this job exists at all is that Obsidian's dialect is a superset, and the extras are not marked as extras anywhere in the file. There is no flag, no namespace, no fenced region that says "this bit is ours". A wikilink looks exactly like ordinary text with brackets in it, which is precisely why a standard parser treats it as ordinary text with brackets in it.

Four constructs carry almost all of the damage, and they are the entire basis on which the tools below differ:

**Wikilinks** — `[[Note]]`, `[[Note|Shown text]]`, `[[Note#Heading]]` — resolve inside Obsidian against an index of the whole vault, matching a file by name wherever it lives and against its `aliases` frontmatter as well. Outside the vault that index is gone, so there is nothing left to resolve against.

**Embeds.** `![[Note]]` inlines another note at display time; `![[image.png]]` shows an attachment. Standard Markdown has an image syntax and no transclusion syntax at all, so a note embed has no equivalent to convert into — only a choice between inlining a copy and dropping to a plain link.

**Block references.** `[[Note#^block-id]]` points at a paragraph via an id appended to that paragraph's line. When the id goes, the reference does not break; it ceases to refer to anything.

**Callouts.** `> [!note]`, `> [!warning]` and the rest are blockquotes with a typed marker on the first line. Everywhere else, the marker is text.

A fifth item is not a construct but a category error worth naming early: anything a plugin rendered rather than wrote. A Dataview query is stored as a fenced code block containing the question, and the table it produced was generated on open, every time. No converter, free or otherwise, recovers it, because there is nothing to recover. Frontmatter and `%%inline comments%%` round out the list, both cheap to handle if the tool bothers — [what converters do with front matter generally](/blog/front-matter-and-what-converters-do-with-it) applies here without modification.

## What "free" costs in each direction

Since the price column below reads "free" in every row, it is worth being explicit about what varies instead.

**Setup cost.** A browser page is zero. A Rust binary is a download or a `cargo install`. A community plugin is a plugin you now maintain. A script is an afternoon and then forever.

**Control over ambiguity.** Two notes named `Meeting Notes.md` in different folders are ambiguous to a bare `[[Meeting Notes]]` even inside Obsidian, which resolves by its own internal rule. Every automated tool inherits that ambiguity rather than resolving it; only code you wrote lets you decide which one wins.

**Output shape.** The real fork in the road, and not a quality difference: some tools produce a folder of files with working relative links between them, others produce one document, which removes the need for a link target at all.

**Where the vault goes.** A vault is often the most personal thing a person owns in text, so a converter that runs locally and one that uploads are the same price and not the same transaction — the general version of that question is [whether an online converter is safe](/blog/is-an-online-converter-safe).

## Quick comparison: the cheat sheet

| Tool | Best for | Key capability | Price |
| --- | --- | --- | --- |
| TransformPipe | A vault, or part of one, that should become one readable document | Zipped vault in, one document with a table of contents out, wikilinks and frontmatter handled in the same pass | Free |
| obsidian-export | A vault that must stay a folder of separate, linked files | Recursive vault-to-CommonMark export, resolving `[[note]]` links and `![[note]]` embeds | Free, BSD-2-Clause-Patent |
| Obsidian's "Use \[\[Wikilinks\]\]" setting | Stopping the backlog from growing | Writes standard `[text](path)` links for everything created after the change | Free, built in |
| A community export plugin | Exporting a note or folder from inside Obsidian | Bundles linked image attachments alongside the exported Markdown | Free |
| Pandoc | A vault that is one input in a document build you already run | Wikilink support behind a non-default extension, into any format Pandoc writes | Free, GPL |
| A script you write yourself | Duplicate filenames, aliases, and rules only you know | Exact control over every ambiguous case, and nothing else to trust | Free, costs time |

## The options, one at a time

### TransformPipe — best when the vault should become one document

Zip the vault folder, drop the archive on [/obsidian-to-markdown](/obsidian-to-markdown), and every note comes back as a section of a single Markdown document, in path order, under a generated table of contents. There is no install, no account required, and signed out the archive is read by the page off your own disk rather than sent anywhere.

The design choice underneath it makes the wikilink problem disappear rather than solving it: when every note is a section of the same document, there is no separate file for a link to point at. So `[[Project Brief]]` becomes the words *Project Brief*, `[[Project Brief|the brief]]` becomes *the brief*, and `[[Project Brief#Scope]]` becomes *Project Brief* — in each case the text the reader was seeing anyway. A loss if you wanted navigable links; exactly right if you wanted something somebody can read end to end.

| Pros | Cons |
| --- | --- |
| No install, no binary, no plugin — a zip and a browser tab | One document, not a folder of files: the wrong shape if the notes must stay separately addressable |
| Wikilinks, alias-style `\|` labels and `#heading` anchors all collapse to their displayed words in one pass | Links become plain text rather than working links, because there is no external target left |
| Frontmatter is stripped rather than rendered as a stray horizontal rule and a block of key-value noise, and an image embed becomes the picture itself | Two megabytes of pictures per document is the ceiling, and an attachment that is not a picture still becomes italic placeholder text |
| A generated table of contents, so a hundred-note vault is navigable from the top | Dataview tables and other plugin-rendered views are absent, as they are by every route |
| Runs in the browser; the vault is not uploaded when signed out | A very large vault is limited by the machine doing the work |

**Price:** free. An account adds history and sharing, also free.

**Technical details and features**

- The archive is read for `.md` entries only, sorted by their full path inside the zip, which is what fixes the order of sections in the output — rename a folder and the order changes with it
- A note's title comes from its filename rather than from anything written inside it, matching how Obsidian itself identifies notes; if that note's own first line repeats the title as an H1, the duplicate is dropped rather than printed twice
- The wikilink rewrite covers `[[Target]]`, `[[Target|Shown]]`, `[[Target#Heading]]` and `[[Target#Heading|Shown]]`, plus the `![[...]]` embed form of each
- An embed whose target is a picture in the zip becomes that picture, carried inside the document; one whose target is any other recognised document or media file becomes italic text naming it, rather than a broken reference pointing at a file that is not there
- The YAML frontmatter block at the top of a note is removed before anything else runs
- Sections are joined with a horizontal rule between them, the same convention the app uses for [merging several Markdown files into one](/blog/merging-many-markdown-files)

**Who is this for?** Somebody handing a vault, or a project's worth of notes from one, to a person who does not use Obsidian — a client, an archive, a hand-off, a document that needs to be read rather than navigated. Not the tool for a vault that has to keep working as a linked graph on the far side.

### obsidian-export — best when the vault stays a folder of files

obsidian-export is a command line program and Rust library that walks a vault and writes plain CommonMark out the other side, one file in for one file out. It is the closest thing to a purpose-built free converter for this job that is not a plugin, and its own documentation is careful to say it is not officially endorsed by Obsidian and supports most but not all of the dialect.

| Pros | Cons |
| --- | --- |
| Preserves the folder shape: separate files with the links between them resolved, not flattened | A command line tool, so a terminal is a prerequisite |
| Handles both `[[note]]` references and `![[note]]` file includes rather than only plain links | Not endorsed by Obsidian, and its own README says coverage of the dialect is partial |
| Exclusion patterns use gitignore syntax, and files already ignored by git are skipped by default | Assumes UTF-8 for note text and filenames, with lossy conversion otherwise |
| Frontmatter behaviour is a flag rather than a fixed decision | Another binary to install and keep current |
| Scriptable, so the export is repeatable rather than a thing somebody remembers | A partial export has rules worth reading first |

**Price:** free, BSD-2-Clause-Patent per the project's own `Cargo.toml` (checked on github.com/zoni/obsidian-export, 14 September 2026).

**Technical details and features**

- `obsidian-export /path/to/vault /path/to/output` is the whole basic invocation; the destination directory must already exist
- `--start-at` exports a subset of the vault while still treating the whole vault as the resolution context, so links out of the exported subset remain intact. Naming a single file as the source instead deliberately resolves nothing — the documentation calls that by design
- `--frontmatter=never` strips frontmatter entirely, `--frontmatter=always` inserts an empty block for static site generators that require one, and the default copies it across as-is
- Hidden files, paths matched by an `.export-ignore` file, and anything git already ignores are excluded by default, each adjustable by its own flag
- `--skip-tags` and `--only-tags` filter notes by frontmatter tags, which is a genuinely useful way to export the public half of a vault
- A note linking to an excluded note is unlinked rather than left pointing at nothing — the link text survives, the link does not
- Two notes embedding each other is an error by default, with `--no-recursive-embeds` breaking the cycle by inserting a link on the second encounter instead

**Who is this for?** Anybody exporting a vault into a static site, a documentation repository, or anywhere the notes need to keep their individual identities and their links to each other. This is the free tool that most directly matches the mental model of "export my vault" as most people mean it.

### Obsidian's own "Use \[\[Wikilinks\]\]" setting — free, built in, and only half a fix

The setting lives under Settings, Files and links: turn "Use \[\[Wikilinks\]\]" off and Obsidian writes standard `[text](path)` Markdown links for everything you create from that moment on (checked on obsidian.md and via Obsidian's own settings documentation, 14 September 2026). Autocomplete is unchanged — type `[[`, pick the note — only the syntax written to disk differs.

| Pros | Cons |
| --- | --- |
| Costs nothing and adds no tool, plugin or dependency | Purely forward-looking: every link written before the change is untouched |
| The writing experience does not change at all — same autocomplete, same flow | Only affects plain links; embeds, block references and callouts are unaffected |
| Makes the vault progressively more portable with no migration event | Not a conversion in any sense — an established vault still needs a rewrite pass |

**Price:** free, part of the app. Obsidian itself is free for personal use, with a commercial licence at $50 per user per year for professional use in an organisation, and optional Sync and Publish add-ons priced separately (checked on obsidian.md, 14 September 2026).

**Who is this for?** Everybody, regardless of which other option you pick for the backlog. It is the one item on this page that is free of trade-offs, because it does not attempt the hard part.

### A community export plugin — best for a note or folder, from inside Obsidian

Obsidian's community plugin directory carries export plugins, and [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) is a real, actively pushed example: it exports a single note or a whole folder as a package with its linked images bundled alongside the Markdown, from a command inside Obsidian rather than a separate tool.

| Pros | Cons |
| --- | --- |
| Runs from inside the app, on the note you are looking at | The repository carries no licence file, which matters if you intend to fork or vendor its code (checked on github.com/bingryan/obsidian-markdown-export-plugin, 14 September 2026) |
| Keeps the images as files beside the exported Markdown, where the merge-to-one-document route puts them inside the document instead | A community plugin is a dependency with its own release cadence and its own decisions |
| Has an option for GitHub Flavored Markdown output, which is the flavour most destinations agree on | Its handling of block references, callouts and plugin-rendered content is the plugin's choice, not yours |
| Exports folders as well as single files, and can also output HTML | Plugin-based export scales poorly to a whole vault compared with a CLI you can script |

**Price:** free, installed from Obsidian's community plugin browser.

**Technical details and features**

- Documented capabilities are folder and single-file export, inclusion of image attachments, an option for GitHub Flavored Markdown output, embedded content handling, and output as either `md` or `html` (checked on github.com/bingryan/obsidian-markdown-export-plugin, 14 September 2026)
- Installation is the ordinary community plugin path: Settings, community plugins, browse, search for "markdown export"
- Because it runs inside Obsidian, it has access to the same vault index Obsidian itself uses when resolving a link — the structural advantage plugins have over every external tool here

The usual caution about community plugins applies without being precious about it: before relying on one for something you cannot redo by hand, check its current listing for maintenance status and read what it does with the constructs you actually have. A plugin that quietly drops callouts is fine if you have no callouts.

**Who is this for?** Somebody exporting a handful of notes at a time, with images, who would rather stay inside Obsidian than learn a terminal tool. Attachments are the deciding feature — this is the only option on the page that carries them out with the text.

### Pandoc — best when the vault is one input among several

Pandoc is the general document converter, free and GPL licensed (checked on pandoc.org, 14 September 2026), and it earns a row here for people who already have it in a build. It does know about wikilinks, but on terms worth understanding before you reach for it.

| Pros | Cons |
| --- | --- |
| Already installed on a great many documentation build machines | No vault index: it cannot resolve `[[Note]]` to `folder/Note.md` the way Obsidian does |
| Wikilink parsing is available through a documented extension | The extensions are non-default, so a plain `-f markdown` run leaves wikilinks as literal text |
| Writes to every output format Pandoc supports from the same input | Knows nothing about callouts, block references or Dataview — they pass through as whatever they textually are |
| Composes with filters, so a custom rewrite can run inside the conversion | Per-file by nature; a vault is a loop you write around it |

**Price:** free, GPL licensed.

**Technical details and features**

- `--from=markdown+wikilinks_title_after_pipe` enables `[[Wiki]]` and `[[URL|title]]` parsing; `wikilinks_title_before_pipe` is the mirror image, `[[title|URL]]` (checked in the Pandoc manual on pandoc.org, 14 September 2026)
- Both appear in the manual's non-default extensions section, so neither is active unless you name it. Obsidian puts the target first and the display text after the pipe, which makes `wikilinks_title_after_pipe` the one that matches a vault
- What the extension gives you is a link whose destination is the literal text inside the brackets — useful, and not the same as a resolved relative path to a file elsewhere in the vault
- A Lua filter is the honest way to close that gap: parse the link target, look it up in an index you built from the vault yourself, and rewrite the destination

**Who is this for?** Somebody whose notes are one input into a build that already runs Pandoc for other reasons. As a standalone Obsidian converter it is the weakest option here, because the part that is hard — the vault-wide resolution — is precisely the part it does not do.

### A script you write yourself — best for the cases nobody else can decide

The last free option is the one with no tool in it. Walk the vault, build an index of every filename and every alias, find the wikilink and embed patterns, resolve each target against that index, rewrite in place.

| Pros | Cons |
| --- | --- |
| The only route where you decide what a duplicate filename resolves to | You are now maintaining a converter |
| Aliases, tag rules and folder conventions specific to your vault can all be encoded | Every edge case in the dialect is yours to discover, usually after the export |
| No dependency, no plugin, no binary, and nothing to trust but code you can read | Slower to first result than any other option here, and the interesting failures are silent |

**Price:** free, paid in time.

**Technical details and features**

- One regular expression over `!?\[\[target(#heading)?(\|shown)?\]\]` catches the whole family, embeds included; the how-to linked above walks through a working version with its resolver
- Resolution must search the whole vault by filename, not the linking note's own directory, because that is what Obsidian does; a directory-local resolver produces dead links for every note stored elsewhere and reports nothing
- The index needs each note's `aliases` frontmatter alongside its filename, or a link written against a renamed note's old title falls through to plain text
- Keep a test vault with one of each construct in it — a callout, an embed, a block reference, an aliased link, a duplicate filename — and run every change against it

**Who is this for?** Anybody moving a large, long-lived vault somewhere it has to keep working, where a silent dead link is worse than an afternoon of writing code. Also anybody who tried one of the tools above and found a rule they disagreed with.

## Where the free and obvious choice falls down

The obvious free choice, for most people, is "just copy the folder" — the vault is Markdown, so move it and be done. Where that fails is worth being precise about, because the failures are quiet and arrive later.

**Links look fine until somebody clicks one.** In a plain text editor `[[Project Brief]]` is legible and a reader understands it. In a rendered GitHub README or a static site it is legible and dead. Nothing errors; the page just carries a piece of text that looks like it wants to be a link, and the reader assumes the site is broken rather than the source.

**Callouts lose their emphasis but keep their words.** A `> [!warning]` blockquote loses its styling and keeps its text, so a note that used callout colour to distinguish "do this" from "never do this" now reads as two identical blockquotes. That is worse than losing the content, because the content is present and its weighting is gone.

**Attachments break in a way the text does not show.** Images live in an attachments folder referenced by an embed. Copy the `.md` files without the folder and every image is gone; copy the folder to a different relative position and every image is gone in a way that looks identical. The Markdown is unchanged and correct in both cases.

**Block references are not a broken link, they are nothing.** `[[Note#^a1b2c3]]` outside Obsidian points at an id that no longer exists anywhere in any file. There is no target to fix and no fallback to render. The only honest repair is to inline the text that was being pointed at, which means still having the vault open in Obsidian to see what it was.

**Plugin-rendered content leaves no trace of having existed.** A note whose entire value was a Dataview table converts to a code block containing a query. To a reader who never used the vault, that note now looks like it was always a fragment. Check for these while the vault still renders them.

**And frontmatter is sometimes load-bearing.** It can be the only place a note recorded where it came from or who it was about. The merge route strips it automatically, which is right for readability and worth a glance first if those properties mattered.

## How to choose

1. **Decide the output shape first, because it is not cheaply reversible.** A folder of separate files with working links between them points at obsidian-export or your own script; one document for a person to read points at the merge route. Converting the wrong way and reshaping by hand afterwards is the slowest version of this job.
2. **Search the vault for the four constructs before you pick.** `grep` for `![[`, for `> [!`, for `#^`, and for ```` ```dataview ````. A vault with no embeds and no callouts can use almost anything here; a vault built on them needs a tool whose handling of them you have actually read.
3. **Check whether attachments have to come along.** If they do, the plugin route or a file-to-file CLI export are the only options that carry them. A Markdown-only merge cannot, by construction, and no configuration changes that.
4. **Count how many times this will happen.** Once is a browser tab. Every week, or on every commit, is a CLI in a script — a person remembering to drag a zip onto a page is the step that eventually stops happening.
5. **Look for duplicate filenames before trusting any automated rewrite.** `find . -name '*.md' | xargs -n1 basename | sort | uniq -d` takes a second. Nothing returned means every tool here is safe on that axis; rows returned mean only a script you control resolves them the way you meant.

## Conclusion

There is no paid tier to compare here, which makes this an unusually honest comparison: every route is free, and the decision is entirely about output shape and how much of Obsidian's dialect each one understands. For a vault that must stay a working folder of linked files, obsidian-export is the free tool built for exactly that. For a note or folder whose images have to travel with it, a community plugin is the only route that carries binaries. For a vault becoming one document somebody outside Obsidian will read, TransformPipe's [Obsidian to Markdown conversion](/obsidian-to-markdown) does the merge, the table of contents, the wikilink collapse and the frontmatter strip in one pass, in the browser, with nothing uploaded. Whichever you pick, turn off "Use \[\[Wikilinks\]\]" the same day so the backlog stops growing, and check for Dataview blocks while the vault is still open — that is the one thing no converter here, at any price, recovers. If Obsidian is not the only source in play, [the three-export comparison](/blog/markdown-from-notion-obsidian-and-confluence) covers what Notion and Confluence do differently.

## FAQ

### Is there a genuinely free Obsidian to Markdown converter?

All of them are. Obsidian's files are already Markdown and every tool on this page is free to use, so there is no paid tier to compare against. The options differ on whether they produce separate files or one document, and on how completely they handle wikilinks, embeds, block references and callouts.

### Does Obsidian have a built-in export to Markdown?

No, and it does not need one — the vault is a folder of `.md` files already. Obsidian does have a "Use \[\[Wikilinks\]\]" setting that makes new links standard Markdown, but it applies only to links written after you change it, so it is a preventive measure rather than an export.

### What is the fastest free way to turn a whole vault into one file?

Zip the vault folder and drop it on a browser converter that reads the archive directly — it returns one document with every note as a section under a generated table of contents. Nothing to install, and the wikilink problem resolves itself, because a merged document has no separate files for links to point at.

### Will a free converter keep my images?

Only some. A plugin that exports a note or folder with its attachments bundled will; a tool that produces a single Markdown document cannot, because a Markdown file holds text and a reference to an image, never the image itself. Check which behaviour you are getting before converting a vault where the diagrams carry the meaning.

### Can Pandoc convert an Obsidian vault for free?

Pandoc is free and GPL licensed, and it parses wikilinks through the non-default `wikilinks_title_after_pipe` extension. What it cannot do is resolve a wikilink to a file elsewhere in the vault, because it has no index of one — so beyond the simplest notes it needs a filter or wrapper script doing the resolution itself.

### What happens to Dataview tables and other plugin content?

Nothing carries them across, because they were never in the file. Dataview stores the query and renders the table at display time inside Obsidian, so a converted note shows the query as a code block and no table at all. Note where those tables mattered before you convert, while they are still visible.

### Is it safe to convert a vault in a browser?

It depends entirely on whether the page uploads the file or reads it locally. A converter doing the work in your own browser never sends the archive anywhere, which you can verify by opening the network panel and watching nothing happen — worth doing once for a vault with anything private in it.
