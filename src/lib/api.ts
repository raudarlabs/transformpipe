import type { HistoryEntry } from './history';

/** The signed-in user, as Neon Auth describes them. */
export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  /**
   * Whether the address has been confirmed.
   *
   * True without asking for anybody who signed in with Google — the provider asserts the address,
   * so there is nothing for us to confirm. False for an account made with a password until the
   * code from the email is entered.
   */
  emailVerified?: boolean;
}

interface ServerDocument {
  id: string;
  name: string;
  /** Absent on rows written before there was more than one conversion. */
  kind?: HistoryEntry['kind'];
  size: number;
  stats: HistoryEntry['stats'];
  created_at: string;
  markdown?: string;
  replaces?: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init,
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    throw new Error(
      detail?.error ?? detail?.message ?? `Request failed (${response.status})`
    );
  }

  return (await response.json()) as T;
}

function toEntry(doc: ServerDocument): HistoryEntry {
  return {
    id: doc.id,
    name: doc.name,
    kind: doc.kind ?? 'markdown-to-html',
    size: doc.size,
    createdAt: new Date(doc.created_at).getTime(),
    markdown: doc.markdown,
    stats: doc.stats,
    /** Server-backed rows can always be fetched in full on demand. */
    remote: true,
    replaces: doc.replaces ?? null,
  };
}

export interface Usage {
  bytes: number;
  documents: number;
  limits: { bytes: number; documents: number; documentBytes: number };
}

/** One thing the person connected — an assistant, not a token. */
export interface Grant {
  clientId: string;
  name: string;
  since: string;
  lastUsed: string | null;
  tokens: number;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  created_at: string;
  last_attempted_at: string | null;
  last_status: number | null;
  last_error: string | null;
}

export type ShareMode = 'private' | 'link' | 'people';

export interface ShareState {
  mode: ShareMode;
  token: string | null;
  emails: string[];
  /** When the link stops working, ISO 8601, or null for never. In the past means it has stopped. */
  expiresAt: string | null;
  /** How many times this link was opened — opens, not people, the owner's own included. */
  views: number;
  lastViewedAt: string | null;
  /** Whether the link asks for a password. The password itself cannot be read back by anybody. */
  hasPassword: boolean;
}

/** A document's recent opens, for the Views tab — see `recentViews` in server/share-gate.ts. */
export interface DocumentViewsState {
  mode: ShareMode;
  views: number;
  lastViewedAt: string | null;
  /** `who` only on a share addressed to people: the named address that opened it. */
  events: Array<{ at: string; via: 'page' | 'app'; who?: string }>;
  /** The most the list holds; `views` above it means older opens are counted but not listed. */
  limit: number;
  /** Each address a people-share names, with its opens — empty for a link. */
  people: Array<{ email: string; opens: number; lastAt: string | null }>;
  /** The owner's own address, so their opens read as "you". */
  you: string;
}

export interface SharedDocument {
  name: string;
  markdown: string;
  createdAt: number;
  /** Addressed to this reader by name, so the owner sees their opens. */
  watched: boolean;
}

