# The roadmap, and the ledger behind it

A shipping schedule, not a wish list. Every row is one week of work that a person using
TransformPipe would notice, which is the same bar `src/lib/changelog.ts` sets — an item that cannot
be written as a changelog card does not belong here, because a week that ships nothing visible is a
week the changelog page says nothing happened.

The first version of this file was twenty-six weeks of plan and nothing else. Half of the first
third is now behind us, and two of the months turned out differently from the plan — so the plan
now sits under a ledger of what actually shipped. A roadmap that never records what came of it is a
document people stop believing.

---

## Shipped

Dates are the changelog's; everything here is on `main` and on production unless it says otherwise.

### Where it runs — the browser extension

Two weeks of plan became rather more than two weeks of product, and it is **submitted to the Chrome
Web Store and waiting on review**.

| What | Where it lives |
| --- | --- |
| The page you are on, as Markdown — copied, downloaded, or opened at full size | `extension/PageSurface.tsx`, `shared/from-page.ts` |
| A side panel that follows you from tab to tab, and a compact panel; the choice is remembered | `extension/panel.tsx`, `extension/lib/surface.ts` |
| Files converted in a tab of the extension's own — all ten conversions, offline | `extension/viewer.tsx` over `src/lib/convert.ts` |
| **Save the page as it looks**: stylesheets read, unused rules dropped, images and fonts carried inside the file | `extension/snapshot.ts` |
| Sign in with the site's own account — OAuth, PKCE, no key to paste | `extension/lib/auth.ts` against the server's existing `/api/oauth/*` |
| Save to the account, and share through the same dialog the site uses | `extension/lib/share.ts` |
| The same extension in Firefox, from the same source | `npm run ext:firefox` |
| Store listing, screenshots, tile, privacy answers | `content/extension-store.md`, `brand/store/`, `npm run store:check` |

Nothing on the site was built for it: `server/caller.ts` has resolved OAuth callers since the MCP
endpoint shipped, and `/api/v1` has accepted them ever since.

### The site

- **Installable, and offline** for the half that never needed a network — `public/sw.js`.
- **⌘K** finds conversions, pages and the five documents you converted last; typing searches every
  document you have by name.
- **A new mark**, and every icon a browser, a phone or a connector list asks for — including the
  `/favicon.ico` whose absence was showing the old logo beside the MCP connection.
- **The cookie question, asked properly**: a banner with three one-click answers, analytics off
  until it is allowed, and the privacy and cookies pages rewritten to match.
- **The header rebuilt** around search, with the trail moved out of the page into a line of its own.
- **A shared document** carries the app's header, and a card that reads like a document rather than
  a row of ids.
- **Support**, a security address that answers, and an MIT licence on a repository page that says
  what this is.
- **Share on X, Reddit and LinkedIn** at the foot of every article — three plain links, no SDK, so
  nothing loads until a reader clicks.
- **A document check**: a tab beside the preview, with a count on it — dead anchors, two headings
  sharing one, empty headings, pictures with no alt text, links with nothing to click. Each one
  carries its line, and nothing is rewritten.
- **Code is highlighted** in every fence that names a language — six colours from the document's
  own palette, following the theme, inside the exported file rather than in a stylesheet somebody
  has to keep.
- **Signing in says what an account is for**: a panel beside the form listing the history, links,
  the API key and the extension, and a form with room in it. The panel folds away on a phone.
- **Maths between dollar signs** — `$…$` and `$$…$$` typeset with KaTeX, as MathML, so a formula
  needs no stylesheet and no fonts to survive being saved. A price written as `$5 to $10` stays a
  price.
- **Signing in looks like this product** rather than like every product: the header's accent line,
  the converter's own small capitals over each field, and no envelope or padlock in a box.
- **Mermaid diagrams are drawn** rather than printed as code — in the preview, in the downloaded
  .html and in what prints, redrawn when the theme changes, and left as readable source wherever
  there is no browser to measure text in.
- A **reload keeps the document you were reading**; the FAQ stops resizing as you read it.

### Content

| | Then | Now |
| --- | --- | --- |
| Blog | 63 English, 63 German, 4 each in French, Spanish, Italian | **63 in all five languages** — 315 articles |
| Changelog | A list of cards | **42 entries with pages of their own**, in five languages |
| Prerendered pages | 273 | **665** |
| How-to pages | 9, English only | 9, five languages, linked from the conversion that answers them |

The translation backlog — the one thing on the old list marked "a week buys eight articles" — is
gone. It was the largest debt this product had.

---

## Waiting on somebody else

