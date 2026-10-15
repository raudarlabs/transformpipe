#!/usr/bin/env node
/* tp — publish Markdown from a terminal.
 *
 *   tp login tp_live_…                  remember a key for this machine
 *   tp push README.md --share            convert and publish; prints the link
 *   tp push docs/*.md --merge --share    chain several files into one document
 *   tp list                              what is in the account
 *   tp push notes.md --folder Team/Notes file it in a folder, made if it is not there
 *   tp folders                           the folder tree
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

/*
 * Flags that never take a value. Without the list, `tp push --merge a.md b.md` took a.md as the
 * value of --merge and pushed b.md alone, and `tp share-folder --link Docs` lost the folder.
 */
const SWITCHES = new Set(['merge', 'json', 'force', 'password', 'link', 'private', 'with-documents']);

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
    } else if (next && !next.startsWith('--') && !SWITCHES.has(name)) {
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
  // An .enex is XML, so unlike the rest of these the server can read it straight from the body.
  '.enex': 'evernote-to-markdown',
};

function kindFor(name) {
  const dot = name.toLowerCase().lastIndexOf('.');

  return KIND_BY_EXTENSION[dot === -1 ? '' : name.toLowerCase().slice(dot)] ?? null;
}

/**
 * `--expires 7d`, `--expires 12h` or `--expires 2026-12-31`, as the instant the API takes.
 *
 * A bare date means the end of that day where the person typing it is — "until the 31st" is read
 * the way it is said, and the server is given the exact moment so it never has to guess a zone.
 */
function expiresAt(value) {
  const relative = /^(\d+)([hd])$/.exec(value);

  if (relative) {
    const hours = Number(relative[1]) * (relative[2] === 'd' ? 24 : 1);

    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (day) {
    return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]), 23, 59, 59).toISOString();
  }

  fail('--expires takes a length like 7d or 12h, or a date like 2026-12-31');
}

/*
 * Folders, by id or by path.
 *
 * A path is the names from the top down, `/` between them — `"Devart AI/Home"` — matched without
 * regard to case, because that is how people remember a name they did not type. The tree comes in
 * one request and every path is worked out from it here; the API has no lookup by name, and a
 * folder tree is small enough that it does not need one. A folder whose own name holds a `/` can
 * only be reached by its id, which `tp folders` prints.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `-`, `/` and `none` all mean "in no folder" wherever a folder is asked for. */
const NOWHERE = new Set(['-', '/', 'none']);

let tree = null;

async function folderTree() {
  if (!tree) {
    const { folders } = await call('/folders');

    tree = { folders, byId: new Map(folders.map((one) => [one.id, one])) };
  }

  return tree;
}

function pathOf(id) {
  if (!tree) {
    return id;
  }

  const names = [];

  // Bounded by the number of folders, so a loop in the data cannot hang the terminal.
  for (let at = tree.byId.get(id), n = 0; at && n <= tree.folders.length; at = tree.byId.get(at.parent_id), n += 1) {
    names.unshift(at.name);
  }

  return names.join('/');
}

const childrenOf = (parent) => tree.folders.filter((one) => (one.parent_id ?? null) === parent);

/**
 * The folder id a spec names, or null for "no folder". With `create`, the parts of a path that do
 * not exist yet are made, parent by parent — the way `mkdir -p` would.
 */
async function resolveFolder(spec, { create = false, flag = 'folder' } = {}) {
  if (spec === true || spec === '') {
    fail(`--${flag} takes a folder: its id from \`tp folders\`, or a path like "Team/Notes"`);
  }

  const text = String(spec).trim();

  if (NOWHERE.has(text.toLowerCase())) {
    return null;
  }

  await folderTree();

  if (tree.byId.has(text)) {
    return text;
  }

  if (UUID.test(text)) {
    fail(`No folder ${text} on this account. \`tp folders\` lists them.`);
  }

  let parent = null;

  for (const name of text.split('/').map((part) => part.trim()).filter(Boolean)) {
    const found = childrenOf(parent).filter((one) => one.name.toLowerCase() === name.toLowerCase());

    if (found.length > 1) {
      fail(`"${name}" is ${found.length} folders${parent ? ` in ${pathOf(parent)}` : ''}: ${found.map((one) => one.id).join(', ')}. Use the id.`);
    }

    if (found.length === 1) {
      parent = found[0].id;
      continue;
    }

    if (!create) {
      fail(`No folder "${name}"${parent ? ` in ${pathOf(parent)}` : ''}. \`tp folders\` lists them; \`tp mkdir\` makes one.`);
    }

    const { folder } = await call('/folders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, parent_id: parent }),
    });

    tree.folders.push({ ...folder, documents: 0 });
    tree.byId.set(folder.id, tree.folders.at(-1));
    parent = folder.id;
  }

  return parent;
}

