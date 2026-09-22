---
title: "Where the Pictures Go When You Export a Document"
description: Every export puts its images somewhere, and most conversions leave them there — where each format keeps them, the three ways out, and the arithmetic of embedding
date: 2026-09-21
tag: Converting
keywords: markdown export images missing, convert document keep images, notion export images, docx images markdown, base64 image markdown, export document with pictures
---

The export worked. The headings are right, the lists are right, the tables came through, and every picture is a grey rectangle with a torn corner. This is the single most common way a document conversion disappoints somebody, and it almost never means the converter failed to find the pictures. It found them, decided they were somebody else's problem, and wrote a reference to a file it knew you did not have.

### TL;DR

A picture in any document format is a separate file inside the container, and the document refers to it by path. Markdown is one text file, so there are exactly three places a picture can end up: a folder beside the Markdown, a URL somewhere on the internet, or inside the Markdown itself as a `data:` URI. Most converters pick a fourth option by accident — a path to the folder that would have existed if they had written the files out — and that is the grey rectangle. Embedding is the only one of the three that survives being emailed, and it costs about a third more bytes than the file on disk, because base64 encodes three bytes as four characters.

The practical rule: after any conversion, search the output for `src="` and `](`, and look at what the paths actually say. That takes ten seconds and tells you which of the four you got.

## Where each format keeps its pictures

| Source | Where the bytes are | How the document refers to them |
| --- | --- | --- |
| `.docx` | `word/media/image1.png` inside the zip | A relationship id, resolved through `word/_rels/document.xml.rels` |
| `.pptx` | `ppt/media/image1.png` | The same relationship mechanism, per slide |
| `.odt` | `Pictures/10000201000...png` | `xlink:href` on a `<draw:image>` |
| `.epub` | Wherever the manifest says, usually `OEBPS/images/` | A relative path from the chapter's XHTML |
| Notion export | A folder named after the page, with the page's 32-character id | A URL-encoded relative path, `%20` for every space |
| Confluence HTML export | `attachments/<page id>/<file>` | A relative `src` from the page's HTML |
| Obsidian vault | Wherever you put them, often `assets/` | `![[image.png]]`, resolved against the whole vault |
| Evernote `.enex` | Base64 inside the note's XML | `<en-media hash="…">`, the MD5 of the decoded bytes |
| Google Docs | Not in the `.docx` export until you make one | Downloaded into the zip when you export as HTML |

Two of those rows deserve a second look, because they are where conversions go wrong in ways that are hard to diagnose.

**Notion** writes paths that are URL-encoded. A page called `Q3 Plan` becomes a folder called `Q3 Plan 1f2a…` and the Markdown refers to `Q3%20Plan%201f2a…/chart.png`. A converter that does not decode the path looks for a directory with a literal `%20` in its name, finds nothing, and emits the reference unchanged. [Converting a Notion export](/blog/convert-notion-export-to-markdown) goes through the rest of what those ids do.

**Evernote** does not store a filename at all. A picture is addressed by the MD5 hash of its own bytes, and the resource carrying those bytes appears elsewhere in the same file, base64-encoded. Matching them up means computing MD5 over every decoded resource — which is why a conversion either does this properly or drops every picture in the note, with nothing in between.

## The three places a picture can go

| Destination | Survives email | Survives the folder moving | Survives the source going away | Cost |
| --- | --- | --- | --- | --- |
| A folder beside the Markdown | No — one file arrives, the other does not | No | Yes | None |
| A public URL | Yes | Yes | No — link rot, and whoever hosts it can see who looks | None to you |
| A `data:` URI in the file | Yes | Yes | Yes | About 4 bytes of text per 3 bytes of picture |

The folder is the default of nearly every command-line tool, and it is the right answer when the Markdown is going into a repository — the folder travels with it, git tracks both, and nobody emails anything. Pandoc's `--extract-media` does this well and rewrites the references to match, which is the part that separates it from the converters that only do half.

The public URL is what happens when a hosted converter says it kept your images. It did, on its server, and the reference in your Markdown now points there. That is a working document and a standing dependency: the pictures stay up as long as that account does, and every reader who opens the file makes a request that the host can log. Worth knowing before you send the document to a client.

The `data:` URI is the only option that produces one self-contained file, and it is the right default for a document that is going to be read by somebody who is not you. [Self-contained HTML](/blog/self-contained-html-explained) makes the same argument for the rendered version.

