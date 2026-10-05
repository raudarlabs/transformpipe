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
  'tp_help',
  'tp_convert_markdown',
  'tp_convert_to_markdown',
  'tp_save_document',
  'tp_update_document',
  'tp_list_documents',
  'tp_get_document',
  'tp_summarize_document',
  'tp_document_versions',
  'tp_share_document',
  'tp_usage',
  'tp_delete_document',
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

/** One line each, for the page. The server holds the long descriptions the model reads. */
export const MCP_TOOLS: Record<McpToolName, string> = {
  tp_help: 'Answers questions about TransformPipe from the documentation rather than from memory.',
  tp_convert_markdown:
    'Markdown in, sanitised HTML out. Optionally the whole self-contained document.',
  tp_convert_to_markdown:
    'HTML, CSV, TSV, JSON, plain text, rich text or an Evernote export in, Markdown out. A file that is bytes — Word, Excel, PowerPoint, EPUB, OpenDocument, an export zip — goes to the API or the app.',
  tp_save_document:
    'Saves Markdown to the account — or HTML, CSV, TSV, JSON, plain text, rich text or an Evernote export, converted on the way in. Publishing it in the same call takes an explicit confirmation.',
  tp_update_document:
    'New text for a document already on the account — the same id and the same link, the old text kept as a revision. Changing one that is shared takes an explicit confirmation.',
  tp_list_documents: 'What is on the account, with the id each other tool takes.',
  tp_get_document: 'One document, as its Markdown source or as rendered HTML.',
  tp_summarize_document:
    'A short summary of a document, cached on the account so asking again is free.',
  tp_document_versions:
    'A document\'s history: the texts its updates replaced, each readable again, and any documents linked to it as versions.',
  tp_share_document:
    'Changes who may open a document: a link, named addresses, or nobody. Opening it to anyone but the owner takes an explicit confirmation; revoking does not.',
  tp_usage: 'What the account is using against its limits.',
  tp_delete_document:
    'Deletes one document, permanently, and only with an explicit confirmation.',
};
