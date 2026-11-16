import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Typography } from '../Typography';

export interface FooterLink {
  label: string;
  /**
   * What a screen reader hears instead of the label, when the label leans on its column heading
   * to make sense: "Word" under "To Markdown" is a menu entry, but read out alone it is a word.
   */
  fullLabel?: string;
  /** A real address, so the link is a link: middle-clickable, copyable, crawlable. */
  href: string;
  /**
   * Handled in the app rather than by the browser, when the destination is a view this app already
   * has. The href stays authoritative — this only saves a reload.
   */
  onNavigate?: () => void;
  /** Leaves the site. Opens in a new tab and says so to a screen reader. */
  external?: boolean;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
  /**
   * Splits this column's own list into two, side by side, once the layout has room for it (from
   * `md:` up). For a column with more links than the others — a growing list of conversions next
   * to a handful of legal pages — one tall list reads as a wall; two shorter ones read as a menu.
   */
  twoLists?: boolean;
  /**
   * Stays a toggle on a tablet too, and opens only from `lg:` up. For the columns that are a list
   * of pages rather than the reason somebody came: on a tablet the conversions are worth the room,
   * and the about-and-legal list under them is not.
   */
  collapseUntilWide?: boolean;
}

/*
 * The classes that differ between a column that opens from `md:` and one that opens from `lg:`,
 * written out whole so Tailwind finds every one of them in the source.
 */
const OPENS = {
  md: {
    column: 'md:gap-3 md:border-t-0 md:pb-8 lg:pb-0',
    toggle: 'md:hidden',
    heading: 'md:block',
    list: 'md:flex md:pb-0',
  },
  lg: {
    column: 'md:col-span-3 lg:col-span-1 lg:gap-3 lg:border-t-0',
    toggle: 'lg:hidden',
    heading: 'lg:block',
    list: 'lg:flex lg:pb-0',
  },
} as const;

interface SiteFooterProps {
  /** The wordmark, as its own element so the footer does not need to know how it is drawn. */
  brand: ReactNode;
  /** One line about the product. Not a paragraph — the columns are the content here. */
  tagline: string;
  /** Who made it. Shown under the tagline, where a reader looks for it. */
  builtBy?: ReactNode;
  /** Where else the product speaks — its accounts elsewhere, as marks under the tagline. */
  follow?: ReactNode;
  /**
   * A band above the columns for the one thing the site would most like a reader at the bottom to
   * do next. A node, because what it says and where its buttons go are the caller's business.
   */
  cta?: ReactNode;
  columns: FooterColumn[];
  /** The bottom line: a copyright, usually. A node, because the name in it can be a link. */
  note?: ReactNode;
  /**
   * What a screen reader hears after the name of a link that leaves the site.
   *
   * A prop with a default rather than a sentence in the markup: this component belongs to the
   * design system and has no business knowing which application's message table to ask, so the
   * caller hands over the words and the default keeps a caller who does not care working.
   */
  externalLabel?: string;
  className?: string;
}

/**
 * The foot of the site: where it all is.
 *
 * A footer is the one part of a page that is allowed to be a directory. Somebody who has read to
 * the bottom is either looking for something specific — the terms, the documentation, the format
 * they could not find in the header — or they are deciding whether this is a real product. Both
 * are answered by showing everything at once rather than making them hunt through a menu.
 *
 * Takes its columns as data, so it belongs to the design system rather than to this app's routing:
 * the labels, addresses and handlers are the caller's business.
 */
