import { createHash, randomBytes } from 'node:crypto';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { setCookie } from 'hono/cookie';
import { stream } from 'hono/streaming';
import {
  buildNoticePage,
  buildPasswordPage,
  buildReportPage,
  buildSharedPage,
  buildStandaloneHtml,
} from '../shared/markdown.js';
import { attachment } from './attachment.js';
import { clientAddress, publicHost } from './address.js';
import { authProxy, currentUser, selfOrigin, type SessionUser } from './auth.js';
import { sendShareNotice, sendWelcome } from './mail.js';
import { looksLikeId, sql, type DocumentRow } from './db.js';
import { createKey, forgetKey, listKeys, revokeKey } from './keys.js';
import {
  CONVERSIONS,
  DEFAULT_CONVERSION,
} from '../shared/conversions.js';
import {
  AI_SUMMARY,
  checkQuota,
  claimWelcome,
  countCall,
  countShareMail,
  countSummaryCall,
  mayPublishPublicly,
  PUBLISH_UNVERIFIED,
  QUOTA,
  RATE,
  releaseWelcome,
  usageOf,
} from './limits.js';
import {
  hashPassword,
  passwordMatches,
  readPassword,
  UNLOCK_SECONDS,
  unlockCookie,
  unlockValue,
} from './share-password.js';
import { summarize, summarizeStream, summaryEnabled, summaryFailure } from './summarize.js';
import {
  createWebhook,
  deliver,
  listWebhooks,
  revealWebhookSecret,
  revokeWebhook,
} from './webhooks.js';
import mcp from './mcp.js';
import oauth from './oauth.js';
import { authorizationServer, protectedResource } from './wellknown.js';
import { revisionFiles } from './revisions.js';
import { deleteSources, putSource, readSource } from './source.js';
import {
  edgeSeconds,
  normaliseEmail,
  readExpiry,
  namedOpens,
  recentViews,
  shareGate,
  VIEW_LIST_LIMIT,
  writtenUtc,
} from './share-gate.js';
import { tallyRoute } from './usage.js';
import v1 from './v1.js';

type Env = { Variables: { user: SessionUser } };

/*
 * Two roots: the API, and the share links people paste around. A shared page is rendered here
 * rather than in the browser so it can be cached at the edge — see `GET /s/:token`.
 */
const app = new Hono<Env>();

/* A kind arrives from a browser, so it is checked against the list rather than trusted. */
const KINDS = new Set<string>(CONVERSIONS.map((one) => one.id));

const api = new Hono<Env>().basePath('/api');

api.get('/health', (c) => c.json({ ok: true }));

interface ShareRow {
  id: string;
  share_mode: 'private' | 'link' | 'people';
  share_token: string | null;
  share_expires_at: string | null;
  share_views: number;
  share_viewed_at: string | null;
  share_password_hash: string | null;
}

/**
 * A shared document, if this caller may have it — the app's reader behind /open/<token>, and the
 * "Save a copy" that reads through it. The rules are `shareGate`'s, the same ones the page at
 * /s/<token> asks, so a link that has ended ends here too.
 */
api.get('/shared/:token', async (c) => {
  const verdict = await shareGate(c, c.req.param('token'));

  if (!verdict.ok) {
    switch (verdict.why) {
      case 'missing':
        return c.json({ error: 'Not found' }, 404);
      case 'expired':
        return c.json({ error: 'This link has expired' }, 410);
      case 'sign-in':
        return c.json({ error: 'Sign in to open this document' }, 401);
      case 'not-yours':
        return c.json({ error: 'This document was not shared with you' }, 403);
      case 'password':
        // The app has no form for it; the link does, and entering it there opens this too.
        return c.json(
          { error: 'This link has a password. Open the link itself and enter it there.', password: true },
          401,
          { 'cache-control': 'private, no-store' }
        );
    }
  }

  const { document } = verdict;

  return c.json({
    document: {
      name: document.name,
      markdown: await readSource(document),
      created_at: document.created_at,
    },
    /* Addressed to this reader by name, so the owner sees their opens — and the page says so. */
    watched: verdict.reader !== null && !verdict.reader.isOwner,
  });
});

// Sign-in, sign-out and the session read all live at the auth service; this app only forwards
// them so its cookie is first-party. See server/auth.ts.
api.all('/auth/*', authProxy);

/** Everything below needs a session. */
const requireUser = createMiddleware<Env>(async (c, next) => {
  const user = await currentUser(c);

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  c.set('user', user);

  return next();
});

/**
 * The counter /api/v1 already uses, on the app's own endpoints.
 *
 * They were left out of it on the grounds that only our own pages call them. That is true of the
 * pages and false of the endpoints: a session cookie is a credential like any other, and these
 * routes write to the database, send mail and make outbound requests.
 *
 * Counted by account where there is one, so one runaway script cannot spend somebody else's
 * allowance — which means this has to run after `requireUser`, and does, because `api.use` applies
 * middleware in the order it was registered. The address is the fallback for the routes that
 * answer before a session is established.
 *
 * A counter that cannot be reached must not lock the app out: a failure counts as room to spare.
 */
const throttle = createMiddleware<Env>(async (c, next) => {
  const user = c.get('user') as SessionUser | undefined;
  const from = user?.id ?? clientAddress(c);
  const verdict = await countCall(`app:${from}`).catch(() => ({
    ok: true,
    retryAfter: 60,
  }));

  if (!verdict.ok) {
    c.header('retry-after', String(verdict.retryAfter));

    return c.json(
      { error: `Too many requests — the limit is ${RATE.perMinute} a minute.` },
      429
    );
  }

  return next();
});

/*
 * Where the Content-Security-Policy in report-only mode sends what it would have blocked.
 *
 * The policy on the app ships as `Content-Security-Policy-Report-Only` first, because the app
 * loads Google Tag Manager and a container can be made to load almost anything — turning the
 * policy on blind would break the site in a way nobody sees until a page is white. Reports land
 * here, in the platform's log, and when a week of them says nothing new the header changes name.
 *
 * Unauthenticated, because a violation happens to whoever is reading the page, and counted by
 * address for the same reason the report form is: a POST anybody can make is a POST somebody will
 * make in a loop. Nothing is stored — a log line is enough to answer the only question being asked.
 */
api.post('/csp-report', async (c) => {
  if (!(await countCall(`csp:${clientAddress(c)}`).catch(() => ({ ok: true }))).ok) {
    return c.body(null, 204);
  }

  const report = (await c.req.text().catch(() => '')).slice(0, 2000);

  if (report) {
    console.warn('csp report: %s', report);
  }

  return c.body(null, 204);
});

