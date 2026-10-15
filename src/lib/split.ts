import type { ConversionId } from '@shared/conversions';
import type { SplitExport } from '@shared/split-export';

/*
 * The conversions whose file is many pages, and how to read one as those pages.
 *
 * Loaded on demand like every converter (`convert.ts`). The name of the file is the import's
 * folder name where the export itself names nothing better.
 */

export const SPLITTABLE = new Set<ConversionId>([
  'notion-to-markdown',
  'confluence-to-markdown',
  'obsidian-to-markdown',
]);

export async function splitFile(
  id: ConversionId,
  file: File,
  onProgress?: (done: number, total: number) => void,
  prepare?: (pictures: Map<string, Uint8Array>) => Promise<void>
): Promise<SplitExport> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = file.name.replace(/\.zip$/i, '') || 'Export';

  switch (id) {
    case 'notion-to-markdown':
      return (await import('@shared/from-notion')).notionZipToPages(bytes, onProgress, name, prepare);
    case 'confluence-to-markdown':
      return (await import('@shared/from-confluence')).confluenceZipToPages(bytes, onProgress, prepare);
    case 'obsidian-to-markdown':
      return (await import('@shared/from-obsidian')).obsidianZipToPages(bytes, onProgress, prepare);
    default:
      throw new Error(`${id} is not an export of many pages`);
  }
}
