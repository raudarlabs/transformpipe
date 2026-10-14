/* Draws the object that sits on each cover, once, with an image model.
 *
 *   node scripts/og-art.mjs                 # everything missing
 *   node scripts/og-art.mjs some-slug ...   # just these, redrawn
 *   node scripts/og-art.mjs --stale         # whatever og-subjects.mjs now describes differently
 *
 * Separate from `npm run og` on purpose. That script is deterministic: the same slug produces the
 * same picture on any machine, for free, forever. This one costs money and cannot be reproduced —
 * ask twice for the same prompt and you get two different objects. So it runs by hand, writes PNGs
 * into public/og/art, and those files are committed and treated as source from then on. `og` picks
 * them up if they are there and falls back to its own isometric drawing if they are not, which is
 * what keeps a new article from blocking on an API key.
 *
 * Only the object comes from the model, on a transparent background. The frame around it — the
 * ground, the glow, the accent, the 1200 by 630 — stays ours, because that is what makes sixty
 * separately generated pictures look like one set rather than sixty.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { COLOURS, DEFAULT_COLOUR, PAGES, subjectFor } from './og-subjects.mjs';

const ROOT = resolve('.');
/*
 * Source, not output: these are the model's own renders, kept out of public/ deliberately. In
 * public/ they would be served to every visitor and shipped in every deploy — 74 MB of 1024px PNGs
 * nobody asked for — when the only thing that needs them is `npm run og`, at build time, to
 * composite each one onto a cover.
 */
const OUT = join(ROOT, 'content', 'og-art');

/*
 * The key lives in .env.local, which this reads by hand: the script is plain Node with no bundler
 * and no dotenv, the same reason `og-images.mjs` writes out its own locale list.
 */
function keyFromEnvFile() {
  const path = join(ROOT, '.env.local');

  if (!existsSync(path)) {
    return undefined;
  }

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+)\s*$/);

    if (match) {
      return match[1].replace(/^["']|["']$/g, '');
    }
  }

  return undefined;
}

const KEY = process.env.OPENAI_API_KEY ?? keyFromEnvFile();

if (!KEY) {
  console.error(
    'No OPENAI_API_KEY. Add it to .env.local — it is only needed here, never at runtime.'
  );
  process.exit(1);
}

/*
 * One style block, repeated word for word in every prompt.
 *
 * This is the whole reason the set holds together. An image model drifts between calls, so
 * everything that must not drift is stated the same way every time: the projection, the light, the
 * surface, the framing, and the palette as a single hue. The negatives are not decoration either —
 * left to itself the model writes labels on things, and garbled lettering is exactly what these
 * covers exist to avoid.
 */
const STYLE = [
  'Clean isometric 3D render, viewed from the upper-left corner at a 30 degree angle.',
  'Smooth matte surfaces with softly rounded edges, gentle ambient occlusion, one clear light from the upper left and a thin brighter rim along the top edges.',
  'Strictly monochrome: only shades of {COLOUR}. Muted and desaturated, in the mid-to-dark range — this sits on a near-black page, so it must read as a quiet object lit in a dark room, not a bright pastel toy. Deep shadow tones, a restrained mid tone, and only small pale highlights on the top edges. No other hue anywhere.',
  'A single object, centred, filling about 70 percent of the frame with even margins on all sides. No floor, no wall, no room, no props around it.',
  'The background is a perfectly flat, uniform, very dark near-black field, hex #0F0E14, filling every pixel the object does not cover. Nothing else in the background: no gradient, no vignette, no glow, no texture, no horizon line. A soft contact shadow directly beneath the object is welcome.',
  'Absolutely no text, no letters, no numbers, no symbols, no logos, no watermarks, no user interface labels of any kind.',
].join(' ');

function frontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = {};

  if (!match) {
    return data;
  }

  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(':');

    if (at > 0) {
      data[line.slice(0, at).trim()] = line.slice(at + 1).trim().replace(/^["']|["']$/g, '');
    }
  }

  return data;
}


