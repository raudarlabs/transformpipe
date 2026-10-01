/*
 * What a shared link does, end to end against the running dev server and the real database.
 *
 * Like check-mcp, the half that needs a browser — signing in — cannot be driven from here, so the
 * access token an assistant would hold is minted directly in its table, and the documents are
 * written straight into theirs. Everything a reader or a script touches after that is the real
 * code path: the page at /s/<token> with both downloads, the app's reader at /api/shared/<token>,
 * the public API that sets and reports an expiry, and the MCP tools that report one.
 *
 * Every row it makes is removed at the end, pass or fail.
 */
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: ['.env.local', '.env'], quiet: true });

const HOST = process.env.SHARE_HOST ?? 'http://127.0.0.1:5180';
const sql = neon(process.env.DATABASE_URL);
const hash = (t) => createHash('sha256').update(t).digest('hex');

let passed = 0;
let failed = 0;
let skipped = 0;

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/*
 * Said out loud and counted apart from a pass, as in check-mcp. Behind Vercel the CDN keeps
 * `s-maxage` for itself and hands the browser `public, max-age=0`, so what the edge was told can
 * only be read on a server with no CDN in front of it.
 */
function skip(name, why) {
  skipped += 1;
  console.log(`  skip ${name} — ${why}`);
}

/** Whether the answer came through Vercel's CDN, which strips the edge's own directives. */
const behindCdn = (response) => response.headers.has('x-vercel-cache');

const made = { documents: [], tokens: [] };

/*
 * Somebody who may publish: link sharing waits for a confirmed address, and the API refusing to
 * publish for an unconfirmed one is a different check from the one this file makes.
 */
const [someone] = await sql`
  select id from neon_auth."user" where "emailVerified" = true order by "createdAt" limit 1
`;

if (!someone) {
  console.log('No confirmed account in this database to act as; nothing checked.');
  process.exit(1);
}

const access = randomBytes(32).toString('base64url');

await sql`
  insert into m2h_oauth_token (token_hash, kind, client_id, user_id, scope, resource, grant_id, expires_at)
  values (${hash(access)}, 'access', 'check-share', ${someone.id}, 'documents:read documents:write',
          ${`${HOST}/api/mcp`}, ${randomUUID()}, now() + interval '1 hour')
`;
made.tokens.push(hash(access));

/** A shared document, written as the app would have written it. `ends` is SQL for its expiry. */
async function shared({ mode = 'link', endsInSeconds = null } = {}) {
  const token = randomBytes(16).toString('base64url');
  const markdown = `# Check share\n\nWritten by scripts/check-share.mjs at ${new Date().toISOString()}.`;
  const [row] = await sql`
    insert into m2h_document (user_id, name, size, markdown, stats, share_mode, share_token, share_expires_at)
    values (${someone.id}, 'check-share.md', ${markdown.length}, ${markdown}, '{}'::jsonb, ${mode}, ${token},
            ${endsInSeconds === null ? null : new Date(Date.now() + endsInSeconds * 1000).toISOString()}::timestamptz)
    returning id
  `;

  made.documents.push(row.id);

  return { id: row.id, token };
}

const get = (path, headers = {}) => fetch(`${HOST}${path}`, { headers, redirect: 'manual' });

const v1 = (path, init = {}) =>
  fetch(`${HOST}/api/v1${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${access}`,
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  });

const tool = async (name, args) => {
  const response = await fetch(`${HOST}/api/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${access}` },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  const body = await response.json().catch(() => null);

  return body?.result?.content?.map((part) => part.text).join('\n') ?? '';
};

