import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Typography } from '../Typography';

export interface FooterLink {
  label: string;
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
   * `sm:` up). For a column with more links than the others — a growing list of conversions next
   * to a handful of legal pages — one tall list reads as a wall; two shorter ones read as a menu.
   */
  twoLists?: boolean;
}

interface SiteFooterProps {
  /** The wordmark, as its own element so the footer does not need to know how it is drawn. */
  brand: ReactNode;
  /** One line about the product. Not a paragraph — the columns are the content here. */
  tagline: string;
  /** Who made it. Shown under the tagline, where a reader looks for it. */
  builtBy?: ReactNode;
  /** Where else the product speaks — its accounts elsewhere, as marks under the tagline. */
  follow?: ReactNode;
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
  columns,
  note,
  externalLabel = ' (opens in a new tab)',
  className,
}: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'mt-16 border-stroke border-t bg-surface-card2/40',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-content flex-col gap-10 px-6 pt-12 pb-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* The lead: what this is, and who stands behind it. */}
          <div className="flex max-w-sm flex-col gap-3">
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
            * Four units wide and stretched to fill what the brand block leaves: the double column
            * takes two, the two single ones take one each. It used to declare five while only four
            * were ever occupied, so a unit of the row sat empty — which read as a gap on the right
            * and squeezed the converter's labels onto two lines apiece.
            */}
          <nav
            aria-label="Site"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:flex-1 lg:gap-12"
          >
            {columns.map((column) => (
              <div
                key={column.heading}
                className={cn(
                  'flex flex-col gap-3',
                  // Half the grid on its own: two lists of five need close to as much room as the
                  // other three columns combined, or the longer labels wrap where nothing else does.
                  column.twoLists && 'sm:col-span-2'
                )}
              >
                <Typography
                  variant="span"
                  weight="semibold"
                  textColor="light"
                  className="text-xxs uppercase tracking-wide"
                >
                  {column.heading}
                </Typography>

                <ul
                  className={cn(
                    'flex flex-col gap-2',
                    column.twoLists && 'sm:block sm:columns-2 sm:gap-x-8'
                  )}
                >
                  {column.links.map((link) => (
                    <li
                      key={`${column.heading}-${link.label}`}
                      className={column.twoLists ? 'sm:mb-2 sm:break-inside-avoid' : undefined}
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
                        {link.label}
                        {link.external && (
                          <span className="sr-only">{externalLabel}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
