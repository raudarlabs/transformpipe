# Roadmap

**Updated 21 September 2026.** Next up: **EPUB → Markdown**.

A shipping schedule, not a wish list. Every item is one week of work that somebody using
TransformPipe would notice, which is the bar `src/lib/changelog.ts` sets — an item that cannot be
written as a changelog card does not belong here, because a week that ships nothing visible is a
week the changelog page says nothing happened.

It lives at the root, in a file, because a roadmap kept anywhere else is a roadmap nobody opens.
Boxes are ticked in the commit that ships the thing, next to the changelog entry.

---

## Now

- [ ] **EPUB → Markdown** — a book as one document with its own contents
      · zip plus XHTML, and `htmlToMarkdown()` exists

## Next, in order

### What comes out of an export

What is left of it after the pictures: the half that is content rather than code.

- [ ] **What survives an export, and what does not** — one comparison page per source
      · content, not code: a Notion database already comes out as a Markdown table and nobody
      has been told

### Formats, going in

- [ ] **ODT and RTF → Markdown** — LibreOffice and Google Docs exports
      · two in a week, because ODT is a zip of XML and RTF is small
- [ ] **Evernote → Markdown** — an `.enex` export, notes merged
      · the one format here with a user base actively looking for the door

### Formats, going out

The half nobody does well: ten conversions read *into* Markdown and almost nothing writes back out
of it. "I have the Markdown, I need it in Confluence" still has no good answer on the internet.

- [ ] **Markdown → Confluence storage format**
      · XHTML with Confluence's own macro elements. A renderer, not a filter
- [ ] **Markdown → Jira wiki markup**, and **→ Slack mrkdwn**
      · line-level transforms of the token stream; they share a week
- [ ] **Markdown → EPUB**
      · zip, XHTML, a manifest — the inverse of EPUB in
- [ ] **Markdown → Word, properly** — styles a Word user can edit
      · the `.docx` export exists; this is the week it stops looking like converted HTML

### Comparing

The first thing here that is not a conversion, and the reason it gets a heading of its own rather
than a line in the list below: everything above turns one file into another file, and this turns
two files into an answer. Hiding the one strategic bet in a list about storage is how it gets lost.

- [ ] **Code compare** — two versions of code side by side, in the browser, with no account
      · `diff` and the highlighter are already dependencies; `VersionDiff` moves onto the shared
      core rather than a second copy of it
- [ ] **A comparison with an address** — the diff saved as a document, and `tp_compare` handing it
      to an assistant
      · sharing, versions and the Word export already exist, and so does the MCP server — which is
      the way in to VS Code, Cursor and SSMS without writing an extension for any of them

### The pull request, and the link

- [ ] **The GitHub App** — install once, and every pull request touching Markdown gets a rendered
      link per changed file
      · app registration, `pull_request` webhook, installation tokens. The heaviest item left
- [ ] **The same app, useful** — a check run rather than a comment thread, and the Marketplace
      listing
      · comments pile up on a long review; a check run updates in place
- [ ] **A password on a shared link**
      · hash on the row, one gate before the render — server-side, since the shared page has no
      scripts
- [ ] **An expiry date, and a view count**
      · two columns and a sweep. Answers "is this link still live" without asking anybody

### The desk

- [ ] **A chosen address** instead of a token, and **a QR code** for it
      · collision handling is the feature; the QR is an afternoon
- [ ] **The shared page grows up** — contents, a print stylesheet, its own preview image
      · the image is the interesting half: a per-document card drawn the way the blog covers are
- [ ] **Tags in the history**, filterable beside the existing chips
      · the chip plumbing exists; this adds a source of chips
- [ ] **A trash** — deletes recoverable for thirty days, and **drop a folder** to get a zip back
      · `deleted_at` rather than a delete, and one honest sentence in the privacy page

---

## Waiting on somebody else

| | State |
| --- | --- |
| Chrome Web Store | 2.0.0 submitted, still in review. Today's work needs 2.0.1 once it clears |
| Firefox Add-ons | 2.0.0 submitted 19 September, with source and `BUILD.md` — 0 errors, 26 warnings, all from mermaid's own dependencies |
| GitHub Marketplace, for the Action | `branding` is in `action.yml`; the listing itself has not been made |

The rule that came out of this: submit early in a week and ship something else while it sits.

---

## Shipped

Newest first. Dates are the changelog's; everything here is on `main` and on production unless it
says otherwise.

### 21 September

- [x] **Pictures survive an export** — images in a Notion, Confluence, Obsidian or PowerPoint
      archive are carried into the document, and Word's are kept instead of thrown away after
      `mammoth` had already handed them over. Embedded rather than uploaded, because the file
      stays in the browser; half of a document's 4 MB between them, and a picture that does not
      fit keeps the link it had
