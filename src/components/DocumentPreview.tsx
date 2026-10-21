import {
  mdArticleSurface,
  mdDocTheme,
  MD_DOC_STYLE,
  MD_PREVIEW_STYLE,
} from '@shared/md-doc-css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DiagramViewer } from './DiagramViewer';
import { TableViewer } from './TableViewer';
import { inlineDiagrams } from '@/lib/mermaid';
import { useT } from '@/lib/i18n/context';
import { useTheme } from '@/lib/theme';
import { IconButton } from '@/ui/components/IconButton';
import { cn } from '@/ui/lib/utils';

interface DocumentPreviewProps {
  html: string;
  className?: string;
  /**
   * Laid out as a book: two pages side by side, turned rather than scrolled. One page on a screen
   * too narrow for two.
   */
  book?: boolean;
}

/** Between the two pages of a spread, and between one spread and the next. */
const GUTTER = 64;
/** Narrower than this, a spread is one page: two columns of a dozen words each read worse than one. */
const TWO_PAGES_FROM = 720;

/*
 * The book's own rules, on top of the document's. The text flows into columns of the sheet's
 * height and on to the right; the sheet shows one spread of them and moves by a spread at a time.
 * A heading stays with what follows it, and a picture, a table, a diagram or a code block is not
 * cut across two pages — one taller than a page is scaled to fit rather than lost off the bottom.
 */
const BOOK_STYLE = `
.md-book { position: relative; overflow: hidden; }
.md-book .md-doc {
  column-fill: auto;
  overflow: visible;
  font-family: Charter, "Iowan Old Style", "Palatino Linotype", Georgia, Cambria, serif;
  font-size: 1.0625rem;
  line-height: 1.6;
  text-align: justify;
  hyphens: auto;
  orphans: 2;
  widows: 2;
}
.md-book .md-doc :is(h1, h2, h3, h4, h5, h6) { text-align: left; hyphens: manual; break-after: avoid-column; }
/* Text runs on from one page to the next, as in a book; what cannot be read in halves does not. */
.md-book .md-doc :is(pre, table, figure, img, svg, .md-table, .md-diagram-frame, .md-table-frame, .md-callout) { break-inside: avoid-column; }
.md-book .md-doc :is(img, svg, video) { max-width: 100%; max-height: var(--md-book-height); object-fit: contain; }
.md-book .md-doc :is(pre, table, figure, .md-table, .md-diagram-frame, .md-table-frame) { max-height: var(--md-book-height); overflow: auto; text-align: left; }
.md-book .md-doc :is(pre, code) { font-family: var(--md-mono, ui-monospace, monospace); }
.md-book-nav { opacity: 0.55; transition: opacity 160ms ease; }
.md-book-nav:hover, .md-book-nav:focus-within { opacity: 1; }
/*
 * Full screen is the reading room: no card around the pages, the spread as wide as the screen
 * allows and as tall, the way a reader app lays a book open.
 */
.md-preview-frame:fullscreen .md-sheet:has(.md-book) {
  max-width: 96rem;
  padding: 2.5rem 4rem 1.5rem;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
`;

/**
 * Renders the converted fragment with exactly the stylesheet that ships inside the exported file,
 * so "preview" and "downloaded .html" always match — right down to the sheet's own background,
 * which follows the app theme in both places.
 */
