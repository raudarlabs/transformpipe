/*
 * End to end against the running dev server and the real database.
 *
 * The half that needs a browser — signing in with Google and pressing Connect — cannot be driven
 * from here, so the authorization code is minted directly in the table exactly as /approve would
 * mint it, with the same hash and the same challenge. Everything on either side of that is the
 * real code path: discovery, the 401, registration, redirect_uri validation, PKCE, the token
 * exchange, replay, refresh rotation, revocation, and every tool.
 */
import { createHash, randomBytes } from 'node:crypto';
import zlib from 'node:zlib';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: ['.env.local', '.env'], quiet: true });

const HOST = process.env.MCP_HOST ?? 'http://127.0.0.1:5180';
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
 * Said out loud, and counted separately from a pass.
 *
 * A local checkout's Vercel OIDC token expires every few hours, and without it nothing can be
 * saved — which used to report as eight broken tools. A gate that cannot tell "this code is wrong"
 * from "this machine has no credentials" is a gate people learn to ignore.
 */
function skip(name, why) {
  skipped += 1;
  console.log(`  skip ${name} — ${why}`);
}

const post = (path, body, headers = {}) =>
  fetch(`${HOST}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    redirect: 'manual',
  });

const call = async (token, method, params) => {
  const response = await post(
    '/api/mcp',
    { jsonrpc: '2.0', id: 1, method, params },
    token ? { authorization: `Bearer ${token}` } : {}
  );

  const text = await response.text();

  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  };
};

const tool = async (token, name, args = {}) => {
  const { body } = await call(token, 'tools/call', { name, arguments: args });

  return {
    text: body?.result?.content?.[0]?.text ?? '',
    isError: Boolean(body?.result?.isError),
  };
};

console.log('\n— discovery');

for (const path of [
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-protected-resource/api/mcp',
  '/.well-known/oauth-authorization-server',
]) {
  const response = await fetch(`${HOST}${path}`);
  const body = await response.json().catch(() => null);

  check(`${path} answers JSON`, response.ok && body, `status ${response.status}`);

  if (path.includes('protected-resource') && body) {
    check(
      `${path} names one authorization server`,
      body.authorization_servers?.length === 1,
      JSON.stringify(body.authorization_servers)
    );
    check(
      `${path} resource is the endpoint`,
      body.resource === `${HOST}/api/mcp`,
      body.resource
    );
  }

  if (path.includes('authorization-server') && body) {
    check('S256 only', JSON.stringify(body.code_challenge_methods_supported) === '["S256"]');
    check('no client secret expected', body.token_endpoint_auth_methods_supported?.includes('none'));
    check(
      'CIMD is advertised',
      body.client_id_metadata_document_supported === true
    );
    check('and registration is still offered beside it', Boolean(body.registration_endpoint));
  }
}

console.log('\n— the 401 that starts a sign-in');

/*
 * `initialize` included, and this check earns its place: a client decides what kind of server this
 * is by sending one without a token. Claude's connector dialog reads a 200 as "no sign-in needed"
 * and offers to add the connector with no credentials at all, which is the opposite of true here.
 */
const bare = await call(null, 'initialize', {});
const challenge = bare.headers.get('www-authenticate') ?? '';

check('unauthenticated POST is 401, not 200', bare.status === 401, `got ${bare.status}`);
check('WWW-Authenticate names the metadata', challenge.includes('resource_metadata='), challenge);
check('and the scopes', challenge.includes('documents:write'), challenge);

const wrongToken = await call('not-a-real-token', 'tools/list');
check('an unknown bearer is 401 too', wrongToken.status === 401, `got ${wrongToken.status}`);

const getIt = await fetch(`${HOST}/api/mcp`);
check('GET is 405 with Allow', getIt.status === 405 && getIt.headers.get('allow')?.includes('POST'));

console.log('\n— registration');

const registered = await post('/api/oauth/register', {
  client_name: 'e2e probe',
  redirect_uris: ['https://claude.ai/api/mcp/auth_callback', 'http://localhost/callback'],
});
const client = await registered.json();

check('registration is 201', registered.status === 201, `got ${registered.status}`);
check('a client id comes back', String(client.client_id ?? '').startsWith('m2hc_'), client.client_id);
check('and no secret', client.client_secret === undefined);

const rejected = await post('/api/oauth/register', {
  redirect_uris: ['http://evil.example/cb'],
});
check('a non-loopback http redirect_uri is refused', rejected.status === 400, `got ${rejected.status}`);

console.log('\n— authorize, before anybody is signed in');

const authorize = (params) =>
  fetch(`${HOST}/api/oauth/authorize?${new URLSearchParams(params)}`, {
    redirect: 'manual',
  });

const unknownClient = await authorize({
  client_id: 'm2hc_nope',
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  code_challenge: 'x',
  code_challenge_method: 'S256',
});
check('an unknown client gets a plain 400, never a redirect', unknownClient.status === 400);

const strayRedirect = await authorize({
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback.evil.test',
  response_type: 'code',
  code_challenge: 'x',
  code_challenge_method: 'S256',
});
check('a redirect_uri that only looks right is refused', strayRedirect.status === 400);

const noPkce = await authorize({
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  state: 'st',
});
const noPkceTo = noPkce.headers.get('location') ?? '';
check(
  'a request without PKCE is bounced to the client as invalid_request',
  noPkce.status === 302 && noPkceTo.includes('error=invalid_request'),
  noPkceTo
);
check('and keeps its state', noPkceTo.includes('state=st'), noPkceTo);

const wrongResource = await authorize({
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  code_challenge: 'x',
  code_challenge_method: 'S256',
  resource: 'https://somewhere.else/api/mcp',
});
check(
  'a token asked for another resource is refused',
  (wrongResource.headers.get('location') ?? '').includes('error=invalid_target'),
  wrongResource.headers.get('location') ?? ''
);

const signedOut = await authorize({
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
  state: 'st',
});
const parked = signedOut.headers.get('location') ?? '';
check(
  'a signed-out person is parked and sent to the app to sign in',
  signedOut.status === 302 && parked.includes('/?connect='),
  parked
);

const pendingId = new URL(parked, HOST).searchParams.get('connect');
const pendingRow = await sql`select params from m2h_oauth_pending where id = ${pendingId}`;
check(
  'the whole request is parked server-side, not carried in the address',
  pendingRow.length === 1 && pendingRow[0].params.client_id === client.client_id
);

console.log('\n— the Connect button');

/*
 * The approval POST is the one request in the app that acts on a session, so it refuses to be
 * driven from anywhere else — and for three days it refused everybody, because the consent page
 * carried `Referrer-Policy: no-referrer` and Chrome derives a navigation's Origin header from the
 * referrer policy: the page's own form arrived with `Origin: null`. Nothing here could see it. The
 * database could: every pending row was shown and none was ever approved.
 */
const consentHeaders = await fetch(`${HOST}/api/oauth/approve`);

check(
  'the consent pages do not suppress their own origin',
  consentHeaders.headers.get('referrer-policy') === 'same-origin',
  consentHeaders.headers.get('referrer-policy') ?? '(absent)'
);

/*
 * The consent page itself names the one client address it may send you to, which cannot be checked
 * from here — rendering it needs a session. What can be checked is that everything else still names
 * nothing at all: a page that answered `form-action *` would take the whole directive with it.
 */
check(
  'and the pages with nowhere to send you still say so',
  (consentHeaders.headers.get('content-security-policy') ?? '').includes("form-action 'self';"),
  consentHeaders.headers.get('content-security-policy') ?? '(absent)'
);

const approve = (headers) =>
  fetch(`${HOST}/api/oauth/approve`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers },
    body: new URLSearchParams({ pending: 'nothing', decision: 'allow' }),
  });

const fromOurPage = await approve({ origin: HOST, 'sec-fetch-site': 'same-origin' });
check(
  'a POST from our own page gets past the origin check',
  fromOurPage.status === 401,
  `got ${fromOurPage.status}`
);

const opaqueOrigin = await approve({ origin: 'null', 'sec-fetch-site': 'same-origin' });
check(
  'and so does one whose origin the browser opaqued',
  opaqueOrigin.status === 401,
  `got ${opaqueOrigin.status}`
);

const elsewhere = await approve({
  origin: 'https://evil.example',
  'sec-fetch-site': 'cross-site',
});
check(
  'but a POST from another site is still refused',
  elsewhere.status === 403,
  `got ${elsewhere.status}`
);

const opaqueFromElsewhere = await approve({ origin: 'null', 'sec-fetch-site': 'cross-site' });
check(
  'and an opaque origin cross-site with it',
  opaqueFromElsewhere.status === 403,
  `got ${opaqueFromElsewhere.status}`
);

console.log('\n— a client that identified itself with a metadata document');

/*
 * Claude Code's own document, fetched from the address Claude Code puts in its client_id. A
 * fixture of ours would prove the parser and nothing else; this proves the thing that has to
 * work — the real document, the real fetch, and the loopback redirect_uri with a port that
 * cannot have been registered because it is chosen at runtime.
 */
const CIMD = 'https://claude.ai/oauth/claude-code-client-metadata';

const byDocument = await authorize({
  client_id: CIMD,
  redirect_uri: 'http://localhost:53119/callback',
  response_type: 'code',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
  state: 'st',
});

check(
  'a URL client_id is fetched and accepted',
  byDocument.status === 302 && (byDocument.headers.get('location') ?? '').includes('/?connect='),
  `${byDocument.status} ${byDocument.headers.get('location') ?? (await byDocument.text()).slice(0, 80)}`
);

const mirrored = await sql`select name, redirect_uris from m2h_oauth_client where id = ${CIMD}`;
check(
  'and mirrored into the client table under its URL',
  mirrored.length === 1 && mirrored[0].name === 'Claude Code',
  JSON.stringify(mirrored[0] ?? null)
);

const strayFromDocument = await authorize({
  client_id: CIMD,
  redirect_uri: 'https://evil.example/callback',
  response_type: 'code',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
});
check(
  'a redirect_uri the document does not list is refused',
  strayFromDocument.status === 400,
  `got ${strayFromDocument.status}`
);

const notJson = await authorize({
  client_id: `${HOST.replace('http://', 'https://')}/docs`,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
});
check(
  'an https URL that is not a metadata document is refused',
  notJson.status === 400,
  `got ${notJson.status}`
);

const bareOrigin = await authorize({
  client_id: 'https://claude.ai',
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
});
check(
  'an origin with no path is not a client_id',
  bareOrigin.status === 400,
  `got ${bareOrigin.status}`
);

const insideOut = await authorize({
  client_id: 'https://localhost/client.json',
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
  response_type: 'code',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
});
check(
  'a client_id pointing inside is refused before it is fetched',
  insideOut.status === 400,
  `got ${insideOut.status}`
);

console.log('\n— the token exchange');

const [someone] = await sql`
  select d.user_id from m2h_document d group by d.user_id order by count(*) desc limit 1
`;

if (!someone) {
  console.log('  (no account in this database to act as; stopping here)');
  process.exit(failed > 0 ? 1 : 0);
}

const verifier = randomBytes(32).toString('base64url');
const codeChallenge = createHash('sha256').update(verifier).digest('base64url');
const code = randomBytes(32).toString('base64url');

await sql`
  insert into m2h_oauth_code
    (code_hash, client_id, user_id, redirect_uri, code_challenge, resource, scope, expires_at)
  values (${hash(code)}, ${client.client_id}, ${someone.user_id},
          'https://claude.ai/api/mcp/auth_callback', ${codeChallenge},
          ${`${HOST}/api/mcp`}, 'documents:read documents:write',
          now() + interval '5 minutes')
`;

const form = (fields) =>
  fetch(`${HOST}/api/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });

