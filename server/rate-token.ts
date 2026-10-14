import { createHmac, timingSafeEqual } from 'node:crypto';

/*
 * Who clicked a score in an email, without the email address in the link.
 *
 * Every contact in Brevo carries `TP_RATE`, written by the sync (`brevo.ts`): the account's id and
 * a signature over it. The 1-to-10 links put it in the address as `u=`, and `/rate` checks the
 * signature before it believes the id. So a link that was forwarded still names the person it was
 * sent to, and nobody can make one that names somebody else.
 *
 * The signature comes first. The sync compares attributes on their first ten characters, and an
 * id-first token would never look changed if the key ever were.
 *
 * The key is `RATING_SECRET` where it is set, and otherwise one derived from `CRON_SECRET`, which
 * every deployment that sends these emails already has. Without either there is no token, and a
 * score is counted the way it always was: with nothing about who.
 */

const key = () => {
  const own = process.env.RATING_SECRET;

  if (own) return own;

  const cron = process.env.CRON_SECRET;

  return cron ? createHmac('sha256', cron).update('transformpipe rating links').digest('hex') : '';
};

const signatureOf = (secret: string, userId: string) =>
  createHmac('sha256', secret).update(`rate:${userId}`).digest('base64url').slice(0, 22);

export function rateToken(userId: string): string | undefined {
  const secret = key();

  return secret ? `${signatureOf(secret, userId)}.${userId}` : undefined;
}

/** The account a token names, or null when it is missing, malformed or not ours. */
export function userOfToken(token: unknown): string | null {
  const secret = key();

  if (!secret || typeof token !== 'string' || token.length > 200) return null;

  const dot = token.indexOf('.');

  if (dot <= 0) return null;

  const userId = token.slice(dot + 1);
  const given = Buffer.from(token.slice(0, dot));
  const wanted = Buffer.from(signatureOf(secret, userId));

  return userId && given.length === wanted.length && timingSafeEqual(given, wanted) ? userId : null;
}