export function DocumentPreview({ html, className, book: wantsBook = false }: DocumentPreviewProps) {
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

  /*
   * The book: where it is, how many spreads there are, and how wide one is. Measured from the
   * laid-out columns, never guessed: a spread is the sheet's width plus one gutter, and the number
   * of them is how far the last column reaches.
   */
  const sheet = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(0);
  const [book, setBook] = useState<{ spreads: number; width: number; columns: 1 | 2; height: number } | null>(null);

  const measure = useCallback(() => {
    const frame = sheet.current;
    const content = doc.current;

    if (!wantsBook || !frame || !content) return;

    const width = frame.clientWidth;
    const columns = width >= TWO_PAGES_FROM ? 2 : 1;
    // A page is as tall as the screen allows once the header, the sheet's padding and the page
    // controls are taken off — the same height wherever the sheet happens to be scrolled to.
    const height = Math.max(360, Math.round(window.innerHeight - (document.fullscreenElement ? 150 : 250)));

    content.style.height = `${height}px`;
    content.style.columnCount = String(columns);
    content.style.columnGap = `${GUTTER}px`;
    content.style.setProperty('--md-book-height', `${height - 8}px`);

    const spreads = Math.max(1, Math.round((content.scrollWidth + GUTTER) / (width + GUTTER)));

    setBook((was) => {
      // Keep the reader on the same part of the text when the window changes size.
      if (was && was.spreads !== spreads) {
        setSpread((at) => Math.min(spreads - 1, Math.round((at / Math.max(1, was.spreads - 1)) * (spreads - 1))));
      }

      return { spreads, width, columns, height };
    });
  }, [wantsBook]);

  /* null before the first render, so a book that was on when the page loaded does not scroll it. */
  const wasBook = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    const content = doc.current;

    if (!wantsBook) {
      wasBook.current = false;
      setBook(null);
      setSpread(0);

      if (content) {
        content.style.height = '';
        content.style.columnCount = '';
        content.style.columnGap = '';
      }

      return;
    }

    measure();

    // Turning the book on brings it to the top of the screen, where a whole spread fits — only
    // when it was just turned on, not every time a page that remembers it loads.
    if (wasBook.current === false) {
      sheet.current?.closest('.md-sheet')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    wasBook.current = true;

    const watch = new ResizeObserver(() => measure());

    if (sheet.current) watch.observe(sheet.current);
    window.addEventListener('resize', measure);

    return () => {
      watch.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [wantsBook, shown, measure]);

  /* A new document opens on its first spread. */
  useEffect(() => setSpread(0), [html]);

  const turn = useCallback(
    (by: number) => setSpread((at) => Math.max(0, Math.min((book?.spreads ?? 1) - 1, at + by))),
    [book]
  );

  /* The keys a reader expects of a book, unless they are typing somewhere. */
  useEffect(() => {
    if (!wantsBook) return;

    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;

      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]') || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        turn(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        turn(-1);
      } else if (event.key === 'Home') {
        setSpread(0);
      } else if (event.key === 'End') {
        setSpread((book?.spreads ?? 1) - 1);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [wantsBook, turn, book]);

  /* A swipe across the page turns it, the way a phone's reader does. */
  const touch = useRef<number | null>(null);

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

      {wantsBook && <style>{BOOK_STYLE}</style>}

      {/* data-clarity-mask: a document is never part of a recording, whatever the project's mode. */}
      <div className={cn('md-sheet', className)} data-clarity-mask="true">
        <div
          ref={sheet}
          className={cn(wantsBook && 'md-book')}
          onClick={(event) => {
            /*
             * A click on the outer edge of a page turns it, as in a reader app — not on a link, a
             * button or a selection, which are what the reader was reaching for.
             */
            if (!book || (event.target as Element).closest('a, button, input, summary, .md-expand')) return;
            if (window.getSelection()?.toString()) return;

            const box = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width;

            if (x < 0.15) turn(-1);
            else if (x > 0.85) turn(1);
          }}
          onTouchStart={(event) => {
            if (wantsBook) touch.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const from = touch.current;
            const to = event.changedTouches[0]?.clientX;

            touch.current = null;
            if (from !== null && to !== undefined && Math.abs(to - from) > 50) turn(to < from ? 1 : -1);
          }}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: the clicks are on the buttons inside it; this only listens for them */}
          <div
            ref={doc}
            className="md-doc"
            style={
              book
                ? { transform: `translateX(-${spread * (book.width + GUTTER)}px)`, transition: 'transform 260ms ease' }
                : undefined
            }
            onClick={(event) => open(event, false)}
            onDoubleClick={(event) => open(event, true)}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitised in markdownToHtml, and the diagrams again in inlineDiagrams
            dangerouslySetInnerHTML={markup}
          />
        </div>

        {book && (
          <nav aria-label={t('book.nav')} className="md-book-nav mt-3 flex items-center justify-center gap-3 text-ink-secondary text-xs">
            <IconButton variant="tertiary" size="sm" aria-label={t('book.previous')} disabled={spread === 0} onClick={() => turn(-1)}>
              <ChevronLeft />
            </IconButton>
            <span aria-live="polite" className="min-w-36 text-center tabular-nums">
              {book.columns === 2
                ? t('book.pages', {
                    from: spread * 2 + 1,
                    to: Math.min(spread * 2 + 2, book.spreads * 2),
                    total: book.spreads * 2,
                  })
                : t('book.page', { at: spread + 1, total: book.spreads })}
            </span>
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label={t('book.next')}
              disabled={spread >= book.spreads - 1}
              onClick={() => turn(1)}
            >
              <ChevronRight />
            </IconButton>
          </nav>
        )}
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