/*
 * The first-party counter — see server/usage.ts. Unauthenticated for the reason the CSP report is:
 * it counts whoever is reading the page, signed in or not, and it never looks at the session. It is
 * not behind `throttle` either, because that counter keys on the address and writes it down.
 */
api.post('/tally', tallyRoute);

/*
 * Key management is session-only, deliberately: a leaked key must not be able to mint its
 * replacement or revoke the owner's other keys.
 */
api.use('/keys', requireUser);
api.use('/keys/*', requireUser);
api.use('/keys', throttle);
api.use('/keys/*', throttle);

api.get('/keys', async (c) => c.json({ keys: await listKeys(c.get('user').id) }));

api.post('/keys', async (c) => {
  const body = await c.req
    .json<{ name?: string }>()
    .catch(() => ({}) as { name?: string });
  const name = (body.name ?? '').trim();

  if (!name) {
    return c.json({ error: 'Give the key a name you will recognise' }, 400);
  }

  const created = await createKey(c.get('user').id, name);

  // The only time the key itself is ever returned.
  return c.json({ key: created.key, created: created.row }, 201);
});

/*
 * `?forget=1` deletes the row rather than revoking the key. It only works on a key that is already
 * revoked, so the sequence is always stop-it-working, then tidy up — never the other way round.
 */
api.delete('/keys/:id', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');

  if (c.req.query('forget') === '1') {
    const forgotten = await forgetKey(userId, id);

    return forgotten
      ? c.json({ ok: true })
      : c.json({ error: 'Revoke the key before removing it' }, 409);
  }

  const revoked = await revokeKey(userId, id);

  return revoked ? c.json({ ok: true }) : c.json({ error: 'Not found' }, 404);
});

/*
 * Webhooks, session-only for the same reason keys are: see the note on `m2h_webhook` in
 * db/schema.sql on why this stays out of the scriptable public API.
 */
api.use('/webhooks', requireUser);
api.use('/webhooks/*', requireUser);
api.use('/webhooks', throttle);
api.use('/webhooks/*', throttle);

api.get('/webhooks', async (c) =>
  c.json({ webhooks: await listWebhooks(c.get('user').id) })
);

api.post('/webhooks', async (c) => {
  const body = await c.req
    .json<{ url?: string }>()
    .catch(() => ({}) as { url?: string });
  const url = (body.url ?? '').trim();
  let target: URL;

  try {
    target = new URL(url);
  } catch {
    return c.json({ error: 'url must be an https:// address' }, 400);
  }

  if (target.protocol !== 'https:') {
    return c.json({ error: 'url must be an https:// address' }, 400);
  }

  /*
   * Where the name actually points, refused if that is inside.
   *
   * A webhook is a URL a person gives us and this server then posts to, which is a server-side
   * request forgery unless somebody checks the address — the same check `cimd.ts` makes before
   * fetching a client's metadata document, and now out of the same module. Checked again at
   * delivery in `webhooks.ts`, because DNS is free to answer differently an hour later.
   */
  if (!(await publicHost(target.hostname))) {
    return c.json(
      {
        error:
          'That address is not a public one. A webhook has to point somewhere reachable from the internet.',
      },
      400
    );
  }

  const created = await createWebhook(c.get('user').id, url);

  // The only time the secret is ever returned as a matter of course — see revealWebhookSecret
  // for the deliberate exception, which needs an explicit ask rather than showing up in a list.
  return c.json({ secret: created.secret, webhook: created.row }, 201);
});

api.post('/webhooks/:id/reveal', async (c) => {
  const secret = await revealWebhookSecret(c.get('user').id, c.req.param('id'));

  return secret ? c.json({ secret }) : c.json({ error: 'Not found' }, 404);
});

api.delete('/webhooks/:id', async (c) => {
  const revoked = await revokeWebhook(c.get('user').id, c.req.param('id'));

  return revoked ? c.json({ ok: true }) : c.json({ error: 'Not found' }, 404);
});

/*
 * What the account is using, for the line under the history. It lives here rather than being read
 * from /api/v1 so the app's own screens do not spend the public API's rate budget — the panel
 * re-asks whenever the list changes.
 */
api.use('/usage', requireUser);
api.get('/usage', async (c) => c.json(await usageOf(c.get('user').id)));

api.use('/documents', requireUser);
api.use('/documents/*', requireUser);
api.use('/shared-with-me', requireUser);
api.use('/documents', throttle);
api.use('/documents/*', throttle);
api.use('/shared-with-me', throttle);

/**
 * Documents other people shared with this address.
 *
 * Only 'people' shares appear: a link share is addressed to whoever holds the link, not to anyone
 * in particular, so it has no business showing up in someone's list. The content is not returned
 * here — the row carries the token and reads it through /shared/:token, which is the one place
 * access is decided.
 */
api.get('/shared-with-me', async (c) => {
  const user = c.get('user');

  const rows = (await sql()`
    select d.id,
           d.name,
           d.size,
           d.stats,
           d.created_at,
           d.share_token,
           coalesce(u.email, '') as owner_email,
           s.created_at as shared_at
    from m2h_document_share s
    join m2h_document d on d.id = s.document_id
    left join neon_auth."user" u on u.id = d.user_id
    where s.email = ${normaliseEmail(user.email)}
      and d.share_mode = 'people'
      and d.user_id <> ${user.id}
      -- A link that has ended is not something anybody shares with you any more.
      and (d.share_expires_at is null or d.share_expires_at > now())
    order by s.created_at desc
    limit ${QUOTA.documents}
  `) as Array<DocumentRow & { share_token: string; owner_email: string }>;

  return c.json({ documents: rows });
});

/** `?q=` searches content, not just the name — see the note on the same parameter in v1.ts. */
api.get('/documents', async (c) => {
  const q = c.req.query('q')?.trim();
  const userId = c.get('user').id;

  const rows = (
    q
      ? ((await sql()`
          select id, name, kind, size, stats, created_at, summary_created_at, replaces
          from m2h_document
          where user_id = ${userId}
            and search @@ websearch_to_tsquery('simple', ${q})
          order by ts_rank(search, websearch_to_tsquery('simple', ${q})) desc, created_at desc
          limit ${QUOTA.documents}
        `) as DocumentRow[])
      : ((await sql()`
          select id, name, kind, size, stats, created_at, summary_created_at, replaces
          from m2h_document
          where user_id = ${userId}
          order by created_at desc
          limit ${QUOTA.documents}
        `) as DocumentRow[])
  );

  return c.json({ documents: rows });
});

