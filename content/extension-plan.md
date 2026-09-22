# The browser extension, planned

Two weeks of the roadmap's first month, designed before it is built. The question this document
answers is not "what could an extension do" — it is "what is the smallest thing worth installing,
built out of parts this repository already has, that does not become a second product to maintain".

## What it is

Two ways in, one thing out.

**The page you are looking at, as Markdown, in one click.** Press the toolbar button and the
extension reads the rendered page, converts it here in the browser, and hands back Markdown: copy
it, download it, or — signed in — save it to the account and get a link.

**A file on your machine, converted without going to the site.** The same button opens a file
picker; pick one of the ten formats the app accepts and it opens converted, in a new tab, rendered.
Nothing is uploaded and nothing needs a network — every one of those conversions already runs in
the browser, which is the promise the front page makes and the reason this costs days rather than
weeks.

That is the whole of version one. Not a second converter, not a second account system, not a
mini-app in a popup: the app's own conversion, running where the file already is.

### Why that is worth two weeks

The converter waits to be visited. Everything people convert has to be a file first — which means
saving a page, exporting a space, downloading an attachment. The extension removes that step for
the one source nobody can export cleanly: a page that only exists rendered.

Three things fall out of it, and the third is the one that matters commercially:

- **Documentation and articles.** A page of docs becomes a Markdown file without a save dialog.
- **Anything behind a login.** The extension reads what the browser already has on screen, so a
  page only you can see converts without anybody handing us a credential.
- **Confluence, Jira and Notion, with no administrator.** This is the question that has been open
  since the Jira conversation: their export needs admin access, their API needs a token, and the
  push-from-Jira guide needs somebody to set up an automation rule. Reading the rendered page needs
  none of it and works the same on Cloud and on Server.

## What it reuses, and the rule that keeps it honest

**The extension lives in this repository, as another entry point, not in a repository of its own.**
That is the whole maintenance strategy: a change to the converter is a change to the extension on
the next build, because they are the same file.

| It needs | It imports | Not |
| --- | --- | --- |
| HTML → Markdown | `shared/from-html.ts` | a second converter tuned for pages |
| The other nine conversions | `src/lib/convert.ts`, which loads each behind `import()` | a shorter list of formats in the extension than on the site |
| Chaining several files into one | `src/lib/merge.ts` | dropping the behaviour people already know |
| The preview, and the counts under it | `src/components/DocumentPreview.tsx`, `getDocStats` | a second renderer for the same Markdown |
| Downloading as .md, .html or .txt | `src/lib/download.ts` | three more `Blob` calls |
| The size limit, the extension list | `shared/limits.ts`, `shared/conversions.ts` | numbers typed twice |
| Buttons, the switch, the toast | `src/ui/components/*` | a popup built from raw HTML |
| Colours, spacing, the dark theme | `src/ui/globals.css` + the Tailwind preset | a second palette that drifts |
| Its words, in five languages | `src/lib/i18n/messages/*` | English-only, or a second catalogue |
| Saving and sharing | the public API, `POST /api/v1/documents` | a private endpoint made for it |
| The icon | `brand/mark.svg` via `npm run icons` | a hand-exported PNG set |

One new file in `shared/` comes out of this, and it is the interesting one:

**`shared/from-page.ts`** — HTML plus the address it came from, in; Markdown out. It is what stands
between a rendered page and `htmlToMarkdown`: pick the article out of the furniture, make every
link and image address absolute so the Markdown still works somewhere else, and drop the parts that
are not the document (navigation, cookie banners, comment widgets). It belongs in `shared/` rather
than in the extension because the app wants it too — "paste a page's HTML" and, later, rendering a
URL are the same problem — and because a converter that only exists inside an extension is a
converter nobody tests.

The one dependency this adds is **`@mozilla/readability`**, the library Firefox's reader mode is
built on. It is the difference between a clipper and a mess: without it, a documentation page
arrives with its sidebar, its footer and its cookie notice in the Markdown. It is small, it has no
dependencies of its own, and it runs against a DOM — which an extension has, being in a page.

## How it works, concretely

**Manifest V3, and two permissions:** `activeTab` and `scripting`. No host permissions, no
"read your data on all websites" — the extension can only touch the tab whose toolbar button you
just pressed, which is both the honest permission set and the one that clears a store review
quickly. `storage` joins them in week two, for the key.

