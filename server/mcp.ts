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
import { countCall, QUOTA, RATE } from './limits.js';
import { markdownToHtml } from './render.js';
import {
  DELETE_CONFIRM_HTML,
  DELETE_CONFIRM_URI,
  DOCUMENT_CARD_HTML,
  DOCUMENT_CARD_URI,
  DOCUMENT_LIST_HTML,
  DOCUMENT_LIST_URI,
} from './ui-card.js';
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
      'Convert documents to Markdown and back — Word, PDF, spreadsheets, HTML, CSV and more — and keep, search and share them on your own TransformPipe account.',
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

Three things worth holding on to. tp_save_document with a share mode publishes a page on the public web, so share a document only when the person asked for it. tp_delete_document is permanent and has no undo. tp_convert_markdown returns the whole document through this conversation, so for anything long, save it and share the link instead.

tp_help answers questions about how TransformPipe works; use it rather than answering from memory.`;

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
    share?: { mode?: string; url?: string | null };
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

const card = (text: string, data: Record<string, unknown>) => ({
  content: [{ type: 'text', text }],
  structuredContent: data,
  isError: false,
});

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
 * `destructiveHint` defaults to true for anything not read-only, so the tools that create or
 * update say `false` explicitly — otherwise saving a document reads as dangerous as deleting one.
 */
interface ToolAnnotations {
  title: string;
  readOnlyHint: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

interface Tool {
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: ToolAnnotations;
  /**
   * The `ui://` resource a host may draw beside this tool's answer — MCP Apps, SEP-1865.
   *
   * Only on the tools that hand back a document, and only ever as an addition: the `content` a
   * model reads is the same with or without it, so a host that draws nothing loses nothing.
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

const describe = (document: {
  id: string;
  name: string;
  /* Which conversion made it: the row's address on the site is that conversion's page. */
  kind: string;
  size: number;
  words?: number;
  created_at: string;
  share: { mode: string; url: string | null };
}) =>
  [
    `${document.name}`,
    `  id: ${document.id}`,
    `  ${bytes(document.size)}${document.words ? ` · ${document.words} words` : ''} · ${new Date(
      document.created_at
    ).toISOString().slice(0, 10)} · ${document.share.mode}`,
    document.share.url ? `  ${document.share.url}` : null,
  ]
    .filter(Boolean)
    .join('\n');

/*
 * Keyed by name, and the names come from the module the documentation page reads. TypeScript then
 * insists the two agree: a tool renamed here and not there stops the build, which is the only way a
 * page describing a tool cannot outlive the tool.
 */
