import {
  BookOpen,
  Check,
  ChevronDown,
  History,
  Newspaper,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CONVERSIONS, type ConversionId } from '@shared/conversions';
import { useI18n, useT } from '@/lib/i18n/context';
import { useBreadcrumbSlot } from './BreadcrumbSlot';
import { CommandPalette } from './CommandPalette';
import { Logo } from './Logo';
import { LanguageMenu } from './LanguageMenu';
import { MobileNav } from './MobileNav';
import { UserMenu } from './UserMenu';
import type { HistoryEntry } from '@/lib/history';
import type { StaticPageId } from '@/lib/pages';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

import type { AppView, Destination } from '@/lib/route';

export type { AppView, Destination };

interface AppHeaderProps {
  view: AppView;
  /** Which conversion the converter is on, so the menu can show it as the current one. */
  conversionId: ConversionId;
  historyCount: number;
  /** The documents themselves, for the palette: a name is the thing people search by. */
  documents: HistoryEntry[];
  onOpenDocument: (entry: HistoryEntry) => void;
  onViewChange: (view: Destination) => void;
  onConversionChange: (id: ConversionId) => void;
  /** Only the phone's menu offers these; on a wide screen they live in the footer. */
  onOpenPage: (id: StaticPageId) => void;
  /** The logo doubles as "start over": back to the converter with no file open. */
  onHome: () => void;
}

/*
 * The order, the ids and the glyphs. Every label is read from the catalogue at render time.
 */
const NAV_ITEMS = [
  { id: 'history' as const, label: 'header.nav.history', icon: History },
  { id: 'docs' as const, label: 'header.nav.docs', icon: BookOpen },
  { id: 'blog' as const, label: 'header.nav.blog', icon: Newspaper },
];

/*
 * The bar, rebuilt.
 *
 * What it was: one fill lighter than the page, running the full width, holding a wordmark, a line
 * repeating the page's own heading, four labelled destinations, a language, a theme and an account
 * — nine things of equal weight on a band that was the brightest thing on the screen.
 *
 * What it is now, in three parts:
 *
 *   The bar goes *under* the page rather than over it — `--surface-header` is a shade darker than
 *   `--surface-page` on dark — and the only bright thing on it is a two-pixel line of brand along
 *   the top edge. Chrome that recedes is chrome you stop seeing, which is the job.
 *
 *   The middle is a search box instead of a sentence. The line beside the wordmark said what the
 *   page's own h1 says three centimetres lower; what it replaces is the thing this app had no way
 *   to do at all — fifteen conversions and twenty-four pages, reachable by typing two letters of the name.
 *   ⌘K opens it from anywhere, which is where the second half of the roadmap is going.
 *
 *   The three destinations lose their words and keep their glyphs, with the name in `title` and
 *   `aria-label`, because the room they were taking is now the search box and every one of them is
 *   also a named link in the footer.
 *
 * Under it sits a strip for the page's breadcrumb trail — see `BreadcrumbSlot`. The trail is still
 * built by the page; it just no longer sits inside the page's own column, between the bar and the
 * heading, where it read as the first line of the content.
 */
