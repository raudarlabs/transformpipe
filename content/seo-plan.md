# SEO plan, November 2026 – April 2027

Written 21 October 2026 from Search Console and GA4 as of 19–20 October, a crawl of the live site,
the prerendered `dist/` build of 16 October, and a read of the competition. The numbers behind it are
in `content/gsc/2026-10-21.md`. This file follows on from `content-plan.md` and does not replace it.
That file is the record of what was tried in September. This one says what comes next and why.

---

## Where the site stands

| | Now | Source |
| --- | --- | --- |
| Clicks, 3 months | 51 (21 in the last 14 days) | GSC |
| Impressions, 3 months | 7.57K (2.05K in the last 14 days, down from 2.52K in the first 14) | GSC |
| CTR / average position | 0.7% / 15.3 | GSC |
| URLs in the sitemap | 835 (167 × 5 languages) | sitemap |
| Indexed / not indexed | 529 / 281 | GSC, 12 Oct |
| External links / linking sites | 25 / about 5 (github.com, obsidian.md, obsidianstats.com, raudar.dev) | GSC |
| Organic sessions GA can see | 26 (GSC counts 51 clicks) | GA4 |
| Key events in GA4 | 0 | GA4 |

The site has plenty of content: 350 articles averaging about 5,000 words. It does not have
authority, its commercial pages are thin, and Google spends its crawl on the wrong pages. Writing
more articles changes none of these three.

### Five findings that decide the plan

**1. The retitle test failed, and the developer cluster gets no more investment.**
The five pages retitled on 22 September went from about 1,250 impressions (9–22 Sep) to about 80
(6–19 Oct), with one click before and one after. The new titles gave up the spec-lookup queries and
gained nothing in return. `content-plan.md` said Wave 1 would be cut in half if CTR did not move.
It did not move, so Wave 1 is cut entirely. Reverting the titles is not worth doing either, because
those impressions never produced a click under either title.

**2. Google is not indexing the most commercial page, and the crawl goes to the changelog.**
258 pages are "Discovered – currently not indexed" (GSC report of 12 Oct). **173 of them are
changelog entry pages**: 29 English and 144 de/fr/es/it. The sitemap lists 235 entry pages, which is
47 entries × 5 languages; 37 of the 47 have real translations and 10 serve English under a /de, /fr,
/es or /it address. Stuck in the same queue: `/word-to-markdown`, `/rtf-to-markdown`,
`/evernote-to-markdown`, `/agents`, `/agents/claude` and `/agents/chatgpt`. Half of the visible
examples of "Crawled – not indexed" (19) are localized conversion pages such as
`es/excel-to-markdown` and `es/powerpoint-to-markdown`. Google read them and judged them thin.

**3. The conversion pages are near-duplicate stubs.**
Each has 40–66 words of its own and roughly 180 words of shared sibling links and footer. Pages
overlap by 0.37 on average (5-word shingles). The visible text carries a literal `{limit}`
(`scripts/prerender.ts:856`). The competitors that rank are single-purpose pages with the converter
above the fold and a few hundred words written specifically about that one conversion. The pages
rank accordingly: `/html-to-markdown` at 71, `/excel-to-markdown` 62, `/confluence-to-markdown` 77,
`/json-to-markdown` 74 and the home page 51.

**4. Authority is the ceiling.**
About five sites link here. The site is not listed on AlternativeTo, SaaSHub, Glama, mcp.so,
PulseMCP, Smithery or any of the awesome-lists. The GitHub repo has 2 stars, no topics, and an
About link that points to `md-2-html.vercel.app`. A bare search for "transformpipe" returns no
TransformPipe results at all. Commercial queries at positions 60–90 are limited by authority, not
by content.

**5. Nothing measures whether search turns into use.**
GA4 has consent denied by default, so it sees only the visitors who accept the banner (about half
of what GSC shows). It records only automatic events. Whether a search visitor converted a file,
signed up or connected an assistant cannot be answered today.

### Where the demand already is (GSC, 448 queries)

- **Confluence, in both directions:** about 20 queries and roughly 200 impressions at positions
  20–78. Examples: *confluence to markdown converter* (pos 20.6), *html to confluence converter
  plugin*, *markdown to confluence converter online*, *confluence paste markdown*, *import markdown
  to confluence*, *confluence markdown table*. This is the biggest commercial cluster, and no
  online tool dominates it.
- **Pandoc:** *pandoc alternatives* is at position 5.7 and is the only query that brings repeated
  clicks. Also *pandoc*, *what is pandoc*, *markitdown vs pandoc* (46 impressions, position 44).
