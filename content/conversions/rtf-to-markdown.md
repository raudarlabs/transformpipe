## What comes across

The converter reads an `.rtf` the way a word processor replays it, keeping the formatting Markdown has a form for and skipping the font table, colour table and stylesheet.

| In the file | In the Markdown |
| --- | --- |
| Bold, italic, strikethrough | `**bold**`, `*italic*`, `~~struck~~` |
| A paragraph with an outline level (Word) | A heading at that level, `#` to `######` |
| A bold line set larger than the body (TextEdit, Pages) | A heading, the largest size as `#` |
| Bulleted and numbered lists | `-` and `1.` lists, indented by level |
| Hyperlinks | `[text](https://…)` |
| Tables | Markdown tables, with the first row as the header row |
| A line break inside a paragraph (Word) | A hard break, a backslash at the end of the line |

Where there is no outline level, as on a Mac, a paragraph that is bold from end to end and bigger than the body text is read as a heading, ranked by size. The body size is whatever most of the text is set in. A bold line at body size stays a bold paragraph, and a heading loses its bold: `# Title`, not `# **Title**`.

Characters are decoded in the codepage the file names, Windows-1252 when it names none, and Unicode escapes are read too, so "café" and Cyrillic text arrive intact. Chinese and Japanese text comes through only where the file writes it as Unicode escapes. Link text is another exception: accented and non-Latin letters in it are lost, sometimes leaving a question mark. An asterisk or underscore in the text is escaped, so it stays a character. If the document does not open with a heading, the file name is added as one.

## What is left behind

- **Pictures.** They are skipped, and a Mac `.rtfd`, which TextEdit saves when a document has pictures, is not accepted.
- **Fonts, colours, sizes and alignment.** Type size is used only to find headings.
- **Underline, superscript and subscript.** The words stay, the formatting goes: a superscript 2 after x arrives as `x2`.
- **Headers, footers and document properties.** The title and author in the file's properties are not read. A separate first-page header or footer is the exception: its words come through as ordinary text.
- **Comments.** Skipped, though hidden text comes through as ordinary text.
- **Footnote markers.** The marker goes, and the note's text is run into the paragraph it belonged to.
- **Tabs**, which become single spaces.

## An example

A checklist saved from TextEdit, with a larger bold title, an italic word, a numbered list, a link and a struck-out time:

```rtf
{\rtf1\ansi\ansicpg1252\cocoartf2761
{\fonttbl\f0\fswiss\fcharset0 Helvetica-Bold;\f1\fswiss\fcharset0 Helvetica;\f2\fswiss\fcharset0 Helvetica-Oblique;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\pardirnatural\partightenfactor0

\f0\b\fs36 \cf0 Caf\'e9 opening checklist\
\f1\b0\fs24 Before the doors open on 
\f2\i Monday
\f1\i0 :\
\pard\tx220\tx720\li720\fi-720\pardirnatural\partightenfactor0
\ls1\ilvl0\cf0 {\listtext	1.	}Count the 
\f0\b float
\f1\b0 \
{\listtext	2.	}Check the {\field{\*\fldinst{HYPERLINK "https://example.com/rota"}}{\fldrslt rota}}\
\pard\tx566\pardirnatural\partightenfactor0
\cf0 Old opening time: \strike \strikec0 7:30\strike0\striked0  8:00\
}
```

It becomes:

```markdown
# Café opening checklist

Before the doors open on *Monday*:

1. Count the **float**
1. Check the [rota](https://example.com/rota)

Old opening time: ~~7:30~~ 8:00
```

Numbered items are all written `1.`; Markdown counts them when the list is shown.

## Limits

- **10 MB per upload.** Several files dropped at once are chained into one document, and the limit applies to their total.
- **It runs in your browser.** The file is not uploaded. The Markdown reaches an account only if you sign in and press Save.
- **It has to be RTF.** A file that does not start with `{\rtf` is refused, even when named `.rtf`.

## Questions

### What is an RTF file?

Rich Text Format: a text file with its formatting written as control words between the words themselves. Almost every word processor reads and writes it.

### How do I open an RTF file?

TextEdit on a Mac, Word, LibreOffice and most other word processors open one directly; [How to open an .rtf file](/how-to/open-rtf) goes through them. Without a word processor, convert it here and read it in the browser.

### Will my headings come out as headings?

From Word, yes, when they use Word's heading styles, which carry an outline level. From TextEdit or Pages, only when the heading line is bold all the way through and larger than the body text.

### Does it keep pictures?

No, and `.rtfd` packages are not accepted. To keep pictures, save the document as `.docx` or `.odt` and convert that instead.

### Can I turn an RTF file into Word or PDF?

Yes, by way of Markdown: once it is converted, the menu beside the download button offers Word and a printable page to save as PDF. Both carry only what the Markdown holds: the original's fonts and colours do not come back.
