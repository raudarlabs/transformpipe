/* Draws a cover for every page, once, into public/og.
 *
 *   npm run og
 *
 * They do two jobs. They are the `og:image` a link gets when somebody shares it — without one, a
 * post about this site is a grey rectangle with a URL in it — and they are the picture on the cards
 * in the blog index and on the front page, which is what stops fifty articles reading as a wall of
 * identical text.
 *
 * Rendered in a real browser rather than composed as SVG, because the titles are set in DM Sans
 * with the app's own weights and a text layout engine is the only thing that knows where the lines
 * break. The font is loaded from public/fonts, so this runs offline and produces the same file
 * twice.
 *
 * The motif is the product: three lines of Markdown, the brand caret, the same three as HTML. The
 * accent comes from the tag, so the blog index reads as seven colours rather than one.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

/*
 * `puppeteer-core` carries no browser of its own, so it needs telling where Chrome lives — and
 * where that is depends on the machine running this script, not on the project.
 */
const CHROME =
  process.env.CHROME_PATH ??
  {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  }[process.platform] ??
  'google-chrome';
const ROOT = resolve('.');
const OUT = join(ROOT, 'public', 'og');
const WIDTH = 1200;

const HEIGHT = 630;

/*
 * One composition, drawn twice at different sizes.
 *
 * 1200 by 630 is what a share expects — every scraper is built for 1.91:1 — and the card in the
 * blog index is the same picture at two thirds the size, so the layout is identical and only the
 * pixels differ. That is `deviceScaleFactor`, not a second template: the earlier version had two
 * templates, one of which omitted the title, and they drifted every time the design changed.
 *
 * The card being smaller matters. It is shown about 390px wide in a three-column grid, so a
 * 1200px source was four times the pixels the browser needed on every card on the page.
 */
const VARIANTS = {
  og: { scale: 1, type: 'jpeg', quality: 78, ext: 'jpg' },
  card: { scale: 2 / 3, type: 'webp', quality: 90, ext: 'webp' },
};

/*
 * One accent per tag, all of them chosen against #0f0e14 rather than taken from a ramp. Teal is the
 * brand's own; the rest sit far enough apart in hue to tell a Safety piece from a Syntax one at
 * card size, and close enough in chroma that a page of them is not a fruit bowl.
 */
const ACCENTS = {
  Converting: '#14a8af',
  Syntax: '#7c8cf8',
  Publishing: '#e0a34a',
  Automation: '#4ec9a0',
  Safety: '#e0685f',
  Workflow: '#b07cf8',
  Code: '#5aa9e6',
};

const DEFAULT_ACCENT = ACCENTS.Converting;

const escape = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** The same flat frontmatter the app's loader reads. */
function frontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    return {};
  }

  const data = {};

  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(':');

    if (at > 0) {
      data[line.slice(0, at).trim()] = line
        .slice(at + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
    }
  }

  return data;
}

const fontUrl = pathToFileURL(
  join(ROOT, 'public', 'fonts', 'dm-sans-latin-normal.woff2')
).href;

/*
 * The picture: one solid object per article, built in isometry, with no words in it.
 *
 * Three versions got here. The first printed the headline into the image, so the index read every
 * title twice and a translation needed its own copy of every cover. The second dropped the words
 * but varied one flat composition — paragraphs left, a table or a list right — which at card size
 * is not variety: sixty covers of grey bars read as one cover repeated. The third drew flat line
 * icons: distinct, and weightless.
 *
 * This one gives each article a solid seen from the same corner — boxes, plates, cylinders and
 * spheres projected isometrically and filled in three shades of the topic's own accent, light on
 * top, mid on the left, dark on the right, which is what reads as depth. A different silhouette per
 * article, identical light and angle across all of them, and nothing language-specific inside, so
 * one file still serves every locale.
 */

