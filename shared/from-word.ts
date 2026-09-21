import { PICTURE_BYTES } from './limits.js';
import type { Budget } from './pictures.js';

/*
 * A Word file's own pictures, kept — without putting a megabyte of base64 through an HTML parser.
 *
 * `mammoth` reads the pictures out of the `.docx` itself and, left alone, writes every one of them
 * into its HTML as a `data:` URI. That was never the problem; the problem was what came next.
 * `htmlToMarkdown` used to be configured to throw those away, so a Word document converted here
 * arrived with no pictures at all, having already been handed every one of them.
 *
 * Turning that option on was the obvious fix and it is the wrong one. Measured on a 3.5 MB `.docx`
 * holding three photographs: mammoth produces 4.7 MB of HTML in 224 ms, and `node-html-markdown`
 * then does not finish. Not slowly — it was still going after nine minutes, because an `<img>`
 * whose `src` attribute is two million characters long is not something an HTML parser is built
 * for, and the cost is not linear in that length.
 *
 * So the bytes never go near the parser. Each picture is weighed as mammoth reads it, held here
 * under its own number, and the HTML gets `<img src="x-transformpipe-picture:0">` — twenty-six
 * characters. The Markdown comes out in sixty milliseconds, and the pictures are put back into it
 * afterwards, by which point there is nothing left to parse.
 *
 * Weighing them here has a second benefit worth the trouble on its own: a picture that will not
 * fit is never encoded at all, rather than encoded, carried through two passes and then dropped.
 */

/** What mammoth hands to an image handler. Structural, so this file imports nothing from it. */
interface WordImage {
  contentType?: string;
  readAsBase64String(): Promise<string>;
}

/**
 * The scheme is invented and that is the point: it has to survive `htmlToMarkdown` untouched, so
 * it must not look relative, must not look like a `data:` URI — which that converter is set to
 * discard — and must not be anything a browser would try to fetch if one ever escaped.
 */
const MARK = 'x-transformpipe-picture:';

const PLACED = new RegExp(`!\\[([^\\]]*)\\]\\(${MARK}(\\d+|over)\\)`, 'g');

export interface WordPictures {
  /** Give this to `mammoth.images.imgElement`. */
  read(image: WordImage): Promise<{ src: string }>;
  /** Run this over the Markdown once it is out of the HTML parser. */
  restore(markdown: string): string;
}

export function wordPictures(budget: Budget): WordPictures {
  const kept: string[] = [];

  return {
    read: async (image) => {
      const base64 = await image.readAsBase64String();

      if (base64.length > PICTURE_BYTES || base64.length > budget.left) {
        return { src: `${MARK}over` };
      }

      budget.left -= base64.length;
      kept.push(`data:${image.contentType || 'image/png'};base64,${base64}`);

      return { src: `${MARK}${kept.length - 1}` };
    },

    restore: (markdown) =>
      markdown.replace(PLACED, (_, alt: string, at: string) => {
        /*
         * A picture too large to carry has nothing to fall back to — there is no file beside the
         * document to point at, the way there is in an archive — so what is left is the words
         * somebody wrote about it, which is the rule `notes.ts` already follows for an embed it
         * cannot bring along.
         */
        if (at === 'over') return alt.trim() ? `*${alt.trim()}*` : '';

        return `![${alt}](${kept[Number(at)]})`;
      }),
  };
}
