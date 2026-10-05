import { inlineDiagrams } from '@/lib/mermaid';

/*
 * The one script a shared page runs: it draws the document's diagrams, and gives a diagram or a
 * table too wide for the page a way onto the whole screen.
 *
 * A shared page at /s/<token> is somebody else's document on this domain, and it used to run no
 * script at all — script-src 'none' — so a ```mermaid fence reached every reader of a public link
 * as its source text, never as a picture. Mermaid lays a diagram out by measuring text and needs a
 * browser to do it, so the server cannot draw one. This file is what the policy now allows, and
 * the only thing it allows: script-src 'self', so the page can load this and the chunks it
 * imports from the same origin, and still nothing inline — no <script> in a document, no onclick,
 * no javascript: link — which is what the old 'none' was there to stop.
 *
 * The drawing is the app's own: the same `inlineDiagrams`, the same configuration and the same
 * sanitising, in the palette the page is showing. Fullscreen is the browser's, on a frame around
 * the element, with no viewer of our own — a page with one script should not need a second.
 *
 * Built as its own entry at a fixed address, /share/diagrams.js, so the server can name it; see
 * `vite.config.ts`.
 */

const LABEL = 'Full screen';
/* lucide's maximize-2, the icon the app's own button uses. */
const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg>';

/** A frame around `element` with a button that puts the frame on the whole screen. */
function frame(element: HTMLElement, kind: 'diagram' | 'table'): void {
  const wrapper = document.createElement('div');
  const button = document.createElement('button');

  wrapper.className = `md-${kind}-frame`;
  button.type = 'button';
  button.className = `md-expand md-${kind}-open`;
  button.setAttribute('aria-label', kind === 'diagram' ? 'Open the diagram full screen' : 'Open the table full screen');
  button.innerHTML = `${ICON}<span>${LABEL}</span>`;
  button.addEventListener('click', () => {
    if (document.fullscreenElement === wrapper) {
      void document.exitFullscreen();
    } else if (typeof wrapper.requestFullscreen === 'function') {
      void wrapper.requestFullscreen().catch(() => undefined);
    }
  });
  element.replaceWith(wrapper);
  /* A table's button above it, where it covers no cell; a diagram's in its corner. */
  if (kind === 'table') wrapper.append(button, element);
  else wrapper.append(element, button);
}

/*
 * Download .html, with the diagrams drawn into it.
 *
 * The server builds that file and cannot draw a diagram, so it came out with each one as source
 * text. Where the document has diagrams the page builds the file itself instead — the app's own
 * `buildStandaloneHtml` and `inlineDiagrams`, in the light palette the server's file uses — from
 * the markup as the server sent it, before anything here touched it. Only where there are
 * diagrams, and only the .html link: without this script the link still works, through the server.
 */
function drawnDownload(doc: HTMLElement, source: string): void {
  const link = document.querySelector<HTMLAnchorElement>('.md-bar a.keep');

  if (!link || !/[?&]download(=html)?$/.test(link.getAttribute('href') ?? '')) return;

  link.addEventListener('click', (event) => {
    event.preventDefault();

    void (async () => {
      const [{ buildStandaloneHtml }, { saveBlob }, { toFileName }] = await Promise.all([
        import('@/lib/markdown'),
        import('@/lib/download'),
        import('@/lib/format'),
      ]);
      const name = document.title;
      const html = buildStandaloneHtml({
        title: name,
        body: await inlineDiagrams(source, 'light'),
        createdAt: Number(doc.dataset.created) || Date.now(),
        theme: 'light',
      });

      saveBlob(toFileName(name, 'html'), new Blob([html], { type: 'text/html;charset=utf-8' }));
    })().catch(() => {
      /* Anything wrong on this side, and the server's file is still one click away. */
      window.location.href = link.href;
    });
  });
}

async function run(): Promise<void> {
  const doc = document.querySelector<HTMLElement>('article.md-doc');

  if (!doc) return;

  if (doc.querySelector('pre.md-mermaid')) {
    drawnDownload(doc, doc.innerHTML);

    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    doc.innerHTML = await inlineDiagrams(doc.innerHTML, theme);
  }

  for (const figure of doc.querySelectorAll<HTMLElement>('figure.md-diagram')) {
    frame(figure, 'diagram');
  }

  /* Only a table that does not fit: a button on every small one would be clutter. */
  for (const table of doc.querySelectorAll<HTMLElement>('.md-table')) {
    if (table.scrollWidth > table.clientWidth + 1) frame(table, 'table');
  }
}

void run();