| | State |
| --- | --- |
| Chrome Web Store | Submitted. Days to weeks; nothing to do but answer if they ask |
| Firefox Add-ons | Packaged and ready to submit — `npm run ext:zip:firefox` |
| GitHub Marketplace, for the Action | `branding` is in `action.yml`; the listing itself has not been made |

The rule that came out of this: submit early in a week and ship something else while it sits.

---

## Next, in order

Sixteen weeks. The block that improved every conversion at once rather than adding an eleventh is
done; what follows is formats.

### Formats, going in

| Week | Ships | Notes |
| --- | --- | --- |
| 1 | **PowerPoint → Markdown** — one slide, one section, speaker notes kept | `.pptx` is a zip of XML; `fflate` is already here |
| 2 | **EPUB → Markdown** — a book as one document with its own contents | Zip plus XHTML, and `htmlToMarkdown()` exists |
| 3 | **ODT and RTF → Markdown** — LibreOffice and Google Docs exports | Two in a week because ODT is a zip of XML and RTF is small |
| 4 | **Evernote → Markdown** — an `.enex` export, notes merged | The one format here with a user base actively looking for the door |

### Formats, going out

The half nobody does well: ten conversions read into Markdown and almost nothing writes back out of
it. "I have the Markdown, I need it in Confluence" still has no good answer on the internet.

| Week | Ships | Notes |
| --- | --- | --- |
| 5 | **Markdown → Confluence storage format** | XHTML with Confluence's own macro elements. A renderer, not a filter |
| 6 | **Markdown → Jira wiki markup**, and **→ Slack mrkdwn** | Line-level transforms of the token stream; they share a week |
| 7 | **Markdown → EPUB** | Zip, XHTML, a manifest — the inverse of week 2 |
| 8 | **Markdown → Word, properly** — styles a Word user can edit | The `.docx` export exists; this is the week it stops looking like converted HTML |

### The pull request, and the link

| Week | Ships | Notes |
| --- | --- | --- |
| 9 | **The GitHub App**: install once, and every pull request touching Markdown gets a rendered link per changed file | App registration, `pull_request` webhook, installation tokens. The heaviest single item left |
| 10 | **The same app, useful**: a check run rather than a comment thread, and the Marketplace listing | Comments pile up on a long review; a check run updates in place |
| 11 | **A password on a shared link** | Hash on the row, one gate before the render — server-side, since the shared page has no scripts |
| 12 | **An expiry date, and a view count** | Two columns and a sweep. Answers "is this link still live" without asking anybody |

### The desk

| Week | Ships | Notes |
| --- | --- | --- |
| 13 | **A chosen address** instead of a token, and **a QR code** for it | Collision handling is the feature; the QR is an afternoon |
| 14 | **The shared page grows up**: contents, a print stylesheet, its own preview image | The image is the interesting half — a per-document card drawn the way the blog covers are |
| 15 | **Tags in the history**, filterable beside the existing chips | The chip plumbing exists; this adds a source of chips |
| 16 | **A trash**: deletes recoverable for thirty days, and **drop a folder** to get a zip back | `deleted_at` rather than a delete, and one honest sentence in the privacy page |

---

## Spares

Sized to drop into a gap without planning, and none depends on anything above.

- **A usage page**: conversions, AI summaries and API calls this month against the limits. The
  numbers are in the database and nobody can see them.
- **Export everything** — every document as one zip. Small, and it makes trusting an account cheap.
- **Edit in place**: change the Markdown on the page and save it as the next version.
- **Assets out**: every image in a converted document, as a zip beside it.
- **Markdown → AsciiDoc and reStructuredText**, for docs teams migrating between generators.
- **Sign in with GitHub.** One provider on an existing flow, and it reads differently once there is
  a GitHub App in the Marketplace.
- **An API playground on `/docs`** — a real request, from the page, against the caller's own key.
- **Rate-limit headers** on every public API response, and an honest `Retry-After`.
- **`tp watch`** in the CLI: a folder, converted on save.
- **Comparison pages** — a conversion of ours against the tool people use for it today. Content,
  not code, and the cheapest traffic on the list.

## The rules that do not move

- One entry in `src/lib/changelog.ts`, in the commit that ships the thing. A release with no card is
  a release nobody hears about.
- A new conversion means a page, five locales, a how-to page and a sitemap entry.
- A new article ships in five languages the same day — and as of this week, so does every changelog
  page.
- `npm run check-types && npm run build` green before the deploy, every week, no exceptions.
- Anything published outside this repository — a browser store, the GitHub Marketplace — is reviewed
  by somebody else on their own schedule. Submit early in a week and ship something else while it
  sits.
