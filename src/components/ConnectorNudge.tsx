import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ConversionId } from '@shared/conversions';
import { useConsent } from '@/lib/consent';
import { useI18n, useT } from '@/lib/i18n/context';
import { localePath } from '@/lib/i18n/locales';
import { staticPage } from '@/lib/pages';
import { count } from '@/lib/usage';
import { cn } from '@/ui/lib/utils';
import { BrandLogo, type BrandName } from './BrandLogo';

/*
 * The note in the converter's lower-right corner that says the assistants exist.
 *
 * The converter is where most people land, and the assistants are a glyph in the header they have
 * no reason to press. So, once a visit, a pill says so — after the first conversion, when somebody
 * has a result and is deciding what to do with it, or after fifteen seconds on the page if nothing
 * was converted. Where the file came from Obsidian it points at the plugin; everywhere else at the
 * assistants.
 *
 * It sits in the margin beside the page, never over it, and is sized by that margin — see below.
 *
 * Nothing is stored: closing it lasts as long as the visit. The privacy and cookie pages list what
 * lives in the browser, and a third item for a note in a corner is not worth changing them for.
 * It waits for the cookie banner to be answered, so the two never sit on the screen together. The
 * converter has no scroll-to-top button, so the right-hand corner is free for it.
 */

const AFTER_IDLE_MS = 15_000;
const AFTER_CONVERT_MS = 1_200;

/*
 * The margin beside the page on the right, in pixels: half of what the viewport has beyond the
 * content's 80rem, plus the page's own padding. The note lives in it rather than over the page.
 */
const CONTENT_MAX = 80 * 16;
const PAGE_PADDING = 24;

function useGutter(): number {
  const measure = () => Math.max(0, (window.innerWidth - CONTENT_MAX) / 2) + PAGE_PADDING;
  const [gutter, setGutter] = useState(measure);

  useEffect(() => {
    const update = () => setGutter(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return gutter;
}

/* One per page load, across every mount: the converter remounts as people move between tools. */
let spent = false;

export function ConnectorNudge({
  conversionId,
  converted,
}: {
  conversionId: ConversionId;
  /** True once this visit has converted something — the moment the note is most useful. */
  converted: boolean;
}) {
  const t = useT();
  const { locale } = useI18n();
  const consent = useConsent();
  const [open, setOpen] = useState(false);
  const gutter = useGutter();
  const shown = useRef(false);

  const variant = conversionId === 'obsidian-to-markdown' ? 'obsidian' : 'assistants';
  const target = staticPage(variant === 'obsidian' ? 'obsidian' : 'agents');
  const logos: BrandName[] = variant === 'obsidian' ? ['obsidian'] : ['claude', 'chatgpt', 'obsidian'];
  const waiting = consent.decidedAt === null;

  useEffect(() => {
    if (spent || waiting) {
      return;
    }

    const timer = setTimeout(
      () => {
        if (spent) return;
        spent = true;
        shown.current = true;
        setOpen(true);
        count('nudge', `${variant}:shown`);
      },
      converted ? AFTER_CONVERT_MS : AFTER_IDLE_MS
    );

    return () => clearTimeout(timer);
  }, [converted, waiting, variant]);

  if (!open) {
    return null;
  }

  const text = t(variant === 'obsidian' ? 'nudge.obsidian' : 'nudge.assistants');
  const close = () => {
    setOpen(false);
    count('nudge', `${variant}:dismiss`);
  };
  const lit =
    'transition-[border-color,box-shadow,filter] duration-200 hover:border-brand-primary hover:shadow-[0_0_0_3px_hsl(var(--brand-primary)/0.25)] hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand';

  /*
   * Everything follows the margin: the note is as wide as the empty space beside the page, less a
   * little air, and its logos, type and padding grow and shrink with it. Below 120px there is no
   * room for words, so it stands the logos one above another, as wide as the margin allows.
   */
  const width = Math.round(Math.min(Math.max(gutter - 24, 52), 320));
  const column = width < 120;
  const scale = (min: number, ratio: number, max: number) => Math.round(Math.min(Math.max(width * ratio, min), max));
  const face = column ? Math.min(width - 12, 48) : scale(32, 0.16, 48);
  const glyph = Math.round(face * 0.55);
  const pad = column ? 6 : scale(12, 0.07, 20);
  const type = scale(13, 0.062, 17);

  return (
    <div
      role="complementary"
      className="fixed right-3 bottom-4 z-40 animate-[nudge-in_300ms_ease-out]"
      style={{ width: `${width}px` }}
    >
      <a
        href={localePath(locale, target.path)}
        onClick={() => count('nudge', `${variant}:click`)}
        aria-label={column ? text : undefined}
        title={column ? text : undefined}
        className={cn(
          'flex border border-brand-primary/40 bg-surface-card bg-gradient-to-br from-surface-card to-surface-accent no-underline shadow-2xl',
          column ? 'flex-col items-center gap-1.5 rounded-full' : 'flex-col gap-3 rounded-2xl',
          'nudge-glow',
          lit
        )}
        style={{ padding: `${pad}px`, paddingRight: column ? `${pad}px` : `${pad + 22}px` }}
      >
        <span className={cn('flex shrink-0', column ? 'flex-col -space-y-1.5' : '-space-x-2')}>
          {logos.map((name, index) => (
            <span
              key={name}
              className="nudge-face flex items-center justify-center rounded-full border-2 border-surface-card bg-surface-card2"
              style={{ width: `${face}px`, height: `${face}px`, animationDelay: `${150 + index * 110}ms` }}
            >
              <BrandLogo name={name} className="text-ink-primary" style={{ width: `${glyph}px`, height: `${glyph}px` }} />
            </span>
          ))}
        </span>
        {!column && (
          <span className="font-semibold text-ink-primary leading-snug" style={{ fontSize: `${type}px` }}>
            {text}
          </span>
        )}
      </a>
      <button
        type="button"
        onClick={close}
        aria-label={t('nudge.close')}
        title={t('nudge.close')}
        className={cn(
          'absolute flex cursor-pointer items-center justify-center rounded-full text-ink-secondary transition-colors hover:text-ink-primary',
          column
            ? '-top-2 -right-1 size-6 border border-stroke bg-surface-card shadow'
            : 'top-2.5 right-2.5 size-7 hover:bg-state-hover'
        )}
      >
        <X className={column ? 'size-3.5' : 'size-4'} />
      </button>
    </div>
  );
}
