import { Hono } from 'hono';
import type { Context } from 'hono';
import { htmlToMarkdown } from '../shared/from-html.js';
import { jsonToMarkdown } from '../shared/from-json.js';
import { delimitedToMarkdown } from '../shared/from-table.js';
import { conversion } from '../shared/conversions.js';
import { buildStandaloneHtml } from '../shared/markdown.js';
import { DOCS_SECTIONS } from '../src/lib/docs-sections.js';
import { FAQ_ENTRIES } from '../src/lib/faq.js';
import { MCP_TOOL_NAMES, type McpToolName } from '../src/lib/mcp-facts.js';
import { selfOrigin } from './auth.js';
import { type Caller, cameFromUs, mayWrite, resolveCaller } from './caller.js';
import { looksLikeId } from './db.js';
import { countCall, QUOTA, RATE } from './limits.js';
import { markdownToHtml } from './render.js';
import {
  ACCOUNT_CARD_HTML,
  ACCOUNT_CARD_URI,
  DELETE_CONFIRM_HTML,
  DELETE_CONFIRM_URI,
  DOCUMENT_CARD_HTML,
  DOCUMENT_CARD_URI,
  DOCUMENT_LIST_HTML,
  DOCUMENT_LIST_URI,
  FOLDER_CARD_HTML,
  FOLDER_CARD_URI,
  HELP_CARD_HTML,
  HELP_CARD_URI,
  unversioned,
} from './ui-card.js';
import { countServerEvent, INTERNAL_CALL_HEADER, INTERNAL_CALL_KEY, INTERNAL_KEY_HEADER } from './usage.js';
import v1 from './v1.js';

/*
 * TransformPipe as an MCP server, so a person can add it to an assistant and convert, save and share
 * documents from a conversation.
 *
 * Two decisions worth stating before the code.
 *
 * The transport is JSON-RPC over a single POST, with no event stream. Every tool here answers from
 * Postgres or Blob in well under a second, so the only thing a stream would buy is progress
 * reporting on work that finishes before it could be reported — and the specification is explicit
 * that answering GET with 405 is a conforming way to say "no stream here".
 *
 * The tools do not reimplement anything: each one calls this app's own public API in process, with
 * the caller's credential forwarded, so a chat and a script get the same answer from the same code.
 * A tool that queried the database directly would be a second implementation of "whose documents
 * are these", and that is the question you least want two answers to.
 */

/**
 * What `from` means to the API, which knows a conversion by the name on its own page.
 *
 * Word is absent on purpose. A .docx is a zip of XML and a tool's arguments are JSON, so the file
 * would have to travel as base64 through the conversation — which an assistant cannot
 * produce from an attachment it only ever sees as extracted text. Word converts in the app and at
 * the API, where a request body can be bytes.
 */
/*
 * The conversions a tool can carry, which is the ones whose source is text.
 *
 * An assistant hands over a string, so a `.docx`, an `.xlsx`, a `.pptx`, an `.epub`, an `.odt`
 * and the three export zips cannot come through here at all — they are bytes, and there is no
 * honest way to put bytes in a JSON argument. Those go to the app or to the API, and the tool
 * descriptions say so rather than failing at the far end.
 *
 * Rich text and an Evernote export are text, so they can: `.rtf` is control words in ASCII with
 * its own characters escaped, and `.enex` is XML.
 */
const SAVE_KINDS: Record<string, string> = {
  html: 'html-to-markdown',
  csv: 'csv-to-markdown',
  tsv: 'csv-to-markdown',
  json: 'json-to-markdown',
  text: 'text-to-markdown',
  rtf: 'rtf-to-markdown',
  enex: 'evernote-to-markdown',
};

/**
 * What to say when `from` names something a tool cannot carry.
 *
 * Both tools say it, and it has to do two things: name what is accepted, and say where the rest
 * goes. The second half is the one that matters — somebody whose `.docx` was refused needs the
 * next step, not a list they are not in.
 */
const UNSUPPORTED_FROM =
  '`from` must be one of ' +
  Object.keys(SAVE_KINDS).join(', ') +
  '. A .docx, .xlsx, .pptx, .epub, .odt or an export .zip is bytes rather than text and cannot ' +
  'come through a tool: convert it in the app, or POST the file to ' +
  '/api/v1/documents?kind=word-to-markdown and the rest.';

/** Versions this server will speak if a client asks for one of them. */
const SPOKEN = new Set(['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25']);
const NEWEST = '2025-11-25';
/*
 * The version, from the file every other part of the release reads.
 *
 * It was a literal here and said '1.0.0' while the repository was tagged v2.0.0. The fix that
 * looked obvious — importing `package.json` with a JSON attribute — took the whole API down on
 * Vercel with FUNCTION_INVOCATION_FAILED: the function bundle does not carry that file, and the
 * import throws at module load, which is every request. So the number lives in `shared/version.ts`,
 * a module like any other, and `npm run deploy:check` fails the build if it and `package.json`
 * disagree.
 */
import { VERSION } from '../shared/version.js';

const SERVER = { name: 'TransformPipe', version: VERSION };

/**
 * Who this server says it is, in the words a client can put on a screen.
 *
 * `name` is the identifier and was all there was; a directory listing and a connector picker show
 * a person a row, and a row with no icon and no sentence is the one nobody clicks. `title`,
 * `description`, `websiteUrl` and `icons` are the protocol's own fields for that — see the
 * Implementation object in the 2025-11-25 schema — and a client that predates them ignores what it
 * does not know.
 *
 * The addresses are built from the request rather than written down, because the spec asks a
 * client to check that an icon comes from the same origin as the server, and a hard-coded
 * production URL fails that check on every preview deployment.
 *
 * PNG first: a client that renders icons at all must handle PNG, and the SVG is last for the ones
 * that would rather scale it. All three are `brand/mark.svg` through `npm run icons`.
 */
const serverInfo = (c: Context) => {
  const origin = selfOrigin(c);

  return {
    ...SERVER,
    title: 'TransformPipe',
    description:
      'Convert documents to Markdown and back — Word, PowerPoint, spreadsheets, HTML, CSV and more — and keep, search and share them on your own TransformPipe account.',
    websiteUrl: origin,
    icons: [
      { src: `${origin}/icon-192.png`, mimeType: 'image/png', sizes: ['192x192'] },
      { src: `${origin}/icon-512.png`, mimeType: 'image/png', sizes: ['512x512'] },
      { src: `${origin}/favicon.svg`, mimeType: 'image/svg+xml', sizes: ['any'] },
    ],
  };
};

/** Long enough to be useful, short enough that a document does not eat a conversation. */
const MAX_TEXT = 40_000;

const INSTRUCTIONS = `These tools act on one person's TransformPipe account — the one that authorised this connector — and see nothing else.

Eight of them disclose, change what others read, or destroy, and each takes a \`confirm\` boolean that gates it. tp_save_document, tp_share_document and tp_share_folder require it whenever the chosen mode is "link", which publishes a page on the public web that anyone holding the URL can open, or "people", which emails a notice to each address new to the list — one already on it is not written to again; called without it, they return what would be disclosed and to whom, and change nothing. A shared folder discloses everything in it and in the folders under it, so tp_save_document and tp_move_documents also require it when the folder a document goes into is shared or sits inside one that is, and tp_update_folder when it moves a folder under a shared one. On tp_share_document and tp_share_folder, \`emails\` replaces the list, while \`add\` and \`remove\` change it by an address and leave the rest of it as it was. tp_update_document requires it when the document is already shared, because the new text is what everyone holding the link then reads. tp_delete_document requires it always and is permanent: there is no undo and no trash. tp_delete_folder requires it always too: without \`with_documents\` only the folder goes and what it held moves up a level; with it, every document under the folder is deleted the same permanent way. A mode of "private" discloses nothing and is not gated.

Every answer is also drawn for the person as a card — a document, a list, a conversion, a summary, a folder, the account, a share, a confirmation with its button, the documentation it came from. When a card is shown, what is on it has been said: do not repeat it in text, not as a list, a summary or a restatement of its numbers and names. Write only what the card does not say — the answer to the question that was asked, an observation drawn from what it shows, or the next step — and write nothing when the card already answers it. Only where no card can be shown does the text stand in for it, briefly.

To change a document the person already has — fix it, rewrite it, add to it — use tp_update_document, which keeps its link; tp_save_document makes a new document with a new link.

Documents can be filed in folders. Every tool that takes a \`folder\` takes its id or its path from the top — "Devart AI/Home", with \`/\` or \`›\` between the names — and tp_list_folders prints both. tp_create_folder makes one, tp_update_folder renames or moves one, tp_delete_folder deletes one, and tp_move_documents files documents in one.

tp_convert_markdown and tp_convert_to_markdown return the converted document through the conversation and are bounded at 40,000 characters; tp_save_document returns an id, a size and — when shared — a URL instead.

tp_help returns TransformPipe's own documentation as text: the Markdown it understands, what happens to a file, what is stored, how sharing works, the limits and the HTTP API.`;

