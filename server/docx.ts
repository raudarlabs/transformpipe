import { markdownToDocx as writeDocx } from '../shared/to-docx.js';

/*
 * Markdown → .docx for the API and the account's own download route, by the same writer the
 * browser uses (`shared/to-docx.ts`): Word's own styles, lists, footnotes and bookmarks, from the
 * token stream the preview renders.
 *
 * It replaced a Markdown → HTML → .docx route through `@turbodocx/html-to-docx`, whose output was
 * direct formatting all the way down — headings that were bold Normal text, an empty navigation
 * pane — which is the thing a Word user notices first and cannot fix without retyping.
 *
 * Remote images never reach the writer from here. Fetching a picture would make this server
 * request an address the document's author chose — `![](http://169.254.169.254/latest/meta-data/)`
 * is a document like any other — so no `fetchPicture` is passed, and a picture at a web address is
 * written as a link under its description. A `data:` picture carries its own bytes and is kept. The
 * browser, which fetches as the reader, is the one that brings remote pictures into the file.
 */
export async function markdownToDocx(markdown: string, title: string): Promise<Buffer> {
  return Buffer.from(await writeDocx(markdown, { title: title.replace(/\.[^.]+$/, '') }));
}