api.post('/documents', async (c) => {
  const userId = c.get('user').id;

  /*
   * Say hello, once, the first time somebody keeps something.
   *
   * Not on sign-in: Neon Auth owns registration and tells this application nothing about it, so
   * there is no moment of creation to hook. Not on the session check either — that fires on every
   * page load, and a write on it would be a write on every page load. Saving a document is the
   * first thing an account is actually for, and `claimWelcome` hands the job to exactly one
   * request — putting it back if the send fails, so a bad minute at the mail provider costs a
   * retry rather than the only greeting that account will ever get.
   *
   * Awaited — a send started after the response may never leave a serverless function (see
   * mail.ts) — but only logged on failure: a welcome that did not send is not a reason to fail a
   * save that already happened. It costs the first save of an account a few hundred milliseconds,
   * once.
   */
  {
    const email = c.get('user').email;

    if (email && (await claimWelcome(userId))) {
      const sent = await sendWelcome({
        to: email,
        name: c.get('user').name ?? null,
        origin: selfOrigin(c),
      });

      if (!sent.ok) {
        console.error(`welcome to ${email} not sent: ${sent.reason}`);
        /* Hand the claim back: an account that was not greeted is still owed one. */
        await releaseWelcome(userId);
      }
    }
  }

  type CreateBody = {
    name?: string;
    kind?: string;
    size?: number;
    markdown?: string;
    stats?: Record<string, number>;
    /** Opt-in version linking — see the note on the same field in v1.ts. */
    replaces?: string;
  };

  const body = await c.req.json<CreateBody>().catch(() => ({}) as CreateBody);

  /*
   * The same shape the API insists on, on the endpoint the app's own pages call.
   *
   * `!body.name` passed anything truthy, of any type, of any length — a number, an object, a
   * novel — because the check was about presence and the column is about text. And an id that is
   * not an id reached a uuid column, where the driver turns it into a 500: the request was wrong,
   * and only one of those two numbers says so.
   */
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';

  if (!name || typeof body.markdown !== 'string') {
    return c.json({ error: 'name and markdown are required' }, 400);
  }

  if (body.replaces !== undefined && !looksLikeId(String(body.replaces))) {
    return c.json({ error: 'replaces must be a document id' }, 400);
  }

  if (body.replaces) {
    const previous = (await sql()`
      select id from m2h_document where id = ${body.replaces} and user_id = ${userId}
    `) as Array<{ id: string }>;

    if (previous.length === 0) {
      return c.json({ error: 'The document named in `replaces` is not on this account' }, 404);
    }
  }

  const size = new TextEncoder().encode(body.markdown).length;
  const room = await checkQuota(userId, size);

  if (!room.ok) {
    return c.json({ error: room.error, usage: room.usage }, room.status);
  }

  /*
   * The row is created first, empty of text, because a source's path is derived from its id. If
   * the upload then fails the row is removed again: a document that cannot be opened would be
   * worse than no document at all.
   */
  const rows = (await sql()`
    insert into m2h_document (user_id, name, kind, size, markdown, stats, search, replaces)
    values (
      ${userId},
      ${name},
      ${KINDS.has(body.kind ?? '') ? body.kind : DEFAULT_CONVERSION},
      ${body.size ?? body.markdown.length},
      null,
      ${JSON.stringify(body.stats ?? {})}::jsonb,
      to_tsvector('simple', ${body.markdown}),
      ${body.replaces ?? null}
    )
    returning id, name, kind, size, stats, created_at
  `) as DocumentRow[];

  try {
    const stored = await putSource(userId, rows[0].id, body.markdown);

    await sql()`
      update m2h_document
      set blob_path = ${stored.blobPath}, markdown = ${stored.markdown}
      where id = ${rows[0].id}
    `;
  } catch (cause) {
    await sql()`delete from m2h_document where id = ${rows[0].id}`;

    const why = cause instanceof Error ? cause.message : 'upload failed';

    return c.json({ error: `Could not store the document: ${why}` }, 502);
  }

  // Awaited, like every other webhook delivery here: see the note at the top of webhooks.ts on
  // why a send started after the response may never leave a serverless function.
  await deliver(userId, 'document.created', {
    id: rows[0].id,
    name: rows[0].name,
    kind: rows[0].kind,
    size: rows[0].size,
  });

  return c.json({ document: rows[0] }, 201);
});

api.get('/documents/:id', async (c) => {
  const rows = (await sql()`
    select id, name, kind, size, stats, created_at, markdown, blob_path,
           summary, summary_created_at
    from m2h_document
    where user_id = ${c.get('user').id} and id = ${c.req.param('id')}
  `) as Array<DocumentRow & { blob_path: string | null }>;

  if (rows.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  const { blob_path: _stored, ...document } = rows[0];

  return c.json({
    document: {
      ...document,
      markdown: await readSource({ ...rows[0], user_id: c.get('user').id }),
    },
  });
});

/** A .docx of a document — the app's own "Download as Word" button. */
api.get('/documents/:id/docx', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');

  const rows = (await sql()`
    select name, markdown, blob_path from m2h_document
    where user_id = ${userId} and id = ${id}
  `) as Array<{ name: string; markdown: string | null; blob_path: string | null }>;

  const row = rows[0];

  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  const markdown = await readSource({ ...row, user_id: userId });

  if (markdown === null) {
    return c.json({ error: 'The source of this document is missing' }, 410);
  }

  const { markdownToDocx } = await import('./docx.js');
  const fileName = `${row.name.replace(/\.[^.]+$/, '')}.docx`;

  let docx: Buffer;

  try {
    docx = await markdownToDocx(markdown, row.name);
  } catch (cause) {
    const why = cause instanceof Error ? cause.message : 'the converter failed';

    return c.json({ error: `Could not build a .docx: ${why}` }, 502);
  }

  c.header(
    'content-type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  c.header('content-disposition', attachment(fileName));

  return c.body(new Uint8Array(docx));
});

/** A .pdf of a document, built the same way as the public `GET /api/v1/documents/:id.pdf`. */
api.get('/documents/:id/pdf', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');

  const rows = (await sql()`
    select name, markdown, blob_path from m2h_document
    where user_id = ${userId} and id = ${id}
  `) as Array<{ name: string; markdown: string | null; blob_path: string | null }>;

  const row = rows[0];

  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  const markdown = await readSource({ ...row, user_id: userId });

  if (markdown === null) {
    return c.json({ error: 'The source of this document is missing' }, 410);
  }

  const { markdownToPdf } = await import('./pdf.js');
  const fileName = `${row.name.replace(/\.[^.]+$/, '')}.pdf`;

  let pdf: Buffer;

  try {
    pdf = await markdownToPdf(markdown, row.name);
  } catch (cause) {
    const why = cause instanceof Error ? cause.message : 'the converter failed';

    return c.json({ error: `Could not build a .pdf: ${why}` }, 502);
  }

  c.header('content-type', 'application/pdf');
  c.header('content-disposition', attachment(fileName));

  return c.body(new Uint8Array(pdf));
});