interface Rpc {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

type Id = string | number | null;

const rpc = (id: Id, result: unknown) => ({ jsonrpc: '2.0', id: id ?? null, result });

const rpcError = (id: Id, code: number, message: string) => ({
  jsonrpc: '2.0',
  id: id ?? null,
  error: { code, message },
});

/** A tool answers in sentences a person could read, whether it worked or not. */
const say = (text: string, isError = false) => ({
  content: [{ type: 'text', text }],
  isError,
});

/**
 * The same answer, with the data a card is drawn from beside it.
 *
 * `structuredContent` is for the view and is not added to the model's context, which is the point:
 * the sentence stays short and the card gets the fields — see `ui-card.ts` for what it reads.
 */
/**
 * A document as the card needs it: what it is, where it opens, and the first of what is in it.
 *
 * The address is the app's own — a conversion's page with `?doc=`, which is how a document is
 * opened everywhere else — built from the request rather than written down, so a preview
 * deployment's card opens that deployment.
 */
const forCard = (
  c: Context,
  document: {
    id: string;
    name: string;
    kind: string;
    size: number;
    words?: number;
    created_at?: string;
    share?: { mode?: string; url?: string | null; expires_at?: string | null };
  },
  markdown = ''
) => ({
  id: document.id,
  name: document.name,
  size: document.size,
  words: document.words ?? 0,
  headings: (markdown.match(/^#{1,6} /gm) ?? []).length,
  tables: (markdown.match(/^\|/gm) ?? []).length ? 1 : 0,
  created: document.created_at ?? '',
  share: document.share?.mode ?? 'private',
  shareUrl: document.share?.url ?? '',
  shareExpires: document.share?.expires_at ?? '',
  url: `${selfOrigin(c)}${conversion(document.kind).path}?doc=${document.id}`,
  /* A glance, not the document: the card fades it out and the model already has the whole thing. */
  excerpt: markdown.slice(0, 600),
});

/**
 * A conversion that was not saved, as the card needs it.
 *
 * No id and no address, so the view draws no buttons — there is nothing to open yet. What it does
 * have is the shape of the thing: a name, what it weighs, and the first of it, which is what
 * somebody is checking when they ask for a conversion in a chat.
 */
const forConversion = (name: string, markdown: string) => ({
  name,
  size: new TextEncoder().encode(markdown).length,
  words: markdown.split(/\s+/).filter(Boolean).length,
  headings: (markdown.match(/^#{1,6} /gm) ?? []).length,
  tables: (markdown.match(/^\|/gm) ?? []).length ? 1 : 0,
  excerpt: markdown.slice(0, 600),
});

/*
 * Said in the answer itself and not only in INSTRUCTIONS: the card's text is what the model reads
 * after every call, and the instructions are read once, if the host passes them on at all. Without
 * it the person saw each answer twice — the card, and under it the same list in sentences.
 */
const CARD_NOTE =
  '\n\n(Shown to the person as a card with all of the above. Do not repeat it; add only what the card does not say, or nothing. If no card can be shown here, say it briefly instead.)';

/*
 * For the cards that show only the start of what the text carries — a conversion's first lines,
 * the documentation's section titles. "Do not repeat it" there would keep back the HTML somebody
 * asked for; what is on the card still is not said twice.
 */
const PARTIAL_CARD_NOTE =
  '\n\n(The person sees a card with the name, the numbers and the first lines only. Give them the part they asked for — the converted text when they asked for it, the answer to their question — and do not restate what the card shows.)';

const card = (text: string, data: Record<string, unknown>, note = CARD_NOTE) => ({
  content: [{ type: 'text', text: text + note }],
  structuredContent: data,
  isError: false,
});

/*
 * A gated call, refused, with what the card needs to make it anyway.
 *
 * The delete card has always had its button; publishing, sharing with people and changing a page
 * other people read are the same kind of decision and ended in a sentence the model had to relay.
 * Now the refusal carries the call it refused, and the card offers it back as a button: the
 * person agrees to the thing on the screen, and the call that runs is exactly the one that was
 * refused, with `confirm: true` added. A text too long to carry back through the view gets no
 * button — the sentence still says what to do.
 */
const CONFIRM_TEXT_LIMIT = 200_000;

const refusedCard = (
  text: string,
  data: Record<string, unknown>,
  confirm: { tool: string; args: Record<string, unknown>; label: string; note: string }
) => {
  const markdown = confirm.args.markdown;
  const carried = typeof markdown !== 'string' || markdown.length <= CONFIRM_TEXT_LIMIT;

  return {
    content: [
      {
        type: 'text',
        text: carried
          ? `${text}\n\n(The card shows the person what would happen, with a button to go ahead. Do not repeat it; one line asking them to decide is enough.)`
          : text,
      },
    ],
    structuredContent: carried ? { ...data, confirm } : { ...data, confirmNote: confirm.note },
    isError: true,
  };
};

/*
 * What an update changed, line by line — for the card, not the model.
 *
 * The model has both texts and says what changed in the person's words; the card shows the lines
 * themselves, the way a reviewer would look. Common head and tail are trimmed first, so a fix in a
 * long document compares a few lines rather than all of them, and a change too large to compare
 * cheaply is counted and not drawn. Runs of unchanged lines inside the change fold to one "…".
 */
type DiffLine = { t: '+' | '-' | ' ' | '…'; s: string };

const DIFF_LINES = 40;

function lineDiff(before: string, after: string) {
  const a = before.split('\n');
  const b = after.split('\n');
  let start = 0;

  while (start < a.length && start < b.length && a[start] === b[start]) start++;

  let endA = a.length;
  let endB = b.length;

  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const x = a.slice(start, endA);
  const y = b.slice(start, endB);

  if (x.length * y.length > 4_000_000) {
    return { added: y.length, removed: x.length, lines: [] as DiffLine[] };
  }

  const width = y.length + 1;
  const table = new Uint32Array((x.length + 1) * width);

  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      table[i * width + j] =
        x[i] === y[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }

  const middle: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < x.length || j < y.length) {
    if (i < x.length && j < y.length && x[i] === y[j]) {
      middle.push({ t: ' ', s: x[i] });
      i++;
      j++;
    } else if (i < x.length && (j >= y.length || table[(i + 1) * width + j] >= table[i * width + j + 1])) {
      // The line that went before the line that replaced it, the way a reviewer reads a change.
      middle.push({ t: '-', s: x[i] });
      i++;
    } else {
      middle.push({ t: '+', s: y[j] });
      j++;
    }
  }

  const added = middle.filter((line) => line.t === '+').length;
  const removed = middle.filter((line) => line.t === '-').length;

  /* One line of context either side, and unchanged runs longer than two folded. */
  const lines: DiffLine[] = [];

  if (start > 0) lines.push({ t: ' ', s: a[start - 1] });

  for (let k = 0; k < middle.length; k++) {
    const line = middle[k];

    if (line.t === ' ') {
      let run = k;
      while (run < middle.length && middle[run].t === ' ') run++;
      if (run - k > 2) {
        lines.push(middle[k], { t: '…', s: '' }, middle[run - 1]);
        k = run - 1;
        continue;
      }
    }

    lines.push(line);
  }

  if (endA < a.length) lines.push({ t: ' ', s: a[endA] });

  const shown = lines
    .filter((line, index) => !(line.t !== '…' && !line.s.trim() && (index === 0 || index === lines.length - 1)))
    .map((line) => ({ t: line.t, s: line.s.length > 240 ? `${line.s.slice(0, 240)}…` : line.s }));

  return {
    added,
    removed,
    lines: shown.length > DIFF_LINES ? [...shown.slice(0, DIFF_LINES), { t: '…' as const, s: '' }] : shown,
  };
}

/** Who a document shared with people is shared with — the list the share tool now edits. */
async function readersOf(c: Context, id: string): Promise<string[]> {
  const got = await callApi(c, `/api/v1/documents/${segment(id)}/share`);

  return got.status === 200 && Array.isArray(got.body?.emails) ? (got.body.emails as string[]) : [];
}

/** Says what it dropped. Silent truncation reads as completeness, which is worse than a gap. */
function clip(text: string, limit = MAX_TEXT): string {
  if (text.length <= limit) {
    return text;
  }

  const dropped = text.length - limit;

  return `${text.slice(0, limit)}\n\n[…${dropped.toLocaleString('en-GB')} further characters not shown. Save it with tp_save_document and share the link instead — that returns a URL rather than the whole document.]`;
}

/*
 * CORS for this endpoint only, and with no credentials.
 *
 * `Access-Control-Allow-Credentials` is set nowhere on purpose: the app is same-origin with its own
 * API, so nothing legitimate needs a cookie to travel cross-origin, and a reflected origin plus
 * credentials is how a site you have never visited comes to read your documents with your own
 * cookie. Origin is not validated either — the specification says to reject an origin that is
 * present and disallowed, and over-strict checking here is a documented cause of connectors that
 * cannot complete a handshake.
 */
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type, mcp-protocol-version',
  'access-control-expose-headers': 'mcp-session-id, www-authenticate',
  'access-control-max-age': '86400',
};

const mcp = new Hono().basePath('/api/mcp');

mcp.options('/', (c) => c.body(null, 204, CORS));

/**
 * A 401 the client can act on.
 *
 * The status is the protocol signal: a 200 carrying an error, however well worded, is read as a
 * tool that failed and never starts a sign-in. The header names the document that says where to
 * sign in, and the body is for whoever is reading a log.
 */
function unauthorised(c: Context, why: string) {
  const origin = selfOrigin(c);

  c.header(
    'www-authenticate',
    `Bearer error="invalid_token", error_description="${why}", ` +
      `resource_metadata="${origin}/.well-known/oauth-protected-resource/api/mcp", ` +
      'scope="documents:read documents:write"'
  );

  for (const [key, value] of Object.entries(CORS)) {
    c.header(key, value);
  }

  return c.json(
    {
      error: 'invalid_token',
      error_description: why,
      resource: `${origin}/api/mcp`,
      hint: `Add ${origin}/api/mcp to your assistant and sign in with your TransformPipe account.`,
    },
    401
  );
}

/*
 * Anything that is not a POST.
 *
 * A person who pastes the URL into a browser lands here, so it says what the endpoint is rather
 * than only refusing. 405 with `Allow` is also how the protocol expects a server with no event
 * stream to answer a GET.
 */
const notPost = (c: Context) =>
  c.json(
    {
      name: SERVER.name,
      version: SERVER.version,
      protocol: 'MCP over HTTP POST, JSON-RPC 2.0',
      auth: 'Add this URL to your assistant as a connector and sign in with your TransformPipe account.',
      documentation: `${selfOrigin(c)}/docs`,
    },
    405,
    { ...CORS, allow: 'POST, OPTIONS' }
  );

mcp.get('/', notPost);
mcp.delete('/', notPost);

/* ---------------------------------------------------------------- the tools */

/**
 * What a client may say about a tool before it runs one.
 *
 * `title` is the name a person reads in a list of permissions; the hints are the protocol's own
 * three questions — does it change anything, does it destroy anything, does it reach outside this
 * account. A client uses them to decide what to confirm, and the directory's review asks for them,
 * which is fair: "tp_delete_document" and "tp_usage" look identical to a reader who has only the
 * names.
 *
 * All three review hints are explicit. Save and share can publish or email a document; share can
 * revoke access, so their risk hints cover those modes even when a private save is harmless.
 */
interface ToolAnnotations {
  title: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint?: boolean;
  openWorldHint: boolean;
}

interface Tool {
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: ToolAnnotations;
  /**
   * The `ui://` resource a host may draw beside this tool's answer — MCP Apps, SEP-1865.
   *
   * On every tool now — a document, a list, the account, a folder, the documentation — and only
   * ever as an addition: the `content` a model reads is the same with or without it, so a host
   * that draws nothing loses nothing.
   */
  ui?: string;
  /** Set on anything that writes, so a read-only grant is refused before it runs. */
  writes?: boolean;
  run: (
    c: Context,
    args: Record<string, unknown>,
    caller: Caller
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError: boolean }>;
}

/** An id is one path segment and nothing else: a `?` or a `..` in it must not choose the route. */
const segment = (value: unknown) => encodeURIComponent(String(value ?? ''));

/**
 * Calls this app's own API in process.
 *
 * The credential and the forwarding headers travel with it, so the API resolves the same caller it
 * would over the wire and `selfOrigin` still builds https share links behind the platform's proxy.
 */
async function callApi(
  c: Context,
  path: string,
  init: RequestInit = {}
): Promise<{ status: number; body: any }> {
  const headers = new Headers(init.headers);

  for (const name of [
    'authorization',
    'cookie',
    'host',
    'x-forwarded-proto',
    'x-forwarded-host',
  ]) {
    const value = c.req.header(name);

    if (value) {
      headers.set(name, value);
    }
  }

  /* The tool call is what gets counted, not the API requests it makes — see server/usage.ts. */
  headers.set(INTERNAL_CALL_HEADER, '1');
  headers.set(INTERNAL_KEY_HEADER, INTERNAL_CALL_KEY);

  const response = await v1.fetch(
    new Request(`${selfOrigin(c)}${path}`, { ...init, headers })
  );

  const text = await response.text();

  try {
    return { status: response.status, body: text ? JSON.parse(text) : null };
  } catch {
    return { status: response.status, body: { error: text.slice(0, 200) } };
  }
}

const bytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} kB`
      : `${(n / 1024 / 1024).toFixed(1)} MB`;

/**
 * When a link ends, as a line an assistant can repeat — or nothing, for a link with no end.
 * Read-only on purpose: an assistant can say when a link stops working, and only the owner sets it.
 */
const linkEnds = (expiresAt: string | null | undefined) => {
  if (!expiresAt) {
    return null;
  }

  const at = new Date(expiresAt);
  const written = `${at.toISOString().slice(0, 16).replace('T', ' ')} UTC`;

  return at.getTime() <= Date.now()
    ? `The link stopped working on ${written}; it opens for nobody until the owner sets a new end.`
    : `The link stops working on ${written}.`;
};

/*
 * Said, never set: a password typed into a conversation is a password in its transcript, so no tool
 * takes one — the owner sets it in the Share dialog — and none can remove it either. A share an
 * assistant changes keeps the password it had.
 */
const LOCKED = 'The link asks for a password, which the owner sets and only they can change.';

/** How often a link was opened, as a line — opens, not people, and the owner's own among them. */
const linkOpens = (views: number | undefined, lastViewedAt: string | null | undefined) =>
  !views || !lastViewedAt
    ? 'Nobody has opened the link yet.'
    : `Opened ${views === 1 ? 'once' : `${views} times`}, last on ${new Date(lastViewedAt)
        .toISOString()
        .slice(0, 10)}.`;

const describe = (
  document: {
    id: string;
    name: string;
    /* Which conversion made it: the row's address on the site is that conversion's page. */
    kind: string;
    size: number;
    words?: number;
    created_at: string;
    share: {
      mode: string;
      url: string | null;
      expires_at?: string | null;
      views?: number;
      last_viewed_at?: string | null;
      has_password?: boolean;
    };
    folder_id?: string | null;
  },
  /* Where it is filed, as `pathOf` prints it — or nothing, for a document filed nowhere. */
  folder = ''
) =>
  [
    `${document.name}`,
    `  id: ${document.id}`,
    folder ? `  in ${folder}` : null,
    `  ${bytes(document.size)}${document.words ? ` · ${document.words} words` : ''} · ${new Date(
      document.created_at
    ).toISOString().slice(0, 10)} · ${document.share.mode}`,
    document.share.url ? `  ${document.share.url}` : null,
    document.share.url && linkEnds(document.share.expires_at)
      ? `  ${linkEnds(document.share.expires_at)}`
      : null,
    document.share.url
      ? `  ${linkOpens(document.share.views, document.share.last_viewed_at)}`
      : null,
    document.share.url && document.share.has_password ? `  ${LOCKED}` : null,
  ]
    .filter(Boolean)
    .join('\n');

/* ---------------------------------------------------------------- folders */

/*
 * Folders, as a tool takes them: by id, or by the path a person would say.
 *
 * Nobody says an id. They say "put it in Devart AI, under Home", so every folder argument takes
 * either: an id as tp_list_folders prints it, or names from the top separated by `/` or `›` — the
 * second because that is how the tools print a path, and a path printed by one tool should be one
 * the next tool takes back. Names are matched without regard to case; nobody remembers whether it
 * was "Home" or "home", and an account with both is one where the tool asks rather than guesses.
 *
 * A path that does not start at the top is accepted when it names exactly one folder. "Guides" is
 * enough while the account has one Guides, and a question the moment it has two — a document filed
 * in the wrong one of two folders with the same name is found by nobody.
 *
 * One GET of every folder answers all of it. An account's folders are rows in the hundreds at
 * most, and walking them here is cheaper and simpler than a route per question.
 */
interface Folder {
  id: string;
  parent_id: string | null;
  name: string;
  share_token?: string | null;
  share_mode?: 'private' | 'link' | 'people' | null;
  /* Directly in this folder, not under it — `inside` adds the folders below. */
  documents: number;
}

async function foldersOf(c: Context): Promise<{ ok: true; folders: Folder[] } | { ok: false; error: string }> {
  const got = await callApi(c, '/api/v1/folders');

  return got.status === 200 && Array.isArray(got.body?.folders)
    ? { ok: true, folders: got.body.folders as Folder[] }
    : { ok: false, error: got.body?.error ?? `Could not read the folders (${got.status}).` };
}

/** "Devart AI › Home › Guides" — how every tool prints a folder, and a path every tool takes back. */
function pathOf(folders: Folder[], id: string | null | undefined): string {
  const names: string[] = [];
  const seen = new Set<string>();
  let at = id ? folders.find((one) => one.id === id) : undefined;

  // The API refuses a folder inside itself; the guard is for a list read half way through a move.
  while (at && !seen.has(at.id)) {
    seen.add(at.id);
    names.unshift(at.name);
    at = at.parent_id ? folders.find((one) => one.id === at!.parent_id) : undefined;
  }

  return names.join(' › ');
}

/** Every folder from this one down, itself first. */
function below(folders: Folder[], id: string): Folder[] {
  const found: Folder[] = [];
  const queue = folders.filter((one) => one.id === id);

  while (queue.length > 0) {
    const one = queue.shift()!;

    if (found.includes(one)) continue;
    found.push(one);
    queue.push(...folders.filter((child) => child.parent_id === one.id));
  }

  return found;
}

/** Documents in a folder and every folder under it — what the folder shows in the app. */
const inside = (folders: Folder[], id: string) =>
  below(folders, id).reduce((sum, one) => sum + (one.documents ?? 0), 0);

/*
 * The folder a document here would be read through: this one if it is shared, else the nearest
 * one above it that is. A shared folder's page shows everything under it, so a document filed three
 * levels down in a shared space is as public as one filed at its top.
 */
function sharedThrough(folders: Folder[], id: string | null | undefined): Folder | null {
  const seen = new Set<string>();
  let at = id ? folders.find((one) => one.id === id) : undefined;

  while (at && !seen.has(at.id)) {
    if (at.share_mode === 'link' || at.share_mode === 'people') return at;
    seen.add(at.id);
    at = at.parent_id ? folders.find((one) => one.id === at!.parent_id) : undefined;
  }

  return null;
}

const folderUrl = (c: Context, folder: Folder) =>
  folder.share_token ? `${selfOrigin(c)}/f/${folder.share_token}` : null;

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Names, each a child of the one before, starting under `from` — null is the top. */
function walk(folders: Folder[], names: string[], from: string | null): Folder[] {
  let parents: Array<string | null> = [from];
  let found: Folder[] = [];

  for (const name of names) {
    found = folders.filter((one) => parents.includes(one.parent_id) && sameName(one.name, name));
    parents = found.map((one) => one.id);

    if (found.length === 0) break;
  }

  return found;
}

/** Folders whose path ends in these names, wherever it starts. */
const endingIn = (folders: Folder[], names: string[]) =>
  folders.filter((one) => {
    let at: Folder | undefined = one;

    for (let index = names.length - 1; index >= 0; index--) {
      if (!at || !sameName(at.name, names[index])) return false;
      at = at.parent_id ? folders.find((parent) => parent.id === at!.parent_id) : undefined;
    }

    return true;
  });

/*
 * What a folder argument means, before anything is made: the folder, or — for a path that runs
 * past what exists — the deepest folder on it that does, and the names still to make under it.
 *
 * Split from the making so a caller can look before it writes. tp_save_document needs to know
 * whether the folder sits inside a shared one before it creates a single folder: a save that is
 * then refused for want of `confirm` should leave nothing behind, not an empty folder per attempt.
 */
type FolderPlan =
  | { ok: true; folder: Folder | null; parent: Folder | null; missing: string[] }
  | { ok: false; error: string };

function planFolder(
  folders: Folder[],
  value: unknown,
  { create = false, base }: { create?: boolean; base?: Folder | null } = {}
): FolderPlan {
  const text = typeof value === 'string' ? value.trim() : '';

  if (!text) return { ok: true, folder: null, parent: null, missing: [] };

  if (base === undefined) {
    const byId = folders.find((one) => one.id === text);

    if (byId) return { ok: true, folder: byId, parent: null, missing: [] };

    if (looksLikeId(text)) {
      return { ok: false, error: `No folder on this account has the id ${text}. tp_list_folders lists them.` };
    }
  }

  /* Under `base` when one is given; otherwise from the top, and failing that from anywhere. */
  const look = (names: string[]) => {
    if (base !== undefined) return walk(folders, names, base?.id ?? null);

    const anchored = walk(folders, names, null);

    return anchored.length > 0 ? anchored : endingIn(folders, names);
  };
  const ambiguous = (named: string, found: Folder[]): FolderPlan => ({
    ok: false,
    error: `"${named}" could be any of ${found.length} folders — ${found
      .map((one) => `${pathOf(folders, one.id)} (id ${one.id})`)
      .join(', ')}. Give the whole path from the top, or the id.`,
  });

  const names = text.split(/[/›]/).map((name) => name.trim()).filter(Boolean);

  if (names.length === 0) return { ok: false, error: `"${text}" has separators in it and no folder name.` };

  let found = look(names);

  // A name with a slash in it — an imported page called "Q3/Q4" — is a name, not a path.
  if (found.length === 0 && names.length > 1) found = look([text]);
  if (found.length === 1) return { ok: true, folder: found[0], parent: null, missing: [] };
  if (found.length > 1) return ambiguous(text, found);

  if (!create) {
    return {
      ok: false,
      error: `There is no folder "${text}" on this account. tp_list_folders lists them, and tp_create_folder makes one.`,
    };
  }

  /* The longest part of the path that exists, and the names after it to make. */
  for (let length = names.length - 1; length > 0; length--) {
    const head = look(names.slice(0, length));

    if (head.length > 1) return ambiguous(names.slice(0, length).join(' › '), head);
    if (head.length === 1) return { ok: true, folder: null, parent: head[0], missing: names.slice(length) };
  }

  return { ok: true, folder: null, parent: base ?? null, missing: names };
}

/** The folders a plan says are missing, made in order; `folders` gains each one as it is made. */
async function makeFolders(
  c: Context,
  folders: Folder[],
  plan: Extract<FolderPlan, { ok: true }>
): Promise<{ ok: true; folder: Folder | null; created: Folder[] } | { ok: false; error: string }> {
  let parent = plan.parent;
  const created: Folder[] = [];

  if (plan.folder || plan.missing.length === 0) return { ok: true, folder: plan.folder, created };

  for (const name of plan.missing) {
    const made = await callApi(c, '/api/v1/folders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, parent_id: parent?.id ?? null }),
    });

    if (made.status !== 201) {
      return {
        ok: false,
        error: `${made.body?.error ?? `The folder "${name}" was not made (${made.status}).`}${
          created.length ? ` Made before that: ${pathOf(folders, created.at(-1)!.id)}.` : ''
        }`,
      };
    }

    // The share columns are not in the answer; a folder made a moment ago is shared with nobody.
    parent = { ...(made.body.folder as Folder), share_mode: 'private', share_token: null, documents: 0 };
    folders.push(parent);
    created.push(parent);
  }

  return { ok: true, folder: parent, created };
}

/**
 * A folder argument, resolved: the one helper every folder-taking tool goes through, so "Devart
 * AI/Home" means the same folder to all of them. With `create`, the missing end of a path is made.
 */
async function resolveFolder(
  c: Context,
  value: unknown,
  options: { create?: boolean; base?: Folder | null; folders?: Folder[] } = {}
): Promise<
  | { ok: true; folder: Folder | null; path: string; created: Folder[]; folders: Folder[] }
  | { ok: false; error: string }
> {
  let folders = options.folders;

  if (!folders) {
    const read = await foldersOf(c);

    if (!read.ok) return read;
    folders = read.folders;
  }

  const plan = planFolder(folders, value, options);

  if (!plan.ok) return plan;

  const made = await makeFolders(c, folders, plan);

  if (!made.ok) return made;

  return { ...made, path: made.folder ? pathOf(folders, made.folder.id) : '', folders };
}

/*
 * One folder as the folder card draws it — see FOLDER_CARD_HTML for what it reads. `extra` is what
 * the call did: `did`, the documents `moved`, the folders `created`, a share's readers and opens.
 *
 * The folder opens where the app shows it, `/history?folder=`, the address a saved copy of a
 * shared folder already sends people to; a folder shared through one above it names that one, since
 * its page is the one people read.
 */
const forFolder = (c: Context, folders: Folder[], folder: Folder, extra: Record<string, unknown> = {}) => {
  const through = sharedThrough(folders, folder.id);
  const own = folder.share_mode === 'link' || folder.share_mode === 'people';

  return {
    id: folder.id,
    name: folder.name,
    path: pathOf(folders, folder.id),
    total: inside(folders, folder.id),
    share: own ? folder.share_mode : 'private',
    shareUrl: own ? (folderUrl(c, folder) ?? '') : '',
    through:
      through && through.id !== folder.id
        ? { path: pathOf(folders, through.id), share: through.share_mode, url: folderUrl(c, through) ?? '' }
        : null,
    open: `${selfOrigin(c)}/history?folder=${encodeURIComponent(folder.id)}`,
    ...extra,
  };
};

/** "Devart AI, which is shared by link — …" — names the folder and who reads it, so a person knows what they agree to. */
const throughWords = (folders: Folder[], folder: Folder) =>
  `${pathOf(folders, folder.id)}, which is shared ${
    folder.share_mode === 'link' ? 'by link — anyone holding its URL can read what is in it' : 'with named people, who can read what is in it'
  }`;

/*
 * Keyed by name, and the names come from the module the documentation page reads. TypeScript then
 * insists the two agree: a tool renamed here and not there stops the build, which is the only way a
 * page describing a tool cannot outlive the tool.
 */
const TOOLS: Record<McpToolName, Tool> = {
  tp_help: {
    description:
      'Returns TransformPipe\'s own documentation as text: what Markdown it understands, what happens to a file, what is stored and what is not, how sharing works, the limits, and the HTTP API. It is the authoritative description of this service\'s behaviour, kept in step with the running version. With `question`, returns the sections matching it; with no arguments, returns all of them.',
    ui: HELP_CARD_URI,
    annotations: { title: 'TransformPipe documentation', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        question: {
          type: 'string',
          description: 'What you want to know. Matched against the documentation.',
        },
      },
    },
    run: async (c, args) => {
      const question = String(args.question ?? '')
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);

      const score = (text: string) =>
        question.filter((word) => text.toLowerCase().includes(word)).length;

      /* Each with the place on the docs page it comes from, which is where the card's rows open. */
      const docs = `${selfOrigin(c)}/docs`;
      const sections = DOCS_SECTIONS.map((section) => ({
        title: section.title,
        text: section.summary,
        hits: score(`${section.title} ${section.summary}`),
        url: `${docs}#${section.id}`,
      }));

      const questions = FAQ_ENTRIES.map((entry) => ({
        title: entry.question,
        text: entry.answer,
        hits: score(`${entry.question} ${entry.answer}`),
        url: `${docs}#faq`,
      }));

      const all = [...sections, ...questions];
      const hit = all.filter((entry) => entry.hits > 0);
      const shown = (question.length > 0 && hit.length > 0 ? hit : all).sort(
        (a, b) => b.hits - a.hits
      );

      const topic = String(args.question ?? '').trim();
      const matched = question.length > 0 && hit.length > 0;

      return card(
        clip(
          [
            `TransformPipe — ${selfOrigin(c)} · full documentation at ${selfOrigin(c)}/docs`,
            '',
            ...shown.map((entry) => `## ${entry.title}\n${entry.text}`),
          ].join('\n')
        ),
        {
          topic,
          sections: shown.slice(0, 40).map(({ title, url }) => ({ title, url })),
          /* The best match's own place when there was a question that matched; the page's top otherwise. */
          open: matched ? shown[0].url : docs,
        }, PARTIAL_CARD_NOTE);
    },
  },

  tp_convert_markdown: {
    description:
      'Convert Markdown to sanitised HTML and return it — or, with `to`, to Confluence storage format, Jira wiki markup or Slack mrkdwn, for pasting into those or sending through their APIs. GitHub Flavored Markdown; raw HTML in the source goes through a sanitiser, so a script tag in a file someone sent cannot survive. `standalone: true` returns a complete self-contained HTML document with its styles inlined — the same file the app downloads. Nothing is saved to the account. For anything long, prefer tp_save_document and share the link: what this returns has to travel back through the conversation.',
    ui: DOCUMENT_CARD_URI,
    annotations: { title: 'Markdown to HTML', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['markdown'],
      properties: {
        markdown: { type: 'string', description: 'The Markdown source.' },
        to: {
          type: 'string',
          enum: ['html', 'confluence', 'jira', 'slack'],
          description:
            'What to convert to. `confluence` is storage format (code macros, info and warning panels, task lists), `jira` is wiki markup, `slack` is mrkdwn for a bot, a webhook or chat.postMessage. Default html.',
        },
        standalone: {
          type: 'boolean',
          description:
            'A whole HTML document with inline styles, rather than the body fragment. Default false.',
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark'],
          description: 'Palette for a standalone document. Default light.',
        },
        name: {
          type: 'string',
          description: 'Title for a standalone document. Default "document".',
        },
      },
    },
    run: async (_c, args) => {
      const markdown = String(args.markdown ?? '');

      if (!markdown.trim()) {
        return say('There is no Markdown to convert.', true);
      }

      if (markdown.length > QUOTA.documentBytes) {
        return say(
          `That is ${bytes(markdown.length)} of Markdown; the limit for one document is ${bytes(QUOTA.documentBytes)}.`,
          true
        );
      }

      /*
       * The model gets the whole output, which it hands on; the card gets what it became and the
       * first of it — the counts are the Markdown's, since words and headings are what went in, and
       * the size is the output's, since that is what comes out. No id, so no buttons.
       */
      const base = String(args.name ?? 'document').replace(/\.[^.]+$/, '') || 'document';
      const converted = (output: string, format: string, extension: string) =>
        card(clip(output), {
          ...forConversion(`${base}.${extension}`, markdown),
          size: new TextEncoder().encode(output).length,
          excerpt: output.slice(0, 600),
          format,
        }, PARTIAL_CARD_NOTE);

      /*
       * Markdown going out as somebody else's markup: the same writers the app's Confluence, Jira
       * and Slack screens use, loaded only when asked for.
       */
      if (args.to === 'confluence') {
        return converted((await import('../shared/to-confluence.js')).markdownToConfluence(markdown), 'Confluence storage format', 'xml');
      }

      if (args.to === 'jira') {
        return converted((await import('../shared/to-jira.js')).markdownToJira(markdown), 'Jira wiki markup', 'txt');
      }

      if (args.to === 'slack') {
        return converted((await import('../shared/to-slack.js')).markdownToSlack(markdown), 'Slack mrkdwn', 'txt');
      }

      const body = markdownToHtml(markdown);

      if (!args.standalone) {
        return converted(body, 'HTML', 'html');
      }

      return converted(
        buildStandaloneHtml({
          title: String(args.name ?? 'document'),
          body,
          createdAt: Date.now(),
          theme: args.theme === 'dark' ? 'dark' : 'light',
        }),
        'standalone HTML',
        'html'
      );
    },
  },

  tp_convert_to_markdown: {
    description:
      'Convert HTML, CSV, TSV, JSON, plain text, rich text (.rtf) or an Evernote export (.enex) to Markdown and return it. `from` says which. Nothing is saved to the account; to keep the result, pass the same source and `from` to tp_save_document, which stores it and records what it was made from. A file that is bytes rather than text cannot come through a tool — a .docx, .xlsx, .pptx, .epub, .odt or an export .zip is an archive — so those convert in the app, or by POSTing the file to /api/v1/documents?kind=word-to-markdown and the rest.',
    ui: DOCUMENT_CARD_URI,
    annotations: { title: 'Convert to Markdown', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['source', 'from'],
      properties: {
        source: { type: 'string', description: 'The file, as text.' },
        from: {
          type: 'string',
          enum: ['html', 'csv', 'tsv', 'json', 'text', 'rtf', 'enex'],
          description: 'What the source is.',
        },
        name: {
          type: 'string',
          description:
            'What to call it. JSON uses it as the heading of the document it builds; the others ignore it.',
        },
      },
    },
    run: async (_c, args) => {
      const source = String(args.source ?? '');
      const from = String(args.from ?? '');

      if (!source.trim()) {
        return say('There is nothing to convert.', true);
      }

      if (source.length > QUOTA.documentBytes) {
        return say(
          `That is ${bytes(source.length)}; the limit for one document is ${bytes(QUOTA.documentBytes)}.`,
          true
        );
      }

      /*
       * The same functions the API and the browser call, which is why they live in `shared/`: a
       * conversion written twice is two conversions, and the second one is discovered by a person
       * whose table came out differently in a chat than on the site.
       */
      /* What to call it in the card. The text answer is the document itself and needs no name. */
      const named = `${String(args.name ?? 'document').replace(/\.[^.]+$/, '')}.md`;

      if (from === 'html') {
        const markdown = htmlToMarkdown(source);

        return card(clip(markdown), forConversion(named, markdown), PARTIAL_CARD_NOTE);
      }

      if (from === 'csv' || from === 'tsv') {
        const table = delimitedToMarkdown(source, {
          delimiter: from === 'tsv' ? '\t' : undefined,
        });

        return table
          ? card(clip(table), forConversion(named, table), PARTIAL_CARD_NOTE)
          : say('That has no rows in it.', true);
      }

      if (from === 'json') {
        try {
          const markdown = jsonToMarkdown(source, {
            title: String(args.name ?? 'document').replace(/\.[^.]+$/, ''),
          });

          return card(clip(markdown), forConversion(named, markdown), PARTIAL_CARD_NOTE);
        } catch (cause) {
          // The parser says where it stopped, and that is the whole of what anybody can act on.
          return say(
            cause instanceof Error ? cause.message : 'That is not valid JSON.',
            true
          );
        }
      }

      if (from === 'text') {
        const { textToMarkdown } = await import('../shared/from-text.js');
        const markdown = textToMarkdown(source);

        return card(clip(markdown), forConversion(named, markdown), PARTIAL_CARD_NOTE);
      }

      if (from === 'rtf' || from === 'enex') {
        const title = String(args.name ?? 'document').replace(/\.[^.]+$/, '');

        try {
          const markdown =
            from === 'rtf'
              ? (await import('../shared/from-rtf.js')).rtfToMarkdown(source, title)
              : (await import('../shared/from-evernote.js')).evernoteToMarkdown(source, title);

          return card(clip(markdown), forConversion(named, markdown), PARTIAL_CARD_NOTE);
        } catch (cause) {
          /* Both of these say what is wrong with the file, which is the only useful answer. */
          return say(
            cause instanceof Error ? cause.message : 'That file could not be read.',
            true
          );
        }
      }

      return say(UNSUPPORTED_FROM, true);
    },
  },

  tp_save_document: {
    description:
      'Saves a document to this TransformPipe account, and publishes it in the same call when asked. Markdown by default; `from` sends HTML, CSV, TSV or JSON instead, which is converted on the way in and recorded as what it was made from. Returns the id, the size and — when shared — the URL. `share: "link"` is anyone holding the URL, `"people"` is the addresses in `emails`, `"private"` (the default) is nobody but the owner. A `share` of "link" or "people" discloses the document outside the account and requires `confirm: true`; without it the call saves nothing and returns what would have been disclosed. `folder` files it in a folder, by id or by path ("Devart AI/Home"); folders on the path that do not exist yet are made. A folder that is shared, or sits inside one that is, is read by everyone it is shared with, so saving into one requires `confirm: true` as well. `replaces` records this document as a new version of an earlier one, beside it and under a new link; a save that omits it is an unrelated document. To change a document that already exists — "update it", "fix it", "keep the old version", "keep the link" — use tp_update_document, which keeps the old text as a revision and the link as it is.',
    ui: DOCUMENT_CARD_URI,
    annotations: {
      title: 'Save a document',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['markdown'],
      properties: {
        markdown: {
          type: 'string',
          description: 'The source to store. Markdown unless `from` says otherwise.',
        },
        from: {
          type: 'string',
          enum: ['html', 'csv', 'tsv', 'json', 'text', 'rtf', 'enex'],
          description:
            'Convert the source on the way in. Omit for Markdown. A file that is bytes — .docx, .xlsx, .pptx, .epub, .odt, an export .zip — cannot come through a tool; use the app or the API.',
        },
        name: {
          type: 'string',
          description: 'File name. Default "document.md"; a converted file is stored as .md.',
        },
        share: {
          type: 'string',
          enum: ['private', 'link', 'people'],
          description: 'Who may open it. Default private.',
        },
        emails: {
          type: 'array',
          items: { type: 'string' },
          description: 'Addresses for share: "people". Replaces any existing list.',
        },
        replaces: {
          type: 'string',
          description:
            'Id of an earlier document this is a separate new version of — a second document, with its own id and its own link. To change a document the person already has, or to keep its link, use tp_update_document instead: it keeps the replaced text as a revision on its own. tp_list_documents prints ids.',
        },
        folder: {
          type: 'string',
          description:
            'The folder to file it in: an id from tp_list_folders, or a path from the top such as "Devart AI/Home" (`/` or `›` between names, case does not matter). Missing folders on the path are made. Omit to file it in no folder.',
        },
        confirm: {
          type: 'boolean',
          description:
            'Required when `share` is "link" or "people", or when `folder` is shared or inside a shared folder. True when the person asked for this document to be published to that audience.',
        },
      },
    },
    run: async (c, args) => {
      const markdown = String(args.markdown ?? '');

      if (!markdown.trim()) {
        return say('There is nothing to save.', true);
      }

      const from = String(args.from ?? '');
      const kind = SAVE_KINDS[from];

      if (from && !kind) {
        return say(UNSUPPORTED_FROM, true);
      }

      /*
       * The source goes to the API as it is, with the conversion named, rather than converted here
       * and posted as Markdown. The document then records what it was made from, exactly as one
       * saved from the app does, and the history screen can say so.
       */
      let name = String(args.name ?? 'document.md');

      /*
       * A tab-separated file is a comma-separated one with a different delimiter, and the API tells
       * them apart by the extension — the rule the app follows when somebody drops a
       * file on it. `from: "tsv"` is a caller saying the same thing in words, so the name is made
       * to agree rather than the rule being written twice.
       */
      if (from === 'tsv' && !name.toLowerCase().endsWith('.tsv')) {
        name = `${name.replace(/[.][^.]+$/, '')}.tsv`;
      }

      const share = args.share === 'link' || args.share === 'people' ? args.share : '';

      /*
       * Publishing is gated the way deleting is.
       *
       * The description used to ask for the same restraint in prose — "share a document the person
       * actually asked to share" — and the directory's review named that for what it is: guidance
       * to a model, not a gate. A sentence cannot refuse. This can, and it refuses before the save
       * rather than after, so a document that was not meant to be public is never public for the
       * length of a second call.
       *
       * "private" is not gated: it discloses nothing, and a save is the ordinary case.
       */
      /*
       * The folder is looked up before the gate and made after it. A shared folder publishes what
       * is filed in it as surely as `share: "link"` does — its page lists everything under it — so
       * it is the same decision and gets the same gate; and a save the gate refuses must not leave
       * behind the folders it would have been filed in.
       */
      const wantsFolder = typeof args.folder === 'string' && args.folder.trim() !== '';
      let folders: Folder[] = [];
      let plan: Extract<FolderPlan, { ok: true }> = { ok: true, folder: null, parent: null, missing: [] };

      if (wantsFolder) {
        const read = await foldersOf(c);

        if (!read.ok) return say(read.error, true);

        const planned = planFolder(read.folders, args.folder, { create: true });

        if (!planned.ok) return say(planned.error, true);
        folders = read.folders;
        plan = planned;
      }

      const through = sharedThrough(folders, (plan.folder ?? plan.parent)?.id);

      if ((share || through) && args.confirm !== true) {
        const { confirm: _unasked, ...asked } = args;
        const named = Array.isArray(args.emails) ? args.emails.map(String) : [];
        /* The folder by the path it has, or would have once the missing end of it is made. */
        const into = plan.folder
          ? pathOf(folders, plan.folder.id)
          : [pathOf(folders, plan.parent?.id), ...plan.missing].filter(Boolean).join(' › ');
        const intoShared = through
          ? `${into} ${plan.folder ? 'is' : 'would be'} ${
              through.id === plan.folder?.id ? '' : `inside ${pathOf(folders, through.id)}, which is `
            }shared ${
              through.share_mode === 'link'
                ? 'by link, so anyone holding its URL could read this document'
                : 'with named people, who could read this document'
            }`
          : '';

        return refusedCard(
          `Nothing was saved. ${
            share
              ? `\`share: "${share}"\` would ${
                  share === 'link'
                    ? 'publish this document as a page on the public web that anyone holding the URL can open'
                    : `send ${
                        Array.isArray(args.emails) && args.emails.length
                          ? `${args.emails.length} address${args.emails.length === 1 ? '' : 'es'}`
                          : 'the addresses given'
                      } an email with a link to it`
                }${intoShared ? `, and ${intoShared}` : ''}`
              : intoShared
          } — ask the person, then call this again with confirm: true. ${
            !through
              ? 'To save it to the account without publishing, omit `share`.'
              : share
                ? 'To save it without publishing, omit `share` and choose a folder that is not shared.'
                : 'To save it without that, choose a folder that is not shared, or omit `folder`.'
          }`,
          { ...forConversion(name, markdown), share: share || through?.share_mode || 'private', readers: named },
          {
            tool: 'tp_save_document',
            args: asked,
            label: share === 'link' ? 'Save and publish' : share && named.length === 1 ? `Save and share with ${named[0]}` : share ? 'Save and share' : 'Save into the shared folder',
            note:
              share === 'link'
                ? 'It becomes a page on the public web that anyone holding the link can open.'
                : share
                  ? 'The people named get an email with a link to it.'
                  : `Everyone the folder ${pathOf(folders, through!.id)} is shared with can read it.`,
          }
        );
      }

      const filed = await makeFolders(c, folders, plan);

      if (!filed.ok) return say(`Nothing was saved. ${filed.error}`, true);

      /* Where it went, for the answer: a path, and any folder made on the way so nobody is surprised by one. */
      const filedIn = filed.folder
        ? [
            `Filed in ${pathOf(folders, filed.folder.id)}${
              filed.created.length
                ? ` (made ${filed.created.length === 1 ? 'the folder' : 'the folders'} ${filed.created.map((one) => one.name).join(', ')} for it)`
                : ''
            }.`,
            through && folderUrl(c, through)
              ? `Everyone ${pathOf(folders, through.id)} is shared with can read it there: ${folderUrl(c, through)}`
              : null,
          ]
            .filter(Boolean)
            .join('\n')
        : '';

      const query = new URLSearchParams({ name });

      if (filed.folder) {
        query.set('folder', filed.folder.id);
      }

      if (kind) {
        query.set('kind', kind);
      }

      if (share) {
        query.set('share', share);
      }

      if (typeof args.replaces === 'string' && args.replaces) {
        query.set('replaces', args.replaces);
      }

      const created = await callApi(c, `/api/v1/documents?${query}`, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: markdown,
      });

      if (created.status !== 201) {
        return say(
          `${created.body?.error ?? `The save failed (${created.status}).`}${
            filed.created.length ? ` The folder ${pathOf(folders, filed.created.at(-1)!.id)} was made for it and is still there, empty.` : ''
          }`,
          true
        );
      }

      const document = created.body.document;

      if (share === 'people' && Array.isArray(args.emails)) {
        const shared = await callApi(
          c,
          `/api/v1/documents/${segment(document.id)}/share`,
          {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ mode: 'people', emails: args.emails }),
          }
        );

        if (shared.status !== 200) {
          return say(
            `Saved as ${document.name} (id ${document.id}), but the addresses were not set: ${
              shared.body?.error ?? shared.status
            }`,
            true
          );
        }

        // A card as well as the sentence: the view is drawn either way, and one given nothing
        // waits on "Waiting for the document…" for ever.
        return card(
          `Saved ${document.name} (id ${document.id}, ${bytes(document.size)}) and shared it with ${
            (shared.body.emails ?? []).join(', ') || 'nobody yet'
          }.\n${shared.body.url ?? ''}\n${filedIn}`.trim(),
          forCard(
            c,
            { ...document, share: { mode: 'people', url: shared.body.url ?? null } },
            markdown
          )
        );
      }

      return card(
        [
          `Saved ${document.name} — id ${document.id}, ${bytes(document.size)}, ${document.words} words.`,
          /*
           * What the document is, not what was asked for. A share that did not take leaves the URL
           * null, and a sentence promising a link nobody can open is worse than no sentence.
           */
          document.share.mode === 'link' && document.share.url
            ? `Anyone with this link can read it: ${document.share.url}`
            : document.share.mode === 'people' && document.share.url
              ? `Only the addresses on it can read it: ${document.share.url}`
              : through
                ? 'It has no link of its own; tp_share_document gives it one when asked.'
                : 'It is private. Share it with tp_share_document when asked.',
          filedIn || null,
        ]
          .filter(Boolean)
          .join('\n'),
        forCard(c, document, markdown)
      );
    },
  },

  tp_update_document: {
    description:
      'Replaces the text of a document already on the account and keeps everything else: its id, its link, its password and end, and who may open it. Use it when the person asks to change, fix, extend or rewrite a document they have — above all one already shared, so the link they sent shows the change; use tp_save_document for something new. The text it replaces is kept as a revision on the account (the newest ten), so nothing is lost. A document shared by link or with people is a page others read, so updating one requires `confirm: true`; without it nothing changes and the call says who would see the new text. A private document updates without it. `markdown` is the whole new text, not a diff. The same text again changes nothing.',
    ui: DOCUMENT_CARD_URI,
    annotations: {
      title: 'Update a document',
      readOnlyHint: false,
      /* It changes what people holding the link read, and the old text leaves the page. */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'markdown'],
      properties: {
        id: { type: 'string', description: 'The document id, from tp_list_documents.' },
        markdown: {
          type: 'string',
          description: 'The whole new text, as Markdown.',
        },
        name: { type: 'string', description: 'A new name for it. Leave out to keep the one it has.' },
        confirm: {
          type: 'boolean',
          description:
            'Required when the document is shared by link or with people. True when the person asked for this shared document to be changed.',
        },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');
      const markdown = typeof args.markdown === 'string' ? args.markdown : '';
      const name = typeof args.name === 'string' && args.name.trim() ? args.name.trim() : undefined;

      if (!id || !markdown.trim()) {
        return say('Give the document id and the whole new Markdown.', true);
      }

      const found = await callApi(c, `/api/v1/documents/${segment(id)}`);

      if (found.status !== 200) {
        return say(
          found.body?.error ?? `That document is not on this account (${found.status}).`,
          true
        );
      }

      const current = found.body.document;

      /*
       * The same gate as sharing, for the same reason: a page other people read is about to say
       * something else. The refusal names the document and who reads it, so the person agrees to
       * "the Q3 plan, shared by link" rather than to an id.
       */
      if (current.share?.mode !== 'private' && args.confirm !== true) {
        const people = current.share?.mode === 'people';

        return refusedCard(
          `Nothing changed. ${current.name} is ${
            people
              ? 'shared with named people, so the new text is what they will read'
              : 'shared by link, so the new text is what anyone holding the link will read'
          } — ask the person, then call this again with confirm: true.`,
          { ...forCard(c, current), diff: lineDiff(current.markdown ?? '', markdown) },
          {
            tool: 'tp_update_document',
            args: { id, markdown, ...(name ? { name } : {}) },
            label: 'Update the shared page',
            note: people
              ? 'The people it is shared with will read the new text.'
              : 'Anyone holding the link will read the new text.',
          }
        );
      }

      const updated = await callApi(c, `/api/v1/documents/${segment(id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ markdown, ...(name ? { name } : {}) }),
      });

      if (updated.status !== 200) {
        return say(updated.body?.error ?? `It was not updated (${updated.status}).`, true);
      }

      const document = updated.body.document;
      const diff = lineDiff(current.markdown ?? '', markdown);

      return card(
        updated.body.changed
          ? [
              `Updated ${document.name} — the same id${document.share?.url ? ` and the same link: ${document.share.url}` : ''}.`,
              `${diff.added} line${diff.added === 1 ? '' : 's'} added, ${diff.removed} removed. The text it replaced is kept as a revision (${updated.body.revisions} kept).`,
            ].join('\n')
          : `Nothing to update: ${document.name} already says exactly that.`,
        updated.body.changed ? { ...forCard(c, document, markdown), diff } : forCard(c, document, markdown)
      );
    },
  },

  tp_list_documents: {
    description:
      'What is on this TransformPipe account: documents with their names, sizes, dates, the folder each is filed in and whether each is shared. Start here when the question is "what have I got". `query` matches a document by its name or by what is written inside it; `folder` narrows the list to one folder and every folder under it. Prints the id of each, which is what the other tools take.',
    ui: DOCUMENT_LIST_URI,
    annotations: { title: 'List documents', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 200,
          description: 'How many to show, newest first. Default 50.',
        },
        query: {
          type: 'string',
          description: 'Matches a document by name or by its content.',
        },
        folder: {
          type: 'string',
          description:
            'Only what is in this folder and the folders under it: an id from tp_list_folders, or a path from the top such as "Devart AI/Home".',
        },
      },
    },
    run: async (c, args) => {
      /*
       * Every folder, read once: it resolves `folder` and it prints the path beside each document,
       * which is one request for the whole list rather than one per row. A list of folders that
       * cannot be read costs the paths, not the documents — unless a folder was asked for.
       */
      const read = await foldersOf(c);
      const folders = read.ok ? read.folders : [];
      let within: Folder | null = null;

      if (typeof args.folder === 'string' && args.folder.trim()) {
        if (!read.ok) return say(read.error, true);

        const found = await resolveFolder(c, args.folder, { folders });

        if (!found.ok) return say(found.error, true);
        within = found.folder;
      }

      const narrowed = within ? `folder=${segment(within.id)}` : '';
      const listed = await callApi(c, `/api/v1/documents${narrowed ? `?${narrowed}` : ''}`);

      if (listed.status !== 200) {
        return say(listed.body?.error ?? `Could not read the list (${listed.status}).`, true);
      }

      const needle = String(args.query ?? '').toLowerCase();
      const all = (listed.body.documents ?? []) as Array<Parameters<typeof describe>[0]>;
      let matching = needle
        ? all.filter((document) => document.name.toLowerCase().includes(needle))
        : all;

      /*
       * A second call, only when there is something to search for: `?q=` ranks by content, which
       * `all` already fetched does not carry, and a name match already covers the common case for
       * free.
       */
      if (needle) {
        const byContent = await callApi(
          c,
          `/api/v1/documents?q=${encodeURIComponent(needle)}${narrowed ? `&${narrowed}` : ''}`
        );

        if (byContent.status === 200) {
          const already = new Set(matching.map((document) => document.id));
          const contentIds = new Set(
            (byContent.body.documents ?? []).map((document: { id: string }) => document.id)
          );

          matching = [
            ...matching,
            ...all.filter(
              (document) => contentIds.has(document.id) && !already.has(document.id)
            ),
          ];
        }
      }

      /*
       * An empty list is still a list: the card the host has already drawn waits for data, and
       * plain text left it saying "Waiting for the list…" for good — seen in Claude on a phone,
       * where a first search found nothing before a second one did.
       */
      const where = within ? pathOf(folders, within.id) : '';

      if (matching.length === 0) {
        return card(
          needle
            ? `Nothing ${where ? `in ${where}` : 'on this account'} has "${needle}" in its name or content.`
            : where
              ? `There are no documents in ${where} or in any folder under it.`
              : 'This account has no documents yet.',
          // The card reads `query` to say what found nothing; a folder is the nearest thing to one.
          { total: 0, documents: [], query: needle || where || null }
        );
      }

      const limit = Math.min(Math.max(Number(args.limit ?? 50) || 50, 1), 200);
      const shown = matching.slice(0, limit);

      return card(
        clip(
          [
            `${shown.length} of ${matching.length} shown${where ? ` from ${where} and the folders under it` : ''}, newest first.`,
            '',
            ...shown.map((document) => describe(document, pathOf(folders, document.folder_id))),
          ].join('\n')
        ),
        {
          total: matching.length,
          documents: shown.map((document) => ({
            id: document.id,
            name: document.name,
            size: document.size,
            words: document.words ?? 0,
            created: document.created_at ?? '',
            share: document.share?.mode ?? 'private',
            url: `${selfOrigin(c)}${conversion(document.kind).path}?doc=${document.id}`,
            // Not drawn by the list today; carried so a card that wants the folder need not ask.
            folder: pathOf(folders, document.folder_id),
          })),
        }
      );
    },
  },

  tp_list_folders: {
    description:
      'The folders on this TransformPipe account, as a tree: each with its id, how many documents it holds counting the folders under it, and whether it is shared — by link, with the link, or with named people. Also the account\'s totals: how many documents there are, how many are in no folder, and the storage used against its limit — so "how many folders and files have I got" is this one call. The path each prints ("Devart AI › Home › Guides") is what the other tools take as `folder`, as is the id — tp_update_folder renames or moves one, tp_delete_folder deletes one.',
    ui: ACCOUNT_CARD_URI,
    annotations: { title: 'List folders', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: { type: 'object', additionalProperties: false, properties: {} },
    run: async (c) => {
      /*
       * The usage beside the folders, because the question is nearly always both — "how many
       * folders and files have I got" — and two calls for one question is a second round trip the
       * person waits through. A usage that cannot be read costs the totals, not the tree.
       */
      const [read, used] = await Promise.all([foldersOf(c), callApi(c, '/api/v1/usage')]);

      if (!read.ok) return say(read.error, true);

      const { folders } = read;
      const usage =
        used.status === 200
          ? {
              bytes: Number(used.body.bytes ?? 0),
              maxBytes: Number(used.body.limits?.bytes ?? 0),
              documents: Number(used.body.documents ?? 0),
              maxDocuments: Number(used.body.limits?.documents ?? 0),
            }
          : null;
      const filed = folders.reduce((sum, one) => sum + (one.documents ?? 0), 0);
      const unfiled = usage ? Math.max(0, usage.documents - filed) : null;
      const totals = usage
        ? `${usage.documents} document${usage.documents === 1 ? '' : 's'} on the account, ${unfiled} in no folder; ${bytes(usage.bytes)} of ${bytes(usage.maxBytes)} stored.`
        : null;
      const view = {
        ...(usage ? { usage } : {}),
        folders: folders.map((one) => ({
          id: one.id,
          parent_id: one.parent_id,
          name: one.name,
          path: pathOf(folders, one.id),
          total: inside(folders, one.id),
          share: one.share_mode === 'link' || one.share_mode === 'people' ? one.share_mode : 'private',
          open: `${selfOrigin(c)}/history?folder=${encodeURIComponent(one.id)}`,
        })),
        ...(unfiled !== null ? { unfiled } : {}),
      };

      if (folders.length === 0) {
        return card(
          [
            'This account has no folders. Its documents are filed nowhere until one is made — tp_create_folder makes one, and tp_save_document files into one with `folder`.',
            totals,
          ]
            .filter(Boolean)
            .join('\n'),
          view
        );
      }

      /*
       * Indented, the way the app draws it, with the whole path on the top line of each so the
       * answer can be copied into the next call as it stands. Depth is the indent; the path says it
       * again because a model reading the fortieth line has lost count of the spaces.
       */
      const lines: string[] = [];
      const seen = new Set<string>();
      const draw = (parent: string | null, depth: number) => {
        const pad = '  '.repeat(depth);

        for (const one of folders.filter((folder) => folder.parent_id === parent)) {
          if (seen.has(one.id)) continue;
          seen.add(one.id);

          const total = inside(folders, one.id);
          const url = folderUrl(c, one);

          lines.push(
            `${pad}${pathOf(folders, one.id)}`,
            `${pad}  id: ${one.id}`,
            `${pad}  ${total} document${total === 1 ? '' : 's'}${
              total !== one.documents ? ` (${one.documents} directly in it)` : ''
            } · ${
              one.share_mode === 'link' && url
                ? `shared by link: ${url}`
                : one.share_mode === 'people' && url
                  ? `shared with named people: ${url}`
                  : 'private'
            }`
          );
          draw(one.id, depth + 1);
        }
      };

      draw(null, 0);

      return card(
        clip(
          [
            `${folders.length} folder${folders.length === 1 ? '' : 's'}, holding ${filed} document${filed === 1 ? '' : 's'} between them.`,
            totals,
            '',
            ...lines,
          ]
            .filter((line) => line !== null)
            .join('\n')
        ),
        view
      );
    },
  },

  tp_create_folder: {
    description:
      'Makes a folder on this TransformPipe account, at the top or inside `parent`, and returns its id and its path. `parent` is an id or a path such as "Devart AI/Home"; folders on it that do not exist yet are made too. A folder of that name already in that place is returned rather than made twice. To file documents in it, pass `folder` to tp_save_document or use tp_move_documents.',
    ui: FOLDER_CARD_URI,
    annotations: {
      title: 'Create a folder',
      readOnlyHint: false,
      destructiveHint: false,
      /* Asking twice returns the folder the first call made. */
      idempotentHint: true,
      openWorldHint: false,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'The new folder\'s name. A path such as "Guides/2026" makes each folder on it that is missing.',
        },
        parent: {
          type: 'string',
          description: 'The folder to make it in: an id from tp_list_folders, or a path from the top. Omit for the top level.',
        },
      },
    },
    run: async (c, args) => {
      const name = typeof args.name === 'string' ? args.name.trim() : '';

      if (!name) {
        return say('A folder needs a name.', true);
      }

      const parent = await resolveFolder(c, args.parent, { create: true });

      if (!parent.ok) return say(parent.error, true);

      /*
       * The name under the parent, not anywhere on the account: "make Guides in Home" is a question
       * about Home, and a Guides somewhere else is not the one that was asked for.
       */
      const made = await resolveFolder(c, name, { create: true, base: parent.folder, folders: parent.folders });

      if (!made.ok) return say(made.error, true);

      const created = [...parent.created, ...made.created];

      return card(
        [
          created.length === 0
            ? `${made.path} already exists, so nothing was made.`
            : `Made ${made.path}.`,
          `id: ${made.folder!.id}`,
          created.length > 1 ? `Folders made on the way: ${created.map((one) => pathOf(made.folders, one.id)).join(', ')}.` : null,
          sharedThrough(made.folders, made.folder!.id)
            ? `It is inside ${throughWords(made.folders, sharedThrough(made.folders, made.folder!.id)!)}.`
            : null,
        ]
          .filter(Boolean)
          .join('\n'),
        forFolder(c, made.folders, made.folder!, {
          did: created.length === 0 ? 'exists' : 'created',
          created: created.map((one) => pathOf(made.folders, one.id)),
        })
      );
    },
  },

  tp_move_documents: {
    description:
      'Files documents in a folder, or takes them out of every folder with `folder: null`. `ids` are document ids from tp_list_documents; `folder` is an id from tp_list_folders or a path such as "Devart AI/Home", and it has to exist — tp_create_folder makes one. A folder that is shared, or sits inside one that is, is read by everyone it is shared with, so moving documents into one requires `confirm: true`; without it nothing moves and the call says who would read them. Moving out of a shared folder is not gated.',
    ui: FOLDER_CARD_URI,
    annotations: {
      title: 'Move documents to a folder',
      readOnlyHint: false,
      /*
       * Into a shared folder is publishing them to whoever the folder is shared with — the reason
       * saving and sharing carry both hints, and the gate is the same `confirm`.
       */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['ids', 'folder'],
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          description: 'The documents to move, by id.',
        },
        folder: {
          type: ['string', 'null'],
          description: 'Where to: a folder id, or a path from the top. null or "" takes them out of every folder.',
        },
        confirm: {
          type: 'boolean',
          description:
            'Required when the folder is shared or inside a shared folder. True when the person asked for these documents to be filed where those people can read them.',
        },
      },
    },
    run: async (c, args) => {
      const ids = Array.isArray(args.ids) ? [...new Set(args.ids.map((one) => String(one).trim()).filter(Boolean))] : [];

      if (ids.length === 0) {
        return say('Which documents? tp_list_documents prints the ids.', true);
      }

      /*
       * `folder` is required and may be null, because the two absences mean different things: a
       * call that forgot to say where must not quietly take documents out of the folders they are in.
       */
      if (!('folder' in args)) {
        return say('Say which folder — or `folder: null` to take them out of every folder.', true);
      }

      const target = await resolveFolder(c, args.folder);

      if (!target.ok) return say(target.error, true);

      const to = target.folder;
      const where = to ? target.path : 'no folder';
      const through = sharedThrough(target.folders, to?.id);

      /* Named in the answer, so "moved 3" can be checked against the three that were meant. */
      const listed = await callApi(c, '/api/v1/documents');
      const known = (listed.status === 200 ? listed.body.documents : []) as Array<{ id: string; name: string; folder_id?: string | null }>;
      const moving = known.filter((one) => ids.includes(one.id));

      if (through && to && args.confirm !== true) {
        const them = moving.length === 1 ? 'it' : 'them';

        return refusedCard(
          `Nothing moved. ${target.path} is ${
            through.id === to?.id ? '' : `inside ${pathOf(target.folders, through.id)}, `
          }shared ${
            through.share_mode === 'link'
              ? 'by link, so anyone holding its URL would be able to read'
              : 'with named people, who would be able to read'
          } ${moving.length ? moving.map((one) => one.name).join(', ') : `the ${ids.length} document${ids.length === 1 ? '' : 's'}`} — ask the person, then call this again with confirm: true.`,
          forFolder(c, target.folders, to, { did: 'moved', moved: moving.map((one) => one.name) }),
          {
            tool: 'tp_move_documents',
            // By id, so the button moves them into this folder even if another comes to share its name.
            args: { ids, folder: to.id },
            label: 'Move into the shared folder',
            note: `Everyone ${pathOf(target.folders, through.id)} is shared with ${
              through.share_mode === 'link' ? '— anyone holding its link — ' : ''
            }will be able to read ${them}.`,
          }
        );
      }

      const moved = await callApi(c, '/api/v1/documents/move', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids, folder_id: to?.id ?? null }),
      });

      if (moved.status !== 200) {
        return say(moved.body?.error ?? `Nothing moved (${moved.status}).`, true);
      }

      const count = Number(moved.body.moved ?? 0);
      const missed = ids.filter((id) => !known.some((one) => one.id === id));

      if (count === 0) {
        return say('Nothing moved: none of those ids is a document on this account.', true);
      }

      /* Read again for the card's count, which the move has just changed. */
      const after = await foldersOf(c);
      const folders = after.ok ? after.folders : target.folders;
      const landed = to ? (folders.find((one) => one.id === to.id) ?? to) : null;
      const view = landed
        ? forFolder(c, folders, landed, { did: 'moved', moved: moving.map((one) => one.name), missed })
        : {
            none: true,
            name: 'No folder',
            did: 'moved',
            moved: moving.map((one) => one.name),
            missed,
            open: `${selfOrigin(c)}/history`,
          };

      return card(
        [
          `Moved ${count} document${count === 1 ? '' : 's'} to ${where}${
            moving.length ? `: ${moving.map((one) => one.name).join(', ')}` : ''
          }.`,
          missed.length > 0 ? `Not on this account, so not moved: ${missed.join(', ')}.` : null,
          through && folderUrl(c, through)
            ? `Everyone ${pathOf(target.folders, through.id)} is shared with can read ${count === 1 ? 'it' : 'them'} there: ${folderUrl(c, through)}`
            : null,
        ]
          .filter(Boolean)
          .join('\n'),
        view
      );
    },
  },

  tp_get_document: {
    description:
      'One document from this account, by the id tp_list_documents printed: its Markdown source, or the rendered HTML.',
    ui: DOCUMENT_CARD_URI,
    annotations: { title: 'Read a document', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'The document id.' },
        as: {
          type: 'string',
          enum: ['markdown', 'html'],
          description: 'Which face of it. Default markdown.',
        },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');

      if (!id) {
        return say('Which document? tp_list_documents prints the ids.', true);
      }

      if (args.as === 'html') {
        const response = await v1.fetch(
          new Request(`${selfOrigin(c)}/api/v1/documents/${segment(id)}.html`, {
            headers: {
              authorization: c.req.header('authorization') ?? '',
              cookie: c.req.header('cookie') ?? '',
              [INTERNAL_CALL_HEADER]: '1',
              [INTERNAL_KEY_HEADER]: INTERNAL_CALL_KEY,
            },
          })
        );

        const text = await response.text();

        return response.ok
          ? say(clip(text))
          : say(`That document is not on this account (${response.status}).`, true);
      }

      const got = await callApi(c, `/api/v1/documents/${segment(id)}`);

      if (got.status !== 200) {
        return say(
          got.body?.error ?? `That document is not on this account (${got.status}).`,
          true
        );
      }

      const document = got.body.document;
      // Who it is shared with, so "share it with Sam too" is answered from the list, not a guess.
      const readers = document.share?.mode === 'people' ? await readersOf(c, id) : [];

      return card(
        clip(
          [
            `${document.name} — ${bytes(document.size)}`,
            readers.length ? `Shared with: ${readers.join(', ')}` : null,
            document.share?.url ? linkEnds(document.share.expires_at) : null,
            document.share?.url
              ? linkOpens(document.share.views, document.share.last_viewed_at)
              : null,
            document.share?.url && document.share.has_password ? LOCKED : null,
            '',
            document.markdown ?? '',
          ]
            .filter((line) => line !== null)
            .join('\n')
        ),
        { ...forCard(c, document, document.markdown ?? ''), readers }
      );
    },
  },

  tp_summarize_document: {
    description:
      'A summary of one document — a paragraph on what it is and what it concludes, then its specifics as a short Markdown list — generated by a model and cached on the account so asking again is free. Pass `force: true` to regenerate. Summaries are metered separately from ordinary calls, at a per-day limit per account.',
    ui: DOCUMENT_CARD_URI,
    annotations: {
      title: 'Summarise a document',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      /*
       * Open-world: the summary is written by a model the account does not run — the document's
       * text goes to Google's Gemini API (see server/summarize.ts). Flagged by ChatGPT's tool
       * review on 5 October 2026, and right: that is an outside system acting on the document.
       */
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'The document id.' },
        force: {
          type: 'boolean',
          description: 'Regenerate even if a summary is already cached. Default false.',
        },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');

      if (!id) {
        return say('Which document? tp_list_documents prints the ids.', true);
      }

      const query = args.force ? '?force=1' : '';
      /* The document beside the summary, for the card's head: its name, size and buttons. */
      const [summarized, found] = await Promise.all([
        callApi(c, `/api/v1/documents/${segment(id)}/summary${query}`, { method: 'POST' }),
        callApi(c, `/api/v1/documents/${segment(id)}`),
      ]);

      if (summarized.status !== 200) {
        return say(
          summarized.body?.error ?? `Could not summarise that document (${summarized.status}).`,
          true
        );
      }

      return card(summarized.body.summary, {
        ...(found.status === 200 ? forCard(c, found.body.document) : { id, name: 'Document' }),
        summary: summarized.body.summary,
        summarizedAt: summarized.body.summarized_at ?? '',
      });
    },
  },

  tp_document_versions: {
    description:
      'A document\'s history, of both kinds. Its earlier texts: each tp_update_document keeps the text it replaced as a revision (the newest ten), listed newest first with an id — pass one as `revision` to get that earlier text as Markdown, then compare it with tp_get_document. And the documents linked to it as versions of the same thing, oldest first — the chain built by tp_save_document\'s `replaces`. Use it when the person asks what changed, what a document said before, or for an earlier draft.',
    ui: DOCUMENT_CARD_URI,
    annotations: { title: 'Document history', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'The document id — any document in a chain will do.' },
        revision: {
          type: 'string',
          description: 'A revision id from this tool\'s own list, to get that earlier text as Markdown.',
        },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');
      const revision = args.revision ? String(args.revision) : '';

      if (!id) {
        return say('Which document? tp_list_documents prints the ids.', true);
      }

      /*
       * One earlier text, whole. Not a diff: the assistant asking has the current text from
       * tp_get_document and says what changed better than a line diff would, in the words the
       * person used.
       */
      if (revision) {
        const one = await callApi(c, `/api/v1/documents/${segment(id)}/revisions/${segment(revision)}`);

        if (one.status !== 200) {
          return say('That is not one of this document\'s revisions. Call tp_document_versions without `revision` for the list.', true);
        }

        const kept = one.body.revision as { name: string; replaced_at: string | null; markdown: string };

        return card(
          clip(
            `${kept.name}, as it read until ${kept.replaced_at ? new Date(kept.replaced_at).toISOString().slice(0, 16).replace('T', ' ') : 'it was replaced'} UTC:\n\n${kept.markdown}`
          ),
          {
            ...forConversion(kept.name, kept.markdown),
            id,
            url: `${selfOrigin(c)}/?doc=${segment(id)}`,
            revisionOf: kept.replaced_at ?? '',
          }
        );
      }

      const [found, history, now] = await Promise.all([
        callApi(c, `/api/v1/documents/${segment(id)}/versions`),
        callApi(c, `/api/v1/documents/${segment(id)}/revisions`),
        callApi(c, `/api/v1/documents/${segment(id)}`),
      ]);

      if (found.status !== 200) {
        return say(
          found.body?.error ?? `That document is not on this account (${found.status}).`,
          true
        );
      }

      const chain = found.body.versions as Array<{
        id: string;
        name: string;
        created_at: string;
      }>;
      const revisions = (history.status === 200 ? history.body.revisions : []) as Array<{
        id: string;
        size: number;
        replaced_at: string | null;
      }>;
      const parts: string[] = [];

      if (revisions.length > 0) {
        parts.push(
          `Earlier texts of this document, newest first (${revisions.length}):\n${revisions
            .map(
              (one) =>
                `- replaced ${one.replaced_at ? new Date(one.replaced_at).toISOString().slice(0, 16).replace('T', ' ') : '?'} UTC · ${(one.size / 1024).toFixed(1)} kB · revision: ${one.id}`
            )
            .join('\n')}\nPass a revision as \`revision\` to read that text.`
        );
      }

      if (chain.length > 1) {
        parts.push(
          `Documents linked to it as versions, oldest first:\n${chain
            .map(
              (version) =>
                `${version.name}\n  id: ${version.id}\n  ${new Date(version.created_at).toISOString().slice(0, 10)}`
            )
            .join('\n')}`
        );
      }

      /*
       * The card: the text as it stands at the top, each earlier one under it with a button that
       * reads it back, and the linked documents after — the same order the sentence gives.
       */
      const current = now.status === 200 ? now.body.document : null;
      const timeline = {
        ...(current ? forCard(c, current) : { id, name: chain.find((one) => one.id === id)?.name ?? '' }),
        history: true,
        updated: current?.updated_at ?? '',
        revisions: revisions.map((one) => ({ id: one.id, size: one.size, at: one.replaced_at ?? '' })),
        chain: chain.length > 1
          ? chain.map((one) => ({ id: one.id, name: one.name, created: one.created_at, url: `${selfOrigin(c)}/?doc=${segment(one.id)}` }))
          : [],
      };

      if (parts.length === 0) {
        return card('This document has not been updated since it was saved, and no other versions are linked to it.', timeline);
      }

      return card(clip(parts.join('\n\n')), timeline);
    },
  },

  tp_share_document: {
    description:
      'Changes who may open a document. "link" is anyone holding the URL, "people" is only the addresses given, "private" revokes the link entirely — a URL already sent stops working. A `mode` of "link" or "people" discloses the document outside the account and requires `confirm: true`; without it nothing changes and the call returns what would have been disclosed. Revoking with "private" is not gated. `emails` replaces the list; `add` and `remove` change the list it already has, so "share it with Sam too" is `add: ["sam@…"]` and nobody else is touched. Only addresses new to the list are emailed. Returns the mode, the URL and the addresses as they now stand.',
    ui: DOCUMENT_CARD_URI,
    annotations: {
      title: 'Share a document',
      readOnlyHint: false,
      /* Publishing, emailing a notice, and revoking access can have irreversible effects. */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'mode'],
      properties: {
        id: { type: 'string', description: 'The document id.' },
        mode: {
          type: 'string',
          enum: ['private', 'link', 'people'],
          description: 'Who may open it. No default: say which.',
        },
        emails: {
          type: 'array',
          items: { type: 'string' },
          description: 'The whole address list, for mode "people" — it replaces the list. To change it by a name or two, use `add` or `remove` instead.',
        },
        add: {
          type: 'array',
          items: { type: 'string' },
          description: 'Addresses to add to the list it has, for mode "people". Only these are emailed.',
        },
        remove: {
          type: 'array',
          items: { type: 'string' },
          description: 'Addresses to take off the list it has, for mode "people".',
        },
        confirm: {
          type: 'boolean',
          description:
            'Required when `mode` is "link" or "people". True when the person asked for this document to be opened to that audience.',
        },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');
      const mode = String(args.mode ?? '');

      if (!id || !['private', 'link', 'people'].includes(mode)) {
        return say(
          'Give the document id and a mode of private, link or people.',
          true
        );
      }

      /*
       * The same gate as saving and deleting, and for the same reason: `idempotentHint` says that
       * sharing twice is one share, which is true and is not the point — the first one is the
       * disclosure. The refusal reads the document first so it can name what would have been
       * published, because a person can agree to "Q3-handbook.md" and can only guess at an id.
       */
      /*
       * The list as it will stand. `emails` is the whole of it; `add` and `remove` are changes to
       * the one it has, which is what "share it with Sam too" means — a replacing list made from
       * that sentence would drop everybody the model had not been told about.
       */
      const listed = (value: unknown) =>
        Array.isArray(value) ? value.map((one) => String(one).trim().toLowerCase()).filter(Boolean) : [];
      const adding = listed(args.add);
      const removing = new Set(listed(args.remove));
      const editing = adding.length > 0 || removing.size > 0;
      const before = editing || mode === 'people' ? await readersOf(c, id) : [];
      const emails: string[] | undefined = Array.isArray(args.emails)
        ? listed(args.emails)
        : editing
          ? [...new Set([...before, ...adding])].filter((email) => !removing.has(email))
          : undefined;

      if (mode !== 'private' && args.confirm !== true) {
        const found = await callApi(c, `/api/v1/documents/${segment(id)}`);

        if (found.status !== 200) {
          return say(
            found.body?.error ?? `That document is not on this account (${found.status}).`,
            true
          );
        }

        const readers = emails ?? before;
        const fresh = readers.filter((email) => !before.includes(email));

        return refusedCard(
          `Nothing changed. ${found.body.document.name} would ${
            mode === 'link'
              ? 'become a page on the public web that anyone holding the URL can open'
              : `be shared with ${readers.join(', ') || 'nobody yet'}${fresh.length ? `; ${fresh.join(', ')} would be emailed a link` : ''}`
          }${before.length ? ` (shared now with ${before.join(', ')})` : ''} — ask the person, then call this again with confirm: true.`,
          { ...forCard(c, found.body.document), sharing: true, share: mode, readers, opens: found.body.document.share?.views ?? 0, shareUrl: '' },
          {
            tool: 'tp_share_document',
            args: { id, mode, ...(emails ? { emails } : {}) },
            label:
              mode === 'link'
                ? 'Publish by link'
                : fresh.length === 1
                  ? `Share with ${fresh[0]}`
                  : fresh.length > 1
                    ? `Share with ${fresh.length} people`
                    : 'Share',
            note:
              mode === 'link'
                ? 'Anyone holding the link will be able to open it.'
                : fresh.length
                  ? 'Only the people listed can open it, and each new one is emailed the link.'
                  : 'Only the people listed can open it.',
          }
        );
      }

      const changed = await callApi(c, `/api/v1/documents/${segment(id)}/share`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, ...(emails ? { emails } : {}) }),
      });

      if (changed.status !== 200) {
        return say(
          changed.body?.error ?? `That did not work (${changed.status}).`,
          true
        );
      }

      const readers = (changed.body.emails ?? []) as string[];

      /*
       * The card shows the share as it now stands — who, how often opened, the shared link — and it
       * needs the document's name and size for its head, which the share answer does not carry. A
       * read that fails costs the head, not the card.
       */
      const found = await callApi(c, `/api/v1/documents/${segment(id)}`);
      const document = found.status === 200 ? found.body.document : { id, name: '', kind: 'markdown', size: 0 };

      return card(
        [
          `Now ${changed.body.mode}.`,
          changed.body.url ? changed.body.url : 'The link is revoked, so one already sent no longer opens.',
          changed.body.url ? linkEnds(changed.body.expires_at) : null,
          changed.body.url ? linkOpens(changed.body.views, changed.body.last_viewed_at) : null,
          changed.body.url && changed.body.has_password ? LOCKED : null,
          readers.length > 0 ? `Readers: ${readers.join(', ')}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        {
          ...forCard(c, document),
          share: changed.body.mode,
          shareUrl: changed.body.url ?? '',
          shareExpires: changed.body.expires_at ?? '',
          sharing: true,
          readers,
          opens: changed.body.views ?? 0,
          lastOpened: changed.body.last_viewed_at ?? '',
        }
      );
    },
  },

  tp_share_folder: {
    description:
      'Changes who may open a folder — and with it every document in it and in the folders under it, as one page at /f/…. "link" is anyone holding the URL, "people" is only the addresses given, each of whom signs in to read it, "private" revokes the link entirely — a URL already sent stops working. A `mode` of "link" or "people" discloses the folder outside the account and requires `confirm: true`; without it nothing changes and the call returns what would have been disclosed. Revoking with "private" is not gated. `emails` replaces the list; `add` and `remove` change the list it already has. Only addresses new to the list are emailed. `folder` is an id from tp_list_folders or a path such as "Devart AI/Home". Returns the mode, the URL and the addresses as they now stand.',
    ui: FOLDER_CARD_URI,
    annotations: {
      title: 'Share a folder',
      readOnlyHint: false,
      /* As for a document: publishing, emailing a notice, and revoking access can have irreversible effects. */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['folder', 'mode'],
      properties: {
        folder: { type: 'string', description: 'The folder: an id, or a path from the top such as "Devart AI/Home".' },
        mode: {
          type: 'string',
          enum: ['private', 'link', 'people'],
          description: 'Who may open it. No default: say which.',
        },
        emails: {
          type: 'array',
          items: { type: 'string' },
          description: 'The whole address list, for mode "people" — it replaces the list. To change it by a name or two, use `add` or `remove` instead.',
        },
        add: {
          type: 'array',
          items: { type: 'string' },
          description: 'Addresses to add to the list it has, for mode "people". Only these are emailed.',
        },
        remove: {
          type: 'array',
          items: { type: 'string' },
          description: 'Addresses to take off the list it has, for mode "people".',
        },
        confirm: {
          type: 'boolean',
          description:
            'Required when `mode` is "link" or "people". True when the person asked for this folder to be opened to that audience.',
        },
      },
    },
    run: async (c, args) => {
      const mode = String(args.mode ?? '');

      if (!['private', 'link', 'people'].includes(mode)) {
        return say('Give the folder and a mode of private, link or people.', true);
      }

      const target = await resolveFolder(c, args.folder);

      if (!target.ok) return say(target.error, true);

      if (!target.folder) {
        return say('Which folder? tp_list_folders prints them.', true);
      }

      const folder = target.folder;
      const at = `/api/v1/folders/${segment(folder.id)}/share`;
      const now = await callApi(c, at);

      if (now.status !== 200) {
        return say(now.body?.error ?? `That folder is not on this account (${now.status}).`, true);
      }

      /*
       * The list as it will stand, worked out the way tp_share_document works it out: `emails` is
       * the whole of it, `add` and `remove` are changes to the one it has. The API takes a folder's
       * readers one address at a time, so the difference between the two lists is what gets sent.
       */
      const listed = (value: unknown) =>
        Array.isArray(value) ? value.map((one) => String(one).trim().toLowerCase()).filter(Boolean) : [];
      const before = (Array.isArray(now.body.emails) ? now.body.emails : []) as string[];
      const adding = listed(args.add);
      const removing = new Set(listed(args.remove));
      const emails: string[] | undefined = Array.isArray(args.emails)
        ? [...new Set(listed(args.emails))]
        : adding.length > 0 || removing.size > 0
          ? [...new Set([...before, ...adding])].filter((email) => !removing.has(email))
          : undefined;
      const readers = mode === 'people' ? (emails ?? before) : before;
      const fresh = mode === 'people' ? readers.filter((email) => !before.includes(email)) : [];
      const gone = mode === 'people' && emails ? before.filter((email) => !emails.includes(email)) : [];
      const total = inside(target.folders, folder.id);

      /*
       * The same gate as a document's, and the refusal names the folder and what is in it: a
       * person can agree to "Devart AI, 140 documents" and can only guess at an id. A folder is the
       * larger disclosure of the two — everything under it, and whatever is filed there later.
       */
      if (mode !== 'private' && args.confirm !== true) {
        return refusedCard(
          `Nothing changed. ${target.path}, with the ${total} document${total === 1 ? '' : 's'} in it and in the folders under it, would ${
            mode === 'link'
              ? 'become a page on the public web that anyone holding the URL can open'
              : `be shared with ${readers.join(', ') || 'nobody yet'}${fresh.length ? `; ${fresh.join(', ')} would be emailed a link` : ''}`
          }${before.length && now.body.mode === 'people' ? ` (shared now with ${before.join(', ')})` : ''}. Anything filed in it later is shared the same way — ask the person, then call this again with confirm: true.`,
          /* The share as it would stand, not as it stands: the card heads it "Not yet". */
          forFolder(c, target.folders, folder, {
            did: 'shared',
            share: mode,
            shareUrl: '',
            readers: mode === 'people' ? readers : [],
          }),
          {
            tool: 'tp_share_folder',
            args: { folder: folder.id, mode, ...(mode === 'people' && emails ? { emails } : {}) },
            label:
              mode === 'link'
                ? 'Publish by link'
                : fresh.length === 1
                  ? `Share with ${fresh[0]}`
                  : fresh.length > 1
                    ? `Share with ${fresh.length} people`
                    : 'Share',
            note:
              mode === 'link'
                ? `Anyone holding the link will be able to open the folder and the ${total} document${total === 1 ? '' : 's'} under it.`
                : fresh.length
                  ? 'Only the people listed can open it, and each new one is emailed the link.'
                  : 'Only the people listed can open it.',
          }
        );
      }

      const changed = await callApi(c, at, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (changed.status !== 200) {
        return say(changed.body?.error ?? `That did not work (${changed.status}).`, true);
      }

      let state = changed.body;
      const notified: string[] = [];
      const unsent: string[] = [];

      /* Taken off first, so a list that swaps one address for another never holds both. */
      for (const email of gone) {
        const off = await callApi(c, `${at}/people?email=${encodeURIComponent(email)}`, { method: 'DELETE' });

        if (off.status === 200) state = off.body;
      }

      for (const email of fresh) {
        const on = await callApi(c, `${at}/people`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (on.status !== 200) {
          return say(
            `Now ${state.mode}, but ${email} was not added: ${on.body?.error ?? on.status}.${
              notified.length ? ` Emailed before that: ${notified.join(', ')}.` : ''
            }`,
            true
          );
        }

        state = on.body;
        (on.body.notified ? notified : unsent).push(email);
      }

      const url = state.mode !== 'private' && state.token ? `${selfOrigin(c)}/f/${state.token}` : null;
      const kept = (state.emails ?? []) as string[];
      /* The folder as the share left it, so the card's state and its link are the new ones. */
      const asShared = { ...folder, share_mode: state.mode, share_token: state.token ?? null };
      const folders = target.folders.map((one) => (one.id === folder.id ? asShared : one));

      return card(
        [
          `${target.path} is now ${
            state.mode === 'link' ? 'shared by link' : state.mode === 'people' ? 'shared with named people' : 'private'
          }${state.mode === 'private' ? '' : `, with the ${total} document${total === 1 ? '' : 's'} in it and under it`}.`,
          url ?? 'The link is revoked, so one already sent no longer opens.',
          url ? linkEnds(state.expiresAt) : null,
          url ? linkOpens(state.views, state.lastViewedAt) : null,
          url && state.hasPassword ? LOCKED : null,
          state.mode === 'people' && kept.length > 0 ? `Readers: ${kept.join(', ')}` : null,
          notified.length > 0 ? `Emailed a link: ${notified.join(', ')}` : null,
          /* Added and able to open it, but not told — the day's mail limit, or the mailer said no. */
          unsent.length > 0 ? `Added but not emailed, so tell them yourself: ${unsent.join(', ')}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        forFolder(c, folders, asShared, {
          did: 'shared',
          readers: state.mode === 'people' ? kept : [],
          emailed: notified,
          unsent,
          shareExpires: url ? (state.expiresAt ?? '') : '',
          opens: state.views ?? 0,
          lastOpened: state.lastViewedAt ?? '',
          hasPassword: Boolean(url && state.hasPassword),
        })
      );
    },
  },

  tp_update_folder: {
    description:
      'Renames a folder, moves it under another folder, or both. `folder` is the one to change, by id or path; `name` is its new name; `parent` is where it goes — an id or a path from the top, which has to exist, or null or "" for the top level. Everything in it goes with it. A folder cannot go inside itself or inside a folder under it. Moving it into a folder that is shared, or sits inside one that is, lets everyone that folder is shared with read what is in it, so that move requires `confirm: true`; without it nothing changes and the call says who would read it. Renaming is not gated.',
    ui: FOLDER_CARD_URI,
    annotations: {
      title: 'Rename or move a folder',
      readOnlyHint: false,
      /* Under a shared folder is publishing what it holds — the reason tp_move_documents carries both hints. */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['folder'],
      properties: {
        folder: { type: 'string', description: 'The folder to change: an id from tp_list_folders, or a path from the top.' },
        name: { type: 'string', description: 'Its new name. Leave out to keep the one it has.' },
        parent: {
          type: ['string', 'null'],
          description: 'Where to move it: a folder id or a path from the top, which must exist. null or "" moves it to the top level. Leave out to keep it where it is.',
        },
        confirm: {
          type: 'boolean',
          description:
            'Required when `parent` is shared or inside a shared folder. True when the person asked for this folder to go where those people can read it.',
        },
      },
    },
    run: async (c, args) => {
      const target = await resolveFolder(c, args.folder);

      if (!target.ok) return say(target.error, true);

      if (!target.folder) {
        return say('Which folder? tp_list_folders prints them.', true);
      }

      const { folders } = target;
      const folder = target.folder;
      const was = target.path;
      const name = typeof args.name === 'string' ? args.name.trim() : '';
      const renaming = name !== '' && name !== folder.name;
      /* `parent` left out keeps the folder where it is; `parent: null` is a place — the top. */
      const moving = 'parent' in args;

      /*
       * A slash in a name would read as a path to every other tool here, and the folder could only
       * be named by its id ever after. tp_create_folder takes one as a path; a rename cannot.
       */
      if (/[/›]/.test(name)) {
        return say('A folder\'s name cannot have / or › in it — those separate the names in a path. To move it, use `parent`.', true);
      }

      if (!renaming && !moving) {
        return say('Say what to change: a new `name`, a new `parent`, or both.', true);
      }

      let parent: Folder | null = null;

      if (moving) {
        const found = await resolveFolder(c, args.parent, { folders });

        if (!found.ok) return say(found.error, true);
        parent = found.folder;
      }

      const now = sharedThrough(folders, folder.id);
      const then = moving ? sharedThrough(folders, parent?.id) : now;
      const total = inside(folders, folder.id);
      const goesTo = parent ? pathOf(folders, parent.id) : 'the top level';

      /*
       * Gated only when the move opens it to people who could not read it before: into a shared
       * folder from outside one, or from one share into another. Within the same shared tree the
       * readers are the readers they were, and a rename changes nobody's access at all.
       */
      /* A move into itself is the API's to refuse, and asking first would be asking about nothing. */
      const intoItself = Boolean(parent && below(folders, folder.id).some((one) => one.id === parent!.id));

      if (moving && !intoItself && then && then.id !== now?.id && args.confirm !== true) {
        return refusedCard(
          `Nothing changed. Moving ${was} to ${goesTo} would put it ${
            then.id === parent?.id ? 'in' : `inside ${pathOf(folders, then.id)}, under`
          } a folder shared ${
            then.share_mode === 'link'
              ? 'by link, so anyone holding its URL could read'
              : 'with named people, who could read'
          } the ${total} document${total === 1 ? '' : 's'} in it — ask the person, then call this again with confirm: true.`,
          forFolder(c, folders, folder, { did: 'updated', movingTo: goesTo, ...(renaming ? { renamingTo: name } : {}) }),
          {
            tool: 'tp_update_folder',
            // By id, so the button moves it into this folder even if another comes to share its name.
            args: { folder: folder.id, parent: parent?.id ?? null, ...(renaming ? { name } : {}) },
            label: 'Move into the shared folder',
            note: `Everyone ${pathOf(folders, then.id)} is shared with ${
              then.share_mode === 'link' ? '— anyone holding its link — ' : ''
            }will be able to read what is in it.`,
          }
        );
      }

      const at = `/api/v1/folders/${segment(folder.id)}`;

      /*
       * The move first and the name after, as two requests. The API renames before it checks the
       * move, so one request with both could rename a folder and then refuse to move it — half a
       * change, reported as a failure. This way a refused move — a folder put inside itself, which
       * the API knows how to see — leaves it exactly as it was.
       */
      if (moving) {
        const placed = await callApi(c, at, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ parent_id: parent?.id ?? null }),
        });

        if (placed.status !== 200) {
          return say(
            `${placed.body?.error ?? `It was not moved (${placed.status})`}${
              placed.status === 400 && parent ? `: ${goesTo} is ${parent.id === folder.id ? 'that folder' : `inside ${was}`}` : ''
            }. Nothing changed.`,
            true
          );
        }
      }

      if (renaming) {
        const named = await callApi(c, at, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        if (named.status !== 200) {
          return say(
            `${named.body?.error ?? `It was not renamed (${named.status})`}.${moving ? ` It was moved to ${goesTo}.` : ''}`,
            true
          );
        }
      }

      /* Read again, so the card's path, its count and what it is shared through are the new ones. */
      const after = await foldersOf(c);
      const list = after.ok ? after.folders : folders;
      const changed = list.find((one) => one.id === folder.id) ?? { ...folder, name: renaming ? name : folder.name };
      const path = pathOf(list, changed.id) || changed.name;
      const through = sharedThrough(list, changed.id);

      return card(
        [
          renaming && moving
            ? `Renamed ${was} and moved it to ${goesTo}: it is now ${path}.`
            : renaming
              ? `Renamed ${was} to ${path}.`
              : `Moved ${was} to ${goesTo}: it is now ${path}.`,
          through && through.id !== changed.id && folderUrl(c, through)
            ? `Everyone ${pathOf(list, through.id)} is shared with can read what is in it: ${folderUrl(c, through)}`
            : null,
        ]
          .filter(Boolean)
          .join('\n'),
        forFolder(c, list, changed, { did: 'updated', was, renamed: renaming, relocated: moving })
      );
    },
  },

  tp_delete_folder: {
    description:
      'Deletes a folder from this account. By default the folder alone goes and nothing in it is lost: its documents and the folders under it move up one level, into the folder it was in or to the top. With `with_documents: true` every document in it and in the folders under it is deleted with it, permanently — there is no undo and no trash. A shared folder\'s link stops working either way. Pass confirm: true only when the person has named this folder and asked for it to be deleted; ask them otherwise. `folder` is an id from tp_list_folders or a path such as "Devart AI/Home".',
    ui: FOLDER_CARD_URI,
    annotations: {
      title: 'Delete a folder',
      readOnlyHint: false,
      /* With its documents it is tp_delete_document many times over: no undo, no trash. */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['folder', 'confirm'],
      properties: {
        folder: { type: 'string', description: 'The folder: an id, or a path from the top such as "Devart AI/Home".' },
        with_documents: {
          type: 'boolean',
          description:
            'Delete every document in it and in the folders under it as well, permanently. Default false: they move up one level instead.',
        },
        confirm: {
          type: 'boolean',
          description: 'True only when the person asked for this folder to be deleted — and, with `with_documents`, its documents too.',
        },
      },
    },
    run: async (c, args) => {
      const target = await resolveFolder(c, args.folder);

      if (!target.ok) return say(target.error, true);

      if (!target.folder) {
        return say('Which folder? tp_list_folders prints them.', true);
      }

      const { folders } = target;
      const folder = target.folder;
      const path = target.path;
      const withDocuments = args.with_documents === true;
      const total = inside(folders, folder.id);
      const under = below(folders, folder.id).slice(1);
      const parent = folder.parent_id ? (folders.find((one) => one.id === folder.parent_id) ?? null) : null;
      const goesTo = parent ? pathOf(folders, parent.id) : 'the top level';
      /* Every link that ends with it: its own, and — when its contents go too — any under it. */
      const links = (withDocuments ? [folder, ...under] : [folder]).filter(
        (one) => (one.share_mode === 'link' || one.share_mode === 'people') && one.share_token
      );
      const holds = `${total} document${total === 1 ? '' : 's'}${
        under.length ? ` and ${under.length} folder${under.length === 1 ? '' : 's'}` : ''
      }`;
      const facts = {
        inside: { documents: total, folders: under.length },
        withDocuments,
        goesTo,
        linksEnding: links.map((one) => pathOf(folders, one.id)),
      };

      /*
       * Always gated, as a document's delete is. The refusal says what is in the folder and where it
       * would go, because "delete the folder" and "delete everything in it" sound alike in a
       * conversation and are not: the first loses nothing, the second cannot be taken back.
       */
      if (args.confirm !== true) {
        const said = [
          `Not deleted. ${path} holds ${holds}.`,
          withDocuments
            ? total
              ? `Deleting it with its documents deletes ${total === 1 ? 'that document' : `all ${total} of them`} for good: no undo, no trash.`
              : 'There are no documents in it to delete.'
            : total || under.length
              ? `Deleting the folder alone moves what it holds up to ${goesTo}; nothing is lost.`
              : 'It is empty, so nothing else is affected.',
          links.length
            ? `${links.map((one) => pathOf(folders, one.id)).join(', ')} ${links.length === 1 ? 'is' : 'are'} shared, and the link stops working.`
            : null,
        ]
          .filter(Boolean)
          .join(' ');

        return refusedCard(
          `${said.replace(/[.]$/, '')} — ask the person, then call this again with confirm: true.`,
          forFolder(c, folders, folder, { did: 'deleted', ...facts }),
          {
            tool: 'tp_delete_folder',
            args: { folder: folder.id, ...(withDocuments ? { with_documents: true } : {}) },
            label:
              withDocuments && total
                ? `Delete folder and its ${total} document${total === 1 ? '' : 's'}`
                : 'Delete folder',
            note: withDocuments && total
              ? `The folder and the ${total} document${total === 1 ? '' : 's'} under it are deleted for good. There is no undo.`
              : total || under.length
                ? `Only the folder goes; the ${holds} in it move up to ${goesTo}.`
                : 'The folder is empty; deleting it loses nothing.',
          }
        );
      }

      const gone = await callApi(c, `/api/v1/folders/${segment(folder.id)}${withDocuments ? '?contents=delete' : ''}`, {
        method: 'DELETE',
      });

      if (gone.status !== 200) {
        return say(gone.body?.error ?? `That folder is not on this account (${gone.status}).`, true);
      }

      const deleted = Number(gone.body?.deleted ?? 0);

      /*
       * With something for the card to draw, for the reason tp_delete_document gives one: a host
       * that confirms by itself calls this with confirm: true the first time, and a card given
       * nothing would sit on "Waiting for the folder…".
       */
      return card(
        [
          `Deleted ${path}.`,
          withDocuments
            ? `${deleted} document${deleted === 1 ? '' : 's'} deleted with it.`
            : total || under.length
              ? `What it held — ${holds} — is now in ${goesTo}.`
              : null,
          links.length ? `Its link no longer opens.` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        {
          id: folder.id,
          name: folder.name,
          path,
          did: 'deleted',
          gone: true,
          deleted,
          ...facts,
          share: 'private',
          shareUrl: '',
          through: null,
          /* Where what it held went, which is where the person goes next. */
          open: parent
            ? `${selfOrigin(c)}/history?folder=${encodeURIComponent(parent.id)}`
            : `${selfOrigin(c)}/history`,
        }
      );
    },
  },

  tp_usage: {
    description:
      'What this account is using against its limits: bytes stored, documents held, and the ceiling on each. Ask this when a save was refused.',
    ui: ACCOUNT_CARD_URI,
    annotations: { title: 'Account usage', readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: { type: 'object', additionalProperties: false, properties: {} },
    run: async (c) => {
      const usage = await callApi(c, '/api/v1/usage');

      if (usage.status !== 200) {
        return say(usage.body?.error ?? `Could not read the usage (${usage.status}).`, true);
      }

      const { bytes: used, documents, limits } = usage.body;

      return card(
        [
          `${bytes(used)} of ${bytes(limits.bytes)} stored.`,
          `${documents} of ${limits.documents} documents.`,
          `One document may hold ${bytes(limits.documentBytes)} of Markdown.`,
          'Reaching a limit refuses the next save; nothing already saved is deleted to make room.',
        ].join('\n'),
        { usage: { bytes: used, maxBytes: limits.bytes, documents, maxDocuments: limits.documents } }
      );
    },
  },

  tp_delete_document: {
    description:
      'Permanently delete one document from this account, and its Markdown source with it. There is no undo and no trash. Pass confirm: true only when the person has named this document and asked for it to be deleted; ask them otherwise. Deletes exactly one; the only call that deletes several is tp_delete_folder with `with_documents`, which deletes everything in one folder.',
    ui: DELETE_CONFIRM_URI,
    annotations: {
      title: 'Delete a document',
      readOnlyHint: false,
      /* The one that cannot be taken back: no undo, no trash. */
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    writes: true,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'confirm'],
      properties: {
        id: { type: 'string', description: 'The document id.' },
        confirm: {
          type: 'boolean',
          description: 'True only when the person asked for this document to be deleted.',
        },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');

      if (!id) {
        return say('Which document? tp_list_documents prints the ids.', true);
      }

      if (args.confirm !== true) {
        /*
         * The refusal now knows what it refused. It reads the document first so the answer — and
         * the view attached to it — can name the thing rather than the id: "Q3-handbook.md, 119 kB"
         * is something a person can agree to, and an id is something they can only guess at.
         */
        const found = await callApi(c, `/api/v1/documents/${segment(id)}`);

        if (found.status !== 200) {
          return say(
            found.body?.error ?? `That document is not on this account (${found.status}).`,
            true
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: `Not deleted. ${found.body.document.name} is ${bytes(
                found.body.document.size
              )} and deleting it cannot be undone — ask the person, then call this again with confirm: true.\n\n(The card shows the person the document with a button to delete it. Do not repeat it; one line asking them to decide is enough.)`,
            },
          ],
          structuredContent: forCard(c, found.body.document),
          isError: true,
        };
      }

      // Read first for its name, which the view shows over "Deleted" rather than an id.
      const named = await callApi(c, `/api/v1/documents/${segment(id)}`);
      const gone = await callApi(c, `/api/v1/documents/${segment(id)}`, {
        method: 'DELETE',
      });

      if (gone.status !== 200) {
        return say(
          gone.body?.error ?? `That document is not on this account (${gone.status}).`,
          true
        );
      }

      /*
       * With something for the view to draw. A host that asks the person itself — ChatGPT does,
       * before any tool marked destructive — calls this with confirm: true the first time, and the
       * confirmation view is drawn beside the result; given no data it would keep offering to
       * delete a document that is already gone.
       */
      return card(`Deleted. ${id} and its source are gone.`, {
        id,
        name: named.status === 200 ? named.body.document.name : undefined,
        deleted: true,
      });
    },
  },
};

