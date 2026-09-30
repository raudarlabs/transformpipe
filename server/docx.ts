import { createRequire } from 'node:module';
import { buildStandaloneHtml } from '../shared/markdown.js';
import { markdownToHtml } from './render.js';

/*
 * Markdown → .docx, through the same HTML this app already produces rather than a second
 * Markdown parser. `@turbodocx/html-to-docx` is pure JavaScript — no headless browser, no native
 * binary — which is what makes it safe to load inside a Vercel Function; the maintained fork of a
 * package whose original has been dormant since 2023. Loaded lazily, like `mammoth` in `v1.ts`, so
 * no request that isn't asking for a .docx pays for it.
 */
/*
 * Remote images never reach the converter.
 *
 * `@turbodocx/html-to-docx` fetches anything with an http(s) `src` so it can embed the bytes, which
 * quietly turns "export this as Word" into a request made by our server to an address the
 * document's author chose — `![](http://169.254.169.254/latest/meta-data/)` is a document like any
 * other. The library has no allowlist and the sanitiser has no opinion about where an image lives,
 * so the only place to say no is here, on the way in.
 *
 * A `data:` URI survives because it carries its own bytes and asks nobody for them.
 *
 * Whole tags rather than the `src` attribute alone: an `<img>` with nowhere to point is not a
 * picture, and a Word document with an empty frame in it is worse than one without the frame.
 */
const withoutRemoteImages = (html: string) =>
  html.replace(/<img\b[^>]*>/gi, (tag) =>
    /\ssrc\s*=\s*["']data:image\//i.test(tag) ? tag : ''
  );

/*
 * Loaded with `require`, not `import()`. The package's `import` entry is `dist/html-to-docx.esm.js`
 * in a package with no `"type": "module"`, which a Node that goes by the file's extension reads as
 * CommonJS — and on Vercel every export failed with "Cannot use import statement outside a module"
 * while the dev server, which transforms the file first, never did. The `require` entry is the UMD
 * build, which loads as what it says it is on any Node.
 */
const requireFromHere = createRequire(import.meta.url);

export async function markdownToDocx(markdown: string, title: string): Promise<Buffer> {
  const HtmlToDocx = requireFromHere('@turbodocx/html-to-docx') as (
    html: string,
    header: string | null,
    options: Record<string, unknown>
  ) => Promise<ArrayBuffer | Buffer | Blob>;

  const html = buildStandaloneHtml({
    title,
    body: withoutRemoteImages(markdownToHtml(markdown)),
    theme: 'light',
  });

  const buffer = await HtmlToDocx(html, null, {
    title,
    font: 'Calibri',
  });

  return Buffer.from(buffer as ArrayBuffer);
}
