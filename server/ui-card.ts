/*
 * The card an assistant draws when a tool of ours hands back a document.
 *
 * MCP Apps (SEP-1865): a server ships a `ui://` resource whose content is a small self-contained
 * HTML page, a tool points at it through `_meta.ui.resourceUri`, and the host renders it in a
 * sandboxed iframe beside the answer. The tool's `content` is still the text the model reads — the
 * card is for the person — so a host that draws nothing loses nothing, which is the only sane way
 * to ship this while support is uneven.
 *
 * Everything is inline and nothing is fetched. The host's default policy for a resource that
 * declares no domains is `default-src 'none'` with inline script and style allowed, so a stylesheet
 * link or a web font would simply not load; there is no network call in here to fail.
 *
 * The bridge is JSON-RPC over `postMessage`: the view says `ui/initialize`, the host answers with
 * its capabilities and the theme, the view says it is initialised, and the result arrives as
 * `ui/notifications/tool-result`. Opening a link goes back the same way — an iframe this sandboxed
 * cannot navigate the tab itself, and should not be able to.
 */
import { createHash } from 'node:crypto';

/*
 * ChatGPT's own spelling of the hand-over, beside the extension's.
 *
 * ChatGPT draws these views, and in ChatGPT not one of them drew: each stayed on "Waiting for
 * the document…" while the answer beside it said the document was saved, so the result the
 * bridge promises never reached the page. ChatGPT also puts a tool's structured result on
 * `window.openai.toolOutput` and announces changes with an `openai:set_globals` event, which
 * is where its own documentation keeps the compatibility alias. Each view reads both, whichever
 * comes first draws, and a second arrival draws the same thing again. Links and the delete
 * button use ChatGPT's own calls when it offers them.
 *
 * Spliced into all three pages, so they cannot drift apart; a host without `window.openai`
 * skips every line of it.
 */
const OPENAI_BRIDGE = `
  const openai = () => window.openai || null;

  const openLink = (url) =>
    openai() && typeof openai().openExternal === 'function'
      ? Promise.resolve(openai().openExternal({ href: url }))
      : request('ui/open-link', { url });

  const callTool = (name, args) =>
    openai() && typeof openai().callTool === 'function'
      ? Promise.resolve(openai().callTool(name, args))
      : request('tools/call', { name, arguments: args });

  const fromOpenAI = () => {
    const data = openai() && openai().toolOutput;
    if (data && typeof data === 'object') draw(data);
  };

  window.addEventListener('openai:set_globals', fromOpenAI);
  fromOpenAI();
`;

