import {
  BookOpen,
  CornerDownLeft,
  FileCode2,
  FileText,
  History,
  Newspaper,
  Search,
  Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CONVERSIONS, type ConversionId } from '@shared/conversions';
import { useI18n, useT } from '@/lib/i18n/context';
import type { HistoryEntry } from '@/lib/history';
import { STATIC_PAGES, type StaticPageId } from '@/lib/pages';
import type { Destination } from '@/lib/route';
import { Input } from '@/ui/components/Input';
import { Modal, ModalContent, ModalTitle } from '@/ui/components/Modal';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewChange: (view: Destination) => void;
  onConversionChange: (id: ConversionId) => void;
  onOpenPage: (id: StaticPageId) => void;
  /** What is in the history right now — the account's documents, or this browser's. */
  documents: HistoryEntry[];
  onOpenDocument: (entry: HistoryEntry) => void;
}

interface Command {
  key: string;
  group: string;
  label: string;
  /** The line under the label: what the thing takes, or where it goes. */
  detail?: string;
  icon: LucideIcon;
  run: () => void;
}

/*
 * The destinations that are not conversions and not pages. Labels come from the catalogue at render
 * time; what is here is what does not change with the language.
 */
const PLACES: { view: Destination; label: string; icon: LucideIcon }[] = [
  { view: 'history', label: 'header.nav.history', icon: History },
  { view: 'docs', label: 'header.nav.docs', icon: BookOpen },
  { view: 'blog', label: 'header.nav.blog', icon: Newspaper },
  { view: 'changelog', label: 'changelog.title', icon: Tag },
  { view: 'livePreview', label: 'live.title', icon: FileCode2 },
];

/** Case- and accent-insensitive, so `konvertieren` finds itself and `Konvertieren` does too. */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Everything this app can do, in one list, opened with ⌘K.
 *
 * The bar at the top of the screen holds eleven conversions behind a menu, three destinations and
 * nineteen pages behind a footer — which is a reasonable header and a slow way to get anywhere once
 * you know what you want. This is the fast way: type two letters of it.
 *
 * Documents are in it by name. The list the history is already holding is the list this searches,
 * so it costs no request and is exactly as complete as the history is — which for a signed-in
 * account is everything in it. Searching *inside* documents exists too and stays where it is: it
 * asks the server, and the place to do that is the history, which can show what it found. A
 * palette answers while you type or it is not a palette.
 *
 * Five of them show with an empty query, newest first, because a palette that opens on a blank
 * list makes you type before it tells you anything. The sixth row is the way to the rest.
 */
/** How many recent documents the palette shows before somebody searches. */
const RECENT = 5;