export function SiteFooter({
  brand,
  tagline,
  builtBy,
  follow,
  cta,
  columns,
  note,
  externalLabel = ' (opens in a new tab)',
  className,
}: SiteFooterProps) {
  /*
   * Which columns are open on a phone. Closed by default: twenty conversions and sixteen pages
   * stacked one under another made the footer a screen and a half of links, and somebody at the
   * bottom of a page on a phone is looking for one of them, not reading all of them. From `md:` up
   * every column is open and the toggle is not drawn. The links stay in the document either way,
   * so nothing a crawler follows depends on a tap.
   */
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const ids = useId();

  const toggle = (heading: string) =>
    setOpen((now) => {
      const next = new Set(now);

      if (next.has(heading)) {
        next.delete(heading);
      } else {
        next.add(heading);
      }

      return next;
    });

  return (
    <footer
      data-clarity-unmask="true"
      className={cn(
        'mt-16 border-stroke border-t bg-surface-card2/40',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-6 pt-10 pb-8 md:gap-10 md:pt-12">
        {cta}

        <div className="flex flex-col gap-8 xl:flex-row xl:justify-between xl:gap-12">
          {/* The lead: what this is, and who stands behind it. One line across the top on a laptop,
            * where it sits above the columns; a block of its own beside them from `xl:` up. */}
          <div className="flex max-w-sm flex-col gap-3 lg:max-w-none lg:flex-row lg:items-center lg:gap-6 xl:max-w-[15rem] xl:flex-col xl:items-start xl:gap-3">
            {brand}
            <Typography variant="p" textColor="secondary" className="text-sm">
              {tagline}
            </Typography>
            {follow && <div className="flex flex-wrap gap-2">{follow}</div>}
            {builtBy && (
              <Typography variant="p" textColor="light" className="text-xs">
                {builtBy}
              </Typography>
            )}
          </div>

          {/*
            * Four tracks from `lg:` up, sized to what they hold: the conversion names are single
            * words, and the page names ("Estensione per il browser") are the long ones, so equal
            * columns wrapped the pages while the formats sat in empty space. The brand sits above
            * the columns until `xl:`, where there is room for both on one row. Three units on a
            * tablet, where the two conversion columns fill the row. On a phone, one column of toggles.
            */}
          <nav
            aria-label="Site"
            className="grid grid-cols-1 md:grid-cols-3 md:gap-x-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.6fr)_minmax(0,1.35fr)_minmax(0,1.35fr)] lg:gap-y-8 xl:flex-1"
          >
            {columns.map((column, at) => {
              const isOpen = open.has(column.heading);
              const listId = `${ids}-${at}`;
              const opens = OPENS[column.collapseUntilWide ? 'lg' : 'md'];

              return (
                <div
                  key={column.heading}
                  className={cn(
                    'flex flex-col border-stroke border-t',
                    opens.column,
                    // Two lists of short names need close to as much room as two columns.
                    column.twoLists && 'md:col-span-2 lg:col-span-1'
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    onClick={() => toggle(column.heading)}
                    className={cn(
                      'flex w-full items-center justify-between py-3 text-left text-ink-primary text-sm',
                      opens.toggle,
                      'focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand'
                    )}
                  >
                    {column.heading}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn('size-4 text-ink-inactive transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>

                  <Typography
                    variant="span"
                    weight="semibold"
                    textColor="light"
                    className={cn('hidden text-xxs uppercase tracking-wide', opens.heading)}
                  >
                    {column.heading}
                  </Typography>

                  <ul
                    id={listId}
                    className={cn(
                      'flex-col gap-2',
                      isOpen ? 'flex pb-4' : 'hidden',
                      opens.list,
                      column.twoLists && 'md:block md:columns-2 md:gap-x-8'
                    )}
                  >
                    {column.links.map((link) => (
                      <li
                        key={`${column.heading}-${link.href}`}
                        className={column.twoLists ? 'md:mb-2 md:break-inside-avoid' : undefined}
                      >
                        <a
                          href={link.href}
                          {...(link.external
                            ? { target: '_blank', rel: 'noreferrer noopener' }
                            : {})}
                          onClick={(event) => {
                            /*
                             * Let the browser do its job when the person asked it to: a new tab, a
                             * new window, a saved link. Only a plain left click is ours to handle.
                             */
                            if (
                              !link.onNavigate ||
                              link.external ||
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
                            link.onNavigate();
                          }}
                          className={cn(
                            'text-ink-secondary text-sm no-underline transition-colors',
                            'hover:text-brand-tertiary',
                            'focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2'
                          )}
                        >
                          {link.fullLabel ? (
                            <>
                              <span aria-hidden="true">{link.label}</span>
                              <span className="sr-only">{link.fullLabel}</span>
                            </>
                          ) : (
                            link.label
                          )}
                          {link.external && (
                            <span className="sr-only">{externalLabel}</span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>

        {note && (
          <div className="border-stroke border-t pt-6">
            <Typography variant="span" textColor="light" className="text-xs">
              {note}
            </Typography>
          </div>
        )}
      </div>
    </footer>
  );
}