export const DOCUMENT_CARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root {
  --ink: #0f172a;
  --body: #334155;
  --muted: #5a6a80;
  --brand: #07807e;
  --card: #ffffff;
  --page: #f8fafc;
  --stroke: #e2e8f0;
}
:root[data-theme="dark"] {
  --ink: #f9fafb;
  --body: #f4f4f5;
  --muted: #b9bfcb;
  --brand: #14a8af;
  --card: #17171e;
  --page: #0f0e14;
  --stroke: #2a2834;
}
* { box-sizing: border-box; margin: 0; }
body {
  padding: 14px;
  background: var(--page);
  color: var(--body);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.card {
  border: 1px solid var(--stroke);
  border-radius: 12px;
  background: var(--card);
  padding: 14px 16px;
}
.top { display: flex; align-items: flex-start; gap: 10px; }
.glyph {
  flex: none;
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand) 14%, transparent);
  color: var(--brand);
  font: 600 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
}
h1 {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  overflow-wrap: anywhere;
}
.badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  font-size: 11px;
  color: var(--muted);
  vertical-align: 2px;
}
.meta { margin-top: 2px; font-size: 12px; color: var(--muted); }
.excerpt {
  margin-top: 12px;
  padding: 10px 12px;
  max-height: 168px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--page);
  color: var(--body);
  font-size: 13px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  /* The card is a glance; the document itself is one button away. */
  mask-image: linear-gradient(180deg, #000 70%, transparent);
}
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
button {
  font: inherit;
  font-weight: 600;
  font-size: 13px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--brand);
  color: #fff;
  cursor: pointer;
}
button.quiet { background: transparent; border-color: var(--stroke); color: var(--ink); }
button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
.empty { color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<div class="card" id="card"><p class="empty" id="empty">Waiting for the document…</p></div>
<script>
(() => {
  const pending = new Map();
  let next = 1;

  const send = (message) => window.parent.postMessage(message, '*');

  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = next++;
      pending.set(id, { resolve, reject });
      send({ jsonrpc: '2.0', id, method, params });
    });

  const notify = (method, params) => send({ jsonrpc: '2.0', method, params });

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const weigh = (bytes) =>
    !bytes ? '' : bytes < 1024 ? bytes + ' bytes' : bytes < 1048576
      ? (bytes / 1024).toFixed(1) + ' kB'
      : (bytes / 1048576).toFixed(1) + ' MB';

  function draw(document_) {
    const card = document.getElementById('card');
    card.textContent = '';

    const top = el('div', 'top');
    top.append(el('div', 'glyph', 'T>'));

    const words = el('div');
    const title = el('h1', null, document_.name || 'Document');

    if (document_.share && document_.share !== 'private') {
      title.append(el('span', 'badge', document_.share === 'people' ? 'shared with people' : 'shared by link'));
    }

    words.append(title);

    const meta = [
      weigh(document_.size),
      document_.words ? document_.words.toLocaleString('en-GB') + ' words' : '',
      document_.headings ? document_.headings + (document_.headings === 1 ? ' heading' : ' headings') : '',
      document_.tables ? document_.tables + (document_.tables === 1 ? ' table' : ' tables') : '',
      document_.created ? String(document_.created).slice(0, 10) : '',
    ].filter(Boolean).join(' · ');

    if (meta) words.append(el('div', 'meta', meta));

    top.append(words);
    card.append(top);

    if (document_.excerpt) card.append(el('div', 'excerpt', document_.excerpt));

    const actions = el('div', 'actions');

    if (document_.url) {
      const open = el('button', null, 'Open in TransformPipe');
      open.addEventListener('click', () => openLink(document_.url));
      actions.append(open);
    }

    if (document_.shareUrl) {
      const shared = el('button', 'quiet', 'Open the shared page');
      shared.addEventListener('click', () => openLink(document_.shareUrl));
      actions.append(shared);
    }

    if (actions.children.length) card.append(actions);
  }

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || message.jsonrpc !== '2.0') return;

    if (message.id !== undefined && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(message.error) : resolve(message.result);
      return;
    }

    if (message.method === 'ui/notifications/tool-result') {
      const data = message.params && message.params.structuredContent;
      if (data) draw(data);
    }
  });