- **PowerPoint, in both directions:** *ppt to markdown* (pos 12), *markdown to powerpoint converter*
  (15), *markdown to powerpoint* (23). The site has one 2,247-word article and no
  Markdown → PowerPoint feature, and still reaches page 2, which suggests the competition is weak.
- **"How to open an X file" in es/fr/it/de:** over 100 small queries about ODT, RTF, PPTX, DOCX and
  MD (*cómo abrir un archivo odt*, *rtf datei öffnen*, *come aprire file odt*). The localized
  `/how-to/open-*` pages rank 11–60 on 270–400 words. This is broad consumer demand, and the
  translations win it.
- **Markdown → HTML:** *md to html converter* (14), *markdown to html* (7.2, few impressions). The
  home page's head term barely shows yet.

---

## The plan

Six months in four phases, which overlap. Each item is sized in days of work so it can sit next to
`ROADMAP.md` without pretending to be free.

### Phase 0 — Stop the leaks (weeks 1–2, about 4 days)

**Status, 21 October 2026.**

Shipped:
- the changelog noindex (`QUIET_ENTRIES`, `entryIndexedIn`; sitemap 835 → 678)
- `{limit}`
- the `/how-to/:page` rewrite removed
- cache headers for hashed assets and fonts
- `/open-folder/` blocked in robots
- one Organization with `sameAs`
- article titles without the suffix
- GA4 events (`convert`, `download`, `save`, `share`)
- a "From search engines" card on `/admin` with landing pages

The first-party counter already existed (`/api/tally`, `shared/usage.ts`). Item 8 needed only the
card, so the privacy page does not change.

Left on purpose:
- `trailingSlash` and deleting the conversion rewrites: they cannot be tested before production,
  and there is little to gain.
- `app.css` hashing: its fixed name is deliberate, so that old session recordings keep their
  styles (`vite.config.ts`, commit 3b7bae8). The cache rule excludes it, as that comment asks.
- A `sign_up` event: it needs a new counter event in `shared/usage.ts`, which another change is
  editing right now.

Owner's steps:
- mark the four events as key events in GA4
- request indexing (item 5)
- add the site to Bing Webmaster Tools

These are mostly fixes to the prerenderer, `changelog.ts` and `vercel.json`. They do more for the
site than anything else in this plan.

1. **Take the changelog out of the index.** ⚠ This reverses the owner's 30 September decision,
   so it needs a yes first. The evidence is above: 173 of 258 unindexed pages are changelog
   entries, and they hold up the conversion pages.
   - Serve `noindex, follow` on every de/fr/es/it changelog entry page unless it has a real
     translated `detail`. Take those pages out of the sitemap and the hreflang sets. *(tech M2)*
   - In English, noindex the entries that compete with a tool page or an article:
     - the connector group: `connector-oauth`, `connector-consent-page`,
       `assistant-connector-cards`, `connector-identity`, `client-id-metadata`
     - `pictures-survive-an-export`, `ai-summary`, `paste-and-live-preview`, `browser-extension`,
       `browser-extension-in-both-stores`, `syntax-highlighting`, `shared-document-provenance`,
       `folders-and-exports-as-pages`
     - the off-topic set: `deploy-checks`, `email-deliverability`, `cookie-consent`, `new-logo`,
       `not-found-page`, `support-page`, `the-changelog`, `five-languages`, `blog-in-german`,
       `blog-in-french`, `share-notice-limits`, `public-links-need-a-confirmed-address`
   - Keep an entry indexed only when it is the sole page for a feature: password links, view
     counts, folders, versions. Phase 1 gives those features real pages, and then the entries go
     too.
   - All 25 slugs listed above are in today's sitemap. The noindex applies in all five languages,
     because 37 of the 47 entries have real translations and the language rule alone removes only
     40 pages. This takes 47 entries down to 22, and the sitemap from 835 URLs to about 680.
2. **Fix `{limit}`** on all 95 conversion pages (`prerender.ts:856`; the value is in
   `Dropzone.tsx:111`).
3. **Stop serving the home page for addresses that should not exist.**
   - Remove the `/how-to/:page` rewrite so an unknown guide returns 404.
   - Serve `/history`, `/open/*`, `/open-folder/*` and `/embed` as a bare app shell with
     `noindex`.
   - Delete the 20 per-conversion rewrites, which do nothing (the static files are served first).
   - Set `"trailingSlash": false`. *(tech M3, Low)*
