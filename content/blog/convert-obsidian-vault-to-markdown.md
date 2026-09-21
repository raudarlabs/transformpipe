---
title: "Convert an Obsidian Vault to Markdown: Wikilinks, Embeds and What Stays"
description: An Obsidian vault is already Markdown files — what turning it into standard Markdown actually fixes, from wikilinks and embeds to callouts and Dataview
date: 2026-09-14
tag: Converting
keywords: obsidian to markdown, convert obsidian vault to markdown, obsidian wikilinks markdown, obsidian export markdown, obsidian vault export, obsidian markdown dialect
---

An Obsidian vault is a folder of `.md` files sitting on disk, which makes "convert it to Markdown" sound like a category error — it already is Markdown. The catch is in the word "already": Obsidian writes its own dialect on top of the CommonMark core, and four of its own constructs — wikilinks, embeds, block references and callouts — read as broken syntax or plain text to anything that is not Obsidian itself. There is nothing to export, because there is no export button and no format conversion in the usual sense. There is a rewrite, and it has to happen before the vault leaves Obsidian for good.

### TL;DR

The vault needs no export step — the files are already on disk — but four of Obsidian's own conventions do not survive contact with a standard Markdown parser: `[[wikilinks]]`, `![[embeds]]`, `[[Note#^block-id]]` block references, and `> [!note]` callouts. A `[[wikilink]]` is not a link to anything outside Obsidian until it is rewritten to a real relative path; an embed has no transclusion equivalent in standard Markdown at all, and becomes either an inline copy of the content or a plain link; a block reference has literally nothing to point at once the block-level id disappears; and a callout is a blockquote wearing a marker most renderers show as plain text. Turn off "Use \[\[Wikilinks\]\]" under Settings, Files and links, so new links are written as standard Markdown going forward — the setting applies only to links written after you change it, so an established vault needs the existing ones rewritten regardless. For a whole vault turned into one document with the wikilinks already resolved, [TransformPipe's Obsidian → Markdown conversion](/obsidian-to-markdown) reads a zipped vault directly and does the rewrite in the same pass.

What this does not fix, because nothing can: a Dataview query rendered a table only inside Obsidian, at display time, from a plugin — the query text converts fine, into a code block, and the table it used to produce is simply not there for a reader outside Obsidian to see.

## Why a vault of Markdown files still needs converting

CommonMark and GitHub Flavored Markdown, the two dialects nearly every tool outside Obsidian expects, have no concept of a wikilink, an embed, a block reference, or a callout block. Obsidian added all four as its own extensions on top of the standard syntax, because they are genuinely useful inside a personal knowledge base that already knows about every file in it — a wikilink can resolve to a note by title without you specifying a path, because Obsidian indexes the whole vault. The moment a file leaves that indexed environment — pasted into a GitHub README, opened in a plain text editor, fed to a static site generator — the index is gone and the shortcuts stop resolving to anything.

## Quick comparison: what needs rewriting, and what does the rewriting