const wrongVerifier = await form({
  grant_type: 'authorization_code',
  code,
  code_verifier: 'not-the-verifier',
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
});
const wrongBody = await wrongVerifier.json();

check(
  'a wrong code_verifier is invalid_grant',
  wrongVerifier.status === 400 && wrongBody.error === 'invalid_grant',
  JSON.stringify(wrongBody)
);

// That attempt burnt the code, which is the point: one code, one exchange, whatever the outcome.
const replay = await form({
  grant_type: 'authorization_code',
  code,
  code_verifier: verifier,
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
});
const replayBody = await replay.json();

check(
  'and the code is burnt by the attempt, not by success',
  replay.status === 400 && /already been used/.test(replayBody.error_description ?? ''),
  JSON.stringify(replayBody)
);

const second = randomBytes(32).toString('base64url');

await sql`
  insert into m2h_oauth_code
    (code_hash, client_id, user_id, redirect_uri, code_challenge, resource, scope, expires_at)
  values (${hash(second)}, ${client.client_id}, ${someone.user_id},
          'https://claude.ai/api/mcp/auth_callback', ${codeChallenge},
          ${`${HOST}/api/mcp`}, 'documents:read documents:write',
          now() + interval '5 minutes')
`;

const exchanged = await form({
  grant_type: 'authorization_code',
  code: second,
  code_verifier: verifier,
  client_id: client.client_id,
  redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
});
const tokens = await exchanged.json();

