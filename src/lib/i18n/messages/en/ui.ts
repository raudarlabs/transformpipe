import type { Content } from '../../content';

/*
 * Every sentence the interface itself says, keyed by where it says it.
 *
 * This is the slice the components read through `useT()`. What is NOT here is anything that is a
 * thing rather than a word: an id, a path, a file extension, a slug, a date, a URL. Those stay in
 * the code that owns them — `shared/conversions.ts`, `src/lib/pages.ts`, `src/lib/blog.ts` — so a
 * translator editing a sentence cannot break a route.
 *
 * Keys follow the convention in `./index.ts`: `area.thing`, lower case, dots between, named for
 * where the string appears rather than for what it says. `page.` is the one prefix that file's list
 * does not name — it is the five pages that are only words, `src/features/StaticPage.tsx`, which
 * is a screen like the rest.
 *
 * A string built from a value carries a `{name}` placeholder and is filled in at the call site.
 * The alternative — a translated fragment glued to a number in JSX — cannot be reordered, and
 * German puts the pieces in a different order. So `history.row.stats.many` is one sentence with
 * two holes in it and not three children of a `<span>`.
 *
 * Singular and plural are separate keys, `.one` and `.many`, chosen by the caller. English needs
 * two forms and so do the four languages here; a language that needs more gets more keys, which is
 * a change to this file rather than to the components.
 */