4. **Cache static files:** `/assets/*`, fonts and `/og/*` get
   `public, max-age=31536000, immutable`, and `app.css` gets a hashed filename. *(tech H4)*
5. **Request indexing by hand:** after the deploy, run URL Inspection → Request indexing in GSC for
   `/word-to-markdown`, `/rtf-to-markdown`, `/evernote-to-markdown`, `/agents`, `/agents/claude` and
   `/agents/chatgpt`. This is the owner's job, since it needs the Google account. Resubmit the
   sitemap.
6. **Make the brand one entity.**
   - Use one `Organization` with an `@id` everywhere ("TransformPipe", published by Raudar Labs),
     with a `logo` and `sameAs` pointing to GitHub, X, the Chrome Web Store, Firefox Add-ons, the
     Obsidian plugin page and the Claude directory.
   - Articles reference it by `@id`.
   - Fix the GitHub About link to point at transformpipe.com, and add the topics `markdown`,
     `converter`, `mcp`, `docx-to-markdown` and `obsidian`.
7. **Titles:** drop " — TransformPipe" from article titles (66 of 70 are over 60 characters only
   because of the suffix). Set `updated:` whenever a title or a substantial part of the text
   changes.
8. **Measurement**, so the next review has data:
   - **GA4 events** through `dataLayer`, marked as key events: `convert_done` (with the
     conversion id), `download` (with the format), `save`, `share_link_created`, `sign_up`,
     `connector_click`.
   - **A first-party counter** that works without consent: on sign-up and on a document's first
     save, store the landing path and a referrer class (search, direct, referral, assistant) in
     the database, and show it on `/admin`. ⚠ The privacy page in five languages describes
     exactly what is collected, so it changes in the same commit.
   - Keep a GSC snapshot each month in `content/gsc/YYYY-MM-DD.md`, the same shape as the first.
   - Add the site to Bing Webmaster Tools (it imports from GSC in one step). Bing's index feeds
     ChatGPT search and Copilot, and the IndexNow item in Phase 2 needs it.

### Phase 1 — Make the commercial pages worth ranking (weeks 2–8, about 12 days)

**Status, 21 October 2026.**

Shipped:
- **Guides for every conversion** in `content/conversions/`, 20 conversions × 5 languages, held to
  their shape by `scripts/check-guides.mjs` in the build. Each one was checked claim by claim against
  the converter code, and most examples were run through the real converters. A conversion page
  now carries about 1,000 crawlable words, up from about 200 (40–66 of its own).
- **Articles about the format first** under each converter, instead of the six newest.
- **Four new pages:** `/share-markdown`, `/markdown-api` (`/api` is the serverless function's
  address), `/cli` and `/github-action`, in five languages, linked from both footers. About is in
  the crawled footer.
- **Main script** cut from 641 to 317 KB gzipped: the changelog, docs, assistant pages, history and
  shared pages load when they are opened.
- **Article links:** Markdown to Word links its tool page, the web-page article links the extension,
  the assistant article lists the current 19 tools and links `/agents/*`, and the VS Code article
  gains three inbound links.

Not done:
- `/markdown-to-pdf` needs a real PDF conversion first.
- `/markdown-viewer` is still to be built, by thickening live preview.
- The home head term change waits until about mid-November, as planned.
- Hydrating the prerendered markup: React would mismatch the hand-written HTML.
- The main script is still above the 200 KB target. The next cut is splitting the English catalogue
  (`pages.ts` is 116 KB).

**1. Give each conversion page its own 400–800 words.** *(tech H1, content §3)*
   - A template, filled with text specific to that conversion:
     - a short input → output example
     - what survives and what is lost, as a table
     - three steps
     - limits, with the real numbers
     - 4–6 questions only this conversion raises
     - the three articles about this conversion rather than the latest six
   - The how-to pages already contain half of this copy.
   - Order, set by GSC demand and how weak the competition is:
     1. Confluence → Markdown and Markdown → Confluence
     2. PowerPoint → Markdown
     3. HTML → Markdown
     4. Excel → Markdown
     5. Word → Markdown
     6. Notion → Markdown
     7. JSON, CSV
     8. Jira, Slack
     9. the rest
   - Translations follow the same day under the five-languages rule. Thin localized pages are
     exactly what Google refused to index, so the translations are part of the fix, not an extra.

