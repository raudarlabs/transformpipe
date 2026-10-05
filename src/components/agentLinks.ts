import type { StaticPageId } from '@/lib/pages';
import type { BrandName } from './BrandLogo';

/*
 * The assistants the header lists, in the order the assistants' table has them: each with its
 * own logo and the line that says how it connects. The names are the
 * pages' own labels, so a page renamed is renamed here too.
 *
 * One list for the bar's dropdown and the phone's menu, so the two cannot come to disagree about
 * which assistants there are.
 */
export const AGENT_LINKS: Array<{
  id: Extract<StaticPageId, 'agents-claude' | 'agents-chatgpt' | 'obsidian'>;
  logo: BrandName;
  hint: 'header.agents.claude' | 'header.agents.chatgpt' | 'header.agents.obsidian';
}> = [
  { id: 'agents-claude', logo: 'claude', hint: 'header.agents.claude' },
  { id: 'agents-chatgpt', logo: 'chatgpt', hint: 'header.agents.chatgpt' },
  { id: 'obsidian', logo: 'obsidian', hint: 'header.agents.obsidian' },
];
