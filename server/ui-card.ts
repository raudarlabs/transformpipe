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
 * skips every line of it. `reportSize` rides along for the same reason: the extension's hosts
 * size the frame from `ui/notifications/size-changed`, which the SDK sends by default and these
 * pages, written without it, never did.
 */
const OPENAI_BRIDGE = `
  const openai = () => window.openai || null;

  const openLink = (url) =>
    openai() && typeof openai().openExternal === 'function'
      ? Promise.resolve(openai().openExternal({ href: url }))
      : request('ui/open-link', { url });

  /* A call the host never answers is a button that never comes back; after a while it says so. */
  const callTool = (name, args) =>
    Promise.race([
      openai() && typeof openai().callTool === 'function'
        ? Promise.resolve(openai().callTool(name, args))
        : request('tools/call', { name, arguments: args }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('no answer from the assistant')), 30000)),
    ]);

  /* An empty object is what ChatGPT holds for a result with no structured content: nothing to draw. */
  const fromOpenAI = () => {
    const data = openai() && openai().toolOutput;
    if (data && typeof data === 'object' && Object.keys(data).length > 0) draw(data);
  };

  window.addEventListener('openai:set_globals', fromOpenAI);
  fromOpenAI();

  /*
   * The page's height, to a host that sizes the frame from it — once, and on every change.
   * Measured the way the SDK measures it: the frame's own height would come back otherwise, and a
   * frame told it is exactly as tall as it already is never grows.
   */
  const reportSize = () => {
    let queued = false;
    let last = '';
    const send = () => {
      queued = false;
      const root = document.documentElement;
      const was = root.style.height;
      root.style.height = 'max-content';
      const height = Math.ceil(root.getBoundingClientRect().height);
      root.style.height = was;
      const width = Math.ceil(window.innerWidth);
      if (last === width + 'x' + height) return;
      last = width + 'x' + height;
      notify('ui/notifications/size-changed', { width, height });
    };
    const soon = () => { if (!queued) { queued = true; requestAnimationFrame(send); } };
    if (typeof ResizeObserver === 'function') {
      const watch = new ResizeObserver(soon);
      watch.observe(document.documentElement);
      watch.observe(document.body);
    }
    soon();
  };
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
/* A share, as it now stands: the state on the right of the head, and who, how often, until when below. */
.top .grow { flex: 1; min-width: 0; }
.state {
  flex: none;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: color-mix(in srgb, #16a34a 16%, transparent);
  color: #15803d;
}
:root[data-theme="dark"] .state:not(.off) { color: #4ade80; }
.state.off { background: var(--page); color: var(--muted); }
.rows { margin-top: 12px; padding-top: 4px; border-top: 1px solid var(--stroke); }
.row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
.row .label { flex: none; color: var(--muted); }
.row .value { min-width: 0; text-align: right; color: var(--ink); overflow-wrap: anywhere; }
.row .value.link { color: var(--brand); }
.actions.wide button { flex: 1; }
/* What an update changed: removed lines struck in red, added ones in green, folds as a dot row. */
.diff {
  margin-top: 12px;
  padding: 8px 0;
  max-height: 260px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--page);
  font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
}
.diff div { padding: 0 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
.diff .add { background: color-mix(in srgb, #16a34a 14%, transparent); color: var(--ink); }
.diff .del { background: color-mix(in srgb, #dc2626 12%, transparent); color: var(--muted); text-decoration: line-through; }
.diff .ctx { color: var(--muted); }
.diff .fold { color: var(--muted); text-align: center; letter-spacing: 2px; }
.counts { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.counts .plus { color: #15803d; }
.counts .minus { color: #b91c1c; }
:root[data-theme="dark"] .counts .plus { color: #4ade80; }
:root[data-theme="dark"] .counts .minus { color: #f87171; }
/* A gated call: what it would do, and the button that does it. */
.ask {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand) 40%, var(--stroke));
  background: color-mix(in srgb, var(--brand) 7%, transparent);
  font-size: 13px;
  color: var(--body);
}
.ask .actions { margin-top: 10px; }
.note { margin-top: 8px; font-size: 12px; color: var(--muted); }
/* History: the text as it stands, then each earlier one. */
.timeline { margin-top: 12px; border-top: 1px solid var(--stroke); }
.step { padding: 8px 0; border-bottom: 1px solid var(--stroke); }
.step:last-child { border-bottom: 0; }
.step .line { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.step .dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--stroke); }
.step.now .dot { background: var(--brand); }
.step .when { flex: 1; min-width: 0; color: var(--ink); }
.step .size { color: var(--muted); font-size: 12px; }
.step button { padding: 3px 10px; font-size: 12px; }
.step .excerpt { margin-top: 8px; }
.section { margin-top: 12px; font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
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

  const day = (when) => String(when || '').slice(0, 10);
  const minute = (when) => String(when || '').slice(0, 16).replace('T', ' ');

  /* ChatGPT says so by having the call; the extension says so in its answer to ui/initialize. */
  let canCallTools = Boolean(window.openai && typeof window.openai.callTool === 'function');

  /* What a call made from the card came back with, as the card draws it or as the sentence. */
  const answered = (result) => {
    const r = result && result.result && !result.content ? result.result : result;
    return {
      data: r && r.structuredContent && typeof r.structuredContent === 'object' ? r.structuredContent : null,
      text: r && r.content && r.content[0] && r.content[0].text ? r.content[0].text : '',
      failed: Boolean(r && r.isError),
    };
  };

  /* The refused call, offered back: a note on what it does and a button that does it. */
  function drawConfirm(card, document_) {
    if (!document_.confirm && !document_.confirmNote) return;
    const box = el('div', 'ask');
    const confirm = document_.confirm;
    box.append(el('div', null, confirm ? confirm.note : document_.confirmNote));

    if (!confirm || !canCallTools) {
      box.append(el('div', 'note', 'Tell the assistant to go ahead, and it will.'));
      card.append(box);
      return;
    }

    const actions = el('div', 'actions');
    const go = el('button', null, confirm.label);
    go.addEventListener('click', async () => {
      go.disabled = true;
      go.textContent = 'Working…';
      try {
        const back = answered(await callTool(confirm.tool, Object.assign({}, confirm.args, { confirm: true })));
        if (back.data && !back.failed) {
          draw(back.data);
        } else {
          go.disabled = false;
          go.textContent = confirm.label;
          box.append(el('div', 'note', back.text || 'It did not go through.'));
        }
      } catch (failure) {
        go.disabled = false;
        go.textContent = confirm.label;
        box.append(el('div', 'note', 'It did not go through: ' + (failure && failure.message ? failure.message : 'the call was refused')));
      }
      reportSize();
    });
    actions.append(go);
    box.append(actions);
    card.append(box);
  }

  function drawDiff(card, diff) {
    if (!diff || !Array.isArray(diff.lines) || !diff.lines.length) return;
    const block = el('div', 'diff');
    diff.lines.forEach((line) => {
      if (line.t === '…') { block.append(el('div', 'fold', '· · ·')); return; }
      block.append(el('div', line.t === '+' ? 'add' : line.t === '-' ? 'del' : 'ctx', (line.t === ' ' ? '  ' : line.t + ' ') + line.s));
    });
    card.append(block);
  }

  const counts = (diff) => {
    const span = el('span', 'counts');
    span.append(el('span', 'plus', '+' + diff.added), document.createTextNode(' '), el('span', 'minus', '−' + diff.removed));
    return span;
  };

  /* After tp_document_versions: the text as it stands, then every earlier one, newest first. */
  function drawHistory(document_) {
    const card = document.getElementById('card');
    card.textContent = '';

    const top = el('div', 'top');
    top.append(el('div', 'glyph', 'T>'));
    const words = el('div', 'grow');
    words.append(el('h1', null, document_.name || 'Document'));
    const revisions = Array.isArray(document_.revisions) ? document_.revisions : [];
    words.append(el('div', 'meta', revisions.length
      ? revisions.length + (revisions.length === 1 ? ' earlier version' : ' earlier versions')
      : 'No earlier versions yet'));
    top.append(words);
    card.append(top);

    const timeline = el('div', 'timeline');
    const now = el('div', 'step now');
    const nowLine = el('div', 'line');
    nowLine.append(el('span', 'dot'), el('span', 'when', 'Now' + (document_.updated ? ' · updated ' + minute(document_.updated) : document_.created ? ' · saved ' + day(document_.created) : '')), el('span', 'size', weigh(document_.size)));
    now.append(nowLine);
    timeline.append(now);

    revisions.forEach((revision) => {
      const step = el('div', 'step');
      const line = el('div', 'line');
      line.append(el('span', 'dot'), el('span', 'when', 'Until ' + minute(revision.at)), el('span', 'size', weigh(revision.size)));
      if (canCallTools) {
        const read = el('button', 'quiet', 'Read');
        let shown = null;
        read.addEventListener('click', async () => {
          if (shown) { shown.remove(); shown = null; read.textContent = 'Read'; reportSize(); return; }
          read.disabled = true;
          try {
            const back = answered(await callTool('tp_document_versions', { id: document_.id, revision: revision.id }));
            shown = el('div', 'excerpt', back.data && back.data.excerpt ? back.data.excerpt : back.text);
            step.append(shown);
            read.textContent = 'Hide';
          } catch (failure) {
            step.append(el('div', 'note', 'It could not be read.'));
          }
          read.disabled = false;
          reportSize();
        });
        line.append(read);
      }
      step.append(line);
      timeline.append(step);
    });
    card.append(timeline);

    const chain = Array.isArray(document_.chain) ? document_.chain : [];
    if (chain.length) {
      card.append(el('div', 'section', 'Linked versions'));
      const linked = el('div', 'timeline');
      chain.forEach((one) => {
        const step = el('div', one.id === document_.id ? 'step now' : 'step');
        const line = el('div', 'line');
        line.append(el('span', 'dot'), el('span', 'when', one.name), el('span', 'size', day(one.created)));
        if (one.url && one.id !== document_.id) {
          const open = el('button', 'quiet', 'Open');
          open.addEventListener('click', () => openLink(one.url));
          line.append(open);
        }
        step.append(line);
        linked.append(step);
      });
      card.append(linked);
    }

    if (document_.url) {
      const actions = el('div', 'actions');
      const open = el('button', null, 'Open in TransformPipe');
      open.addEventListener('click', () => openLink(document_.url));
      actions.append(open);
      card.append(actions);
    }
  }

  /* After tp_share_document: not the document's contents but who can now open it. */
  function drawShare(document_) {
    const card = document.getElementById('card');
    card.textContent = '';

    const shared = document_.share && document_.share !== 'private';
    const top = el('div', 'top');
    top.append(el('div', 'glyph', 'T>'));

    const words = el('div', 'grow');
    words.append(el('h1', null, document_.name || 'Document'));
    const meta = [
      weigh(document_.size),
      document_.words ? document_.words.toLocaleString('en-GB') + ' words' : '',
    ].filter(Boolean).join(' · ');
    if (meta) words.append(el('div', 'meta', meta));
    top.append(words);
    top.append(document_.confirm || document_.confirmNote
      ? el('span', 'state off', 'Not yet')
      : el('span', shared ? 'state' : 'state off', shared ? 'Shared' : 'Private'));
    card.append(top);

    const rows = el('div', 'rows');
    const row = (label, value, className) => {
      const line = el('div', 'row');
      line.append(el('span', 'label', label));
      line.append(el('span', className ? 'value ' + className : 'value', value));
      rows.append(line);
    };

    row('Access', document_.share === 'link'
      ? 'Anyone with the link'
      : document_.share === 'people'
        ? 'Specific people'
        : 'Only you — the old link no longer opens');

    const readers = Array.isArray(document_.readers) ? document_.readers : [];
    if (document_.share === 'people') {
      row(readers.length === 1 ? 'Reader' : 'Readers', readers.join(', ') || 'Nobody yet', 'link');
    }

    if (shared && !document_.confirm && !document_.confirmNote) {
      row('Opens', !document_.opens
        ? 'Not opened yet'
        : (document_.opens === 1 ? 'Once' : document_.opens + ' times') +
          (document_.lastOpened ? ', last ' + day(document_.lastOpened) : ''));
    }

    if (shared && document_.shareExpires) row('Link ends', day(document_.shareExpires));

    card.append(rows);

    if (document_.confirm || document_.confirmNote) {
      drawConfirm(card, document_);
      return;
    }

    const actions = el('div', 'actions wide');

    if (document_.shareUrl) {
      const open = el('button', null, 'Open shared link');
      open.addEventListener('click', () => openLink(document_.shareUrl));
      actions.append(open);
    }

    if (document_.url) {
      const app = el('button', document_.shareUrl ? 'quiet' : null, 'Open in TransformPipe');
      app.addEventListener('click', () => openLink(document_.url));
      actions.append(app);
    }

    if (actions.children.length) card.append(actions);
  }

  let lastDrawn = null;

  function draw(document_) {
    lastDrawn = document_;
    if (document_.history) return drawHistory(document_);
    if (document_.sharing) return drawShare(document_);

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

    if (meta || document_.diff) {
      const line = el('div', 'meta', meta);
      if (document_.diff) {
        if (meta) line.append(document.createTextNode(' · '));
        line.append(counts(document_.diff));
      }
      words.append(line);
    }

    if (document_.revisionOf) words.append(el('div', 'meta', 'As it read until ' + minute(document_.revisionOf) + ' UTC'));

    if (Array.isArray(document_.readers) && document_.readers.length) {
      words.append(el('div', 'meta', 'Shared with ' + document_.readers.join(', ')));
    }

    top.append(words);
    card.append(top);

    if (document_.diff && document_.diff.lines && document_.diff.lines.length) {
      drawDiff(card, document_.diff);
    } else if (document_.excerpt) {
      card.append(el('div', 'excerpt', document_.excerpt));
    }

    if (document_.confirm || document_.confirmNote) {
      drawConfirm(card, document_);
      return;
    }

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
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        draw(data);
      } else {
        /* An answer with no list in it — an error, an older server — must not leave the card waiting. */
        const said = message.params && message.params.content && message.params.content[0];
        const card = document.getElementById('card');
        card.textContent = '';
        card.append(el('p', 'empty', (said && said.text) || 'No list to show.'));
        reportSize();
      }
    }
  });

${OPENAI_BRIDGE}
  request('ui/initialize', {
    appInfo: { name: 'TransformPipe document card', version: '1.1.0' },
    appCapabilities: {},
    protocolVersion: '2026-01-26',
    /* The draft's names, for a host that predates appInfo. */
    clientInfo: { name: 'TransformPipe document card', version: '1.1.0' },
    capabilities: {},
  })
    .then((result) => {
      const theme = result && result.hostContext && result.hostContext.theme;
      if (theme) document.documentElement.dataset.theme = theme;
      /* A result drawn before the host said it runs tools gets its buttons now. */
      const could = canCallTools;
      canCallTools = canCallTools || Boolean(result && result.hostCapabilities && result.hostCapabilities.serverTools);
      if (!could && canCallTools && lastDrawn) draw(lastDrawn);
      notify('ui/notifications/initialized');
      reportSize();
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
      card.append(el('p', 'empty', data.query
        ? 'Nothing matches \u201c' + data.query + '\u201d.'
        : 'Nothing on this account yet.'));
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
      if (data && typeof data === 'object' && Object.keys(data).length > 0) draw(data);
    }
  });

${OPENAI_BRIDGE}
  request('ui/initialize', {
    appInfo: { name: 'TransformPipe document list', version: '1.1.0' },
    appCapabilities: {},
    protocolVersion: '2026-01-26',
    /* The draft's names, for a host that predates appInfo. */
    clientInfo: { name: 'TransformPipe document list', version: '1.1.0' },
    capabilities: {},
  })
    .then((result) => {
      const theme = result && result.hostContext && result.hostContext.theme;
      if (theme) document.documentElement.dataset.theme = theme;
      notify('ui/notifications/initialized');
      reportSize();
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

    /* Deleted already: the host asked the person itself and the call went straight through. */
    if (document_.deleted) {
      card.append(el('h1', null, document_.name || 'Document'));
      card.append(el('p', 'done', 'Deleted. It and its source are gone.'));
      return;
    }

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
      if (data && typeof data === 'object' && Object.keys(data).length > 0) draw(data);
    }
  });

${OPENAI_BRIDGE}
  request('ui/initialize', {
    appInfo: { name: 'TransformPipe delete confirmation', version: '1.1.0' },
    appCapabilities: {},
    protocolVersion: '2026-01-26',
    /* The draft's names, for a host that predates appInfo. */
    clientInfo: { name: 'TransformPipe delete confirmation', version: '1.1.0' },
    capabilities: {},
  })
    .then((result) => {
      const theme = result && result.hostContext && result.hostContext.theme;
      if (theme) document.documentElement.dataset.theme = theme;
      canCallTools = canCallTools || Boolean(result && result.hostCapabilities && result.hostCapabilities.serverTools);
      notify('ui/notifications/initialized');
      reportSize();
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