/** The page a shared folder is read at, or null while it is private. */
const folderUrl = (folder) =>
  folder.share_token && folder.share_mode !== 'private' ? `${HOST}/f/${folder.share_token}` : null;

async function push() {
  const files = rest;

  if (files.length === 0) {
    fail('Which file? `tp push README.md --share`');
  }

  const share = flags.share === true ? 'link' : flags.share;

  if (share && share !== 'link' && share !== 'people') {
    fail('--share takes `link` or `people`');
  }

  if (flags.expires && !share) {
    fail('--expires ends a shared link. Add --share, or there is no link to end.');
  }

  const ends = flags.expires ? expiresAt(String(flags.expires)) : null;

  /*
   * From the environment and never from the flag's value: an argument is kept in the shell's
   * history, and in every process listing while it runs.
   */
  const password = flags.password ? process.env.TP_SHARE_PASSWORD : null;

  if (flags.password && share !== 'link') {
    fail('--password protects a link. Add --share, or --share link.');
  }

  if (flags.password && !password) {
    fail('--password reads the password from TP_SHARE_PASSWORD, so it stays out of your shell history.');
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

  /*
   * The same document with new text: same id, same link, same password and end, and the text it
   * replaces kept as a revision on the server. Markdown only, one document, and nothing about the
   * link — what the link is stays what it was.
   */
  if (flags.update) {
    if (flags.update === true) {
      fail('--update takes the id of the document to update: `tp push notes.md --update <id>`');
    }

    if (flags.replaces) {
      fail('--update changes the text of one document; --replaces makes a new one beside it. Pick one.');
    }

    if (share || flags.expires || flags.password) {
      fail('--update keeps the link as it is. Drop --share, --expires and --password, or change them on the site.');
    }

    if (documents.length !== 1) {
      fail('--update takes one document. Push one file, or --merge several into one.');
    }

    if (documents[0].kind) {
      fail(`${documents[0].name}: --update takes Markdown. Push a new document instead.`);
    }

    const answer = await call(`/documents/${encodeURIComponent(String(flags.update))}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        markdown: documents[0].markdown,
        ...(typeof flags.name === 'string' ? { name: flags.name } : {}),
      }),
    });

    // The text in place, then the filing: a PUT is about what it says, not where it is kept.
    if (flags.folder !== undefined) {
      const folder = await resolveFolder(flags.folder, { create: true });

      await call('/documents/move', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [answer.document.id], folder_id: folder }),
      });

      answer.document.folder_id = folder;
    }

    if (flags.json) {
      console.log(JSON.stringify(answer, null, 2));
      return;
    }

    const updated = answer.document;

    console.log(`${updated.name}  ${bytes(updated.size)}  ${updated.words} words`);
    console.log(`  ${answer.changed ? 'updated' : 'unchanged — the text is the same'}`);
    console.log(`  ${updated.share.url ?? `${HOST}/history (not shared)`}`);

    if (flags.folder !== undefined) {
      console.log(`  in ${updated.folder_id ? pathOf(updated.folder_id) : 'no folder'}`);
    }

    return;
  }

  // Made before the first upload, so a folder that cannot be made stops the push before it starts.
  const folder = flags.folder !== undefined ? await resolveFolder(flags.folder, { create: true }) : null;
  const results = [];

  for (const document of documents) {
    const query = new URLSearchParams({ name: document.name });

    if (share) {
      query.set('share', share);
    }

    if (ends) {
      query.set('expires_at', ends);
    }

    if (flags.replaces) {
      query.set('replaces', flags.replaces);
    }

    if (folder) {
      query.set('folder', folder);
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

    if (password) {
      // Set after the document exists, in a body: a password in a query string is in every log.
      const shared = await call(`/documents/${created.id}/share`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'link', password }),
      });

      created.share = { ...created.share, has_password: shared.has_password === true };
    }

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

    if (document.folder_id) {
      console.log(`  in ${pathOf(document.folder_id)}`);
    }

    if (document.share.expires_at) {
      console.log(`  stops working ${new Date(document.share.expires_at).toLocaleString()}`);
    }

    if (document.share.has_password) {
      console.log('  asks for the password in TP_SHARE_PASSWORD');
    }
  }
}

async function list() {
  const query = new URLSearchParams();

  if (flags.q) {
    query.set('q', flags.q);
  }

  // A folder lists itself and every folder under it, as it does in the app; `-` is the unfiled.
  if (flags.folder !== undefined) {
    query.set('folder', (await resolveFolder(flags.folder)) ?? 'none');
  }

  const { documents } = await call(`/documents${String(query) ? `?${query}` : ''}`);

  if (flags.json) {
    console.log(JSON.stringify(documents, null, 2));
    return;
  }

  if (documents.length === 0) {
    console.log(flags.folder !== undefined || flags.q ? 'Nothing matches.' : 'Nothing here yet. `tp push README.md --share`');
    return;
  }

  /*
   * Where each one is filed, as a column of its own — only when something is filed, so an account
   * without folders prints what it always did and pays no request for the tree.
   */
  const filed = documents.some((document) => document.folder_id);

  if (filed) {
    await folderTree();
  }

  // The end of a long path is the part that tells two folders apart, so that is the part kept.
  const where = (document) => {
    const path = document.folder_id ? pathOf(document.folder_id) : '-';

    return path.length > 32 ? `…${path.slice(-31)}` : path;
  };
  const width = filed ? Math.max(...documents.map((document) => where(document).length)) : 0;

  for (const document of documents) {
    const shared = document.share.url ? document.share.url : 'private';
    const folder = filed ? `  ${where(document).padEnd(width)}` : '';

    console.log(
      `${document.id}  ${document.name.padEnd(32).slice(0, 32)}  ${bytes(document.size).padStart(8)}${folder}  ${shared}`
    );
  }
}

async function folders() {
  await folderTree();

  // `tp folders Team` shows that branch; without one, the whole tree.
  const top = rest[0] !== undefined ? await resolveFolder(rest[0]) : null;

  if (tree.folders.length === 0) {
    console.log(flags.json ? '[]' : 'No folders yet. `tp mkdir "Team/Notes"`, or `tp push notes.md --folder "Team/Notes"`');
    return;
  }

  const lines = [];

  const walk = (folder, depth) => {
    lines.push({ folder, label: `${'  '.repeat(depth)}${folder.name}` });

    for (const child of childrenOf(folder.id)) {
      walk(child, depth + 1);
    }
  };

  for (const folder of top ? [tree.byId.get(top)] : childrenOf(null)) {
    walk(folder, 0);
  }

  if (flags.json) {
    console.log(JSON.stringify(lines.map(({ folder }) => ({ ...folder, path: pathOf(folder.id) })), null, 2));
    return;
  }

  for (const { folder, label } of lines) {
    const url = folderUrl(folder);
    const shared = url ? (folder.share_mode === 'people' ? `${url}  (named people)` : url) : 'private';
    const count = `${folder.documents} ${folder.documents === 1 ? 'document' : 'documents'}`;

    console.log(`${folder.id}  ${label.padEnd(32).slice(0, 32)}  ${count.padStart(13)}  ${shared}`);
  }
}

async function mkdir() {
  if (rest.length === 0) {
    fail('Which folder? `tp mkdir "Team/Notes"` — every part that is not there yet is made.');
  }

  const made = [];

  for (const path of rest) {
    await folderTree();

    const before = tree.folders.length;
    const id = await resolveFolder(path, { create: true });

    if (id === null) {
      fail(`"${path}" is the top level, which is always there.`);
    }

    made.push({ id, path: pathOf(id), created: tree.folders.length > before });
  }

  if (flags.json) {
    console.log(JSON.stringify(made.map(({ id, path, created }) => ({ ...tree.byId.get(id), path, created })), null, 2));
    return;
  }

  for (const one of made) {
    console.log(`${one.id}  ${one.path}${one.created ? '' : '  (already there)'}`);
  }
}

/**
 * `tp mv <id…> <folder>`: documents into a folder, or out of every folder with `-`. A folder's
 * own id moves that folder, with everything in it, under the new one — the same verb, because to
 * the person typing it they are both "put this there".
 */
async function move() {
  const to = flags.to ?? (rest.length > 1 ? rest.pop() : undefined);

  if (rest.length === 0 || to === undefined) {
    fail('What, and where? `tp mv <id>… "Team/Notes"`, or `-` for no folder. `tp list` and `tp folders` show the ids.');
  }

  // The tree either way: it is what tells a folder's id from a document's.
  await folderTree();

  // Not made when missing, unlike push: a typo here would make a folder and empty another into it.
  const folder = await resolveFolder(to, { flag: 'to' });
  const where = folder ? pathOf(folder) : 'no folder';
  const folderIds = rest.filter((id) => tree.byId.has(id));
  const documentIds = rest.filter((id) => !tree.byId.has(id));
  const report = { folders: [], documents: 0 };

  for (const id of folderIds) {
    await call(`/folders/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parent_id: folder }),
    });

    report.folders.push(id);

    if (!flags.json) {
      console.log(`moved ${pathOf(id)} into ${folder ? where : 'the top level'}`);
    }
  }

  if (documentIds.length > 0) {
    const { moved } = await call('/documents/move', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: documentIds, folder_id: folder }),
    });

    report.documents = moved;

    if (!flags.json) {
      console.log(`moved ${moved} ${moved === 1 ? 'document' : 'documents'} to ${where}`);
    }

    // The API counts what it moved and says nothing of the rest: ids that are not this account's.
    if (moved < documentIds.length) {
      console.error(`${documentIds.length - moved} of the ids are not documents on this account. \`tp list\` shows the ids.`);
    }
  }

  if (flags.json) {
    console.log(JSON.stringify({ to: folder, ...report }, null, 2));
  }
}