/** A small, stable hash: the same slug draws the same picture on every machine, forever. */
function seedOf(slug) {
  let h = 2166136261;

  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

/** Blend a hex colour towards another, which is how the three faces of one solid are derived. */
function mix(hex, towards, amount) {
  const read = (value, at) => parseInt(value.slice(at, at + 2), 16);
  const channel = (at) =>
    Math.round(read(hex, at) + (read(towards, at) - read(hex, at)) * amount)
      .toString(16)
      .padStart(2, '0');

  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

/*
 * Isometry, the 2:1 kind every drawing program means by the word: one unit along x goes right and
 * down, one along y goes left and down, one along z goes straight up. Scenes are drawn in units
 * roughly between -40 and 40 and projected into the 240-square box the SVG declares.
 */
const U = 2.05;

const at = (x, y, z) => [
  120 + (x - y) * 0.866 * U,
  128 + ((x + y) * 0.5 - z) * U,
];

const pt = (x, y, z) => at(x, y, z).map((n) => n.toFixed(1)).join(',');

const poly = (points, fill) => `<polygon points="${points.join(' ')}" fill="${fill}"/>`;

/** A solid box: the top face, then the two visible sides. Order matters — later covers earlier. */
function box(shade, x, y, z, w, d, h) {
  return (
    poly(
      [pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h)],
      shade.top
    ) +
    poly(
      [pt(x, y + d, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x, y + d, z + h)],
      shade.left
    ) +
    poly(
      [pt(x + w, y, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x + w, y, z + h)],
      shade.right
    )
  );
}

/** A thin box: a page, a slab, a screen lying down. */
const plate = (shade, x, y, z, w, d) => box(shade, x, y, z, w, d, 2.6);

/** A panel standing on its edge and facing the viewer: a screen, a shield, a card. */
function panel(shade, x, y, z, w, h) {
  return (
    poly([pt(x, y, z), pt(x + w, y, z), pt(x + w, y, z + h), pt(x, y, z + h)], shade.left) +
    poly(
      [pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + 2.4, z + h), pt(x, y + 2.4, z + h)],
      shade.top
    ) +
    poly(
      [pt(x + w, y, z), pt(x + w, y + 2.4, z), pt(x + w, y + 2.4, z + h), pt(x + w, y, z + h)],
      shade.right
    )
  );
}

/** A cylinder, as a wall and a lid: a database, a stack of discs, a wheel lying flat. */
function cylinder(shade, x, y, z, r, h) {
  const [cx, base] = at(x, y, z + h);
  const rx = r * 0.866 * U;
  const ry = r * 0.5 * U;

  return (
    `<path d="M${(cx - rx).toFixed(1)} ${base.toFixed(1)} a${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(rx * 2).toFixed(1)} 0 v${(h * U).toFixed(1)} a${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(-rx * 2).toFixed(1)} 0 z" fill="${shade.left}"/>` +
    `<ellipse cx="${cx.toFixed(1)}" cy="${base.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${shade.top}"/>`
  );
}

/** A sphere under the same light: a node in a graph, a dot that matters. */
function orb(shade, x, y, z, r) {
  const [cx, cy] = at(x, y, z);

  return (
    `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * U).toFixed(1)}" fill="${shade.left}"/>` +
    `<circle cx="${(cx - r * U * 0.28).toFixed(1)}" cy="${(cy - r * U * 0.32).toFixed(1)}" r="${(r * U * 0.56).toFixed(1)}" fill="${shade.top}"/>`
  );
}

/** A line between two points in space: what connects the solids. */
function wire(colour, a, b, width = 2.6) {
  const [x1, y1] = at(...a);
  const [x2, y2] = at(...b);

  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${colour}" stroke-width="${width}" stroke-linecap="round"/>`;
}

/*
 * The vocabulary: one function per subject, each a scene built from the solids above. `s` is the
 * topic's shade set, `hi` the same accent at full strength, spent on the one part of each picture
 * that carries its meaning.
 */
