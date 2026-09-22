# Blog plan from Search Console, 22 September 2026

Source: `Performance on Search`, web, last 28 days. 14 clicks, 2258 impressions, CTR 0.62%,
average position 14.8.

## What the export actually says

**The window is twelve days, not twenty-eight.** The first impression is 2026-09-09. Everything
below is two weeks of a site that is still being discovered, so every CTR on a single-digit
impression count is noise and is treated as such.

**Six of the fourteen clicks are not the audience.** Ukraine 4 clicks / 9 impressions and Slovakia
2 / 4 are the author and people near the author. Real outside clicks: eight.

**The query list covers 12% of the impressions.** 271 of 2258. The rest is anonymised long tail, so
`Queries.csv` shows the *shape* of demand and `Pages.csv` shows its *size*. Where the two disagree,
the pages win.

### The one number that decides the plan

Five articles carry 1213 impressions — 54% of the site — at an average position between 6 and 10,
and between them they earned one click.

| Page | Impressions | Position | Clicks |
| --- | --- | --- | --- |
| `code-blocks-in-markdown` | 539 | 9.33 | 0 |
| `turndown-and-html-to-markdown-libraries` | 306 | 6.80 | 1 |
| `markdown-line-breaks-and-lists` | 149 | 8.03 | 0 |
| `mammoth-js-and-docx-parsers` | 122 | 7.30 | 0 |
| `commonmark-gfm-and-the-flavours` | 97 | 6.14 | 0 |

The queries behind them are spec lookups: *commonmark spec fenced code block closing fence at least
as long as opening fence*, *github flavored markdown fenced code block tilde closing fence length*,
*mammoth.js browser converttohtml arraybuffer documentation*, *miller mlr split verb -n -m -g
documentation*. Somebody typing that wants a line from a specification, and gets it from the
snippet or the AI overview without visiting anything.

So the developer cluster is where this site has authority, and it is not where clicks come from.
It earns rankings that make the next article rank. It does not earn traffic. The plan spends on it
deliberately and does not pretend otherwise.

### The second number

The commercial queries sit on page six to ten. *markdown to word* 87.8. *excel to markdown* 75.5.
*json to markdown* 66.7. *confluence export to markdown* 62. *html to markdown converter* 73. For
almost every one of these an article already exists and is five thousand words long. A second
article about the same thing does not move position 87 — domain age does.

### The pattern worth exploiting

A blog article outranks the converter landing page for the same term, four times out of five:

| Topic | Article | Landing page |
| --- | --- | --- |
| CSV | 4.93 | 74.0 |
| JSON | 16.8 | 67.8 |
| Confluence | 27.3 | 77.5 |
| HTML | 20.0 | 41.0 |
| Excel | 75.2 | 78.5 (the exception — both are bad) |

Where a converter page exists with no article behind it, writing the article is the cheapest
ranking the site can buy.

---

## Before any new article: five titles

Higher expected return than a month of writing, and it is one day of work. The five pages above
rank on the first page and are not clicked. Rewrite title and description so they promise the
thing the snippet cannot give away — the worked example, the table of what each tool loses, the
version where it changed. Measure four weeks later. If CTR on those five does not move, the cluster
is genuinely unclickable and Wave 1 below should be cut in half.

---

## Wave 1 — extend the cluster that already ranks

Low risk: the siblings sit at 6–10, so these land fast. Budgeted as authority, not as traffic.

1. **Markdown formatters and linters** — mdformat, Prettier, markdownlint, remark: what each one
   rewrites without asking.
   · Evidence: *mdformat gfm* (pos 57) and no article at all. Nearest sibling ranks 6.14.
2. **What fits in a Markdown table cell** — lists, code, line breaks, pipes, and the four ways
   round each.
   · Evidence: *markdown table bullet list in cell* (pos 7). `markdown-tables-that-survive-conversion`
   is at 7.48 with 42 impressions.
3. **HTML inside Markdown** — what every flavour allows, what a sanitiser removes, what survives
   the round trip.
   · Evidence: *markdown vs html*, *markdown into html*; sits between `sanitising-markdown-safely`
   (7.91) and `commonmark-gfm-and-the-flavours` (6.14).

## Wave 2 — the direction nobody writes

Everything on this site reads *into* Markdown. The queries for the way out have no competition,
and `ROADMAP.md` is already building the features, so each article ships beside a changelog entry.

4. **Markdown into Google Docs** — paste, import, and what the round trip loses.
   · Evidence: *paste from markdown google docs*, *google docs import markdown*, *docs to markdown*.
   `convert-google-docs-to-markdown` only goes the other way.
5. **Markdown to Confluence storage format** — ships with the roadmap's current item.
   · Evidence: ten Confluence queries, all inbound; the outbound half has no page anywhere.
6. **Markdown to Jira and Slack** — ships with that roadmap item.
7. **Markdown to PDF out of VS Code** — print preview, the extensions, page breaks.
   · Evidence: *how to print markdown preview in vs code* (pos 9). Joins the two best assets on the
   site: `markdown-to-html-in-vs-code` (5.26% CTR, the best on the site) and `markdown-to-pdf`
   (position 1).