const LISTED = MCP_TOOL_NAMES.map((name) => ({
  name,
  title: TOOLS[name].annotations.title,
  description: TOOLS[name].description,
  inputSchema: TOOLS[name].inputSchema,
  annotations: TOOLS[name].annotations,
  /*
   * Two spellings of one link. `ui.resourceUri` is what the extension specifies and what a host
   * reading the current spec looks for; `openai/outputTemplate` is the older flat key that ChatGPT
   * and anything built against the Apps SDK still read. They point at the same resource, so a host
   * that honours either draws the same view.
   */
  ...(TOOLS[name].ui
    ? {
        _meta: {
          ui: { resourceUri: TOOLS[name].ui },
          'openai/outputTemplate': TOOLS[name].ui,
          /*
           * ChatGPT lets a card call a tool only when the tool says it may. The cards call these
           * back — a history reads an earlier text, a refused publish or delete runs on the
           * button — and without it every such button did nothing at all.
           */
          'openai/widgetAccessible': true,
        },
      }
    : {}),
}));

/*
 * The views this server ships, which is the whole of its MCP Apps surface.
 *
 * Six, one per shape an answer comes in — a document, a list of them, a delete to confirm, the
 * account and its folders, one folder, and the documentation — and every tool points at one of
 * them, so no answer reaches the person as text alone where the host can draw a card. Listed here
 * rather than in each place that mentions one, so `resources/list` and `resources/read` cannot come
 * to disagree about what exists.
 */
