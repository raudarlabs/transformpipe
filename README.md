<div align="center">

<img src="brand/mark.svg" alt="" width="88" height="88">

# TransformPipe

**Ten document conversions that run in your browser.** Word, Excel, PDF, HTML, CSV, JSON or a whole
Notion, Confluence or Obsidian export in — a clean document out, as Markdown, HTML, plain text or
print. Signed out, nothing is uploaded and nothing needs a network.

[![License: MIT](https://img.shields.io/badge/license-MIT-14a8af.svg)](LICENSE)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Ftransformpipe.com&label=transformpipe.com&color=14a8af)](https://transformpipe.com)
[![Conversions](https://img.shields.io/badge/conversions-10-14a8af.svg)](https://transformpipe.com/docs#converting)
[![MCP connector](https://img.shields.io/badge/MCP-connector-14a8af.svg)](https://transformpipe.com/docs#assistant)
[![Browser extension](https://img.shields.io/badge/extension-Chrome%20%C2%B7%20Firefox-14a8af.svg)](https://transformpipe.com/extension)

[**Open it**](https://transformpipe.com) ·
[Documentation](https://transformpipe.com/docs) ·
[Browser extension](https://transformpipe.com/extension) ·
[What has shipped](https://transformpipe.com/changelog) ·
[Support](https://transformpipe.com/support)

</div>

---

Live at **[transformpipe.com](https://transformpipe.com)**. The old `md-2-html.vercel.app` still
answers, so links already shared keep working; the canonical URLs, the sitemap and every default in
the CLI and the Action name the new domain. Nothing in `server/` carries a domain at all — origins
come from the request through `selfOrigin`, which is what made the move a matter of one trusted
origin and a rebuild.

Upload a file, see exactly what it became, and download it. Twelve conversions, each with its own
page and address:

| Conversion | Takes | Produces |
| --- | --- | --- |
| [Markdown → HTML](https://transformpipe.com/) | `.md` `.markdown` `.mdown` `.mkd` | a self-contained `.html` |
| [HTML → Markdown](https://transformpipe.com/html-to-markdown) | `.html` `.htm` `.xhtml` | `.md` |
| [Raw text → Markdown](https://transformpipe.com/text-to-markdown) | `.txt` | `.md` |
| [CSV → Markdown table](https://transformpipe.com/csv-to-markdown) | `.csv` `.tsv` | `.md` |
| [JSON → Markdown](https://transformpipe.com/json-to-markdown) | `.json` | `.md` |
| [Notion export → Markdown](https://transformpipe.com/notion-to-markdown) | `.zip` (Export as Markdown & CSV) | `.md` |
| [Confluence export → Markdown](https://transformpipe.com/confluence-to-markdown) | `.zip` (Export → HTML) | `.md` |
| [Obsidian vault → Markdown](https://transformpipe.com/obsidian-to-markdown) | `.zip` (the vault folder, zipped) | `.md` |
| [Word → Markdown](https://transformpipe.com/word-to-markdown) | `.docx` | `.md` |
| [Excel → Markdown table](https://transformpipe.com/excel-to-markdown) | `.xlsx` | `.md` |
| [PowerPoint → Markdown](https://transformpipe.com/powerpoint-to-markdown) | `.pptx` | `.md` (a section per slide, speaker notes kept) |
| [EPUB → Markdown](https://transformpipe.com/epub-to-markdown) | `.epub` | `.md` (a section per chapter, in reading order) |

They all normalise to Markdown, which is what a document is stored, previewed, shared and reached
by a script as — one shape rather than eleven. Any document can then be handed over as Markdown,
HTML, plain text, Word, or printed to PDF. `shared/conversions.ts` is the single list; the header menu, the
screens, the history chips, the badges and the prerendered pages all read it, so a new conversion is
an entry there plus a converter.

`.txt` used to be accepted on the Markdown → HTML page as if it already were Markdown; it has its
own conversion now instead, because a plain-text file is not Markdown even when it looks like it —
an asterisk typed as a literal asterisk and one meant as emphasis are the same character, and only
one of the two conversions is supposed to treat them alike.

Notion, Confluence and Obsidian are the three that do not produce one document from one file: each
export is several pages (or notes) in a `.zip`, and each comes back as a single Markdown document —
a table of contents, then every page in order, each a heading of its own (`shared/from-notion.ts`,
`shared/from-confluence.ts`, `shared/from-obsidian.ts`, sharing the zip-reading and merge convention
in `shared/zip-import.ts`). A link from one page to another inside the export keeps its words and
drops its address — Obsidian's own `[[wikilinks]]` included: once every page is a section of one
document, there is nowhere left for it to point.

Conversion happens in the browser — the `.docx` reader and the HTML parser load only when their
page is used, so the front page's bundle does not carry them. Sign in with Google to keep your
documents in the account and reach them from any device.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see Configuration)
npm run db:init              # creates the table in Neon
npm run dev
```

The app starts on http://127.0.0.1:5180 — `/api/*` is served by the same Hono
app that runs as a Vercel function in production, so no extra process is needed.

Other scripts: `npm run build`, `npm run preview`, `npm run check-types`,
`npm run db:init`.

Without `NEON_AUTH_BASE_URL` the app still converts files: sign-in answers 503 and the history
falls back to this browser's `localStorage`.

## Configuration

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `NEON_AUTH_BASE_URL` | the project's Neon Auth endpoint |

Both are server-side only; the browser talks to `/api/*` and never to Neon directly.

**Sign-in** is Neon Auth (Better Auth behind a Neon endpoint), which already carries Google — no
separate Google OAuth client and no client secret here. `/api/auth/*` forwards to the auth service
and rewrites `Set-Cookie` so the session cookie is first-party for this site; `/api/auth/finish`
exchanges the one-time verifier for that cookie. See `server/auth.ts`.

Neon Auth only starts a sign-in for an origin it trusts, so each origin has to be added once — and
this is the whole of what breaks when the site moves to a new domain: everything else derives its
URLs from the request, and sign-in is the one thing that has to be told:

```bash
npm run auth:origin                                # list what is trusted
npm run auth:origin -- https://transformpipe.com   # the live site
npm run auth:origin -- http://127.0.0.1:5180       # for local work
```

**Neon** — TransformPipe has its **own** Neon project (`tp`): its own database and its own Neon Auth, with
no accounts or tables shared with any other app. It was provisioned through the Vercel Marketplace,
which also connects it and writes `DATABASE_URL` / `NEON_AUTH_BASE_URL` into the project:

```bash
vercel integration add neon --name m2h
vercel env pull .env.local --environment=production
npm run env:setup          # prunes .env.local down to this app's two keys
npm run db:init            # creates m2h_document
```

**Vercel** — the variables above are set for production, preview and development by that connect
step; a deployment made before them needs a redeploy to see them. The build is auto-detected
(Vite → `dist`) and `/api/*` is routed to the Hono function by `vercel.json`.

## What it does

- **Upload** — drag & drop or file picker, `.md / .markdown / .mdown / .mkd / .txt`, up to 10 MB.
- **Chain several files** — drop more than one and they become a single document, in the order they
  arrive, separated by a rule; the same works on any selection in the history.
- **Preview** — GitHub Flavored Markdown (tables, task lists, strikethrough,
  autolinks), sanitized with DOMPurify, styled with the design-system tokens.
- **Share** — a document in your account can be opened by anyone with the link, or only by the
  addresses you list (they sign in with that address). `/s/<token>` is a read-only page: the
  document and a download, nothing else. Revoking drops the token, so a link already sent stops
  working. No email is sent — you pass the link on yourself.
- **Shared with me** — a chip in the history lists documents other people addressed to you, with
  who shared each one. They are read-only: open and download, no delete, no re-share. Only
  addressed shares appear; a link share belongs to whoever holds the link, not to a list.
- **Fullscreen reading** — the preview takes the whole screen, the sheet keeps a readable measure
  and scrolls; Escape comes back. A long document gets a back-to-top button, in both the normal and
  the fullscreen view.
- **HTML source** tab — the exact standalone document that gets downloaded.
- **Download / Copy** — self-contained `.html` with inline styles, print-ready. Nothing is fetched
  when it opens: no scripts, and no webfont either. It used to link DM Sans from Google, which made
  "self-contained" false in the one file that is actually handed to someone else, so the export
  falls back through `ui-sans-serif` to the system face and asks for nothing.
- **Download as Word** — a saved document's download menu gets a `.docx`, built server-side from
  the same HTML the preview renders (`@turbodocx/html-to-docx` — pure JavaScript, no headless
  browser). Needs a save first: the endpoint reads the account's copy, not the browser's.
- **A .pdf from the API** — `GET /api/v1/documents/:id.pdf`, laid out by `pdfmake` from the same
  HTML rather than a headless Chrome — no button for it in the app, deliberately: "Print or save as
  PDF" already gives a signed-in person the browser's own, pixel-exact PDF, and this is for the
  case that button cannot reach — a script, a CI job, a GitHub Action step with no browser at all.
- **History** — signed in: stored in the account (up to 500 documents, 4 MB of source
  each), available on every device; signed out: the last 25 conversions in
  `localStorage`. Whatever was collected locally is moved into the account on
  first sign-in. The page has its own dropzone, a search box over file names,
  Markdown/HTML chips and sortable headers; a row opens the document, and rows can
  be selected in bulk to merge, download or delete them (the selection bar and the
  chips come from the design system).

  The chips choose which face of a document the list shows: the Markdown source it
  was made from, or the HTML it converts to — the row's name, its type badge and
  what a download hands over all follow. Only the source is stored; the HTML is
  built on the spot, which is why the size column names what it measures.
- **Versions** — pushing with `?replaces=<id>` (API), `--replaces` (CLI) or `replaces` (Action)
  links a document to an earlier one as a new version of it — opt-in and explicit, never inferred,
  so a new push stays the unrelated document it has always been unless told otherwise. Linked
  documents get a chain icon in the history and a line-level diff against the version before them.
- **Sign-in** — Google, through Neon Auth.
- **Summary** — a saved document gets a third tab: three to five sentences from Gemini, called
  directly with a Google AI Studio key (`GOOGLE_GENERATIVE_AI_API_KEY` — free tier, no card
  needed). Generated once and cached on the row, so opening the tab again is free; "Regenerate"
  asks again. Metered separately from the ordinary API limits — 20 a day per account — because
  unlike the rest of this app, it costs money per call. Without a key the tab says so rather than
  failing the save.

## UI

The interface is built on our internal design system: design tokens (light and
dark), DM Sans, and the React component library are vendored under `src/ui`,
extended by `tailwind.ui.config.ts` / `tailwind.config.ts` and loaded through
`src/index.css`. The app defaults to the dark theme (`<html class="dark">`);
switching to light is a matter of dropping that class.

Markdown document styling (`src/lib/md-doc-css.ts`) is written once against
`--md-*` variables and used both in the preview and in the exported file, so the two always match,
down to the sheet's own background — the document follows whichever theme the app is in, and the
downloaded file carries that palette with it. Printing always flips to the light values, because a
dark page on paper is a wall of ink.

The theme (dark by default) lives behind the account menu, remembered per browser in
`localStorage`; signed out, a sun/moon button in the header does the same job.

## API

Everything the app does, a script can do with a key: **account menu → API keys**. The key is shown
once, stored only as a hash, and can be revoked at any time. It reaches documents and shares — never
the account or the keys themselves, so a leaked key cannot mint its replacement or lock you out.

```bash
# publish a file in one request
curl -H "Authorization: Bearer tp_live_…"      --data-binary @README.md      "https://transformpipe.com/api/v1/documents?name=README.md&share=link"
# → { "document": { "id": "…", "share": { "mode": "link", "url": "https://…/s/…" } } }
```

| | |
| --- | --- |
| `POST /api/v1/documents` | Markdown as the body (`?name=`) or JSON `{name, markdown}`; `?share=link\|people` publishes it in the same call; `?kind=html-to-markdown\|csv-to-markdown\|json-to-markdown\|word-to-markdown\|notion-to-markdown\|confluence-to-markdown\|obsidian-to-markdown\|text-to-markdown\|excel-to-markdown\|powerpoint-to-markdown\|epub-to-markdown` converts the body first — for Word, Notion, Confluence, Obsidian, Excel, PowerPoint and EPUB, post the file itself (`.docx`, `.zip`, `.xlsx`, `.pptx` or `.epub`) as the body; `?replaces=<id>` links it to an earlier document as a new version, opt-in |
| `GET /api/v1/documents` | the newest 500; `?q=` searches content as well as name, ranked by relevance |
| `GET /api/v1/documents/:id` | metadata and the source |
| `GET /api/v1/documents/:id.html` | the standalone document, `?theme=dark` optional |
| `GET /api/v1/documents/:id.docx` | a Word document, built from the same HTML on the way out |
| `GET /api/v1/documents/:id.pdf` | a PDF, laid out from the same HTML by `pdfmake` — no headless browser |
| `GET /api/v1/documents/:id/versions` | every document in the same version chain, oldest first |
| `DELETE /api/v1/documents/:id` | removes the row and its source |
| `GET \| PUT /api/v1/documents/:id/share` | `{mode, emails[]}`; `private` drops the token, so a link already sent stops working |
| `POST /api/v1/documents/:id/summary` | a cached summary, generating it first if there is none; `?force=1` regenerates. Limited to 20 a day per account |

A cookie works too, so the same endpoints can be tried from a signed-in browser. `GET
/api/v1/usage` says what an account is using. Errors are `{ "error": "…" }` with a status that means
what it says: 401 unknown key, 404 not yours, 413 the document is over 4 MB, 403 the account is out
of room, 429 too fast, 410 the source is gone.

## Webhooks

**account menu → Webhooks** registers a URL that gets a signed `POST` when a document is created
or shared with named people. Session-only, deliberately — unlike API keys, a webhook is not
exposed under `/api/v1`: an API key that could also register one would turn a leaked key into a
standing feed of every future document, rather than the point-in-time access it is today.

```json
{
  "event": "document.created",
  "created_at": "2026-09-11T12:00:00.000Z",
  "data": { "id": "…", "name": "notes.md", "kind": "markdown-to-html", "size": 512 }
}
```

The body is signed with HMAC-SHA256 over `{timestamp}.{body}`, in the
`x-transformpipe-signature: t=<unix-seconds>,v1=<hex>` header — the same shape Stripe and GitHub
use, so existing verification code usually needs only the secret changed:

```js
const expected = crypto
  .createHmac('sha256', secret)
  .update(`${timestamp}.${rawBody}`)
  .digest('hex');
```

The secret is shown when the webhook is created and can be shown again from the dialog — unlike an
API key, a webhook secret is presented *by* this app rather than *to* it, so the account owner may
legitimately need it again to configure or debug a receiver. Delivery is best effort: one request,
a five-second timeout, no retry and no queue — a receiver that is down misses that delivery, and
the dialog shows when the last one failed.

## From a terminal

`cli/tp.mjs` is the same API with a friendlier face. No dependencies — it is one `fetch` and some
printing, because a tool people run in CI should not drag a package tree behind it.

```bash
node cli/tp.mjs login tp_live_…              # remembers the key in ~/.config/tp/config.json
node cli/tp.mjs push README.md --share        # prints the link
node cli/tp.mjs push docs/*.md --merge --share --name handbook.md
node cli/tp.mjs list
node cli/tp.mjs rm <id>
node cli/tp.mjs summary <id>                  # generated once, cached; --force to regenerate
node cli/tp.mjs push v2.md --replaces <id>    # links it to an earlier document as a new version
node cli/tp.mjs versions <id>                 # every document in the chain, oldest first
node cli/tp.mjs usage                         # 65.8 kB of 100.0 MB · 3 of 500 documents
```

The key comes from `--key`, `TP_API_KEY`, or that config file, in that order; `TP_HOST` points it
at another deployment. `--json` prints the API's own response, which is what the Action reads.

## As a GitHub Action

`action.yml` at the root of this repository publishes Markdown from a workflow. Given no file list
it takes what the pull request changed, and with `pull-requests: write` it comments the links, so a
reviewer opens the rendered document instead of reading a diff of asterisks.

```yaml
- uses: raudarlabs/transformpipe@main
  with:
    api-key: ${{ secrets.TP_API_KEY }}
```

`examples/publish-markdown.yml` is a complete workflow to copy. Inputs: `api-key`, `files`,
`share` (`link` / `people` / `none`), `merge`, `name`, `replaces`, `comment`, `host`; outputs:
`urls` and `documents`. Checkout needs `fetch-depth: 0` for the base commit the file list is
computed against.

A new document per push is deliberate — a link in an old comment keeps showing what that commit
said. `share: none` publishes privately if the links should not be public. `replaces` is the one
way to say two pushes are versions of the same thing rather than unrelated documents — pass the
previous push's id and the two show up linked, with a diff, in the account's history.

## In an assistant

TransformPipe is an MCP server at `/api/mcp`, so it can be added to Claude as a connector and convert, save,
share, summarise, version and delete documents in one account. There is no key to paste:

```bash
claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp
```

The first call is answered `401` with a `WWW-Authenticate` header naming
`/.well-known/oauth-protected-resource`, the client follows that to
`/.well-known/oauth-authorization-server`, identifies itself, and sends the person to
`/api/oauth/authorize`. It identifies itself in one of two ways: with a Client ID Metadata Document
— an https URL for a `client_id`, which `server/cimd.ts` fetches, checks and caches — or by
registering (RFC 7591) and being given an id. Claude prefers the document and so does the MCP spec,
because registration mints a fresh client on every connection; registration stays for clients that
do not implement it. They sign in with the same Google account and approve a named client on a
page they read — a POST, so a link on its own authorises nothing — and the client exchanges its code
for a token of ours. `server/oauth.ts` is that authorization server and `server/mcp.ts` is the
endpoint; `src/lib/mcp-facts.ts` holds the tool names, typed, so a tool renamed on the server stops
the build of the page that documents it.

It has to be our own authorization server: the protocol forbids a resource accepting a token issued
by anybody else, so a Neon Auth session cannot be handed to a client. What the client gets reaches
documents and shares, and never the account, the sign-in or the API keys — the rule the keys already
follow, applied to the credential it is most about. Connections are listed beside the keys in the
account menu and revoked there, all tokens for a client at once, because revoking the access token
alone leaves it able to mint another within the minute.

The tools call this app's own `/api/v1` in process with the caller's credential forwarded, so a
conversation and a script get the same answer from the same code. Two are shaped for the trouble
they can cause: sharing publishes a page on the public web, and deleting takes an explicit
confirmation and removes exactly one document. A grant can be read-only, and then the writing tools
refuse in a sentence.

`npm run mcp:check` runs the whole flow against a local server and the real database — discovery,
the 401, registration, an unregistered `redirect_uri`, PKCE, a burnt code, refresh rotation,
revocation and every tool — and cleans up after itself. The half that needs a browser (Google, then
pressing Connect) is the one part it mints directly, exactly as `/approve` would.

## Limits

| | |
| --- | --- |
| Per account | 100 MB, 500 documents |
| Per conversion | 10 MB — roughly 1.5 million words. Runs in the browser, so this is a judgement about the machine, not a platform limit |
| Per kept document | 4 MB. A Vercel Function refuses a request or response body over 4.5 MB with a bare 413 the app never sees, so a bigger document could be neither saved nor read back. Raising it means keeping the Markdown out of the request: a client upload straight to blob storage and reads redirecting to a signed URL. Both numbers live in `shared/limits.ts`, with the reason |
| Per caller | 60 requests a minute, counted by key or by session |

Reaching a limit is a refusal, not a silent eviction: this app used to drop the oldest document to
stay under its cap, which quietly destroyed something its owner had chosen to keep. A refusal says
what to delete instead. `server/limits.ts` holds the numbers; the rate counter is a row per caller
per minute in Postgres, which is imprecise under heavy concurrency and, at this size, the right
trade against running a cache beside the database.

## Abuse

A shared page carries other people's content on our domain, so it is served with
`script-src 'none'` and `frame-ancestors 'none'` — an injection that somehow survived the sanitiser
still cannot run, and the document cannot be framed as someone else's page. Every shared page links
to `/report/<token>`, a form that needs no JavaScript, and reports land in `m2h_report`.

Nothing is revoked automatically. `npm run reports` lists what is open, `-- --revoke <id>` kills the
link and marks it handled, `-- --dismiss <id>` just marks it. A report is a stranger's claim about
someone else's document, and both mistakes — leaving a phishing page up, killing an innocent link —
deserve a person reading it first.

## Blog and documentation

`/docs` is the manual and `/blog` is twenty articles about converting Markdown; both are pages of
this app, built from the same design system, and the articles are Markdown files in `content/blog/`
rendered by the converter itself. There is no second pipeline to keep in step, and a bug in the
renderer shows on our own pages before it shows on anyone else's document.

`content/keywords.md` is the keyword research the articles were written against — clusters by
intent, each naming the article that targets it, and four marked as gaps that nothing covers yet. It
carries no volume figures: they cannot be measured from here, and an invented number outlives the
guess it came from.

A single-page app is invisible to a crawler — every route answers with the same shell and the same
title — so `npm run build` ends with `scripts/prerender.ts`. It runs in Node, renders each article
with the server-side converter, and writes a real file per route: `dist/blog/<slug>/index.html` with
its own title, description, canonical link and `BlogPosting` data, the home page with its `FAQPage`,
plus `sitemap.xml` and `robots.txt` (shared documents are excluded — they are linked deliberately,
not crawled). Vercel serves a matching file before it consults the rewrites, so those pages are
static; the bundle still loads and takes over, and in-app navigation never touches them.

The FAQ is one list in `src/lib/faq.ts`, shown under the converter's dropzone and again in the docs.
`ArticleCard`, `SectionHeading` and `Faq` live in `src/ui/components` with the rest of the design
system, because each of them is used from three places and three near-identical copies read as three
different products.

## Addresses

`/` is the converter, `/history` the list (with `?filter=html|md|shared` for the chip it is
showing), `/docs` the manual, `/blog` and `/blog/<slug>` the articles, `/s/<token>` a shared
document. They are read straight from `location` rather than
through a router — three routes do not need one — which is what makes a reload land where you
were and the Back button work. Each needs a rewrite to `index.html` in `vercel.json`.

## Where a document lives

Postgres keeps what the app queries — name, size, stats, share token, recipients. Those rows stay
small however many documents there are. The Markdown source is never filtered on or sorted by, only
fetched whole, and it is the only part that grows, so it goes to a Vercel Blob store instead:
`sources/<user>/<document>.md`.

The store is **private**. A source is read on the server with the store's token and its URL never
reaches a browser — a shared document is served by our own route, which is where access is decided.

Connecting the store to the project hands the function an OIDC identity and a `BLOB_STORE_ID`
rather than a long-lived key, and that is the normal path; a `BLOB_READ_WRITE_TOKEN` is still
honoured where one exists. With neither, the source is written to the `markdown` column exactly as
before — so a checkout without store access still works, and rows written earlier still open.

Those older rows do not need a flag day: each moves into the store the first time it is read
somewhere the store is reachable, and the reader gets its text either way. `npm run blob:migrate`
does the same in one pass where that is preferred, and `npm run blob:reconcile` reports where store
and database disagree — an orphaned file is safe to delete, a row whose file is gone is only
reported.

The store's connection has to include the **Development** environment (Storage → the store →
Configure → Environments), or a locally pulled OIDC token is refused and `npm run dev` writes
sources to the column while production writes them to the store.

## Rendering

The parse, the renderer overrides and the allow-list live in `shared/` and run in both places: the
browser renders the preview, the function renders the page a share link opens. One document, whoever
asks for it.

Only the sanitiser differs, because only one of the two runtimes has a DOM: `src/lib/markdown.ts`
uses DOMPurify over the browser's own, `server/render.ts` uses `xss`, which parses the HTML
itself against the same allow-list. Emulating a DOM was tried first and is a trap worth writing down — jsdom broke the Node
runtime outright (a CJS dependency requiring an ESM module), and the lighter stand-ins were worse:
DOMPurify reported success and returned its input untouched, `<script>` and all. `sanitize-html`
failed the same way jsdom did, and took sign-in down with it — which is why the renderer is now
imported lazily inside the share route, where a broken renderer can only break that page. Heading ids carry a
`doc-` prefix so both sanitisers keep them; a bare `id="title"` is DOM-clobbering, which the browser
strips and a parser does not.

`GET /s/<token>` is served by the function, not by the app:

- **link share** — built HTML with `s-maxage=60, stale-while-revalidate=600`, so repeat visitors
  are answered by the CDN and the database sees about one read a minute per document. The window is
  short on purpose: revoking a share has to take effect in about a minute.
- **addressed share** — never cached. A reader who is signed in and on the list gets the same page
  privately; anyone else is redirected to `/open/<token>`, the app's own page, which knows how to
  ask them to sign in.
- **`?download`** — the same document as an attachment.

## Structure

```
api/index.ts            Vercel entry point (wraps the Hono app)
shared/                 the converter and document styles, used by both runtimes
server/                 API: routes, Neon Auth proxy, Neon client, dev middleware
db/schema.sql           m2h_document and its sharing tables
scripts/init-db.mjs     applies the schema
scripts/auth-origin.mjs manages Neon Auth's trusted origins
server/mcp.ts           the MCP endpoint and its tools
server/oauth.ts         the authorization server, and the consent page
server/wellknown.ts     the two discovery documents
scripts/prerender.ts    a real HTML file per route, after the bundle is built
scripts/screenshots.mjs the documentation screenshots, captured from the running app
content/blog/           the articles; content/keywords.md is what they were written against
cli/tp.mjs             the command line client
action.yml              the GitHub Action (examples/ has a workflow to copy)
src/
  App.tsx               app shell and state
  components/           header, user menu, dropzone, preview, stats
  features/             ConverterPage, HistoryPage, DocsPage, BlogPage, ArticlePage
  lib/                  conversion, doc styles, auth, api client, history
  ui/                   design system (vendored)
```

## Licence

MIT — see [LICENSE](LICENSE). The brand is not part of it: `brand/mark.svg`, `brand/logo.svg` and
the name are Raudar Labs's, so fork the code freely and put your own mark on it.
