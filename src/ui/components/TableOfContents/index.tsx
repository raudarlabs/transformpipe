import { List, type LucideIcon } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../Sheet';
import { Typography } from '../Typography';

export interface TocItem {
  /** The id of the heading it jumps to. */
  id: string;
  title: string;
  /** 2 sits flush, 3 is indented under it. Anything deeper is noise in a list this size. */
  level?: 2 | 3;
  /** The documentation's sections carry one; an article's headings do not. */
  icon?: LucideIcon;
}

interface TableOfContentsProps {
  items: TocItem[];
  /**
   * What sits under the list, in the same sticky column — the share buttons, on an article.
   *
   * Under rather than beside: it is the second thing anybody looks for in that column, and it stays
   * put while the list scrolls, which is why the scrolling moved from the column to the list.
   */
  footer?: ReactNode;
  /** The id the reader is currently on — see `useActiveHeading`. */
  activeId?: string;
  label?: string;
  /** The track it occupies. Wider where the entries are article headings rather than short names. */
  width?: string;
  className?: string;
}

/**
 * The contents of a long page, down its left side.
 *
 * Written once because two pages need it and they had better behave the same: the documentation,
 * which has eleven named sections, and an article, which now has thirty headings because the pieces
 * are four thousand words rather than one. At that length a reader who wants the section on tables
 * should not have to scroll for it.
 *
 * It scrolls inside itself rather than growing past the window, which is what a thirty-item list
 * does to a sticky element otherwise: the last entries end up below the fold and unreachable.
 */
export function TableOfContents({
  items,
  footer,
  activeId,
  label = 'On this page',
  width = 'w-44',
  className,
}: TableOfContentsProps) {
  if (items.length === 0) {
    return footer ? (
      <div
        className={cn(
          'sticky top-20 hidden h-fit shrink-0 lg:block',
          width,
          className
        )}
      >
        {footer}
      </div>
    ) : null;
  }

  return (
    <nav
      aria-label={label}
      className={cn(
        'sticky top-20 hidden h-fit max-h-[calc(100dvh-7rem)] shrink-0 flex-col lg:flex',
        width,
        className
      )}
    >
      <Typography
        variant="span"
        textColor="light"
        className="mb-2 block text-xxs uppercase tracking-wide"
      >
        {label}
      </Typography>

      {/* The list scrolls, not the column: whatever is under it has to stay where it was put. */}
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {items.map(({ id, title, level = 2, icon: Icon }) => {
          const isActive = activeId === id;

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition-colors',
                  level === 3 ? 'pl-5 text-xs' : 'pl-2',
                  isActive
                    ? 'bg-surface-accent text-ink-highlight'
                    : 'text-ink-secondary hover:bg-state-hover hover:text-ink-body'
                )}
              >
                {Icon && <Icon className="size-3.5 shrink-0" />}
                {/*
                  * Two lines, not an ellipsis. With a handful of entries there is room, and a
                  * heading cut to "Why "it converts Markdown" tells…" is a heading you cannot
                  * tell from its neighbour. Past two lines it wraps to an ellipsis after all.
                  */}
                <span className="line-clamp-2 min-w-0">{title}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {footer && (
        <div className="mt-6 border-stroke border-t pt-4">{footer}</div>
      )}
    </nav>
  );
}

/** Scrolls to a heading the way its anchor would, and puts the anchor in the address. */
function jumpTo(id: string) {
  const heading = document.getElementById(id);

  if (heading) {
    // `scroll-mt-*` on the heading keeps it clear of the sticky header, as the anchor does.
    heading.scrollIntoView({ block: 'start' });
    history.replaceState(history.state, '', `#${id}`);
  }
}

/**
 * The same contents, on a screen too narrow for the column.
 *
 * Below `lg` the list above is hidden, and a manual with eleven sections or an article with thirty
 * headings became one long scroll with no way to see what is in it. So a button in the corner the
 * back-to-top button leaves free — bottom left — names the section you are in and opens the whole
 * list from the bottom of the screen, where a thumb already is. Fixed rather than sticky under the
 * header, because the header's height changes with the page and a sticky bar would have to know it.
 *
 * A picked entry is scrolled to after the sheet has closed, not on the tap: while it is open the
 * page underneath is locked, and a jump made then is undone when the lock lets go.
 */
export function TableOfContentsButton({
  items,
  activeId,
  label = 'On this page',
  className,
}: Pick<TableOfContentsProps, 'items' | 'activeId' | 'label' | 'className'>) {
  const [isOpen, setIsOpen] = useState(false);
  const pending = useRef<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  const current = items.find((item) => item.id === activeId);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={current ? `${label}: ${current.title}` : label}
          className={cn(
            'fixed bottom-6 left-4 z-40 flex h-12 max-w-[calc(100vw-7.5rem)] cursor-pointer items-center gap-2 rounded-full',
            'border border-stroke bg-surface-card px-4 text-ink-body text-sm shadow-dropdown',
            'transition-colors hover:bg-state-hover lg:hidden',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand',
            className
          )}
        >
          <List className="size-4 shrink-0 text-brand-tertiary" />
          <span className="truncate">{current?.title ?? label}</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="flex max-h-[75dvh] flex-col gap-0 rounded-t-2xl p-0"
        onCloseAutoFocus={(event) => {
          const id = pending.current;

          pending.current = null;

          if (id) {
            // Focus back on the button would be a scroll back to it on some browsers.
            event.preventDefault();
            requestAnimationFrame(() => jumpTo(id));
          }
        }}
      >
        <SheetHeader className="px-5 pt-5 pb-2">
          <SheetTitle className="text-base">{label}</SheetTitle>
        </SheetHeader>

        <SheetBody className="px-3 pb-6">
          <ul className="space-y-0.5">
            {items.map(({ id, title, level = 2, icon: Icon }) => {
              const isActive = activeId === id;

              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      pending.current = id;
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm transition-colors',
                      level === 3 ? 'pl-8' : 'pl-3',
                      isActive
                        ? 'bg-surface-accent text-ink-highlight'
                        : 'text-ink-body hover:bg-state-hover'
                    )}
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span className="min-w-0">{title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