const VIEWS = [
  {
    uri: DOCUMENT_CARD_URI,
    name: 'Document card',
    description: 'The card drawn beside a document this connector saved, read, shared, updated or looked back on.',
    html: DOCUMENT_CARD_HTML,
  },
  {
    uri: DOCUMENT_LIST_URI,
    name: 'Document list',
    description: 'What is on the account, as a list whose rows open the document.',
    html: DOCUMENT_LIST_HTML,
  },
  {
    uri: DELETE_CONFIRM_URI,
    name: 'Delete confirmation',
    description:
      'The document a delete would remove, by name, with the button that removes it.',
    html: DELETE_CONFIRM_HTML,
  },
  {
    uri: ACCOUNT_CARD_URI,
    name: 'Account',
    description: 'How full the account is against its limits, and its folders as a tree whose rows open the folder.',
    html: ACCOUNT_CARD_HTML,
  },
  {
    uri: FOLDER_CARD_URI,
    name: 'Folder card',
    description: 'One folder this connector made, renamed, moved, filed documents in, shared or deleted: what it holds, who can read it, and a confirmation when one is needed.',
    html: FOLDER_CARD_HTML,
  },
  {
    uri: HELP_CARD_URI,
    name: 'Documentation',
    description: 'The sections of the documentation an answer came from, each opening its place on the docs page.',
    html: HELP_CARD_HTML,
  },
];

