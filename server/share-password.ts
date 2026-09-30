import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/*
 * A password on a shared link: how it is kept, checked, and remembered for a day.
 *
 * Kept as a scrypt hash with its own salt and never as itself, so nobody — the owner included —
 * can read it back; it can only be replaced or removed. Remembered in a cookie that is a signature
 * made with that hash as the key, which needs no secret of its own and no table: whoever holds the
 * row can sign, nobody else can, and a new password is a new key, so every cookie the old one
 * issued stops working at the moment it is changed.
 */

const N = 16_384;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;

/** A day. Long enough not to be asked twice in a sitting; short enough to lapse on a shared laptop. */
export const UNLOCK_SECONDS = 24 * 60 * 60;

const derive = (password: string, salt: Buffer, n: number, r: number, p: number) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize('NFC'), salt, KEY_LENGTH, { N: n, r, p }, (error, key) =>
      error ? reject(error) : resolve(key)
    )
  );

/** `scrypt$N$r$p$salt$key`, both in base64url — the parameters travel with the hash. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);

  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, key] = stored.split('$');

  if (scheme !== 'scrypt' || !salt || !key) {
    return false;
  }

  const expected = Buffer.from(key, 'base64url');
  const actual = await derive(
    password,
    Buffer.from(salt, 'base64url'),
    Number(n),
    Number(r),
    Number(p)
  );

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export type PasswordInput =
  | { ok: true; value: string | null | undefined }
  | { ok: false; error: string };

/** A password as a caller sent it: absent leaves it, null removes it, a string sets it. */
export function readPassword(value: unknown): PasswordInput {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: 'A password must be text, or null to remove it' };
  }

  if (value.length < PASSWORD_MIN || value.length > PASSWORD_MAX) {
    return {
      ok: false,
      error: `A password is ${PASSWORD_MIN} to ${PASSWORD_MAX} characters long`,
    };
  }

  return { ok: true, value };
}

/** One cookie per link, named by a hash of its token so the token itself is not in the name. */
export const unlockCookie = (token: string) =>
  `tp_unlock_${createHash('sha256').update(token).digest('hex').slice(0, 16)}`;

const sign = (token: string, stored: string, expires: number) =>
  createHmac('sha256', stored).update(`${token}.${expires}`).digest('base64url');

/** What the cookie holds: when it lapses, and a signature over that and the link. */
export function unlockValue(token: string, stored: string, now = Date.now()): string {
  const expires = now + UNLOCK_SECONDS * 1000;

  return `${expires}.${sign(token, stored, expires)}`;
}

/** Whether a cookie proves this password was entered for this link, and has not lapsed. */
export function unlocked(token: string, stored: string, value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const [expires, signature] = value.split('.');
  const until = Number(expires);

  if (!signature || !Number.isFinite(until) || until < Date.now()) {
    return false;
  }

  const expected = Buffer.from(sign(token, stored, until));
  const given = Buffer.from(signature);

  return expected.length === given.length && timingSafeEqual(expected, given);
}
