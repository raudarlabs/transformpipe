/*
 * What the connector is, in one place.
 *
 * The documentation page and the server both read this. That matters more than it looks: a page
 * that lists a tool the server no longer has sends people somewhere that does not exist, and they
 * conclude the product is broken rather than that the sentence is. Here the server's tool table is
 * typed by `McpToolName`, so a tool renamed on one side stops the build on the other.
 */

export const MCP_PATH = '/api/mcp';

/**
 * TransformPipe's listing in Claude's connector directory, since 26 September 2026.
 *
 * The one-click way in: Claude opens the listing, "Connect" starts the same sign-in a custom
 * connector would. The address above stays for every other client, and for a Claude whose
 * organisation has the directory switched off.
 */
export const CLAUDE_DIRECTORY = 'https://claude.ai/directory/tp';

/**
 * Where ChatGPT adds a connector of your own: Plugins, then Add, then Create MCP App. Not a
 * listing — TransformPipe is not in ChatGPT's directory yet — so the page that sends people here
 * also gives them the address to paste. Checked in ChatGPT on 1 October 2026.
 */
export const CHATGPT_PLUGINS = 'https://chatgpt.com/plugins';

export const MCP_TOOL_NAMES = [
  'tp_search_documentation',
  'tp_convert_from_markdown',
  'tp_convert_to_markdown',
  'tp_save_document',
  'tp_update_document',
  'tp_list_documents',
  'tp_list_folders',
  'tp_create_folder',
  'tp_move_documents',
  'tp_get_document',
  'tp_summarize_document',
  'tp_document_versions',
  'tp_share_document',
  'tp_share_folder',
  'tp_update_folder',
  'tp_delete_folder',
  'tp_usage',
  'tp_delete_document',
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

/*
 * The names the first two tools had until 15 October 2026. A client that connected before then
 * holds a tool list with these in it, so the server still answers them — but does not list them,
 * and nothing new is written against them.
 */
export const MCP_TOOL_ALIASES: Record<string, McpToolName> = {
  tp_help: 'tp_search_documentation',
  tp_convert_markdown: 'tp_convert_from_markdown',
};

/** One line each, for the page. The server holds the long descriptions the model reads. */
export const MCP_TOOLS: Record<McpToolName, string> = {
  tp_search_documentation: 'Searches the TransformPipe documentation and returns the sections that match a question.',
  tp_convert_from_markdown:
    'Converts Markdown to sanitised HTML, Confluence storage format, Jira wiki markup or Slack mrkdwn, optionally as a complete HTML document.',
  tp_convert_to_markdown:
    'Converts HTML, CSV, TSV, JSON, plain text, rich text or an Evernote export to Markdown. Binary files — Word, Excel, PowerPoint, EPUB, OpenDocument, export zips — are converted in the app or through the API.',
  tp_save_document:
    'Saves a new document — Markdown, or HTML, CSV, TSV, JSON, plain text, rich text or an Evernote export converted on save — optionally into a folder, which is created if missing. Publishing it, or saving it into a shared folder, requires an explicit confirmation.',
  tp_update_document:
    'Replaces the text of an existing document, keeping its id and link and the previous text as a revision. Changing a shared document requires an explicit confirmation.',
  tp_list_documents:
    'Lists the documents on the account with their ids and folders, optionally filtered by text or by folder.',
  tp_list_folders:
    'Lists the account\'s folders as a tree, with each folder\'s id, document count and sharing state, and the account\'s totals.',
  tp_create_folder: 'Creates a folder at the top level or inside another, given by id or path.',
  tp_move_documents:
    'Moves documents into a folder or out of all folders. Moving them into a shared folder requires an explicit confirmation.',
  tp_get_document: 'Returns one document as its Markdown source or as rendered HTML.',
  tp_summarize_document:
    'Summarises a document with Google\'s Gemini model and caches the summary on the account.',
  tp_document_versions:
    'Returns a document\'s history: the earlier texts its updates replaced, and any documents linked to it as versions.',
  tp_share_document:
    'Sets who can open a document — anyone with a link, named addresses, or the owner alone — and adds or removes individual readers. Sharing requires an explicit confirmation; revoking does not.',
  tp_share_folder:
    'Sets who can open a folder and everything in it — anyone with a link, named addresses, or the owner alone. Sharing requires an explicit confirmation; revoking does not.',
  tp_update_folder:
    'Renames a folder or moves it, with its contents, under another folder or to the top level. Moving it under a shared folder requires an explicit confirmation.',
  tp_delete_folder:
    'Deletes a folder — moving its contents up a level, or deleting its documents permanently with it. Always requires an explicit confirmation.',
  tp_usage: 'Returns the account\'s storage and document count against their limits.',
  tp_delete_document:
    'Permanently deletes one document. Always requires an explicit confirmation.',
};