- [x] **The formats that are coming say so** — the four next in this file, as blocks under the
      dropzone that disappear on their own the day the format ships

### 20 September

- [x] **PowerPoint → Markdown** — a slide is a section, in the order the deck plays, and the
      speaker notes come with it. Bullets keep their nesting, tables lose their merged-cell
      padding, and a slide that is only a picture says so
- [x] **A document check** — a tab beside the preview with a count on it: dead anchors, two
      headings sharing one, empty headings, pictures with no alt text, links with nothing to click.
      Each carries its line, and nothing is rewritten

### 19 September

- [x] **Mermaid diagrams are drawn** rather than printed as code — in the preview, the downloaded
      .html and in print, at a size somebody can read, redrawn when the theme changes
- [x] **Maths between dollar signs** — `$…$`, `$$…$$`, and LaTeX's own `\( \)`, `\[ \]` and
      environments, typeset with KaTeX as MathML, so a formula needs no stylesheet and no fonts
- [x] **Code is highlighted** in every fence that names a language — six colours from the
      document's own palette, following the theme, inside the exported file
- [x] **The things people actually write in Markdown** — front matter, GitHub alerts and Obsidian
      callouts, footnotes, wikilinks, `==highlight==`, `H~2~O`
- [x] **The live preview says what it renders**, and its sample exercises all of it
- [x] **Signing in says what an account is for** — a panel beside the form; it folds away on a
      phone
- [x] **The extension reads the screen, not the document** — hidden routes, shadow DOM, typed form
      values, `::before` text, preformatted blocks kept preformatted, and a fail-safe that refuses
      to empty a page

### Earlier in September

- [x] **The browser extension** — the page as Markdown, a side panel that follows you, files
      converted in a tab of its own, the page saved as it looks, OAuth sign-in, save and share.
      Chrome and Firefox from one source
- [x] **The blog in five languages** — 63 articles each in English, German, French, Spanish and
      Italian, written rather than machine-translated
- [x] **Installable, and offline** for the half that never needed a network
- [x] **⌘K** finds conversions, pages and the five documents you converted last
- [x] **A new mark**, and every icon a browser, a phone or a connector list asks for
- [x] **The cookie question, asked properly** — three one-click answers, analytics off until
      allowed
- [x] **The header rebuilt** around search, with the trail in a line of its own
- [x] **Share on X, Reddit and LinkedIn** on every article — plain links, no SDK
- [x] **Support, a security address, and an MIT licence** on a repository page that says what this
      is

### What the numbers did

| | Then | Now |
| --- | --- | --- |
| Blog | 63 English, 63 German, 4 each in French, Spanish, Italian | **63 in all five languages** — 315 articles |
| Changelog | A list of cards | **45 entries with pages of their own**, in five languages |
| Prerendered pages | 273 | **690** |
| How-to pages | 9, English only | 9, five languages, linked from the conversion that answers them |

---

## Spares

Sized to drop into a gap without planning, and none depends on anything above.

- **A usage page** — conversions, AI summaries and API calls this month against the limits. The
  numbers are in the database and nobody can see them
- **Export everything** — every document as one zip. Small, and it makes trusting an account cheap
- **Edit in place** — change the Markdown on the page and save it as the next version
- **Markdown → AsciiDoc and reStructuredText**, for docs teams migrating between generators
- **Sign in with GitHub** — one provider on an existing flow, and it reads differently once there
  is a GitHub App in the Marketplace
- **An API playground on `/docs`** — a real request, from the page, against the caller's own key
- **Rate-limit headers** on every public API response, and an honest `Retry-After`
- **`tp watch`** in the CLI — a folder, converted on save
- **Comparison pages** — a conversion of ours against the tool people use for it today. Content,
  not code, and the cheapest traffic on the list
- **A Mermaid page of its own** — paste a diagram, get SVG or PNG. Not a conversion: a surface,
  with real search behind it

---

## The rules that do not move

- One entry in `src/lib/changelog.ts`, in the commit that ships the thing. A release with no card
  is a release nobody hears about.
- A new conversion means a page, five locales, a how-to page and a sitemap entry.
- A new article ships in five languages the same day, and so does every changelog page.
- `npm run check-types && npm run build` green before the deploy, every time, no exceptions.
- Anything published outside this repository — a browser store, the GitHub Marketplace — is
  reviewed by somebody else on their own schedule. Submit early and ship something else while it
  sits.
- This file is updated in the commit that ships the thing, not afterwards. A roadmap that records
  what came of it is the only kind anybody keeps believing.
- **PDF → Markdown is not coming.** Written down so it is not proposed a third time: reading a PDF
  acceptably means vision models and OCR — column order, reading order, tables, formulas — which
  means a server, and a server means the one thing that makes this different, that the file never
  leaves the browser, is gone. It is also the most crowded corner of the market. PDF stays where it
  already is, on the way out.
