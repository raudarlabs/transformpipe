---
title: MarkItDown alternatives, sorted by why you are looking
description: MarkItDown is a Python library aimed at LLM pipelines, and its own README says so. Here is what to use when that is not the shape of your problem.
date: 2026-09-22
tag: Converting
keywords: markitdown alternative, markitdown vs docling, markitdown without python, convert documents to markdown for llm, microsoft markitdown, markitdown pdf
---

Nobody searches for a MarkItDown alternative because MarkItDown is bad. They search because the file is open in a browser tab on a machine with no Python on it, or because the PDF came out as a column of run-together words, or because the Markdown was for a person to read and it does not read like something a person would write. The tool is fine. It was built for one shape of problem, and the shape is stated plainly in its own documentation — which is more than most projects do.

### TL;DR

MarkItDown is a Python utility that converts files to Markdown **for text analysis pipelines**, and its README says the output "may not be the best option for high-fidelity document conversions for human consumption". If your pipeline is Python, your files are on disk beside it, and the Markdown is going into a model, it is the right default and nothing here beats it. Look elsewhere when there is no Python where the document is, when the input is a scanned PDF, when the Markdown has to go back out as something else, or when the document must not leave the machine at all. The last of those is worth checking rather than assuming: some of its best options are billable cloud calls.

## What MarkItDown actually is

A thin, well-chosen wrapper. The interesting document is not the README but `pyproject.toml`, because the optional dependencies are the honest spec sheet (checked on github.com/microsoft/markitdown, 22 September 2026):

| Format | What reads it |
| --- | --- |
| `.docx` | `mammoth` |
| `.pptx` | `python-pptx` |
| `.xlsx` / `.xls` | `pandas` with `openpyxl` or `xlrd` |
| `.pdf` | `pdfminer.six` and `pdfplumber` |
| Audio | `pydub` with `SpeechRecognition` |
| YouTube | `youtube-transcript-api` |
| HTML | `beautifulsoup4` and `markdownify` |

Python 3.10 to 3.14, `pip install 'markitdown[all]'`, or one extra at a time — `pip install 'markitdown[pdf, docx, pptx]'` — which is the sensible install once you know which three you need.

Knowing the list tells you where the ceiling is before you hit it. The Word reader is Mammoth, so MarkItDown inherits [what Mammoth does and does not carry across](/blog/mammoth-js-and-docx-parsers) exactly. The PDF readers are text extractors: they pull the text objects a PDF declares. They do not model the page, so a two-column scan comes out interleaved and a scanned page comes out empty, because there is no text in it to extract at all. OCR exists, through a plugin that sends the page to a vision model you supply a key for, or through Azure Document Intelligence — both of which are network calls.

And there is the scope note, which decides most of this article:

> We cannot accept additional applications, services, or servers. This includes: web servers, REST or HTTP APIs, and hosted conversion services; web frontends and browser-based user interfaces; desktop and mobile applications.

That is not a gap. It is a deliberate boundary, stated in the contributing guide, and it means the project will never grow the thing half the people looking for an alternative actually want.

## The four reasons people look

### 1. There is no Python where the document is

This is the common one and it is not a technical objection. The document is a Confluence page, a ticket, a Google Doc, a thread — or it is a `.docx` on a laptop belonging to somebody who does not have a terminal and is not going to get one. A pipeline that starts with `pip install` has already failed for that person.

What works instead is a converter that runs where the document already is: a browser tab, an extension in the toolbar, a phone. The conversion itself is not the hard part — `mammoth` has a JavaScript build, `turndown` was always JavaScript — so browser-side conversion of Word, HTML, spreadsheets and decks is ordinary now, and nothing is uploaded when it happens in the page.

### 2. The input is a PDF and the PDF is a picture

`pdfminer.six` and `pdfplumber` are good at what they do, which is reading the text a PDF file states. A scanned contract states no text. A two-column academic paper states its text in an order that matches the drawing, not the reading.

If PDF is the real input, the tool built for it is **Docling**, from IBM Research and now in the LF AI & Data Foundation: page layout, reading order, table structure, formulas, OCR for scans, and a document model underneath rather than a text buffer. It is much heavier — model weights download on first run — and that weight is the feature. [The ten-converter comparison](/blog/ten-markdown-converters-compared) puts both in the same table if you want the rest of the field beside them.

### 3. The Markdown has to go back out

MarkItDown converts *to* Markdown. That is the whole design, and the README says "the only target" is true of it in a way it is not true of Pandoc.

The moment the job is "we have the Markdown and now it needs to be a Word file the legal team can redline", you are looking at a different tool. [Pandoc](/blog/pandoc-alternatives-for-markdown-to-html) is the reference answer for that direction and for the format matrix in general — one source, several outputs, kept in step.

### 4. The document must not leave the machine

Read this one carefully, because "runs locally" and "no network" are not the same sentence.

MarkItDown's built-in converters are local. Its best results on hard inputs are not: Azure Document Intelligence and Azure Content Understanding are cloud services and each call is billable, and image descriptions work by sending the image to an LLM through a client you construct yourself. All three are opt-in and none is a surprise — the documentation is clear — but a compliance answer that says "it runs locally" while the pipeline passes a flag that uploads the page is the kind of thing that only gets discovered in an audit. [How to check where a converter sends your file](/blog/is-an-online-converter-safe) is a question worth asking of every tool on this page, including ours.

## What nothing here replaces

Being fair to it is also the useful part, because it tells you when to stop reading.

- **YouTube transcripts and audio.** Nothing else in this article turns a video URL or a `.wav` into text. If that is on the list, MarkItDown is on the list.
- **Outlook `.msg` files.** A genuinely awkward format, handled.
- **ZIP archives, iterated.** It walks the contents and converts each one.
- **The plugin system.** A format you need and nobody supports is a package you publish, not a fork you maintain.
- **An MCP server.** `markitdown-mcp` puts the whole thing in front of an assistant, which is [the cheapest way to get a document into a conversation](/blog/what-a-document-costs-an-assistant) when the file is already on the machine the assistant can reach.

## Where this site sits

TransformPipe is the browser-side answer to reason one. Fifteen conversions — Word, PowerPoint, EPUB, spreadsheets, HTML, CSV, JSON, Notion, Confluence, Obsidian and Evernote exports among them — run in the page, with nothing uploaded, and the same converters are behind an API, a CLI, a browser extension for the page you are reading and an MCP server for an assistant.

The honest limits, in the same spirit as the scope note above: **there is no PDF here at all**, in either direction, and there will not be — reading a PDF acceptably means layout models and OCR, which means a server, which would remove the one property that makes a browser converter worth having. No audio, no video, no YouTube. And the output is Markdown and HTML rather than a format matrix; a `.docx` comes back out, but Pandoc's range does not.

If the answer to "where does this run" is "in a Python process next to the files", install MarkItDown. If it is "in the tab I am looking at", none of these are for you, and that is the whole reason the list exists.
