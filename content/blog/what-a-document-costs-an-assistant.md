---
title: "What a Document Costs an Assistant, and How Not to Spend It"
description: A token is about 3.5 characters, so a document either enters the context window or it does not — the arithmetic of converting outside a conversation
date: 2026-09-22
tag: Automation
keywords: save tokens ai, document tokens context window, convert document without ai, reduce token usage claude, markdown tokens, cheaper ai document workflow
---

There is a habit worth examining. You have a `.docx`, you want to see it as Markdown, and the assistant is right there — so you attach the file and ask. It works, and it costs you the whole document twice: once going in, once coming back out. Nothing about that conversion needed a language model. Reading OOXML and writing Markdown is parsing, and parsing has been a solved problem since before any of this.

### TL;DR

For Claude, a token is approximately 3.5 English characters (checked on platform.claude.com, 22 September 2026). That single number makes the whole question arithmetic rather than opinion. A 2,500-word article is about 15,000 characters, so roughly 4,300 tokens; asking an assistant to convert it spends that going in and again coming back, call it 8,500 for a job that a parser does for nothing. A document with one embedded picture is worse by two orders of magnitude: a megabyte of base64 is about 300,000 tokens, which does not fit in most context windows at all. A link to the same document is eleven.

The honest version of the claim: converting a document outside the conversation does not make a model cheaper by some percentage. It removes the document from the context window entirely, and what that is worth depends on how much of your conversation is document text. The formula is below so you can compute your own number instead of believing mine.

## The one number everything follows from

Anthropic's own glossary puts it plainly: "For Claude, a token approximately represents 3.5 English characters, though the exact number can vary depending on the language used" (checked on platform.claude.com, 22 September 2026). Divide a character count by 3.5 and you have a usable estimate. Multiply by two if the text is not English — most tokenisers were fitted to English and spend more tokens per character on everything else, which means this whole calculation gets worse, not better, for a German or Italian document.

Here are real files, measured rather than guessed:

| Document | Words | Characters | Tokens, about |
| --- | --- | --- | --- |
| One long blog article | 2,513 | 14,921 | 4,300 |
| A substantial project README | 4,654 | 30,138 | 8,600 |
| One megabyte of base64 picture | — | 1,048,576 | 300,000 |
| A link to a shared document | 5 | 40 | 11 |

The last two rows are the interesting ones, and they are not a rhetorical trick. A picture carried inside a Markdown file as a `data:` URI is text, and text is tokenised. If you paste such a document into a conversation, the model reads every character of that encoding. [Where the pictures go when you export a document](/blog/pictures-in-a-document-export) explains why the encoding is a third larger than the file on disk; here the consequence is that a single screenshot can cost more tokens than the entire rest of a long report.

## Three habits and what each one spends

### Asking the assistant to convert the file

The model reads the document and writes it back out. Both halves are billed, and on every major API the output half is priced above the input half, because generating is more work than reading. For the article above that is roughly 4,300 in and 4,300 out.

What you get for it: a conversion made by something that is guessing. A model reading a `.docx` does not resolve the relationship ids to find the pictures, does not read `<w:numPr>` to work out which list a paragraph belongs to, and cannot see the bytes in `word/media/` at all. It produces plausible Markdown, which is a different thing from correct Markdown, and the errors are the quiet kind — a heading level that drifted, a table whose merged cell became an extra column.

What a parser gets for nothing: the actual answer, deterministically, the same way twice.

### Pasting a document in so you can look at it

This is the one the arithmetic really punishes, and it is extremely common. You want to check a document mid-process — did the conversion keep the tables, does the front matter look right, is section four still there. So you ask the assistant to show you, and it prints the document back. That is the full length of the document in output tokens, spent on an act of reading that a browser performs for free.

A rendered preview costs nothing. A shared link costs eleven tokens and can be opened by somebody who is not in the conversation at all. [Sharing a Markdown document as a link](/blog/share-a-markdown-document-as-a-link) is the mechanism; the point here is only that "show me the document" is the single most expensive way to look at a document.

### Keeping the document in the conversation while you work on something else

Context is not spent once. Every subsequent turn in a conversation re-sends the whole history, so a document pasted at the top is paid for again on every message after it — which is what turns a one-off 8,600 tokens into a standing cost for the rest of the session. Caching changes the price of that repetition on some APIs, not the fact of it.

Holding the document by reference instead — saved somewhere, addressed by a link — means the conversation carries eleven tokens where it was carrying thousands. This is most of the argument for [converting documents through a connector](/blog/converting-documents-from-an-assistant) rather than in the chat window: the tool call returns an address, and the document itself never enters the transcript.

## The formula, so you can stop taking anybody's word for it

Let **D** be the characters of document text in a conversation, and **C** the characters of everything else — your questions, the model's reasoning, the code, the discussion. Then the share of tokens that document text is responsible for is:

```text
document share = D / (D + C)
```

And the saving from converting outside the conversation is that share, less whatever you still need the model to actually read.

Three honest worked examples:

- **You attach a 30,000-character specification and ask three short questions about it.** D is 30,000, C is maybe 3,000. Document text is 91 percent of the conversation — but you needed the model to read the specification, so the saving is zero. Converting it elsewhere first saves nothing at all.
- **You convert six documents in a session, look at each, and discuss none of them.** D is everything and C is almost nothing. The saving approaches 100 percent, because none of it ever needed to be in the context.
- **You are doing real work with an assistant, and along the way you convert four files and glance at two of them.** This is the realistic case. If those files are 20,000 characters between them and the working conversation is 60,000, the document text is a quarter of the total, and taking the conversions outside removes almost all of it.

That middle band is where the honest claim lives. A fifth to a quarter of a working session's tokens going on document text that nobody needed the model to think about is entirely ordinary — and it is also entirely dependent on your habits, which is why a single advertised percentage would be a number made up to sound good. Compute `D / (D + C)` on your own transcript and you will have a figure that is true for you.

## When the model genuinely has to read it

This deserves its own section, because the rest of the article could be misread as "keep documents away from assistants", and that would be wrong.

If you want the content summarised, criticised, translated, compared against another document, checked for contradictions, or reasoned about in any way — the document has to be in the context window. That is not waste; that is the job. No converter reduces it and anything claiming otherwise is selling you something. The only sensible economy there is to send the document in its most compact honest form: Markdown rather than HTML, the text rather than the base64 of a scan of the text, the four relevant sections rather than the whole handbook.

The distinction is simple and it is worth holding onto: **a conversion is mechanical, an interpretation is not.** Pay the model for interpretation. Do not pay it to be a parser.

## What this looks like in practice

Four changes, in rough order of how much they save:

1. **Convert the file where the file is.** A browser has a parser in it. A conversion that happens in the page costs zero tokens and does not send the document anywhere, which is a privacy answer as much as a cost one.
2. **Look at documents in a viewer, not in a transcript.** "Print it back so I can check" is the expensive habit. Rendering is free.
3. **Pass documents by address.** A tool that returns a link keeps the document out of the history, and out of every turn after it.
4. **Strip what nobody needs before sending anything.** Front matter, navigation, repeated boilerplate and embedded pictures are all tokens, and for most questions none of them carry the answer.

Fifteen conversions here run in the browser, and a connector exposes the same conversions to an assistant as tool calls that return a link rather than a document. The reason it is built that way is the arithmetic above, not the other way round: a document that never enters the transcript is the only one you are certain not to pay for twice. For the API version of the same idea, [converting documents with an API](/blog/converting-documents-with-an-api) covers doing it from a script, where the token count is zero by construction.