/**
 * What a streamed summary ends with when the model stopped part-way, followed by why. A character
 * no summary contains, so the reader can tell a broken answer from a short one.
 */
const STREAM_BROKE = '\u0000';

/**
 * Summarises a document for the app's own Summary tab — same behaviour as the public
 * `POST /api/v1/documents/:id/summary`, kept in step so a script and the app never disagree about
 * what a document's summary is.
 */
api.post('/documents/:id/summary', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');

  const rows = (await sql()`
    select id, name, summary, summary_created_at, markdown, blob_path
    from m2h_document
    where user_id = ${userId} and id = ${id}
  `) as Array<{
    id: string;
    name: string;
    summary: string | null;
    summary_created_at: string | null;
    markdown: string | null;
    blob_path: string | null;
  }>;

  const row = rows[0];

  if (!row) {
    return c.json({ error: 'Not found' }, 404);
  }

  if (row.summary && c.req.query('force') === undefined) {
    return c.json({ summary: row.summary, summarized_at: row.summary_created_at });
  }

  if (!summaryEnabled()) {
    return c.json({ error: 'This deployment has no Google AI key configured.' }, 503);
  }

  const verdict = await countSummaryCall(`session:${userId}`);

  if (!verdict.ok) {
    return c.json(
      {
        error: `Summaries are limited to ${AI_SUMMARY.perDay} a day per account. Try again tomorrow.`,
      },
      429
    );
  }

  let markdown: string | null;

  try {
    markdown = await readSource({ ...row, user_id: userId });
  } catch (cause) {
    const why = cause instanceof Error ? cause.message : 'unknown';

    return c.json({ error: `Could not read the document's source: ${why}` }, 502);
  }

  if (markdown === null) {
    return c.json({ error: 'The source of this document is missing' }, 410);
  }

  /*
   * `?stream=1`: the text as the model writes it, which is what the app's tab asks for. The first
   * piece is awaited before the answer starts, so a model that fails outright is still a JSON error
   * with a status; one that fails part-way can no longer change the status, so it ends the text
   * with STREAM_BROKE and the reason, and nothing half-written is kept.
   */
  if (c.req.query('stream') !== undefined) {
    const pieces = summarizeStream(markdown)[Symbol.asyncIterator]();
    let first: IteratorResult<string>;

    try {
      first = await pieces.next();
    } catch (cause) {
      return c.json({ error: summaryFailure(cause) }, 502);
    }

    if (first.done) {
      return c.json({ error: 'Could not summarise this document: the model returned nothing' }, 502);
    }

    c.header('content-type', 'text/plain; charset=utf-8');
    c.header('cache-control', 'no-store');
    // Some proxies hold a response until it ends; this asks them not to.
    c.header('x-accel-buffering', 'no');

    return stream(c, async (out) => {
      let text = first.value;

      await out.write(first.value);

      try {
        for (;;) {
          const next = await pieces.next();

          if (next.done) {
            break;
          }

          text += next.value;
          await out.write(next.value);
        }
      } catch (cause) {
        await out.write(`${STREAM_BROKE}${summaryFailure(cause)}`);

        return;
      }

      const written = text.trim();

      // Kept before the answer closes, so the function is still alive to keep it.
      if (written) {
        await sql()`
          update m2h_document
          set summary = ${written}, summary_created_at = ${new Date().toISOString()}
          where id = ${id}
        `;
      }
    });
  }

  let summary: string;

  try {
    summary = await summarize(markdown);
  } catch (cause) {
    return c.json({ error: summaryFailure(cause) }, 502);
  }

  const summarizedAt = new Date().toISOString();

  await sql()`
    update m2h_document
    set summary = ${summary}, summary_created_at = ${summarizedAt}
    where id = ${id}
  `;

  return c.json({ summary, summarized_at: summarizedAt });
});

interface VersionRow {
  id: string;
  name: string;
  created_at: string;
  replaces: string | null;
}

/**
 * Every document in the same chain as `id` — see the identical helper in v1.ts, which this
 * mirrors rather than imports: the two document endpoints are kept independent on purpose, and a
 * chain is a handful of rows, not a query worth sharing across a module boundary for.
 */
async function versionChain(userId: string, id: string): Promise<VersionRow[]> {
  const seen = new Set<string>();
  const queue = [id];
  const chain: VersionRow[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (seen.has(current)) {
      continue;
    }

    seen.add(current);

    const found = (await sql()`
      select id, name, created_at, replaces
      from m2h_document
      where user_id = ${userId} and id = ${current}
    `) as VersionRow[];

    if (found.length === 0) {
      continue;
    }

    chain.push(found[0]);

    if (found[0].replaces) {
      queue.push(found[0].replaces);
    }

    const children = (await sql()`
      select id, name, created_at, replaces
      from m2h_document
      where user_id = ${userId} and replaces = ${current}
    `) as VersionRow[];

    for (const child of children) {
      queue.push(child.id);
    }
  }

  return chain.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

api.get('/documents/:id/versions', async (c) => {
  const chain = await versionChain(c.get('user').id, c.req.param('id'));

  if (chain.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ versions: chain });
});

/** The document's sharing state, as the dialog needs it. */
async function shareState(userId: string, documentId: string) {
  const rows = (await sql()`
    select id, share_mode, share_token, share_expires_at, share_views, share_viewed_at,
           share_password_hash
    from m2h_document
    where user_id = ${userId} and id = ${documentId}
  `) as ShareRow[];

  if (rows.length === 0) {
    return null;
  }

  const emails = (await sql()`
    select email from m2h_document_share
    where document_id = ${documentId}
    order by created_at
  `) as Array<{ email: string }>;

  return {
    mode: rows[0].share_mode,
    token: rows[0].share_token,
    emails: emails.map((row) => row.email),
    /* An expired link is still reported, so the dialog can say it ended and offer a new date. */
    expiresAt: rows[0].share_expires_at
      ? new Date(rows[0].share_expires_at).toISOString()
      : null,
    /* Opens of the link as it stands — a revoke starts the next one at nought. */
    views: rows[0].share_views ?? 0,
    lastViewedAt: rows[0].share_viewed_at
      ? new Date(rows[0].share_viewed_at).toISOString()
      : null,
    /* Whether there is one — never the hash, and never the password, which nobody can read back. */
    hasPassword: Boolean(rows[0].share_password_hash),
  };
}

