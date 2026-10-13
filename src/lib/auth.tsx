import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type AuthUser } from './api';
import { useT } from './i18n/context';

/**
 * What the email calls answer when the account exists but its address is not confirmed yet: the
 * dialog then shows its "check your inbox" view instead of an error. Neon Auth requires the
 * address to be confirmed before signing in, and confirms it by a link in an email.
 */
export const NEEDS_VERIFICATION = 'needs-verification';

/** Where a confirmation link brings the person back to: here, query and all, without the hash. */
const returnHere = () => `${location.origin}${location.pathname}${location.search}`;

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  /** Set while the browser is on its way to Google. */
  isSigningIn: boolean;
  /** Why the last sign-in attempt did not finish, in the reader's language where we know it. */
  error: string | null;
  /** `to` is where to come back to; the connector hand-off needs somewhere other than here. */
  signIn: (to?: string) => Promise<void>;
  /** Returns the message to show beside the form, or null when the person is in. */
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string) => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  /** Asks the auth service to email a fresh confirmation link. */
  sendVerificationLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /**
   * An app waiting for this person to sign in so it can be connected — Obsidian, an assistant — or
   * null. `client` is its name once the server has said it, and null until then or if it cannot.
   */
  connecting: { id: string; client: string | null } | null;
  /** Gives up on that connection: the address loses its `connect` and the page is just the page. */
  leaveConnect: () => void;
}

/** Where a parked authorization request continues once there is a session. */
const connectTarget = (id: string) => `/api/oauth/authorize?p=${encodeURIComponent(id)}`;

const AuthContext = createContext<AuthState | null>(null);

/**
 * What the server can tell this page about a sign-in, as the key of the sentence that says it.
 *
 * A closed set, because the message is rendered as the app's own words in a toast, and both the
 * outcome and its reason arrive in a link — which is something anybody can write. Anything not on
 * this list is one sentence rather than an echo of the query string.
 */
const OUTCOMES: Record<string, string> = {
  'missing-verifier': 'auth.error.link',
  unreachable: 'auth.error.unreachable',
  rejected: 'auth.error.rejected',
  'no-session-cookie': 'auth.error.nosession',
};

/**
 * Reads the outcome /api/auth/finish left in the query string and clears it, so a reload does not
 * show a stale message.
 *
 * Answers with a catalogue key rather than a sentence: this runs once, before the first render, and
 * a reader who then switches language should see the message switch with everything else.
 */
function takeSignInOutcome(): string | null {
  const url = new URL(window.location.href);
  const outcome = url.searchParams.get('auth');

  if (!outcome) {
    return null;
  }

  url.searchParams.delete('auth');
  url.searchParams.delete('why');
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);

  if (outcome === 'ok') {
    return null;
  }

  return OUTCOMES[outcome] ?? 'auth.error.unfinished';
}

/** The one-time value Neon Auth hands back when an OAuth round trip completes. */
const VERIFIER = 'neon_auth_session_verifier';

function takeVerifier(): string | null {
  return new URL(window.location.href).searchParams.get(VERIFIER);
}

