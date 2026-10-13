import type { Person } from './admin.js';

/*
 * Accounts, mirrored into Brevo for the onboarding emails.
 *
 * Brevo sends the emails and decides which one from contact attributes; this file keeps those
 * attributes current and puts each account into the one list that starts its flow. It runs from
 * the cron every ten minutes (`GET /api/cron/brevo`) and from the admin page's "Sync to Brevo now".
 *
 * What goes to Brevo is what the privacy page says goes: the address and name, the day of sign-up,
 * and counts — documents, shares, opens, connected apps, last use. Never a document or its name.
 * Only confirmed addresses go; an address nobody proved may be somebody else's.
 *
 * Stateless on our side. Which accounts Brevo already has, and which flow each one is in, is read
 * back from Brevo at the start of every run, so there is no table here to keep in step with it.
 *
 * Enrolment — putting an account into a flow's list, which is what sends it email — happens only
 * when BREVO_ENROLL_SINCE is set. Accounts made after that moment get the welcome flow; accounts
 * made before it get the flow for what they have done so far. Without the variable the contacts
 * are kept in step and nobody is sent anything.
 */

const API = 'https://api.brevo.com/v3';
const TIMEOUT_MS = 20000;

/** The lists the setup script made, by name. Renaming one in Brevo breaks this on purpose. */
export const LISTS = {
  all: 'TP · All',
  onboarding: 'TP · Onboarding',
  active: 'TP · Existing, active',
  idle: 'TP · Existing, not started',
  exclude: 'TP · Exclude',
} as const;

type ListKey = keyof typeof LISTS;

/** The three lists that start a flow. A contact in any of them has been enrolled. */
const FLOWS: ListKey[] = ['onboarding', 'active', 'idle'];

export const brevoEnabled = () => Boolean(process.env.BREVO_API_KEY);

async function brevo<T = Record<string, unknown>>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; data: T }> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      'api-key': process.env.BREVO_API_KEY ?? '',
      accept: 'application/json',
      'content-type': 'application/json',
      // Brevo sits behind Cloudflare, which refuses a request with no recognisable client.
      'user-agent': 'transformpipe-server/1.0',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  let data = {} as T;

  try {
    data = (text ? JSON.parse(text) : {}) as T;
  } catch {
    data = { message: text } as T;
  }

  return { status: response.status, data };
}

async function listIds(): Promise<Record<ListKey, number>> {
  const { data } = await brevo<{ lists?: Array<{ id: number; name: string }> }>(
    'GET',
    '/contacts/lists?limit=50'
  );
  const found = {} as Record<ListKey, number>;

  for (const key of Object.keys(LISTS) as ListKey[]) {
    const list = data.lists?.find((one) => one.name === LISTS[key]);

    if (!list) {
      throw new Error(`Brevo has no list called "${LISTS[key]}" — run brevo_setup.py`);
    }

    found[key] = list.id;
  }

  return found;
}

interface BrevoContact {
  email: string;
  listIds: number[];
  attributes?: Record<string, unknown>;
}

/** Every contact in the TP · All list: the accounts this file has mirrored before. */
async function mirrored(all: number): Promise<BrevoContact[]> {
  const out: BrevoContact[] = [];

  for (let offset = 0; ; offset += 500) {
    const { data } = await brevo<{ contacts?: BrevoContact[] }>(
      'GET',
      `/contacts/lists/${all}/contacts?limit=500&offset=${offset}`
    );
    const page = data.contacts ?? [];

    out.push(...page);

    if (page.length < 500) {
      return out;
    }
  }
}

const day = (time: number | null) => (time === null ? undefined : new Date(time).toISOString().slice(0, 10));

/** A first name, only when it is not just what comes before the @ — the rule `sendWelcome` had. */
function firstName(person: Person): string {
  const local = person.email.split('@')[0]?.toLowerCase() ?? '';
  const first = person.name.trim().split(/\s+/)[0] ?? '';

  return first && first.toLowerCase() !== local ? first : '';
}

/** Whether what Brevo holds already says this. Empty and absent are the same to it. */
function sameAttributes(held: Record<string, unknown>, wanted: Record<string, unknown>): boolean {
  const norm = (value: unknown) =>
    value === undefined || value === null || value === '' ? '' : String(value).slice(0, 10);

  return Object.entries(wanted).every(([key, value]) => norm(held[key]) === norm(value));
}