${OPENAI_BRIDGE}
  request('ui/initialize', {
    capabilities: {},
    clientInfo: { name: 'TransformPipe document card', version: '1.0.0' },
    protocolVersion: '2026-01-26',
  })
    .then((result) => {
      const theme = result && result.hostContext && result.hostContext.theme;
      if (theme) document.documentElement.dataset.theme = theme;
      notify('ui/notifications/initialized');
    })
    .catch(() => {
      /* A host that does not speak this leaves the sentence the model was given, which says it all
       * anyway. Nothing here is the only copy of anything. */
    });
})();
</script>
</body>
</html>
`;

/*
 * The other card: what is on the account, as a list rather than as a wall of lines.
 *
 * `tp_list_documents` prints a name, an id, a size and a date per row, which is the right answer
 * for a model and the wrong shape for a person — the id is the longest thing on every line and the
 * one nobody reads. Here the name carries the row, the numbers sit under it, and the id is not
 * shown at all: a row opens the document rather than telling somebody how to ask for it.
 */
export const DOCUMENT_LIST_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root {
  --ink: #0f172a;
  --body: #334155;
  --muted: #5a6a80;
  --brand: #07807e;
  --card: #ffffff;
  --page: #f8fafc;
  --stroke: #e2e8f0;
}
:root[data-theme="dark"] {
  --ink: #f9fafb;
  --body: #f4f4f5;
  --muted: #b9bfcb;
  --brand: #14a8af;
  --card: #17171e;
  --page: #0f0e14;
  --stroke: #2a2834;
}
* { box-sizing: border-box; margin: 0; }
body {
  padding: 14px;
  background: var(--page);
  color: var(--body);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.card {
  border: 1px solid var(--stroke);
  border-radius: 12px;
  background: var(--card);
  overflow: hidden;
}
header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--stroke);
}
h1 { font-size: 14px; font-weight: 600; color: var(--ink); }
header span { font-size: 12px; color: var(--muted); }
ul { list-style: none; padding: 0; margin: 0; max-height: 340px; overflow-y: auto; }
li + li { border-top: 1px solid var(--stroke); }
button.row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
button.row:hover { background: var(--page); }
button.row:focus-visible { outline: 2px solid var(--brand); outline-offset: -2px; }
.name { font-weight: 600; color: var(--ink); overflow-wrap: anywhere; }
.meta { font-size: 12px; color: var(--muted); }
.grow { flex: 1; min-width: 0; }
.pill {
  flex: none;
  padding: 1px 7px;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  font-size: 11px;
  color: var(--muted);
}
.empty { padding: 14px; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<div class="card" id="card"><p class="empty">Waiting for the list…</p></div>
<script>
(() => {
  const pending = new Map();
  let next = 1;

  const send = (message) => window.parent.postMessage(message, '*');
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = next++;
      pending.set(id, { resolve, reject });
      send({ jsonrpc: '2.0', id, method, params });
    });
  const notify = (method, params) => send({ jsonrpc: '2.0', method, params });

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const weigh = (bytes) =>
    !bytes ? '' : bytes < 1024 ? bytes + ' bytes' : bytes < 1048576
      ? (bytes / 1024).toFixed(1) + ' kB'
      : (bytes / 1048576).toFixed(1) + ' MB';

  function draw(data) {
    const card = document.getElementById('card');
    const documents = data.documents || [];

    card.textContent = '';

    const head = el('header');
    head.append(el('h1', null, 'Documents'));
    head.append(el('span', null, data.total > documents.length
      ? documents.length + ' of ' + data.total
      : documents.length + (documents.length === 1 ? ' document' : ' documents')));
    card.append(head);

    if (!documents.length) {
      card.append(el('p', 'empty', 'Nothing on this account yet.'));
      return;
    }

    const list = el('ul');

    for (const one of documents) {
      const row = el('button', 'row');
      const words = el('div', 'grow');

      words.append(el('div', 'name', one.name));
      words.append(el('div', 'meta', [
        weigh(one.size),
        one.words ? one.words.toLocaleString('en-GB') + ' words' : '',
        one.created ? String(one.created).slice(0, 10) : '',
      ].filter(Boolean).join(' · ')));

      row.append(words);

      if (one.share && one.share !== 'private') {
        row.append(el('span', 'pill', one.share === 'people' ? 'shared' : 'link'));
      }

      row.addEventListener('click', () => openLink(one.url));

      /* append() answers with nothing — no backticks in here, the whole page is a template
       * literal — so the row goes in the item and the item in the list. Chaining the two was a
       * TypeError that left a header with no rows under it. */
      const item = el('li');

      item.append(row);
      list.append(item);
    }

    card.append(list);
  }

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || message.jsonrpc !== '2.0') return;

    if (message.id !== undefined && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(message.error) : resolve(message.result);
      return;
    }

    if (message.method === 'ui/notifications/tool-result') {
      const data = message.params && message.params.structuredContent;
      if (data) draw(data);
    }
  });

${OPENAI_BRIDGE}
  request('ui/initialize', {
    capabilities: {},
    clientInfo: { name: 'TransformPipe document list', version: '1.0.0' },
    protocolVersion: '2026-01-26',
  })
    .then((result) => {
      const theme = result && result.hostContext && result.hostContext.theme;
      if (theme) document.documentElement.dataset.theme = theme;
      notify('ui/notifications/initialized');
    })
    .catch(() => {
      /* The text answer stands on its own; a host that cannot draw this loses nothing. */
    });
})();
</script>
</body>
</html>
`;

