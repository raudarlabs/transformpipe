import { buildStandaloneHtml, markdownToHtml } from './markdown';
import { inlineDiagrams } from './mermaid';
import { obsidianHeadingLinks } from '@shared/to-obsidian';
import { markdownToText } from '@shared/to-text';
import { type DocFormat, toFileName } from './format';
import type { Translate } from './i18n/context';

/*
 * Handing a document over.
 *
 * Three places do it — the screen you just converted on, a row in the history, and a selection of
 * rows — and they had better agree, because the file that lands in somebody's downloads folder is
 * the product. One function, one naming rule, one set of formats.
 */

function save(fileName: string, contents: string, type: string) {
  saveBlob(fileName, new Blob([contents], { type }));
}

/** Same hand-off as `save`, for a file that already arrived as a `Blob` — a server response,
 * rather than something built in the browser. */
export function saveBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Hands over the document as what was asked for: the source, the built page, or the words. */
export async function downloadDoc(
  name: string,
  markdown: string,
  createdAt: number,
  theme: 'dark' | 'light',
  format: DocFormat
) {
  if (format === 'md') {
    save(toFileName(name, 'md'), markdown, 'text/markdown;charset=utf-8');
    return;
  }

  if (format === 'obsidian') {
    save(toFileName(name, 'md'), obsidianHeadingLinks(markdown), 'text/markdown;charset=utf-8');
    return;
  }

  if (format === 'txt') {
    save(
      toFileName(name, 'txt'),
      markdownToText(markdown),
      'text/plain;charset=utf-8'
    );
    return;
  }

  /* Any mermaid fence is drawn before the file is written, so the picture travels with it. */
  save(
    toFileName(name, 'html'),
    buildStandaloneHtml({
      title: name,
      body: await inlineDiagrams(markdownToHtml(markdown), theme),
      createdAt,
      theme,
    }),
    'text/html;charset=utf-8'
  );
}

/**
 * PDF, by way of the browser's own print dialog.
 *
 * Not the app's window: the page around the document is the app, and nobody wants a header and a
 * row of buttons in their PDF. What prints is the exported file itself, in a frame of its own, so
 * the PDF is exactly the document that a download would have produced — and that file carries a
 * print rule that puts it back on a light palette, so a dark theme does not cost somebody a
 * cartridge.
 *
 * Two of the strings here are read by a person — the frame's title, which a screen reader says, and
 * the failure, which the caller shows as the second line of a toast — so `t` comes in from the
 * component that has one. This is a module; it cannot call a hook.
 */
export async function printDoc(
  name: string,
  html: string,
  createdAt: number,
  theme: 'dark' | 'light',
  t: Translate
): Promise<void> {
  /*
   * Diagrams drawn light, whatever the screen is on: the exported file's print rule puts the
   * document back on a light palette, and mermaid's dark palette is pale text — which on paper is
   * no diagram at all.
   */
  const body = await inlineDiagrams(html, 'light');

  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');

    frame.setAttribute('aria-hidden', 'true');
    frame.title = t('converter.print.frame', { name });
    frame.style.cssText =
      'position:fixed;width:1px;height:1px;left:-9999px;border:0;visibility:hidden';

    frame.addEventListener('load', () => {
      const view = frame.contentWindow;

      if (!view) {
        frame.remove();
        reject(new Error(t('converter.print.unprepared')));
        return;
      }

      try {
        view.focus();
        view.print();
        resolve();
      } catch (cause) {
        reject(cause instanceof Error ? cause : new Error(String(cause)));
      } finally {
        /*
         * print() returns as soon as the dialog is dismissed in some browsers and before it in
         * others; pulling the frame out from under a job that has not started yet cancels it.
         */
        setTimeout(() => frame.remove(), 1000);
      }
    });

    frame.srcdoc = buildStandaloneHtml({
      title: name,
      body,
      createdAt,
      theme,
    });

    document.body.appendChild(frame);
  });
}
