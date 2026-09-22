import type { Content } from '../../content';

/*
 * The words of the five pages that are only words: about, contact, and the legal three.
 *
 * `src/lib/pages.ts` keeps what a page *is* — its id, its address, and the date the legal three
 * state — and this file keeps what a page *says*. Same reason the split exists everywhere else in
 * here: a path is the same in five languages and a paragraph is not, so a translator who opens
 * this file cannot break a route by editing a sentence.
 *
 * Keyed by `StaticPageId`, so a page added to the union without its words stops the build instead
 * of rendering a blank screen. Plain strings rather than React: the prerenderer runs in Node with
 * no React in it, and these pages are the ones a crawler reads in full.
 *
 * The legal three are policy. Moving them here changed no word of them, and translating them is a
 * job for somebody who can say what they mean in the other language — not a paraphrase.
 */

export const pages: Content['pages'] = {
  about: {
    label: 'About',
    title: 'What TransformPipe is',
    lede: 'A document converter that does the work in your browser, and stays out of the way.',
    sections: [
      {
        heading: 'What it does',
        body: [
          'Fifteen conversions. A Word file, a slide deck, a spreadsheet, an EPUB book, an OpenDocument or rich text file, an Evernote export, a page of saved HTML, a CSV, a JSON response, or the zip that Notion, Confluence and Obsidian hand you when you export — each of them becomes Markdown. And Markdown becomes a finished HTML page, a Word file, plain text, or something you can print.',
          'Everything normalises to Markdown, because Markdown is a format you can read without the tool that made it, diff in a pull request, and still open in twenty years.',
        ],
      },
      {
        heading: 'It runs in your browser',
        body: [
          'Signed out, no file is sent anywhere. There is no upload to trust because there is no upload: the conversion happens on your own machine, which is why a page behind your company login converts as easily as one that is public.',
          'Sign in and the Markdown is kept in your account, so a document follows you to another machine. It stays private until you share it, and a shared link can be revoked.',
        ],
      },
      {
        heading: 'What comes out is one file',
        body: [
          'The exported HTML has its styles, its pictures, its diagrams and its formulas inside it. It asks the network for nothing, which is what makes it open the same on a laptop with no connection in five years as it does today — and what makes it safe to email to somebody who will open it once and never think about it again.',
        ],
      },
      {
        heading: 'And not only in the browser',
        body: [
          'The same conversions reach a terminal, a pull request, a browser tab and a conversation: a public API, a command-line client with no dependencies, a GitHub Action that publishes the Markdown a pull request changed, a browser extension that converts the page you are reading, and an MCP server so an assistant can convert and share on your behalf. One set of converters behind all of them, so a table comes out the same wherever you asked.',
        ],
      },
      {
        heading: 'Who builds it',
        body: [
          'TransformPipe is built by Raudar Labs. The source is public and MIT licensed, which means the conversion you are trusting is one you can read.',
        ],
      },
    ],
    seo: {
      title: 'What TransformPipe is — a document converter that runs in your browser',
      description:
        'TransformPipe converts fifteen formats to Markdown and back, in your browser with nothing uploaded. An API, a CLI, a GitHub Action, an extension and an MCP server too.',
    },
  },
  support: {
    label: 'Support',
    title: 'Support',
    lede: 'A bug, a format you need, or something that should not be published.',
    sections: [
      {
        heading: 'A file that converted wrongly',
        body: [
          'It is the most useful thing you can send. Attach it to the issue if you can share it, say what you expected instead, and name the browser if it looked right somewhere else. A conversion that is wrong on one file is usually wrong on a shape, and the file is how we find the shape.',
          'A format we do not convert yet is a request worth making. Several of the ones here started as one.',
        ],
      },
      {
        heading: 'Something shared that should not be',
        body: [
          'Every shared document carries a “Report this document” link at the foot of the page it opens. That link is the fastest route: it identifies the document without you having to describe it, and it does not need an account.',
        ],
      },
      {
        heading: 'Privacy and legal',
        body: [
          'Questions about what is stored, or a request to delete an account and everything in it, go to the same issues. Signed in, you can also delete any document yourself — that removes the row and the stored source together.',
        ],
      },
    ],
    seo: {
      title: 'Support — TransformPipe',
      description:
        'Report a bug, ask for a format, flag a shared document, or ask what is stored and have it deleted. Open an issue in two fields.',
    },
  },
  extension: {
    label: 'Browser extension',
    title: 'The browser extension',
    lede: 'The page you are on, as Markdown, without leaving it.',
    sections: [
      {
        heading: 'One click, and the page is a document',
        body: [
          'Press the button in the toolbar and the extension reads the page you are looking at, picks the article out of the navigation and the cookie notices, makes every link and picture address absolute, and hands back Markdown. Copy it, download it, or save the page as a self-contained `.html` file — its own design, its pictures inside the file, no requests to anything.',
        ],
      },
      {
        heading: 'The pages that have no export',
        body: [
          'Documentation, a wiki, a ticket, a thread — anything that exists only rendered. It reads what your browser already has on screen, so a page only you can see converts without anybody handing over a password: Confluence, Jira and Notion need no administrator, no export and no API token.',
        ],
      },
      {
        heading: 'Two ways to keep it open',
        body: [
          'The toolbar button opens a compact panel over the page. The side panel is the same thing kept open beside it, following you from tab to tab and converting each page as you arrive — which is what you want when you are working through a set of them rather than converting one. The right-click menu converts a selection.',
        ],
      },
      {
        heading: 'Files too, without uploading them',
        body: [
          'The same ten conversions the site has — Word, PDF, spreadsheets, HTML, CSV, JSON, EPUB and the rest — run inside the extension. Nothing is uploaded and nothing needs a network connection, and several files picked at once become one document, in the order you picked them.',
        ],
      },
      {
        heading: 'What it does not do',
        body: [
          'The permissions it asks for are the smallest set that does the work, and the largest of them is optional:',
        ],
        items: [
          'Signed out it never talks to us at all. The conversion happens in the page, on your machine.',
          'There is no analytics in it, no telemetry, and no record of which pages you converted.',
          'It reads a page only when you press its button or open the side panel on it, and it never writes to a page.',
          'Reading the tab you are on is granted when you turn the side panel on, and refusing it costs you the panel and nothing else.',
        ],
      },
      {
        heading: 'With an account',
        body: [
          'Sign in — the same account as the site, one click, no key to paste — and Save puts the document where the rest of them are. Share publishes a link, or names the people who may read it; they are told by email and read it signed in as themselves.',
        ],
      },
      {
        heading: 'Installing it',
        body: [
          'Chrome takes it from the Chrome Web Store, and so do the browsers built on Chromium: Edge, Brave, Opera, Arc. It asks for no host permission at install — until you connect an account it has no reason to talk to us — and the side panel asks for what it needs at the moment you turn it on.',
          'Firefox takes it from Mozilla Add-ons, on the desktop and on Android. The same build from the same source; where Chrome asks for the side panel as a permission, Firefox grants its sidebar in the manifest, so there it asks for nothing at all.',
        ],
      },
    ],
    seo: {
      title: 'Browser extension — TransformPipe',
      description:
        'Convert the page you are on to Markdown in one click, or a file on your machine — in your browser, offline, and with no account needed.',
    },
  },
  privacy: {
    label: 'Privacy',
    title: 'Privacy',
    lede: 'What is stored, where, and what is never collected at all.',
    sections: [
      {
        heading: 'Signed out, nothing reaches us',
        body: [
          'Converting happens in your browser. The file is read, converted and rendered on your own machine, and no part of it is sent to a server. The history you see is your browser’s own storage, not an account.',
        ],
      },
      {
        heading: 'Signed in, this much and no more',
        body: [
          'An account exists so documents can follow you between devices and be shared. It holds:',
        ],
        items: [
          'Your identity, through our authentication provider: an email address, a name where one was given, and an account id. Signing in with Google brings those from Google; signing up with an address and a password leaves the password with the authentication provider, as a hash. Either way we never see or store a password.',
          'For each document you keep: its name, which conversion made it, its size, counts of words, headings, links, code blocks, tables and images, and when it was created.',
          'The Markdown itself, in a private blob store — private meaning it has no public URL and is read only through a request we authorise.',
          'API keys as hashes, never the key. A key is shown once, at creation, and cannot be recovered afterwards — not by you and not by us.',
          'Share settings: whether a document is private, open by link, or addressed to particular email addresses, and the token that a link carries.',
        ],
      },
      {
        heading: 'The browser extension',
        body: [
          'The extension converts the page you are on, in that page, on your own machine. It reads a page only after you press its button or open the side panel on it, it never writes to a page, and nothing from a page goes anywhere until you press Save or Share — signed out, it never talks to us at all.',
        ],
        items: [
          'Nothing is collected from your browsing. There is no analytics in the extension, no telemetry, and no record anywhere of which pages you converted.',
          'Signed in, an OAuth token is kept in the browser’s extension storage — the same grant listed on your account page and revocable there. It is the only credential the extension holds, and no password is in it.',
          'A converted document passes from the panel to the tab that shows it through session storage, which the browser empties when it closes and never writes to disk.',
          'Reading the tab you are on is asked for when you turn the side panel on, because a panel that follows you from tab to tab cannot ask again at every one. The toolbar button needs no such permission: it reads the single tab you pressed it on.',
          'Save and Share send that one document to your account, exactly as the app does. Nothing else leaves the browser.',
        ],
      },
      {
        heading: 'What we do not do',
        body: [
          'There is no advertising, no tracking pixel and nothing sold. One third-party script loads at all — Google Tag Manager — and it brings Google Analytics only if you allowed it in the cookie banner; refused or unanswered, Google’s tags write nothing to your browser. Nothing is shared with anyone except the infrastructure that runs the service: the database, the blob store, the authentication provider, the email provider and the host.',
          'Your documents are not read by us, and they are not used to train anything.',
        ],
      },
      {
        heading: 'Email',
        body: [
          'Email is sent in four cases and no others: to confirm your address, to reset a password, to welcome you once after you register, and to tell somebody that a document has been shared with them. The first two come from the authentication provider, the other two from the email provider. There is no newsletter, and there is nothing to unsubscribe from.',
          'What the email provider is given is the recipient’s address, the address of the person sharing where there is one, and the message itself. It is never given a document.',
        ],
      },
      {
        heading: 'Cookies and browser storage',
        body: [
          'One session cookie, set by our authentication provider when you sign in, first-party and HttpOnly. A short-lived cookie exists during the sign-in round trip and expires in ten minutes. That is all of them — there is nothing optional to turn off. The cookies page has the detail.',
          'Your theme and, when signed out, your history live in your browser’s local storage. They never leave it.',
        ],
      },
      {
        heading: 'Deleting things',
        body: [
          'Deleting a document deletes the row and the stored Markdown together, at once, not on a schedule. Revoking a share drops the token, so a link already sent stops working.',
          'To remove an account and everything in it, ask — see the support page. Reaching a storage limit refuses the write; it never deletes something you chose to keep to make room.',
        ],
      },
      {
        heading: 'Children',
        body: [
          'This is a tool for work, not a service for children, and it is not directed at anyone under 16.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'If this page changes in a way that affects what is collected, the date above changes with it.',
        ],
      },
    ],
    seo: {
      title: 'Privacy — TransformPipe',
      description:
        'Signed out, no file leaves your browser. Signed in, we store the document, its metadata and your account identity — analytics only if you allow it, no tracking pixels, nothing sold.',
    },
  },
  terms: {
    label: 'Terms',
    title: 'Terms of use',
    lede: 'The short version, because a long one would not be read.',
    sections: [
      {
        heading: 'Using the service',
        body: [
          'TransformPipe is offered free of charge, as it is. Use it for anything you have the right to convert, from the app, the API, the command line or an assistant.',
          'An account is yours to keep or delete. You are responsible for what you do with an API key, so treat one as a password: anyone holding it can read and write your documents.',
        ],
      },
      {
        heading: 'Your documents stay yours',
        body: [
          'You keep every right you had in a document before you converted it. We claim no ownership and no licence beyond what running the service requires: storing it so you can open it again, and serving it to whoever you deliberately shared it with.',
        ],
      },
      {
        heading: 'What not to put here',
        body: [
          'Do not use the service for content that is unlawful, that you have no right to distribute, or that exists to harm somebody — malware, material that sexually exploits children, targeted harassment. Do not use a share link to run a phishing page.',
          'Shared documents can be reported by anyone who opens them. A document that breaks this section may be unpublished or deleted, and a repeat account closed.',
        ],
      },
      {
        heading: 'Limits and availability',
        body: [
          'Rate and storage limits apply and are published in the documentation. They exist to keep the service up, and may change.',
          'There is no uptime promise. The service may be interrupted, and features may change or be withdrawn. Keep your own copy of anything you cannot lose — the download exists for exactly that, and it needs nothing from us to open.',
        ],
      },
      {
        heading: 'No warranty, and the limit of what we owe',
        body: [
          'The service is provided without warranty of any kind, express or implied. To the fullest extent the law allows, Raudar Labs is not liable for lost data, lost profit, or any indirect or consequential loss arising from using it.',
          'Nothing here limits a right you have that cannot be limited by agreement.',
        ],
      },
      {
        heading: 'Changes and ending',
        body: [
          'These terms may change; the date above says when they last did, and continuing to use the service is how they are accepted. You can stop at any time by deleting your documents and your account.',
        ],
      },
    ],
    seo: {
      title: 'Terms of use — TransformPipe',
      description:
        'TransformPipe is free and provided as it is. Your documents stay yours, limits are published, and there is no warranty.',
    },
  },
  cookies: {
    label: 'Cookies',
    title: 'Cookies',
    lede: 'Two are needed to sign in. One thing is optional — analytics — and it stays off until you allow it.',
    sections: [
      {
        heading: 'The one thing you choose',
        body: [
          'Most cookie pages exist to let you decline analytics and advertising. There is no advertising here at all. Analytics is Google Analytics, loaded through Google Tag Manager, and it is the single switch on this site: the banner asks on a first visit, the button at the foot of this page reopens the answer, and until you allow it Google’s tags write nothing to your browser and send cookieless pings at most.',
          'Signed out, with analytics refused or unanswered, this site sets no cookies at all.',
        ],
      },
      {
        heading: 'The two that exist',
        body: [
          'Both are set by our authentication provider, are first-party, and are marked HttpOnly and Secure — script on the page cannot read them:',
        ],
        items: [
          '__Secure-neon-auth.session_token — keeps you signed in. Without it, every page load would ask you to sign in again. It goes when you sign out.',
          '__Secure-neon-auth.session_challenge — exists for the ten minutes of a sign-in round trip, so the reply from Google can be matched to the request that started it. It is what stops somebody else’s sign-in landing in your session.',
        ],
      },
      {
        heading: 'Browser storage, which is not a cookie',
        body: [
          'Two things live in your browser’s local storage and are never sent anywhere: the theme you picked, and — when you are signed out — your recent conversions, so the history has something in it. Clearing site data in your browser removes both, and the app carries on without them.',
        ],
      },
      {
        heading: 'If that changes',
        body: [
          'Anything optional gets a real control before it is set, not after — that is what the banner and the button below are. The date above says when this last changed.',
        ],
      },
    ],
    seo: {
      title: 'Cookies — TransformPipe',
      description:
        'Two first-party session cookies needed to sign in, and analytics you can refuse. No advertising, and nothing set in your browser before you answer.',
    },
  },

  /*
   * The how-to pages: one per extension the dropzone takes.
   *
   * These answer rather than argue, which is what separates them from the blog. Somebody has a file
   * and no idea what makes it open; they searched the extension; they want the answer in the first
   * paragraph and a way out of the problem at the bottom. So: what the thing is, what opens it on
   * each kind of machine, what goes wrong, and the conversion that ends the question.
   */
  'how-to-md': {
    label: 'Open an .md file',
    title: 'How to open an .md file',
    lede: 'A Markdown file is plain text. Anything that opens text opens it — the question is what makes it look like a document.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'An `.md` file is a text file with a few conventions in it: a hash for a heading, asterisks for emphasis, hyphens for a list. Nothing in the file is binary and nothing is compressed, so a text editor shows you the whole truth of it immediately.',
          'That is also why it looks unfinished. The conventions are instructions for a renderer, and until something renders them you are reading the instructions rather than the document.',
        ],
      },
      {
        heading: 'On a computer',
        body: [
          'On Windows, Notepad opens it and shows the raw text. On a Mac, TextEdit does the same, though it may ask to convert the file first — decline, and it stays plain. On either, VS Code renders a live preview beside the source, which is the closest thing to the finished page without leaving your editor.',
          'Dragging the file onto a browser window does not work the way people expect: the browser shows the raw text or offers to download it, because no browser renders Markdown on its own.',
        ],
      },
      {
        heading: 'On a phone',
        body: [
          'Most phones have no Markdown reader installed and will offer to open the file in a notes or files app, which shows the text as written. On iOS, Files previews it as plain text; on Android, the behaviour depends on which text editor is installed.',
          'Converting it to HTML first is usually quicker than finding a reader, because every phone already has a browser and every browser opens HTML.',
        ],
      },
      {
        heading: 'What usually goes wrong',
        body: [
          'A file saved as `notes.md.txt` by a text editor that added its own extension will not be recognised by anything looking for Markdown. Rename it and the problem disappears.',
          'Tables, footnotes and task lists are not in the original Markdown specification, so a reader that shows the pipes and brackets literally is not broken — it implements the core and not the extensions.',
        ],
      },
    ],
    action: 'Convert an .md file to HTML',
    seo: {
      title: 'How to open an .md file — TransformPipe',
      description:
        'What a Markdown file is, what opens it on Windows, macOS and a phone, why the browser shows raw text, and how to turn it into a page you can read.',
    },
  },
  'how-to-html': {
    label: 'Open an .html file',
    title: 'How to open an .html file',
    lede: 'Every browser opens it. The interesting question is what to do when you want the words out of it rather than the page.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'An `.html` file is the page itself: the text, and the markup that says which part is a heading, a link, a table. It may also reference styles, images and scripts that live elsewhere, which is why a saved page sometimes opens looking like nothing at all.',
        ],
      },
      {
        heading: 'Opening it',
        body: [
          'Double-clicking opens it in your default browser on every desktop system. If it opens in an editor instead, right-click and choose Open with, then a browser.',
          'On a phone, a file manager will usually hand it to the browser. If it refuses, emailing the file to yourself and opening the attachment normally works, because mail clients pass HTML to a web view.',
        ],
      },
      {
        heading: 'When it opens blank or unstyled',
        body: [
          'A page saved with Save As, Web Page, complete keeps its styles and images in a folder beside the file. Move the file without the folder and the page loses everything except its text.',
          'A page saved as a single file keeps everything inside it and opens the same anywhere. This is why an export worth keeping is a self-contained one.',
        ],
      },
      {
        heading: 'Getting the text out',
        body: [
          'Copying from the browser gives you the words and loses the structure: headings become ordinary lines, tables become runs of text. Converting the file to Markdown keeps the structure as something you can read and edit, which is usually what people actually wanted.',
        ],
      },
    ],
    action: 'Convert an .html file to Markdown',
    seo: {
      title: 'How to open an .html file — TransformPipe',
      description:
        'How to open an HTML file on a computer or a phone, why a saved page sometimes loses its styling, and how to get the text out with its structure intact.',
    },
  },
  'how-to-docx': {
    label: 'Open a .docx file',
    title: 'How to open a .docx file',
    lede: 'A .docx is a zip archive of XML. Word opens it, and so do several things that are free.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'A `.docx` is not a single document but a compressed folder: rename it to `.zip` and you can open it to find the text, the styles and the images as separate files inside. That is the format, and it is why a `.docx` cannot be read usefully in a text editor.',
        ],
      },
      {
        heading: 'Without buying Word',
        body: [
          'Google Docs opens a `.docx` by uploading it to Drive, LibreOffice Writer opens it on any desktop system and is free, and both Apple Pages and Microsoft’s own web version of Word open one without a paid licence.',
          'On a phone, the Word app opens `.docx` files for reading without a subscription; editing is where the paywall starts.',
        ],
      },
      {
        heading: 'When it will not open',
        body: [
          'A file that arrives as `document.docx` but refuses to open in anything is often a `.doc` — the older format — with the wrong extension, or a file that did not finish downloading. Check the size first: a truncated download is usually obviously too small.',
          'A password-protected `.docx` will open the dialogue and nothing else. No converter can pass that, which is a property of the file rather than a limitation of the tool.',
        ],
      },
      {
        heading: 'Keeping the words, dropping the layout',
        body: [
          'Converting to Markdown keeps the headings, lists, links and tables and throws away fonts, margins and page breaks. For text that has to live in a repository, a wiki or a diff, that trade is the point rather than a loss.',
        ],
      },
    ],
    action: 'Convert a .docx file to Markdown',
    seo: {
      title: 'How to open a .docx file — TransformPipe',
      description:
        'What a .docx actually is, how to open one without buying Word, what to do when it refuses to open, and how to keep the text while dropping the layout.',
    },
  },
  'how-to-csv': {
    label: 'Open a .csv file',
    title: 'How to open a .csv file',
    lede: 'A spreadsheet opens it, a text editor shows you what is really in it, and the difference matters more than it sounds.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'A `.csv` is rows of text with a separator between the fields — usually a comma, sometimes a semicolon or a tab. There are no types, no formulas and no formatting: every value is a string, and anything that looks like a date or a number is your software guessing.',
        ],
      },
      {
        heading: 'Opening it',
        body: [
          'Double-clicking opens it in Excel or Numbers on most machines, and in LibreOffice Calc if that is installed. Google Sheets imports one through File, Import.',
          'Opening it in a text editor first is worth the ten seconds: it shows the real separator, whether the first row is a header, and whether the fields are quoted — three things a spreadsheet decides for you silently.',
        ],
      },
      {
        heading: 'When the columns come out wrong',
        body: [
          'Everything landing in one column means the separator your file uses is not the one your spreadsheet expected. In Excel, use Data, From Text/CSV rather than double-clicking, and set the delimiter yourself.',
          'Accented characters coming out as nonsense is an encoding mismatch: the file is UTF-8 and the program assumed something else. The same import dialogue lets you say so.',
          'Leading zeros disappearing from postcodes or part numbers is not recoverable after the fact — the spreadsheet converted the value to a number on open. Import the column as text instead.',
        ],
      },
      {
        heading: 'Putting it in a document',
        body: [
          'Pasting a spreadsheet range into a document gives you either a picture of a table or a mess, depending on where you paste it. Converting the file to a Markdown table gives you rows that survive a copy, a diff and a pull request.',
        ],
      },
    ],
    action: 'Convert a .csv file to a Markdown table',
    seo: {
      title: 'How to open a .csv file — TransformPipe',
      description:
        'How to open a CSV, why the columns sometimes collapse into one, what breaks leading zeros and accented characters, and how to turn one into a table.',
    },
  },
  'how-to-json': {
    label: 'Open a .json file',
    title: 'How to open a .json file',
    lede: 'It is text, so everything opens it. Reading it is the part that needs help.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'A `.json` file holds structured data: objects with named fields, lists of things, numbers and strings. It is the format an API answers in and the one most applications export their settings to, which is why one turns up in a download folder without explanation.',
        ],
      },
      {
        heading: 'Opening it',
        body: [
          'Dragging it into a browser window works well: Firefox and Chrome both show a folding, searchable view rather than raw text. VS Code opens it with folding and will reformat a single-line file with one command.',
          'A very large export — tens of megabytes — will make an editor struggle. A command-line tool such as `jq` reads those without loading the whole file into a window.',
        ],
      },
      {
        heading: 'When it will not parse',
        body: [
          'The three usual faults are a trailing comma after the last item, single quotes where the format requires double, and a comment — JSON has no comments, whatever the file it came from looked like.',
          'An error naming a line and column is worth trusting: the parser stopped exactly there, and the fault is usually one character earlier.',
        ],
      },
      {
        heading: 'Making it readable by a person',
        body: [
          'A folding viewer is for inspecting data. When the point is to show it to somebody, converting to Markdown turns a list of records into a table and nested objects into headed sections — the same information, in a shape that survives being pasted into a document.',
        ],
      },
    ],
    action: 'Convert a .json file to Markdown',
    seo: {
      title: 'How to open a .json file — TransformPipe',
      description:
        'How to open and read a JSON file in a browser or an editor, the three things that usually break parsing, and how to turn one into something readable.',
    },
  },
  'how-to-txt': {
    label: 'Open a .txt file',
    title: 'How to open a .txt file',
    lede: 'Nothing opens more easily. The problems start when the text was written on a different kind of machine.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'A `.txt` file is characters and line breaks, with nothing describing how any of it should look. That is its virtue: it opens on every system ever made and will still open in thirty years.',
        ],
      },
      {
        heading: 'Opening it',
        body: [
          'Every operating system has an editor that opens it by double-clicking — Notepad, TextEdit, gedit. A browser opens one dropped onto its window. A phone previews it in its files app.',
        ],
      },
      {
        heading: 'When it opens as one long line, or as boxes',
        body: [
          'Text written on Windows ends its lines with two characters and text written on Unix with one. Older editors that expect the other convention show the file as a single run-on line, or draw a small box at every break. Any modern editor handles both; Notepad has since 2018.',
          'Nonsense characters where accents or quotation marks should be is an encoding mismatch — the file is UTF-8 and the editor guessed an older single-byte encoding. Most editors let you reopen with an encoding you name.',
        ],
      },
      {
        heading: 'When it needs to become a document',
        body: [
          'Treating plain text as Markdown looks like it works until a line beginning with a hyphen becomes a bullet, an asterisk in a sentence turns half a paragraph italic, and a year at the start of a line becomes a numbered list. Converting it properly escapes those characters first, so what the file said is what the page says.',
        ],
      },
    ],
    action: 'Convert a .txt file to Markdown',
    seo: {
      title: 'How to open a .txt file — TransformPipe',
      description:
        'How to open a plain text file anywhere, why it sometimes shows as one long line or as boxes, and how to turn it into a document without it gaining formatting.',
    },
  },
  'how-to-xlsx': {
    label: 'Open an .xlsx file',
    title: 'How to open an .xlsx file',
    lede: 'Excel is not the only thing that opens one, and for reading a sheet it is rarely the quickest.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'An `.xlsx` is a zip archive of XML, the same construction as a `.docx`: sheets, styles and shared strings as separate files inside one compressed folder. It holds types, formulas, formatting and several sheets at once, which is everything a CSV cannot.',
        ],
      },
      {
        heading: 'Without buying Excel',
        body: [
          'Google Sheets imports one through File, Import. LibreOffice Calc opens it on any desktop system and is free. Apple Numbers opens one on a Mac, and Microsoft’s own web version of Excel reads one without a paid licence.',
        ],
      },
      {
        heading: 'What to check before trusting the numbers',
        body: [
          'A cell showing `####` is a column too narrow to display the value, not a broken file. A date that reads as a five-digit number is the underlying serial value with the formatting lost.',
          'Formulas are stored alongside their last computed result. A file opened in something that does not evaluate them shows the results, which are correct as of whenever the file was last saved and not necessarily now.',
        ],
      },
      {
        heading: 'Getting a sheet into a document',
        body: [
          'The usual route is exporting each sheet to CSV and converting that, which loses everything but the active sheet. Converting the workbook directly gives you a Markdown table per sheet, with a table of contents when there is more than one.',
        ],
      },
    ],
    action: 'Convert an .xlsx file to Markdown tables',
    seo: {
      title: 'How to open an .xlsx file — TransformPipe',
      description:
        'How to open an Excel workbook without buying Excel, what #### and five-digit dates actually mean, and how to turn every sheet into a Markdown table.',
    },
  },
  'how-to-pptx': {
    label: 'Open a .pptx file',
    title: 'How to open a .pptx file',
    lede: 'Opening it is easy. Reading it without sitting through the presentation is the part nothing helps with.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'A `.pptx` is a zip archive of XML, the same construction as a `.docx` or an `.xlsx`: one file per slide, one per set of speaker notes, and the pictures beside them. The older `.ppt` is a different thing entirely — a binary format from before 2007, which most of what opens a `.pptx` will also convert.',
        ],
      },
      {
        heading: 'Without buying PowerPoint',
        body: [
          'Google Slides imports one through File, Open. LibreOffice Impress opens one on any desktop system and is free. Keynote opens one on a Mac, and Microsoft’s own web version of PowerPoint reads one without a paid licence.',
          'On a Mac, pressing space on the file in Finder shows every slide without opening anything at all.',
        ],
      },
      {
        heading: 'Where the speaker notes are',
        body: [
          'Under the slide, in a pane most viewers hide by default: View, then Notes, in PowerPoint and in Google Slides alike. They are usually where the argument is written down in sentences, the slide above being the summary somebody read out.',
          'Exporting a deck to PDF drops them unless you choose the notes-pages layout, which is why a deck passed around as a PDF is so often missing the half that explained it.',
        ],
      },
      {
        heading: 'Getting a deck into a document',
        body: [
          'The usual route is copying each slide’s text out by hand, which loses the notes because they are not on screen while you do it. Converting the file directly gives you a section per slide, in the order the deck plays, with the bullets, the tables and the notes still attached to the slide they belong to.',
        ],
      },
    ],
    action: 'Convert a .pptx file to Markdown',
    seo: {
      title: 'How to open a .pptx file — TransformPipe',
      description:
        'How to open a PowerPoint file without buying PowerPoint, where the speaker notes hide, and how to turn a whole deck into a document you can read.',
    },
  },
  'how-to-epub': {
    label: 'Open an .epub file',
    title: 'How to open an .epub file',
    lede: 'Every reading device opens one. Getting the words out of it is the part that is awkward.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'An `.epub` is a zip archive of XHTML — a web page per chapter, a stylesheet, the pictures, and a package file that lists them and states the order they are read in. It is the open format the whole industry agreed on, which is why a Kindle’s `.azw3` and `.mobi` are the odd ones out rather than the standard.',
        ],
      },
      {
        heading: 'Reading one',
        body: [
          'Apple Books opens one on a Mac, an iPhone or an iPad, and Microsoft Edge opens one on Windows with no install at all. Calibre is the free desktop reader that also converts between formats, and Thorium is the one to reach for if you want a reading system that follows the spec closely.',
          'A Kindle does not read `.epub` directly, but Amazon’s Send to Kindle accepts one and converts it on the way.',
        ],
      },
      {
        heading: 'Why renaming it to .zip nearly works',
        body: [
          'Because it is one. Unzip an `.epub` and every chapter is there as a file you can open in a browser. What you will not get is the order: the files are commonly named `index_split_030.xhtml`, `index_split_002.xhtml` and so on, and those numbers are whatever the tool that made the book happened to write. The reading order lives in the package file’s spine, and nothing else states it.',
        ],
      },
      {
        heading: 'Getting a book into a document',
        body: [
          'Converting it directly gives you one Markdown document: the chapters in the order the spine puts them, under the titles the book’s own contents gives them, the pictures carried inside the file, and the links between chapters reduced to their words, because a merged document has nowhere for them to land.',
        ],
      },
    ],
    action: 'Convert an .epub file to Markdown',
    seo: {
      title: 'How to open an .epub file — TransformPipe',
      description:
        'How to open an EPUB book on any device, why unzipping one loses the chapter order, and how to turn a whole book into a document you can search and edit.',
    },
  },
  'how-to-odt': {
    label: 'Open an .odt file',
    title: 'How to open an .odt file',
    lede: 'It is the international standard for a word-processor document, and Word opens it too.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'An `.odt` is a zip of XML — `content.xml` for the words, `styles.xml` for how they look, a `Pictures` folder — and it is OpenDocument Text, an ISO standard rather than one company’s format. LibreOffice and OpenOffice write it by default, and Google Docs hands one back under File, Download.',
        ],
      },
      {
        heading: 'Opening one',
        body: [
          'LibreOffice is the obvious answer and it is free on every desktop system. Microsoft Word has opened and saved `.odt` since 2007, and so has Word on the web; Google Docs imports one through File, Open. Apple Pages opens one too, though it will want to save it back as something else.',
          'If all you need is to read it, the zip is open to you: unpack it and `content.xml` is the document, tags and all.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'Round-tripping through Word. An `.odt` opened in Word and saved again keeps its words and loses some of its styling, because the two applications do not agree on what every style means — which is a problem only if somebody else is going to open it in LibreOffice afterwards.',
          'Fonts, as with every document format. A file that names a font your machine does not have is laid out in whatever the reader substitutes, and a page count that mattered stops being the same page count.',
        ],
      },
      {
        heading: 'Getting one into a document',
        body: [
          'This is the format that converts most faithfully of the lot, because it states what things are rather than how they look: a heading knows its own level, a list knows its nesting, a table is a table and a footnote is a footnote. Converting one gives you Markdown with all of that, the pictures carried inside the file.',
        ],
      },
    ],
    action: 'Convert an .odt file to Markdown',
    seo: {
      title: 'How to open an .odt file — TransformPipe',
      description:
        'How to open an OpenDocument file, which programs read one besides LibreOffice, what breaks on a round trip through Word, and how to turn one into Markdown.',
    },
  },
  'how-to-rtf': {
    label: 'Open an .rtf file',
    title: 'How to open an .rtf file',
    lede: 'Everything opens one. That is the whole point of it, and the reason it is still around.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'Rich Text Format is plain text with instructions in it: `{\\rtf1` at the start, then control words like `\\b` for bold and `\\par` for a new paragraph, all the way down. Microsoft published it in 1987 and stopped developing it in 2008, which is exactly why every word processor written since reads it.',
        ],
      },
      {
        heading: 'Opening one',
        body: [
          'TextEdit on a Mac and WordPad on Windows both open one without installing anything, and so do Word, LibreOffice, Google Docs and Pages. On a Mac, pressing space on the file in Finder shows it.',
          'It is also readable as it stands: open it in a text editor and the words are there between the control words, which is more than can be said for a `.docx`.',
        ],
      },
      {
        heading: 'Why it arrives so often',
        body: [
          'Because it is what a Mac produces when text leaves an application. Drag a selection out of one window and into another and macOS hands over RTF; the same is true of a great deal of copy and paste between programs, and of anything exported by an older system that wanted to keep bold and italic without committing to a format.',
          'It carries almost no metadata and no macros, which is also why it turns up as the safe option for sending a document to somebody outside an organisation.',
        ],
      },
      {
        heading: 'Getting one into Markdown',
        body: [
          'Bold, italic, strikethrough, links, lists and tables all convert. Headings are the one thing the format is vague about: Word writes an outline level and means it, and a Mac writes nothing but a larger bold line — so the outline level is used where there is one, and a bold paragraph set larger than the body is read as a heading where there is not.',
        ],
      },
    ],
    action: 'Convert an .rtf file to Markdown',
    seo: {
      title: 'How to open an .rtf file — TransformPipe',
      description:
        'How to open a rich text file, why a Mac produces one every time you drag text between apps, what is inside it, and how to turn one into Markdown.',
    },
  },
  'how-to-enex': {
    label: 'Open an .enex file',
    title: 'How to open an .enex file',
    lede: 'It is the only way notes leave Evernote, and almost nothing opens it directly.',
    sections: [
      {
        heading: 'What it is',
        body: [
          'An `.enex` is one XML file holding every note you exported: the title, the tags, the dates, and the note itself as ENML — Evernote’s own restricted flavour of XHTML — wrapped inside the XML. Attachments travel in the same file, base64-encoded, linked to the note by the MD5 of their contents rather than by name.',
        ],
      },
      {
        heading: 'Getting one out of Evernote',
        body: [
          'Select the notes, or a whole notebook, then File, Export notes. The desktop app writes `.enex`; the web app does not offer an export at all, so this is a desktop-only operation.',
          'Export a notebook at a time rather than everything at once. A single file of ten thousand notes is one thing that can go wrong instead of twenty.',
        ],
      },
      {
        heading: 'What reads one',
        body: [
          'Obsidian’s Importer plugin, Notion’s import, Apple Notes, Joplin and Bear all accept `.enex` — because it is the format everybody wrote an importer for when Evernote’s pricing changed. What does not read one is a text editor: open it and you get XML with your notes inside base64 and CDATA.',
        ],
      },
      {
        heading: 'What to check after any import',
        body: [
          'Tags, first. They are how an Evernote library is organised and several importers drop them, at which point ten thousand notes are a pile rather than a library.',
          'Then attachments. A note that had a PDF or a photograph in it should still say so, and the format links the two by a hash rather than a filename — which is where an importer that took a shortcut shows it.',
        ],
      },
    ],
    action: 'Convert an .enex file to Markdown',
    seo: {
      title: 'How to open an .enex file — TransformPipe',
      description:
        'How to export an .enex from Evernote, what is inside one, which apps import it, and what to check afterwards — tags and attachments above all.',
    },
  },
  'how-to-zip': {
    label: 'Open an export .zip',
    title: 'How to open a .zip export from Notion, Confluence or Obsidian',
    lede: 'Unzipping it is the easy half. What is inside is a folder of files that all point at each other.',
    sections: [
      {
        heading: 'What is in it',
        body: [
          'A Notion export is one Markdown file per page with a long identifier appended to every filename, plus a CSV for each database. A Confluence space export is one HTML file per page with its attachments beside it. An Obsidian vault is already Markdown, in the folders you made.',
          'All three unzip with the tools already on your machine: double-click on Windows or macOS, `unzip` on a terminal.',
        ],
      },
      {
        heading: 'Why the links are broken',
        body: [
          'Notion writes links against the exact filename it generated, identifier included. Rename the files to something readable and every link between pages stops resolving, which is the single most common way a migration goes wrong.',
          'Confluence links point at its own page ids, and attachments at a download URL that expects you to be signed in. Obsidian uses `[[wikilinks]]`, which only its own app resolves.',
        ],
      },
      {
        heading: 'Reading it without repairing it',
        body: [
          'Opening a hundred files one at a time to find out what a workspace contained is the wrong shape of work. Merging the export into one document — every page in order, with a table of contents — gives you something readable in one pass, which is usually what an archived export is for.',
        ],
      },
      {
        heading: 'When you do need the files separate',
        body: [
          'If the pages have to stay separate files with working links, the rename and the link rewrite have to happen together, from one map of old name to new. Doing them in two passes leaves a folder of documents that all point at names that no longer exist.',
        ],
      },
    ],
    action: 'Convert an export .zip to Markdown',
    seo: {
      title: 'How to open a .zip export from Notion or Confluence — TransformPipe',
      description:
        'What is inside a Notion, Confluence or Obsidian export, why the links between pages break, and how to read the whole thing as one document.',
    },
  },
  'how-to-assistant': {
    label: 'Share from an assistant',
    title: 'How to convert and share a document from an AI assistant',
    lede: 'An assistant writes Markdown all day and cannot hand you a page. Connecting this one lets it do both, without anybody copying text between tabs.',
    sections: [
      {
        heading: 'What a connector is',
        body: [
          'TransformPipe runs an MCP server at `/api/mcp`. MCP is the protocol assistants use to call tools, so adding the address as a connector gives the assistant a set of verbs it can use on your behalf: convert this, save it, share it, list what is there.',
          'There is no key to paste. Adding the connector sends you through a normal sign-in, and the assistant is granted access to that account until you disconnect it — the same shape as signing into any other application with your account.',
        ],
      },
      {
        heading: 'Adding it',
        body: [
          'On claude.ai: Settings, then Connectors, then Add custom connector, and give it `https://transformpipe.com/api/mcp`. Sign in when asked, and the tools appear in the next conversation.',
          'From a terminal, one command does the same thing: `claude mcp add --transport http transformpipe https://transformpipe.com/api/mcp`.',
          'Nothing else is configured. The connector can be removed from the same screen, and removing it revokes the access immediately.',
        ],
      },
      {
        heading: 'What it can then do',
        body: [
          'Eleven tools, all named `tp_`. The ones that matter in a conversation are `tp_convert_markdown`, which turns Markdown into a finished HTML document, `tp_convert_to_markdown` for a file going the other way, `tp_save_document`, which keeps the result in your account, and `tp_share_document`, which publishes it and returns a link you can send.',
          'The rest are the ones an assistant reaches for on its own: `tp_list_documents` and `tp_get_document` to find something you made earlier, `tp_summarize_document` to say what a long one contains, `tp_document_versions` to show what replaced what, `tp_usage` to check how much room is left, and `tp_delete_document`.',
          'In practice the useful sentence is short. Ask it to write the release notes, then ask it to publish them — the assistant converts, saves and shares, and answers with the address.',
        ],
      },
      {
        heading: 'What it can reach, and what it cannot',
        body: [
          'The connector acts as you, in your account, on documents you own. It cannot change the account, read your password, create API keys, or reach anybody else’s documents.',
          'A grant can also be read-only, in which case the assistant can list, fetch and summarise but cannot save, share or delete — and that restriction is enforced on the credential itself rather than on the tools, so it holds whatever the assistant asks for.',
          'Worth knowing rather than worrying about: an assistant with a connector is standing authority to act, and a document it reads can contain instructions aimed at it. That is the honest cost of the convenience, and the reason a read-only grant is the right default for anything you have not written yourself.',
        ],
      },
      {
        heading: 'When not to use it',
        body: [
          'A connector suits the document that exists inside a conversation and nowhere else. For a file already on disk, dropping it on the converter is quicker; for something that happens on every merge, the API or the GitHub Action is the right shape; and for a folder of four hundred files, a local converter beats a conversation.',
        ],
      },
    ],
    action: 'Read the documentation',
    seo: {
      title: 'Convert and share a document from an AI assistant — TransformPipe',
      description:
        'How to add TransformPipe to Claude as an MCP connector, what the eleven tools do, and what an assistant can and cannot reach in your account.',
    },
  },
};
