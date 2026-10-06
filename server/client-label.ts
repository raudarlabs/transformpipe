/*
 * Which assistant an OAuth client is, as one word from a short fixed list.
 *
 * A client names itself when it registers, so its name is a claim and can be anything. Reduced to
 * this list it can go where a free-form name must not: the counter's `source` column, which takes
 * only short values somebody planned for, and the admin page's badges. The same reduction as the
 * `client` column of radar.connections_daily in db/radar-readonly.sql, plus Obsidian, whose client
 * is our own and known by id.
 */

export type ClientLabel =
  | 'claude'
  | 'chatgpt'
  | 'obsidian'
  | 'extension'
  | 'cursor'
  | 'vscode'
  | 'windsurf'
  | 'gemini'
  | 'other';

export function clientLabel(clientId: string, name: string | null | undefined): ClientLabel {
  const n = name ?? '';

  if (/claude\.ai/i.test(clientId) || /claude/i.test(n)) return 'claude';
  if (/chatgpt\.com|openai\.com/i.test(clientId) || /chatgpt|openai/i.test(n)) return 'chatgpt';
  if (clientId === 'transformpipe-obsidian' || /obsidian/i.test(n)) return 'obsidian';
  if (/^transformpipe for /i.test(n)) return 'extension';
  if (/cursor/i.test(n)) return 'cursor';
  if (/visual studio code|vscode/i.test(n)) return 'vscode';
  if (/windsurf/i.test(n)) return 'windsurf';
  if (/gemini/i.test(n)) return 'gemini';

  return 'other';
}
