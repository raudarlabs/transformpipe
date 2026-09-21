import { ArrowRight, Check } from 'lucide-react';
import {
  CONVERSIONS,
  type ConversionId,
} from '@shared/conversions';
import { useI18n, useT } from '@/lib/i18n/context';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

interface ConversionPickerProps {
  current: ConversionId;
  onChange: (id: ConversionId) => void;
  className?: string;
}

/**
 * The formats named in `ROADMAP.md` that are not here yet, shown as blocks nobody can click.
 *
 * Two reasons they are worth the space. The grid is five across and there are eleven conversions,
 * so the last row held one card and four holes, which reads as something that failed to load.
 * And somebody who arrived with an `.epub` currently learns only that this app does not take one
 * — which is true today and false in a month, and "not yet" is a far better answer than nothing.
 *
 * The ids are the ids those conversions will be given, and the render below drops any entry whose
 * id has since appeared in `CONVERSIONS`. So a format ships and its "Soon" card disappears in the
 * same commit, with nobody having to remember this file — which is the only version of a list
 * like this that does not eventually lie.
 *
 * The labels are not translated. They are two proper nouns and an arrow, identical in all five
 * languages; the badge beside them is the only word here, and that one is in the catalogue.
 */
const COMING: { id: string; label: string; extensions: string[] }[] = [
  { id: 'epub-to-markdown', label: 'EPUB → Markdown', extensions: ['.epub'] },
  { id: 'odt-to-markdown', label: 'ODT → Markdown', extensions: ['.odt'] },
  { id: 'rtf-to-markdown', label: 'RTF → Markdown', extensions: ['.rtf'] },
  { id: 'evernote-to-markdown', label: 'Evernote → Markdown', extensions: ['.enex'] },
];

/**
 * The conversions, as blocks under the dropzone.
 *
 * They took the place of three cards that praised the product — converted in this browser, several
 * files at once, a self-contained export — all true, all already said in the questions further
 * down, and none of them any use to somebody who arrived with a spreadsheet and could not see that
 * this app takes spreadsheets. The menu in the header held that, one click out of sight.
 *
 * Every entry is a real link to its own page as well as a button, so it can be middle-clicked,
 * copied, and followed by a crawler that will not click anything.
 */
export function ConversionPicker({
  current,
  onChange,
  className,
}: ConversionPickerProps) {
  const t = useT();
  const { content } = useI18n();

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Typography
        variant="span"
        weight="semibold"
        textColor="light"
        className="text-xxs uppercase tracking-wide"
      >
        {t('converter.picker.label')}
      </Typography>

      {/*
        * Five tracks at the top width. It was chosen when there were five conversions and a grid
        * of four would have left the fifth alone on a row — and it still divides, because the
        * eleven conversions and the four formats below them come to fifteen. Two on a phone,
        * three in between.
        */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {CONVERSIONS.map((one) => {
          const isCurrent = one.id === current;

          return (
            <a
              key={one.id}
              href={one.path}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={(event) => {
                // The browser keeps the clicks it was asked for: new tab, new window, save.
                if (
                  event.defaultPrevented ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }

                event.preventDefault();
                onChange(one.id);
              }}
              className={cn(
                'group flex flex-col gap-1 rounded-lg border p-4 no-underline transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2',
                isCurrent
                  ? 'border-brand-tertiary bg-surface-accent'
                  : 'border-stroke bg-surface-card hover:border-brand-tertiary'
              )}
            >
              <span className="flex items-center gap-1.5">
                <Typography
                  variant="span"
                  weight="semibold"
                  textColor={isCurrent ? 'accent' : 'primary'}
                  className="text-sm"
                >
                  {content.conversions[one.id].label}
                </Typography>

                {isCurrent ? (
                  <Check className="size-3.5 shrink-0 text-brand-tertiary" />
                ) : (
                  <ArrowRight className="size-3.5 shrink-0 text-ink-inactive transition-transform group-hover:translate-x-0.5" />
                )}
              </span>

              <Typography
                variant="span"
                textColor="secondary"
                className="text-xs"
              >
                {one.extensions.join(', ')}
              </Typography>
            </a>
          );
        })}

        {COMING.filter(
          (soon) => !CONVERSIONS.some((shipped) => shipped.id === soon.id)
        ).map((soon) => (
          <div
            key={soon.id}
            title={t('converter.picker.soon.title')}
            className="flex cursor-default flex-col gap-1 rounded-lg border border-dashed border-stroke p-4"
          >
            <span className="flex items-center gap-1.5">
              <Typography
                variant="span"
                weight="semibold"
                textColor="secondary"
                className="text-sm"
              >
                {soon.label}
              </Typography>

              <Typography
                variant="span"
                weight="semibold"
                textColor="light"
                className="shrink-0 rounded-full border border-stroke px-1.5 py-px text-xxs uppercase tracking-wide"
              >
                {t('converter.picker.soon')}
              </Typography>
            </span>

            <Typography variant="span" textColor="light" className="text-xs">
              {soon.extensions.join(', ')}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