**Two surfaces, and the second is a page of its own.** The popup is a launcher: it converts the
current page and shows the result small. Anything worth reading opens in the **viewer** — a page
inside the extension (`chrome-extension://…/viewer.html`) with the preview and source tabs, the
counts, the download buttons and, with a key, Save and Share. It is where a picked file lands, and
it is what the popup's "Open in a tab" opens.

The viewer owns the file picker rather than the popup, deliberately: a popup closes the moment a
tab opens in front of it, and a `File` cannot be handed from one page to another. So "Open files…"
opens the viewer and the viewer asks for the files — the bytes are read once, in the page that
shows them, and never move.

The flow, in full:

1. You press the button, or right-click a selection and choose **Convert to Markdown**.
2. The popup asks the background worker to run a small function in that tab: it takes the selection
   if there is one, otherwise the whole document, and sends back HTML and the page's URL and title.
3. `shared/from-page.ts` turns that into Markdown, in the popup. Nothing has left the browser.
4. The popup shows it: the rendered preview and the Markdown source, the same two tabs the
   converter has, at the same word and byte counts (`getDocStats`).
5. Buttons: **Copy**, **Download .md**, **Open in a tab**, and — with a key saved — **Save** and
   **Share**, which `POST` to `/api/v1/documents` and put the link on the clipboard.

A picked file takes the same path from step 3 on: `conversionForFiles` decides which conversion a
`.docx`, a `.zip` or a `.xlsx` is, `convertFile` runs it, several files chain into one document in
the order they were picked, and the viewer shows what came out. The handoff between the popup and
the viewer, where there is one, goes through `chrome.storage.session` — memory that is gone when
the browser closes, so a converted document is never written to disk on the way to being shown.

Signed out, it is a converter that never talks to us at all, network or no network. That is the
promise the front page already makes, and it is the line the store listing should lead with: *ten
formats, converted in your browser, offline.*

### The account, in week two

An API key, pasted once into the options page and kept in `chrome.storage.local` — the same shape
the command line uses (`~/.config/tp/config.json`) and the same key, so one credential covers both.
No OAuth, no session cookie borrowed across origins: the public API already takes a Bearer key, and
a key is revocable from the account page, which a cookie is not.

`POST /api/v1/documents?name=<title>.md&share=link` returns the document and its link in one call.
The extension does not need a second endpoint, and nothing about the API changes for it.

## Two weeks, split

**Week one — the converter.** The extension folder, the build, the popup, the extraction, the
context menu, the viewer page with the file picker, copy and download, and `shared/from-page.ts`
with its tests. At the end of it the thing is installable from a folder and genuinely useful, and
the Chrome listing goes in for review.

The file half is days rather than a week precisely because none of it is new: `convert.ts` already
dispatches the ten conversions and already loads each behind `import()`, so the viewer downloads a
Word reader only when somebody opens a `.docx`.

**Week two — the account and the shelf.** Options page and key storage, Save and Share, the
five-language catalogue wired in, the Firefox packaging (same code, a different manifest key), the
store assets out of `brand/`, and the page on this site that tells people it exists.

## What version one does not do

Each of these is a real idea and each would double the surface:

- **Convert every tab / a whole site.** A crawler with an icon. Different product, different review.
- **Edit before saving.** The popup is not an editor; the app is, and the link goes there.
- **Auto-detect Confluence and rewrite its macros.** Tempting, and it is a per-vendor maintenance
  contract. `from-page.ts` stays vendor-neutral until a real page proves it has to know better.
- **Sync or a background queue.** A button you pressed is a request you are watching; failures show
  in the popup rather than in a retry system nobody can see.

## How it stays cheap to keep

- One repository, one `npm run check-types`, one lint, one design system. The extension has no
  build of its own beyond a second Vite config and no styles of its own.
- The manifest's version number comes from `package.json`, so a release is a tag and a zip.
- Nothing in the extension talks to a private endpoint, so the app's internal API stays free to
  change.
- A store review is somebody else's schedule, so the week that submits is never the week that has
  nothing else in it.


---

## Where it stands, 17 September 2026

**Week one is built and works.** `npm run ext` produces `dist-extension/`, which loads unpacked from
`chrome://extensions`. What exists:

