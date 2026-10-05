import {
  BookOpen,
  Bot,
  Check,
  History,
  Menu,
  Newspaper,
  SquareSplitHorizontal,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
  CONVERSIONS,
  type ConversionId,
} from '@shared/conversions';
import { useI18n, useT } from '@/lib/i18n/context';
import { AGENT_LINKS } from './agentLinks';
import { BrandLogo } from './BrandLogo';
import { LOCALE_NAMES, LOCALES } from '@/lib/i18n/locales';
import { pagesIn, type StaticPageId } from '@/lib/pages';
import { LocaleFlag } from './LocaleFlag';
import type { AppView, Destination } from '@/lib/route';
import { IconButton } from '@/ui/components/IconButton';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/Sheet';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

interface MobileNavProps {
  view: AppView;
  conversionId: ConversionId;
  historyCount: number;
  /** Whether the page open is one of the assistants pages, for the row that leads there. */
  onAgentsPage: boolean;
  /** The page open, if a page is, so its row among the assistants is lit. */
  currentPage?: StaticPageId | null;
  onViewChange: (view: Destination) => void;
  onConversionChange: (id: ConversionId) => void;
  onOpenPage: (id: StaticPageId) => void;
}

/* The `label` is a catalogue key: the view and the glyph are the same in every language, the word is not. */
const DESTINATIONS: Array<{
  id: Extract<AppView, 'history' | 'docs' | 'blog' | 'livePreview'>;
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'livePreview', label: 'live.title', icon: SquareSplitHorizontal },
  { id: 'history', label: 'header.nav.history', icon: History },
  { id: 'docs', label: 'header.nav.documentation', icon: BookOpen },
  { id: 'blog', label: 'header.nav.blog', icon: Newspaper },
];

/**
 * The whole of the navigation, on a phone.
 *
 * Not the desktop row made smaller. Squeezing it produced a header 459px wide inside a 390px
 * screen — the page scrolled sideways on every route — and the cure for that had been to drop the
 * labels, which left a row of four unnamed icons and a menu that had to be opened to find out
 * where you already were.
 *
 * A sheet has room to say all of it. The destinations first — documentation, the blog, the
 * assistants — because they are what a person opens a menu on a phone to find, and under fifteen
 * conversions they were a long scroll away. Then the language, which the bar has no room for below
 * `sm`, then the conversions with the file types each takes and a tick on the current one, then the
 * pages people look for at the bottom of a site. Full-width rows, 44px tall, which is a thumb rather
 * than a cursor.
 *
 * The sheet is a flex column so that its body is the part that scrolls. Without it the body grew
 * to the height of every row, the sheet ran off the bottom of the screen, and the page behind it —
 * whose scrolling the dialog locks — could not be scrolled either: the last rows were unreachable.
 */
