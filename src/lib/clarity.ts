/*
 * Microsoft Clarity: where people click, scroll and give up, as heatmaps and recordings.
 *
 * Part of the one analytics switch in the cookie banner, never on its own. Three rules hold it to
 * what the privacy and cookies pages say:
 *
 * - Nothing loads until analytics is allowed. Refusing later tells Clarity to stop, and the next
 *   page load does not start it again.
 * - It waits for the page. The script is fetched after `load`, when the browser is idle, so the
 *   first paint and the first click never wait on it.
 * - It never sees a document. The project masks all text (Strict mode, set in the Clarity
 *   settings), and every place a document is drawn carries `data-clarity-mask` too, so a change
 *   of mode there still cannot record one. A shared page (`/s/`, `/f/`) and the embed never load
 *   it at all, because what they show is somebody else's document.
 */

const PROJECT = 'z1czfpqtp3';

/** Addresses that only ever show a document, or are not a page: Clarity is not started there. */
const NEVER = /^\/(?:(?:de|fr|es|it)\/)?(?:s|f|open|open-folder|embed|admin|rate|report)(?:\/|$)/;

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

let started = false;

function clarity(): ClarityFn | undefined {
  return (window as unknown as { clarity?: ClarityFn }).clarity;
}

function enabled(): boolean {
  return (
    import.meta.env.PROD &&
    /^https?:$/.test(window.location.protocol) &&
    !navigator.webdriver &&
    !NEVER.test(window.location.pathname)
  );
}

function inject() {
  const queue: ClarityFn = Object.assign(
    (...args: unknown[]) => {
      (queue.q ??= []).push(args);
    },
    { q: [] as unknown[][] }
  );

  (window as unknown as { clarity: ClarityFn }).clarity = queue;

  const script = document.createElement('script');

  script.async = true;
  script.src = `https://www.clarity.ms/tag/${PROJECT}`;
  document.head.appendChild(script);

  /* The answer was yes, or this would not be running. Clarity asks for it in this shape. */
  queue('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
}

/** Called with the visitor's analytics answer, on every page load and whenever it changes. */
export function clarityConsent(analytics: boolean): void {
  try {
    if (!analytics) {
      /* Stops an instance already running on this page; a refused visitor never gets one. */
      clarity()?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      return;
    }

    if (started || !enabled()) {
      return;
    }

    started = true;

    const later = () =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(inject, { timeout: 5000 })
        : setTimeout(inject, 2000);

    if (document.readyState === 'complete') {
      later();
    } else {
      window.addEventListener('load', later, { once: true });
    }
  } catch {
    /* Analytics failing is never a reason for the page to. */
  }
}