/*
 * The third view, and the only one that does something rather than showing something.
 *
 * Deleting is the one call here that cannot be taken back, and the protocol's answer to that has
 * always been a sentence: the tool refuses without `confirm: true` and asks the model to ask the
 * person. That works and it puts the model in the middle of an irreversible decision, which is the
 * wrong place for it — "yes" in a conversation is a guess about which document was meant.
 *
 * So the refusal now carries this: the document itself, by name, and a button. Pressing it calls
 * `tp_delete_document` again with the confirmation, straight from the view — `tools/call` over the
 * same bridge, which is what the host's `serverTools` capability is for. The person confirms the
 * thing they are looking at rather than a name they said out loud.
 *
 * Where the host does not offer that capability, the button is not drawn at all and the sentence
 * the model already has is the whole answer.
 */
export const DELETE_CONFIRM_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root {
  --ink: #0f172a;
  --body: #334155;
  --muted: #5a6a80;
  --danger: #b3261e;
  --card: #ffffff;
  --page: #f8fafc;
  --stroke: #e2e8f0;
}
:root[data-theme="dark"] {
  --ink: #f9fafb;
  --body: #f4f4f5;
  --muted: #b9bfcb;
  --danger: #e0685f;
  --card: #17171e;
  --page: #0f0e14;
  --stroke: #2a2834;
}
* { box-sizing: border-box; margin: 0; }
body {
  padding: 14px;
  background: var(--page);
  color: var(--body);
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.card {
  border: 1px solid var(--stroke);
  border-left: 3px solid var(--danger);
  border-radius: 12px;
  background: var(--card);
  padding: 14px 16px;
}
h1 { font-size: 15px; font-weight: 600; color: var(--ink); overflow-wrap: anywhere; }
.meta { margin-top: 2px; font-size: 12px; color: var(--muted); }
.warning { margin-top: 10px; font-size: 13px; color: var(--body); }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
button {
  font: inherit;
  font-weight: 600;
  font-size: 13px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--danger);
  color: #fff;
  cursor: pointer;
}
button.quiet { background: transparent; border-color: var(--stroke); color: var(--ink); }
button[disabled] { opacity: 0.6; cursor: default; }
.done { margin-top: 10px; font-size: 13px; color: var(--muted); }
</style>
</head>
<body>
<div class="card" id="card"><p class="done">Waiting…</p></div>
<script>
(() => {
  const pending = new Map();
  let next = 1;
  /* ChatGPT says so by having the call; the extension says so in its answer to ui/initialize. */
  let canCallTools = Boolean(window.openai && typeof window.openai.callTool === 'function');

  const send = (message) => window.parent.postMessage(message, '*');
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = next++;
      pending.set(id, { resolve, reject });
      send({ jsonrpc: '2.0', id, method, params });
    });
  const notify = (method, params) => send({ jsonrpc: '2.0', method, params });

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const weigh = (bytes) =>
    !bytes ? '' : bytes < 1024 ? bytes + ' bytes' : bytes < 1048576
      ? (bytes / 1024).toFixed(1) + ' kB'
      : (bytes / 1048576).toFixed(1) + ' MB';

  function draw(document_) {
    const card = document.getElementById('card');

    card.textContent = '';
    card.append(el('h1', null, document_.name || 'This document'));

    const meta = [
      weigh(document_.size),
      document_.words ? document_.words.toLocaleString('en-GB') + ' words' : '',
      document_.created ? String(document_.created).slice(0, 10) : '',
    ].filter(Boolean).join(' · ');

    if (meta) card.append(el('div', 'meta', meta));

    card.append(el('p', 'warning',
      document_.share && document_.share !== 'private'
        ? 'Deleting removes the document, its source and the shared page. There is no undo.'
        : 'Deleting removes the document and its source. There is no undo.'));

    if (!canCallTools) {
      card.append(el('p', 'done', 'Tell the assistant to confirm, and it will delete this one.'));
      return;
    }

    const actions = el('div', 'actions');
    const remove = el('button', null, 'Delete permanently');

    remove.addEventListener('click', async () => {
      remove.disabled = true;
      remove.textContent = 'Deleting…';

      try {
        await callTool('tp_delete_document', { id: document_.id, confirm: true });

        card.textContent = '';
        card.append(el('h1', null, document_.name || 'Document'));
        card.append(el('p', 'done', 'Deleted. It and its source are gone.'));
      } catch (failure) {
        remove.disabled = false;
        remove.textContent = 'Delete permanently';
        card.append(el('p', 'done', 'It was not deleted: ' + (failure && failure.message ? failure.message : 'the call was refused')));
      }
    });

    actions.append(remove);

    const keep = el('button', 'quiet', 'Keep it');

    keep.addEventListener('click', () => {
      card.textContent = '';
      card.append(el('h1', null, document_.name || 'Document'));
      card.append(el('p', 'done', 'Kept. Nothing was deleted.'));
    });

    actions.append(keep);
    card.append(actions);
  }

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || message.jsonrpc !== '2.0') return;

    if (message.id !== undefined && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(message.error) : resolve(message.result);
      return;
    }

    if (message.method === 'ui/notifications/tool-result') {
      const data = message.params && message.params.structuredContent;
      if (data) draw(data);
    }
  });