export function MobileNav({
  view,
  conversionId,
  historyCount,
  onAgentsPage,
  currentPage = null,
  onViewChange,
  onConversionChange,
  onOpenPage,
}: MobileNavProps) {
  const t = useT();
  const { content, locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  /* Going somewhere closes the sheet: it is a menu, not a second screen to dismiss. */
  const go = (act: () => void) => () => {
    setIsOpen(false);
    act();
  };

  const row = cn(
    'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left',
    'transition-colors hover:bg-state-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand'
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <IconButton
          variant="tertiary"
          size="sm"
          aria-label={t('header.menu.open')}
          className="md:hidden"
        >
          <Menu />
        </IconButton>
      </SheetTrigger>

      {/*
        * The component's own close button is 24px, which is a cursor's target rather than a
        * thumb's, so this sheet brings its own at the size the rest of the rows are.
        */}
      <SheetContent
        side="right"
        className="flex w-[19rem] max-w-[85vw] flex-col gap-0 p-0"
        isCloseButtonVisible={false}
      >
        <SheetHeader className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <SheetTitle>{t('header.menu.title')}</SheetTitle>
          <SheetClose asChild>
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label={t('header.menu.close')}
            >
              <X />
            </IconButton>
          </SheetClose>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-6 px-3 pb-8">
          <section className="flex flex-col gap-1">
            <Typography
              variant="span"
              weight="semibold"
              textColor="light"
              className="px-3 text-xxs uppercase tracking-wide"
            >
              {t('header.menu.goto')}
            </Typography>

            {DESTINATIONS.map(({ id, label: key, icon: Icon }) => {
              const isActive = view === id;
              const label = t(key);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={go(() => onViewChange(id))}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(row, isActive && 'bg-surface-accent')}
                >
                  <Icon
                    className={cn(
                      'size-4 shrink-0',
                      isActive ? 'text-brand-tertiary' : 'text-ink-secondary'
                    )}
                  />
                  <Typography
                    variant="span"
                    weight="medium"
                    textColor={isActive ? 'accent' : 'primary'}
                    className="text-sm"
                  >
                    {label}
                  </Typography>
                  {id === 'history' && historyCount > 0 && (
                    <span className="ml-auto rounded-full bg-surface-card2 px-2 py-0.5 text-ink-secondary text-xxs">
                      {historyCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* A page rather than a view, so not in DESTINATIONS — but a destination all the same. */}
            <button
              type="button"
              onClick={go(() => onOpenPage('agents'))}
              aria-current={currentPage === 'agents' ? 'page' : undefined}
              className={cn(row, currentPage === 'agents' && 'bg-surface-accent')}
            >
              <Bot className="size-4 shrink-0 text-brand-tertiary" />
              <Typography
                variant="span"
                weight="medium"
                textColor={onAgentsPage ? 'accent' : 'primary'}
                className="text-sm"
              >
                {t('header.nav.agents')}
              </Typography>
            </button>

            {/* The same three the bar's menu lists, one step in, so the plugin is a tap away too. */}
            <div className="flex flex-col gap-1 pl-6">
              {AGENT_LINKS.map((one) => (
                <button
                  key={one.id}
                  type="button"
                  onClick={go(() => onOpenPage(one.id))}
                  aria-current={currentPage === one.id ? 'page' : undefined}
                  className={cn(row, 'py-1.5', currentPage === one.id && 'bg-surface-accent')}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-stroke bg-surface-card2 text-ink-primary">
                    <BrandLogo name={one.logo} className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-col text-left">
                    <Typography variant="span" weight="medium" textColor="primary" className="text-sm">
                      {content.pages[one.id].label}
                    </Typography>
                    <Typography variant="span" textColor="secondary" className="text-xs">
                      {t(one.hint)}
                    </Typography>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/*
            * The language, which the bar only has room for from `sm` up. Each named in itself with
            * its flag, as in LanguageMenu, so somebody who landed in a language they cannot read
            * can still find their own here.
            */}
          <section className="flex flex-col gap-2">
            <Typography
              variant="span"
              weight="semibold"
              textColor="light"
              className="px-3 text-xxs uppercase tracking-wide"
            >
              {t('header.menu.language')}
            </Typography>

            {/* A grid, so every language gets the same pill: sized to its name, Italiano's came out the smallest. */}
            <div className="grid grid-cols-2 gap-2 px-3">
              {LOCALES.map((one) => (
                <button
                  key={one}
                  type="button"
                  lang={one}
                  onClick={go(() => setLocale(one))}
                  aria-current={one === locale ? 'true' : undefined}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand',
                    one === locale
                      ? 'border-brand-tertiary bg-surface-accent text-ink-highlight'
                      : 'border-stroke text-ink-body hover:bg-state-hover'
                  )}
                >
                  <LocaleFlag locale={one} className="h-3 w-4" />
                  {LOCALE_NAMES[one]}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-1">
            <Typography
              variant="span"
              weight="semibold"
              textColor="light"
              className="px-3 text-xxs uppercase tracking-wide"
            >
              {t('header.menu.convert')}
            </Typography>

            {CONVERSIONS.map((one) => {
              const isCurrent = view === 'converter' && conversionId === one.id;

              return (
                <button
                  key={one.id}
                  type="button"
                  onClick={go(() => onConversionChange(one.id))}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(row, isCurrent && 'bg-surface-accent')}
                >
                  <Check
                    className={cn(
                      'size-4 shrink-0',
                      isCurrent ? 'text-brand-tertiary' : 'invisible'
                    )}
                  />
                  <span className="flex min-w-0 flex-col">
                    <Typography
                      variant="span"
                      weight="medium"
                      textColor={isCurrent ? 'accent' : 'primary'}
                      className="text-sm"
                    >
                      {content.conversions[one.id].label}
                    </Typography>
                    <Typography
                      variant="span"
                      textColor="secondary"
                      className="truncate text-xs"
                    >
                      {one.extensions.join(', ')}
                    </Typography>
                  </span>
                </button>
              );
            })}
          </section>

          {/*
            * The footer's columns are a long scroll away on a phone; these are the ones asked for.
            * The how-to pages are deliberately not among them: there are eight, they are answers to
            * a search rather than somewhere a person navigates, and a phone menu with thirteen rows
            * in it is a list nobody reads.
            */}
          <section className="flex flex-col gap-1 border-stroke border-t pt-4">
            {[...pagesIn('company'), ...pagesIn('legal')].map((one) => (
              <button
                key={one.id}
                type="button"
                onClick={go(() => onOpenPage(one.id))}
                className={cn(row, 'py-2')}
              >
                <Typography
                  variant="span"
                  textColor="secondary"
                  className="text-sm"
                >
                  {content.pages[one.id].label}
                </Typography>
              </button>
            ))}
          </section>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