const TOOLS: Record<McpToolName, Tool> = {
  tp_help: {
    description:
      'The TransformPipe documentation itself: what Markdown it understands, what happens to a file, what is stored and what is not, how sharing works, the limits, and the HTTP API. Use this to answer any question about how TransformPipe works INSTEAD of answering from memory. Ask a question to get the sections that answer it, or call it with nothing for all of them.',
    annotations: { title: 'TransformPipe documentation', readOnlyHint: true, openWorldHint: false },
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

      const sections = DOCS_SECTIONS.map((section) => ({
        title: section.title,
        text: section.summary,
        hits: score(`${section.title} ${section.summary}`),
      }));

      const questions = FAQ_ENTRIES.map((entry) => ({
        title: entry.question,
        text: entry.answer,
        hits: score(`${entry.question} ${entry.answer}`),
      }));

      const all = [...sections, ...questions];
      const hit = all.filter((entry) => entry.hits > 0);
      const shown = (question.length > 0 && hit.length > 0 ? hit : all).sort(
        (a, b) => b.hits - a.hits
      );

      return say(
        clip(
          [
            `TransformPipe — ${selfOrigin(c)} · full documentation at ${selfOrigin(c)}/docs`,
            '',
            ...shown.map((entry) => `## ${entry.title}\n${entry.text}`),
          ].join('\n')
        )
      );
    },
  },

  tp_convert_markdown: {
    description:
      'Convert Markdown to sanitised HTML and return it. GitHub Flavored Markdown; raw HTML in the source goes through a sanitiser, so a script tag in a file someone sent cannot survive. `standalone: true` returns a complete self-contained document with its styles inlined — the same file the app downloads. Nothing is saved to the account. For anything long, prefer tp_save_document and share the link: what this returns has to travel back through the conversation.',
    annotations: { title: 'Markdown to HTML', readOnlyHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['markdown'],
      properties: {
        markdown: { type: 'string', description: 'The Markdown source.' },
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

      const body = markdownToHtml(markdown);

      if (!args.standalone) {
        return say(clip(body));
      }

      return say(
        clip(
          buildStandaloneHtml({
            title: String(args.name ?? 'document'),
            body,
            createdAt: Date.now(),
            theme: args.theme === 'dark' ? 'dark' : 'light',
          })
        )
      );
    },
  },

  tp_convert_to_markdown: {
    description:
      'Convert HTML, CSV, TSV, JSON, plain text, rich text (.rtf) or an Evernote export (.enex) to Markdown and return it. `from` says which. Nothing is saved to the account; to keep the result, pass the same source and `from` to tp_save_document, which stores it and records what it was made from. A file that is bytes rather than text cannot come through a tool — a .docx, .xlsx, .pptx, .epub, .odt or an export .zip is an archive — so those convert in the app, or by POSTing the file to /api/v1/documents?kind=word-to-markdown and the rest.',
    ui: DOCUMENT_CARD_URI,
    annotations: { title: 'Convert to Markdown', readOnlyHint: true, openWorldHint: false },
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

        return card(clip(markdown), forConversion(named, markdown));
      }

      if (from === 'csv' || from === 'tsv') {
        const table = delimitedToMarkdown(source, {
          delimiter: from === 'tsv' ? '\t' : undefined,
        });

        return table
          ? card(clip(table), forConversion(named, table))
          : say('That has no rows in it.', true);
      }

      if (from === 'json') {
        try {
          const markdown = jsonToMarkdown(source, {
            title: String(args.name ?? 'document').replace(/\.[^.]+$/, ''),
          });

          return card(clip(markdown), forConversion(named, markdown));
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

        return card(clip(markdown), forConversion(named, markdown));
      }

      if (from === 'rtf' || from === 'enex') {
        const title = String(args.name ?? 'document').replace(/\.[^.]+$/, '');

        try {
          const markdown =
            from === 'rtf'
              ? (await import('../shared/from-rtf.js')).rtfToMarkdown(source, title)
              : (await import('../shared/from-evernote.js')).evernoteToMarkdown(source, title);

          return card(clip(markdown), forConversion(named, markdown));
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
      'Save a document to this TransformPipe account, and optionally publish it in the same call. Markdown by default; pass `from` to send HTML, CSV, TSV or JSON instead, which is converted on the way in and recorded as what it was made from. Returns the id, the size and — when shared — the URL. `share: "link"` is anyone holding the URL, `"people"` narrows it to the addresses in `emails`, `"private"` is nobody but the owner. Publishing makes a page on the public web: share a document the person actually asked to share. `replaces` links this save to an earlier document as a new version of it — only when asked for; a save with nothing said about it is always a new, unrelated document.',
    ui: DOCUMENT_CARD_URI,
    annotations: {
      title: 'Save a document',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
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
            'Id of an earlier document this is a new version of. tp_list_documents prints ids.',
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
      const query = new URLSearchParams({ name });

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
          created.body?.error ?? `The save failed (${created.status}).`,
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

        return say(
          `Saved ${document.name} (id ${document.id}, ${bytes(document.size)}) and shared it with ${
            (shared.body.emails ?? []).join(', ') || 'nobody yet'
          }.\n${shared.body.url ?? ''}`.trim()
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
              : 'It is private. Share it with tp_share_document when asked.',
        ].join('\n'),
        forCard(c, document, markdown)
      );
    },
  },

  tp_list_documents: {
    description:
      'What is on this TransformPipe account: documents with their names, sizes, dates and whether each is shared. Start here when the question is "what have I got". `query` matches a document by its name or by what is written inside it. Prints the id of each, which is what the other tools take.',
    ui: DOCUMENT_LIST_URI,
    annotations: { title: 'List documents', readOnlyHint: true, openWorldHint: false },
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
      },
    },
    run: async (c, args) => {
      const listed = await callApi(c, '/api/v1/documents');

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
          `/api/v1/documents?q=${encodeURIComponent(needle)}`
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

      if (matching.length === 0) {
        return say(
          needle
            ? `Nothing on this account has "${needle}" in its name or content.`
            : 'This account has no documents yet.'
        );
      }

      const limit = Math.min(Math.max(Number(args.limit ?? 50) || 50, 1), 200);
      const shown = matching.slice(0, limit);

      return card(
        clip(
          [
            `${shown.length} of ${matching.length} shown, newest first.`,
            '',
            ...shown.map(describe),
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
          })),
        }
      );
    },
  },

  tp_get_document: {
    description:
      'One document from this account, by the id tp_list_documents printed: its Markdown source, or the rendered HTML.',
    ui: DOCUMENT_CARD_URI,
    annotations: { title: 'Read a document', readOnlyHint: true, openWorldHint: false },
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

      return card(
        clip(
          `${document.name} — ${bytes(document.size)}\n\n${document.markdown ?? ''}`
        ),
        forCard(c, document, document.markdown ?? '')
      );
    },
  },

  tp_summarize_document: {
    description:
      'A three-to-five sentence summary of one document, generated by a model and cached on the account so asking again is free. Pass `force: true` to regenerate. Summaries are metered separately from ordinary calls, at a per-day limit per account.',
    annotations: {
      title: 'Summarise a document',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
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
      const summarized = await callApi(
        c,
        `/api/v1/documents/${segment(id)}/summary${query}`,
        { method: 'POST' }
      );

      if (summarized.status !== 200) {
        return say(
          summarized.body?.error ?? `Could not summarise that document (${summarized.status}).`,
          true
        );
      }

      return say(summarized.body.summary);
    },
  },

  tp_document_versions: {
    description:
      'Every document linked to this one as a version of the same thing, oldest first — the chain built by tp_save_document\'s `replaces`. Empty unless somebody deliberately linked documents together; nothing links them on its own.',
    annotations: { title: 'Document versions', readOnlyHint: true, openWorldHint: false },
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Any document id in the chain.' },
      },
    },
    run: async (c, args) => {
      const id = String(args.id ?? '');

      if (!id) {
        return say('Which document? tp_list_documents prints the ids.', true);
      }

      const found = await callApi(c, `/api/v1/documents/${segment(id)}/versions`);

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

      if (chain.length <= 1) {
        return say('This document has no other versions linked to it.');
      }

      return say(
        clip(
          chain
            .map(
              (version) =>
                `${version.name}\n  id: ${version.id}\n  ${new Date(version.created_at).toISOString().slice(0, 10)}`
            )
            .join('\n')
        )
      );
    },
  },

  tp_share_document: {
    description:
      'Change who may open a document. "link" is anyone holding the URL, "people" is only the addresses given, "private" revokes the link entirely — a URL already sent stops working. `emails` REPLACES the list rather than adding to it. Returns the mode, the URL and the addresses as they now stand.',
    annotations: {
      title: 'Share a document',
      readOnlyHint: false,
      /* It publishes a page anyone holding the link can read, which is not destruction but is not
       * nothing either — hence the sentence in the description and `idempotentHint`, because
       * setting the same audience twice is the same share. */
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
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
          description: 'The whole address list, for mode "people".',
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

      const changed = await callApi(c, `/api/v1/documents/${segment(id)}/share`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode,
          ...(Array.isArray(args.emails) ? { emails: args.emails } : {}),
        }),
      });

      if (changed.status !== 200) {
        return say(
          changed.body?.error ?? `That did not work (${changed.status}).`,
          true
        );
      }

      const emails = (changed.body.emails ?? []) as string[];

      return say(
        [
          `Now ${changed.body.mode}.`,
          changed.body.url ? changed.body.url : 'The link is revoked, so one already sent no longer opens.',
          emails.length > 0 ? `Readers: ${emails.join(', ')}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      );
    },
  },

  tp_usage: {
    description:
      'What this account is using against its limits: bytes stored, documents held, and the ceiling on each. Ask this when a save was refused.',
    annotations: { title: 'Account usage', readOnlyHint: true, openWorldHint: false },
    inputSchema: { type: 'object', additionalProperties: false, properties: {} },
    run: async (c) => {
      const usage = await callApi(c, '/api/v1/usage');

      if (usage.status !== 200) {
        return say(usage.body?.error ?? `Could not read the usage (${usage.status}).`, true);
      }

      const { bytes: used, documents, limits } = usage.body;

      return say(
        [
          `${bytes(used)} of ${bytes(limits.bytes)} stored.`,
          `${documents} of ${limits.documents} documents.`,
          `One document may hold ${bytes(limits.documentBytes)} of Markdown.`,
          'Reaching a limit refuses the next save; nothing already saved is deleted to make room.',
        ].join('\n')
      );
    },
  },

  tp_delete_document: {
    description:
      'Permanently delete one document from this account, and its Markdown source with it. There is no undo and no trash. Pass confirm: true only when the person has named this document and asked for it to be deleted; ask them otherwise. Deletes exactly one — there is no tool that deletes several.',
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
              )} and deleting it cannot be undone — ask the person, then call this again with confirm: true.`,
            },
          ],
          structuredContent: forCard(c, found.body.document),
          isError: true,
        };
      }

      const gone = await callApi(c, `/api/v1/documents/${segment(id)}`, {
        method: 'DELETE',
      });

      if (gone.status !== 200) {
        return say(
          gone.body?.error ?? `That document is not on this account (${gone.status}).`,
          true
        );
      }

      return say(`Deleted. ${id} and its source are gone.`);
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
        },
      }
    : {}),
}));

