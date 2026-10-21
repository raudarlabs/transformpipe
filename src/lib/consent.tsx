import { clarityConsent } from './clarity';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * What a visitor has allowed, and telling Google's tags about it.
 *
 * `index.html` denies everything before the tag manager loads — that is the half of consent that
 * has to happen before any script runs, and it is why this file can be ordinary React. Nothing is
 * stored in a browser until somebody says yes here, and until then Google's tags write nothing and
 * send cookieless pings at most.
 *
 * Two categories, because there are two. Necessary is the sign-in session and the theme, which are
 * not optional in any useful sense — refusing them means refusing to sign in — and analytics is
 * Google Analytics through the tag manager. There is no advertising category because there is no
 * advertising: `ad_storage` and its two companions stay denied in every branch below, and a switch
 * for something that is always off is a switch that lies about what the site does.
 */
export type Consent = {
  analytics: boolean;
};

export const NO_CONSENT: Consent = { analytics: false };

interface Stored extends Consent {
  /** So a later version of this file can tell an old answer from a current one. */
  version: 1;
  /** When it was answered, which is what the page can show back to the reader. */
  at: number;
}

const STORAGE_KEY = 'm2h.consent';

interface ConsentState {
  /** `null` until somebody has answered — which is what the banner waits for. */
  consent: Consent | null;
  decidedAt: number | null;
  save: (consent: Consent) => void;
  /** Forget the answer and ask again, for the control on the cookies page. */
  reset: () => void;
  /**
   * Whether the switches are open, which is state about a dialog and lives here anyway.
   *
   * The dialog is mounted once, beside the banner, and opened from two places that are nowhere near
   * it in the tree: the banner's own "Customise", and the button on the cookies page. A shared flag
   * is the small version of that; the alternative was a second provider whose only job is a boolean.
   */
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const ConsentContext = createContext<ConsentState | null>(null);

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<Stored>;

    return parsed.version === 1 && typeof parsed.analytics === 'boolean'
      ? { version: 1, analytics: parsed.analytics, at: parsed.at ?? 0 }
      : null;
  } catch {
    return null;
  }
}

/**
 * Consent Mode, updated.
 *
 * `gtag` is defined in `index.html` before the container loads, so it exists whether or not the
 * container ever arrives — a blocked tag manager leaves the queue unread rather than throwing here.
 */
function tell(consent: Consent) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;

  /* The same switch starts or stops Clarity: see src/lib/clarity.ts. */
  clarityConsent(consent.analytics);

  gtag?.('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Stored | null>(read);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* An answer from an earlier visit has to be repeated to the tags on this one. */
  useEffect(() => {
    if (stored) {
      tell(stored);
    }
  }, [stored]);

  const save = useCallback((consent: Consent) => {
    const next: Stored = { version: 1, analytics: consent.analytics, at: Date.now() };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* A browser refusing storage still gets the choice for this visit. */
    }

    setStored(next);
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Nothing to remove is the same outcome. */
    }

    tell(NO_CONSENT);
    setStored(null);
  }, []);

  const value = useMemo<ConsentState>(
    () => ({
      consent: stored ? { analytics: stored.analytics } : null,
      decidedAt: stored?.at ?? null,
      save,
      reset,
      settingsOpen,
      setSettingsOpen,
    }),
    [stored, save, reset, settingsOpen]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentState {
  const state = useContext(ConsentContext);

  if (!state) {
    throw new Error('useConsent outside ConsentProvider');
  }

  return state;
}