check('form-urlencoded is accepted', exchanged.status === 200, `got ${exchanged.status}`);
check('an access token comes back', Boolean(tokens.access_token), JSON.stringify(tokens).slice(0, 120));
check('with a refresh token', Boolean(tokens.refresh_token));
check('and a bearer type', tokens.token_type === 'Bearer');

console.log('\n— the endpoint, with a real token');

const hello = await call(tokens.access_token, 'initialize', {
  protocolVersion: '2025-06-18',
  clientInfo: { name: 'e2e', version: '1' },
});

check('initialize is 200', hello.status === 200, `got ${hello.status}`);
check(
  'and echoes the version it was asked for',
  hello.body?.result?.protocolVersion === '2025-06-18',
  JSON.stringify(hello.body?.result?.protocolVersion)
);
check('a session id is minted', Boolean(hello.headers.get('mcp-session-id')));

/* What a client puts on the screen once it is connected: a name, a sentence, and a picture. */
const info = hello.body?.result?.serverInfo ?? {};

check('serverInfo says who this is', info.name === 'TransformPipe' && Boolean(info.description));
check(
  'and carries an icon on this origin',
  Array.isArray(info.icons) &&
    info.icons.length > 0 &&
    info.icons.every((icon) => String(icon.src).startsWith(HOST)),
  JSON.stringify(info.icons)
);
check(
  'the instructions warn about publishing and deleting',
  /public web/.test(hello.body?.result?.instructions ?? '') &&
    /no undo/.test(hello.body?.result?.instructions ?? '')
);