- `extension/popup.tsx` — converts the page it was opened over straight away; copy, download `.md`,
  open in a tab, open files.
- `extension/viewer.tsx` — the tab: preview and source, the counts, the picker, all ten conversions
  through `src/lib/convert.ts`, several files chained through `merge.ts`.
- `extension/background.ts` — two context-menu entries; the worker has no DOM, so it hands the raw
  page to the viewer and the viewer converts.
- `extension/extract.ts` — the only code that runs in somebody's page. Selection if there is one,
  otherwise the document. Reads, never writes.
- `shared/from-page.ts` — Readability picks the article, every address is made absolute, the title
  becomes an `#` heading. Verified on a real article: navigation and footer gone, `/docs/install`
  became `https://example.com/docs/install`.
- `vite.extension.config.ts` — second build, same source tree; the manifest is generated so its
  version is this repository's, and the icons come from `brand/mark.svg`.
- Ten new strings in all five catalogues, plus the sentence Chrome's own pages get: an extension
  cannot read `chrome://extensions`, and saying so is better than "this page cannot be read" on the
  first page anybody sees after installing.

**Also done:** the side panel — the same surface, kept open beside the page, subscribed to the
tabs so it follows somebody browsing; the settings page switches which one the toolbar button
opens. And saving HTML now asks which HTML was meant: the page with its own structure and its
pictures carried inside the file, or the converted text as the site writes it.

**Done since:** both surfaces offer the self-contained `.html` as well as the `.md` — the same
`downloadDoc` the site uses, styles inline and no requests — and the icons sit beside their labels
again. That last one was not a stylesheet problem at all: `Button` takes its icon as `leftSlot` and
wraps `children` in an inline-block span, so an icon passed as a child was a block element inside
that span and went on its own line. The site's own call sites had it right; the extension's were
new code written against a guess.

## Week two, in order

1. ~~Save as HTML~~, ~~the icon alignment~~ and ~~the account~~ — done. The account is an API key
   pasted into the options page, checked against `GET /api/v1/usage` before it is kept, stored in
   `chrome.storage.local`, and spent on `POST /api/v1/documents?share=link`. Reaching
   transformpipe.com is an *optional* host permission requested at the moment somebody connects:
   until a key exists this extension has no reason to talk to us at all, and an origin in the
   install dialog reads the same whether it is used or not.
2. ~~**Firefox**~~ — done, and it cost less than the estimate here feared. `npm run ext:firefox`
   builds the same source tree into `dist-extension-firefox/` (`--mode firefox`, a flag Vite
   already has), and the differences are three manifest keys and `extension/lib/panel.ts`, where
   Chrome's `sidePanel` and Firefox's `sidebarAction` become the same two verbs. `web-ext lint`
   passes with no errors; the warnings and what they are is in `content/extension-store.md`.

   One thing the estimate did not know: AMO now requires `data_collection_permissions`, which
   raises the floor to Firefox 140 — so the manifest declares nothing required and three optional,
   which is the same sentence the privacy page makes.
3. ~~**The store**~~ — done, and it is `content/extension-store.md`: the listing text, the single
   purpose, a justification per permission (the interesting one is `<all_urls>`, which the side
   panel needs and nothing else does), the data answers, and what to tick on the form. Beside it:

   - `npm run ext:art` draws the five 1280×800 screenshots and the 440×280 tile from the
     extension's own interface — a stubbed `chrome` object, a sample page, and the real panel. A
     change to the design is in the assets on the next run rather than in a file somebody has to
     remember to redraw.
   - `npm run ext:zip` builds and packs, refusing a package with a missing icon or a `default_locale`
     with no catalogue behind it.
   - `/extension` on this site says what it is and what it never does, in five languages, and it
     ends on a button per store — `EXTENSION_STORES` in `src/lib/pages.ts`, where a store with no
     address yet has `null` and no button.
   - The privacy page has a section of its own about the extension — what is read, what is kept,
     and the two storages it uses. Chrome requires it and it was the honest thing anyway.
   - The manifest now carries `minimum_chrome_version` (114, for the side panel), `homepage_url`,
     icons drawn at 16, 32, 48, 128 and 512, and `_locales` for the five languages, so the name and
     the description in the store are not English for four of the five readers.
