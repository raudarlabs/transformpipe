/*
 * Markdown going out as text: Confluence's storage format, Jira's wiki markup, Slack's mrkdwn.
 *
 * Each writer is loaded the first time somebody asks for its format, the way every converter
 * coming in is (see `convert.ts`): somebody converting Markdown to HTML should not download three
 * writers for formats they never asked about.
 */

export type TextExport = 'confluence' | 'jira' | 'slack';

export async function exportText(format: TextExport, markdown: string): Promise<string> {
  switch (format) {
    case 'confluence':
      return (await import('@shared/to-confluence')).markdownToConfluence(markdown);
    case 'jira':
      return (await import('@shared/to-jira')).markdownToJira(markdown);
    case 'slack':
      return (await import('@shared/to-slack')).markdownToSlack(markdown);
  }
}

export const isTextExport = (format: string): format is TextExport =>
  format === 'confluence' || format === 'jira' || format === 'slack';