export function attributesOf(person: Person): Record<string, string | number | boolean | undefined> {
  const active = (label: string) => person.apps.some((app) => app.label === label && app.active);
  const assistants = ['claude', 'chatgpt', 'cursor', 'vscode', 'windsurf', 'gemini', 'other'];

  return {
    FIRSTNAME: firstName(person),
    TP_USER_ID: person.id,
    SIGNUP_AT: day(person.created),
    DOOR: person.door,
    VERIFIED: person.verified,
    DOCS: person.documents,
    SHARES: person.sharedLink + person.sharedPeople,
    SHARE_VIEWS: person.shareViews,
    APPS: person.apps.filter((app) => app.active).length,
    HAS_ASSISTANT: assistants.some(active),
    HAS_OBSIDIAN: active('obsidian'),
    HAS_EXTENSION: active('extension'),
    HAS_API: person.activeKeys > 0,
    LAST_ACTIVE: day(person.lastActive),
  };
}

/** Which flow an account starts, when it is enrolled. */
export function flowOf(person: Person, since: number): ListKey {
  if (person.created >= since) {
    return 'onboarding';
  }

  return person.documents > 0 || person.apps.length > 0 || person.keys > 0 ? 'active' : 'idle';
}

export interface SyncResult {
  updated: number;
  enrolled: Record<string, number>;
  removed: number;
  skipped: number;
  enrolling: boolean;
}

export async function syncToBrevo(people: Person[], admins: Set<string>): Promise<SyncResult> {
  const ids = await listIds();
  const existing = await mirrored(ids.all);
  const byEmail = new Map(existing.map((one) => [one.email.toLowerCase(), one]));
  const sinceRaw = process.env.BREVO_ENROLL_SINCE;
  const since = sinceRaw ? Date.parse(sinceRaw) : NaN;
  const enrolling = Number.isFinite(since);
  const flowIds = new Set(FLOWS.map((key) => ids[key]));
  const result: SyncResult = { updated: 0, enrolled: {}, removed: 0, skipped: 0, enrolling };
  const keep = new Set<string>();

  for (const person of people) {
    const email = person.email.trim().toLowerCase();

    if (!email || !person.verified) {
      result.skipped += 1;
      continue;
    }

    keep.add(person.id);

    const known = byEmail.get(email);
    const attributes = attributesOf(person);
    const lists = known ? [] : [ids.all];

    if (admins.has(email)) {
      if (!known?.listIds.includes(ids.exclude)) lists.push(ids.exclude);
    } else if (enrolling && !known?.listIds.some((id) => flowIds.has(id))) {
      const flow = flowOf(person, since);

      lists.push(ids[flow]);
      result.enrolled[flow] = (result.enrolled[flow] ?? 0) + 1;
    }

    // Written only when something changed: most accounts, most hours, nothing did.
    if (lists.length === 0 && known && sameAttributes(known.attributes ?? {}, attributes)) {
      continue;
    }

    /*
     * One contact per request rather than Brevo's bulk import: an import is processed later, in
     * the background, and adding to a list through it is not reliably the "added to list" event a
     * flow starts on. A create-or-update with `listIds` is both, immediately.
     */
    const { status, data } = await brevo('POST', '/contacts', {
      email,
      attributes,
      ...(lists.length ? { listIds: lists } : {}),
      updateEnabled: true,
    });

    if (status >= 300) {
      throw new Error(`Brevo refused a contact (${status}): ${JSON.stringify(data).slice(0, 300)}`);
    }

    result.updated += 1;
  }

  // Accounts that are gone — deleted, or no longer confirmed — leave Brevo too.
  for (const contact of existing) {
    const owner = contact.attributes?.TP_USER_ID as string | undefined;

    if (owner && !keep.has(owner)) {
      await forgetContact(contact.email);
      result.removed += 1;
    }
  }

  return result;
}

/** Removes one address from Brevo, so a deleted account is not written to again. Never throws. */
export async function forgetContact(email: string): Promise<void> {
  if (!brevoEnabled() || !email) {
    return;
  }

  try {
    await brevo('DELETE', `/contacts/${encodeURIComponent(email)}?identifierType=email_id`);
  } catch (error) {
    console.error('brevo: could not remove a contact', error);
  }
}
