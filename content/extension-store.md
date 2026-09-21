# The Chrome Web Store listing

Everything the submission form asks for, written once and kept here rather than typed into a form
and then lost. A rejected review is answered by changing words in this file and resubmitting, not by
remembering what was said last time.

The listing is English. The extension's interface is in five languages — see `_locales/`, generated
from `src/lib/i18n/messages/*` — and the store shows the name and description from the manifest,
which are localised with it.

## Identity

| Field | Value |
| --- | --- |
| Name | TransformPipe — page and file to Markdown |
| Category | Productivity → Workflow & Planning |
| Language | English (interface: English, German, French, Spanish, Italian) |
| Homepage | https://transformpipe.com/extension |
| Support | https://github.com/raudarlabs/transformpipe/issues |
| Privacy policy | https://transformpipe.com/privacy |

## Short description

132 characters is the ceiling; this is 118.

> Turn the page you are on, or a file on your machine, into clean Markdown. In your browser,
> offline, no account needed.

## Detailed description

> **The page you are looking at, as Markdown, in one click.**
>
> Press the toolbar button and TransformPipe reads the rendered page, picks the article out of the
> navigation and the cookie banners, makes every link and image address absolute, and hands you
> Markdown. Copy it, download it as `.md`, or save the page as a self-contained `.html` file — its
> own design, its pictures inside the file, no requests to anything.
>
> **A file on your machine, converted without uploading it.**
>
> Drop in a Word document and it comes back as Markdown. So does a slide deck, a spreadsheet, a
> page of saved HTML, or the zip that Notion, Confluence and Obsidian produce when you export.
> Eleven conversions in all, every one of them running in your browser: nothing is uploaded, and
> none of it needs a network connection.
>
> **Why it reads pages better than a copy and paste**
>
> Documentation, articles, a wiki page, a ticket — anything that exists only rendered. It reads
> what your browser already has on screen, so a page only you can see converts without anyone
> handing over a password: Confluence, Jira and Notion convert without an administrator, an export
> or an API token.
>
> **Two ways to look at it**
>
> The toolbar button opens a compact panel over the page. The side panel is the same thing kept
> open beside it, following you as you browse — useful when you are working through a set of pages
> rather than converting one.
>
> **Signed out, it never talks to us at all.** Converting is done in the page, on your machine.
> With a free TransformPipe account you can also save a document and share it — as a link, or with
> the people you name — which is the only time anything leaves your browser.
>
> Open source: https://github.com/raudarlabs/transformpipe

### Why this paragraph is prose and not a list

Google rejected version 1.0.0 on 18 September 2026 under **Spam and Placement in the Store**,
quoting one sentence: *"Word documents, PDFs, spreadsheets, HTML, CSV, JSON, EPUB"*. The policy
words it as excessive keywords, and it was — a comma-separated run of formats written for a search
box rather than for a person.

It was also wrong. This extension has never converted a PDF and has never converted an EPUB; the
eleven conversions take `.md`, `.html`, `.txt`, `.csv`, `.tsv`, `.json`, `.docx`, `.xlsx`, `.pptx`
and the `.zip` from Notion, Confluence or Obsidian. Two of the seven formats in that list did not exist
here. Had a reviewer installed it and looked for the PDF option, the rejection would have been the
worse kind.

So: name formats in sentences, name only what `shared/conversions.ts` actually lists, and let "ten
conversions" carry the rest. `npm run store:check` enforces the second half of that.

## Single purpose

> Converting a web page or a local file into Markdown, and saving or sharing the result through the
> user's own TransformPipe account.

Everything in the extension serves that sentence. There is no second feature bolted on: the panel,
the side panel, the context menu and the viewer are four ways into the same conversion.

## The form, field by field

The submission form takes one box per permission, each capped at 1,000 characters. These are the
texts, written to be pasted as they stand — the prose underneath is the same argument at length,
for us rather than for the reviewer.

**Single purpose description**

> TransformPipe converts the web page you are on, or a file on your computer, into Markdown, and
> lets you save or share the result through your own TransformPipe account. Everything in the
> extension serves that one purpose: the toolbar panel, the side panel and the right-click menu are
> three ways into the same conversion, and the viewer tab is where a converted document is read and
> where local files are picked. The conversion runs in the browser; signed out, the extension makes
> no network request at all.

**activeTab**

> The conversion reads the page the user pressed the button on. activeTab grants that for exactly
> that tab, at that moment, and for nothing else — no other tab is ever read. It is what lets the
> extension work with no host permission at all: without it the toolbar button would have nothing
> to convert.

**scripting**

> Reading the page means running one function inside it: it returns the current selection if there
> is one, otherwise the document's HTML, plus the page's URL and title. It only reads and never
> writes to the page, and it is injected only in response to the user pressing the toolbar button,
> choosing a right-click menu item, or opening the side panel on that page.

**contextMenus**

> Two entries in the right-click menu: "Convert this page to Markdown" and "Convert selection to
> Markdown". They run the same conversion as the toolbar button, reached the way people expect to
> reach an action on a selection.