| Obsidian construct | What a standard parser sees | Fix |
| --- | --- | --- |
| `[[Note]]` | Literal text: two open brackets, the word Note, two close brackets | Rewrite to `[Note](note.md)`, resolving the vault-relative path |
| `[[Note\|Shown text]]` | The same, literal | Rewrite to `[Shown text](note.md)` |
| `![[Note]]` (note embed) | Literal text | Inline the note's content, or a plain link — transclusion has no standard equivalent |
| `![[image.png]]` (file embed) | Literal text | Rewrite to `![](image.png)`, standard image syntax |
| `[[Note#Heading]]` | Literal text | Rewrite to `note.md#heading`, checking the target renderer's own slug rule |
| `[[Note#^block-id]]` | Literal text | No target to link to outside Obsidian — inline the quoted text instead |
| `^block-id` at a line's end | A stray caret and word, printed | Delete once nothing references it |
| `> [!note]` callout | A blockquote with the literal text `[!note]` on its first line | Strip the marker, keep the blockquote, note the type some other way if it matters |
| A ` ```dataview ` block | A code block showing the query text | Nothing to convert — the table was never in the file |
| `%%comment%%` | The text itself, visible, since Obsidian's inline comment syntax is not standard either | Delete before converting |
| YAML frontmatter (`---` block) | Usually fine, but a parser that does not recognise it renders the opening `---` as a horizontal rule | Strip it, or convert it to the target format's own front matter convention |

## Turning off wikilinks, and what it does and does not fix

The setting lives under Settings, Files and Links, "Use \[\[Wikilinks\]\]" — disable it and Obsidian writes standard Markdown links, `[text](path)`, for every link created from that point on (checked on obsidian.md and via Obsidian's own settings documentation, 14 September 2026). Autocomplete still works exactly the same way — type `[[`, pick a note from the suggestions — the only change is what gets written to disk once you confirm the choice.

| Pros | Cons |
| --- | --- |
| Zero migration cost for links written after the change | Every link written before the change is untouched — an established vault needs a separate rewrite pass regardless |
| Makes the vault immediately more interoperable going forward | Embeds, block references and callouts are unaffected — this setting only touches plain links |
| No plugin, no export, no new dependency | Autolinking by title still assumes the file exists at the path Obsidian resolved when the link was created |

**Who is this for?** Anybody planning to keep writing in Obsidian while making the vault progressively more portable. It is not a migration tool by itself — it stops the problem from growing, and the existing backlog of wikilinks still needs a pass.

## Rewriting wikilinks and embeds across an existing vault

For a vault that already has months or years of wikilinks in it, the practical fix is a script: walk every `.md` file, find the wikilink and embed patterns, resolve each target against the vault's own file index, and rewrite in place.

```text
WIKILINK = /!?\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/

for file in vault:
    text = read(file)
    text = replace_all(text, WIKILINK, (whole, target, shown) => {
        path = resolve_in_vault(target)      # match by filename, vault-wide
        text_shown = shown ?? target
        if whole starts with "!" and target looks like an image or attachment:
            return "![](" + path + ")"
        if path exists:
            return "[" + text_shown + "](" + path + ")"
        return text_shown                     # nothing to link to; keep the words
    })
    write(file, text)
```

The detail that catches a first attempt: `resolve_in_vault` has to search the whole vault by filename, not just the current folder, because Obsidian's own link resolution does exactly that — a wikilink written as `[[Meeting Notes]]` from any note in the vault finds a file named `Meeting Notes.md` wherever it sits, and a script that only checks the linking note's own directory will silently produce dead links for anything not stored alongside it.

**A note on ambiguity.** Two files with the same name in different folders are indistinguishable to a bare `[[Meeting Notes]]` link — Obsidian resolves to whichever it finds first by its own internal rule, and a rewrite script inherits the same ambiguity. If a vault has duplicate filenames across folders, resolve that before trusting any automated rewrite of the links between them.

## Callouts, Dataview, and the plugin ecosystem generally

A callout — `> [!note]`, `> [!warning]`, and Obsidian ships about a dozen types — is a blockquote with a bracketed type marker on its first line. A standard Markdown renderer shows the marker as literal text rather than styling the block, so the fix is either stripping the marker (losing the visual distinction between a note and a warning) or mapping each type to a target-format convention of your own, if the destination supports styled callouts at all.

Dataview is the case people misread most often. A Dataview query is written as a fenced code block with `dataview` as its info string — that block converts perfectly well, into an ordinary code block showing the query text. What does not convert is the table Dataview generated, because that table was never written into the file: Obsidian's Dataview plugin runs the query and renders the result at display time, every time the note is opened, and the source file only ever contained the question, never the answer.

The same logic applies to any plugin that renders something the file itself does not contain: a mind-map view, a graph view, a canvas. If a note's value depends on a plugin's rendering rather than its raw text, converting the text alone will always feel like it lost something, because it did — the rendering was never stored to begin with.

## Aliases: the other way a wikilink target is ambiguous

A note's YAML frontmatter can carry an `aliases` list, and Obsidian resolves a `[[wikilink]]` against any of a target note's aliases just as readily as against its real filename. That is convenient inside the vault — rename a note without breaking every link to its old title, as long as the old title is kept as an alias — and it is one more thing a rewrite script has to account for: `resolve_in_vault` needs to check each file's `aliases` frontmatter as well as its filename, or a link written against an alias resolves to nothing and falls back to plain, unlinked text.

## A community plugin, if you would rather not write the script

Obsidian's own plugin directory carries community-built export plugins — [obsidian-markdown-export-plugin](https://github.com/bingryan/obsidian-markdown-export-plugin) is one, exporting a note or a whole folder as a package with its linked images bundled alongside it and internal links rewritten to resolve outside the vault. It is a real option for someone who would rather install a plugin than write the resolver above, at the cost of adding a community plugin to your vault and trusting its own rewrite logic rather than one you can read line by line.

| Pros | Cons |
| --- | --- |
| No script to write or maintain yourself | A dependency on a community plugin's own release cadence and choices |
| Bundles image attachments alongside the exported Markdown | Behaviour for block references, callouts and Dataview is the plugin's own decision, not yours |
| Works from inside Obsidian's own UI, no separate tool | Check the plugin's current listing for its licence and maintenance status before relying on it for anything you cannot redo by hand |

**Who is this for?** Someone exporting a handful of notes at a time from inside Obsidian, rather than scripting a whole-vault migration or reaching for a browser-based merge.

## Making a vault portable before you need it to be

Four habits keep a vault convertible without changing how you write day to day:

- **Turn off wikilinks** so new links are standard from here forward.
- **Keep attachments inside the vault folder**, not referenced from outside it, so relative paths hold when the folder is copied or zipped.
- **Prefer a link over an embed** where either would do — a link degrades gracefully into a link; an embed degrades into either a duplicate copy of content or a bare set of brackets, depending on the converter.
- **Treat block references as a personal navigation aid**, not as a way to build an argument out of scattered pieces, since a block reference has no standard-Markdown downgrade path at all — outside Obsidian it is not a broken link, it is nothing.

## Upload the vault directly, merged into one document

The rewrite above is worth doing for a vault staying a folder of separate files. If the destination was always one document — an export to hand off, an archive of a project's notes — [TransformPipe's Obsidian → Markdown conversion](/obsidian-to-markdown) skips the file-by-file rewrite: zip the vault folder and upload it, and every note becomes a section of one document, in its original order, with a generated table of contents. Wikilinks, aliases and heading anchors resolve to the words they displayed rather than to a path, for the same reason a cross-page link in a merged Notion or Confluence export keeps its words instead of its address — once every note is a section of the same document, there is nowhere left for a link to point.

| Pros | Cons |
| --- | --- |
| No script, no vault-wide filename index to build yourself | Produces one document — the wrong shape if notes need to stay separate files with their own paths |
| Frontmatter is stripped automatically, and an `![[image.png]]` embed becomes the picture itself, carried inside the document | Two megabytes of pictures per document is the ceiling; an attachment that is not a picture — a PDF, an audio note — still becomes plain italic text |
| Runs in the browser; the vault is never uploaded when signed out | Dataview tables and other plugin-rendered content are absent, the same as any other route, because the source file never had them |

**Price:** free, runs locally.

**Who is this for?** A vault, or part of one, being handed off or archived as a single readable document rather than kept as a live, separately-linked set of files.

## How to choose

1. **Decide whether the vault stays a folder of files or becomes one document.** Separate files with working relative links wants the rewrite-in-place script. One document wants the merge route — it resolves the same wikilink problem a different way, by removing the need for a separate target to resolve to.
2. **Check for Dataview blocks and other plugin-rendered content before converting anything.** They convert as query text, correctly, and the table or view they used to produce is not recoverable from the file — note where those tables mattered while you can still see them rendered.
3. **Watch for duplicate filenames across folders.** A wikilink to a non-unique name is ambiguous even inside Obsidian; a rewrite script inherits that ambiguity rather than resolving it for you.
4. **Turn off wikilinks going forward regardless of which route you pick for the backlog.** It costs nothing and stops the problem from growing while you deal with what already exists.

If the question is which tool rather than which route — every option here is free, and they differ in setup cost and in how much control they give you over the ambiguous cases — [the free Obsidian converters compared](/blog/free-obsidian-to-markdown-converter) is the shorter answer.

## Conclusion

An Obsidian vault does not need exporting so much as translating: the files are Markdown already, and the work is entirely in the four places Obsidian wrote its own syntax on top — wikilinks, embeds, block references and callouts. Rewriting them in place keeps the vault a folder of separate, working files; merging the whole vault into one document solves the same wikilink problem by removing the need for a separate target to resolve to at all. Either way, nothing recovers a Dataview table or a plugin's rendered view, because neither was ever stored in the file to begin with — check for those while the vault is still open in Obsidian, not after. [How Notion and Confluence compare](/blog/markdown-from-notion-obsidian-and-confluence) on the same export-then-repair problem is worth reading if Obsidian is not the only source in play.

## FAQ

### Does Obsidian have an export-to-Markdown feature?

No, and it does not need one — a vault is already a folder of `.md` files on disk. What needs converting is Obsidian's own syntax layered on top of standard Markdown: wikilinks, embeds, block references and callouts, none of which a standard parser reads correctly.

### How do I convert Obsidian's `[[wikilinks]]` to standard Markdown links?

Turn off "Use \[\[Wikilinks\]\]" under Settings, Files and links, for anything written from that point on. For links already in the vault, a script needs to find each `[[wikilink]]`, resolve the target filename against the whole vault, and rewrite it as a standard `[text](path)` link.

### What happens to Dataview queries when I convert a vault?

The query itself converts fine, as a fenced code block showing the query text. The table it used to render does not convert, because it was never stored in the file — Dataview generates it at display time, inside Obsidian, from a plugin.

### Can I keep Obsidian callouts when converting to standard Markdown?

Not as styled callouts, since `> [!note]` is Obsidian-specific syntax. The safe fallback is stripping the bracketed marker and keeping the blockquote; if the type matters, note it in the text itself, since a standard renderer will not style different callout types differently on its own.

### What does an embed like `![[Note]]` become outside Obsidian?

Literal text — two exclamation-adjacent brackets, the note's name, two closing brackets — unless something rewrites it. There is no standard-Markdown transclusion syntax, so the honest fixes are inlining the referenced note's content directly, or converting the embed to a plain link, depending on whether the destination format has any equivalent at all.

### Can I convert a vault without uploading it anywhere?

Yes, if the converter runs locally in your browser rather than sending the files to a server — worth checking for a vault with anything sensitive in it, by watching the network panel while converting and confirming nothing leaves.

### My wikilink points at a note's old title. Why does it still work in Obsidian but not after conversion?

Because the old title is likely stored in that note's `aliases` frontmatter, and Obsidian resolves wikilinks against aliases as well as real filenames. A rewrite script or converter needs to check the same aliases list, or a link written against a renamed note's old title resolves to nothing once it leaves Obsidian.

### Do I need to convert block references before sharing a vault outside Obsidian?

Yes, in the sense that nothing else will render them usefully — `[[Note#^block-id]]` has no equivalent outside Obsidian at all. The only honest fix is inlining the quoted text directly where the reference was, since there is no external target for it to point to.