const older = await call(tokens.access_token, 'initialize', { protocolVersion: '1999-01-01' });
check(
  'an unknown version gets ours rather than an error',
  older.body?.result?.protocolVersion === '2025-11-25',
  JSON.stringify(older.body?.result?.protocolVersion)
);

const note = await fetch(`${HOST}/api/mcp`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${tokens.access_token}`,
  },
  body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
});
check('a notification is answered 202 with no body', note.status === 202);

const listed = await call(tokens.access_token, 'tools/list');
const names = (listed.body?.result?.tools ?? []).map((t) => t.name);

check('tools/list answers', listed.status === 200);

/*
 * MCP Apps (SEP-1865): the card a host draws beside a document. Declared in three places that have
 * to agree — the capability, the resource, and the tools that point at it — so all three are read
 * back here rather than trusted.
 */
const ui = hello.body?.result?.capabilities?.extensions?.['io.modelcontextprotocol/ui'];

check(
  'the UI extension is declared with its mime type',
  Array.isArray(ui?.mimeTypes) && ui.mimeTypes.includes('text/html;profile=mcp-app'),
  JSON.stringify(ui)
);

const resources = await call(tokens.access_token, 'resources/list');
const cardResource = (resources.body?.result?.resources ?? []).find((one) =>
  String(one.uri).startsWith('ui://')
);

check('resources/list offers the card', Boolean(cardResource), JSON.stringify(resources.body?.result));
check(
  'and the list view beside it',
  (resources.body?.result?.resources ?? []).some((one) => one.uri.endsWith('/document-list'))
);
check(
  'and the delete confirmation',
  (resources.body?.result?.resources ?? []).some((one) => one.uri.endsWith('/delete-confirm'))
);
check(
  'and calls it what the extension requires',
  cardResource?.mimeType === 'text/html;profile=mcp-app',
  cardResource?.mimeType
);

const read = await call(tokens.access_token, 'resources/read', { uri: cardResource?.uri });
const contents = read.body?.result?.contents?.[0];

check('resources/read returns the page itself', typeof contents?.text === 'string' && contents.text.startsWith('<!doctype html>'));
check(
  'and it fetches nothing',
  !/\b(src|href)=["']https?:/.test(contents?.text ?? 'src="https://'),
  'the card must be self-contained'
);

/*
 * Every tool says what it is and whether it changes anything. The directory's review asks for it,
 * and it is the difference between a person approving "tp_delete_document" and approving "Delete a
 * document · changes data · cannot be undone".
 */
const tools = listed.body?.result?.tools ?? [];
const annotated = tools.filter((one) => one.annotations?.title && typeof one.annotations.readOnlyHint === 'boolean');

check(
  'every tool carries a title and a readOnlyHint',
  annotated.length === tools.length,
  tools.filter((one) => !one.annotations?.title).map((one) => one.name).join(', ')
);
check(
  'the one that cannot be undone says so',
  tools.find((one) => one.name === 'tp_delete_document')?.annotations?.destructiveHint === true
);
check(
  'and saving a document does not',
  tools.find((one) => one.name === 'tp_save_document')?.annotations?.destructiveHint === false
);

check(
  'the two document tools point at the card',
  ['tp_save_document', 'tp_get_document'].every(
    (name) => tools.find((one) => one.name === name)?._meta?.ui?.resourceUri === cardResource?.uri
  )
);
check(
  'and listing points at the list',
  tools.find((one) => one.name === 'tp_list_documents')?._meta?.ui?.resourceUri?.endsWith('/document-list') === true
);
check(
  'and converting points at the document card',
  tools.find((one) => one.name === 'tp_convert_to_markdown')?._meta?.ui?.resourceUri?.endsWith('/document-card') === true
);
check(
  'and deleting points at the confirmation',
  tools.find((one) => one.name === 'tp_delete_document')?._meta?.ui?.resourceUri?.endsWith('/delete-confirm') === true
);
check(
  'every UI link is written both ways, for hosts that read the older one',
  tools
    .filter((one) => one._meta?.ui?.resourceUri)
    .every((one) => one._meta['openai/outputTemplate'] === one._meta.ui.resourceUri)
);
/*
 * The thing this actually guards is a tool per document — a list that grows with the account, so a
 * person with forty files sends forty tool definitions with every message. Sixteen is a smoke
 * alarm for that, not a budget to spend down: a real tool that earns its place should be added,
 * not squeezed out to keep a round number.
 *
 * What it costs, measured rather than feared: the eleven descriptions are about 870 tokens and
 * their schemas about 935, so roughly 1,800 tokens ride along with every message while the
 * connector is connected. Worth knowing, and not worth merging two clear tools into one that
 * returns two different shapes — that trades 5% of this for a model that picks wrong more often.
 */
check(
  'no tool per document, and the list has not run away',
  names.length <= 16 && names.length >= 7 && !names.some((name) => /\d|document-/.test(name)),
  names.join(', ')
);
check('every tool has an inputSchema', (listed.body?.result?.tools ?? []).every((t) => t.inputSchema?.type === 'object'));

/* `resources/list` used to be the unknown one; it is answered now, so this asks for a method that
 * genuinely is not here. */
const unknown = await call(tokens.access_token, 'prompts/list');
check(
  'an unknown method is a JSON-RPC -32601, not an HTTP error',
  unknown.status === 200 && unknown.body?.error?.code === -32601,
  JSON.stringify(unknown.body)
);

console.log('\n— the tools');

const help = await tool(tokens.access_token, 'tp_help', { question: 'what are the limits' });
check('help answers from the documentation', /100/.test(help.text) && !help.isError, help.text.slice(0, 80));

const converted = await tool(tokens.access_token, 'tp_convert_markdown', {
  markdown: '# Hi\n\n<script>alert(1)</script>\n\n| a | b |\n| --- | --- |\n| 1 | 2 |',
});
check('convert renders a table', /<table>/.test(converted.text));
check('and drops the script', !/<script/.test(converted.text), converted.text.slice(0, 120));

const empty = await tool(tokens.access_token, 'tp_convert_markdown', { markdown: '   ' });
check('an empty conversion is refused in a sentence', empty.isError && /no Markdown/i.test(empty.text));

const saved = await tool(tokens.access_token, 'tp_save_document', {
  markdown: '# From an assistant\n\nHello.',
  name: 'mcp-e2e.md',
  share: 'link',
});
/*
 * A local checkout keeps a Vercel OIDC token that expires every few hours; without it the Blob
 * store refuses the write and nothing can be saved. That is this machine's credential, not this
 * code's behaviour, so what depends on it is skipped rather than failed — and named, so nobody
 * reads a green run as coverage it did not have.
 */
const blobless = /No blob credentials|BLOB_READ_WRITE_TOKEN/.test(saved.text);
const why = 'no Blob credentials here — run `vercel env pull .env.local`';

const savedId = (saved.text.match(/id ([0-9a-f-]{36})/) ?? [])[1];
const savedUrl = (saved.text.match(/https?:\/\/\S+\/s\/\S+/) ?? [])[0];

if (blobless) {
  for (const name of [
    'save returns an id',
    'and a share link',
    'which serves the document',
    'the list finds it and states what it showed',
    'get returns the source',
    'and the HTML',
  ]) {
    skip(name, why);
  }
} else {
check('save returns an id', Boolean(savedId), saved.text);
check('and a share link', Boolean(savedUrl), saved.text);

if (savedUrl) {
  const page = await fetch(savedUrl);
  const html = await page.text();

  check('which serves the document', page.ok && /From an assistant/.test(html));
}

const list = await tool(tokens.access_token, 'tp_list_documents', { query: 'mcp-e2e' });
check('the list finds it and states what it showed', /1 of 1 shown/.test(list.text), list.text.slice(0, 100));

const got = await tool(tokens.access_token, 'tp_get_document', { id: savedId });
check('get returns the source', /Hello\./.test(got.text));

const asHtml = await tool(tokens.access_token, 'tp_get_document', { id: savedId, as: 'html' });
check('and the HTML', /<h1/.test(asHtml.text));
}

const missing = await tool(tokens.access_token, 'tp_get_document', {
  id: '00000000-0000-0000-0000-000000000000',
});
check('a document that is not yours is simply not found', missing.isError, missing.text.slice(0, 80));

if (blobless) {
  skip('sharing can be revoked', why);
} else {
  const shared = await tool(tokens.access_token, 'tp_share_document', {
    id: savedId,
    mode: 'private',
  });
  check('sharing can be revoked', /private/.test(shared.text) && /no longer opens/.test(shared.text), shared.text);
}

const usage = await tool(tokens.access_token, 'tp_usage', {});
check('usage names both ceilings', /of 100.0 MB/.test(usage.text) && /of 500 documents/.test(usage.text), usage.text);

const unconfirmed = await tool(tokens.access_token, 'tp_delete_document', {
  id: savedId ?? '00000000-0000-0000-0000-000000000000',
  confirm: false,
});
check('a delete without confirmation refuses and says why', unconfirmed.isError && /confirm/.test(unconfirmed.text));

if (blobless) {
  skip('and with it, the document goes', why);
} else {
  const deleted = await tool(tokens.access_token, 'tp_delete_document', { id: savedId, confirm: true });
  check('and with it, the document goes', /Deleted/.test(deleted.text), deleted.text);
}

const nonsenseId = await tool(tokens.access_token, 'tp_get_document', { id: '../usage' });
check(
  'an id that is not an id is not found, rather than a crash',
  nonsenseId.isError,
  nonsenseId.text.slice(0, 80)
);

console.log('\n— the other sources');

const html = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: '<h1>Title</h1><p>A <a href="https://transformpipe.com">link</a>.</p>',
  from: 'html',
});
check(
  'HTML comes back as Markdown',
  /^# Title/m.test(html.text) && /\[link\]\(https:\/\/transformpipe\.com\)/.test(html.text),
  html.text.slice(0, 120)
);

const csv = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: 'name,role\nAda,engine\nGrace,compiler',
  from: 'csv',
});
check(
  'CSV comes back as a table',
  /\| name \| role \|/.test(csv.text) && /\| Ada \| engine \|/.test(csv.text),
  csv.text.slice(0, 120)
);

const tsv = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: 'name\trole\nAda\tengine',
  from: 'tsv',
});
check(
  'and a tab-separated one is not read as a single column',
  /\| name \| role \|/.test(tsv.text),
  tsv.text.slice(0, 120)
);

const json = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: '[{"name":"Ada","role":"engine"},{"name":"Grace","role":"compiler"}]',
  from: 'json',
  name: 'people.json',
});
check(
  'JSON of flat objects becomes a table',
  /\| Name \| Role \|/i.test(json.text) && /Ada/.test(json.text),
  json.text.slice(0, 160)
);

const brokenJson = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: '{"a": ',
  from: 'json',
});
check(
  'and broken JSON is refused with what the parser saw',
  brokenJson.isError && brokenJson.text.length > 10,
  brokenJson.text.slice(0, 120)
);

/* The three formats that are text, and so the three a tool can carry beyond the originals. */
const plain = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: 'Stars like *this* are not emphasis in a text file.',
  from: 'text',
});
check(
  'plain text is escaped rather than read as Markdown',
  plain.text.includes('\\*this\\*'),
  plain.text.slice(0, 120)
);

const rtf = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: '{\\rtf1\\ansi\\ansicpg1252 \\pard Plain and \\b bold\\b0 .\\par}',
  from: 'rtf',
});
check(
  'rich text keeps its emphasis',
  rtf.text.includes('**bold**'),
  rtf.text.slice(0, 160)
);

const enex = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source:
    '<en-export><note><title>A note</title><tag>work</tag>' +
    '<content><![CDATA[<en-note><div>Body text.</div></en-note>]]></content>' +
    '</note></en-export>',
  from: 'enex',
});
check(
  'an Evernote note keeps its title and its tags',
  /# A note/.test(enex.text) && /work/.test(enex.text) && /Body text/.test(enex.text),
  enex.text.slice(0, 160)
);

const asWord = await tool(tokens.access_token, 'tp_convert_to_markdown', {
  source: 'PK...',
  from: 'word',
});
/*
 * The accepted list grows — text, rtf and enex joined it — so testing for the words "html, csv,
 * tsv or json" meant this check would fail every time a format shipped, and the fix would have
 * been to make the sentence wrong again. What has to stay true is the second half of the name:
 * a file that is bytes is refused, and the refusal says where to take it.
 */
check(
  'a .docx is refused here, and the sentence says where it goes',
  asWord.isError &&
    /bytes rather than text/i.test(asWord.text) &&
    /\/api\/v1\/documents/.test(asWord.text),
  asWord.text.slice(0, 160)
);

/*
 * A .docx, built here rather than committed as a fixture: a Word file is a zip of XML, and forty
 * lines that write one are easier to read — and to trust — than a binary blob in the repository
 * nobody can diff. Stored, not deflated, so there is nothing to get wrong but the offsets.
 */
function docx(parts) {
  const files = [];
  const central = [];
  let offset = 0;

  for (const [name, text] of Object.entries(parts)) {
    const data = Buffer.from(text, 'utf8');
    const nameBytes = Buffer.from(name, 'utf8');
    const crc = zlib.crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);

    files.push(local, nameBytes, data);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBytes.length, 28);
    entry.writeUInt32LE(offset, 42);

    central.push(entry, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }

  const body = Buffer.concat([...files, ...central]);
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);

  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(parts).length, 8);
  end.writeUInt16LE(Object.keys(parts).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([body, end]);
}

const WORD = docx({
  '[Content_Types].xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>',
  '_rels/.rels':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>',
  'word/document.xml':
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>A Word heading</w:t></w:r></w:p>' +
    '<w:p><w:r><w:t>A sentence from a .docx.</w:t></w:r></w:p>' +
    '</w:body></w:document>',
});

const postWord = (body) =>
  fetch(`${HOST}/api/v1/documents?kind=word-to-markdown&name=probe.docx`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${tokens.access_token}`,
      'content-type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    body,
  });

