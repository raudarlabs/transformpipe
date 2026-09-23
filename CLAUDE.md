# Working rules

## Every release goes in the changelog

`src/lib/changelog.ts` is the list, and it is the only one — the page at `/changelog`, the
prerendered HTML in five languages and the `lastmod` in the sitemap all come off it. There is no
`CHANGELOG.md` and no release-notes file to keep in step.

**A tagged release is not shipped until its entry is in that list.** Same commit as the version
bump, or the one that tags it — not "later", because later is when the release is out and the page
says nothing shipped.

Between releases, add an entry for anything a person using TransformPipe would notice: a new
conversion, a page, a way to sign in, a limit that moved, a bug that was visibly wrong. Those
entries carry no `version`; most of what has shipped went out between tags.

An entry is:

```ts
{
  date: '2026-09-10',        // ISO. The page sorts and groups on it, so it has to be real.
  version: '2.0.0',          // Only when it shipped in a tagged release. Omit otherwise.
  title: 'Markdown in, a document out',
  body: 'Markdown. A few sentences — a card that needs scrolling is an article.',
}
```

Order in the file does not matter; the page sorts by date, newest first. Grouping into months and
years is `changelogByYear()`, used by both the app and the prerenderer.

### What does not go in

Refactors, dependency bumps, build and infrastructure work, anything invisible from outside. The
panel on the page says as much to the reader (`changelog.scope`), so an entry about a moved file
would make that note untrue.

### Language

Entries are written in English and stay in English, like the blog (`src/lib/i18n/content.ts` draws
the same line). Only the chrome around them is translated — heading, lede, the year panel, and the
dates and month names, which `Intl` renders in the reader's language. Five translations per entry
is a cost that gets skipped after the second release, and a changelog with three languages missing
is worse than one that is honestly English.

### An entry can have a page of its own

Most should not. A `slug` gives the entry an address — `/changelog/<slug>`, prerendered in five
languages — and it is for the entries somebody would search for: a
format this now converts, a thing it now does. Not for a fix.

```ts
{
  date: '2026-09-11',
  title: 'Download a saved document as Word',
  body: 'The card. The summary a search result shows and the list prints.',
  slug: 'markdown-to-word',       // kebab-case, unique, permanent from the day it deploys
  detail: {
    en: {
      description: '100-165 characters, like a blog article\'s',
      keywords: 'four phrases or more, comma separated',
      body: `Markdown, at most 3000 characters, no H1 — the page supplies it.`,
    },
  },
}
```

`changelogProblems()` enforces all of that and the prerenderer throws on it, so a bad entry fails
the build rather than shipping an empty page.

**A page is not an entry in the sitemap.** Since 24 September 2026 an entry page is listed and
indexable only when its slug is in `INDEXED_ENTRIES` in `src/lib/changelog.ts`; every other one is
served `noindex, follow`. Fifty-three pages in five languages were a third of the sitemap, and the
Search Console report showed them queued ahead of the conversion pages that have to rank. Add a
slug to that set only when people search for the thing and no other page here answers the search —
never for a new conversion, whose own page (`/epub-to-markdown`) is the one that should rank.

**Detail pages may be translated, and entries themselves still may not.** The reason the rule
exists — five translations per entry, per release, forever — does not apply to a handful of pages
written on purpose: add `de`, `fr`, `es` or `it` beside `en` in `detail` and that language gets it,
with English as the fallback where nobody has written one.

### After the entry

- `npm run check-types && npm run build` — the prerenderer reads the same list, and a broken
  entry breaks 147 pages, not one.
- A tagged release also wants the tag pushed and a GitHub release created with the same words.

## A new article ships in all five languages

Decided 2026-09-14, and it applies to articles written from that date on, not to the backlog.

A new blog article is not finished in English. It is finished when `content/blog/<slug>.md` exists
alongside `content/blog/de/`, `fr/`, `es/` and `it/` versions of the same slug — same commit, same
day. The reason is the one the backlog demonstrates: 56 articles went out in English, German
followed a language at a time, and the other three never started, because "translate it later" is a
decision nobody ever makes on purpose.

The backlog stays as it is. It is translated when somebody chooses to, in whatever order they
choose; the rule is about not growing it.

### What a translation is here

Not a literal one. `content/blog/de/markdown-escaping.md` beside its English original is the
worked example: formal register, prose rewritten rather than transposed, and `keywords` written
around the phrase a reader of that language actually types rather than the English keywords
translated word for word. What does not change: `date`, every link target, every code block, every
table's structure, and every `(checked on <site>, <date>)` citation, which keeps the date it was
actually checked on.

The `tag` is translated, and these are the words in use — the first four are established by the
existing German articles, the rest follow the same logic:

| English | de | fr | es | it |
| --- | --- | --- | --- | --- |
| Converting | Konvertieren | Conversion | Conversión | Conversione |
| Publishing | Veröffentlichen | Publication | Publicación | Pubblicazione |
| Safety | Sicherheit | Sécurité | Seguridad | Sicurezza |
| Automation | Automatisierung | Automatisation | Automatización | Automazione |
| Syntax | Syntax | Syntaxe | Sintaxis | Sintassi |
| Workflow | Workflow | Workflow | Workflow | Workflow |
| Code | Code | Code | Código | Codice |

### After the articles

- `npm run og` draws the covers, including one per language — an article without them fails
  `npm run blog:check`. It redraws every existing cover too, so commit only the new files.
- `npm run check-types && npm run build`. The checker enforces the rest: a translation at least
  two thirds the English length, a description of 100-165 characters, no `# ` H1 in the body, no
  dead internal links, at most four mentions of the product's own name, and no orphan — something
  has to link to the new article or nobody reaches it.

## The roadmap is a file, and it is ticked in the same commit

`ROADMAP.md` at the root is the plan and the ledger both. An item moves from **Next** to
**Shipped** in the commit that ships it — alongside the changelog entry, not after it — and the
date line at the top moves with it.

The two lists answer different questions and neither replaces the other: `src/lib/changelog.ts`
tells somebody using TransformPipe what changed, `ROADMAP.md` says what is coming and what came of
what was promised. A roadmap nobody updates is a document people stop believing, which is why the
first version of this one — twenty-six weeks of plan and no record — was rewritten.