/** Mints the token the first time a document is shared; later modes reuse it. */
async function ensureToken(userId: string, documentId: string) {
  const rows = (await sql()`
    update m2h_document
    set share_token = coalesce(share_token, ${randomBytes(16).toString('base64url')})
    where user_id = ${userId} and id = ${documentId}
    returning share_token
  `) as Array<{ share_token: string }>;

  return rows[0]?.share_token ?? null;
}

api.get('/documents/:id/share', async (c) => {
  const state = await shareState(c.get('user').id, c.req.param('id'));

  return state ? c.json(state) : c.json({ error: 'Not found' }, 404);
});

/** Every recent open of this document's link, for its Views tab. The owner's session only. */
api.get('/documents/:id/views', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');

  if (!looksLikeId(id)) {
    return c.json({ error: 'Not found' }, 404);
  }

  const rows = (await sql()`
    select id, share_mode, share_views, share_viewed_at from m2h_document
    where user_id = ${userId} and id = ${id}
  `) as Array<{
    id: string;
    share_mode: 'private' | 'link' | 'people';
    share_views: number;
    share_viewed_at: string | null;
  }>;

  if (rows.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({
    mode: rows[0].share_mode,
    views: rows[0].share_views ?? 0,
    lastViewedAt: rows[0].share_viewed_at ? new Date(rows[0].share_viewed_at).toISOString() : null,
    events: await recentViews(id),
    limit: VIEW_LIST_LIMIT,
    /* Each named address and its opens; empty for a link, which records no reader. */
    people: rows[0].share_mode === 'people' ? await namedOpens(id) : [],
    /* So the tab can call the owner's own opens "you" rather than print their address. */
    you: normaliseEmail(c.get('user').email),
  });
});

api.put('/documents/:id/share', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');
  type ShareBody = { mode?: 'private' | 'link' | 'people'; expiresAt?: unknown; password?: unknown };

  const body = await c.req.json<ShareBody>().catch(() => ({}) as ShareBody);

  if (!body.mode || !['private', 'link', 'people'].includes(body.mode)) {
    return c.json({ error: 'mode must be private, link or people' }, 400);
  }

  /* Absent leaves the expiry as it is, null clears it — see readExpiry. */
  const expiry = readExpiry(body.expiresAt);

  if (!expiry.ok) {
    return c.json({ error: expiry.error }, 400);
  }

  /* The same for a password, which only a link takes — see readPassword. */
  const password = readPassword(body.password);

  if (!password.ok) {
    return c.json({ error: password.error }, 400);
  }

  /*
   * A link, or a document still private — set ahead, so the link it gets is protected from its first
   * second. Not a share with specific people, whose readers sign in as themselves.
   */
  if (typeof password.value === 'string' && body.mode === 'people') {
    return c.json(
      { error: 'A password protects a link. A share with specific people asks each of them to sign in instead.' },
      400
    );
  }

  /*
   * The same rule the API applies, and this is the endpoint the app's own dialog calls.
   *
   * It is internal, which was the reason it was never given the check — and the reason is wrong:
   * internal describes who we expect to call it, not who can. See mayPublishPublicly.
   */
  if (body.mode === 'link' && !(await mayPublishPublicly(userId))) {
    return c.json({ error: PUBLISH_UNVERIFIED }, 403);
  }

  if (body.mode === 'private') {
    /*
     * Revoking drops the token as well: a link that was sent must stop working. The expiry and the
     * count go with it, because they belong to that link — the next one starts with neither.
     */
    const revoked = (await sql()`
      update m2h_document
      set share_mode = 'private', share_token = null,
          share_expires_at = null, share_views = 0, share_viewed_at = null,
          share_password_hash = case
            when ${password.value !== undefined} then ${
              typeof password.value === 'string' ? await hashPassword(password.value) : null
            }
            else share_password_hash
          end
      where user_id = ${userId} and id = ${id}
      returning id
    `) as Array<{ id: string }>;

    if (revoked.length > 0) {
      await sql()`delete from m2h_share_view where document_id = ${id}`;
    }
  } else {
    if (!(await ensureToken(userId, id))) {
      return c.json({ error: 'Not found' }, 404);
    }

    await sql()`
      update m2h_document
      set share_mode = ${body.mode},
          share_expires_at = case
            when ${expiry.value !== undefined} then ${expiry.value?.toISOString() ?? null}::timestamptz
            else share_expires_at
          end,
          share_password_hash = case
            when ${password.value !== undefined} then ${
              typeof password.value === 'string' ? await hashPassword(password.value) : null
            }
            else share_password_hash
          end
      where user_id = ${userId} and id = ${id}
    `;
  }

  const state = await shareState(userId, id);

  return state ? c.json(state) : c.json({ error: 'Not found' }, 404);
});

