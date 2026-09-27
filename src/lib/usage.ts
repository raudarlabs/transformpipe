import {
  type BrowserEvent,
  campaignOf,
  pageKeyFor,
  sourceOf,
  type TallyBody,
} from '@shared/usage';
import { splitLocale } from './i18n/locales';
import { STATIC_PAGES } from './pages';

/*
 * The browser half of the first-party counter. See `shared/usage.ts` for what it counts.
 *
 * Nothing is stored for it: no cookie, nothing in local or session storage, no id of any kind. The
 * one thing carried from page to page is where this page load came from, and it is carried in this
 * module's memory, which is gone when the tab is — so a visit that arrived from Product Hunt credits
 * Product Hunt with the conversion it led to, and a reload is simply a new page load.
 *
 * It must never cost the page anything. A count is sent with `sendBeacon` after the page has
 * loaded, it is never awaited, and every failure is swallowed: a blocked request, an old browser,
 * a server that is down. Development, the extension and anything driven by automation are not
 * counted at all.
 */

const ENDPOINT = '/api/tally';
const STATIC_PATHS = STATIC_PAGES.map((page) => page.path);

/** Where this page load came from, decided once, from what the browser already knows. */
let arrival: { source: string; campaign: string } | null = null;

function arrivedFrom() {
  if (!arrival) {
    arrival = {
      source: sourceOf(document.referrer, window.location.hostname),
      campaign: campaignOf(window.location.search),
    };
  }

  return arrival;
}

function enabled(): boolean {
  return (
    import.meta.env.PROD &&
    /^https?:$/.test(window.location.protocol) &&
    !navigator.webdriver
  );
}

/*
 * Held until the page has finished loading, so a count is never one of the requests the first
 * paint waits behind. `pagehide` sends whatever is still waiting when somebody leaves early.
 */
let loaded = false;
const waiting: string[] = [];

function transmit(body: string) {
  try {
    if (navigator.sendBeacon?.(ENDPOINT, body)) {
      return;
    }

    void fetch(ENDPOINT, {
      method: 'POST',
      body,
      keepalive: true,
      credentials: 'omit',
      headers: { 'content-type': 'text/plain' },
    }).catch(() => undefined);
  } catch {
    /* Not counting is always an acceptable outcome. */
  }
}

function flush() {
  loaded = true;

  for (const body of waiting.splice(0)) {
    transmit(body);
  }
}

function send(body: string) {
  if (loaded) {
    transmit(body);
    return;
  }

  if (waiting.length === 0) {
    /* Safari has no idle callback; a timeout after `load` is the same promise, slightly less kept. */
    const later = () =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(flush, { timeout: 3000 })
        : setTimeout(flush, 0);

    if (document.readyState === 'complete') {
      later();
    } else {
      window.addEventListener('load', later, { once: true });
    }

    window.addEventListener('pagehide', flush, { once: true });
  }

  // A tab that sits unloaded forever is not going to send forty of these.
  if (waiting.length < 10) {
    waiting.push(body);
  }
}

/** Counts one thing that happened, in the language of the page it happened on. */
export function count(event: BrowserEvent, key: string): void {
  try {
    if (!enabled()) {
      return;
    }

    const { source, campaign } = arrivedFrom();
    const body: TallyBody = {
      e: event,
      k: key,
      l: splitLocale(window.location.pathname).locale,
      s: source,
    };

    if (campaign) {
      body.u = campaign;
    }

    send(JSON.stringify(body));
  } catch {
    /* See above. */
  }
}

/*
 * A page load that came from somewhere: not a reload, not Back, not our own link opened afresh.
 *
 * The navigation type is the browser's own answer to "is this a reload", and it is the difference
 * between counting visits and counting the times somebody pressed F5 on one.
 */
function isArrival(): boolean {
  if (arrivedFrom().source === 'internal') {
    return false;
  }

  try {
    const [entry] = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];

    return !entry || entry.type === 'navigate';
  } catch {
    return true;
  }
}

let lastView = '';

/**
 * Counts the page the address now shows, once per change of address.
 *
 * Called on the first render, on Back and Forward, and from `move` in route.ts — the one place the
 * app changes address — so a single-page move is a view like any other. The same address twice in
 * a row is one view: StrictMode runs effects twice, and a replaced query string is not a new page.
 */
export function countView(): void {
  try {
    const { locale, rest } = splitLocale(window.location.pathname);
    const key = pageKeyFor(rest, STATIC_PATHS);
    const seen = `${locale}${key}`;

    if (seen === lastView) {
      return;
    }

    const first = lastView === '';

    lastView = seen;

    /*
     * A page a browser prerendered on a hunch has not been seen by anybody yet; it is counted when
     * it is shown, if it ever is.
     */
    const prerendering = (document as Document & { prerendering?: boolean })
      .prerendering;

    const record = () => {
      if (first && isArrival()) {
        count('visit', key);
      }

      count('view', key);
    };

    if (prerendering) {
      document.addEventListener('prerenderingchange', record, { once: true });
    } else {
      record();
    }
  } catch {
    /* See above. */
  }
}