export const ui: Content['ui'] = {
  /* Words that belong to no one screen. */
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.loading': 'Loading…',
  'common.clipboard.error': 'Could not access the clipboard',
  'common.selectall': 'Select all',
  'common.deselectall': 'Deselect all',
  'common.selected': '{count} selected',
  'common.exitselection': 'Exit selection',
  'common.scrolltotop': 'Scroll to top',
  /* Said by the converter after a drop and by the history after a merge — the same sentence. */
  'common.chained': 'Chained {count} files into one document',
  /*
   * What several files chained together are called: the first name, and how many followed it.
   *
   * A name rather than a label, and still a sentence — "more" is a word. The name of a document
   * with one source is that file's own name, and `merged.md` for none of them is a file name, so
   * both of those stay in `src/lib/merge.ts` where the rest of the naming lives.
   */
  'common.merged.name': '{first} + {count} more',

  /*
   * Sign-in, which fails in more ways than it succeeds and has to say which.
   *
   * The four `auth.error` sentences after the first are the outcomes `/api/auth/finish` can hand
   * back in the query string — a closed set, because the reason arrives in a link and a link is
   * something anybody can write. `auth.incomplete` is the toast that carries whichever it was.
   */
  'dialog.mcp.lede':
    'Add TransformPipe to an assistant and it can convert, save and share documents in this account.',
  'dialog.mcp.address': 'Connector address',
  'dialog.mcp.nokey':
    'On claude.ai: Settings → Connectors → Add custom connector. There is no key to paste — it signs in as you and can be disconnected here.',
  'dialog.mcp.command': 'From a terminal',
  'header.connector': 'MCP connector',
  'header.webhooks': 'Webhooks',

  /* The sign-in dialog: three views — in, up, and asking for a reset link. */
  'auth.dialog.signin.title': 'Sign in',
  'auth.dialog.signup.title': 'Create your account',
  'auth.dialog.reset.title': 'Reset your password',
  'auth.dialog.reset.lede':
    'Enter your account email and we\'ll send you a link to reset your password.',
  'auth.dialog.email': 'Email',
  'auth.dialog.password': 'Password',
  'auth.dialog.forgot': 'Forgot password?',
  'auth.dialog.submit.signin': 'Sign in',
  'auth.dialog.submit.signup': 'Continue',
  'auth.dialog.submit.reset': 'Send reset link',
  'auth.dialog.tonew': 'Don\'t have an account?',
  'auth.dialog.tonew.action': 'Sign up',
  'auth.dialog.toexisting': 'Already have an account?',
  'auth.dialog.toexisting.action': 'Sign in',
  'auth.dialog.back': 'Back to sign in',
  'auth.dialog.or': 'or',
  'auth.dialog.google': 'Continue with Google',
  'auth.dialog.aside.lede': 'An account is not the point. What it holds is.',
  'auth.dialog.aside.history': 'History',
  'auth.dialog.aside.history.detail': 'every document you convert, kept and reopenable',
  'auth.dialog.aside.links': 'Links',
  'auth.dialog.aside.links.detail': 'share a document with anyone, or with named people',
  'auth.dialog.aside.api': 'API and MCP',
  'auth.dialog.aside.api.detail': 'a key for the CLI, the GitHub Action and your assistant',
  'auth.dialog.aside.extension': 'The extension',
  'auth.dialog.aside.extension.detail': 'the same account, signed in from your browser',
  'auth.dialog.terms': 'I accept the {terms}',
  'auth.dialog.terms.link': 'terms of use',
  'auth.dialog.terms.required': 'The terms have to be accepted to create an account.',
  'auth.dialog.verify.title': 'Confirm your email',
  'auth.dialog.verify.lede': 'A six-digit code has gone to {email}. It expires in ten minutes.',
  'auth.dialog.verify.code': 'Six-digit code',
  'auth.dialog.verify.submit': 'Confirm',
  'auth.dialog.verify.resend': 'Send another code',
  'auth.dialog.verify.resent': 'A new code is on its way.',
  'auth.dialog.verify.done': 'The address is confirmed.',
  'auth.dialog.verify.later': 'Later',
  'header.verify': 'Confirm your email',
  'auth.dialog.reset.sent': 'If that address has an account, a reset link is on its way to it.',
  'auth.verify.sent':
    'The account is created. Check your email for the link that confirms the address.',

  'auth.incomplete': 'Sign-in did not complete',
  'auth.error.unfinished': 'Sign-in did not finish. Try again.',
  'auth.error.link': 'The sign-in link was incomplete. Try again.',
  'auth.error.unreachable': 'The sign-in service could not be reached.',
  'auth.error.rejected': 'The sign-in service refused the request.',
  'auth.error.nosession': 'The sign-in service returned no session.',
  'auth.error.start': 'Sign-in could not be started',
  'auth.error.signout': 'Sign-out failed',

  /* The bar at the top, on a wide screen and in the phone's sheet. */
  'header.home': 'New file',
  'header.nav.converter': 'Converter',
  'header.nav.history': 'History',
  'header.nav.docs': 'Docs',
  'header.nav.documentation': 'Documentation',
  'header.nav.blog': 'Blog',
  'header.menu.open': 'Menu',
  'header.menu.title': 'Menu',
  'header.menu.close': 'Close menu',
  'header.menu.convert': 'Convert',
  'header.menu.goto': 'Go to',
  'docs.webhooks.intro':
    'The account menu has a {webhooks} entry: register a URL and it receives a signed POST when a document is created, or shared with named people. It lives behind a session rather than under {api} on purpose — a key that could register a webhook would turn a leak into a standing feed of every future document instead of the point-in-time access it is now.',
  'docs.webhooks.signature':
    'The body is signed with HMAC-SHA256 over {payload} and sent in the {header} header — the shape Stripe and GitHub use, so verification code you already have usually needs only a different secret.',
  'docs.webhooks.secret':
    'The secret is shown when the webhook is created and can be shown again from the dialog. Unlike an API key it is presented by this app rather than to it, so the owner may legitimately need to read it again while setting a receiver up.',
  'docs.webhooks.delivery':
    'Delivery is best effort: one request, a five-second timeout, no retry and no queue. A receiver that is down misses that delivery, and the dialog says when the last one failed.',
  /* The browser extension — see extension/ and content/extension-plan.md. */
  'ext.panel': 'Open in the side panel',
  'ext.refresh': 'Convert this page again',
  'ext.panel.permission':
    'The side panel stays open while you browse, so it needs permission to read the pages you open — the button under the toolbar never did, because pressing it is the permission.',
  'ext.panel.allow': 'Allow reading pages',
  'ext.panel.close': 'Close the side panel',
  'ext.panel.detail':
    'It stays beside the page and follows you from tab to tab, instead of closing when you look away.',
  'ext.account': 'Account',
  'ext.signin': 'Sign in with TransformPipe',
  'ext.signout': 'Sign out',
  'ext.signedout': 'Not signed in',
  'ext.settings': 'Settings',
  'ext.share.failed': 'Could not save it — try signing in again',
  'ext.shared.link': 'Link copied to the clipboard',
  'ext.signin.hint':
    'Sign in and this extension can save a converted page to your account and publish a link. It asks for the same approval an assistant does, and you can withdraw it from your account page at any time.',
  'ext.signin.refused': 'Sign-in was not completed.',
  'ext.key.connect': 'Connect',
  'ext.key.connected': 'Connected',
  'ext.key.disconnect': 'Disconnect',
  'ext.save': 'Save',
  'ext.saved': 'Saved',
  'ext.share': 'Share',
  'ext.shared': 'Link copied',
  'ext.connect': 'Connect an account to save and share',
  'ext.converting': 'Converting…',
  'ext.failed': 'This page cannot be read',
  'ext.restricted': 'Chrome does not let any extension read its own pages. Open an ordinary page and press the button again — or convert a file instead.',
  'ext.wholepage': 'Whole page',
  'ext.selection': 'Selection',
  'ext.stats': '{words} words · {size}',
  'ext.copy': 'Copy Markdown',
  'ext.copied': 'Copied',
  'ext.download': 'Download .md',
  'ext.download.html': 'Download .html',
  'ext.generating': 'Generating HTML…',
  'ext.html.page': 'The page, as it looks',
  'ext.html.page.detail': 'Its own design, with images and styles in the file',
  'ext.html.text': 'Just the article',
  'ext.html.text.detail': 'Converted and cleaned up, as the site downloads it',
  'ext.open': 'Open in a tab',
  'ext.files': 'Open files…',
  'ext.viewer.empty': 'Choose files to convert — ten formats, all of it in this browser',
  'ext.viewer.hint':
    'Drop a file, or choose one — Word, Excel, CSV, JSON, HTML, plain text, or a Notion, Confluence or Obsidian export. Several files are chained into one document. Nothing leaves this browser.',
  'palette.title': 'Search',
  'palette.placeholder': 'Search documents, conversions and pages',
  'palette.empty': 'Nothing matches that',
  'palette.group.recent': 'Recent',
  'palette.seeall': 'See all documents',
  'palette.group.read': 'Read',

  /* The consent banner and its switches. See src/lib/consent.tsx for what each one turns on. */
  'cookies.banner.title': 'Cookies on this site',
  'cookies.banner.body': 'Signing in needs two cookies and they are always on. Analytics is optional and stays off until you allow it — nothing is written to your browser before you answer.',
  'cookies.banner.more': 'What each one does',
  'cookies.banner.accept': 'Accept all',
  'cookies.banner.reject': 'Only necessary',
  'cookies.banner.customise': 'Customise',
  'cookies.settings.title': 'Cookie settings',
  'cookies.settings.lede': 'Two categories, and one of them is a choice. You can change it any time from the Cookies page.',
  'cookies.settings.necessary': 'Necessary',
  'cookies.settings.necessary.detail': 'The sign-in session and the theme you picked. Refusing them would mean refusing to sign in, so they cannot be switched off.',
  'cookies.settings.analytics': 'Analytics',
  'cookies.settings.analytics.detail': 'Google Analytics, through Google Tag Manager: how many people arrive and which pages they read. Off unless you allow it, and while it is off Google’s tags write nothing to your browser.',
  'cookies.settings.save': 'Save choices',
  'cookies.settings.open': 'Cookie settings',
  'header.account': 'Account',
  'header.signin': 'Sign in',
  'header.logout': 'Log out',
  'header.apikeys': 'API keys',
  'header.theme.label': 'Theme',
  'header.theme.dark': 'Dark',
  'header.theme.light': 'Light',
  'header.theme.toggle': 'Switch theme',
  'header.theme.tolight': 'Switch to light',
  'header.theme.todark': 'Switch to dark',

  /* The converter screen: the dropzone, the document it produces, and the bands below it. */
  'converter.dropzone.title': 'Drop {extension} files here',
  'converter.dropzone.choose': 'Choose files',
  'converter.dropzone.limits':
    '{extensions} · up to 10 MB · processed in your browser',
  /*
   * The same fact as `converter.dropzone.limits`, as a sentence rather than a row of clauses:
   * this one is the prerendered page's, read by a crawler and by anybody whose bundle has not
   * arrived yet, where a line of middle dots is not prose. `scripts/prerender.ts` fills it in.
   */
  'converter.accepts': 'Takes {extensions}, up to 10 MB, converted in your browser.',
  'converter.picker.label': 'Or convert something else',
  'converter.picker.soon': 'Soon',
  'converter.picker.soon.title': 'Not here yet — it is on the roadmap',
  'converter.howto': 'New to this format?',
  'converter.blog.eyebrow': 'Blog',
  'converter.blog.title': 'Making Markdown behave',
  'converter.blog.blurb':
    'Syntax that breaks, documents that have to reach other people, and getting the whole thing to run without you.',
  'converter.blog.all': 'All articles',
  'converter.faq.eyebrow': 'FAQ',
  'converter.faq.title': 'Questions people arrive with',
  'converter.faq.blurb':
    'What happens to the file, what the download contains, and what an account adds.',
  'converter.badge.converted': 'converted',
  'converter.badge.merged': '{count} files merged',
  'converter.newfile': 'New file',
  'converter.share': 'Share',
  'converter.share.hint': 'Share a link to this document',
  'converter.share.hint.signedout':
    'Sign in to share — sharing needs the document in your account',
  'converter.copy': 'Copy {format}',
  'converter.copy.done': '{format} copied to clipboard',
  'converter.download': 'Download .{format}',
  'converter.download.more': 'Other formats',
  'converter.download.done': '{format} downloaded',
  'converter.print': 'Print or save as PDF',
  'converter.print.error': 'Could not open the print dialog',
  'converter.print.error.hint': 'Try downloading it instead.',
  'converter.download.docx': 'Word (.docx)',
  'converter.download.docx.needsSave': 'Word (.docx) — save the document first',
  'converter.download.docx.error': 'Could not build the Word document',
  'converter.tab.preview': 'Preview',
  'converter.tab.html': 'HTML source',
  'converter.tab.markdown': 'Markdown',
  'converter.tab.check': 'Check',
  'check.clean': 'Nothing to fix',
  'check.clean.detail': 'No dead anchors, empty headings or pictures without alt text.',
  'check.lede': 'What a reader or a screen reader would trip over. Nothing here is changed for you — each one is a single edit in the source.',
  'check.line': 'Line {line}',
  'check.suggestion': 'Did you mean {anchor}?',
  'check.dead-anchor': 'Link to a section that is not here',
  'check.duplicate-anchor': 'Two headings with the same name',
  'check.empty-heading': 'A heading with no words',
  'check.missing-alt': 'A picture with no alt text',
  'check.empty-link': 'A link with nothing to click',
  'check.empty-href': 'A link that goes nowhere',
  'converter.tab.summary': 'AI Summary',
  'converter.fullscreen.enter': 'Read fullscreen',
  'converter.fullscreen.exit': 'Exit fullscreen',
  'converter.summary.needsSave': 'Save this document to your account to summarise it.',
  'converter.summary.loading': 'Reading the document…',
  'converter.summary.error': 'Could not summarise this document.',
  'converter.summary.retry': 'Try again',
  'converter.summary.regenerate': 'Regenerate',

  /*
   * When a file does not come through: what was dropped, what was too big, what the conversion
   * itself had to say, and what a document that converted but would not fit is.
   *
   * The reason is always a second sentence rather than a clause bolted onto the first, because the
   * toast has two lines and a reason is what somebody can act on. `{conversion}` is the name from
   * `content.conversions`, so the failure says "Word → Markdown did not work" in every language.
   */
  'converter.reject.title': 'Not a file this can convert',
  'converter.reject.extension': '{name} — {extensions} is what this page takes.',
  'converter.reject.mixed':
    'Those are {count} different kinds of file. Convert one kind at a time.',
  'converter.toolarge.one': 'File is too large',
  'converter.toolarge.many': 'Those files are too large',
  'converter.toolarge.detail': '{size} — the limit for one document is {limit}.',
  'converter.converted': 'Converted to {format}',
  'converter.notkept.title': 'Converted, but not saved to your account',
  'converter.notkept.detail':
    'A kept document can be {limit}; this one is {size}. Download it — it is ready.',
  'converter.failed': '{conversion} did not work',
  'converter.failed.detail': 'The file could not be read.',
  'converter.error.norows': 'That file has no rows in it.',
  /* `{why}` is the converter's own account of it, which for a Word file is mammoth's. */
  'converter.error.empty': 'Nothing came out of that document — {why}.',
  'converter.error.empty.why': 'the file has no text in it',
  /* The frame a PDF is printed from: never seen, read out by a screen reader. */
  'converter.print.frame': '{name} for printing',
  'converter.print.unprepared':
    'The document could not be prepared for printing.',

  /*
   * What the document is made of, one noun per count. The number is its own element on the line —
   * it is set in a heavier weight — so the word is translated on its own rather than as part of a
   * sentence with a hole in it.
   */
  'converter.stats.word': 'word',
  'converter.stats.words': 'words',
  'converter.stats.heading': 'heading',
  'converter.stats.headings': 'headings',
  'converter.stats.table': 'table',
  'converter.stats.tables': 'tables',
  'converter.stats.codeblock': 'code block',
  'converter.stats.codeblocks': 'code blocks',
  'converter.stats.link': 'link',
  'converter.stats.links': 'links',
  'converter.stats.image': 'image',
  'converter.stats.images': 'images',

  /* The list of everything converted: its header, its filters, its rows and its columns. */
  'history.title': 'History',
  /*
   * Saving, which is now something a person does rather than something that happens to them.
   *
   * A conversion stays in this browser; the account gets a document when the button is pressed. So
   * the list has two kinds of row, and `history.mixed` is what the page says when it holds both.
   */
  'converter.save': 'Save',
  'converter.saved': 'Saved',
  'converter.save.hint': 'Keeps it in your account, on every device.',
  'converter.save.hint.signedout':
    'Sign in to keep it in your account. Until then it stays in this browser.',
  'converter.save.done': 'Saved to your account',
  'converter.share.hint.unsaved': 'Save it first — a link needs the document in your account.',
  'history.row.unsaved': 'Not saved',
  'history.mixed': 'Saved documents, and what this browser converted',

  'history.synced': 'Saved to your account',
  'history.local': 'Kept in this browser — sign in to reach them anywhere',
  'history.usage':
    '· {bytes} of {maxBytes} · {documents} of {maxDocuments} documents',
  'history.empty.title': 'No conversions yet',
  'history.empty.synced':
    'Every file you convert is saved to your account — open it from any device.',
  'history.empty.local':
    'Every file you convert shows up here. Sign in to keep the list across devices.',
  'history.empty.action': 'Convert a file',
  'history.drop.title': 'Drop files',
  'history.drop.hint':
    'or click to browse — several files are chained into one document',
  'history.search.placeholder': 'Search by name',
  'history.search.label': 'Search history by file name',
  'history.search.clear': 'Clear search',
  'history.chip.all': 'All formats',
  'history.chip.shared': 'Shared with me',
  'history.shared.one': '{count} document shared with you',
  'history.shared.many': '{count} documents shared with you',
  'history.count.one': '{count} file',
  'history.count.many': '{count} files',
  'history.count.filtered.one': '{found} of {total} file',
  'history.count.filtered.many': '{found} of {total} files',
  'history.merge': 'Merge',
  'history.merge.hint':
    'Chain the selected files into one document, oldest first',
  'history.merge.hint.few': 'Pick at least two files to chain',
  'history.download': 'Download',
  'history.delete': 'Delete',
  'history.clear': 'Clear history',
  'history.column.file': 'File',
  'history.column.type': 'Type',
  'history.column.sharedby': 'Shared by',
  'history.column.size': 'Source size',
  'history.column.content': 'Content',
  'history.column.converted': 'Converted',
  'history.column.actions': 'Actions',
  'history.row.someone': 'someone',
  'history.row.select': 'Select {name}',
  'history.row.open': 'Open preview',
  'history.row.open.label': 'Open {name}',
  'history.row.unavailable': 'Source was too large to keep locally',
  'history.row.share': 'Share',
  'history.row.share.label': 'Share {name}',
  'history.row.versions': 'Versions',
  'history.row.versions.label': 'See versions of {name}',
  'history.row.download.label': 'Download {name}',
  'history.row.remove': 'Remove from history',
  'history.row.stats.one': '{words} words · {headings} heading',
  'history.row.stats.many': '{words} words · {headings} headings',

  /*
   * What the list says when it has done something, or could not.
   *
   * `history.error.*` are `useHistory`'s: the hook has no words of its own, so the screen hands it
   * a `t` and it reports in the reader's language. A server's own refusal is passed on as the
   * `{reason}` of one of these rather than shown on its own, since it arrives in English whatever
   * the reader speaks — and `history.error.delete.reason` is what stands in when it says nothing.
   */
  'history.error.load': 'Could not load history',
  'history.error.save': 'Could not save file',
  'history.error.delete': 'Could not delete: {reason}',
  'history.error.delete.reason': 'server refused',
  'history.error.delete.some':
    '{failed} of {total} files could not be deleted',
  'history.error.clear': 'Could not clear the history',
  'history.source.missing': 'The source of this file is no longer available',
  'history.download.done': 'File downloaded',
  'history.download.none': 'Nothing could be downloaded',
  'history.download.one': '{format} file downloaded',
  'history.download.many': '{count} {format} files downloaded',
  'history.merge.none': 'Nothing to merge',
  'history.merge.none.detail':
    'The sources of these files are no longer available.',
  'history.removed.one': 'File removed',
  'history.removed.many': '{count} files removed',
  'history.cleared': 'History cleared',

  /*
   * The blog index. The articles themselves are not in the catalogue — see `content.ts` — so a
   * card's title, description and tag are the English the piece was written in, and only the
   * furniture around them is here.
   */
  'blog.eyebrow': 'Blog',
  'blog.title': 'Markdown, and what to do with it',
  'blog.blurb':
    'Conversion, syntax that breaks, publishing, and getting the whole thing to run without you.',
  'blog.chip.all': 'All',
  'blog.empty': 'Nothing under that tag yet.',
  'blog.card.meta': '{date} · {minutes} min read',

  /* One article: the furniture around a piece of prose that stays in English. */
  'article.toc': 'In this article',
  'article.meta': '{date} · {minutes} min read',
  'article.meta.updated': '{date} · updated {updated} · {minutes} min read',
  'article.share': 'Share',
  'article.cta.text':
    'This page was written in Markdown and rendered by the converter it describes.',
  'article.cta.button': 'Convert a file',
  'article.more.eyebrow': 'Next',
  'article.more.title': 'Keep reading',
  'article.more.meta': '{minutes} min read',
  'article.missing.title': 'No such article',
  'article.missing.blurb':
    'It may have been renamed. The index has everything that exists.',
  'article.missing.back': 'Back to the blog',

  /*
   * The invitation in the middle of an article, and the only one inside the prose.
   *
   * The button says the conversion's own label rather than a slogan, so it is a promise about
   * where the click goes; which conversion that is comes from the article's own links. See
   * `src/lib/article-cta.ts`.
   */
  'article.cta.title': 'Convert a file while you are reading',
  'article.cta.blurb': 'It happens in your browser: nothing is uploaded, and there is no account to make.',

  /*
   * The five pages that are only words. Their own text is in `pages.ts`, keyed by page; these two
   * are what the renderer says around it.
   *
   * The closing line is split because a link sits inside it: `page.questions` is the sentence up
   * to the link and `page.questions.link` is the words the anchor carries. A translator who needs
   * the link earlier in the sentence cannot get it from here, which is the price of the anchor.
   */
  'page.updated': 'Last updated {date}',
  'page.questions': 'Questions about any of this go to',
  'page.questions.link': 'the repository’s issues',

  /*
   * The extension page's buttons, one per store it is in.
   *
   * Here rather than beside that page's own words because there is a button per store and the
   * catalogue gives a page one `action`. Which of them a reader sees is decided by which stores
   * have an address in `src/lib/pages.ts`.
   */
  'extension.store.chrome': 'Add it to Chrome',
  'extension.store.firefox': 'Add it to Firefox',

  /*
   * A document somebody sent you, at /open/<token>.
   *
   * The app's own screen, so it follows the reader's language like every other one. The copy the
   * server renders at /s/<token> is a different page for a reader we know nothing about, and its
   * words are not in here — see `src/lib/i18n/content.ts`.
   *
   * Its Download button and its Sign in button say what those buttons say everywhere else, so they
   * read `converter.download` and `header.signin` rather than keys of their own.
   */
  'shared.loading': 'Opening the document…',
  'shared.meta': 'shared · converted {date}',
  'shared.badge': 'Shared with you',
  'shared.save': 'Save a copy',
  'shared.saved': 'Saved to your account',
  'shared.save.done': 'A copy is on your account',
  'shared.save.error': 'The copy could not be saved',
  'shared.cta.title': 'This document was made with TransformPipe',
  'shared.cta.body': 'A web page, a Word file, a PDF or a spreadsheet, turned into a clean document — converted in your browser, so the file never leaves it. An account keeps your documents and shares them the way this one was shared with you.',
  'shared.cta.primary': 'Convert a file — free',
  'shared.cta.secondary': 'Create an account',

  /* The support page's form. It fills in a GitHub issue; it does not send anything itself. */
  'support.form.title': 'Report something',
  'support.form.blurb':
    'Two fields, and the issue opens on GitHub with both already written into it.',
  'support.form.summary': 'What happened, in one line',
  'support.form.summary.placeholder': 'Tables come out empty when I convert a .docx',
  'support.form.details': 'What you expected, and what you got',
  'support.form.details.placeholder':
    'I converted a Word file with a three-column table. The headings arrived, the rows did not. Chrome 140 on macOS.',
  'support.form.open': 'Open the issue on GitHub',
  'support.form.note':
    'Nothing leaves this page: it opens GitHub, where you press Submit. A GitHub account is needed.',
  'shared.signin.title': 'This document was shared with specific people',
  'shared.signin.detail': 'Sign in with the address it was shared with.',
  'shared.missing.title': 'This link does not open a document',
  'shared.missing.action': 'Convert your own file',

  /* Sharing a document. */
  'dialog.share.title': 'Share',
  'dialog.share.mode.private': 'Private',
  'dialog.share.mode.link': 'Anyone with the link',
  'dialog.share.mode.people': 'Specific people',
  'dialog.share.private.note':
    'Only you can open this document. Pick a mode above to share it.',
  'dialog.share.link': 'Link',
  'dialog.share.link.field': 'Share link',
  'dialog.share.link.note': 'Anyone with this link can read the document.',
  'dialog.share.people.note':
    'Only the people below can open it, after signing in with that address. Each one is emailed the link when you add them.',
  'dialog.share.people.empty': 'Nobody yet — the link opens for you only.',
  'dialog.share.email.label': 'Recipient email',
  'dialog.share.add': 'Add',
  'dialog.share.remove.label': 'Remove {email}',
  'dialog.share.error': 'Sharing failed',

  /* API keys, and the assistants that have been let in. */
  'dialog.keys.title': 'API keys',
  'dialog.keys.blurb':
    'Convert and share documents from a script, a terminal or CI — and the assistants you have connected.',
  'dialog.keys.name.placeholder': 'What will use it — “CI”, “my laptop”',
  'dialog.keys.name.label': 'Key name',
  'dialog.keys.create': 'Create',
  'dialog.keys.create.error': 'Could not create the key',
  'dialog.keys.fresh': 'Copy it now — it is not shown again',
  'dialog.keys.empty':
    'No keys yet. A key can read, write and share your documents — it cannot touch your account or these keys.',
  'dialog.keys.revoked': '{name} · revoked',
  'dialog.keys.meta': '{prefix}… · {used}',
  'dialog.keys.used': 'used {when}',
  'dialog.keys.never': 'never used',
  'dialog.keys.forget': 'Remove from the list',
  'dialog.keys.forget.label': 'Remove {name}',
  'dialog.keys.revoke': 'Revoke — stops it working immediately',
  'dialog.keys.revoke.label': 'Revoke {name}',
  'dialog.keys.grants': 'Connected assistants',
  'dialog.keys.grant.meta': 'connected {since} · {used}',
  'dialog.keys.disconnect': 'Disconnect — it stops acting as you immediately',
  'dialog.keys.disconnect.label': 'Disconnect {name}',

  /* The version chain of a document, and the diff between two of its versions. */
  'dialog.versions.title': 'Versions',
  'dialog.versions.blurb': 'Documents linked together as versions of the same thing.',
  'dialog.versions.back': 'Back to the list',
  'dialog.versions.compare': 'Compare with previous',
  'dialog.versions.error': 'Could not load that comparison',

  /* Outbound webhooks: a document was created, or shared. */
  'dialog.webhooks.title': 'Webhooks',
  'dialog.webhooks.blurb':
    'A signed POST to a URL of yours when a document is created or shared.',
  'dialog.webhooks.url.placeholder': 'https://your-server.example/webhook',
  'dialog.webhooks.url.label': 'Webhook URL',
  'dialog.webhooks.url.error': 'url must be an https:// address',
  'dialog.webhooks.create': 'Add',
  'dialog.webhooks.create.error': 'Could not create the webhook',
  'dialog.webhooks.fresh':
    'The signing secret — verify deliveries with it. You can see it again with the eye icon below.',
  'dialog.webhooks.empty':
    'No webhooks yet. Add one to be notified when a document is created or shared.',
  'dialog.webhooks.status.never': 'No deliveries yet',
  'dialog.webhooks.status.ok': 'Delivered {when}',
  'dialog.webhooks.status.failed': 'Last delivery failed, {when}',
  'dialog.webhooks.reveal': 'Show the signing secret',
  'dialog.webhooks.reveal.label': 'Show the signing secret for {url}',
  'dialog.webhooks.reveal.error': 'Could not read the secret',
  'dialog.webhooks.revoke': 'Remove this webhook',
  'dialog.webhooks.revoke.label': 'Remove the webhook for {url}',

  /* The foot of the site. The column of conversions and the legal links get their words elsewhere. */
  'footer.tagline':
    'Document conversion for people, apps and AI agents.',
  /*
   * The live preview at /markdown-live-preview, and the paste box on the converter.
   *
   * `live.sample` is what the page opens with, so it is words rather than lorem: an empty editor
   * shows nothing of what the page does, to a reader or to a search result.
   */
  'converter.paste.open': 'Or paste {extension} text',
  /** For a binary source: `converter.paste.open`'s extension would read as "paste .zip text". */
  'converter.paste.open.disabled': 'Paste text',
  'converter.paste.unavailable': 'There is no text to paste for {extension} — upload the file itself',
  'converter.paste.label': 'Paste {extension} text',
  'converter.paste.close': 'Close',
  'converter.paste.placeholder': 'Paste or type here, then convert.',
  'converter.paste.convert': 'Convert',
  'converter.paste.count': '{count} characters',
  'footer.live': 'Live preview',
  'live.menu.hint': 'Type and watch it render',
  'converter.paste.live': 'Live preview instead',
  'live.eyebrow': 'Live preview',
  'live.title': 'Markdown live preview',
  'live.lede':
    'Type or paste Markdown on the left and watch the document build itself on the right — tables, highlighted code, Mermaid diagrams and LaTeX maths included. Nothing is uploaded: the text stays in this tab.',
  'live.renders': 'What renders here',
  'live.renders.gfm': 'GitHub Flavored Markdown',
  'live.renders.tables': 'Tables and task lists',
  'live.renders.code': 'Syntax-highlighted code',
  'live.renders.mermaid': 'Mermaid diagrams',
  'live.renders.math': 'LaTeX maths',
  'live.bare': 'That looks like a Mermaid diagram on its own. Markdown needs it inside a fence to draw it.',
  'live.bare.action': 'Wrap it in a fence',
  'live.save': 'Convert and keep',
  'live.save.hint':
    'Opens it as a document: in your history, ready to share or download in another format.',
  'live.editor': 'Markdown',
  'live.preview': 'Preview',
  'live.copy': 'Copy HTML',
  'live.download': 'Download .html',
  'live.filename': 'preview',
  'live.note':
    'The same converter the rest of the site uses, so what you see here is what a downloaded file contains — diagrams and formulas travel inside it, with no stylesheet or font to fetch. Raw HTML in the source is sanitised.',
  'live.seo.title': 'Markdown live preview',
  'live.seo.description':
    'Paste Markdown and see it rendered beside you: GitHub Flavored Markdown, syntax-highlighted code, Mermaid diagrams and KaTeX maths. Copy the HTML or download a self-contained file.',
  'live.sample':
    '# Markdown live preview\n\nType on the left. The document on the right follows, and the styles are the ones a downloaded file **carries with it**.\n\n- GitHub Flavored Markdown, sanitised.\n- Tables, task lists, quotes and code.\n\n| Format | Becomes |\n| --- | --- |\n| Markdown | HTML |\n\nCode is highlighted by language:\n\n```ts\nexport const render = (md: string) => toHtml(md); // one converter everywhere\n```\n\nMaths between dollars: $E = mc^2$, $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$\n\nAnd a diagram from a fence:\n\n```mermaid\nflowchart LR\n  MD[Markdown] --> TP[TransformPipe]\n  TP --> HTML\n  TP --> Word\n```\n',

  /*
   * The changelog page, at /changelog and linked from the footer's Resources.
   *
   * Only the chrome is here. The entries are `src/lib/changelog.ts`, in English, for the reason
   * `ChangelogPage` gives: a changelog grows by an entry per release, and five translations per
   * entry is a cost that gets skipped after the second one.
   */
  'changelog.eyebrow': 'Changelog',
  'changelog.title': 'What has shipped',
  'changelog.lede':
    'Every release, and the changes under it that somebody would notice. Newest first; the versions are the tags in the repository.',
  'changelog.years': 'Browse by year',
  'changelog.scope':
    'Customer-facing changes only. Internal refactors and infrastructure work are not listed, and the entries themselves are written in English.',
  'changelog.seo.title': 'Changelog',
  'changelog.seo.description':
    'Every TransformPipe release and the changes under it, newest first.',
  'changelog.more': 'Read the whole story',
  'changelog.back': 'All of the changelog',
  'changelog.entry.eyebrow': 'Release note',
  'changelog.entry.missing.title': 'No such release note',
  'changelog.entry.missing.body': 'Nothing has shipped at this address. The changelog lists everything that has.',
  'footer.changelog': 'Changelog',

  /*
   * The page for an address that is not a page.
   *
   * `notfound.note` is the one line here that is not navigation: a reader who mistyped something
   * knows they did, and a reader who followed a link from these pages has found a defect and is
   * the only person who can say so.
   */
  'notfound.eyebrow': '404',
  'notfound.title': 'That address is not a page',
  'notfound.lede':
    'Nothing on this site answers to it. Either a character is wrong, or a link somewhere else points at something that has moved.',
  'notfound.converter': 'Convert a file',
  'notfound.docs': 'Read the documentation',
  'notfound.blog': 'Browse the blog',
  'notfound.note': 'If a link on this site sent you here, that is a bug rather than a typo.',
  'notfound.seo.title': 'Page not found',
  'notfound.seo.description':
    'This address does not match any page on the site. The converter, the documentation and the blog are one click away.',

  'footer.note': '© Raudar Labs {year}',
  'footer.converter': 'Converter',
  'footer.resources': 'Resources',
  'footer.howto': 'How to',
  'footer.company': 'Company',
  'footer.legal': 'Legal',
  'footer.docs': 'Documentation',
  'footer.blog': 'Blog',
  'footer.faq': 'FAQ',
  /* Read out after the link's own name, so it opens with the space that separates them. */
  'footer.external': ' (opens in a new tab)',
};