export function AppHeader({
  view,
  conversionId,
  historyCount,
  documents,
  onOpenDocument,
  onViewChange,
  onConversionChange,
  onOpenPage,
  onHome,
}: AppHeaderProps) {
  const t = useT();
  const { content } = useI18n();
  const slot = useBreadcrumbSlot();
  const [palette, setPalette] = useState(false);
  const [apple, setApple] = useState(false);
  const isConverter = view === 'converter';

  /*
   * The shortcut, and the one thing it must not do is eat somebody's browser shortcut on a machine
   * where it means something else — so it is the combination every other palette uses, and it is
   * bound once, here, because this bar is on every page of the app.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette((open) => !open);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* Which key to draw on the hint. Read after mount, because the server has no keyboard. */
  useEffect(() => {
    setApple(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <header className="sticky top-0 z-20">
      {/* The one bright thing on the bar, and it is two pixels tall. */}
      <div
        aria-hidden="true"
        className="h-0.5 bg-gradient-to-r from-brand-tertiary via-brand-primary to-transparent"
      />

      <div className="border-stroke border-b bg-surface-header/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onHome}
            aria-label={t('header.home')}
            className={cn(
              'shrink-0 cursor-pointer rounded-md px-1 py-0.5 transition-opacity',
              'hover:opacity-80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2'
            )}
          >
            <Logo />
          </button>

          {/*
            * Fifteen conversions behind one control, and the control says which one you are on. It is
            * the first thing after the wordmark because it is the thing people come back to change.
            */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('header.nav.converter')}
                className={cn(
                  'hidden h-9 max-w-[14rem] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 font-medium text-sm transition-colors sm:flex',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2',
                  isConverter
                    ? 'border-brand-tertiary/40 bg-surface-accent text-ink-highlight'
                    : 'border-stroke text-ink-secondary hover:border-stroke-hover hover:text-ink-body'
                )}
              >
                {/*
                  * The conversion, named, on every page of the app — not only on the converter.
                  *
                  * It used to fall back to the word "Converter" once you left, which changed the
                  * width of the control, which moved the search box and everything after it: the
                  * bar jumped on the way to the documentation and jumped back on the way out. It
                  * also threw away the answer to the question the control exists to answer — which
                  * conversion you are coming back to. Arriving straight on a page that is not a
                  * conversion, it is the default one, which is where Back lands anyway.
                  *
                  * All ten names are here and nine of them are invisible, stacked in one grid cell,
                  * so the control is as wide as the longest of them in whatever language is on and
                  * stops resizing as you switch between `JSON → Markdown` and `Excel → Markdown
                  * table`. Ten spans rather than a measured width: the browser is better at this
                  * than a `ResizeObserver` is, and it gets the answer before the first paint.
                  */}
                <span className="grid min-w-0">
                  {CONVERSIONS.map((one) => (
                    <span
                      key={one.id}
                      aria-hidden={one.id !== conversionId}
                      className={cn(
                        'col-start-1 row-start-1 truncate',
                        one.id !== conversionId && 'invisible'
                      )}
                    >
                      {content.conversions[one.id].label}
                    </span>
                  ))}
                </span>
                <ChevronDown className="size-3.5 shrink-0 opacity-70" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-64">
              {CONVERSIONS.map((one) => (
                <DropdownMenuItem
                  key={one.id}
                  onSelect={() => onConversionChange(one.id)}
                  className="flex items-start gap-2"
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      isConverter && conversionId === one.id
                        ? 'text-brand-tertiary'
                        : 'invisible'
                    )}
                  />
                  <span className="flex min-w-0 flex-col">
                    <Typography variant="span" weight="medium" textColor="primary">
                      {content.conversions[one.id].label}
                    </Typography>
                    <Typography variant="span" textColor="secondary" className="text-xs">
                      {one.extensions.join(', ')}
                    </Typography>
                  </span>
                </DropdownMenuItem>
              ))}

              {/*
               * Under a rule, because it is not an eleventh conversion: the ten above turn a file
               * into something, this one is a place to type. It belongs in this menu all the same —
               * "Converter" is what a person opens when they want a different tool, and a page
               * reachable only from the footer is a page nobody reaches.
               */}
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() => onViewChange('livePreview')}
                className="flex items-start gap-2"
              >
                <Check
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    view === 'livePreview' ? 'text-brand-tertiary' : 'invisible'
                  )}
                />
                <span className="flex min-w-0 flex-col">
                  <Typography variant="span" weight="medium" textColor="primary">
                    {t('live.title')}
                  </Typography>
                  <Typography variant="span" textColor="secondary" className="text-xs">
                    {t('live.menu.hint')}
                  </Typography>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* The search box: a button that looks like a field, because nothing is typed into it. */}
          <button
            type="button"
            onClick={() => setPalette(true)}
            aria-label={t('palette.title')}
            className={cn(
              'mx-auto hidden h-9 w-full max-w-md min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-stroke bg-surface-page/70 px-3 text-ink-inactive text-sm transition-colors md:flex',
              'hover:border-stroke-hover hover:text-ink-secondary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand'
            )}
          >
            <Search className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">
              {t('palette.placeholder')}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <kbd className="rounded border border-stroke bg-surface-card2 px-1.5 py-0.5 font-sans text-xxs">
                {apple ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="rounded border border-stroke bg-surface-card2 px-1.5 py-0.5 font-sans text-xxs">
                K
              </kbd>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0 md:gap-1">
            {/* The same search, for a screen with no room for the box. */}
            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-label={t('palette.title')}
              title={t('palette.title')}
              className={cn(
                'flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-secondary transition-colors md:hidden',
                'hover:bg-state-hover hover:text-ink-body',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand'
              )}
            >
              <Search className="size-4" />
            </button>

            {/*
              * Glyph, name in the tooltip. The words moved out to make room for the search box, and
              * every one of these is a named link in the footer as well — see `AppFooter`.
              */}
            <nav
              aria-label={t('header.menu.goto')}
              className="hidden items-center gap-0.5 md:flex"
            >
              {NAV_ITEMS.map(({ id, label: key, icon: Icon }) => {
                const isActive = view === id;
                const label = t(key);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onViewChange(id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={label}
                    title={label}
                    className={cn(
                      'relative flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand',
                      isActive
                        ? 'bg-surface-accent text-ink-highlight'
                        : 'text-ink-secondary hover:bg-state-hover hover:text-ink-body'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {id === 'history' && historyCount > 0 && (
                      <span className="-top-0.5 -right-0.5 absolute rounded-full bg-surface-card2 px-1 py-px text-ink-secondary text-xxs leading-tight">
                        {historyCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/*
              * Before the account, and outside it on purpose.
              *
              * A reader who has landed in a language they cannot read has to be able to get out
              * without opening a menu whose label they cannot read either — so the switcher is a
              * button in the bar, not an entry inside the account dropdown, and it is there whether
              * anybody is signed in or not.
              */}
            <LanguageMenu className="hidden sm:inline-flex" />

            <UserMenu />

            <MobileNav
              view={view}
              conversionId={conversionId}
              historyCount={historyCount}
              onViewChange={onViewChange}
              onConversionChange={onConversionChange}
              onOpenPage={onOpenPage}
            />
          </div>
        </div>
      </div>

      {/*
        * The second tier: where you are, on its own line. Hidden rather than absent when the page
        * has no trail, so the element the trail portals into never has to be remounted.
        */}
      <div
        className={cn(
          'border-stroke/60 border-b bg-surface-header/70 backdrop-blur',
          !slot?.filled && 'hidden'
        )}
      >
        <div
          ref={slot?.setNode}
          className="mx-auto flex h-9 w-full max-w-content items-center px-4 sm:px-6"
        />
      </div>

      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        documents={documents}
        onOpenDocument={onOpenDocument}
        onViewChange={onViewChange}
        onConversionChange={onConversionChange}
        onOpenPage={onOpenPage}
      />
    </header>
  );
}
