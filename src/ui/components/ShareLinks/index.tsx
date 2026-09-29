import { Share2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Typography } from '../Typography';

/*
 * Share this page, as three links and nothing else.
 *
 * No embedded buttons and no SDK. Every one of these networks offers a script that renders its own
 * button, and every one of those scripts is a third party watching the reader — on a site whose
 * whole claim is that a document you convert is not sent anywhere. A plain anchor to a compose
 * screen does the same job: nothing loads until the reader clicks, and the only thing that reaches
 * the network is the click they asked for.
 *
 * Two shapes, because there are two places for this. In the body of an article the names are the
 * clearest thing — `X`, `LinkedIn`, `Reddit`, read rather than recognised. Beside a contents list
 * in a narrow column there is no room for three words, so the marks are drawn here as paths: an
 * icon library has a LinkedIn glyph and the old Twitter bird and nothing for X or Reddit, and a
 * bird beside a real logo beside an approximation of Snoo reads as three different decisions.
 */

export type ShareLinksVariant = 'names' | 'icons';

export interface ShareLinksProps {
  /** The absolute URL to share. A relative one gives the reader a broken post. */
  url: string;
  title: string;
  /**
   * The word beside the icon. A prop with a default, because this component is part of the design
   * system and must not reach into an application's message table for a translation; the network
   * names below are not translatable either way — they are the names of the services.
   */
  label?: string;
  /** `names` in prose, `icons` in a column too narrow for words. */
  variant?: ShareLinksVariant;
  className?: string;
}

interface Target {
  label: string;
  /** Built per target, because none of the three agrees on the parameter names. */
  href: (url: string, title: string) => string;
  /** The service's own mark, drawn at 24 units so all three share a grid. */
  mark: ReactNode;
}

/** X's mark on the same 24-unit grid, exported so the footer's link to the account draws this one. */
export const X_MARK_PATH =
  'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';

const TARGETS: Target[] = [
  {
    label: 'X',
    /*
     * `x.com/intent/post` is the current one: `twitter.com/intent/tweet` answers 301 to
     * `x.com/intent/tweet`, and a redirect is a thing to follow, not a thing to hard-code.
     */
    href: (url, title) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    mark: <path d={X_MARK_PATH} />,
  },
  {
    label: 'LinkedIn',
    /* Takes the URL alone — it reads the title and picture from the page's own og: tags. */
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    mark: (
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0" />
    ),
  },
  {
    label: 'Reddit',
    href: (url, title) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    mark: (
      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12m5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.982 0 1.777.796 1.777 1.777 0 .729-.435 1.343-1.045 1.623a3.4 3.4 0 0 1 .046.568c0 2.911-3.388 5.268-7.57 5.268-4.182 0-7.57-2.357-7.57-5.268 0-.197.016-.39.046-.578a1.78 1.78 0 0 1-1.023-1.612c0-.982.796-1.777 1.777-1.777.477 0 .901.182 1.207.49 1.207-.867 2.88-1.43 4.733-1.487l.89-4.182a.5.5 0 0 1 .61-.386l2.928.618a1.25 1.25 0 0 1 1.198-.899zM9.25 12C8.561 12 8 12.562 8 13.25s.561 1.248 1.25 1.248c.688 0 1.249-.56 1.249-1.25 0-.687-.561-1.248-1.25-1.248m5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249m-5.466 3.99a.32.32 0 0 0-.226.544c.73.73 2.137.788 2.548.788.41 0 1.817-.058 2.547-.788a.32.32 0 0 0-.006-.451.32.32 0 0 0-.438 0c-.462.462-1.454.625-2.103.625-.65 0-1.642-.163-2.104-.625a.32.32 0 0 0-.218-.093" />
    ),
  },
];

export function ShareLinks({
  url,
  title,
  label = 'Share',
  variant = 'names',
  className,
}: ShareLinksProps) {
  /*
   * A new tab in both shapes, because a reader part-way through an article should not lose it to a
   * compose screen. `noopener` because the opened page must not reach back into this one, and
   * `nofollow` because a share link is not a recommendation of the network.
   */
  const away = {
    target: '_blank',
    rel: 'noopener noreferrer nofollow',
  } as const;

  if (variant === 'icons') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Typography
          variant="span"
          textColor="light"
          className="block text-xxs uppercase tracking-wide"
        >
          {label}
        </Typography>

        <div className="flex flex-wrap gap-2">
          {TARGETS.map((target) => (
            <a
              key={target.label}
              href={target.href(url, title)}
              aria-label={target.label}
              title={target.label}
              {...away}
              className={cn(
                'flex size-9 items-center justify-center rounded-full border border-stroke text-ink-secondary',
                'transition-colors hover:border-stroke-hover hover:bg-state-hover hover:text-ink-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
                className="size-4"
              >
                {target.mark}
              </svg>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Typography
        variant="span"
        textColor="light"
        className="flex items-center gap-1.5 text-xs"
      >
        <Share2 aria-hidden className="size-3.5" />
        {label}
      </Typography>

      {TARGETS.map((target) => (
        <a
          key={target.label}
          href={target.href(url, title)}
          {...away}
          className={cn(
            'rounded-md border border-stroke px-2.5 py-1 font-medium text-ink-secondary text-xs',
            'transition-colors hover:border-stroke-hover hover:bg-state-hover hover:text-ink-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page'
          )}
        >
          {target.label}
        </a>
      ))}
    </div>
  );
}