/* ---------------------------------------------------------------- the endpoint */

mcp.post('/', async (c) => {
  /*
   * Every message needs a token, `initialize` included.
   *
   * It was briefly otherwise, so that a directory could read the server's name and icon before
   * anybody connected — and Claude's own "Add custom connector" dialog read the 200 as the answer
   * to a different question. It probes with an unauthenticated `initialize`, and a server that
   * answers one is a server with no sign-in: the dialog selected "No sign-in", warned that anyone
   * with the URL could use the connector, and offered a header field for an API key we do not
   * take. The 401 is not a formality here, it is how a client learns there is an account behind
   * this at all — see `unauthorised`, which names the discovery document and the scopes.
   *
   * So the identity in `serverInfo` — the icon, the title, the sentence — is read after connecting
   * rather than before, and that is the trade: a picture in a listing is worth less than a
   * connector that knows it needs signing in to.
   */
  const caller = await resolveCaller(c);

  if (!caller) {
    return unauthorised(c, 'Sign in to TransformPipe');
  }

  /*
   * A cookie-authenticated call has to have come from us — see `cameFromUs`.
   *
   * This endpoint takes JSON-RPC and never looks at the content type, which means a form on
   * somebody else's page is a well-formed message to it, and the browser attaches the session
   * cookie. Nothing changes for the connectors: they present a bearer token, which is not a
   * credential a page can be made to send on the account holder's behalf.
   */
  if (caller.via === 'session' && !cameFromUs(c)) {
    return unauthorised(c, 'Sign in to TransformPipe');
  }

  for (const [key, value] of Object.entries(CORS)) {
    c.header(key, value);
  }

  const body = await c.req.json<Rpc>().catch(() => null);

  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return c.json(rpcError(body?.id ?? null, -32600, 'Not a JSON-RPC 2.0 request'), 400);
  }

  const { id, method } = body;
  const params = body.params ?? {};

  /*
   * A notification is a message with no id — that is the whole of the definition — and it gets no
   * response at all. Keying this on the method name instead meant a `tools/call` sent without an
   * id ran the tool and answered anyway, which is the one thing that must not happen: the work
   * was done and nothing asked for it.
   */
  if (!('id' in body) || body.id === undefined) {
    return c.body(null, 202);
  }

  if (method === 'initialize') {
    const asked = String(
      (params as { protocolVersion?: unknown }).protocolVersion ?? ''
    );

    // Minted because clients read it; never validated, because this server keeps no session.
    c.header('mcp-session-id', crypto.randomUUID());

    return c.json(
      rpc(id ?? null, {
        protocolVersion: SPOKEN.has(asked) ? asked : NEWEST,
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          /*
           * MCP Apps, declared the way the extension asks for: the one mime type we serve. A
           * client that has never heard of it ignores the key and reads the text answers.
           */
          extensions: {
            'io.modelcontextprotocol/ui': {
              mimeTypes: ['text/html;profile=mcp-app'],
            },
          },
        },
        serverInfo: serverInfo(c),
        instructions: INSTRUCTIONS,
      })
    );
  }

  if (method === 'ping') {
    return c.json(rpc(id ?? null, {}));
  }

  /*
   * One resource, and it is a user interface rather than anybody's data: the card a host draws
   * beside a document. Kept behind the same token as everything else — it says nothing about an
   * account, but a server with two auth rules is a server somebody gets wrong later.
   */
  if (method === 'resources/list') {
    return c.json(
      rpc(id ?? null, {
        resources: VIEWS.map(({ uri, name, description }) => ({
          uri,
          name,
          description,
          mimeType: 'text/html;profile=mcp-app',
        })),
      })
    );
  }

  if (method === 'resources/read') {
    const uri = String((params as { uri?: unknown }).uri ?? '');
    /*
     * By its name, whatever version the address carries. A host holds the tool list it fetched
     * when it connected, and with it the address each view had then: after a deploy that changed
     * a view, Claude and ChatGPT both asked for the old hash, were told there was no such
     * resource, and drew "Unable to reach TransformPipe" in place of every card until they
     * reconnected. An old address gets the current page — the same answer the unversioned one
     * always had.
     */
    const view = VIEWS.find((one) => unversioned(one.uri) === unversioned(uri));

    if (!view) {
      return c.json(rpcError(id ?? null, -32602, `No resource at ${uri}`), 200);
    }

    const origin = selfOrigin(c);

    return c.json(
      rpc(id ?? null, {
        contents: [
          {
            uri: view.uri,
            mimeType: 'text/html;profile=mcp-app',
            text: view.html,
            /*
             * The policy said out loud, and it is the strictest there is: these views fetch nothing
             * and load nothing, so every list is empty. ChatGPT's review asks for it declared
             * rather than left to the host's default, and warns in developer mode until it is.
             *
             * Two spellings again. `ui.csp` is the extension's, and it has no field for where a
             * view may send the reader; `openai/widgetCSP` does, and the one address in it is this
             * site's, because opening a document or its shared page is the only link any view
             * follows. `openai/widgetDomain` is the origin ChatGPT sandboxes these views under.
             * The standard `ui.domain` is left out on purpose: its format is the host's to define,
             * and a value Claude read differently would be a card Claude stopped drawing.
             */
            _meta: {
              ui: { prefersBorder: false, csp: { connectDomains: [], resourceDomains: [] } },
              'openai/widgetCSP': {
                connect_domains: [],
                resource_domains: [],
                redirect_domains: [origin],
              },
              'openai/widgetDomain': origin,
            },
          },
        ],
      })
    );
  }

  if (method === 'tools/list') {
    /*
     * A fixed list. A client fetches it once and holds it until it reconnects, so it must not grow
     * with the account: a tool per document would put its definition in front of every message the
     * person ever sends, and rename anything the moment they rename a file.
     */
    return c.json(
      rpc(id ?? null, { tools: LISTED })
    );
  }

  if (method === 'tools/call') {
    /*
     * Counted here rather than only inside /api/v1: two of these tools — the documentation and the
     * conversion — answer without touching the account at all, and an unmetered tool is a way to
     * spend this deployment's time for free. `initialize` and `tools/list` stay uncounted: a client
     * re-runs both every time it reconnects, and neither reads or writes anything.
     */
    const spend = await countCall(`${caller.via}:${caller.id}`);

    if (!spend.ok) {
      c.header('retry-after', String(spend.retryAfter));

      return c.json(
        rpc(
          id ?? null,
          say(
            `Too many calls — the limit is ${RATE.perMinute} a minute. Try again in ${spend.retryAfter}s.`,
            true
          )
        )
      );
    }

    const name = String((params as { name?: unknown }).name ?? '');
    const tool = (TOOLS as Record<string, Tool | undefined>)[name];

    if (!tool) {
      return c.json(
        rpc(
          id ?? null,
          say(
            `There is no tool called ${name}. tools/list has the ones there are.`,
            true
          )
        )
      );
    }

    if (tool.writes && !mayWrite(caller)) {
      return c.json(
        rpc(
          id ?? null,
          say(
            'This connection was granted read-only access, so it cannot save, share or delete. Reconnect it and approve writing if that is what you want.',
            true
          )
        )
      );
    }

    const args = ((params as { arguments?: unknown }).arguments ?? {}) as Record<
      string,
      unknown
    >;

    /*
     * Counted by tool name and how the caller arrived, beside the call rather than ahead of it.
     * Never the account: see server/usage.ts. It cannot reject, so it cannot fail the tool.
     */
    const counted = countServerEvent('mcp', name, caller.via);

    try {
      const [result] = await Promise.all([tool.run(c, args, caller), counted]);

      return c.json(rpc(id ?? null, result));
    } catch (cause) {
      /*
       * A thrown error is still a tool answer when it happened inside one: the client should get a
       * sentence it can act on, not a transport failure it cannot.
       */
      const why = cause instanceof Error ? cause.message : String(cause);

      await counted;

      return c.json(rpc(id ?? null, say(`That did not work: ${why}`, true)));
    }
  }

  return c.json(rpcError(id ?? null, -32601, `No method "${method}"`));
});

export default mcp;