try {
  console.log('\n— a link with no end');

  const open = await shared();
  const page = await get(`/s/${open.token}`);
  const cache = page.headers.get('cache-control') ?? '';

  check('opens', page.status === 200, `got ${page.status}`);

  if (behindCdn(page)) {
    skip('is kept at the edge for a minute', 'the CDN strips s-maxage on the way out');
    skip('and never served stale after that minute', 'the CDN strips it on the way out');
  } else {
    check('is kept at the edge for a minute', /s-maxage=60\b/.test(cache), cache);
    check(
      'and never served stale after that minute',
      !/stale-while-revalidate/.test(cache),
      cache
    );
  }
  check(
    'and stays out of search',
    (page.headers.get('x-robots-tag') ?? '').includes('noindex')
  );

  console.log('\n— a link that ends soon');

  const soon = await shared({ endsInSeconds: 30 });
  const soonPage = await get(`/s/${soon.token}`);
  const soonAge = Number(/s-maxage=(\d+)/.exec(soonPage.headers.get('cache-control') ?? '')?.[1] ?? -1);

  check('opens before it ends', soonPage.status === 200, `got ${soonPage.status}`);

  if (behindCdn(soonPage)) {
    skip('and the edge keeps it no longer than it has left', 'the CDN strips s-maxage on the way out');
  } else {
    check(
      'and the edge keeps it no longer than it has left',
      soonAge >= 0 && soonAge <= 30,
      soonPage.headers.get('cache-control') ?? ''
    );
  }

  console.log('\n— a link that has ended');

  const ended = await shared({ endsInSeconds: -60 });

  for (const [what, path] of [
    ['the page', `/s/${ended.token}`],
    ['the HTML download', `/s/${ended.token}?download`],
    ['the Markdown download', `/s/${ended.token}?download=md`],
  ]) {
    const response = await get(path);

    check(`${what} is 410`, response.status === 410, `got ${response.status}`);
    check(
      `${what} is not cached`,
      (response.headers.get('cache-control') ?? '').includes('no-store'),
      response.headers.get('cache-control') ?? ''
    );
  }

  const endedPage = await (await get(`/s/${ended.token}`)).text();

  check('and says it expired, not that it never existed', /has expired/.test(endedPage));
  check('without the document in it', !/Written by scripts\/check-share/.test(endedPage));

  const reader = await get(`/api/shared/${encodeURIComponent(ended.token)}`);

  check('the app reader is 410 too', reader.status === 410, `got ${reader.status}`);

  const addressed = await shared({ mode: 'people', endsInSeconds: -60 });
  const addressedPage = await get(`/s/${addressed.token}`);

  check(
    'an addressed link that ended says so before asking anybody to sign in',
    addressedPage.status === 410,
    `got ${addressedPage.status}`
  );

  console.log('\n— counting opens');

  const counted = await shared();
  const seen = (token, init = {}) =>
    fetch(`${HOST}/s/${token}/seen`, {
      ...init,
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) check-share', ...init.headers },
    });
  const views = async (id) =>
    (await sql`select share_views, share_viewed_at from m2h_document where id = ${id}`)[0];

  const countedPage = await (await get(`/s/${counted.token}`)).text();

  check('the page asks for its picture', countedPage.includes(`/s/${counted.token}/seen`));

  const policy = (await get(`/s/${counted.token}`)).headers.get('content-security-policy') ?? '';

  check(
    "and its policy lets the picture load from here, over http too",
    /img-src[^;]*'self'/.test(policy),
    policy
  );

  const download = await (await get(`/s/${counted.token}?download`)).text();

  check('the downloaded file does not', !download.includes('/seen'));

  /*
   * The pace is counted per calendar minute, so a run that straddles one counts two allowances and
   * reads as a broken limit. Everything from the first open to the last reload goes in one minute.
   */
  const second = new Date().getSeconds();

  if (second > 40) {
    await new Promise((resolve) => setTimeout(resolve, (61 - second) * 1000));
  }

  const pixel = await seen(counted.token);

  check('the picture is a GIF', (pixel.headers.get('content-type') ?? '').startsWith('image/gif'));
  check('and never cached', (pixel.headers.get('cache-control') ?? '').includes('no-store'));

  const once = await views(counted.id);

  check('one open counts one', once.share_views === 1 && once.share_viewed_at !== null, JSON.stringify(once));

  await seen(counted.token, { headers: { 'user-agent': 'Slackbot-LinkExpanding 1.0' } });
  await seen(counted.token, { method: 'HEAD' });

  check('a preview bot and a HEAD count nothing', (await views(counted.id)).share_views === 1);

  const stranger = await seen('no-such-token-at-all');

  check(
    'a token nobody holds answers the same picture',
    stranger.status === 200 && (stranger.headers.get('content-type') ?? '').startsWith('image/gif')
  );

  await seen(ended.token);

  check(
    'a link that has ended counts nothing',
    (await views(ended.id)).share_views === 0
  );

  for (let i = 0; i < 12; i += 1) {
    await seen(counted.token);
  }

  const paced = (await views(counted.id)).share_views;

  check('one machine holding down reload counts ten a minute, not thirteen', paced === 10, `got ${paced}`);

  const [{ events }] = await sql`
    select count(*)::int as events from m2h_share_view where document_id = ${counted.id}
  `;

  check('each counted open is a row of its own, and only those', events === 10, `got ${events}`);

  const fromApp = await shared();

  await seen(fromApp.token, { headers: {}, method: 'GET' }).then(() =>
    fetch(`${HOST}/s/${fromApp.token}/seen?via=app`, {
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) check-share' },
    })
  );

  const opens = await (await v1(`/documents/${fromApp.id}/views`)).json().catch(() => ({}));

  check(
    'the list says where each open came from, newest first',
    opens.events?.length === 2 && opens.events[0].via === 'app' && opens.events[1].via === 'page',
    JSON.stringify(opens.events)
  );
  check(
    'and carries nothing but the time and where',
    (opens.events ?? []).every((one) => Object.keys(one).sort().join() === 'at,via')
  );

  check(
    'an open of a link records nobody, signed in or not',
    ((await sql`select count(*)::int as n from m2h_share_view where viewer is not null and document_id = any(${[counted.id, fromApp.id]}::uuid[])`)[0].n) === 0
  );

  /*
   * A share addressed to people records which named address opened it. Opening one needs a signed-in
   * session, which this cannot make, so the rows are written as /seen writes them and the list is
   * read back through the API.
   */
  const addressedTo = await shared({ mode: 'people' });

  await sql`
    insert into m2h_document_share (document_id, email)
    values (${addressedTo.id}, 'anna@example.com'), (${addressedTo.id}, 'marco@example.com')
  `;
  await sql`
    insert into m2h_share_view (document_id, via, viewer)
    values (${addressedTo.id}, 'page', 'anna@example.com'), (${addressedTo.id}, 'app', 'anna@example.com')
  `;

  const named = await (await v1(`/documents/${addressedTo.id}/views`)).json().catch(() => ({}));
  const anna = named.people?.find((one) => one.email === 'anna@example.com');
  const marco = named.people?.find((one) => one.email === 'marco@example.com');

  check(
    'a people share lists each address with its opens, the unopened too',
    anna?.opens === 2 && Boolean(anna?.last_at) && marco?.opens === 0 && marco?.last_at === null,
    JSON.stringify(named.people)
  );
  check(
    'and each open says whose it was',
    (named.events ?? []).every((one) => one.who === 'anna@example.com'),
    JSON.stringify(named.events)
  );

  const unnamed = await (await v1(`/documents/${counted.id}/views`)).json().catch(() => ({}));

  check('a link lists no people', Array.isArray(unnamed.people) && unnamed.people.length === 0);

  const linkReader = await (await get(`/api/shared/${encodeURIComponent(counted.token)}`)).json().catch(() => ({}));

  check('and a link reader is not told they are watched', linkReader.watched === false, JSON.stringify(linkReader.watched));

  const reportedViews = await (await v1(`/documents/${counted.id}/share`)).json().catch(() => ({}));

  check('the API reports the count', reportedViews.views === 10, JSON.stringify(reportedViews));

  const toldViews = await tool('tp_get_document', { id: counted.id });

  check('and so does an assistant', /Opened 10 times/.test(toldViews), toldViews.slice(0, 200));

  console.log('\n— setting an end through the API');

  const target = await shared();
  const later = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const put = (body) =>
    v1(`/documents/${target.id}/share`, { method: 'PUT', body: JSON.stringify(body) });

  const set = await put({ mode: 'link', expires_at: later });
  const setBody = await set.json().catch(() => ({}));

  check('a date in the future is taken', set.status === 200, `got ${set.status} ${JSON.stringify(setBody)}`);
  check('and echoed back', setBody.expires_at === later, setBody.expires_at);

  const read = await (await v1(`/documents/${target.id}/share`)).json().catch(() => ({}));

  check('and read back', read.expires_at === later, read.expires_at);

  const listed = await (await v1(`/documents/${target.id}`)).json().catch(() => ({}));

  check(
    'and carried on the document',
    listed.document?.share?.expires_at === later,
    JSON.stringify(listed.document?.share)
  );

  const kept = await (await put({ mode: 'link' })).json().catch(() => ({}));

  check('leaving it out keeps it', kept.expires_at === later, kept.expires_at);

  for (const [what, value] of [
    ['a date in the past', new Date(Date.now() - 1000).toISOString()],
    ['a date six years away', new Date(Date.now() + 6 * 365 * 24 * 60 * 60 * 1000).toISOString()],
    ['something that is not a date', 'next tuesday'],
    ['a number', 1234],
  ]) {
    const refused = await put({ mode: 'link', expires_at: value });

    check(`${what} is refused`, refused.status === 400, `got ${refused.status}`);
  }

  const reported = await tool('tp_get_document', { id: target.id });

  check(
    'an assistant reading it is told when the link ends',
    /The link stops working on/.test(reported),
    reported.slice(0, 160)
  );

  const cleared = await (await put({ mode: 'link', expires_at: null })).json().catch(() => ({}));

  check('null clears it', cleared.expires_at === null, String(cleared.expires_at));

  await put({ mode: 'link', expires_at: later });
  await sql`update m2h_document set share_views = 3, share_viewed_at = now() where id = ${target.id}`;

  const revoked = await (await put({ mode: 'private' })).json().catch(() => ({}));
  const [afterRevoke] = await sql`
    select share_token, share_expires_at, share_views, share_viewed_at from m2h_document where id = ${target.id}
  `;

  await sql`insert into m2h_share_view (document_id) values (${target.id})`;

  const revokedOpens = await put({ mode: 'private' }).then(() =>
    sql`select count(*)::int as n from m2h_share_view where document_id = ${target.id}`
  );

  check('revoking deletes the list of opens with it', revokedOpens[0].n === 0, JSON.stringify(revokedOpens));

  check(
    'revoking clears the end and the count with the token',
    revoked.mode === 'private' &&
      afterRevoke.share_token === null &&
      afterRevoke.share_expires_at === null &&
      afterRevoke.share_views === 0 &&
      afterRevoke.share_viewed_at === null,
    JSON.stringify(afterRevoke)
  );

  const reshared = await (await put({ mode: 'link' })).json().catch(() => ({}));

  check(
    'and the next link starts with no end',
    reshared.mode === 'link' && reshared.expires_at === null && Boolean(reshared.url),
    JSON.stringify(reshared)
  );

  const tools = await (
    await fetch(`${HOST}/api/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${access}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    })
  ).json();

  check(
    'no tool lets an assistant set an end',
    (tools.result?.tools ?? []).every(
      (one) => !Object.keys(one.inputSchema?.properties ?? {}).some((key) => /expir/i.test(key))
    )
  );

  console.log('\n— a link with a password');

  const locked = await shared();
  const setPassword = (id, password, mode = 'link') =>
    v1(`/documents/${id}/share`, { method: 'PUT', body: JSON.stringify({ mode, password }) });

  const lockedAnswer = await setPassword(locked.id, 'correct horse battery');
  const lockedBody = await lockedAnswer.text();

  check('a password is taken', lockedAnswer.status === 200 && JSON.parse(lockedBody).has_password === true, lockedBody.slice(0, 160));
  check('and never comes back, not even as its hash', !/scrypt\$|correct horse/.test(lockedBody));

  const short = await setPassword(locked.id, 'short');

  check('a password under eight characters is refused', short.status === 400, `got ${short.status}`);

  const onPeople = await setPassword(locked.id, 'correct horse battery', 'people');

  check('a share with specific people takes no password', onPeople.status === 400, `got ${onPeople.status}`);

  /*
   * Set ahead, while the document is still private: nothing opens, and the link it gets later is
   * protected from its first second.
   */
  const ahead = await shared({ mode: 'private' });

  await sql`update m2h_document set share_token = null where id = ${ahead.id}`;

  const aheadSet = await (await setPassword(ahead.id, 'set before sharing', 'private')).json().catch(() => ({}));

  check(
    'a password can be set while the document is private, and opens nothing',
    aheadSet.mode === 'private' && aheadSet.has_password === true && aheadSet.url === null,
    JSON.stringify(aheadSet)
  );

  const aheadShared = await (
    await v1(`/documents/${ahead.id}/share`, { method: 'PUT', body: JSON.stringify({ mode: 'link' }) })
  ).json().catch(() => ({}));
  const aheadToken = (aheadShared.url ?? '').split('/s/')[1] ?? '';
  const aheadPage = await get(`/s/${aheadToken}`);

  check(
    'and the link it gets asks for it from the first open',
    aheadShared.has_password === true && aheadPage.status === 401,
    `${aheadShared.has_password} ${aheadPage.status}`
  );

  for (const [what, path] of [
    ['the page', `/s/${locked.token}`],
    ['the HTML download', `/s/${locked.token}?download`],
    ['the Markdown download', `/s/${locked.token}?download=md`],
  ]) {
    const response = await get(path);
    const text = await response.text();

    check(`${what} asks for it`, response.status === 401 && /has a password/.test(text), `got ${response.status}`);
    check(`${what} is not cached`, (response.headers.get('cache-control') ?? '').includes('no-store'));
    check(`${what} does not leak the document`, !/Written by scripts\/check-share/.test(text));
  }

  const lockedReader = await get(`/api/shared/${encodeURIComponent(locked.token)}`);

  check('the app reader asks too', lockedReader.status === 401, `got ${lockedReader.status}`);

  await seen(locked.token);

  check('an open that has not given it counts nothing', (await views(locked.id)).share_views === 0);

  const unlock = (token, password, cookie) =>
    fetch(`${HOST}/s/${token}`, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        ...(cookie ? { cookie } : {}),
      },
      body: new URLSearchParams({ password }).toString(),
    });

  const wrong = await unlock(locked.token, 'not the one');

  check('a wrong password is refused in a sentence', wrong.status === 401 && /not the password/.test(await wrong.text()));

  const right = await unlock(locked.token, 'correct horse battery');
  const cookie = (right.headers.getSetCookie?.() ?? []).map((one) => one.split(';')[0]).join('; ');

  check(
    'the right one sends the reader on, with a cookie',
    right.status === 303 && (right.headers.get('location') ?? '').endsWith(`/s/${locked.token}`) && /tp_unlock_/.test(cookie),
    `${right.status} ${cookie}`
  );

  const inside = await get(`/s/${locked.token}`, { cookie });

  check('and with it the page opens', inside.status === 200 && /Written by scripts\/check-share/.test(await inside.text()));
  check('but is still never cached', (inside.headers.get('cache-control') ?? '').includes('no-store'), inside.headers.get('cache-control') ?? '');

  const insideMd = await get(`/s/${locked.token}?download=md`, { cookie });

  check('the download opens with it too', insideMd.status === 200, `got ${insideMd.status}`);

  const insideReader = await get(`/api/shared/${encodeURIComponent(locked.token)}`, { cookie });

  check('and so does the app reader', insideReader.status === 200, `got ${insideReader.status}`);

  await seen(locked.token, { headers: { cookie, 'user-agent': 'Mozilla/5.0 (Macintosh) check-share' } });

  check('an open that has given it counts', (await views(locked.id)).share_views === 1);

  const other = await shared();

  await setPassword(other.id, 'another long password');

  const borrowed = await get(`/s/${other.token}`, { cookie });

  check("one link's cookie does not open another", borrowed.status === 401, `got ${borrowed.status}`);

  await setPassword(locked.id, 'a different password now');

  const stale = await get(`/s/${locked.token}`, { cookie });

  check('a new password ends every cookie the old one gave', stale.status === 401, `got ${stale.status}`);

  const listedTools = await (
    await fetch(`${HOST}/api/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${access}` },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    })
  ).json();

  check(
    'no tool takes a password',
    (listedTools.result?.tools ?? []).every(
      (one) => !Object.keys(one.inputSchema?.properties ?? {}).some((key) => /pass/i.test(key))
    )
  );

  const toldLocked = await tool('tp_get_document', { id: locked.id });

  check('an assistant is told the link asks for one', /asks for a password/.test(toldLocked), toldLocked.slice(0, 200));

  await setPassword(locked.id, null);

  const reopened = await get(`/s/${locked.token}`);

  check('removing it opens the link to anybody again', reopened.status === 200, `got ${reopened.status}`);

  /* The same minute, as for counting opens: ten tries are allowed a minute from one machine. */
  const tick = new Date().getSeconds();

  if (tick > 40) {
    await new Promise((resolve) => setTimeout(resolve, (61 - tick) * 1000));
  }

  const guessed = await shared();

  await setPassword(guessed.id, 'the real password');

  let last = 0;

  for (let i = 0; i < 11; i += 1) {
    last = (await unlock(guessed.token, `guess number ${i}`)).status;
  }

  check('the eleventh guess in a minute is told to wait', last === 429, `got ${last}`);

  console.log('\n— creating a document with an end');

  const orphan = await v1(
    `/documents?name=check-share.md&expires_at=${encodeURIComponent(later)}`,
    { method: 'POST', body: JSON.stringify({ name: 'check-share.md', markdown: '# x' }) }
  );

  check('an end with nothing shared is refused', orphan.status === 400, `got ${orphan.status}`);

  const created = await v1(
    `/documents?name=check-share.md&share=link&expires_at=${encodeURIComponent(later)}`,
    { method: 'POST', body: JSON.stringify({ name: 'check-share.md', markdown: '# Check share' }) }
  );
  const createdBody = await created.json().catch(() => ({}));

  if (createdBody.document?.id) {
    made.documents.push(createdBody.document.id);
  }

  check(
    'a document published with an end carries it',
    created.status === 201 || created.status === 200
      ? createdBody.document?.share?.expires_at === later
      : false,
    `${created.status} ${JSON.stringify(createdBody).slice(0, 160)}`
  );

  /*
   * The two downloads that are built on the server, checked by their first bytes. Both answered
   * 502 on production for a fortnight — the Word converter's `import` entry loaded as CommonJS
   * there, and pdfmake was refused its own fonts — while the dev server built both, and nothing
   * anywhere asked the deployed one for a file.
   */
  /*
   * Updating in place: the same link with new text, and the old text kept as a revision. What the
   * Obsidian plugin's Publish and `tp push --update` stand on.
   */
  console.log('\n— updating in place');

  const firstText = `# Update check\n\nThe first text, written ${new Date().toISOString()}.`;
  const posted = await fetch(`${HOST}/api/v1/documents?share=link&name=check-update.md`, {
    method: 'POST',
    headers: { authorization: `Bearer ${access}`, 'content-type': 'text/markdown' },
    body: firstText,
  });
  const postedBody = await posted.json().catch(() => ({}));
  const updateId = postedBody.document?.id;

  if (updateId) {
    made.documents.push(updateId);
  }

  const usageBefore = await (await v1('/usage')).json().catch(() => ({}));
  const replace = (body, type = 'text/markdown') =>
    v1(`/documents/${updateId}`, {
      method: 'PUT',
      headers: { 'content-type': type },
      body,
    });

  const secondText = firstText.replace('The first text', 'The second text');
  const updated = await replace(secondText);
  const updatedBody = await updated.json().catch(() => ({}));

  check(
    'an update keeps the id and the link',
    updated.status === 200 &&
      updatedBody.changed === true &&
      updatedBody.document?.id === updateId &&
      updatedBody.document?.share?.url === postedBody.document?.share?.url &&
      Boolean(updatedBody.document?.updated_at),
    `${updated.status} ${JSON.stringify(updatedBody).slice(0, 200)}`
  );

  const updateToken = String(postedBody.document?.share?.url ?? '').split('/s/')[1] ?? '';
  const updatedPage = await (await get(`/s/${updateToken}`)).text();

  check(
    'and the shared page shows the new text, saying it was updated',
    updatedPage.includes('The second text') && !updatedPage.includes('The first text') && updatedPage.includes(' · updated '),
    updatedPage.slice(0, 120)
  );

  const revisionsList = await (await v1(`/documents/${updateId}/revisions`)).json().catch(() => ({}));
  const firstRevision = revisionsList.revisions?.[0];
  const revisionRead = firstRevision
    ? await (await v1(`/documents/${updateId}/revisions/${firstRevision.id}`)).json().catch(() => ({}))
    : {};

  check(
    'the text it replaced is kept, and reads back whole',
    revisionsList.revisions?.length === 1 && revisionRead.revision?.markdown === firstText,
    JSON.stringify(revisionsList).slice(0, 160)
  );

  const same = await replace(secondText);
  const sameBody = await same.json().catch(() => ({}));
  const afterSame = await (await v1(`/documents/${updateId}/revisions`)).json().catch(() => ({}));

  check(
    'the same text again is not an update',
    same.status === 200 && sameBody.changed === false && afterSame.revisions?.length === 1,
    `${same.status} ${JSON.stringify(sameBody).slice(0, 120)}`
  );

  const usageAfter = await (await v1('/usage')).json().catch(() => ({}));
  check(
    'a kept revision counts as bytes, not as a document',
    usageAfter.documents === usageBefore.documents &&
      usageAfter.bytes === usageBefore.bytes + secondText.length,
    `${usageBefore.bytes}/${usageBefore.documents} → ${usageAfter.bytes}/${usageAfter.documents}`
  );

  for (let round = 3; round <= 13; round += 1) {
    await replace(`${secondText}\n\nRound ${round}.`);
  }

  const capped = await (await v1(`/documents/${updateId}/revisions`)).json().catch(() => ({}));
  check('no more than ten are kept', capped.revisions?.length === 10, `kept ${capped.revisions?.length}`);

  const renamed = await replace(JSON.stringify({ markdown: `${secondText}\n\nRound 13.`, name: 'check-update-renamed.md' }), 'application/json');
  const renamedBody = await renamed.json().catch(() => ({}));
  check(
    'a JSON body can rename it too',
    renamed.status === 200 && renamedBody.document?.name === 'check-update-renamed.md',
    `${renamed.status} ${JSON.stringify(renamedBody).slice(0, 120)}`
  );

  const empty = await replace('   ');
  check('an empty text is refused', empty.status === 400, `got ${empty.status}`);

  const nobody = await v1(`/documents/${randomUUID()}`, {
    method: 'PUT',
    headers: { 'content-type': 'text/markdown' },
    body: '# Nobody',
  });
  check('a document that is not on the account is not found', nobody.status === 404, `got ${nobody.status}`);

  const tooBig = await replace(`# Big\n\n${'x'.repeat(4 * 1024 * 1024 + 10)}`);
  check('one past the limit for a document is refused', tooBig.status === 413, `got ${tooBig.status}`);

  const removedUpdate = await v1(`/documents/${updateId}`, { method: 'DELETE' });
  const [leftRevisions] = await sql`
    select count(*)::int as n from m2h_document_revision where document_id = ${updateId}
  `;
  check(
    'deleting the document takes its revisions with it',
    removedUpdate.status === 200 && leftRevisions.n === 0,
    `${removedUpdate.status}, ${leftRevisions.n} left`
  );

  console.log('\n— Word and PDF');

  const exported = await shared();

  for (const [format, magic, type] of [
    ['docx', 'PK', 'officedocument'],
    ['pdf', '%PDF-', 'application/pdf'],
  ]) {
    const response = await v1(`/documents/${exported.id}.${format}`);
    const bytes = Buffer.from(await response.arrayBuffer());

    check(
      `a .${format} is built`,
      response.status === 200 &&
        bytes.subarray(0, magic.length).toString() === magic &&
        (response.headers.get('content-type') ?? '').includes(type),
      `${response.status} ${response.headers.get('content-type')} ${bytes.subarray(0, 120).toString()}`
    );
  }
} finally {
  /* Through the API where it can, so a source that went to blob storage goes with its row. */
  for (const id of made.documents) {
    await v1(`/documents/${id}`, { method: 'DELETE' }).catch(() => undefined);
  }

  await sql`delete from m2h_document where id = any(${made.documents}::uuid[])`;
  await sql`delete from m2h_oauth_token where token_hash = any(${made.tokens})`;
}

console.log(`\n${passed} passed, ${failed} failed${skipped ? `, ${skipped} skipped` : ''}`);
process.exit(failed === 0 ? 0 : 1);