const SUBJECTS = {
  /* A stack of pages: documents, and one becoming another. */
  stack: (s, hi) =>
    plate(s.deep, -26, -26, -16, 52, 52) +
    plate(s, -21, -21, -7, 52, 52) +
    plate(hi, -16, -16, 2, 52, 52),

  /* A screen on a stand: a browser, a preview, the page as somebody else opens it. */
  screen: (s, hi) =>
    box(s.deep, -9, -5, -28, 18, 10, 7) +
    panel(s, -34, 4, -21, 68, 46) +
    panel(hi, -27, 3, -12, 30, 6) +
    panel(s.deep, -27, 3, -2, 48, 5),

  /* A terminal: the same screen, with the product's own caret lit on it. */
  terminal: (s, hi) =>
    box(s.deep, -9, -5, -28, 18, 10, 7) +
    panel(s, -34, 4, -21, 68, 46) +
    panel(hi, -27, 3, -10, 11, 6) +
    panel(s.deep, -13, 3, -10, 27, 6) +
    panel(s.deep, -27, 3, 2, 40, 5),

  /* A grid of cells on a slab: a spreadsheet, a table, rows out of a system. */
  grid: (s, hi) => {
    let out = plate(s.deep, -31, -31, -18, 62, 62);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        out += box(j === 0 ? hi : s, -26 + i * 18, -26 + j * 18, -14, 14, 14, 4);
      }
    }

    return out;
  },

  /* An archive: a box with its lid lifted off, which is what every export arrives as. */
  archive: (s, hi) =>
    box(s, -25, -25, -24, 50, 50, 28) +
    box(hi, -29, -29, 8, 58, 58, 8),

  /* A database: discs on discs, a system's own store rather than a document. */
  database: (s, hi) =>
    cylinder(s, 0, 0, -28, 25, 15) +
    cylinder(s, 0, 0, -11, 25, 15) +
    cylinder(hi, 0, 0, 6, 25, 15),

  /* A graph: notes that mean something because of what they link to. */
  graph: (s, hi) =>
    plate(s.deep, -32, -32, -24, 64, 64) +
    wire(s.top, [-18, -18, -8], [16, -8, 6]) +
    wire(s.top, [-18, -18, -8], [-6, 20, 0]) +
    wire(s.top, [16, -8, 6], [-6, 20, 0]) +
    orb(s, -18, -18, -8, 7) +
    orb(hi, 16, -8, 6, 9) +
    orb(s, -6, 20, 0, 7),

  /* An open book: a wiki, a space, documentation read end to end. */
  book: (s, hi) =>
    box(s, -31, -6, -18, 29, 36, 6) +
    box(s, 2, -6, -18, 29, 36, 6) +
    box(hi, -2, -8, -13, 4, 40, 8),

  /* A shield: sanitising, safety, whether the thing can be trusted. */
  shield: (s, hi) =>
    box(s.deep, -8, -6, -30, 16, 12, 8) +
    panel(s, -25, 2, -22, 50, 48) +
    panel(hi, -13, 1, -6, 26, 18),

  /* Two rings through each other: sharing, and the address a document gets. */
  link: (s, hi) =>
    cylinder(s, -13, -13, -8, 15, 7) +
    cylinder(s.deep, -13, -13, -3, 8, 9) +
    cylinder(hi, 13, 13, -16, 15, 7) +
    cylinder(s.deep, 13, 13, -11, 8, 9),

  /* A lit cube with a spark over it: the model wrote it, or the model read it. */
  spark: (s, hi) => {
    const [tx, ty] = at(0, 0, 30);

    return (
      box(s, -19, -19, -26, 38, 38, 30) +
      box(hi, -13, -13, 4, 26, 26, 6) +
      `<path d="M${tx.toFixed(1)} ${(ty - 26).toFixed(1)} l7 17 17 7 -17 7 -7 17 -7 -17 -17 -7 17 -7 z" fill="${hi.top}"/>`
    );
  },

  /* Cloud shapes over a plate: an export, a file that came from somewhere else. */
  cloud: (s, hi) =>
    plate(s.deep, -30, -30, -26, 60, 60) +
    cylinder(s, -13, -11, 0, 13, 10) +
    cylinder(s, 9, 3, -4, 15, 11) +
    cylinder(hi, -3, 14, -2, 11, 9),

  /* A magnifier over a slab: comparing things, reading one before trusting it. */
  magnifier: (s, hi) =>
    plate(s, -30, -30, -22, 60, 60) +
    box(s.deep, -23, -22, -18, 44, 8, 4) +
    box(s.deep, -23, -8, -18, 30, 8, 4) +
    cylinder(hi, 5, 5, 2, 17, 7) +
    cylinder(s.deep, 5, 5, 7, 11, 5),

  /* A toolbox: the set somebody reaches for, rather than one thing from it. */
  toolbox: (s, hi) =>
    box(s, -27, -19, -24, 54, 38, 22) +
    box(hi, -29, -21, -2, 58, 42, 7) +
    box(s.deep, -7, -5, 5, 14, 10, 10),

  /* A gear on a plate: something that runs without a person, on a schedule or a push. */
  gear: (s, hi) => {
    let teeth = '';

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;

      teeth += box(s, Math.cos(angle) * 21 - 4.5, Math.sin(angle) * 21 - 4.5, -8, 9, 9, 7);
    }

    return plate(s.deep, -31, -31, -20, 62, 62) + teeth + cylinder(hi, 0, 0, -8, 16, 9);
  },

  /* A folder standing open: a directory, a repository, docs beside the code. */
  folder: (s, hi) =>
    box(s, -28, -24, -22, 56, 46, 7) +
    panel(s, -28, 22, -15, 56, 32) +
    panel(hi, -24, 21, -15, 21, 9),

  /* A clock: scheduling, a build that runs at two in the morning. */
  clock: (s, hi) =>
    cylinder(s, 0, 0, -26, 25, 13) +
    cylinder(s.deep, 0, 0, -13, 20, 5) +
    wire(hi.top, [0, 0, -8], [0, -15, -8], 3.6) +
    wire(hi.top, [0, 0, -8], [13, 5, -8], 3.6),

  /* Plates converging into one: merging many files into a document somebody reads. */
  merge: (s, hi) =>
    plate(s, -35, -28, -16, 28, 19) +
    plate(s, -35, 9, -16, 28, 19) +
    wire(s.top, [-6, -18, -13], [12, -4, -2]) +
    wire(s.top, [-6, 19, -13], [12, 9, -2]) +
    plate(hi, 4, -15, -2, 32, 31),

  /* A plug into a socket: an API, a connector, a program calling another program. */
  plug: (s, hi) =>
    box(s, 3, -17, -24, 26, 34, 28) +
    box(hi, -23, -9, -14, 27, 18, 11) +
    wire(s.top, [-23, 0, -8], [-40, 0, -8], 3.6),

  /* Braces facing each other: syntax, escaping, the characters that mean something. */
  braces: (s, hi) =>
    plate(s.deep, -31, -31, -22, 62, 62) +
    box(s, -25, -17, -16, 9, 34, 9) +
    box(s, -16, -17, -16, 9, 9, 9) +
    box(s, -16, 8, -16, 9, 9, 9) +
    box(hi, 9, -17, -16, 9, 34, 9) +
    box(hi, 0, -17, -16, 9, 9, 9) +
    box(hi, 0, 8, -16, 9, 9, 9),
};

