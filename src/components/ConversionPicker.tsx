import { ArrowRight, Check } from 'lucide-react';
import {
  CONVERSIONS,
  type ConversionId,
} from '@shared/conversions';
import { useI18n, useT } from '@/lib/i18n/context';
import { boundArrow } from '@/lib/labels';

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
 * Two reasons they are worth the space. The grid is five across and the conversions rarely land
 * on a multiple of five, so the last row held holes, which reads as something that failed to
 * load. And somebody who arrives wanting one of these learns only that this app does not do it
 * — true today and false in a month, and "not yet" is a far better answer than nothing.
 *
 * The ids are the ids those conversions will be given, and the render below drops any entry whose
 * id has since appeared in `CONVERSIONS`. So a format ships and its "Soon" card disappears in the
 * same commit, with nobody having to remember this file — which is the only version of a list
 * like this that does not eventually lie. The first four entries here were EPUB, ODT, RTF and
 * Evernote, and all four removed themselves over one day.
 *
 * What is left is the direction nobody does well: Markdown going *out*. Ten formats read into it
 * and almost nothing writes back, so "I have the Markdown, I need it in Confluence" has no good
 * answer anywhere. The second line is what you get rather than what you drop, because for these
 * the thing you drop is always the same.
 *
 * The labels are not translated. They are two proper nouns and an arrow, identical in all five
 * languages; the badge beside them is the only word here, and that one is in the catalogue.
 */
const COMING: { id: string; label: string; note: string }[] = [
  { id: 'markdown-to-confluence', label: 'Markdown → Confluence', note: 'storage format' },
  { id: 'markdown-to-jira', label: 'Markdown → Jira', note: 'wiki markup' },
  { id: 'markdown-to-slack', label: 'Markdown → Slack', note: 'mrkdwn' },
  { id: 'markdown-to-epub', label: 'Markdown → EPUB', note: '.epub' },
  { id: 'markdown-to-word', label: 'Markdown → Word', note: '.docx, styled' },
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
        * Five tracks, but not until there is room for five.
        *
        * The fifth column used to arrive at `lg`, which is 1024px — and measured there, ten of
        * the twenty labels wrapped, because a card 186px wide holds about fifteen characters and
        * half these names are longer. At four columns, on the same screen, none of them wrap.
        *
        * So the fifth column waits for `xl`. Twenty cards divide by four and by five, so neither
        * step leaves a row with holes in it.
        */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                'dot-grid group flex flex-col gap-1 rounded-lg border p-4 no-underline transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2',
                isCurrent
                  ? 'border-brand-tertiary bg-surface-accent'
                  : 'border-stroke bg-surface-card hover:border-brand-tertiary'
              )}
            >
              {/*
                * Two lines of room whether or not the second is used.
                *
                * A grid row is as tall as its tallest cell, so one label that wraps used to make
                * a whole row of five taller than the row under it — which is the thing somebody
                * actually notices, more than the wrap itself. Reserving the space costs one line
                * of white in the short cards and keeps every row level.
                */}
              <span className="flex min-h-[2.5rem] items-start gap-1.5">
                <Typography
                  variant="span"
                  weight="semibold"
                  textColor={isCurrent ? 'accent' : 'primary'}
                  className="text-sm"
                >
                  {boundArrow(content.conversions[one.id].label)}
                </Typography>

                {isCurrent ? (
                  <Check className="mt-1 size-3.5 shrink-0 text-brand-tertiary" />
                ) : (
                  <ArrowRight className="mt-1 size-3.5 shrink-0 text-ink-inactive transition-transform group-hover:translate-x-0.5" />
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
            className="dot-grid flex cursor-default flex-col gap-1 rounded-lg border border-dashed border-stroke p-4"
          >
            {/*
              * The badge sits under the label rather than beside it. Beside it, it took thirty
              * pixels off the widest line in the card and wrapped every one of these — including
              * `Markdown → Jira`, which is fifteen characters.
              */}
            <span className="flex min-h-[2.5rem] items-start">
              <Typography
                variant="span"
                weight="semibold"
                textColor="secondary"
                className="text-sm"
              >
                {boundArrow(soon.label)}
              </Typography>
            </span>

            <span className="flex items-center gap-1.5">
              <Typography variant="span" textColor="light" className="text-xs">
                {soon.note}
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
          </div>
        ))}
      </div>
    </div>
  );
}