async function draw(slug, colour) {
  const prompt = `${subjectFor(slug)}. ${STYLE.replace('{COLOUR}', colour)}`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: 'high',
      output_format: 'webp',
      n: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  const body = await response.json();
  const b64 = body.data?.[0]?.b64_json;

  if (!b64) {
    throw new Error(`no image came back: ${JSON.stringify(body).slice(0, 300)}`);
  }

  return Buffer.from(b64, 'base64');
}

/*
 * Why there is no chroma key here.
 *
 * The first attempt asked for a flat magenta backdrop and cut it out in a canvas. It worked on the
 * teal objects and destroyed the violet one: magenta and violet are neighbours, so the key ate the
 * subject. Any single key colour has the same problem against a palette of seven hues.
 *
 * So the background stays in the picture, asked for as the page's own near-black, and the cover
 * fades the square's edges into that same ground — a mismatch of a few values disappears in the
 * fade, where a keyed edge would have left a coloured fringe.
 */
/*
 * What comes back from the model is a 1024px image at full quality: about a megabyte each, 70 MB
 * across the set, for something the cover then draws at 560px. So each one is shrunk on the way in.
 * Done in the browser that already draws the covers rather than with an image library, for the same
 * reason `og-images.mjs` renders there: a canvas is three lines and needs no new dependency.
 */
const CHROME =
  process.env.CHROME_PATH ??
  {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  }[process.platform] ??
  'google-chrome';

const SAVED_AT = 768;

async function shrink(page, image) {
  const smaller = await page.evaluate(
    async (url, size) => {
      const picture = new Image();

      await new Promise((done) => {
        picture.onload = done;
        picture.src = url;
      });

      const canvas = document.createElement('canvas');

      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d').drawImage(picture, 0, 0, size, size);

      return canvas.toDataURL('image/webp', 0.86);
    },
    `data:image/webp;base64,${image.toString('base64')}`,
    SAVED_AT
  );

  return Buffer.from(smaller.split(',')[1], 'base64');
}

const articles = readdirSync(join(ROOT, 'content', 'blog'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.replace(/\.md$/, ''));

/*
 * Which subject drew each picture, so a changed subject can be found without redrawing the rest.
 *
 * `--stale` draws exactly those — a picture whose subject in `og-subjects.mjs` is no longer the
 * one it was drawn from, and any that is missing. The record is written after every picture, so a
 * run that stops halfway leaves an honest list behind it.
 */
const RECORD = join(OUT, 'subjects.json');
const record = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, 'utf8')) : {};
const remember = (slug) => {
  record[slug] = subjectFor(slug);
  writeFileSync(
    RECORD,
    `${JSON.stringify(Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`
  );
};

const stale = process.argv.includes('--stale');
const asked = process.argv.slice(2).filter((one) => !one.startsWith('--'));
const pages = Object.keys(PAGES);
const wanted = stale
  ? [...articles, ...pages].filter(
      (slug) => !existsSync(join(OUT, `${slug}.webp`)) || record[slug] !== subjectFor(slug)
    )
  : asked.length > 0
    ? asked
    : [...articles, ...pages];

if (stale) {
  console.log(`${wanted.length} to draw: ${wanted.join(', ')}`);
}

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();

let drawn = 0;
let skipped = 0;

for (const slug of wanted) {
  const file = join(OUT, `${slug}.webp`);

  // Never redraw by accident: these cost money and cannot be reproduced.
  if (asked.length === 0 && !stale && existsSync(file)) {
    skipped += 1;
    continue;
  }

  if (!articles.includes(slug) && !PAGES[slug]) {
    console.error(`${slug}: neither an article nor a page`);
    continue;
  }

  const colour = PAGES[slug]
    ? PAGES[slug][1]
    : COLOURS[
        frontmatter(readFileSync(join(ROOT, 'content', 'blog', `${slug}.md`), 'utf8')).tag
      ] ?? DEFAULT_COLOUR;

  try {
    // A page id can carry a slash — `how-to/open-md` — so the folder may not exist yet.
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, await shrink(page, await draw(slug, colour)));
    remember(slug);
    drawn += 1;
    console.log(`drew ${slug} (${colour})`);
  } catch (cause) {
    console.error(`${slug}: ${cause.message}`);
  }
}

await browser.close();

console.log(`\n${drawn} drawn, ${skipped} already there, in content/og-art`);
