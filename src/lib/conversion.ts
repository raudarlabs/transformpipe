import type { ConversionId } from '@shared/conversions';
import type { getDocStats } from '@shared/markdown';
import { convertFile, type Converted } from './convert';
import type { FromWorker } from './convert-worker';
import type { Translate } from './i18n/context';

/*
 * Converting a file without holding up the page: in a worker where there is one, here where there
 * is not, with the same answer either way.
 *
 * `onProgress` hears where it has got to — pages of an export, then the preview being drawn — so
 * the screen can say so instead of freezing. When the worker brings the preview's HTML and the
 * document's numbers back with it, they come in `prepared` and the page does not redo them.
 */

export type ConversionProgress =
  | { stage: 'reading' }
  | { stage: 'pages'; done: number; total: number }
  | { stage: 'pictures'; done: number; total: number }
  | { stage: 'rendering' };

export interface Prepared {
  html: string;
  stats: ReturnType<typeof getDocStats>;
  problems: number;
}

const MARKER = '\u0001tp:';

/** An error's words, from the worker's marker: the key and its values, put into this page's language. */
function untangle(text: string, t: Translate): string {
  if (!text.startsWith(MARKER)) return text;

  try {
    const [key, values] = JSON.parse(text.slice(MARKER.length)) as [string, Record<string, string | number>];

    return t(
      key,
      Object.fromEntries(
        Object.entries(values).map(([name, value]) => [name, typeof value === 'string' ? untangle(value, t) : value])
      )
    );
  } catch {
    return text;
  }
}

export async function runConversion(
  id: ConversionId,
  file: File,
  t: Translate,
  onProgress: (progress: ConversionProgress) => void
): Promise<Converted & { prepared?: Prepared }> {
  onProgress({ stage: 'reading' });

  if (typeof Worker === 'undefined') {
    return convertFile(id, file, t, (done, total) => onProgress({ stage: 'pages', done, total }));
  }

  const answer = await new Promise<FromWorker & { type: 'done' | 'error' }>((resolve) => {
    const worker = new Worker(new URL('./convert-worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      const message = event.data;

      if (message.type === 'progress') {
        onProgress({ stage: 'pages', done: message.done, total: message.total });
      } else if (message.type === 'stage') {
        onProgress({ stage: 'rendering' });
      } else if (message.type === 'done' || message.type === 'error') {
        worker.terminate();
        resolve(message);
      }
    };

    worker.onerror = (event) => {
      event.preventDefault();
      worker.terminate();
      resolve({ type: 'error', message: event.message || 'worker failed', unavailable: true });
    };

    worker.postMessage({ id, file });
  });

  if (answer.type === 'done') {
    const { markdown, name, kind, html, stats, problems } = answer;

    return { markdown, name, kind, prepared: { html, stats, problems } };
  }

  /* The worker could not do this kind of file at all; the page can. */
  if (answer.unavailable) {
    return convertFile(id, file, t, (done, total) => onProgress({ stage: 'pages', done, total }));
  }

  throw new Error(untangle(answer.message, t));
}

export type SplitResult = Extract<FromWorker, { type: 'split' }>['split'];

/**
 * An export as its pages, in the worker. No fallback to this thread: the pages of a big export are
 * exactly the work that froze the page, and a browser with no workers at all gets the one-document
 * conversion instead (the caller checks `canSplit`).
 */
export const canSplit = () => typeof Worker !== 'undefined';

export function runSplit(
  id: ConversionId,
  file: File,
  t: Translate,
  onProgress: (progress: ConversionProgress) => void
): Promise<SplitResult> {
  onProgress({ stage: 'reading' });

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./convert-worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      const message = event.data;

      if (message.type === 'progress') {
        onProgress({ stage: 'pages', done: message.done, total: message.total });
      } else if (message.type === 'stage') {
        onProgress(
          message.stage === 'pictures'
            ? { stage: 'pictures', done: message.done, total: message.total }
            : { stage: 'rendering' }
        );
      } else if (message.type === 'split') {
        worker.terminate();
        resolve(message.split);
      } else if (message.type === 'error') {
        worker.terminate();
        reject(new Error(untangle(message.message, t)));
      }
    };

    worker.onerror = (event) => {
      event.preventDefault();
      worker.terminate();
      reject(new Error(event.message || 'The export could not be read'));
    };

    worker.postMessage({ id, file, split: true });
  });
}
