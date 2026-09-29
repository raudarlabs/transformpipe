import { Globe, LayoutGrid, RefreshCw, Share2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type DocumentViewsState } from '@/lib/api';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { Button } from '@/ui/components/Button';
import { Skeleton } from '@/ui/components/Skeleton';
import { Typography } from '@/ui/components/Typography';

interface DocumentViewsProps {
  documentId: string;
  /** Opens the share dialog, for a document nobody can open yet. */
  onShare: () => void;
}

/** Midnight of the day `at` falls on, in the reader's own time zone — the key opens group under. */
const dayOf = (at: Date) => new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime();

/**
 * Every open of the document's link, newest first, a day at a time.
 *
 * What there is to show is what `m2h_share_view` keeps: when, and whether it was the shared page
 * or the app's reader. Not who — the rows hold nothing about a person, so the list says "opens"
 * and never "readers", and says that the owner's own opens are among them.
 *
 * The day headings are `Intl`'s, so "today" and "yesterday" come in the reader's language without
 * a catalogue entry for each, and the times are in the reader's own zone.
 */
export function DocumentViews({ documentId, onShare }: DocumentViewsProps) {
  const t = useT();
  const { locale } = useI18n();
  const intl = INTL_LOCALES[locale];
  const [state, setState] = useState<DocumentViewsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setState(await api.documentViews(documentId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('views.error'));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => {
    if (!state) {
      return [];
    }

    const time = new Intl.DateTimeFormat(intl, { hour: '2-digit', minute: '2-digit' });
    const date = new Intl.DateTimeFormat(intl, { weekday: 'long', day: 'numeric', month: 'long' });
    const relative = new Intl.RelativeTimeFormat(intl, { numeric: 'auto' });
    const today = dayOf(new Date());
    const groups = new Map<number, Array<{ key: string; time: string; via: 'page' | 'app' }>>();

    state.events.forEach((event, index) => {
      const at = new Date(event.at);
      const day = dayOf(at);

      groups.set(day, [
        ...(groups.get(day) ?? []),
        { key: `${event.at}-${index}`, time: time.format(at), via: event.via },
      ]);
    });

    return [...groups.entries()].map(([day, events]) => {
      const back = Math.round((today - day) / 86_400_000);
      const label = back <= 1 ? relative.format(-back, 'day') : date.format(new Date(day));

      return { day, label: label.charAt(0).toLocaleUpperCase(intl) + label.slice(1), events };
    });
  }, [state, intl]);

  const frame = 'flex w-full flex-col gap-4 rounded-xl border border-stroke bg-surface-page p-6';

  if (!state && isLoading) {
    return (
      <div className={frame} role="status" aria-live="polite">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${frame} items-start`}>
        <Typography variant="p" textColor="secondary">
          {error}
        </Typography>
        <Button variant="secondary" size="sm" leftSlot={<RefreshCw />} onClick={() => void load()}>
          {t('converter.summary.retry')}
        </Button>
      </div>
    );
  }

  if (!state) {
    return null;
  }

  if (state.mode === 'private' && state.events.length === 0) {
    return (
      <div className={`${frame} items-start`}>
        <Typography variant="p" textColor="secondary">
          {t('views.private')}
        </Typography>
        <Button variant="secondary" size="sm" leftSlot={<Share2 />} onClick={onShare}>
          {t('dialog.share.title')}
        </Button>
      </div>
    );
  }

  return (
    <div className={frame}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h3" weight="semibold" textColor="primary" className="text-base">
          {state.views === 0
            ? t('views.none.title')
            : t(state.views === 1 ? 'views.total.one' : 'views.total.many', { count: state.views })}
        </Typography>
        <Button
          variant="tertiary"
          size="sm"
          leftSlot={<RefreshCw className={isLoading ? 'animate-spin' : undefined} />}
          disabled={isLoading}
          onClick={() => void load()}
        >
          {t('views.refresh')}
        </Button>
      </div>

      {state.events.length === 0 ? (
        <Typography variant="p" textColor="secondary" className="text-sm">
          {t('views.none')}
        </Typography>
      ) : (
        <div className="flex flex-col gap-5">
          {days.map((day) => (
            <section key={day.day} className="flex flex-col gap-1.5">
              <Typography
                variant="span"
                weight="semibold"
                textColor="light"
                className="text-xxs uppercase tracking-wide"
              >
                {day.label}
              </Typography>
              <ul className="flex flex-col divide-y divide-stroke rounded-lg border border-stroke">
                {day.events.map((event) => (
                  <li key={event.key} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="font-mono text-ink-body text-sm tabular-nums">{event.time}</span>
                    <span className="flex items-center gap-1.5 text-ink-secondary text-xs">
                      {event.via === 'app' ? (
                        <LayoutGrid className="size-3.5" />
                      ) : (
                        <Globe className="size-3.5" />
                      )}
                      {t(event.via === 'app' ? 'views.via.app' : 'views.via.page')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {state.views > state.events.length && state.events.length > 0 && (
        <Typography variant="p" textColor="light" className="text-xs">
          {t('views.more', { shown: state.events.length, count: state.views })}
        </Typography>
      )}

      <Typography variant="p" textColor="light" className="text-xs">
        {t('views.note')}
      </Typography>
    </div>
  );
}