## The arithmetic of embedding

Base64 turns every three bytes into four characters, so an embedded picture is about 33 percent larger than the file it came from, plus a short prefix naming the type. A 750 KB screenshot becomes roughly a megabyte of text. That number is the whole reason converters hesitate to embed, and it is worth being concrete about what it buys and costs:

- A ten-page report with six screenshots: perhaps 2 MB of text. Opens instantly, emails fine, never breaks.
- A conference deck with forty photographs: 30 MB of text. An editor will open it slowly and a diff of it is useless.
- A scanned document: every page is a picture, and the file is the scan plus a third, with no text in it at all.

The sensible design is a budget rather than a switch. Embed until some ceiling, and beyond that leave the references alone so the failure is visible instead of producing a file nothing can open. Here, that ceiling is two megabytes of pictures per document and one megabyte for any single picture — one megabyte encoded is about 750 KB on disk, which is a generous screenshot and a small photograph. The per-picture cap exists for a specific failure: without it, one photograph straight off a phone spends the entire allowance and the twelve screenshots after it, the ones carrying the argument, are all dropped.

## Six ways pictures go missing that are not the converter's fault

**The picture is a link, not a file.** A document that references an image on an intranet, a Google Drive URL, or a Slack CDN link has no bytes in it to extract. The conversion faithfully carries a reference that only resolves from inside your network or your session.

**The picture is a metafile.** A chart pasted from Excel or a diagram pasted from Visio is frequently stored as EMF or WMF, a Windows vector format that no browser renders. The bytes are there, the reference is correct, and the reader sees nothing. Re-paste it as a picture in the source document before converting; nothing downstream can fix it.

**The picture is a drawing, not a picture.** Word shapes, PowerPoint SmartArt, and anything built from the drawing tools are XML instructions for rendering, not an image file. There is nothing in `media/` to extract because the document never contained one.

**Two pictures have the same name.** Merging a folder of documents into one Markdown file collapses `image1.png` from nine sources onto one path. The result shows the same picture nine times, and it looks like a conversion bug rather than a naming collision.

**The alt text was never written.** Alt text is the one thing about a picture that Markdown can carry perfectly, and in most documents it is empty, because the authoring tool did not ask. When a picture is dropped for any of the reasons above, good alt text is the difference between a sentence that still makes sense and a hole.

**The picture is the text.** A screenshot of a table is a picture of a table. This is the failure with no technical fix at all, and the only useful moment to catch it is before the conversion, in the source.

## What a conversion should do, and what to check

A conversion that handles pictures properly does four things, and you can verify each one in under a minute:

1. **Resolves the reference through the format's own mechanism** — relationship ids for OOXML, the manifest for EPUB, MD5 for Evernote — rather than guessing from a filename.
2. **Decodes the path** before looking for the file, so `%20` and `+` do not become part of a directory name.
3. **States what it did with the bytes.** Embedded, written beside the file, or left where they were: all three are defensible, and silence is not.
4. **Keeps the alt text**, including when it drops the picture.

And on the output side:

- Search for `](` and read the paths. Anything relative is a promise about a folder.
- Search for `data:image` and count. That tells you how many were embedded.
- Look at the file size. A Markdown document with embedded pictures is measured in megabytes; one without is measured in kilobytes, no matter how many pictures the original had.
- Open it somewhere else. The author's machine is the one place every path resolves, which is exactly why the author is the last person who will notice.

## Where this leaves you

For a document going into a repository, a folder beside the file is right, and the only requirement is that the converter rewrites the references to match where it actually wrote them. For a document going to a person, embedding is the only answer that survives the trip, and the cost is a third more bytes and a ceiling you should know about rather than discover. For everything in between, the check is the same three searches, and it is worth doing once on a document you care about before trusting a tool on fifty.

Every conversion here — [Word](/word-to-markdown), [PowerPoint](/powerpoint-to-markdown), [Notion, Confluence and Obsidian exports](/notion-to-markdown) among them — embeds the pictures it finds, in the browser, so nothing is uploaded to be hosted and nothing depends on a folder that did not travel. For the neighbouring problem of links that resolve only from your own desk, [images and links that still work](/blog/images-and-links-that-still-work) covers the paths themselves.