function stripVerifier() {
  const url = new URL(window.location.href);

  url.searchParams.delete(VERIFIER);
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

/**
 * Starts the Google round trip and leaves the page.
 *
 * Outside the component because the connector hand-off needs it before `signIn` is declared, and a
 * function that only navigates has no business holding state. `failed` is the sentence for the one
 * failure a person sees, since `api.ts` has no words of its own.
 */
async function handOffToGoogle(to: string, failed: string): Promise<void> {
  window.location.href = await api.startGoogleSignIn(to, failed);
}

/**
 * Why a sign-in did not happen: either a sentence of ours, by key, or words that came back from
 * somewhere else.
 *
 * Two shapes and not one, because the two cannot be treated alike. Ours is translated where it is
 * read, so it follows a reader who switches language; a message from the auth service or from a
 * thrown `Error` arrives in one language and can only be passed on as it is.
 */
type Failure = { key: string } | { text: string } | null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [connecting, setConnecting] = useState<AuthState['connecting']>(null);
  const [failure, setFailure] = useState<Failure>(() => {
    const key = takeSignInOutcome();

    return key ? { key } : null;
  });

  useEffect(() => {
    const verifier = takeVerifier();

    api.me().then((account) => {
      /*
       * A verifier in the address bar means an OAuth round trip came back to the page instead of
       * to /api/auth/finish — which happens, and leaves both an unfinished sign-in and a URL full
       * of machinery. Finish it here: only a server can trade the verifier for the session cookie,
       * so hand it over and come back clean.
       */
      if (verifier && !account) {
        const to = window.location.pathname + window.location.search.replace(
          new RegExp(`[?&]${VERIFIER}=[^&]*`),
          ''
        );

        window.location.replace(
          `/api/auth/finish?to=${encodeURIComponent(to || '/')}&${VERIFIER}=${encodeURIComponent(verifier)}`
        );
        return;
      }

      if (verifier) {
        stripVerifier();
      }

      /*
       * An assistant sent the person here to authorise a connection. The authorization request is
       * parked on the server under this opaque id; all this page does is make sure there is a
       * session and hand them back to it — which is why the id is the only thing in the address.
       *
       * Signed out, it used to send them on to Google at once, before this page had shown anything:
       * somebody who pressed Sign in in Obsidian found themselves on Google's account picker with
       * no word of TransformPipe and no way to use an email address. Ten of the first eleven left
       * there. Now the sign-in dialog opens, saying which app is asking — see ConnectGate — and
       * signing in any way it offers continues the connection, through the effect below.
       */
      const connect = new URL(window.location.href).searchParams.get('connect');

      if (connect) {
        if (account) {
          window.location.replace(connectTarget(connect));

          return;
        }

        setConnecting({ id: connect, client: null });
        api
          .pendingClient(connect)
          .then((client) =>
            setConnecting((now) => (now?.id === connect ? { id: connect, client } : now))
          )
          .catch(() => undefined);
      }

      setUser(account);
      setIsLoading(false);
    });
  }, []);

  /*
   * Signed in with a connection waiting: on to the consent page. Covers every way in at once — a
   * password, a new account confirmed with its code, and Google, whose round trip comes back to
   * this same address and finds the session on load.
   */
  useEffect(() => {
    if (user && connecting) {
      window.location.replace(connectTarget(connecting.id));
    }
  }, [user, connecting]);

  const leaveConnect = useCallback(() => {
    setConnecting(null);

    const url = new URL(window.location.href);

    url.searchParams.delete('connect');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []);

  const signIn = useCallback(
    async (to?: string) => {
      setIsSigningIn(true);
      setFailure(null);

      try {
        await handOffToGoogle(
          to ?? window.location.pathname + window.location.search,
          t('auth.error.start')
        );
      } catch (cause) {
        setIsSigningIn(false);
        setFailure(
          cause instanceof Error
            ? { text: cause.message }
            : { key: 'auth.error.start' }
        );
      }
    },
    [t]
  );

  /*
   * Email and password, in and up, and the reset request.
   *
   * All three go through here rather than being called from the dialog, for the same reason
   * `signIn` does: this is the only place that decides who is signed in, and a second copy of that
   * decision is how a form comes to think somebody is in while the header still shows a Sign in
   * button. On success the user in the response is the user — no second round trip to ask.
   *
   * The error is returned rather than stored. A failed password is a message that belongs beside
   * the field somebody just typed in, not in the banner that reports a broken sign-in service, and
   * putting it in `failure` would leave it on screen after the dialog closed.
   */
  const withEmail = useCallback(
    async (
      run: () => Promise<{ user?: AuthUser; token?: string | null }>
    ): Promise<string | null> => {
      setIsSigningIn(true);

      try {
        const body = await run();

        /*
         * `token: null` beside a user is a sign-up the auth service will not open a session for
         * until the address is confirmed: the account exists, nobody is signed in, and the link
         * is already on its way.
         */
        if (body.user && body.token === null) {
          setIsSigningIn(false);

          return NEEDS_VERIFICATION;
        }

        if (body.user) {
          setUser(body.user);
          setIsSigningIn(false);

          return null;
        }

        /*
         * A success with no user means the account exists but the session does not — which is what
         * an auth service configured to verify addresses answers. Asking again settles it rather
         * than guessing, and if there is still nobody, the caller says so.
         */
        const account = await api.me();

        setUser(account);
        setIsSigningIn(false);

        return account ? null : NEEDS_VERIFICATION;
      } catch (cause) {
        setIsSigningIn(false);

        /* Signing in before the address is confirmed is refused with a 403 that says so. */
        if (cause instanceof Error && /not verified/i.test(cause.message)) {
          return NEEDS_VERIFICATION;
        }

        return cause instanceof Error ? cause.message : t('auth.error.start');
      }
    },
    [t]
  );

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      withEmail(() => api.signInWithEmail(email, password)),
    [withEmail]
  );

  const signUpWithEmail = useCallback(
    (email: string, password: string) =>
      withEmail(() => api.signUpWithEmail(email, password, returnHere())),
    [withEmail]
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<string | null> => {
      try {
        await api.requestPasswordReset(email);

        return null;
      } catch (cause) {
        return cause instanceof Error ? cause.message : t('auth.error.start');
      }
    },
    [t]
  );

  /*
   * A fresh confirmation link, for whoever lost the first one or let it expire (fifteen minutes).
   *
   * Opening it confirms the address and signs the person in, and Neon Auth sends them back to the
   * page they were on — where `useAuth` asks who is signed in on load, so the confirmed flag is
   * read fresh rather than trusted from memory.
   */
  const sendVerificationLink = useCallback(
    async (email: string): Promise<string | null> => {
      try {
        await api.sendVerificationLink(email, returnHere());

        return null;
      } catch (cause) {
        return cause instanceof Error ? cause.message : t('auth.error.start');
      }
    },
    [t]
  );

  const signOut = useCallback(async () => {
    try {
      await api.signOut();
      setUser(null);
    } catch (cause) {
      setFailure(
        cause instanceof Error
          ? { text: cause.message }
          : { key: 'auth.error.signout' }
      );
    }
  }, []);

  /* Ours is translated here, at the last moment; anybody else's words are passed straight on. */
  const error =
    failure === null ? null : 'key' in failure ? t(failure.key) : failure.text;

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isSigningIn,
      error,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      requestPasswordReset,
      sendVerificationLink,
      signOut,
      connecting,
      leaveConnect,
    }),
    [
      user,
      isLoading,
      isSigningIn,
      error,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      requestPasswordReset,
      sendVerificationLink,
      signOut,
      connecting,
      leaveConnect,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
