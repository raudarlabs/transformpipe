import { Hono } from 'hono';
import { clientAddress } from './address.js';
import { currentUser, selfOrigin } from './auth.js';
import { brevoEnabled, isSubscribed, requestConfirmation, subscribe, unsubscribe } from './brevo.js';
import { countCall, isVerified } from './limits.js';

/*
 * The monthly product update, from the changelog page and the account menu.
 *
 * Signed in, it is one press: the address is the account's own and already confirmed, so there is
 * nothing to type and nothing to prove. Signed out, an address somebody types gets Brevo's
 * double opt-in email and joins the list only once its owner confirms — otherwise anybody could
 * sign anybody else up.
 *
 * An account whose address is not confirmed yet cannot subscribe from here either: the same rule
 * the onboarding sync keeps, for the same reason.
 */

const updates = new Hono();

const NO_STORE = { 'cache-control': 'private, no-store' };

/** Short and plain; Brevo checks the rest. */
const looksLikeEmail = (value: string) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

updates.get('/api/updates', async (c) => {
  const user = await currentUser(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401, NO_STORE);
  }

  if (!brevoEnabled() || !user.email) {
    return c.json({ available: false, verified: false, subscribed: false }, 200, NO_STORE);
  }

  const verified = await isVerified(user.id);
  const subscribed = verified ? await isSubscribed(user.email).catch(() => false) : false;

  return c.json({ available: true, verified, subscribed }, 200, NO_STORE);
});

updates.put('/api/updates', async (c) => {
  const user = await currentUser(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401, NO_STORE);
  }

  if (!brevoEnabled() || !user.email) {
    return c.json({ error: 'Product updates are not available here.' }, 503, NO_STORE);
  }

  if (!(await isVerified(user.id))) {
    return c.json({ error: 'Confirm your email address first.' }, 403, NO_STORE);
  }

  if (!(await countCall(`updates:${user.id}`).catch(() => ({ ok: true }))).ok) {
    return c.json({ error: 'Too many requests — try again in a minute.' }, 429, NO_STORE);
  }

  const body = (await c.req.json().catch(() => null)) as { subscribed?: unknown } | null;

  if (typeof body?.subscribed !== 'boolean') {
    return c.json({ error: 'Say whether to subscribe: { "subscribed": true | false }.' }, 400, NO_STORE);
  }

  try {
    if (body.subscribed) {
      await subscribe(user.email);
    } else {
      await unsubscribe(user.email);
    }
  } catch (error) {
    console.error('updates: Brevo refused', error);

    return c.json({ error: 'That did not go through. Try again in a minute.' }, 502, NO_STORE);
  }

  return c.json({ available: true, verified: true, subscribed: body.subscribed }, 200, NO_STORE);
});

updates.post('/api/updates/confirm', async (c) => {
  if (!brevoEnabled()) {
    return c.json({ error: 'Product updates are not available here.' }, 503, NO_STORE);
  }

  /*
   * Per address and per minute, like every other form a stranger can post: each request sends an
   * email from our domain to an address of the poster's choosing, which is exactly what a limit
   * is for.
   */
  if (!(await countCall(`updates-confirm:${clientAddress(c)}`).catch(() => ({ ok: true }))).ok) {
    return c.json({ error: 'Too many requests — try again in a minute.' }, 429, NO_STORE);
  }

  const body = (await c.req.json().catch(() => null)) as { email?: unknown } | null;
  const email = String(body?.email ?? '').trim().toLowerCase();

  if (!looksLikeEmail(email)) {
    return c.json({ error: 'That does not look like an email address.' }, 400, NO_STORE);
  }

  try {
    await requestConfirmation(email, selfOrigin(c));
  } catch (error) {
    console.error('updates: confirmation not sent', error);

    return c.json({ error: 'That did not go through. Try again in a minute.' }, 502, NO_STORE);
  }

  // The same answer whether or not the address was already subscribed: it is nobody else's business.
  return c.json({ ok: true }, 200, NO_STORE);
});

export default updates;
