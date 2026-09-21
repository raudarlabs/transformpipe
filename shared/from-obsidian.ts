import { rewriteWikilinks, stripFrontmatter } from './notes.js';
import { embedPictures, pictureBudget, pictureFinder } from './pictures.js';
import {
  buildTocDocument,
  readZipPictures,
  readZipTextFiles,
  withoutDuplicateTitle,
  type TocPage,
} from './zip-import.js';

/*
 * An Obsidian vault, zipped — either the vault folder itself compressed as-is, or the output of a
 * vault-export plugin. Either way it is a tree of `.md` files, and a note's title is its file name,
 * not something written inside it the way Confluence's `<title>` is.
 *
 * The one thing worth doing beyond the zip-and-merge every importer here shares is wikilinks:
 * `[[Note]]`, `[[Note|Shown text]]`, `[[Note#Heading]]`, and their `![[...]]` embed form. Obsidian
 * resolves these against the vault at read time; merged into one document there is no vault left to
 * resolve them against, so only the words survive. That rule and the one about frontmatter now
 * live in `notes.ts`, because the shared renderer needs them too: a note pasted on its own used to
 * keep both, so the same file converted two ways came out two different documents.
 */

function titleFromFileName(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/i, '').trim() || 'Untitled';
}

export async function obsidianZipToMarkdown(bytes: Uint8Array): Promise<string> {
  const [pages, pictures] = await Promise.all([
    readZipTextFiles(bytes, '.md'),
    readZipPictures(bytes),
  ]);

  if (pages.length === 0) {
    throw new Error('No Markdown notes found in that .zip — is it an Obsidian vault?');
  }

  /*
   * A vault resolves an embed by file name wherever the file is filed, so the question
   * `rewriteWikilinks` asks is whether the archive holds a picture of that name at all — the same
   * question, and the same answer, that `pictureFinder` falls back to a line later.
   */
  const names = new Set([...pictures.keys()].map((path) => path.split('/').pop()!.toLowerCase()));
  const budget = pictureBudget();

  const tocPages: TocPage[] = pages.map((page) => {
    const title = titleFromFileName(page.path);
    const folder = page.path.split('/').slice(0, -1).join('/');
    const body = embedPictures(
      rewriteWikilinks(withoutDuplicateTitle(stripFrontmatter(page.text), title), (name) =>
        names.has(name.toLowerCase())
      ),
      pictureFinder(pictures, folder),
      budget
    );

    return { title, markdown: `# ${title}\n\n${body}` };
  });

  return buildTocDocument('Contents', tocPages);
}