const wordUp = await postWord(WORD);
const wordBody = await wordUp.json().catch(() => ({}));

if (wordUp.status === 502 && /store/i.test(wordBody.error ?? '')) {
  /*
   * The conversion is what this checks, and it happened: the request got as far as the Blob store
   * and failed there. Everything after the conversion needs this machine's credentials.
   */
  skip('a .docx posted to the API is converted and stored', why);
} else {
  check(
    'a .docx posted to the API is converted and stored',
    wordUp.status === 201,
    `${wordUp.status} ${JSON.stringify(wordBody).slice(0, 160)}`
  );
  check(
    'and it is recorded as the Word conversion',
    wordBody.document?.kind === 'word-to-markdown',
    JSON.stringify(wordBody.document ?? null).slice(0, 160)
  );

  if (wordBody.document?.id) {
    const back = await fetch(`${HOST}/api/v1/documents/${wordBody.document.id}`, {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });
    const got = await back.json().catch(() => ({}));

    check(
      'with the heading and the sentence in it',
      /# A Word heading/.test(got.document?.markdown ?? '') &&
        /A sentence from a \.docx\./.test(got.document?.markdown ?? ''),
      (got.document?.markdown ?? '').slice(0, 120)
    );

    await fetch(`${HOST}/api/v1/documents/${wordBody.document.id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });
  }
}

const notWord = await postWord(Buffer.from('this is not a zip at all'));
const notWordBody = await notWord.json().catch(() => ({}));
check(
  'and something that is not a .docx is refused in a sentence',
  notWord.status === 400 && /docx/i.test(notWordBody.error ?? ''),
  `${notWord.status} ${JSON.stringify(notWordBody).slice(0, 120)}`
);

console.log('\n— scope');

const readOnly = randomBytes(32).toString('base64url');

await sql`
  insert into m2h_oauth_token (token_hash, kind, client_id, user_id, scope, resource, expires_at)
  values (${hash(readOnly)}, 'access', ${client.client_id}, ${someone.user_id},
          'documents:read', ${`${HOST}/api/mcp`}, now() + interval '1 hour')
`;

const refusedWrite = await tool(readOnly, 'tp_save_document', { markdown: '# no' });
check('a read-only grant cannot save', refusedWrite.isError && /read-only/.test(refusedWrite.text), refusedWrite.text);

const allowedRead = await tool(readOnly, 'tp_list_documents', {});
check('but can still read', !allowedRead.isError);

console.log('\n— refresh and revocation');

const refreshed = await form({
  grant_type: 'refresh_token',
  refresh_token: tokens.refresh_token,
  client_id: client.client_id,
});
const rolled = await refreshed.json();

check('a refresh returns a new pair', refreshed.status === 200 && Boolean(rolled.access_token));

const reused = await form({
  grant_type: 'refresh_token',
  refresh_token: tokens.refresh_token,
  client_id: client.client_id,
});
check('and the old refresh token dies with it', reused.status === 400);

const revoke = await fetch(`${HOST}/api/oauth/revoke`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ token: rolled.access_token }),
});
check('revoke answers 200', revoke.status === 200);

const afterRevoke = await call(rolled.access_token, 'tools/list');
check('and the token stops working', afterRevoke.status === 401, `got ${afterRevoke.status}`);

const neverExisted = await fetch(`${HOST}/api/oauth/revoke`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ token: 'nonsense' }),
});
check('a token that never existed is answered the same way', neverExisted.status === 200);

console.log('\n— clearing up');

/*
 * Its own token: the section above deliberately revokes the one the rest of the run used, and a
 * test that reads a revoked credential proves nothing about the boundary it is checking.
 */
const stillGood = randomBytes(32).toString('base64url');

await sql`
  insert into m2h_oauth_token (token_hash, kind, client_id, user_id, scope, resource, expires_at)
  values (${hash(stillGood)}, 'access', ${client.client_id}, ${someone.user_id},
          'documents:read documents:write', ${`${HOST}/api/mcp`}, now() + interval '1 hour')
`;

const asApi = (path, init = {}, token = readOnly) =>
  fetch(`${HOST}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    redirect: 'manual',
  });

/*
 * Invariant 8, at the door the tools go through rather than at the tools. The read-only refusal
 * used to live only in the MCP dispatcher, which left the same token free to write straight at the
 * public API, so every one of these is checked where the write actually happens.
 */
const [mine] = await sql`
  select id from m2h_document where user_id = ${someone.user_id} limit 1
`;

if (mine) {
  const roShare = await asApi(`/api/v1/documents/${mine.id}/share`, {
    method: 'PUT',
    body: JSON.stringify({ mode: 'link' }),
  });
  check('a read-only token cannot share through the API', roShare.status === 403, `got ${roShare.status}`);

  const roDelete = await asApi(`/api/v1/documents/${mine.id}`, { method: 'DELETE' });
  check('nor delete', roDelete.status === 403, `got ${roDelete.status}`);

  const roRead = await asApi(`/api/v1/documents/${mine.id}`);

  if (blobless && roRead.status === 502) {
    skip('but reading is what it was granted', why);
  } else {
    check('but reading is what it was granted', roRead.status === 200, `got ${roRead.status}`);
  }
} else {
  skip('a read-only token cannot share through the API', 'no document on this account');
}

const roPost = await asApi('/api/v1/documents?name=no.md', {
  method: 'POST',
  headers: { 'content-type': 'text/markdown' },
  body: '# no',
});
check('nor save', roPost.status === 403, `got ${roPost.status}`);

/* Invariant 9: the account and its credentials are not reachable with a token of any kind. */
const keysWithToken = await asApi('/api/keys', {}, stillGood);
check('an OAuth token cannot list the API keys', keysWithToken.status === 401, `got ${keysWithToken.status}`);

const keysMint = await asApi('/api/keys', {
  method: 'POST',
  body: JSON.stringify({ name: 'minted by a token' }),
}, stillGood);
check('nor mint one', keysMint.status === 401, `got ${keysMint.status}`);

const grantsWithToken = await asApi('/api/oauth/grants', {}, stillGood);
check('nor read what else is connected', grantsWithToken.status === 401, `got ${grantsWithToken.status}`);

/* Invariant 1: consent belongs to a session, and a token is not one. */
const consentByToken = await fetch(`${HOST}/api/oauth/approve`, {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    origin: HOST,
    authorization: `Bearer ${stillGood}`,
  },
  body: new URLSearchParams({ pending: pendingId, decision: 'allow' }),
  redirect: 'manual',
});
check('a token cannot approve a connection', consentByToken.status === 401, `got ${consentByToken.status}`);