/**
 * Sharing a folder the way `tp push --share` shares a document: a link, with an end and a password
 * if wanted, or named people, each of whom signs in as themselves to read it. Readers get the whole
 * tree at `/f/<token>` and can keep a copy of it.
 */
async function shareFolder() {
  if (rest.length !== 1) {
    fail('Which folder? `tp share-folder "Team/Notes" --link` — one folder, by id or path.');
  }

  const people = typeof flags.people === 'string'
    ? flags.people.split(',').map((one) => one.trim()).filter(Boolean)
    : flags.people === true
      ? fail('--people takes addresses: `--people a@example.com,b@example.com`')
      : [];
  // Checked here, all of them, so one mistyped address does not leave the others added and told.
  const wrong = people.filter((one) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(one));

  if (wrong.length > 0) {
    fail(`Not an email address: ${wrong.join(', ')}`);
  }

  const chosen = [flags.link && 'link', people.length > 0 && 'people', flags.private && 'private'].filter(Boolean);

  if (chosen.length > 1) {
    fail('--link, --people and --private each set who can open it. Pick one.');
  }

  // Asked for nothing in particular, it is a link — what `tp push --share` means on its own.
  const mode = chosen[0] ?? 'link';

  if (flags.expires && mode === 'private') {
    fail('--expires ends a shared link. A private folder has no link to end.');
  }

  // `never` takes an end away; a length or a date sets one; leaving it out keeps the one there is.
  const ends = !flags.expires ? undefined : flags.expires === 'never' ? null : expiresAt(String(flags.expires));

  // From the environment, never the flag: see push.
  const password = flags.password ? process.env.TP_SHARE_PASSWORD : null;

  if (flags.password && mode !== 'link') {
    fail('--password protects a link. Named people sign in instead.');
  }

  if (flags.password && !password) {
    fail('--password reads the password from TP_SHARE_PASSWORD, so it stays out of your shell history.');
  }

  const id = await resolveFolder(rest[0]);

  if (id === null) {
    fail('The top level is not a folder that can be shared. Name one: `tp folders` lists them.');
  }

  let state = await call(`/folders/${id}/share`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      mode,
      ...(ends !== undefined ? { expiresAt: ends } : {}),
      ...(password ? { password } : {}),
    }),
  });
  const notified = [];

  for (const email of people) {
    state = await call(`/folders/${id}/share/people`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (state.notified) {
      notified.push(email);
    }
  }

  const url = state.token && state.mode !== 'private' ? `${HOST}/f/${state.token}` : null;

  if (flags.json) {
    console.log(JSON.stringify({ ...state, url, notified }, null, 2));
    return;
  }

  console.log(pathOf(id));

  if (!url) {
    console.log('  private — the link it had, if any, no longer opens');
    return;
  }

  console.log(`  ${url}`);

  if (state.mode === 'people') {
    console.log(`  for ${state.emails.length > 0 ? state.emails.join(', ') : 'nobody yet — add --people'}, each signing in`);
  }

  if (notified.length > 0) {
    console.log(`  told by email: ${notified.join(', ')}`);
  }

  if (state.expiresAt) {
    console.log(`  stops working ${new Date(state.expiresAt).toLocaleString()}`);
  }

  if (state.hasPassword && state.mode === 'link') {
    console.log('  asks for a password');
  }
}

