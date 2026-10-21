import { CheckCircle2, Circle, ClipboardPaste, FileText, Upload, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { api, type Onboarding } from '@/lib/api';
import { useI18n, useT } from '@/lib/i18n/context';
import { localePath } from '@/lib/i18n/locales';
import { staticPage } from '@/lib/pages';
import { sampleFile } from '@/lib/sample-document';
import { count } from '@/lib/usage';
import { Button } from '@/ui/components/Button';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

/*
 * The first minutes of an account, taught by doing rather than by a tour.
 *
 * Two pieces, each where the person already is. Before anything is converted, the empty history
 * offers the three ways in — a file, pasted text, a sample that is the product's own short guide —
 * instead of saying there is nothing here. After the first save, a checklist of three steps, each
 * ticked by what the account actually did (server/onboarding.ts), with a button that does the next
 * step on a real document. It goes away when the steps are done or when it is hidden, for good.
 *
 * No modal and no tooltip tour: people arrive here with a file to convert, and the assistants'
 * banner shown 87 times and clicked 6 said what interruptions are worth.
 */

/** What the history shows before the first conversion: three ways in, one of them a sample. */
export function StartTiles({
  isSynced,
  onFiles,
  onPaste,
}: {
  isSynced: boolean;
  onFiles: (files: File[]) => void;
  onPaste: () => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const picker = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);

  const tile =
    'flex flex-col items-start gap-1.5 rounded-xl border bg-surface-card p-4 text-left transition-colors hover:border-brand-tertiary focus-visible:outline-2 focus-visible:outline-brand-tertiary';

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-10">
      <div className="flex flex-col gap-1 text-center">
        <Typography variant="h4" weight="semibold" textColor="primary">
          {t('start.empty.title')}
        </Typography>
        <Typography variant="p" textColor="secondary">
          {isSynced ? t('start.empty.synced') : t('start.empty.local')}
        </Typography>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          className={cn(tile, 'border-dashed', isOver ? 'border-brand-tertiary bg-surface-accent' : 'border-stroke')}
          onClick={() => picker.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsOver(false);

            const files = [...event.dataTransfer.files];

            if (files.length > 0) {
              count('start', 'drop');
              onFiles(files);
            }
          }}
        >
          <Upload className="size-5 text-brand-tertiary" aria-hidden />
          <Typography variant="span" weight="semibold" textColor="primary">
            {t('start.drop.title')}
          </Typography>
          <Typography variant="span" textColor="secondary" className="text-sm">
            {t('start.drop.detail')}
          </Typography>
        </button>
        <input
          ref={picker}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];

            event.target.value = '';

            if (files.length > 0) {
              count('start', 'drop');
              onFiles(files);
            }
          }}
        />

        <button
          type="button"
          className={cn(tile, 'border-stroke')}
          onClick={() => {
            count('start', 'paste');
            onPaste();
          }}
        >
          <ClipboardPaste className="size-5 text-brand-tertiary" aria-hidden />
          <Typography variant="span" weight="semibold" textColor="primary">
            {t('start.paste.title')}
          </Typography>
          <Typography variant="span" textColor="secondary" className="text-sm">
            {t('start.paste.detail')}
          </Typography>
        </button>

        <button
          type="button"
          className={cn(tile, 'border-2 border-brand-tertiary')}
          onClick={() => {
            count('start', 'sample');
            onFiles([sampleFile(locale)]);
          }}
        >
          <FileText className="size-5 text-brand-tertiary" aria-hidden />
          <Typography variant="span" weight="semibold" textColor="primary">
            {t('start.sample.title')}
          </Typography>
          <Typography variant="span" textColor="secondary" className="text-sm">
            {t('start.sample.detail')}
          </Typography>
        </button>
      </div>
    </div>
  );
}

/**
 * Three steps for a new account, above its history. `changed` is anything that may have ticked a
 * step — the number of documents, say — so the list asks again when it moves.
 */
export function StartChecklist({
  changed,
  onShare,
}: {
  changed: unknown;
  onShare: (document: { id: string; name: string }) => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const [state, setState] = useState<Onboarding | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const wasShown = useRef(false);

  useEffect(() => {
    let live = true;
    const load = () =>
      api
        .onboarding()
        .then((next) => {
          if (!live) return;

          // Finished while it was on screen: the funnel's last step, counted once.
          if (wasShown.current && !next.show && next.steps.saved && next.steps.shared && next.steps.connected) {
            count('start', 'done');
          }

          wasShown.current = next.show;
          setState(next);
        })
        .catch(() => undefined);

    void load();
    // A step done in another tab or in Claude shows when somebody comes back to this one.
    window.addEventListener('focus', load);

    return () => {
      live = false;
      window.removeEventListener('focus', load);
    };
  }, [changed]);

  if (!state || isHidden) return null;

  const { steps } = state;
  const done = [steps.saved, steps.shared, steps.connected].filter(Boolean).length;

  if (!state.show) return null;

  const hide = () => {
    setIsHidden(true);
    count('start', 'hide');
    void api.hideOnboarding().catch(() => undefined);
  };

  const row = (isDone: boolean, title: string, detail: string, action?: ReactNode) => (
    <li className="flex items-start gap-3">
      {isDone ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-tertiary" aria-hidden />
      ) : (
        <Circle className="mt-0.5 size-5 shrink-0 text-ink-inactive" aria-hidden />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          variant="span"
          weight={isDone ? 'normal' : 'semibold'}
          textColor={isDone ? 'secondary' : 'primary'}
          className={cn('text-sm', isDone && 'line-through')}
        >
          {title}
        </Typography>
        {!isDone && (
          <Typography variant="span" textColor="secondary" className="text-sm">
            {detail}
          </Typography>
        )}
      </div>
      {!isDone && action}
    </li>
  );

  return (
    <section
      aria-label={t('start.list.title')}
      className="flex flex-col gap-3 rounded-xl border border-stroke bg-surface-card p-4"
    >
      <div className="flex items-center gap-2">
        <Typography variant="span" weight="semibold" textColor="primary">
          {t('start.list.title')}
        </Typography>
        <Typography variant="span" textColor="secondary" className="text-xs">
          {t('start.list.progress', { done, total: 3 })}
        </Typography>
        <button
          type="button"
          onClick={hide}
          aria-label={t('start.list.hide')}
          title={t('start.list.hide')}
          className="ml-auto rounded p-1 text-ink-inactive hover:bg-surface-chips hover:text-ink-primary"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-chips">
        <div className="h-full rounded-full bg-brand-tertiary transition-all" style={{ width: `${(done / 3) * 100}%` }} />
      </div>
      <ul className="flex flex-col gap-3">
        {row(steps.saved, t('start.step.save'), t('start.step.save.detail'))}
        {row(
          steps.shared,
          t('start.step.share'),
          t('start.step.share.detail'),
          state.latest && (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => {
                count('start', 'share');
                onShare(state.latest!);
              }}
            >
              {t('start.step.share.action', { name: state.latest.name.replace(/\.(md|markdown|txt)$/i, '') })}
            </Button>
          )
        )}
        {row(
          steps.connected,
          t('start.step.connect'),
          t('start.step.connect.detail'),
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => {
              count('start', 'connect');
              window.location.href = localePath(locale, staticPage('agents').path);
            }}
          >
            {t('start.step.connect.action')}
          </Button>
        )}
      </ul>
    </section>
  );
}
