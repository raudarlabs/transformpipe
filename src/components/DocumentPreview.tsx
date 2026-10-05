import {
  mdArticleSurface,
  mdDocTheme,
  MD_DOC_STYLE,
  MD_PREVIEW_STYLE,
} from '@shared/md-doc-css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DiagramViewer } from './DiagramViewer';
import { TableViewer } from './TableViewer';
import { inlineDiagrams } from '@/lib/mermaid';
import { useT } from '@/lib/i18n/context';
import { useTheme } from '@/lib/theme';
import { cn } from '@/ui/lib/utils';

interface DocumentPreviewProps {
  html: string;
  className?: string;
}

/**
 * Renders the converted fragment with exactly the stylesheet that ships inside the exported file,
 * so "preview" and "downloaded .html" always match — right down to the sheet's own background,
 * which follows the app theme in both places.
 */
export function DocumentPreview({ html, className }: DocumentPreviewProps) {
  const { theme } = useTheme();
  const t = useT();
  const doc = useRef<HTMLDivElement>(null);
  /* What is open over the page — a diagram or a table, as its own markup; null when nothing is. */
  const [opened, setOpened] = useState<{ kind: 'diagram' | 'table'; markup: string } | null>(null);

  /*
   * The fragment with its diagrams drawn into it, once there are any.
   *
   * Drawn into the markup rather than into the DOM, and that is the whole point. The obvious
   * version swaps each `pre.md-mermaid` for an `<svg>` in place — and it works for about a second:
   * mermaid takes that long to load, React rebuilds this subtree when the theme resolves, and the
   * swap either lands in a node that is no longer on the page or is undone by the next render.
   * Nothing throws; the diagram simply is not there. Here the drawn fragment is state, so React
   * renders it and no re-render can take it away.
   *
   * `html` goes up first, so the document appears at once and the diagram fills in behind it. A
   * document with no fence in it never waits, and never loads mermaid.
   */
  const [shown, setShown] = useState(html);

  useEffect(() => {
    setShown(html);

    let live = true;

    void inlineDiagrams(html, theme).then((drawn) => {
      if (live) setShown(drawn);
    });

    return () => {
      live = false;
    };
  }, [html, theme]);

  /*
   * A Full screen button on every drawn diagram, and on every table too wide for the page, put
   * there after it renders.
   *
   * Added to the live DOM rather than to the markup, because the markup is also what a download is
   * made from and an exported file has no viewer to open. After every render, not only when the
   * document changes: React may write the same markup back — it did on entering fullscreen, and the
   * buttons went with it — and a frame already in place is skipped, so running again costs nothing.
   *
   * Each goes on a frame around its element rather than inside it, because the element is what
   * scrolls sideways when it is wider than the page, and a button inside slid off with it.
   */
  useEffect(() => {
    const root = doc.current;

    if (!root) return;

    const frame = (element: HTMLElement, kind: 'diagram' | 'table', label: string) => {
      const wrapper = element.ownerDocument.createElement('div');
      const button = element.ownerDocument.createElement('button');

      wrapper.className = `md-${kind}-frame`;
      button.type = 'button';
      button.className = `md-expand md-${kind}-open`;
      button.setAttribute('aria-label', label);
      button.title = label;
      /* lucide's maximize-2, drawn inline: this button is not React's to render. */
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg><span>${t('diagram.expand')}</span>`;
      element.replaceWith(wrapper);
      /* A table's button goes above it, where it covers no cell; a diagram's sits in its corner. */
      if (kind === 'table') wrapper.append(button, element);
      else wrapper.append(element, button);
    };

    for (const figure of root.querySelectorAll<HTMLElement>('figure.md-diagram')) {
      if (!figure.parentElement?.classList.contains('md-diagram-frame')) {
        frame(figure, 'diagram', t('diagram.open'));
      }
    }

    /* Only a table that does not fit: a button on every small one would be clutter. */
    for (const table of root.querySelectorAll<HTMLElement>('.md-table')) {
      if (table.parentElement?.classList.contains('md-table-frame')) continue;

      if (table.scrollWidth > table.clientWidth + 1) {
        frame(table, 'table', t('table.open'));
      }
    }
  });

  /* The same object for the same markup, so a render for any other reason leaves the DOM alone. */
  const markup = useMemo(() => ({ __html: shown }), [shown]);

  /* One listener for every frame: its button, or a double click anywhere on a diagram. */
  const open = (event: React.MouseEvent<HTMLDivElement>, onDouble: boolean) => {
    const target = event.target as HTMLElement;
    const pressed = Boolean(target.closest('.md-expand'));
    const diagram = target
      .closest<HTMLElement>('.md-diagram-frame')
      ?.querySelector<HTMLElement>('figure.md-diagram svg');

    if (diagram && (pressed || onDouble)) {
      event.preventDefault();
      setOpened({ kind: 'diagram', markup: diagram.outerHTML });

      return;
    }

    const table = target.closest<HTMLElement>('.md-table-frame')?.querySelector('table');

    if (table && pressed) {
      event.preventDefault();
      setOpened({ kind: 'table', markup: table.outerHTML });
    }
  };

  return (
    <>
      {/* The frame around the sheet paints the page background, so it needs the palette too. */}
      <style>{`${mdDocTheme(theme, '.md-doc, .md-sheet, .md-preview-frame')}\n${MD_DOC_STYLE}\n${MD_PREVIEW_STYLE}\n${mdArticleSurface(theme)}`}</style>

      <div className={cn('md-sheet', className)}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the clicks are on the buttons inside it; this only listens for them */}
        <div
          ref={doc}
          className="md-doc"
          onClick={(event) => open(event, false)}
          onDoubleClick={(event) => open(event, true)}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised in markdownToHtml, and the diagrams again in inlineDiagrams
          dangerouslySetInnerHTML={markup}
        />
      </div>

      {opened?.kind === 'diagram' && (
        <DiagramViewer svg={opened.markup} onClose={() => setOpened(null)} />
      )}
      {opened?.kind === 'table' && (
        <TableViewer table={opened.markup} onClose={() => setOpened(null)} />
      )}
    </>
  );
}