/*
 * Which object an article gets.
 *
 * Matched on the slug, most specific first, because the slug is the one piece of metadata that is
 * identical in every language — a German translation shows the same picture as its English original
 * without anybody mapping words twice. Anything unmatched falls back to a stable pick from the hash
 * rather than to one default, so a new article is never the sixth identical stack of pages.
 */
const BY_TOPIC = [
  [/obsidian|vault|wikilink/, 'graph'],
  [/confluence|wiki|documentation-that-lives|static-site/, 'book'],
  [/notion|zip|archive|export/, 'archive'],
  [/summar|assistant|chatgpt|mcp|ai-output/, 'spark'],
  [/excel|csv|tsv|spreadsheet|table/, 'grid'],
  [/json|database/, 'database'],
  [/command-line|\bcli\b|terminal|pandoc/, 'terminal'],
  [/github-actions|automat|batch|publish-markdown-from/, 'gear'],
  [/\bapi\b|connector/, 'plug'],
  [/safe|saniti|xss|secure/, 'shield'],
  [/share|link|shareable/, 'link'],
  [/merg|combine|many-markdown/, 'merge'],
  [/escap|syntax|footnote|flavour|commonmark|line-breaks|code-blocks|front-matter/, 'braces'],
  [/editor|vs-code|typora|dillinger|stackedit|live-preview|in-javascript|in-python/, 'screen'],
  [/best-|compare|alternative|choosing|converters|what-not-to-keep/, 'magnifier'],
  [/release-notes|changelog|schedule/, 'clock'],
  [/repo|folder|docs-in|how-to-open|open-md/, 'folder'],
  [/google-docs|cloud|web-page|save-a-web|online-document/, 'cloud'],
  [/workflow|toolbox|mammoth|turndown|libraries/, 'toolbox'],
  [/pdf|word|docx|plain-text|html|markdown-to/, 'stack'],
];

const SUBJECT_NAMES = Object.keys(SUBJECTS);

function subjectFor(slug) {
  for (const [pattern, name] of BY_TOPIC) {
    if (pattern.test(slug)) {
      return name;
    }
  }

  return SUBJECT_NAMES[seedOf(slug) % SUBJECT_NAMES.length];
}

