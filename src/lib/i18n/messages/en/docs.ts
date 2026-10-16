import type { Content } from '../../content';

/*
 * The documentation's sections in English: a title and the one sentence that says what the section
 * answers, keyed by the section's id.
 *
 * The ids and the order live in `src/lib/docs-sections.ts`, because an id is the anchor in the
 * address — `/docs#converting` — and an address is the same in every language. Every id in that
 * list needs a key here, and in every other locale.
 *
 * The summary is read on its own in the prerendered page, so it has to stand up without the
 * section under it.
 */
export const docs: Content['docs'] = {
  start: {
    title: 'Start here',
    summary:
      'Drop a file and you have the converted document and a download; sign in and the same documents follow you between devices, can be shared, and can be reached by a script.',
  },
  converting: {
    title: 'Converting',
    summary:
      'The twenty conversions — Markdown to HTML, Word, Confluence, Jira, Slack or EPUB, and HTML, Word, PowerPoint, Excel, OpenDocument, rich text, EPUB, CSV, JSON, plain text and Evernote, Notion, Confluence or Obsidian exports to Markdown — what each accepts, chaining several files into one document, the source tab, and the formats a download can hand over: Markdown, HTML, plain text, Word, Confluence, Jira, Slack, EPUB or a printed PDF.',
  },
  extension: {
    title: 'Browser extension',
    summary:
      'The page you are on, as Markdown, in one click — and the site’s conversions, running in the browser.',
  },
  history: {
    title: 'History',
    summary:
      'Folders in a tree beside the list, with drag and drop and a right-click menu; search, sortable columns, and a chip per conversion. Rows can be merged, moved, downloaded in any format, or deleted in bulk.',
  },
  folders: {
    title: 'Folders',
    summary:
      'A tree beside the history: make, rename, move and delete folders, drag documents into them, share one like a document — and do all of it from the API, the command line or an assistant.',
  },
  sharing: {
    title: 'Sharing',
    summary:
      'A link anyone can open, or named addresses that ask the reader to sign in — for a document or a whole folder, which its reader can save to their own account. Revoking drops the token, so a link already sent stops working. A link can end on a date or ask for a password, and the Views tab lists every open.',
  },
  account: {
    title: 'Account',
    summary:
      'Google sign-in, the theme, and API keys — shown once, stored as a hash, and unable to reach the account or the keys themselves.',
  },
  api: {
    title: 'API',
    summary:
      'Every endpoint under /api/v1, what each returns, and what the error statuses mean.',
  },
  webhooks: {
    title: 'Webhooks',
    summary:
      'A signed POST to a URL of yours when a document is created or shared, and how to verify it.',
  },
  cli: {
    title: 'Command line',
    summary:
      'A dependency-free client: login, push, list, rm and usage, with --share, --merge and --json.',
  },
  action: {
    title: 'GitHub Action',
    summary:
      'Publishes the Markdown a pull request changed and comments the links on it. Every input, and the two permissions it needs.',
  },
  assistant: {
    title: 'MCP',
    summary:
      'Add TransformPipe to Claude as a connector or to ChatGPT as an MCP app and it can convert, save, share and delete documents in this account — signed in as you, with no key to paste.',
  },
  embed: {
    title: 'Embedded solution',
    summary:
      'Frame the converter into your own interface with /embed. The file is converted in your visitor’s browser and reaches no server, yours or ours; the result comes out by postMessage.',
  },
  limits: {
    title: 'Limits',
    summary:
      '10 MB a text file to convert (50 MB an office file or a book, 250 MB an export .zip) and 4 MB to keep one in an account, 250 MB and 5,000 documents an account, 60 requests a minute. Reaching one refuses the write rather than deleting anything. A connector’s tool call counts as one request.',
  },
  faq: {
    title: 'Questions',
    summary:
      'The same answers the converter shows under its dropzone, kept in one place so the two cannot drift apart.',
  },
};
