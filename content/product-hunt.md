# Product Hunt launch — Wednesday 30 September 2026

Prelaunch page: https://www.producthunt.com/products/transformpipe/transformpipe/prelaunch

Everything below is the copy to paste into the launch form, in the order the form asks for it,
plus the maker's first comment, the gallery, and answers ready for the questions that will come.
Every claim in it is something the product does today — nothing here is "coming soon" except
what says so.

---

## Name

TransformPipe

## Tagline (max 60 characters)

Pick one. The first is the recommendation.

1. `Save and share what Claude writes, as a real page` — 49
2. `Any document to Markdown, and anything Claude writes, kept` — 58
3. `15 conversions in your browser, and a Claude connector` — 54

Why the first: the converter is what people find through search; the connector is what nothing
else on Product Hunt does. A tagline has room for one idea, and the new one is the one worth the
launch.

## Link

https://transformpipe.com/agents

Product Hunt appends `?ref=producthunt` itself, and the site already counts `ref` as the campaign,
so launch traffic is measurable without anybody accepting cookies.

## Description (max 260 characters)

> TransformPipe keeps what your AI assistant writes. Connect it to Claude in one click and every
> spec, summary or release note lands in your account: versioned, searchable, shareable as a
> finished page. Plus 15 conversions to and from Markdown, in your browser.

(259 characters)

## Topics (up to three)

Artificial Intelligence · Productivity · Developer Tools

## Pricing

Free

## Links to add

- Website: https://transformpipe.com
- Claude connector: https://claude.ai/directory/tp
- Chrome extension: https://chromewebstore.google.com/detail/aojjdmbhoajckgkacbeobkkkpdckndmi
- Firefox add-on: https://addons.mozilla.org/firefox/addon/transformpipe/
- GitHub: https://github.com/raudarlabs/transformpipe

---

## Gallery (1270 × 760, in this order)

Drawn by `node scripts/ph-art.mjs` from production into `brand/producthunt/`, at twice the size
so they stay sharp. Upload in this order:

1. `01-the-pipe.png` — What your assistant writes, kept
2. `02-one-click-in-claude.png` — One click in Claude
3. `03-ask-in-plain-words.png` — Ask in plain words
4. `04-markdown-to-a-page.png` — Markdown in, a finished page out
5. `05-fifteen-conversions.png` — Fifteen conversions, in your browser
6. `06-any-file-to-markdown.png` — Any file to clean Markdown
7. `07-live-preview.png` — Write Markdown, see the page
8. `08-your-account.png` — Your documents, your account
9. `09-one-library.png` — One library, not forty chats
10. `10-the-extension.png` — Any web page, as Markdown

The first one is the thumbnail people see in the feed, so it carries the idea on its own.

A 30–60 second video beats a sixth screenshot if there is time: open Claude, "save this as the
Q3 plan", open transformpipe.com on a phone, it is there.

---

## Maker's first comment

> Hi Product Hunt 👋 I'm Vic, and I built TransformPipe.
>
> It started with a small moment. I needed a document Claude had written for me a few weeks
> earlier, and instead of scrolling through dozens of chats I opened my TransformPipe account —
> because I had saved it there to read later. That was the product, and I had been describing it
> as a file converter.
>
> **What it does:**
>
> 🔌 **A Claude connector.** It's listed in Claude's connector directory, so connecting is one
> click and a Google sign-in. Then just ask: "save this", "publish it and give me the link",
> "find the migration spec from last week". It works on claude.ai, Claude Desktop and Claude Code.
>
> 📚 **A library, not a chat log.** Everything your assistant saves sits in one searchable list,
> whichever conversation it came from. Rewrites are kept as versions, so nothing is overwritten.
>
> 🔗 **A page, not a paste.** Share a document as a finished page, not Markdown full of asterisks,
> with anyone who has the link or only the addresses you name. Revoke it any time.
>
> 🔄 **15 conversions.** Word, PowerPoint, Excel, EPUB, ODT, RTF, HTML, CSV, JSON, plain text,
> and Evernote, Notion, Confluence and Obsidian exports into Markdown, plus Markdown into a
> finished HTML page. They run in your browser, and the file is never uploaded.
>
> **Also:** a Chrome/Firefox extension that turns any page into Markdown, a REST API, a CLI and a
> GitHub Action. The code is open source (MIT).
>
> It's free. ChatGPT, Cursor, Gemini CLI and VS Code are being tested next.
>
> I'd love to hear two things: what you'd ask your assistant to keep, and which assistant you
> want connected next. I'll be here all day.

---

## Answers ready for the comments

**Why not just use Claude's artifacts?**
An artifact is great while the conversation is open. It lives in that conversation, though, and
doesn't exist for documents another assistant wrote. Here the document is yours: in one list with
everything else, versioned, and readable on a phone by someone who has never used Claude.

**Do you read my documents or train on them?**
No. We don't read them and we don't train anything on them. Converting a file happens in your
browser. A document reaches the server only when you or your assistant save or share it.

**What can the assistant do in my account?**
It can save, list, open, summarise, share and version *your* documents. It can't change the
account, see your password, create API keys, or reach anyone else's documents. It deletes only
with explicit confirmation. A grant can also be read-only, enforced on the credential itself.

**When will ChatGPT / Cursor work?**
They're being tested now. ChatGPT connects through developer mode. Cursor needs one change on
our side to how its sign-in returns to the editor. Each gets its own page once the full sign-in
has been seen working. Until then, any MCP client that supports remote servers with OAuth can
take `https://transformpipe.com/api/mcp`.

**How is this different from Pandoc / MarkItDown?**
Those are excellent tools you install and script. This is the no-install, in-browser version for
one document at a time, plus the part they don't do: keeping and sharing what an assistant wrote.
The blog compares them honestly: https://transformpipe.com/blog/what-is-pandoc

**Limits?**
500 documents and 100 MB per account, 4 MB per document, 10 MB per conversion. When a limit is
reached the save is refused. Nothing is ever deleted to make room.

**Is it open source?**
Yes, MIT: https://github.com/raudarlabs/transformpipe

---

## Launch day

- 00:01 PT: the post goes live. The first comment above is posted immediately.
- Share the link in the first hour, with no "upvote" wording (Product Hunt penalises it):
  "We're live on Product Hunt today — TransformPipe keeps what Claude writes. Would love your
  feedback: <link>"
- Reply to every comment within the hour, all day.
- Watch `ref=producthunt` in the first-party counts: visits, `/agents` views, the Claude button.