/** The faces of a solid, derived from one colour so every picture is lit the same way. */
function shadesOf(colour) {
  return {
    top: mix(colour, '#ffffff', 0.3),
    left: mix(colour, '#05050a', 0.4),
    right: mix(colour, '#05050a', 0.64),
    deep: {
      top: mix(colour, '#05050a', 0.58),
      left: mix(colour, '#05050a', 0.72),
      right: mix(colour, '#05050a', 0.82),
    },
  };
}

/**
 * The card, as a page: a ground, a faint grid, a shadow under the object, and the object on it.
 *
 * Both sizes are this same composition — the share image and the index card differ only in how many
 * pixels come out of the screenshot, which is what keeps them from drifting apart.
 */
function card({ accent, slug = '' }) {
  /*
   * A rendered object if `scripts/og-art.mjs` has drawn one, the isometric drawing below if not.
   *
   * The drawn version is the floor, not the plan: it means a new article has a cover the moment it
   * exists, without an API key, a bill, or a person waiting on a model. Where a rendered object is
   * there, it wins — same frame, same ground, same accent around it either way.
   */
  const art = join(ROOT, 'content', 'og-art', `${slug}.webp`);
  const rendered = existsSync(art)
    ? `data:image/webp;base64,${readFileSync(art).toString('base64')}`
    : null;

  const s = shadesOf(accent);
  const hi = {
    top: mix(accent, '#ffffff', 0.42),
    left: accent,
    right: mix(accent, '#05050a', 0.38),
    deep: s.deep,
  };

  const drawing = SUBJECTS[subjectFor(slug)](s, hi);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(52% 84% at 50% 46%, ${accent}24 0%, ${accent}00 68%),
      linear-gradient(160deg, #14141d 0%, #0f0e14 68%);
  }

  /* The ground the objects stand on, faint enough to be a room rather than a pattern. */
  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(${accent}12 1px, transparent 1px),
      linear-gradient(90deg, ${accent}12 1px, transparent 1px);
    background-size: 58px 58px;
    mask-image: radial-gradient(56% 68% at 50% 50%, #000 0%, transparent 76%);
    -webkit-mask-image: radial-gradient(56% 68% at 50% 50%, #000 0%, transparent 76%);
  }

  .art {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg { width: 440px; height: 440px; }

  /*
   * The rendered object, sized to the same square the drawing occupies so the two are
   * interchangeable, with a soft shadow under it standing in for the ground the model was told not
   * to draw.
   */
  /*
   * The rendered square, melted into the ground.
   *
   * It carries its own near-black background rather than transparency — see og-art.mjs for why a
   * chroma key was the wrong answer — so the edges are faded out radially. A few values of
   * mismatch between the model's black and ours vanish in that fade; a hard edge would not.
   */
  img {
    width: 560px;
    height: 560px;
    object-fit: contain;
    mask-image: radial-gradient(closest-side, #000 52%, transparent 94%);
    -webkit-mask-image: radial-gradient(closest-side, #000 52%, transparent 94%);
  }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="art">
    ${
      rendered
        ? `<img src="${rendered}" alt="">`
        : `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="120" cy="198" rx="72" ry="16" fill="#05050a" opacity="0.5"/>
      ${drawing}
    </svg>`
    }
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ what to draw */

const cards = [];

/*
 * One cover per article, not one per language.
 *
 * The picture carries no words, so a German reader and an English one can be shown the same file —
 * which is why this reads only the English directory. It is also why adding a language costs no
 * images at all: `src/lib/covers.ts` resolves every locale to the same path.
 */
const articleDir = join(ROOT, 'content', 'blog');

for (const name of readdirSync(articleDir).sort()) {
  if (!name.endsWith('.md')) {
    continue;
  }

  const slug = name.replace(/\.md$/, '');
  const data = frontmatter(readFileSync(join(articleDir, name), 'utf8'));
  const one = { slug, accent: ACCENTS[data.tag] ?? DEFAULT_ACCENT };

  // The same picture twice: full size for a share, two thirds for the card that shows it.
  cards.push({ ...one, dir: 'blog', variant: 'og' });
  cards.push({ ...one, dir: 'card', variant: 'card' });
}

/*
 * The rest of the site. Hand-written rather than read from `shared/conversions.ts`, because this
 * script is plain Node with no bundler in front of it and importing a .ts file would need one.
 * `npm run og` prints the count, so a page added without a card is visible.
 */
const PAGES = [
  ['home', 'A document converter that runs in your browser', 'Converter', ACCENTS.Converting],
  ['blog', 'Markdown, and what to do with it', 'Blog', ACCENTS.Syntax],
  ['docs', 'Everything TransformPipe does', 'Documentation', ACCENTS.Code],
  ['markdown-to-html', 'Markdown to HTML', 'Convert', ACCENTS.Converting],
  ['html-to-markdown', 'HTML to Markdown', 'Convert', ACCENTS.Converting],
  ['word-to-markdown', 'Word to Markdown', 'Convert', ACCENTS.Publishing],
  ['csv-to-markdown', 'CSV to a Markdown table', 'Convert', ACCENTS.Automation],
  ['json-to-markdown', 'JSON to Markdown', 'Convert', ACCENTS.Code],
  ['notion-to-markdown', 'Notion to Markdown', 'Convert', ACCENTS.Workflow],
  ['confluence-to-markdown', 'Confluence to Markdown', 'Convert', ACCENTS.Workflow],
  ['obsidian-to-markdown', 'Obsidian to Markdown', 'Convert', ACCENTS.Workflow],
  ['text-to-markdown', 'Raw text to Markdown', 'Convert', ACCENTS.Syntax],
  ['excel-to-markdown', 'Excel to a Markdown table', 'Convert', ACCENTS.Automation],
  ['powerpoint-to-markdown', 'PowerPoint to Markdown', 'Convert', ACCENTS.Publishing],
  ['epub-to-markdown', 'An EPUB book to Markdown', 'Convert', ACCENTS.Syntax],
  ['odt-to-markdown', 'OpenDocument to Markdown', 'Convert', ACCENTS.Publishing],
  ['rtf-to-markdown', 'Rich text to Markdown', 'Convert', ACCENTS.Publishing],
  ['how-to/open-md', 'How to open an .md file', 'How to', ACCENTS.Converting],
  ['how-to/open-html', 'How to open an .html file', 'How to', ACCENTS.Converting],
  ['how-to/open-docx', 'How to open a .docx file', 'How to', ACCENTS.Publishing],
  ['how-to/open-csv', 'How to open a .csv file', 'How to', ACCENTS.Automation],
  ['how-to/open-json', 'How to open a .json file', 'How to', ACCENTS.Code],
  ['how-to/open-txt', 'How to open a .txt file', 'How to', ACCENTS.Syntax],
  ['how-to/open-xlsx', 'How to open an .xlsx file', 'How to', ACCENTS.Automation],
  ['how-to/open-pptx', 'How to open a .pptx file', 'How to', ACCENTS.Publishing],
  ['how-to/open-epub', 'How to open an .epub file', 'How to', ACCENTS.Syntax],
  ['how-to/open-odt', 'How to open an .odt file', 'How to', ACCENTS.Publishing],
  ['how-to/open-rtf', 'How to open an .rtf file', 'How to', ACCENTS.Publishing],
  ['how-to/open-zip', 'How to open an export .zip', 'How to', ACCENTS.Workflow],
  ['how-to/assistant', 'Share from an assistant', 'How to', ACCENTS.Automation],
  ['about', 'About TransformPipe', 'Company', ACCENTS.Workflow],
  ['support', 'Support', 'Company', ACCENTS.Workflow],
  ['extension', 'The browser extension', 'Company', ACCENTS.Converting],
  ['privacy', 'Privacy', 'Legal', ACCENTS.Safety],
  ['terms', 'Terms of use', 'Legal', ACCENTS.Safety],
  ['cookies', 'Cookies', 'Legal', ACCENTS.Safety],
];

for (const [name, title, eyebrow, accent] of PAGES) {
  cards.push({ slug: name, title, eyebrow, accent, variant: 'og' });
}

/* ------------------------------------------------------------------ draw them */

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});

const page = await browser.newPage();

for (const one of cards) {
  const { scale, type, quality, ext } = VARIANTS[one.variant];
  const file = join(OUT, ...(one.dir ? [one.dir] : []), `${one.slug}.${ext}`);

  mkdirSync(dirname(file), { recursive: true });
  /*
   * The layout is always drawn at 1200 by 630; the scale factor decides how many pixels come out.
   * So the card is the same composition, not a second one that has to be kept in step.
   */
  await page.setViewport({
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: scale,
  });
  await page.setContent(card(one), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(file, await page.screenshot({ type, quality }));
}

await browser.close();

const articles = (cards.length - PAGES.length) / 2;

console.log(
  `drew ${cards.length} covers into public/og: ${articles} articles (a share image and a card image each) and ${PAGES.length} pages`
);