**2. Landing pages for features that already exist but have no page.** Each is a tool or feature
page, not an article:

   | Page | Why |
   | --- | --- |
   | `/markdown-to-pdf` | High demand, and the address returns 404 today. The export and the API already exist |
   | `/share-markdown` | Password, expiry, view counts, named people. The competition is a handful of indie Show HN projects. This replaces the changelog-only pages |
   | `/api`, `/cli`, `/github-action` | These exist only as one sentence each inside `/docs`. They are link targets for developers and for the Marketplace |
   | `/markdown-viewer` (or `/markdown-live-preview` thickened) | High demand, saturated. Cheap because the tool exists |

**3. Decide what the home page is for.** It targets "Markdown to HTML", but the pitch, the
Product Hunt copy and the demand all point to converting documents into Markdown. Recommendation:
the home page becomes "Convert any document to Markdown" with the drop zone. "Markdown to HTML"
moves to its own `/markdown-to-html`, which would be the 21st conversion page. Don't do this until
Phase 0 has settled (about 4 weeks): changing the home page's head term while it is being
reindexed muddies both measurements.

**4. Performance, because tool pages are judged on Core Web Vitals.** The main script is 641 KB
gzipped and carries every converter's libraries.
   - Load mammoth, turndown, xlsx and the epub code with `import()` only when that converter runs.
   - Keep the prerendered markup on screen and hydrate it rather than replacing it.
   - Target: main script under 200 KB gzipped.
   - Measure with a PageSpeed API key; the audit could not, because the keyless quota is 0.
   *(tech H3, about 3 days)*

**5. Fix the internal links the audit found.**
   - The `markdown-to-word` article links `/markdown-to-word`.
   - `save-a-web-page-as-markdown` links `/extension`.
   - The assistant articles link `/agents/*`, and the "twelve tools" count becomes 18.
   - More articles link to `markdown-to-html-in-vs-code`, which has the best CTR on the site and 1
     inbound link.
   - About goes into the prerendered footer.

### Phase 2 — Earn authority (weeks 3–16, a few hours a week, always running)

This is the phase that moves positions 60–90, and it does not happen by accident. Aim for about two
real placements a week.

**Weeks 3–6: places that accept a listing.**
- **GitHub awesome lists:**
  - `mundimark/awesome-markdown` and `BubuAnabelas/awesome-markdown` (converters)
  - `kmaasrud/awesome-obsidian` (publishing)
  - `jaw9c/awesome-remote-mcp-servers` (the right list for a hosted OAuth connector)
  - `sdras/awesome-actions` (the Action)
- **Markdown Guide tool directory**, which is high-authority (contributed through
  `mattcone/markdown-guide` wiki).
- **MCP directories:** Glama, mcp.so, Smithery, PulseMCP, mcpservers.org. TransformPipe is in
  Claude's own directory, which almost no competitor can say, so these are an easy yes.
- **Software directories:** AlternativeTo (as an alternative to Dillinger, StackEdit, Typora,
  MarkItDown and mdtoword), SaaSHub, Peerlist, a free G2 listing, and the GitHub Marketplace
  listing for the Action (already waiting in `ROADMAP.md`).

**Weeks 6–10: launches.**
- **Show HN:** lead with "conversion runs in your browser, nothing is uploaded" plus the MCP
  connector. Similar launches (publishmarkdown, mdto.page) did well there.
- **Product Hunt:** if the 30 September launch has not happened yet, launch with the
  `/agents` copy in `content/product-hunt.md`.
- **Reddit:** posts that genuinely answer the question in r/ObsidianMD, r/Notion and r/ClaudeAI,
  plus the Obsidian forum's Share & showcase category.
- **A 60–90 second YouTube demo** of each of: Notion export → Markdown, Claude → saved page, and
  Confluence → Markdown. Google AI Overviews cite YouTube and Reddit heavily.

**Weeks 8–16: links that keep coming.**
- An "Open in TransformPipe" badge and button for READMEs and docs.
- The GitHub Action's Marketplace page, and a small `Rendered by TransformPipe` line on Action
  output.
- Answers on Atlassian Community threads about Markdown in Confluence, where the demand already
  is. Link only where the tool genuinely solves the question.
- `llms.txt` and IndexNow, which make Bing and the AI engines pick up changes faster.

Targets: 30+ linking sites by month 3 and 60+ by month 6. Count them from the GSC Links report in
each monthly snapshot.

### Phase 3 — Consolidate, then write where pages are bare (months 2–4, about 8 days)

