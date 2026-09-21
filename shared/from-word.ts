import { heldPictures, type Budget } from './pictures.js';

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

export interface WordPictures {
  /** Give this to `mammoth.images.imgElement`. */
  read(image: WordImage): Promise<{ src: string }>;
  /** Run this over the Markdown once it is out of the HTML parser. */
  restore(markdown: string): string;
}

export function wordPictures(budget: Budget): WordPictures {
  const held = heldPictures(budget);

  return {
    read: async (image) => {
      const base64 = await image.readAsBase64String();

      return { src: held.hold(`data:${image.contentType || 'image/png'};base64,${base64}`) };
    },

    restore: held.restore,
  };
}