**storage**

> Three things, all of them the user's own: the OAuth token of whoever signed in, the chosen
> interface language and which surface the toolbar button opens, and — in chrome.storage.session,
> which is never written to disk — the converted document on its way from the popup to the tab that
> displays it. No browsing history and no page content are stored.

**sidePanel**

> The side panel is one of the extension's two surfaces: the same conversion kept open beside the
> page, so somebody working through a set of pages does not reopen a popup at each one. It converts
> the tab the user is looking at, and only once they have granted the optional host permission it
> asks for at the moment they turn it on.

**identity**

> Signing in to the user's own TransformPipe account. chrome.identity.launchWebAuthFlow opens our
> OAuth approval page and returns a token, which is what Save and Share spend. The alternative was
> asking people to copy an API key by hand, which is a worse experience and a worse credential. The
> extension never sees or stores a password, and the grant is revocable from the account page.

**Host permissions**

> `<all_urls>` is optional and requested only when the user turns the side panel on. The panel stays
> open while they browse and converts whatever tab they move to; activeTab is granted per click on
> the toolbar button and does not survive a tab switch, so a panel that follows the user cannot be
> built on it, and there is no narrower permission for "the tab in front of the open panel".
> Refusing it costs the side panel and nothing else — the whole toolbar-button path keeps working.
> `https://transformpipe.com/*` is optional too: it is where a document goes when the user presses
> Save or Share, and it is asked for when an account is connected rather than at install.

**Are you using remote code?** — **No.** Everything executable is in the package: no script is
fetched from a CDN or any other origin, no module is imported over the network, and the two
typefaces ship as .woff2 files. The extension's only network requests go to transformpipe.com,
after sign-in, to save or share a document — and those carry data, not code.

## Permission justifications

The same argument at length, and the reasoning behind each answer above.

**`activeTab`** — The conversion reads the page the user pressed the button on. `activeTab` grants
that for exactly that tab, at that moment, and for nothing else; it is why the extension can be
useful with no host permission at all.

**`scripting`** — Reading the page means running one function in it: `extract.ts`, which returns the
selection if there is one and otherwise the document's HTML and address. It reads and never writes,
and it is injected only in response to a click or to the side panel being opened.

**`contextMenus`** — Two entries on the right-click menu: convert the page, and convert the
selection. They are the same conversion the toolbar button runs, reached the way people expect to
reach it on a selection.

**`storage`** — Three things, all of them the user's own: the OAuth token for whoever signed in,
the chosen interface language and which surface the toolbar button opens, and — in
`chrome.storage.session`, which never touches the disk — the converted document on its way from the
panel to the tab that displays it.

**`sidePanel`** — The side panel is one of the two surfaces: the same conversion kept open beside
the page, so somebody working through a set of pages does not reopen a popup at each one.

**`identity`** — Signing in. `launchWebAuthFlow` opens the product's own OAuth approval page and
returns a token; the alternative was asking people to paste an API key, which is a worse experience
and a worse credential. No password is seen or stored by the extension.

**Host permission `https://transformpipe.com/*` (optional)** — Where a saved document goes. It is
requested at the moment somebody connects an account, not at install: until there is a token the
extension has no reason to talk to the service at all, and an origin in the install dialog reads
the same whether it is ever used or not.

**Host permission `<all_urls>` (optional)** — Asked for only when the user turns on the side panel,
and refusable: the panel then explains what it is for and does nothing else.

The reason it is needed, and the reason it is optional: the side panel stays open while the user
browses and converts whatever tab they move to. `activeTab` is granted per click on the toolbar
button and does not survive a tab switch, so a panel that follows the user cannot be built on it —
there is no narrower permission that expresses "the tab in front of the open panel". The whole of
the popup path works without it, and the extension is fully useful with it refused.

## Remote code

None. Everything is bundled: the two typefaces are in the package as `.woff2` files, and nothing is
fetched from a CDN, `eval`ed or loaded as a remote script. The only network requests the extension
ever makes go to `transformpipe.com`, after sign-in, to save or share a document.

## Data the extension handles

What the form's checkboxes should say, and what backs each answer:

| Category | Collected | Why |
| --- | --- | --- |
| Personally identifiable information | Yes — email address | Only after sign-in, and only as the account identity. Shown in the panel so a person with two accounts can see which one they are saving to. |
| Health, financial, location, personal communications | No | — |
| Authentication information | Yes — an OAuth token | Kept in the browser's extension storage. Revocable on the account page. No password is handled. |
| Web history | No | No record is kept of which pages were converted, in the extension or on the server. |
| User activity | No | No analytics, no telemetry, no click tracking of any kind in the extension. |
| Website content | Yes — the page being converted | Read in the page, converted in the page. It is sent to TransformPipe only when the user presses Save or Share, and then it is one document, deliberately. |

The three certifications the form ends with are all true: the data is not sold, it is not used for
anything unrelated to the single purpose above, and it is not used to determine creditworthiness.