/**
 * The folder alone, by default: what was in it moves up a level and nothing is lost. With
 * --with-documents, everything under it goes too, the way `tp rm` on each would.
 */
async function removeFolder() {
  if (rest.length === 0) {
    fail('Which folder? `tp rmdir "Team/Notes"` — its documents move up a level; --with-documents deletes them too.');
  }

  for (const spec of rest) {
    const id = await resolveFolder(spec);

    if (id === null) {
      fail('The top level is not a folder; there is nothing to remove.');
    }

    const path = pathOf(id);
    const parent = tree.byId.get(id).parent_id;
    const home = parent ? pathOf(parent) : 'no folder';
    const { deleted } = await call(`/folders/${id}${flags['with-documents'] ? '?contents=delete' : ''}`, {
      method: 'DELETE',
    });

    // The rest of this run reads the same tree, so it should not still see the folder.
    tree = null;

    console.log(
      flags['with-documents']
        ? `deleted ${path} and ${deleted} ${deleted === 1 ? 'document' : 'documents'}`
        : `deleted ${path} — what it held is now in ${home}`
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

const commands = {
  push,
  list,
  rm: remove,
  usage,
  login,
  summary,
  versions,
  folders,
  mkdir,
  mv: move,
  'share-folder': shareFolder,
  rmdir: removeFolder,
};

if (!command || command === '--help' || command === '-h') {
  console.log(
    [
      'tp — publish Markdown from a terminal',
      '',
      '  tp login tp_live_…               remember a key for this machine',
      '  tp push README.md --share         convert and publish; prints the link',
      '  tp push docs/*.md --merge --share chain several files into one document',
      '  tp push notes.md --share --expires 7d  a link that stops working in a week',
      '  TP_SHARE_PASSWORD=… tp push notes.md --share --password  a link that asks for a password',
      '  tp push v2.md --replaces <id>     link this push to an earlier document as a new version',
      '  tp push notes.md --update <id>    new text for the same document — same link, old text kept',
      '  tp push notes.md --folder "Team/Notes"  file it there; folders not there yet are made',
      '  tp list --q invoice               what is in the account, matching name or content',
      '  tp list --folder "Team/Notes"     what is in a folder and every folder under it; - for unfiled',
      '  tp versions <id>                  every document in the same chain, oldest first',
      '  tp rm <id>                        delete one',
      '  tp summary <id>                   a short summary, generated once and cached',
      '  tp usage                          how much room is left',
      '',
      '  tp folders [<folder>]             the folder tree: id, documents in each, its link if shared',
      '  tp mkdir "Team/Notes"             make a folder, and every part of the path not there yet',
      '  tp mv <id>… <folder>              documents (or folders) into a folder; - for no folder; or --to <folder>',
      '  tp share-folder <folder> --link   one link for the whole folder; --expires (never to drop it), --password',
      '  tp share-folder <folder> --people a@x.com,b@y.com   only these people, each signing in',
      '  tp share-folder <folder> --private  stop sharing it; the link stops working',
      '  tp rmdir <folder>                 remove a folder; what it held moves up a level',
      '  tp rmdir <folder> --with-documents  remove it and delete every document under it',
      '',
      'A folder is its id from `tp folders`, or its path: names from the top, / between, any case.',
      '',
      'Options: --key, --name, --share link|people, --expires 7d|12h|2026-12-31, --password (from TP_SHARE_PASSWORD), --merge, --replaces, --update, --folder, --to, --force, --json',
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
