#!/usr/bin/env node
/* tp — publish Markdown from a terminal.
 *
 *   tp login tp_live_…                  remember a key for this machine
 *   tp push README.md --share            convert and publish; prints the link
 *   tp push docs/*.md --merge --share    chain several files into one document
 *   tp list                              what is in the account
 *   tp rm <id>                           delete one
 *   tp usage                             how much room is left
 *
 * No dependencies on purpose: a tool people run in CI should not drag a tree of packages behind
 * it, and everything here is one fetch and some printing.
 */
import { chmodSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const HOST = process.env.TP_HOST ?? 'https://transformpipe.com';
const CONFIG_DIR = join(homedir(), '.config', 'tp');
const CONFIG = join(CONFIG_DIR, 'config.json');

const args = process.argv.slice(2);
const command = args.shift();

/** Flags anywhere, files anywhere: `tp push --share a.md b.md` reads the way people type it. */
function parse(argv) {
  const flags = {};
  const rest = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      rest.push(arg);
      continue;
    }

    const [name, inline] = arg.slice(2).split('=');
    const next = argv[i + 1];

    if (inline !== undefined) {
      flags[name] = inline;
    } else if (next && !next.startsWith('--')) {
      flags[name] = next;
      i += 1;
    } else {
      flags[name] = true;
    }
  }

  return { flags, rest };
}

const { flags, rest } = parse(args);

function storedKey() {
  try {
    return JSON.parse(readFileSync(CONFIG, 'utf8')).key ?? null;
  } catch {
    return null;
  }
}

function key() {
  const found = flags.key ?? process.env.TP_API_KEY ?? storedKey();

  if (!found) {
    fail(
      'No API key. Run `tp login tp_live_…`, set TP_API_KEY, or pass --key.\n' +
        `Create one in the account menu at ${HOST}`
    );
  }

  return found;
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

async function call(path, options = {}) {
  const response = await fetch(`${HOST}/api/v1${path}`, {
    ...options,
    headers: { authorization: `Bearer ${key()}`, ...(options.headers ?? {}) },
  });

  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch {
    body = { error: text.slice(0, 200) };
  }

  if (!response.ok) {
    // The API says what went wrong in words; repeating them beats inventing our own.
    fail(`${body.error ?? response.statusText} (${response.status})`);
  }

  return body;
}

const bytes = (n) =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} kB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

/*
 * Which conversion a file is, by its extension.
 *
 * A copy of what `shared/conversions.ts` says, on purpose: this client ships as one file with no
 * dependencies and no build step, and importing the app's modules would end that. It is a short
 * list and the endpoint checks it again, so a copy that falls behind gets a 400 naming the kinds
 * rather than quietly storing HTML as if it were Markdown — which is what happened before.
 */
const KIND_BY_EXTENSION = {
  '.html': 'html-to-markdown',
  '.htm': 'html-to-markdown',
  '.xhtml': 'html-to-markdown',
  '.csv': 'csv-to-markdown',
  '.tsv': 'csv-to-markdown',
  '.json': 'json-to-markdown',
  '.docx': 'word-to-markdown',
  // Notion, Confluence and Obsidian exports are all just a .zip — nothing in the name says which,
  // and this client has no page to disambiguate by the way the app does. Refused below, the same
  // as .docx.
  '.zip': 'zip-export',
  '.xlsx': 'excel-to-markdown',
  '.pptx': 'powerpoint-to-markdown',
  '.epub': 'epub-to-markdown',
  '.odt': 'odt-to-markdown',
  '.rtf': 'rtf-to-markdown',
};

function kindFor(name) {
  const dot = name.toLowerCase().lastIndexOf('.');

  return KIND_BY_EXTENSION[dot === -1 ? '' : name.toLowerCase().slice(dot)] ?? null;
}

async function push() {
  const files = rest;

  if (files.length === 0) {
    fail('Which file? `tp push README.md --share`');
  }

  const share = flags.share === true ? 'link' : flags.share;

  if (share && share !== 'link' && share !== 'people') {
    fail('--share takes `link` or `people`');
  }

  const sources = files.map((file) => {
    if (!existsSync(file)) {
      fail(`No such file: ${file}`);
    }

    const name = basename(file);
    const kind = kindFor(name);

    if (kind === 'word-to-markdown') {
      fail(`${name}: a .docx is read in the browser. Convert it at ${HOST}/word-to-markdown and push the Markdown.`);
    }

    if (kind === 'zip-export') {
      fail(`${name}: a Notion, Confluence or Obsidian export is read in the browser. Convert it at ${HOST}/notion-to-markdown, ${HOST}/confluence-to-markdown or ${HOST}/obsidian-to-markdown and push the Markdown.`);
    }

    if (kind === 'excel-to-markdown') {
      fail(`${name}: an .xlsx is read in the browser. Convert it at ${HOST}/excel-to-markdown and push the Markdown.`);
    }

    if (kind === 'powerpoint-to-markdown') {
      fail(`${name}: a .pptx is read in the browser. Convert it at ${HOST}/powerpoint-to-markdown and push the Markdown.`);
    }

    if (kind === 'epub-to-markdown') {
      fail(`${name}: an .epub is read in the browser. Convert it at ${HOST}/epub-to-markdown and push the Markdown.`);
    }

    if (kind === 'odt-to-markdown' || kind === 'rtf-to-markdown') {
      fail(`${name}: an ${kind === 'odt-to-markdown' ? '.odt' : '.rtf'} is read in the browser. Convert it at ${HOST}/${kind.replace('-to-markdown', '')}-to-markdown and push the Markdown.`);
    }

    return { name, kind, markdown: readFileSync(file, 'utf8') };
  });

  const converted = sources.filter((one) => one.kind !== null);

  if (flags.merge && converted.length > 0) {
    fail(
      `--merge chains Markdown files. Push ${converted.map((one) => one.name).join(', ')} on ${converted.length > 1 ? 'their' : 'its'} own first.`
    );
  }

  // A version links one document to one earlier one — meaningless to spread across several pushes.
  if (flags.replaces && (files.length > 1 && !flags.merge)) {
    fail('--replaces takes one document. Push one file, or --merge several into one first.');
  }

  // Several files become one document when asked; otherwise each stands on its own.
  const documents = flags.merge
    ? [
        {
          name:
            flags.name ??
            (sources.length > 1
              ? `${sources[0].name} + ${sources.length - 1} more`
              : sources[0].name),
          markdown: sources.map((s) => s.markdown.trim()).join('\n\n---\n\n'),
        },
      ]
    : sources.map((s) => ({ name: flags.name ?? s.name, kind: s.kind, markdown: s.markdown }));

  const results = [];

  for (const document of documents) {
    const query = new URLSearchParams({ name: document.name });

    if (share) {
      query.set('share', share);
    }

    if (flags.replaces) {
      query.set('replaces', flags.replaces);
    }

    // The server converts it; what comes back is the Markdown, named after the file.
    if (document.kind) {
      query.set('kind', document.kind);
    }

    const { document: created } = await call(`/documents?${query}`, {
      method: 'POST',
      headers: { 'content-type': 'text/markdown' },
      body: document.markdown,
    });

    results.push(created);
  }

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const document of results) {
    console.log(
      `${document.name}  ${bytes(document.size)}  ${document.words} words`
    );
    console.log(`  ${document.share.url ?? `${HOST}/history (not shared)`}`);
  }
}