api.post('/documents/:id/share/people', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');
  const body = await c.req
    .json<{ email?: string }>()
    .catch(() => ({}) as { email?: string });
  const email = normaliseEmail(body.email);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return c.json({ error: 'That does not look like an email address' }, 400);
  }

  if (!(await ensureToken(userId, id))) {
    return c.json({ error: 'Not found' }, 404);
  }

  /* `returning` is empty when the address was already on the list, which is the signal not to mail. */
  const rows = (await sql()`
    insert into m2h_document_share (document_id, email)
    values (${id}, ${email})
    on conflict do nothing
    returning email
  `) as Array<{ email: string }>;

  const inserted = rows.length === 1;

  await sql()`
    update m2h_document
    set share_mode = 'people'
    where user_id = ${userId} and id = ${id} and share_mode <> 'link'
  `;

  const state = await shareState(userId, id);

  /*
   * Tell the person their name was just put on a document.
   *
   * This endpoint, not the one that sets the mode: adding an address is a deliberate act with one
   * address in it, so there is nothing to diff and nobody to accidentally write to twice. The
   * `on conflict do nothing` above means a repeat of the same address is a no-op in the table, and
   * `inserted` below is how this knows it was a no-op in the mailbox too.
   *
   * Failures are logged and reported in `notified`, never as an error: the share is already written
   * and the access exists whether or not the email got through.
   */
  let notified = false;

  /*
   * The send is rationed; the share is not.
   *
   * An account that has written to fifty addresses today has stopped sharing documents and started
   * mailing people — see SHARE_MAIL. What that costs is the sending domain, which every account
   * needs in order to sign in at all, so it is worth a limit well above ordinary use. The address
   * is still added and the access still exists: only `notified` comes back false.
   */
  if (state?.mode === 'people' && state.token && inserted) {
    const owner = c.get('user').email;
    const document = (await sql()`
      select name from m2h_document where id = ${id} and user_id = ${userId}
    `) as Array<{ name: string }>;

    if ((await countShareMail(userId).catch(() => ({ ok: true }))).ok) {
      /*
       * Awaited, not fired off. See the note at the top of mail.ts: a send started after the
       * response may never leave a serverless function. The mailer caps the wait itself.
       */
      const sent = await sendShareNotice({
        to: email,
        from: owner ?? 'Somebody',
        documentName: document[0]?.name ?? 'a document',
        url: `${selfOrigin(c)}/s/${state.token}`,
        expiresAt: state.expiresAt,
      });

      notified = sent.ok;

      if (!sent.ok) {
        console.error(`share notice to ${email} not sent: ${sent.reason}`);
      }
    } else {
      console.error(`share notice to ${email} not sent: past today's mail limit`);
    }

    await deliver(userId, 'document.shared', {
      id,
      name: document[0]?.name ?? 'a document',
      mode: state.mode,
      url: `${selfOrigin(c)}/s/${state.token}`,
      notified: notified ? [email] : [],
    });
  }

  /*
   * Say whether a notice actually went out, so this is observable from outside.
   *
   * Three silent failures in a row looked identical from the dialog — the notice wired to the API
   * endpoint the dialog does not call, then a send fired after the response that the platform froze
   * before it left, and a deployment with no mail key would look the same — and in every case the
   * only symptom was an email that never arrived. `notified` is now the mailer's own answer, not a
   * guess from the environment.
   */
  return state
    ? c.json({ ...state, notified })
    : c.json({ error: 'Not found' }, 404);
});

api.delete('/documents/:id/share/people', async (c) => {
  const userId = c.get('user').id;
  const id = c.req.param('id');
  const email = normaliseEmail(c.req.query('email'));

  await sql()`
    delete from m2h_document_share
    where document_id = ${id}
      and email = ${email}
      and exists (
        select 1 from m2h_document
        where id = ${id} and user_id = ${userId}
      )
  `;

  const state = await shareState(userId, id);

  return state ? c.json(state) : c.json({ error: 'Not found' }, 404);
});

api.delete('/documents/:id', async (c) => {
  const revisions = await revisionFiles(c.get('user').id, c.req.param('id'));
  const removed = (await sql()`
    delete from m2h_document
    where user_id = ${c.get('user').id} and id = ${c.req.param('id')}
    returning blob_path
  `) as Array<{ blob_path: string | null }>;

  await deleteSources([...removed.map((row) => row.blob_path), ...(removed.length ? revisions : [])]);

  return c.json({ ok: true });
});

api.delete('/documents', async (c) => {
  const revisions = await revisionFiles(c.get('user').id);
  const removed = (await sql()`
    delete from m2h_document
    where user_id = ${c.get('user').id}
    returning blob_path
  `) as Array<{ blob_path: string | null }>;

  await deleteSources([...removed.map((row) => row.blob_path), ...revisions]);

  return c.json({ ok: true });
});

/*
 * The page a share link opens.
 *
 * A link share is the same bytes for everyone, so it is built once and handed to the CDN with a
 * short s-maxage: repeat visitors never reach this function, and the database sees one read per
 * minute per document instead of one per visitor. The window is deliberately short — revoking a
 * share has to take effect in about a minute, not a day — and shorter still when the link expires
 * sooner than that. No `stale-while-revalidate`: it served the old copy for up to ten minutes after
 * the minute was up, so a revoked link kept opening. See `edgeSeconds` in server/share-gate.ts.
 *
 * An addressed share depends on who is asking, so it is never cached; a stranger is bounced to
 * the app, which knows how to ask them to sign in.
 */
/*
 * A page of somebody's content, served from our domain.
 *
 * It carries no scripts of its own, so it says so: `script-src 'none'` means an injection that
 * survived the sanitiser still cannot run, and `frame-ancestors 'none'` keeps the document out of
 * someone else's frame, where it could be dressed up as their page.
 *
 * `x-robots-tag` keeps it out of search on every answer the route gives — the page, both
 * downloads, the notices — where the meta tag covers the page alone. A header rather than
 * `Disallow: /s/` in robots.txt: a crawler told not to fetch a page never reads the noindex on it,
 * and a link posted in public can then be listed as a bare URL anyway. `nofollow` because the links
 * inside are somebody else's, and a shared page must not lend them this domain's standing.
 */