/* Invariant 2: somebody else's document, with a correct-looking id, is not found. */
const [stranger] = await sql`
  select id from m2h_document where user_id <> ${someone.user_id} limit 1
`;

if (stranger) {
  const theirs = await tool(stillGood, 'tp_get_document', { id: stranger.id });
  check("another account's document is not found, id or no id", theirs.isError, theirs.text.slice(0, 80));
} else {
  skip("another account's document is not found", 'only one account in this database');
}

/* The one place redirect_uri matching is relaxed, and it is relaxed only for loopback. */
const loopbackPort = await fetch(
  `${HOST}/api/oauth/authorize?${new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: 'http://localhost:57231/callback',
    response_type: 'code',
    code_challenge: 'x'.repeat(43),
    code_challenge_method: 'S256',
  })}`,
  { redirect: 'manual' }
);
check(
  'a loopback redirect_uri is accepted on any port',
  loopbackPort.status === 302 && (loopbackPort.headers.get('location') ?? '').includes('/?connect='),
  `${loopbackPort.status} ${loopbackPort.headers.get('location') ?? ''}`
);

const notLoopback = await fetch(
  `${HOST}/api/oauth/authorize?${new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: 'https://claude.ai:8443/api/mcp/auth_callback',
    response_type: 'code',
    code_challenge: 'x'.repeat(43),
    code_challenge_method: 'S256',
  })}`,
  { redirect: 'manual' }
);
check('but a public one is matched exactly, port and all', notLoopback.status === 400, `got ${notLoopback.status}`);

