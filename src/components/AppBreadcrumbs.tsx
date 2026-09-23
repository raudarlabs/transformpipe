import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CrumbSpec } from '@/lib/breadcrumbs';
import type { Destination } from '@/lib/route';
import { Breadcrumbs } from '@/ui/components/Breadcrumbs';
import { useBreadcrumbSlot } from './BreadcrumbSlot';

interface AppBreadcrumbsProps {
  items: CrumbSpec[];
  /** Moving inside the app rather than reloading it, when the destination is a view we have. */
  onNavigate: (view: Destination) => void;
  className?: string;
}

/**
 * Which view a crumb's address is, when the app has it as a view — the front page, the blog, the
 * changelog, in any language. Anything else, a page under which another sits, stays an ordinary
 * link: sending it to the converter, which is what every crumb that was not the blog used to do,
 * took the reader somewhere the crumb did not say.
 */
function viewFor(path: string): Destination | null {
  const rest = path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  if (rest === '/') {
    return 'converter';
  }

  if (rest === '/blog') {
    return 'blog';
  }

  if (rest === '/changelog') {
    return 'changelog';
  }

  return null;
}

/**
 * The trail from `src/lib/breadcrumbs.ts`, wired to this app's navigation.
 *
 * Rendered into the strip under the header when there is one — see `BreadcrumbSlot` — and where the
 * page put it when there is not. The page keeps deciding what the trail says; the app decides where
 * it sits. In the strip the page's own spacing does not apply, because the spacing there belongs to
 * the strip.
 */
export function AppBreadcrumbs({
  items,
  onNavigate,
  className,
}: AppBreadcrumbsProps) {
  const slot = useBreadcrumbSlot();
  const claim = slot?.claim;

  useEffect(() => claim?.(), [claim]);

  const trail = (
    <Breadcrumbs
      className={slot?.node ? undefined : className}
      items={items.map((crumb) => {
        const view = crumb.path ? viewFor(crumb.path) : null;

        return {
          label: crumb.label,
          href: crumb.path,
          onNavigate: view ? () => onNavigate(view) : undefined,
        };
      })}
    />
  );

  return slot?.node ? createPortal(trail, slot.node) : trail;
}