const SHARED_PAGE_HEADERS: Record<string, string> = {
  'content-security-policy': [
    "default-src 'none'",
    "script-src 'none'",
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    // 'self' for the page's own counting picture — `https:` alone refused it wherever the site is
    // served over plain http, which is every local checkout.
    "img-src 'self' https: data:",
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-robots-tag': 'noindex, nofollow, noarchive',
};

app.get('/s/:token', async (c) => {
  const token = c.req.param('token');

  for (const [header, value] of Object.entries(SHARED_PAGE_HEADERS)) {
    c.header(header, value);
  }

  /*
   * Loaded here, not at the top of the file. The renderer is the one dependency with a history of
   * refusing to load in this runtime, and when it did, it took sign-in and every document call
   * down with it — a page failing to render must never be able to do that again.
   */
  const { markdownToHtml } = await import('./render.js');

  const verdict = await shareGate(c, token);

  if (!verdict.ok && verdict.why === 'missing') {
    c.header('cache-control', 'no-store');
    c.status(404);

    return c.html(
      buildNoticePage(
        'This link does not open a document',
        'It was never shared, or the person who shared it has since revoked the link.'
      )
    );
  }

  /*
   * 410, not 404: the link was real and has ended, which is a different thing to tell a reader —
   * and the date, because "ask them for a new one" lands better when you can see it was planned.
   */
  if (!verdict.ok && verdict.why === 'expired') {
    c.header('cache-control', 'no-store');
    c.status(410);

    return c.html(
      buildNoticePage(
        'This link has expired',
        `The person who shared it set it to stop working on ${writtenUtc(
          verdict.expiredAt
        )}. Ask them for a new one.`
      )
    );
  }

  if (!verdict.ok && verdict.why === 'password') {
    c.header('cache-control', 'private, no-store');
    c.status(401);

    return c.html(buildPasswordPage(token));
  }

  if (!verdict.ok) {
    // The app owns the sign-in flow; /open/<token> is the same page, client-side.
    c.header('cache-control', 'no-store');

    return c.redirect(`/open/${encodeURIComponent(token)}`, 302);
  }

  const { document } = verdict;
  const keep = edgeSeconds(verdict.expiresAt);

  /*
   * Never kept by the CDN once it is behind a password: a cached copy of the unlocked page is the
   * document handed to anybody who asks. A public copy made before the password was set lives out
   * its minute, the same minute a revoke takes.
   */
  c.header(
    'cache-control',
    document.share_mode === 'people' || keep === 0 || verdict.locked
      ? 'private, no-store'
      : `public, max-age=0, s-maxage=${keep}`
  );

  const source = await readSource(document);

  if (source === null) {
    c.header('cache-control', 'no-store');
    c.status(404);

    return c.html(
      buildNoticePage(
        'This document is no longer available',
        'Its contents could not be found. The owner may have removed it.'
      )
    );
  }

  const createdAt = new Date(document.created_at).getTime();
  const download = c.req.query('download');
  const base = document.name.replace(/\.(md|markdown|mdown|mkd|txt)$/i, '');

  /*
   * The source itself, for somebody who wants to keep working on it rather than read it. Before the
   * HTML is rendered, because this answer does not need it. It passes the same checks the page did
   * — a private document is a 404 and a "people" one only opens for them — because it is the same
   * route, after them.
   */
  if (download === 'md') {
    c.header('content-type', 'text/markdown; charset=utf-8');
    c.header('content-disposition', attachment(`${base}.md`));

    return c.body(source);
  }

  const body = markdownToHtml(source);

  /* `?download` alone is the address every earlier shared page printed, so it stays the HTML. */
  if (download === '' || download === 'html') {
    c.header('content-disposition', attachment(`${base}.html`));

    return c.html(
      buildStandaloneHtml({ title: document.name, body, createdAt, theme: 'light' })
    );
  }

  if (download !== undefined) {
    c.header('cache-control', 'no-store');
    c.status(400);

    return c.html(
      buildNoticePage(
        'That is not a format this page downloads',
        'A shared document downloads as HTML or as its Markdown source.'
      )
    );
  }

  return c.html(
    buildSharedPage({
      title: document.name,
      body,
      createdAt,
      updatedAt: document.updated_at ? new Date(document.updated_at).getTime() : undefined,
      downloadHref: `/s/${encodeURIComponent(token)}?download`,
      markdownHref: `/s/${encodeURIComponent(token)}?download=md`,
      reportHref: `/report/${encodeURIComponent(token)}`,
      /*
       * The same document in the app, which is where a copy can be kept: this page runs no script
       * and has nobody signed in, and /open/<token> knows how to ask.
       */
      openHref: `/open/${encodeURIComponent(token)}`,
      seenHref: `/s/${encodeURIComponent(token)}/seen`,
      watched: verdict.reader !== null && !verdict.reader.isOwner,
      size: document.size,
      stats: document.stats ?? undefined,
    })
  );
});

/** Wrong passwords from one machine for one link, in a minute, before it is asked to wait. */
const PASSWORD_TRIES_PER_MINUTE = 10;

/** And from everywhere at once, for one link: a guess spread across machines still stops. */
const PASSWORD_TRIES_PER_LINK = 30;

/**
 * The password form's answer. Right, and the reader gets a cookie that says so for a day and is
 * sent on to the document with a 303, so reloading it does not post the password again; wrong, and
 * the same form comes back with one sentence that is the same for every wrong answer.
 *
 * Paced twice — per machine and per link — before the password is even looked at, and the machine
 * is a one-way hash, as it is for counting opens. A form anybody can post is a form somebody will
 * post a dictionary at.
 */
app.post('/s/:token', async (c) => {
  for (const [header, value] of Object.entries(SHARED_PAGE_HEADERS)) {
    c.header(header, value);
  }

  c.header('cache-control', 'private, no-store');

  const token = c.req.param('token');
  const back = `/s/${encodeURIComponent(token)}`;
  const verdict = await shareGate(c, token);

  // Open already, gone, expired, or not a link with a password: the page says which.
  if (verdict.ok || verdict.why !== 'password') {
    return c.redirect(back, 303);
  }

  const machine = createHash('sha256')
    .update(`${clientAddress(c)}|${token}`)
    .digest('base64url')
    .slice(0, 22);
  const link = createHash('sha256').update(token).digest('base64url').slice(0, 22);
  const mine = await countCall(`unlock:${machine}`).catch(() => null);
  const all = await countCall(`unlock-link:${link}`).catch(() => null);

  if (
    !mine ||
    !all ||
    mine.calls > PASSWORD_TRIES_PER_MINUTE ||
    all.calls > PASSWORD_TRIES_PER_LINK
  ) {
    c.status(429);

    return c.html(buildPasswordPage(token, 'Too many tries. Wait a minute and try again.'));
  }

  const form = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
  const password = String(form.password ?? '').slice(0, 200);

  if (!password || !(await passwordMatches(password, verdict.hash))) {
    c.status(401);

    return c.html(buildPasswordPage(token, 'That is not the password.'));
  }

  setCookie(c, unlockCookie(token), unlockValue(token, verdict.hash), {
    path: '/',
    httpOnly: true,
    secure: selfOrigin(c).startsWith('https:'),
    sameSite: 'Lax',
    maxAge: UNLOCK_SECONDS,
  });

  return c.redirect(back, 303);
});

/** A transparent 1×1 GIF: the smallest picture a browser loads and then draws as nothing. */
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

/**
 * What a preview bot or a crawler calls itself. None of them is somebody reading the link — and
 * most never ask for the picture anyway, which is why the count is a picture in the first place.
 */
const NOT_A_READER =
  /bot\b|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|skype|embedly|preview/i;

/** Opens counted from one address, for one link, in a minute. Past it is a reload held down. */
const OPENS_PER_MINUTE = 10;

/**
 * One open of a shared link, counted.
 *
 * Asked for by the page's own picture, every time the page is shown — the page may come from the
 * CDN, the picture never does. It passes the same gate as the page, so a revoked, expired or
 * someone-else's link counts nothing, and it answers the same picture either way: a different
 * answer would tell a stranger which tokens are live.
 *
 * What is kept is a number and a time on the document. No cookie and nothing about who opened
 * it — which is what the privacy page says, and why this cannot count people, only opens.
 */
app.get('/s/:token/seen', async (c) => {
  for (const [header, value] of Object.entries(SHARED_PAGE_HEADERS)) {
    c.header(header, value);
  }

  c.header('cache-control', 'no-store');
  c.header('content-type', 'image/gif');

  const agent = c.req.header('user-agent') ?? '';

  if (c.req.method === 'GET' && !NOT_A_READER.test(agent)) {
    const token = c.req.param('token');
    const verdict = await shareGate(c, token).catch(() => null);

    if (verdict?.ok) {
      /*
       * Paced per machine per link, and the machine is a one-way hash, not its address: the
       * privacy page says an open leaves nothing about who opened it, and the tally row lives a
       * day. The hash tells one reload loop from the next; it tells nobody where it came from.
       */
      const machine = createHash('sha256')
        .update(`${clientAddress(c)}|${token}`)
        .digest('base64url')
        .slice(0, 22);
      const pace = await countCall(`seen:${machine}`).catch(() => null);

      if (pace && pace.calls <= OPENS_PER_MINUTE) {
        const via = c.req.query('via') === 'app' ? 'app' : 'page';

        await sql()`
          update m2h_document
          set share_views = share_views + 1, share_viewed_at = now()
          where id = ${verdict.document.id}
        `.catch(() => undefined);

        /*
         * The same open, as a row the Views tab lists: the time and where — and, on a share
         * addressed to people only, which of those addresses it was. The reader of such a share
         * signed in to open it, and the page they read says the owner can see this.
         */
        await sql()`
          insert into m2h_share_view (document_id, via, viewer)
          values (${verdict.document.id}, ${via}, ${verdict.reader?.email ?? null})
        `.catch(() => undefined);

        // A year is as far back as a list of opens is worth anything; swept on the way past.
        if (Math.random() < 0.01) {
          await sql()`
            delete from m2h_share_view where viewed_at < now() - interval '1 year'
          `.catch(() => undefined);
        }
      }
    }
  }

  return c.body(new Uint8Array(PIXEL));
});

/*
 * Somewhere for a report to land.
 *
 * A form, not an API call: the page it is reached from runs no JavaScript, and someone reporting a
 * phishing page should not have to. Nothing is revoked automatically — a report is a claim, and
 * acting on it is `npm run reports`, where a person reads it.
 */
app.get('/report/:token', (c) => {
  for (const [header, value] of Object.entries(SHARED_PAGE_HEADERS)) {
    c.header(header, value);
  }

  return c.html(buildReportPage(c.req.param('token')));
});

app.post('/report/:token', async (c) => {
  /*
   * By address, and stricter than anything else here, because this is the one endpoint that writes
   * to the database with nobody signed in. Two kilobytes a row, no ceiling, and a database with a
   * few hundred megabytes in it: a form anybody can post is a form somebody will post in a loop.
   */
  if (!(await countCall(`report:${clientAddress(c)}`).catch(() => ({ ok: true }))).ok) {
    return c.html(
      buildReportPage(
        c.req.param('token'),
        'Too many reports from here. Try again in a minute.'
      )
    );
  }

  const body = await c.req.parseBody();
  const reason = String(body.reason ?? '').slice(0, 2000);
  const reporter = String(body.reporter ?? '').slice(0, 200) || null;

  if (!reason.trim()) {
    return c.html(buildReportPage(c.req.param('token'), 'Say what is wrong with it.'));
  }

  await sql()`
    insert into m2h_report (share_token, reason, reporter)
    values (${c.req.param('token')}, ${reason}, ${reporter})
  `;

  /*
   * Handled reports do not need keeping for ever, and this table is the one thing here that grows
   * with no account behind it. Swept on the way past, like the OAuth tables in oauth.ts.
   */
  if (Math.random() < 0.02) {
    await sql()`
      delete from m2h_report
      where handled_at is not null and created_at < now() - interval '90 days'
    `.catch(() => undefined);
  }

  return c.html(
    buildNoticePage(
      'Thank you — the report has been logged',
      'Someone will look at this document. If it breaks the rules, its link stops working.'
    )
  );
});

/*
 * Discovery, for a client that wants to sign a person in before calling the MCP endpoint. Both
 * protected-resource paths are served: one is the URL our 401 hands out, the other is the one a
 * client builds for itself from the resource's path (RFC 9728). Two lines, and no way to be the
 * client that constructs the other one.
 */
app.get('/.well-known/oauth-protected-resource', protectedResource);
app.get('/.well-known/oauth-protected-resource/api/mcp', protectedResource);
app.get('/.well-known/oauth-authorization-server', authorizationServer);

/*
 * Where to send a security report, for whoever looks for it here first (RFC 9116).
 *
 * Served from code rather than from `public/`, because `vercel.json` rewrites this whole prefix to
 * the function: a file sitting in `public/.well-known/` would be two sources of truth and only one
 * of them would answer. The address is a GitHub advisory rather than a mailbox — private reporting
 * on the repository is the first channel this product has, with a mailbox behind it for anyone who
 * would rather not open a GitHub account to report a bug.
 *
 * `Expires` is a year out. It is meant to be renewed; a stale one says the policy is unmaintained.
 */
app.get('/.well-known/security.txt', (c) =>
  c.text(
    [
      // Two, in order of preference: the advisory keeps the report structured and private, the
      // mailbox is for whoever would rather write an email than open a GitHub account.
      'Contact: https://github.com/raudarlabs/transformpipe/security/advisories/new',
      'Contact: mailto:raudar.aborsen@gmail.com',
      'Expires: 2027-09-18T00:00:00.000Z',
      'Preferred-Languages: en, uk, ru',
      'Canonical: https://transformpipe.com/.well-known/security.txt',
      'Policy: https://github.com/raudarlabs/transformpipe/blob/main/SECURITY.md',
      '',
    ].join('\n'),
    200,
    { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' }
  )
);

/*
 * Proof that whoever runs this app also runs this domain, for the ChatGPT app directory.
 *
 * In code for the same reason `security.txt` above is: `vercel.json` rewrites the whole
 * `/.well-known/` prefix to this function, so a file in `public/.well-known/` would be built,
 * deployed, and never answer — the verifier would read this function's 404 instead and report the
 * domain as unverified, with nothing anywhere saying why.
 *
 * The body is the token and nothing else. No newline, no quotes, no surrounding whitespace: the
 * check is a byte comparison, and `c.text` sends exactly what it is given. The value is not a
 * secret — it is meant to be read by anybody who asks for this URL, which is the whole point of it.
 *
 * Short cache. It is read once, and a stale copy after the token is rotated would be a failure
 * nobody could explain.
 */
app.get('/.well-known/openai-apps-challenge', (c) =>
  c.text('WTolRjncIxerKrh0OnFt4cp0ZdCDZr2Yp-pXckkBVk4', 200, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=300',
  })
);

app.route('/', mcp);
app.route('/', oauth);
app.route('/', v1);
app.route('/', api);

export default app;