**Merges and retargeting first** (301 redirects in `vercel.json`, decided once):
- `convert-markdown-to-html-online` → `markdown-to-html-converter`.
- `free-notion-…`, `free-confluence-…` and `free-obsidian-to-markdown-converter` → their
  `convert-*` articles. Or keep them strictly as "best free X converter" comparisons with the bare
  "X to markdown" phrase removed.
- `choosing-a-markdown-to-html-converter`: retarget to "how to test a Markdown converter", or fold
  it into `best-…`.
- `/how-to/open-md` and the `how-to-open-md-file` article are the same page. The article stays
  canonical, and the how-to becomes "open .md in the browser".
- Deduplicate the `keywords:` lists so each phrase has exactly one owner (content §2, groups G2,
  G4, G5 and G7).

**Then write, only where a conversion page has nothing behind it** (five languages each, under the
existing rule):
1. Markdown into Confluence: paste, import, tables and what breaks. Serves the largest cluster in
   GSC.
2. Markdown in Jira and Slack: the two syntaxes, and what a paste does to each.
3. Text to Markdown (`/text-to-markdown` is at position 103 with no article behind it).
4. ODT, RTF and Evernote → Markdown: one article per format, or one strong combined piece.
5. Markdown to PowerPoint, and PowerPoint to Markdown done properly. The current article is 2,247
   words, while the queries already rank 12–23.
6. MarkItDown vs Pandoc (*markitdown vs pandoc* gets 46 impressions at position 44). Lengthen
   `markitdown-alternatives` and `what-is-pandoc` past 1,300 words rather than adding a third
   article.

**Extend the localized "how to open X" pages** to 600–900 words each: no Office needed, phone and
desktop, and opening it in the browser with the converter. This is consumer demand that the
translations already win at positions 11–60, and every one of these pages leads straight into a
conversion.

**Stop:** new spec, syntax or library articles (finding 1), and new changelog entry pages with a
`slug` unless the feature has nowhere else to live.

### Phase 4 — New demand, built page first (months 3–6)

These are features where the landing page is half of the work, ordered by demand against cost:

| Item | Demand | Build | Note |
| --- | --- | --- | --- |
| ChatGPT / Claude answer → Word, PDF or a link | Medium–high | Very low | Paste an answer and get a .docx, a PDF or a page. Neither assistant has a native export, and this is the connector's own story |
| URL / web page → Markdown "for LLMs" | High, growing | Low | The extension and HTML converter already exist; needs a server fetch |
| Markdown table generator | Medium | Low | Reuses the CSV table code |
| PDF → Markdown | High | Medium | pdf.js text layer, in the browser |
| Markdown → PowerPoint | Low–medium, but already ranking 15–23 | Medium | The only queries the site wins on page 2 without content |
| **Code compare** (the next item in `ROADMAP.md`) | Very high ("diff checker", "compare text") | Already planned | Ship it with a `/compare` landing page in five languages from day one. It is a head term on its own |

---

## Targets and how they are checked

The baseline is the 14 days of 6–19 October: 21 clicks and 2.05K impressions, so roughly 45 clicks
a month. These targets are estimates for a site this young, not promises.

| By | Check | Target |
| --- | --- | --- |
| End of November | Indexing | Fewer than 40 URLs not indexed, excluding noindexed ones; every conversion page indexed in English |
| End of November | Measurement | GA4 key events live; the first-party landing-path counter on `/admin` |
| January | Linking sites | 30+ |
| January | Commercial positions | Confluence → Markdown, PowerPoint → Markdown and HTML → Markdown in the top 20 |
| January | Clicks | 150–250 a month |
| April | Linking sites | 60+ |
| April | Clicks | 300–800 a month, with at least 40% landing on conversion, tool or feature pages rather than articles |
| April | Activation | Sign-ups and first saves whose landing path came from search, counted on `/admin` |

**Review:** on the 20th of each month, snapshot GSC into `content/gsc/` and compare. Use 14-day
windows, because the site is too young for 28-day windows to mean anything. If the commercial
positions do not move by January while links are growing, the conversion pages are still the
problem. If neither moves, the links are not reaching the pages that need them.

---

## Decisions this plan needs from the owner

1. **Noindex the changelog** (Phase 0.1). This reverses 30 September with new evidence.
2. **Change the home page's head term** to "documents to Markdown", with Markdown → HTML on its own
   page (Phase 1.3).
3. **The first-party counter and the privacy-page wording** that comes with it (Phase 0.8).
4. **Who does the outreach** in Phase 2. It is a few hours a week of a person, not code.