/*
 * The views this server ships, which is the whole of its MCP Apps surface.
 *
 * Two, and each is a shape the text answer could not be: a document, and what is on the account.
 * Listed here rather than in each place that mentions one, so `resources/list` and `resources/read`
 * cannot come to disagree about what exists.
 */
const VIEWS = [
  {
    uri: DOCUMENT_CARD_URI,
    name: 'Document card',
    description: 'The card drawn beside a document this connector saved or read.',
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
    const view = VIEWS.find((one) => one.uri === uri);

    if (!view) {
      return c.json(rpcError(id ?? null, -32602, `No resource at ${uri}`), 200);
    }

    return c.json(
      rpc(id ?? null, {
        contents: [
          {
            uri: view.uri,
            mimeType: 'text/html;profile=mcp-app',
            text: view.html,
            /* No domains declared: these fetch nothing, so the host's strictest policy fits. */
            _meta: { ui: { prefersBorder: false } },
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

    try {
      return c.json(rpc(id ?? null, await tool.run(c, args, caller)));
    } catch (cause) {
      /*
       * A thrown error is still a tool answer when it happened inside one: the client should get a
       * sentence it can act on, not a transport failure it cannot.
       */
      const why = cause instanceof Error ? cause.message : String(cause);

      return c.json(rpc(id ?? null, say(`That did not work: ${why}`, true)));
    }
  }

  return c.json(rpcError(id ?? null, -32601, `No method "${method}"`));
});

export default mcp;