## The pictures

All of them are `npm run ext:art`, drawn from the extension's own interface rather than mocked up,
and all of them come out at the exact size and without an alpha channel, which is what the form
measures. What goes in each box:

| The form asks for | The file |
| --- | --- |
| Store icon, 128×128 | `store-icon-128.png` |
| Screenshots, 1280×800 | `1-…` to `5-…`, in that order |
| Small promo tile, 440×280 | `tile-440x280.png` |
| Marquee promo tile, 1400×560 | `marquee-1400x560.png` |

Leave the promo video empty; there is no video, and a box left blank is better than a link to
something made to fill it.

The screenshots' captions are part of the picture:

1. **The page you are on, as Markdown** — the panel over a documentation page.
2. **Read it beside the page** — the side panel, following a tab.
3. **Save the page as it looks, or as text** — the HTML menu open.
4. **Ten formats, converted in your browser** — the viewer with a `.docx` open.
5. **Share a link, or name the people** — the share dialog.

Both tiles carry the same sentence as the front page. The marquee has the panel itself beside it,
because it is the one asset with room for a picture — the store shows it only when it features an
extension, which is not something to plan for but is cheap to have ready.

## Firefox

The same source tree, built again: `npm run ext:firefox` into `dist-extension-firefox/`, packed by
`npm run ext:zip:firefox`. Three keys of the manifest differ and one file behind them —
`extension/lib/panel.ts`, where Chrome's side panel and Firefox's sidebar become the same two verbs:

| | Chrome | Firefox |
| --- | --- | --- |
| The panel | `side_panel`, and a `sidePanel` permission | `sidebar_action`, no permission |
| Opening it | `chrome.sidePanel.open()` | `browser.sidebarAction.open()`, from a click |
| The toolbar button | a behaviour flag decides popup or panel | an empty popup, and `action.onClicked` opens the sidebar |
| The worker | a service worker | the same file as an event page |
| The floor | `minimum_chrome_version` 114 | `strict_min_version` 140 |

140 rather than the release the sidebar arrived in, because AMO requires
`data_collection_permissions` of a new add-on and that key is 140 (142 on Android). What it
declares is what the privacy page says: nothing required — signed out the extension sends nothing
anywhere — and three optional, which sign-in makes possible: the account's address, the token
behind it, and the document you press Save on.

`npx web-ext lint` on the package: **no errors**, and fourteen warnings in two families, both in the
bundled converters rather than in code of ours:

- **`DANGEROUS_EVAL`, nine of them** — the `Function` constructor, in the chunk that reads Word
  documents: `mammoth` depends on `bluebird`, which builds functions from strings when it is
  allowed to and falls back when it is not. Worth saying out loud to a reviewer, because Chrome's
  Manifest V3 bans exactly that on an extension page: a `.docx` was converted in the built viewer
  served under `script-src 'self'; object-src 'self'` — the headings, the table and the list all
  came out right — so the fallback is the path that actually runs.
- **`UNSAFE_VAR_ASSIGNMENT`, five** — assignments to `innerHTML`. This is a converter: rendering a
  preview of the Markdown it just produced is the product. Everything rendered goes through
  `DOMPurify` first (`shared/from-html.ts`, `src/lib/markdown.ts`), and the pages are served under
  the CSP above, so a script that survived the sanitiser still could not run.

## When a version is submitted

The manifest's version is `package.json`'s, so a resubmission is a release: bump, tag, changelog
entry, `npm run ext:zip`, upload. A review takes days that nobody controls, so the week that
submits is never the week that has nothing else in it.

### What has been submitted, and what the numbers mean

One number for the whole product, which is why the extension's versions look like they skip. The
repository was already at v2.0.0 when `package.json` still said 1.0.0, so the manifest — which
reads that file — would have shipped every release as 1.0.0 forever. The trade is a jump that
looks like more than it is; the alternative was two numbering schemes and a conversation about
which one a bug report means.

| | |
| --- | --- |
| **Chrome Web Store** | 1.0.0 rejected 18 September, listing rewritten, and the store shows **1.0.0 published on 21 September**. 2.0.0 was built but never went to Chrome |
| **Firefox Add-ons** | 2.0.0 submitted 19 September, with the source archive and `BUILD.md` |

So the next Chrome package is the first the store will have seen since the rename, and it is
**2.1.0** — a version above anything either store holds, which is the only rule about the number
that a store actually enforces.

**What is in it that 1.0.0 does not have** is most of a fortnight, and almost all of it reaches
the extension through `shared/`: diagrams drawn rather than printed, formulas typeset, code
coloured, six more pieces of Markdown syntax understood, PowerPoint as an eleventh conversion,
the pictures inside an export carried into the document, and a document check. From the
extension's own side: it reads what the screen shows rather than what the markup claims —
hidden routes, shadow DOM, typed form values, preformatted blocks kept preformatted, a side
panel that follows a route change rather than only a page load, and a fail-safe that refuses to
hand back an emptied page.
