---
title: "What Pandoc is, and when you do not need it"
description: "Pandoc is one program with fifty readers and sixty-six writers and a document model between them. What that buys you, and the jobs it is too much for."
date: 2026-09-22
tag: Converting
keywords: what is pandoc, pandoc, pandoc online, pandoc app, how to use pandoc, pandoc install, pandoc alternative
---

Almost everything written about Pandoc starts from a command somebody wants to run. This starts a step earlier, because the command only makes sense once you know what the program is: a single binary that reads fifty formats, writes sixty-six, and never converts one to the other directly.

### TL;DR

Pandoc is a command-line program and a Haskell library that reads a document into one internal representation and writes that representation out again in another format. It is free software under the GPL, written by John MacFarlane and released since 2006. There is no app, no account, and no official online service — a demo at `pandoc.org/try` and nothing else. You want it when the job is a format matrix, citations, Word styled to somebody's template, or the same conversion a thousand times. You do not want it when the job is one file, once, on a machine you are not allowed to install software on — or when the document is a tab you are looking at rather than a file you have.

## One program, two lists, and a document in the middle

The design is a single idea and everything else follows from it. Pandoc does not convert Markdown to HTML. It **reads** Markdown into an abstract syntax tree — a document of headings, paragraphs, lists, tables, links, footnotes — and then **writes** that tree as HTML. The reading half and the writing half know nothing about each other.

That is why the format list is so long without anybody having written a thousand converters. Fifty readers and sixty-six writers is not 116 pieces of work; it is 116 pieces of work that produce 3,300 conversions. Nobody wrote a Jupyter-notebook-to-Jira-wiki converter. It comes out of the crossing.

It also explains the two properties that surprise people:

**A format is a reader or a writer, and not automatically both.** LaTeX, DocBook and Word are both. Beamer, ICML and reveal.js are writers only. RIS and EndNote XML are readers only. Asking for a conversion nobody has a reader for is an error rather than a poor result, and that is the honest behaviour.

**Anything Pandoc cannot represent is gone at the reading step, not the writing one.** If a Word file's comments do not enter the tree, no output format can print them. This is why "Pandoc lost my X" is nearly always a question about the reader.

## The list changes, and the thing you remember is out of date

On 1 December 2025, version 3.8.3 added `pptx` and `xlsx` as **input** formats. For nineteen years before that, a PowerPoint deck was something Pandoc could write and not read, and the internet's advice — including, until this morning, four articles on this site — still says so.

So the useful habit is not memorising the matrix. It is asking the program:

```bash
pandoc --list-input-formats
pandoc --list-output-formats
pandoc --version
```

Three commands, and the answer is true for the version you actually have. The same lists are in the dropdowns at `pandoc.org/try`, which is the quickest way to check without installing anything — `pptx` and `xlsx` are both in the "from" list there now (checked 22 September 2026).

A caveat that matters if you take that deck conversion up on its offer: the PowerPoint reader opens the slides, their tables, their pictures and their SmartArt, and it does not open the notes part at all. [What happens to a deck and its speaker notes](/blog/convert-powerpoint-to-markdown) is the longer version, and both new readers describe themselves as alpha in their own source.

## There is no Pandoc app, and no Pandoc online

People search for both, so the answer should be plain: Pandoc is a command-line program. There is no official graphical application, and there is no official hosted service.

What exists at `pandoc.org/try` is a demo — a text box, two dropdowns and a Convert button, for trying a conversion on a snippet. It is not a file converter and is not meant as one.

Anything else that calls itself "Pandoc online" is somebody's server with Pandoc installed on it. That is a legitimate thing to build, and we build something adjacent ourselves, but it changes the question completely: your document is now a file on a machine you do not control, with a retention policy you have not read. [How to check where a converter actually sends your file](/blog/is-an-online-converter-safe) applies to all of them.

## The four commands that cover most of it

```bash
# Markdown to a real HTML page, everything inside the one file
pandoc notes.md -o notes.html --standalone --embed-resources

# A Word file to Markdown, with its pictures written out beside it
pandoc report.docx -t gfm -o report.md --extract-media=media

# Markdown to Word, in somebody else's house style
pandoc paper.md -o paper.docx --reference-doc=template.docx

# Markdown with citations to a PDF
pandoc paper.md --citeproc --bibliography=refs.bib -o paper.pdf
```

Two footnotes on those. `--self-contained` is what the second flag on the first line used to be called; it is now a deprecated synonym for `--embed-resources --standalone`, so an answer from four years ago will still work and will warn at you.

And the last line hides an install. **Markdown to PDF is not one of Pandoc's writers.** It produces the PDF by handing the document to a separate engine, and the default is a TeX engine — usually a much larger download than Pandoc itself, and the single most common reason somebody concludes Pandoc is more than they wanted. `--pdf-engine` can point at `weasyprint`, `wkhtmltopdf`, `typst`, `prince`, `pagedjs-cli` or `context` instead, several of which are far lighter. [The routes from Markdown to PDF](/blog/markdown-to-pdf) compares them.

## When nothing else will do

- **A format matrix.** One source, several outputs, kept in step: HTML for the site, DOCX for the reviewer, EPUB for the reader on a train. Everything lighter does one output well.
- **Citations.** `--citeproc` with BibTeX, BibLaTeX or CSL JSON, and hundreds of CSL styles. Nothing else in this class has a citation processor at all.
- **A house style for Word.** `--reference-doc` takes fonts, heading styles and spacing from an existing `.docx`. If a template arrived from a legal or marketing team, that flag is the whole reason to install it.
- **Filters.** A Lua or JSON filter rewrites the document while it is still a tree — renumber every table, promote every heading, rewrite every internal link. The regular-expression version of that works until the day it does not.
- **Volume.** It is a binary that reads standard input and writes standard output. A thousand files is a `for` loop.

## When it is more than the job needs

- **One file, once.** Converting a single document to HTML means `--standalone`, then a stylesheet, then possibly a template written in Pandoc's own template language. That is a real amount of setup, and it does not shrink for a small job. [The lighter alternatives](/blog/pandoc-alternatives-for-markdown-to-html) are sorted by which part of it you are trying to avoid.
- **A machine you cannot install on.** A locked-down laptop, a phone, somebody else's desk.
- **A document that is not a file.** A wiki page, a ticket, a thread — anything that exists only rendered in a browser has to be saved before Pandoc can see it, and saving it is the hard half.
- **A conversion where you need to see the result before you trust it.** Pandoc is a pipeline tool: it is excellent once you know what you want and expensive while you are still finding out.

## Where this site sits

TransformPipe converts in the browser: fifteen formats in, Markdown and a self-contained HTML file out, with the file never leaving the machine. That covers the middle of this article's last list — one document, no install, a result you can see — and none of the first. There is no citation processor here, no template language, no format matrix, and no PDF in either direction.

The honest summary is that they are different tools for different halves of the same problem, and the border is easy to state: if the conversion is going to happen again next week, script it with Pandoc. If it is going to happen once, in the next two minutes, you should not have to install anything to do it.