${OPENAI_BRIDGE}
  request('ui/initialize', {
    capabilities: {},
    clientInfo: { name: 'TransformPipe delete confirmation', version: '1.0.0' },
    protocolVersion: '2026-01-26',
  })
    .then((result) => {
      const theme = result && result.hostContext && result.hostContext.theme;
      if (theme) document.documentElement.dataset.theme = theme;
      canCallTools = canCallTools || Boolean(result && result.hostCapabilities && result.hostCapabilities.serverTools);
      notify('ui/notifications/initialized');
    })
    .catch(() => {
      /* The refusal the model was given says the same thing in words. */
    });
})();
</script>
</body>
</html>
`;

/*
 * Each view's address carries a hash of its page, so a page that changes is a new address.
 *
 * A host keeps a view by its URI, and ChatGPT keeps it hard: after the cards learned to read
 * ChatGPT's result, it went on drawing the page it had fetched when the connector was added, and
 * "Refresh tools" brought the list back and not the card. An address that moves with the content
 * is the one cache-buster every host has to honour. The unversioned form is still answered with
 * the current page, so a conversation from before keeps its card.
 */
const versioned = (name: string, html: string) =>
  `ui://transformpipe/${createHash('sha256').update(html).digest('hex').slice(0, 10)}/${name}`;

export const DOCUMENT_CARD_URI = versioned('document-card', DOCUMENT_CARD_HTML);
export const DOCUMENT_LIST_URI = versioned('document-list', DOCUMENT_LIST_HTML);
export const DELETE_CONFIRM_URI = versioned('delete-confirm', DELETE_CONFIRM_HTML);

/** The address each view had before it was versioned, which old conversations still ask for. */
export const unversioned = (uri: string) => uri.replace(/^ui:\/\/transformpipe\/[0-9a-f]{10}\//, 'ui://transformpipe/');
