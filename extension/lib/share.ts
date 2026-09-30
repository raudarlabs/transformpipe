/*
 * Sharing, as the extension does it.
 *
 * The dialog is the app's — three modes, a link row, a list of addresses — and this is the four
 * calls behind it, pointed at the public API instead of at the session-cookie one the site uses.
 * `ShareDialog` takes them as a parameter for exactly this reason: the extension is a different
 * origin with a different credential, and everything above the transport is the same product.
 *
 * `PUT /documents/:id/share` replaces the whole audience on every call, so adding or removing one
 * address is read-then-write rather than a call of its own. The app has endpoints for those two;
 * `/api/v1` deliberately does not, and a list of five addresses is not worth an endpoint.
 */
import type { ShareMode, ShareState } from '@/lib/api';
import type { ShareClient } from '@/components/ShareDialog';
import { call } from './account';
import { accessToken } from './auth';

const SITE = 'https://transformpipe.com';

interface V1Share {
  mode: ShareMode;
  url: string | null;
  emails: string[];
  expires_at?: string | null;
  views?: number;
  last_viewed_at?: string | null;
  has_password?: boolean;
}

/*
 * The dialog works in tokens and builds the address itself, because on the site the address
 * depends on where the app is running. The API hands back the finished URL, so the token is read
 * back out of it rather than asked for twice.
 */
const asState = (share: V1Share): ShareState => ({
  mode: share.mode,
  token: share.url ? (share.url.split('/s/')[1] ?? null) : null,
  emails: share.emails ?? [],
  expiresAt: share.expires_at ?? null,
  views: share.views ?? 0,
  lastViewedAt: share.last_viewed_at ?? null,
  hasPassword: share.has_password === true,
});

async function ask(path: string, init?: RequestInit): Promise<ShareState> {
  const token = await accessToken();

  if (!token) {
    throw new Error('not signed in');
  }

  const response = await call(token, path, init);

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    /* The sentence the server wrote, where there is one: "confirm your email address" is an
     * instruction, and "HTTP 403" is not. */
    throw new Error(failure?.error ?? `HTTP ${response.status}`);
  }

  return asState((await response.json()) as V1Share);
}

const read = (id: string) => ask(`/documents/${id}/share`);

const write = (id: string, mode: ShareMode, emails?: string[]) =>
  ask(`/documents/${id}/share`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    /* `emails` left out means "leave the audience alone" — sending an empty list would clear it. */
    body: JSON.stringify(emails ? { mode, emails } : { mode }),
  });

export const extensionShareClient: ShareClient = {
  get: read,
  setMode: (id, mode) => write(id, mode),

  setPassword: (id, password) =>
    ask(`/documents/${id}/share`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'link', password }),
    }),

  setExpiry: (id, mode, expiresAt) =>
    ask(`/documents/${id}/share`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, expires_at: expiresAt }),
    }),

  add: async (id, email) => {
    const now = await read(id);
    const address = email.trim().toLowerCase();

    return write(id, 'people', [...now.emails, address]);
  },

  remove: async (id, email) => {
    const now = await read(id);
    const address = email.trim().toLowerCase();

    return write(
      id,
      'people',
      now.emails.filter((kept) => kept.toLowerCase() !== address)
    );
  },

  url: (token) => `${SITE}/s/${token}`,
};