export function CommandPalette({
  open,
  onOpenChange,
  onViewChange,
  onConversionChange,
  onOpenPage,
  documents,
  onOpenDocument,
}: CommandPaletteProps) {
  const t = useT();
  const { content } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    /*
     * Newest first, and the whole list: the trimming to five happens after the filter, so a search
     * reaches every document while an empty palette stays short.
     */
    const recent = [...documents]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((entry) => ({
        key: `document:${entry.id}`,
        group: t('palette.group.recent'),
        label: entry.name,
        detail: content.conversions[entry.kind]?.short,
        icon: FileText,
        run: () => onOpenDocument(entry),
      }));

    const conversions = CONVERSIONS.map((one) => ({
      key: `conversion:${one.id}`,
      group: t('header.menu.convert'),
      label: content.conversions[one.id].label,
      detail: one.extensions.join(', '),
      icon: FileCode2,
      run: () => onConversionChange(one.id),
    }));

    const places = PLACES.map((place) => ({
      key: `place:${place.view}`,
      group: t('header.menu.goto'),
      label: t(place.label),
      icon: place.icon,
      run: () => onViewChange(place.view),
    }));

    const pages = STATIC_PAGES.map((page) => ({
      key: `page:${page.id}`,
      group: t('palette.group.read'),
      label: content.pages[page.id].label,
      detail: page.path,
      icon: BookOpen,
      run: () => onOpenPage(page.id),
    }));

    return [...recent, ...conversions, ...places, ...pages];
  }, [
    content,
    t,
    documents,
    onConversionChange,
    onViewChange,
    onOpenPage,
    onOpenDocument,
  ]);

  const matches = useMemo(() => {
    const needle = fold(query.trim());

    const found = needle
      ? commands.filter((command) =>
          fold(
            `${command.label} ${command.detail ?? ''} ${command.group}`
          ).includes(needle)
        )
      : commands;

    if (needle) {
      return found;
    }

    /*
     * With nothing typed, the documents are cut to five and the rest of the list follows whole. A
     * palette that opened on forty file names would bury the eleven conversions under them.
     */
    const documents_ = found.filter((command) =>
      command.key.startsWith('document:')
    );
    const rest = found.filter((command) => !command.key.startsWith('document:'));

    const seeAll: Command[] =
      documents_.length > RECENT
        ? [
            {
              key: 'document:all',
              group: t('palette.group.recent'),
              label: t('palette.seeall'),
              icon: History,
              run: () => onViewChange('history'),
            },
          ]
        : [];

    return [...documents_.slice(0, RECENT), ...seeAll, ...rest];
  }, [commands, query, t, onViewChange]);

  /* A new search is a new list, so the highlight goes back to the top of it. */
  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  /* Keep the highlighted row in view when the arrows walk past the bottom of the box. */
  useEffect(() => {
    list.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (command: Command | undefined) => {
    if (!command) {
      return;
    }

    onOpenChange(false);
    command.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || (event.key === 'n' && event.ctrlKey)) {
      event.preventDefault();
      setActive((index) => (matches.length ? (index + 1) % matches.length : 0));
    }

    if (event.key === 'ArrowUp' || (event.key === 'p' && event.ctrlKey)) {
      event.preventDefault();
      setActive((index) =>
        matches.length ? (index - 1 + matches.length) % matches.length : 0
      );
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      choose(matches[active]);
    }
  };

  let group = '';

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        isCloseButtonVisible={false}
        className="top-[12%] max-w-xl translate-y-0 gap-0 p-0"
      >
        <ModalTitle className="sr-only">{t('palette.title')}</ModalTitle>

        <div className="flex items-center gap-3 border-stroke border-b px-4">
          <Search className="size-4 shrink-0 text-ink-inactive" />
          {/* biome-ignore lint/a11y/noAutofocus: a palette opens for typing into */}
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('palette.placeholder')}
            aria-label={t('palette.title')}
            className="h-12 border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>

        <div ref={list} className="max-h-[22rem] overflow-y-auto p-2">
          {matches.length === 0 && (
            <Typography
              variant="p"
              textColor="secondary"
              className="px-3 py-6 text-center text-sm"
            >
              {t('palette.empty')}
            </Typography>
          )}

          {matches.map((command, index) => {
            const heading = command.group === group ? null : command.group;
            group = command.group;
            const Icon = command.icon;

            return (
              <div key={command.key}>
                {heading && (
                  <Typography
                    variant="p"
                    textColor="light"
                    className="px-3 pt-3 pb-1 text-xxs uppercase tracking-wider"
                  >
                    {heading}
                  </Typography>
                )}

                <button
                  type="button"
                  data-active={index === active}
                  onClick={() => choose(command)}
                  onMouseMove={() => setActive(index)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    index === active
                      ? 'bg-surface-accent text-ink-primary'
                      : 'text-ink-body'
                  )}
                >
                  <Icon className="size-4 shrink-0 text-ink-inactive" />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {command.label}
                  </span>
                  {command.detail && (
                    <span className="shrink-0 text-ink-inactive text-xs">
                      {command.detail}
                    </span>
                  )}
                  {index === active && (
                    <CornerDownLeft className="size-3.5 shrink-0 text-ink-inactive" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </ModalContent>
    </Modal>
  );
}
