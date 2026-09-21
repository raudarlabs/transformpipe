---
title: "Convert a Notion Export to Markdown: Every Route, Ids Included"
description: How to turn a Notion "Export as Markdown & CSV" zip into clean Markdown — the id suffix on every filename, what a script fixes, and what only merging solves
date: 2026-09-14
tag: Converting
keywords: notion export to markdown, convert notion to markdown, notion to md, notion api markdown, notion page to markdown, notion markdown export, notion zip to markdown
---

Notion's export button says "Markdown & CSV" and hands you a zip that is, technically, telling the truth. Open it and every file is real Markdown: headings, lists, links, all readable in any editor. What it does not tell you is that every filename and every link between pages now carries a 32-character hexadecimal id, that a database came out as a separate CSV your Markdown files do not reference, and that the export is a snapshot of one moment, not a live copy of anything.

None of that is a bug. Notion identifies a page by its id and treats the title as a label that can change, so the export has to put the id somewhere durable — the filename is where it lands. The problem is entirely downstream: a folder of files that all point at each other by id is fine for Notion and unreadable as a migration target until something rewrites those pointers.

### TL;DR

Three routes actually work. **Export as Markdown & CSV, then rewrite the ids** is the general-purpose route: unzip, build a map from each file's id suffix to the name you actually want, rewrite every link and every filename from that one map. It is manual at ten pages and a script at a thousand. **`notion-to-md`**, an open-source Node package that reads pages through Notion's own API, is the better fit for a scripted pipeline or a static site build, because it never produces the id-suffixed filenames in the first place — you name the output yourself. **Uploading the export zip directly to a converter that merges it** — [TransformPipe's Notion → Markdown conversion](/notion-to-markdown) is one — skips the id problem a third way: every page becomes a section of one document, in order, with a table of contents, and a cross-page link keeps its words rather than pointing at a file that will not exist. Pick the first for a folder of separate files you will maintain, the second for automation, the third for one document to read or share.

Whichever route, three things do not survive any of them: comments, because they are discussion attached to a page rather than page content; a database's non-default views, because Notion exports only the view you are looking at; and synced blocks, which come out as their content in every place they were shown, duplicated, with no marker that they were ever the same block.

## Why the id is there, and why it does not go away on its own

A page in Notion is identified by a UUID the moment it is created. The title is metadata attached to that id, editable at any time, shown nowhere the export needs to look a page up by. So when the export writes `Meeting notes.md`, it has no guarantee that name is unique — two pages titled "Meeting notes" exist in most workspaces older than a year — and it solves that by writing the id into every filename it produces.

```text
Meeting notes 21f4c8a1b2c34d5e8f90123456789abc.md    the file on disk
Meeting%20notes%2021f4c8a1b2c34d5e8f90123456789abc.md    the link another page uses to reach it
meeting-notes.md    what you actually want to keep
```

A link from one page to another is written against the exact filename, percent-encoded for the space. Rename the file to drop the id and every link that pointed at the old name breaks — silently, since a dead relative link in a folder of Markdown files produces no error until somebody clicks it. That is the entire migration problem: the rename and the link rewrite have to happen together, from one map, in one pass.

## The export dialog, and the limits it does not announce

Notion's export lives under the page or workspace menu as "Export," offering a format choice of PDF, HTML, or Markdown & CSV, an "Include content" dropdown that can exclude files and images, an "Include subpages" toggle, and a "Create folders for subpages" toggle (checked on notion.com, 9 September 2026). Three limits from the same surface matter before a migration is planned around it:

- Only the current or default view of a database exports. All views at once is not supported, and a form view cannot be exported at all — the table view goes out instead.
- A large export is emailed as a download link rather than started immediately, the link expires after seven days, and processing can take up to thirty hours.
- Subpages are exported as nested folders when the toggle is on, which is what makes the zip's directory structure worth keeping rather than flattening.

That processing time is a scheduling fact, not a footnote. "Export the workspace Friday afternoon, convert it Friday evening" assumes a export that finishes in minutes; for a large workspace it may not.

## Quick comparison: three routes and what each costs

| Route | Best for | Keeps | Loses | Install |
| --- | --- | --- | --- | --- |
| Export as Markdown & CSV, rewrite ids by hand or with a script | A folder of separate files you will keep editing | Every page, exact structure, database rows as a CSV | Comments, non-default views, synced-block identity | None, or a short script |
| `notion-to-md` via the Notion API | A build step, a static site, scheduled sync | Whatever you write into your own renderer | Same as above, plus anything your renderer does not implement | Node, an integration token |
| Upload the export zip directly (TransformPipe) | One document to read or share | Every page in order, a table of contents, database rows as a table | Cross-page link addresses, comments, non-default views | None |
| Copy a page, paste into an editor | A handful of pages, once | Formatting the paste target understands | Everything about scale — this does not extend past a few pages | None |

## Export as Markdown & CSV, then fix the ids

This is the export described above, and the honest way to use it is to treat the id as data rather than noise: it is the one thing in the zip that uniquely and permanently identifies a page, so it is the join key for the rename.

```text
1. Unzip the export.
2. Walk every .md and .csv filename, split off the trailing id, build id -> new-name.
3. Rewrite every filename using the map.
4. Walk every file's content, find links matching the export's own href pattern,
   look up the id in the same map, rewrite the href to the new name.
5. Flatten or keep the folder structure, depending on where the files are going.
```

| Pros | Cons |
| --- | --- |
| No new dependency, no account, no API token | The rename and the link rewrite must be one pass over one map, or half the links break |
| Works offline, on files you already have | A database's `.csv` is not automatically joined back into the page it belonged to |
| The safest route when the destination is a folder of files that must keep their own filenames | Ten pages by hand costs an evening; a thousand pages by hand is not realistic |

**Technical details.** The id is 32 lowercase hexadecimal characters, separated from the title by a space (sometimes an underscore, depending on the client version that produced the export). A regex anchored at the end of the filename — strip the extension first, then match the trailing id — reliably splits the two. Links inside the Markdown are relative and percent-encoded exactly like the filename, so the same regex, applied after URL-decoding, finds the id inside a link too. A database's `.csv` sits beside the folder for the page that held it, named the same way with its own id suffix; joining it to the page it belongs to is a filename match, not something the export records anywhere else.

**Who is this for?** Anybody whose destination is a folder of Markdown files that need to keep working as separate files — a docs site with one page per URL, a wiki import where each page becomes its own entry. The output is real files with real names; what it costs is doing the rewrite correctly once.

**A minimal version of the script**, in outline rather than a full program, because the shape matters more than the language:

```text
map = {}
for file in list(export_folder, recursive=true):
    id = extract_trailing_hex(file.name_without_extension)
    map[id] = slugify(file.name_without_extension_or_id)

for file in list(export_folder, recursive=true):
    text = read(file)
    text = replace_all(text, LINK_PATTERN, (id) => map[id] ?? id)
    write(new_path_for(file, map), text)
```

`LINK_PATTERN` is a regex over the export's own link shape — a relative href ending in `.md` or `.csv`, percent-encoded, with the same trailing hex id the filename carries. The one detail that catches people out: run the id extraction over the *decoded* href, not the raw percent-encoded one, since `%20` is not going to match a pattern written for a literal space.

**Databases deserve their own pass.** A full-page database exports as a `.csv` beside a folder of one `.md` per row that had a page body, each row file carrying its own id suffix the same way a page does. Rebuilding "the table, with a link to the fuller page for any row that had one" is a join between the CSV's rows and the folder's filenames, matched on whatever column Notion used as the page title — not something either the CSV or the per-row files record explicitly as a relationship.

## `notion-to-md`: skip the id problem by never writing it

Notion also publishes an official API, and reading pages through it rather than through the export button sidesteps the filename problem entirely — nothing about the API forces an id into a name, because you are the one calling `writeFileSync` at the end. [`notion-to-md`](https://github.com/souvikinator/notion-to-md) is the commonly used open-source package for this: Node, open source, reads a page's block tree via the API and converts it to Markdown, MDX, or a handful of other targets. You choose the output filename, so there is nothing to rewrite afterward.

| Pros | Cons |
| --- | --- |
| No id suffix in the output, ever — you name every file | Needs an integration token and API access, which is a setup step the export button does not require |
| Fits naturally into a build script or a scheduled sync | One page at a time by id or database query; walking a whole workspace is your own recursion to write |
| Runs in CI without a browser or a manual export click | Renders blocks you must map yourself for anything beyond the common set — a database view, a synced block — same losses as the export |

**Price:** free, open source — the licence is worth checking yourself before you depend on it, because the published package's metadata and the repository's own `LICENSE` file do not currently agree (checked on npmjs.com and github.com, 14 September 2026).

**Technical details:** the package requests a page's children as blocks from the Notion API and converts the block tree to Markdown, with hooks for handling block types it does not cover by default. It needs an integration created in Notion's own settings and that integration shared onto the pages or databases being read — a permission step, not a code step, and the one place this route is slower to start than clicking Export.

The API itself is rate-limited to an average of three requests per second per integration, with the workspace's own shared limit on top of that (checked on developers.notion.com, 14 September 2026); a request over the limit gets back a 429 with a `Retry-After` header rather than the data, so a script walking more than a few dozen pages needs the wait-and-retry loop built in from the start, not added after the first failure. For a single page or a small database this never matters; for a whole workspace it is the difference between a script that finishes and one that appears to hang.

**Who is this for?** A static site that pulls its content from Notion on every build, a scheduled job that mirrors a workspace into a git repository, or anything where "export by hand periodically" is the wrong shape for how the content actually changes.

## What happens to images, files and attachments

Every route handles media differently, and it is worth checking before trusting any of them with a page that has more pictures than text.

The Markdown & CSV export writes each page's images into a folder alongside its `.md` file, under generated names, reached from the Markdown by relative, percent-encoded paths — which hold only for as long as the image folder travels with the file it belongs to (the same fragility [relative paths always carry](/blog/images-and-links-that-still-work)). Move the `.md` file on its own and every image reference breaks with no warning, because nothing checks that the folder came along.

`notion-to-md` returns image blocks as ordinary Markdown image syntax pointing at Notion's own temporary file URLs, which expire — the package does not download the file for you, so a script using this route needs its own step to fetch each image URL before it goes stale and rewrite the Markdown to point at a local copy.

A merge-and-upload route used to see only what the zip's text said, which left a broken relative path exactly as broken. It now reads the images out of the archive as well and carries them into the document itself, so there is no path left to break: the picture travels inside the Markdown, inside the HTML export, and inside anything shared from it. The ceiling is two megabytes of pictures per document and one per picture — a saved document has to fit in four — and a picture past it keeps the link it had, which is no worse than before.

## Upload the export zip directly, merged into one document

The export's own id problem disappears a third way if the destination was never a folder of separate files: [TransformPipe's Notion → Markdown conversion](/notion-to-markdown) takes the "Export as Markdown & CSV" zip unmodified, merges every page into one document in its original order with a generated table of contents, and turns a cross-page link into the words it displayed rather than a filename that will not resolve once the pages are sections of the same document. A database comes back as a table, in the same document.

| Pros | Cons |
| --- | --- |
| No rename, no id map, no script | Produces one document — not the right shape if pages need to stay separate files with their own URLs |
| Every page in order, with a table of contents built for you | Cross-page links keep their text, not their address — there is nowhere left for them to point once merged |
| Runs in the browser; the zip is not uploaded anywhere when signed out | Non-default database views and comments are still absent, because the export never had them |

**Price:** free, runs locally in the browser.

**Who is this for?** Anybody whose actual goal was one readable document — a wiki export turned into a single handoff file, a workspace archived as one thing to read later — rather than a folder of pages that each need their own address.

## Where all three routes fail the same way

**Comments.** A comment thread is attached to a page, not written into its content, so none of the three routes above see it. If a decision only exists as a reply in a comment thread, copy it into the body of the page before exporting anything — afterward, it is gone, not merely unconverted.

**Non-default database views.** Notion exports the view you have open, not every view a database has. A database filtered three different ways for three different audiences exports as one of those three, and the other two are not recoverable from the export at all — they have to be rebuilt from the underlying rows.

**Synced blocks.** A synced block shows the same content in several places at once inside Notion. The export has no concept of "the same block, shown twice" — each place it appeared gets its own copy of the content, so editing one after the migration no longer updates the other, and nothing in the file marks that they were ever linked.

## How to choose

1. **Decide the shape of the destination first.** Separate files with their own URLs wants the rewrite route or `notion-to-md`. One document wants the merge route. Choosing after converting means redoing the work.
2. **Ask how often this happens.** Once, and the manual export-and-rewrite is finished before an API integration would be approved. Weekly or on every deploy, and `notion-to-md` in a build step pays for itself within a month.
3. **Check for comments and non-default views before exporting, not after.** Both are invisible in the output with no error to flag them, so the only reliable check is looking at the source in Notion first.
4. **Count the pages.** Ten pages tolerate a by-hand id rewrite. A hundred want a script. A thousand want the API route, because clicking Export and waiting up to thirty hours does not scale either.

If the question is which tool rather than which route — all of these are free, and what separates them is setup cost rather than price — [the free Notion converters compared](/blog/free-notion-to-markdown-converter) is the shorter answer.

## Conclusion

The Notion export is honest Markdown wearing an id it cannot take off on its own. Rewriting that id from a map solves it for a folder of files that need to stay files; reading the workspace through the API and naming your own output solves it for anything scripted; and merging the export into one document solves it a third way, by removing the need for the id to resolve to anything at all. What none of the three routes recover is what the export never had — a comment thread, a database view you were not looking at, or a synced block's identity — so the one check worth doing before exporting anything is confirming those do not matter for what you are about to lose. [Read more](/blog/markdown-from-notion-obsidian-and-confluence) on how Confluence and Obsidian compare on the same problem.

## FAQ

### Can Notion export directly to clean Markdown, without the id in the filename?

Not through the export button — Markdown & CSV always appends the id, because the title alone is not a reliable filename. The `notion-to-md` route, reading pages through the API, is the way to get filenames of your own choosing, since you write them yourself rather than accepting what an export produces.

### Why do my exported links point at filenames with long codes in them?

Because Notion identifies pages by id, the title is just a label, and the export writes the id into the filename to keep names unique. The link and the filename use the same id, which is what makes a rewrite possible: build a map from id to your preferred name, then rewrite both together.

### Does the export include database views other than the one I had open?

No. Only the current or default view is exported, and Notion's own export dialog does not offer "every view" as an option. A form view specifically cannot be exported at all — export the table view of the same database instead.

### Are Notion comments included in an export?

No, in any of the formats Notion offers. A comment is attached to a page as discussion, not stored as page content, so it never reaches PDF, HTML, or Markdown & CSV. Copy anything decision-relevant into the page body before exporting.

### What happens to a synced block when I export it?

It exports as ordinary content in every place it was shown, with no indication that the copies were ever the same block. Editing one copy after the migration will not update the others, because the synced relationship existed only inside Notion.

### Can I convert a Notion export without uploading my workspace anywhere?

Yes, if the converter runs in the browser rather than on a server — worth confirming for a workspace that holds anything sensitive, by opening the network panel and checking that nothing leaves while converting.

### How long does a Notion export take?

Small exports finish immediately as a direct download. A large one is emailed as a link instead of downloading right away, that link expires after seven days, and Notion's own documentation allows for processing to take up to thirty hours — plan the export well before the deadline that depends on it, not the same afternoon.

### Is there a rate limit if I read a workspace through the API instead of exporting it?

Yes: an average of three requests per second per integration, plus a separate limit shared across the whole workspace. A script reading more than a handful of pages should handle a `429` response by waiting for the duration in its `Retry-After` header and retrying, rather than treating the error as a failure.