async function list() {
  const query = flags.q ? `?q=${encodeURIComponent(flags.q)}` : '';
  const { documents } = await call(`/documents${query}`);

  if (flags.json) {
    console.log(JSON.stringify(documents, null, 2));
    return;
  }

  if (documents.length === 0) {
    console.log('Nothing here yet. `tp push README.md --share`');
    return;
  }

  for (const document of documents) {
    const shared = document.share.url ? document.share.url : 'private';

    console.log(
      `${document.id}  ${document.name.padEnd(32).slice(0, 32)}  ${bytes(document.size).padStart(8)}  ${shared}`
    );
  }
}

async function remove() {
  if (rest.length === 0) {
    fail('Which one? `tp rm <id>` — `tp list` shows the ids.');
  }

  for (const id of rest) {
    await call(`/documents/${id}`, { method: 'DELETE' });
    console.log(`deleted ${id}`);
  }
}

async function versions() {
  const id = rest[0];

  if (!id) {
    fail('Which one? `tp versions <id>` — `tp list` shows the ids.');
  }

  const { versions: chain } = await call(`/documents/${id}/versions`);

  if (flags.json) {
    console.log(JSON.stringify(chain, null, 2));
    return;
  }

  for (const version of chain) {
    console.log(`${version.id}  ${version.name.padEnd(32).slice(0, 32)}  ${version.created_at}`);
  }
}

async function summary() {
  const id = rest[0];

  if (!id) {
    fail('Which one? `tp summary <id>` — `tp list` shows the ids.');
  }

  const query = flags.force ? '?force=1' : '';
  const result = await call(`/documents/${id}/summary${query}`, { method: 'POST' });

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(result.summary);
}

async function usage() {
  const used = await call('/usage');

  if (flags.json) {
    console.log(JSON.stringify(used, null, 2));
    return;
  }

  console.log(
    `${bytes(used.bytes)} of ${bytes(used.limits.bytes)} · ${used.documents} of ${used.limits.documents} documents`
  );
}

function login() {
  const token = rest[0];

  if (!token?.startsWith('tp_live_')) {
    fail('Pass the key: `tp login tp_live_…`');
  }

  /*
   * The key is a credential, so the file holding it is the owner's business and nobody else's.
   *
   * `mode` on writeFileSync only applies when the file is created: a config.json already sitting
   * there with 0644 keeps 0644 and the new key inherits the old permissions. Hence the chmod after
   * the write, which says what is meant whether the file is new or not. The directory is created
   * 0700 for the same reason — a key nobody can read in a directory anybody can list is halfway
   * to the point.
   */
  mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG, JSON.stringify({ key: token }, null, 2), { mode: 0o600 });
  chmodSync(CONFIG, 0o600);
  console.log(`Saved to ${CONFIG}`);
}

const commands = { push, list, rm: remove, usage, login, summary, versions };

if (!command || command === '--help' || command === '-h') {
  console.log(
    [
      'tp — publish Markdown from a terminal',
      '',
      '  tp login tp_live_…               remember a key for this machine',
      '  tp push README.md --share         convert and publish; prints the link',
      '  tp push docs/*.md --merge --share chain several files into one document',
      '  tp push v2.md --replaces <id>     link this push to an earlier document as a new version',
      '  tp list --q invoice               what is in the account, matching name or content',
      '  tp versions <id>                  every document in the same chain, oldest first',
      '  tp rm <id>                        delete one',
      '  tp summary <id>                   a short summary, generated once and cached',
      '  tp usage                          how much room is left',
      '',
      'Options: --key, --name, --share link|people, --merge, --replaces, --force, --json',
      '',
      '`tp login` leaves the key in your shell history. TP_API_KEY in the environment does not.',
      `Host:    ${HOST}  (TP_HOST to point elsewhere)`,
    ].join('\n')
  );
  process.exit(0);
}

if (!commands[command]) {
  fail(`Unknown command: ${command}. Try \`tp --help\`.`);
}

await commands[command]();