## Wave 3 — a landing page with no article behind it

8. **Text to Markdown** — pasted rich text, plain text, and what a converter guesses.
   · `/text-to-markdown` is at 91.2 with nothing supporting it. Queries: *text to markdown
   converter*, *rich text to markdown converter*, *convertir texto a markdown*, *convert to md*.
9. **Changelog or release notes** — the two are not the same document, and Keep a Changelog's six
   types.
   · Evidence: two Stack Overflow–shaped queries on exactly this, plus *keep a changelog sections
   added changed deprecated removed fixed security official* (pos 11). `release-notes-from-markdown`
   holds 60 impressions at 9.75 and zero clicks because its title answers a different question.
   This site runs the rule in `CLAUDE.md`; the article writes itself.
10. **What Pandoc is, and when you do not need it.**
    · Pandoc is the largest single cluster in the export — 30 impressions over 7 queries — and
    `pandoc-alternatives-for-markdown-to-html` is the most-clicked page on the site (3 of 14). One
    article covers the whole cluster. *what is pandoc* 81, *pandoc* 71.5, *pandoc app* 51,
    *pandoc online* 86.

### Held back, on purpose

- **An HTML-to-Markdown API article.** *html to markdown api* (74.8) and *convert api* (75) are
  real, but `converting-documents-with-an-api` already sits at 31.3 and would be cannibalised.
  Revisit when that page is on page two.
- **A second Markdown-to-Word article.** Position 87.8 is not a content gap; the existing article
  is 5300 words and correctly keyworded.
- **A definitional front-matter article.** *was ist frontmatter* ranks 8 in German already. This is
  a retitle of the existing page, not a new one.

## The German note

Germany: 81 impressions, position 38 — but the German pages beat their English originals on
definitional queries. *was ist frontmatter* ranks 8, *markdown umbruch* 7, *md zeilenumbruch* 8,
where the English equivalents sit at 65–79. Less competition, same article. Nothing to change in
process — everything ships in five languages anyway — but it argues for choosing **definitional**
topics over comparative ones, because that is where the translations win.

## Measuring this

Four weeks out, the question is not clicks. It is whether the commercial cluster moved off page
six. Track the average position of *markdown to word*, *excel to markdown*, *confluence export to
markdown* and *html to markdown converter*. If those move and clicks do not, keep going. If neither
moves, the problem is links, not articles.

---

## Applied

### 22 September 2026 — the five retitles

Title and description rewritten on the five pages that rank between 6 and 10 and are not clicked,
in all five languages — 25 files, `content/blog/**`. The slugs did not move: the address is the
asset, and a retitle that changes the URL throws away the ranking it was meant to exploit.

Two rules held to. Every title stays under 68 characters, because a promise Google truncates is a
promise the reader never sees — the first pass ran to 79 and lost its payload to the ellipsis. And
every title promises the one thing the snippet and the AI overview cannot hand over: the table, the
runnable call, the list of symptoms. Each promise is in the body already; none of them is new.

| Page | Was | Is |
| --- | --- | --- |
| `code-blocks-in-markdown` | Code blocks in Markdown: fences, language hints and syntax highlighting | Markdown code blocks: the fence rules and the HTML they emit |
| `turndown-and-html-to-markdown-libraries` | Turndown and the Alternatives: Choosing an HTML to Markdown Library | Turndown vs five HTML-to-Markdown libraries: what each loses |
| `markdown-line-breaks-and-lists` | Markdown line breaks and lists: the rules, and the small betrayals | Markdown line breaks and lists: 14 symptoms, 14 rules |
| `mammoth-js-and-docx-parsers` | DOCX to HTML in JavaScript: mammoth, docx4js and the Other Parsers | mammoth.js in the browser: convertToHtml with an arrayBuffer |
| `commonmark-gfm-and-the-flavours` | CommonMark vs GFM: which Markdown are you actually writing? | CommonMark vs GFM: what each engine supports, in one table |

**Measure on 20 October 2026**, four weeks out, against the numbers in the table at the top of this
file: 539 / 9.33 / 0, 306 / 6.80 / 1, 149 / 8.03 / 0, 122 / 7.30 / 0, 97 / 6.14 / 0. If CTR on these
five has not moved, the cluster is genuinely unclickable and Wave 1 is cut in half, as this plan
says.

One thing missing for that measurement: **the export itself is not in the repository.** `Queries.csv`
and `Pages.csv` are quoted here and nowhere stored, so in four weeks there is a summary to compare
against rather than data. Dropping the 22 September export in beside this file costs nothing and
makes the comparison real.

### Not applied, and why

- **A `markitdown-alternatives` article shipped the same day**, and it is not on this plan. There
  are no MarkItDown impressions in the export — which, on a site twelve days old, is evidence of no
  page rather than evidence of no demand. One bet of that kind is reasonable; a series of them is
  how a plan gets ignored. The rest of the comparison ideas stay parked.
