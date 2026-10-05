import {
  mdArticleSurface,
  mdDocTheme,
  MD_DOC_STYLE,
  MD_PREVIEW_STYLE,
} from '@shared/md-doc-css';
import { useEffect, useRef, useState } from 'react';
import { DiagramViewer } from './DiagramViewer';
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
  /* The diagram open over the page, as its own markup; null when none is. */
  const [opened, setOpened] = useState<string | null>(null);

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
   * A button on every drawn diagram, put there after it renders.
   *
   * Added to the live DOM rather than to the markup, because the markup is also what a download is
   * made from and an exported file has no viewer to open. Rendering again replaces the content and
   * the buttons with it, so this runs whenever the drawn version does.
   */
  useEffect(() => {
    const root = doc.current;

    if (!root) return;

    for (const figure of root.querySelectorAll<HTMLElement>('figure.md-diagram')) {
      if (figure.querySelector('.md-diagram-open')) continue;

      const button = figure.ownerDocument.createElement('button');

      button.type = 'button';
      button.className = 'md-diagram-open';
      button.setAttribute('aria-label', t('diagram.open'));
      button.title = t('diagram.open');
      /* lucide's maximize-2, drawn inline: this button is not React's to render. */
      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg>';
      figure.append(button);
    }
  }, [shown, t]);

  /* One listener for every diagram: the button, or a double click anywhere on the drawing. */
  const open = (event: React.MouseEvent<HTMLDivElement>, onDouble: boolean) => {
    const target = event.target as HTMLElement;
    const figure = target.closest<HTMLElement>('figure.md-diagram');

    if (!figure || (!onDouble && !target.closest('.md-diagram-open'))) return;

    const svg = figure.querySelector('svg');

    if (svg) {
      event.preventDefault();
      setOpened(svg.outerHTML);
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
          dangerouslySetInnerHTML={{ __html: shown }}
        />
      </div>

      {opened && <DiagramViewer svg={opened} onClose={() => setOpened(null)} />}
    </>
  );
}