export const api = {
  /** Null when nobody is signed in — Better Auth answers null rather than erroring, and so does this. */
  me: async (): Promise<AuthUser | null> => {
    try {
      const body = await request<{ user?: AuthUser } | null>(
        '/api/auth/get-session'
      );

      return body?.user ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Starts Google sign-in and returns the URL to send the browser to. The callback lands on
   * /api/auth/finish, which exchanges the one-time verifier for a session cookie — only a server
   * can do that — and sends the browser back where it started.
   *
   * `failed` is the sentence to throw when there is no URL to go to, because that one is shown to
   * a person and this file has no language: everything else it throws is a developer's line.
   */
  startGoogleSignIn: async (returnTo: string, failed: string): Promise<string> => {
    const body = await request<{ url?: string; message?: string }>(
      '/api/auth/sign-in/social',
      {
        method: 'POST',
        body: JSON.stringify({
          provider: 'google',
          callbackURL: `${location.origin}/api/auth/finish?to=${encodeURIComponent(returnTo)}`,
        }),
      }
    );

    if (!body.url) {
      throw new Error(body.message ?? failed);
    }

    return body.url;
  },

  /*
   * Email and password, through the same proxy Google goes through.
   *
   * No `finish` hand-off here: the social flow needs it because a one-time verifier has to be
   * exchanged for a session on a server, and these two get their session cookie in the response
   * to the request itself. The proxy strips the cookie's Domain on the way back, so it belongs to
   * this site rather than to Neon's.
   *
   * Errors are the auth service's own words. `request` already lifts `message` out of the body,
   * and Better Auth says things like "Invalid email or password" — which is more use to a person
   * than a sentence of ours that has to guess which of the two it was.
   */
  signInWithEmail: (email: string, password: string) =>
    request<{ user?: AuthUser }>('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Creates an account.
   *
   * `name` is required by the auth service and the form does not ask for one, so it comes from the
   * address. That is a deliberate trade: a name field is one more thing to fill in before somebody
   * has converted a single file, and what the name is for here is a greeting — it can be changed
   * later, and an address is what the account is actually identified by.
   */
  signUpWithEmail: (email: string, password: string) =>
    request<{ user?: AuthUser }>('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name: email.split('@')[0] || email,
      }),
    }),

  /**
   * Asks for a password-reset link.
   *
   * Answers the same way whether or not the address has an account — "if this email exists…" — and
   * that is the auth service's decision, not a vagueness of ours: an endpoint that says "no such
   * account" is an endpoint that tells a stranger who has one.
   */
  requestPasswordReset: (email: string) =>
    request<{ status?: boolean; message?: string }>(
      '/api/auth/request-password-reset',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          redirectTo: `${location.origin}/`,
        }),
      }
    ),

  /**
   * Sends a fresh six-digit code to the address.
   *
   * Signing up does not send one — the auth service leaves that to the application, which is why
   * an account created here sat unverified with nothing in the inbox until this was called.
   */
  sendVerificationCode: (email: string) =>
    request<{ success?: boolean }>('/api/auth/email-otp/send-verification-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type: 'email-verification' }),
    }),

  /**
   * Confirms the address with the code from the email.
   *
   * A code and not a link: the message carries six digits that expire in ten minutes, so there is
   * nothing to click and the product has to ask for them. A wrong one comes back as
   * `INVALID_OTP`, which `request` lifts into the message shown under the field.
   */
  verifyEmailCode: (email: string, otp: string) =>
    request<{ status?: boolean; user?: AuthUser }>(
      '/api/auth/email-otp/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }
    ),

  signOut: () =>
    request<{ success?: boolean }>('/api/auth/sign-out', {
      method: 'POST',
      body: '{}',
    }),

  /** `q` searches document content, not just the name the caller already has locally. */
  listDocuments: async (options: { q?: string } = {}) => {
    const query = options.q ? `?q=${encodeURIComponent(options.q)}` : '';
    const { documents } = await request<{ documents: ServerDocument[] }>(
      `/api/documents${query}`
    );

    return documents.map(toEntry);
  },

  getDocument: async (id: string) => {
    const { document } = await request<{ document: ServerDocument }>(
      `/api/documents/${id}`
    );

    return toEntry(document);
  },

  createDocument: async (input: {
    name: string;
    kind: HistoryEntry['kind'];
    size: number;
    markdown: string;
    stats: HistoryEntry['stats'];
    /** Links this save to an earlier document as a newer version of it. Opt-in; see the server. */
    replaces?: string;
  }) => {
    const { document } = await request<{ document: ServerDocument }>(
      '/api/documents',
      { method: 'POST', body: JSON.stringify(input) }
    );

    return toEntry(document);
  },

  /** Every document in the same version chain as `id`, oldest first. */
  documentVersions: (id: string) =>
    request<{ versions: Array<{ id: string; name: string; created_at: string }> }>(
      `/api/documents/${id}/versions`
    ),

  deleteDocument: (id: string) =>
    request<{ ok: true }>(`/api/documents/${id}`, { method: 'DELETE' }),

  clearDocuments: () =>
    request<{ ok: true }>('/api/documents', { method: 'DELETE' }),

  /** Documents other people shared with this address, newest share first. */
  listSharedWithMe: async (): Promise<HistoryEntry[]> => {
    const { documents } = await request<{
      documents: Array<
        ServerDocument & { share_token: string; owner_email: string }
      >;
    }>('/api/shared-with-me');

    return documents.map((doc) => ({
      ...toEntry(doc),
      sharedBy: doc.owner_email,
      shareToken: doc.share_token,
    }));
  },

  usage: () => request<Usage>('/api/usage'),

  listKeys: async () => (await request<{ keys: ApiKey[] }>('/api/keys')).keys,

  createKey: (name: string) =>
    request<{ key: string; created: ApiKey }>('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  revokeKey: (id: string) =>
    request<{ ok: true }>(`/api/keys/${id}`, { method: 'DELETE' }),

  /** Removes the row of a key that has already been revoked. */
  forgetKey: (id: string) =>
    request<{ ok: true }>(`/api/keys/${id}?forget=1`, { method: 'DELETE' }),

  /** Assistants this account has connected, grouped by client rather than by token. */
  listGrants: async () =>
    (await request<{ grants: Grant[] }>('/api/oauth/grants')).grants,

  /*
   * The id goes in the query string, not the path: a client that identified itself with a metadata
   * document has a URL for a client_id, and a URL inside a path segment is an encoded slash that
   * something between here and the function will decode.
   */
  revokeGrant: (clientId: string) =>
    request<{ ok: true; revoked: number }>(
      `/api/oauth/grants?client=${encodeURIComponent(clientId)}`,
      { method: 'DELETE' }
    ),

  getShare: (id: string) => request<ShareState>(`/api/documents/${id}/share`),

  documentViews: (id: string) => request<DocumentViewsState>(`/api/documents/${id}/views`),

  setShareMode: (id: string, mode: ShareMode) =>
    request<ShareState>(`/api/documents/${id}/share`, {
      method: 'PUT',
      body: JSON.stringify({ mode }),
    }),

  /** A password on a link, or null to take it off. Only a link has one. */
  setSharePassword: (id: string, password: string | null) =>
    request<ShareState>(`/api/documents/${id}/share`, {
      method: 'PUT',
      body: JSON.stringify({ mode: 'link', password }),
    }),

  /** The same call with an end date: null clears it, and the mode is sent as it stands. */
  setShareExpiry: (id: string, mode: ShareMode, expiresAt: string | null) =>
    request<ShareState>(`/api/documents/${id}/share`, {
      method: 'PUT',
      body: JSON.stringify({ mode, expiresAt }),
    }),

  addShareRecipient: (id: string, email: string) =>
    request<ShareState>(`/api/documents/${id}/share/people`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  removeShareRecipient: (id: string, email: string) =>
    request<ShareState>(
      `/api/documents/${id}/share/people?email=${encodeURIComponent(email)}`,
      { method: 'DELETE' }
    ),

  /**
   * A short summary of a document, generated once and cached on the row — a second call for the
   * same document is free unless `force` is passed, which asks for a fresh one.
   */
  summarizeDocument: (id: string, options: { force?: boolean } = {}) =>
    request<{ summary: string; summarized_at: string }>(
      `/api/documents/${id}/summary${options.force ? '?force=1' : ''}`,
      { method: 'POST' }
    ),

  /**
   * The same summary as the model writes it: `onText` gets the whole text so far after every piece.
   *
   * A summary already kept comes back whole, as JSON, and is handed over in one go. A new one
   * streams as plain text; if the model stops part-way the text ends with U+0000 and the reason,
   * which is thrown here after `onText` has had what did arrive.
   */
  streamSummary: async (
    id: string,
    options: { force?: boolean; onText: (text: string) => void }
  ): Promise<{ summary: string; summarized_at: string }> => {
    const response = await fetch(
      `/api/documents/${id}/summary?stream=1${options.force ? '&force=1' : ''}`,
      { method: 'POST', credentials: 'same-origin' }
    );

    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { error?: string } | null;

      throw new Error(detail?.error ?? `Request failed (${response.status})`);
    }

    if ((response.headers.get('content-type') ?? '').includes('application/json') || !response.body) {
      const kept = (await response.json()) as { summary: string; summarized_at: string };

      options.onText(kept.summary);

      return kept;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';

    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      text += decoder.decode(value, { stream: true });
      options.onText(text.split('\u0000')[0]);
    }

    text += decoder.decode();

    const [written, broke] = text.split('\u0000');

    if (broke !== undefined) {
      throw new Error(broke || 'The summary stopped part-way');
    }

    return { summary: written.trim(), summarized_at: new Date().toISOString() };
  },

  /** A .docx of a saved document, built on request — see server/docx.ts. */
  downloadDocx: async (id: string): Promise<Blob> => {
    const response = await fetch(`/api/documents/${id}/docx`, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      throw new Error(detail?.error ?? `Request failed (${response.status})`);
    }

    return response.blob();
  },

  listWebhooks: async () =>
    (await request<{ webhooks: WebhookRow[] }>('/api/webhooks')).webhooks,

  createWebhook: (url: string) =>
    request<{ secret: string; webhook: WebhookRow }>('/api/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  revealWebhookSecret: (id: string) =>
    request<{ secret: string }>(`/api/webhooks/${id}/reveal`, { method: 'POST' }),

  revokeWebhook: (id: string) =>
    request<{ ok: true }>(`/api/webhooks/${id}`, { method: 'DELETE' }),

  /** The public read: 404 when it was never shared, 401/403 when it was not shared with you. */
  getShared: async (token: string): Promise<SharedDocument> => {
    const { document, watched } = await request<{
      document: { name: string; markdown: string; created_at: string };
      watched?: boolean;
    }>(`/api/shared/${encodeURIComponent(token)}`);

    return {
      name: document.name,
      markdown: document.markdown,
      createdAt: new Date(document.created_at).getTime(),
      watched: watched === true,
    };
  },
};