/* A forged forwarding header must not choose what the discovery documents say. */
/*
 * A connector is not a browser, and the Origin check added for cookie calls must not touch it.
 *
 * `cameFromUs` refuses a session-authenticated call that arrives with somebody else's Origin. A
 * bearer token is a different thing entirely — presented deliberately, by something that had to go
 * and fetch it — and an assistant calling from its own origin is the normal case, not an attack.
 * If this ever fails, the check has been written too wide.
 */
const fromElsewhere = await post(
  '/api/mcp',
  { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
  {
    authorization: `Bearer ${stillGood}`,
    origin: 'https://claude.ai',
    'sec-fetch-site': 'cross-site',
  }
);
const fromElsewhereBody = await fromElsewhere.json().catch(() => null);
check(
  'a bearer call from another origin still works',
  fromElsewhere.status === 200 && Array.isArray(fromElsewhereBody?.result?.tools),
  `got ${fromElsewhere.status}`
);

const forged = await fetch(`${HOST}/.well-known/oauth-authorization-server`, {
  headers: { 'x-forwarded-host': 'evil.test', 'x-forwarded-proto': 'https' },
});
const forgedBody = await forged.json();
check(
  'a forged x-forwarded-host does not become the issuer',
  !JSON.stringify(forgedBody).includes('evil.test'),
  forgedBody.issuer
);

/* A message with no id is a notification: no answer, and nothing run. */
const notification = await fetch(`${HOST}/api/mcp`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${stillGood}`,
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: 'tp_usage', arguments: {} },
  }),
});
const notificationBody = await notification.text();
check(
  'a call with no id is answered 202 and nothing else',
  notification.status === 202 && notificationBody === '',
  `${notification.status} ${notificationBody.slice(0, 60)}`
);

await sql`delete from m2h_oauth_token where client_id = ${client.client_id}`;
await sql`delete from m2h_oauth_code where client_id = ${client.client_id}`;
await sql`delete from m2h_oauth_pending where id = ${pendingId}`;
await sql`delete from m2h_oauth_client where id = ${client.client_id}`;
await sql`delete from m2h_document where name in ('mcp-e2e.md', 'no.md')`;

console.log(
  `
${passed} passed, ${failed} failed${skipped ? `, ${skipped} skipped` : ''}
`
);
process.exit(failed > 0 ? 1 : 0);
