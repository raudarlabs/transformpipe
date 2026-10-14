/// <reference lib="webworker" />
import { FilterXSS } from 'xss';
import type { ConversionId } from '@shared/conversions';
import { checkDocument } from '@shared/check';
import { ALLOWED_ATTR, ALLOWED_TAGS, getDocStats, renderMarkdown } from '@shared/markdown';
import { convertFile } from './convert';

/*
 * A conversion, off the page's own thread.
 *
 * A 60 MB Confluence export took long enough to unpack and convert that Chrome offered to kill
 * the tab — and every other tab of the site with it, since they share a process. Nothing the page
 * drew could move while the work ran on the same thread, a progress message least of all. Here the
 * page stays free, and is told how far this has got.
 *
 * Everything after the conversion that is proportional to the document's size happens here too:
 * the HTML for the preview, its statistics and the document check's count. The HTML is sanitised
 * with the same allow-list and the same library the server uses for every shared page
 * (`server/render.ts`), because there is no DOM here for DOMPurify.
 *
 * The words of an error belong to the page's language, which this side does not have: `t` here
 * writes a marker carrying the key and its values, and `conversion.ts` turns it into words.
 */

const filter = new FilterXSS({
  whiteList: Object.fromEntries(ALLOWED_TAGS.map((tag) => [tag, [...ALLOWED_ATTR]])),
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
});

export const MARKER = '\u0001tp:';

const marked = (key: string, values?: Record<string, string | number>) =>
  `${MARKER}${JSON.stringify([key, values ?? {}])}`;

export type FromWorker =
  | { type: 'progress'; done: number; total: number }
  | { type: 'stage'; stage: 'rendering' }
  | {
      type: 'done';
      markdown: string;
      name: string;
      kind: ConversionId;
      html: string;
      stats: ReturnType<typeof getDocStats>;
      problems: number;
    }
  | { type: 'error'; message: string; unavailable?: boolean };

const post = (message: FromWorker) => (self as DedicatedWorkerGlobalScope).postMessage(message);

self.onmessage = async (event: MessageEvent<{ id: ConversionId; file: File }>) => {
  const { id, file } = event.data;
  let last = 0;

  try {
    const converted = await convertFile(id, file, marked, (done, total) => {
      // Often enough to move, rarely enough not to flood the page with a thousand messages.
      const now = Date.now();

      if (done === total || now - last > 100) {
        last = now;
        post({ type: 'progress', done, total });
      }
    });

    post({ type: 'stage', stage: 'rendering' });

    const html = renderMarkdown(converted.markdown, (raw) => filter.process(raw));

    post({
      type: 'done',
      ...converted,
      html,
      stats: getDocStats(converted.markdown, html),
      problems: checkDocument(converted.markdown).length,
    });
  } catch (cause) {
    post({
      type: 'error',
      message: cause instanceof Error ? cause.message : String(cause),
      // Something this side cannot do — a library that wants a DOM — rather than a bad file.
      unavailable: cause instanceof ReferenceError,
    });
  }
};
