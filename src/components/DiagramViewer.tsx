import { Maximize, Minus, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/lib/i18n/context';
import { IconButton } from '@/ui/components/IconButton';

/*
 * One diagram, on the whole screen.
 *
 * In the document a diagram keeps its own size and its figure scrolls sideways — shrunk to the
 * column, its labels shrink with it and nobody can read it. That is right for the page and wrong
 * for reading a big flowchart, so this is the other half: the same drawing over everything,
 * fitted to the screen when it opens, then as close or as far as the reader wants. Drag to move,
 * the wheel or a trackpad pinch to zoom around the pointer, the buttons or + − 0 for the rest.
 *
 * App-only. The button that opens it is added to the preview after it renders and is never in the
 * markup a download is made from, so an exported file is the document and nothing else.
 */

const MIN = 0.1;
const MAX = 8;
/** Room left round a fitted diagram, so its edge does not sit on the screen's. */
const MARGIN = 48;

interface View {
  scale: number;
  x: number;
  y: number;
}

/** The drawing's own size: its viewBox, which mermaid always writes, or what it measures as. */
function naturalSize(svg: SVGSVGElement): { width: number; height: number } {
  const box = svg.viewBox?.baseVal;

  if (box && box.width > 0 && box.height > 0) {
    return { width: box.width, height: box.height };
  }

  const rect = svg.getBoundingClientRect();

  return { width: rect.width || 800, height: rect.height || 600 };
}

const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

export function DiagramViewer({ svg, onClose }: { svg: string; onClose: () => void }) {
  const t = useT();
  const stage = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const size = useRef({ width: 0, height: 0 });
  const drag = useRef<{ x: number; y: number; from: View } | null>(null);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });

  const fit = useCallback(() => {
    const area = stage.current?.getBoundingClientRect();
    const { width, height } = size.current;

    if (!area || !width || !height) return;

    const scale = clamp(
      Math.min((area.width - MARGIN * 2) / width, (area.height - MARGIN * 2) / height)
    );

    setView({
      scale,
      x: (area.width - width * scale) / 2,
      y: (area.height - height * scale) / 2,
    });
  }, []);

  /* Sized to its own drawing, then fitted, before the first paint so it never opens at 1:1. */
  useLayoutEffect(() => {
    const element = drawing.current?.querySelector('svg');

    if (!element) return;

    const natural = naturalSize(element);

    size.current = natural;
    element.setAttribute('width', String(natural.width));
    element.setAttribute('height', String(natural.height));
    element.style.maxWidth = 'none';
    fit();
  }, [fit]);

  /** Zoom by `factor`, keeping the point under (`px`, `py`) where it is. */
  const zoom = useCallback((factor: number, px?: number, py?: number) => {
    const area = stage.current?.getBoundingClientRect();

    if (!area) return;

    setView((current) => {
      const scale = clamp(current.scale * factor);
      const cx = px ?? area.width / 2;
      const cy = py ?? area.height / 2;
      const ratio = scale / current.scale;

      return { scale, x: cx - (cx - current.x) * ratio, y: cy - (cy - current.y) * ratio };
    });
  }, []);

  /* The keys, and the page behind kept still while this is over it. */
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === '+' || event.key === '=') zoom(1.25);
      else if (event.key === '-' || event.key === '_') zoom(0.8);
      else if (event.key === '0') fit();
    };
    const scroll = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', keys);

    return () => {
      document.body.style.overflow = scroll;
      document.removeEventListener('keydown', keys);
    };
  }, [onClose, zoom, fit]);

  /* Passive by default in React, and a wheel that zooms has to stop the page from scrolling. */
  useEffect(() => {
    const element = stage.current;

    if (!element) return;

    const wheel = (event: WheelEvent) => {
      event.preventDefault();

      const area = element.getBoundingClientRect();
      /* A trackpad pinch arrives as a wheel with ctrlKey and small deltas; scale it up to match. */
      const speed = event.ctrlKey ? 0.01 : 0.0015;

      zoom(Math.exp(-event.deltaY * speed), event.clientX - area.left, event.clientY - area.top);
    };

    element.addEventListener('wheel', wheel, { passive: false });

    return () => element.removeEventListener('wheel', wheel);
  }, [zoom]);

  useEffect(() => {
    window.addEventListener('resize', fit);

    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('diagram.viewer')}
      className="fixed inset-0 z-[60] flex flex-col bg-surface-page"
    >
      <div className="flex items-center justify-end gap-1 border-stroke border-b px-3 py-2">
        <IconButton variant="tertiary" size="sm" aria-label={t('diagram.zoomOut')} onClick={() => zoom(0.8)}>
          <Minus />
        </IconButton>
        <span className="w-14 text-center font-mono text-ink-secondary text-xs tabular-nums">
          {Math.round(view.scale * 100)}%
        </span>
        <IconButton variant="tertiary" size="sm" aria-label={t('diagram.zoomIn')} onClick={() => zoom(1.25)}>
          <Plus />
        </IconButton>
        <IconButton variant="tertiary" size="sm" aria-label={t('diagram.fit')} onClick={fit}>
          <Maximize />
        </IconButton>
        <span className="mx-1 h-5 w-px bg-stroke" />
        {/* biome-ignore lint/a11y/noAutofocus: a dialog that opens over everything is closed from here */}
        <IconButton variant="secondary" size="sm" aria-label={t('diagram.close')} onClick={onClose} autoFocus>
          <X />
        </IconButton>
      </div>

      <div
        ref={stage}
        className="relative min-h-0 flex-1 cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, from: view };
        }}
        onPointerMove={(event) => {
          const start = drag.current;

          if (!start) return;

          setView({
            ...start.from,
            x: start.from.x + event.clientX - start.x,
            y: start.from.y + event.clientY - start.y,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onDoubleClick={(event) => {
          const area = event.currentTarget.getBoundingClientRect();

          zoom(2, event.clientX - area.left, event.clientY - area.top);
        }}
      >
        <div
          ref={drawing}
          className="md-doc absolute top-0 left-0 origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: the preview's own diagram, sanitised when it was drawn
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>,
    /*
     * Into whatever is full screen, if anything is: the preview frame can be, and a dialog
     * appended to the body is then behind it — drawn, focused, and invisible.
     */
    document.fullscreenElement ?? document.body
  );
}
