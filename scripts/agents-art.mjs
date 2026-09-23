/* Draws the pictures on the assistant pages, `/agents` and the ones under it, with an image model.
 *
 *   node scripts/agents-art.mjs               # everything missing
 *   node scripts/agents-art.mjs share find    # just these, redrawn
 *
 * The same house style as `og-art.mjs` — one object, isometric, one hue — so these read as the same
 * set as the blog's covers. One difference: the background is transparent rather than the page's
 * near-black, because these sit on the page itself, in whichever theme the reader has, and not on a
 * cover that is always dark.
 *
 * Like `og-art.mjs` it costs money and cannot be reproduced, so it runs by hand and what it writes
 * into public/agents is committed and treated as source.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve('.');
const OUT = join(ROOT, 'public', 'agents');

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
  console.error('No OPENAI_API_KEY. Add it to .env.local — it is only needed here, never at runtime.');
  process.exit(1);
}

const STYLE = [
  'Clean isometric 3D render, viewed from the upper-left corner at a 30 degree angle.',
  'Smooth matte surfaces with softly rounded edges, gentle ambient occlusion, one clear light from the upper left and a thin brighter rim along the top edges.',
  'Strictly monochrome: only shades of {COLOUR}, muted and slightly desaturated, from deep shadow tones to small pale highlights on the top edges. No other hue anywhere.',
  'A single composition, centred, filling about 75 percent of the frame with even margins on all sides. No floor, no wall, no room.',
  'Fully transparent background: nothing behind the object, no backdrop, no gradient, no vignette, no glow. A soft contact shadow directly beneath the object is welcome.',
  'Absolutely no text, no letters, no numbers, no symbols, no logos, no watermarks, no user interface labels of any kind.',
].join(' ');

/* What each picture is of, and its accent — the same named hues the covers use. */
const PICTURES = {
  keep: [
    'an open rounded filing drawer holding a neat row of upright document cards, one card lifted halfway out',
    'teal cyan',
  ],
  share: [
    'a flat rounded document card with a thick chain link resting across its lower corner, and a paper plane lifting off from its top edge',
    'warm amber',
  ],
  find: [
    'a thick magnifying glass leaning over a small fanned stack of flat document cards, the top card slightly raised',
    'sky blue',
  ],
  versions: [
    'three flat rounded document sheets stacked with a staggered offset like steps, the newest on top slightly brighter, with a small curved arrow block looping around them',
    'violet purple',
  ],

  /* One per assistant, for the row of cards. An object that suggests each, never its logo. */
  'client-claude': [
    'a rounded speech bubble slab with a small eight-pointed starburst resting on top of it',
    'warm amber',
  ],
  'client-chatgpt': [
    'two rounded speech bubble slabs of different sizes stacked at an offset, the smaller one in front',
    'mint green',
  ],
  'client-cursor': [
    'a large rounded arrow-shaped mouse pointer block leaning on a flat slab with three raised bars like lines of code',
    'sky blue',
  ],
  'client-gemini': [
    'two smooth four-pointed sparkle stars of different sizes floating one above the other',
    'periwinkle blue',
  ],
  'client-vscode': [
    'a flat rounded editor window slab with a pair of thick angle brackets standing upright in front of it',
    'teal cyan',
  ],
  'client-windsurf': [
    'a small rounded surfboard with a curved sail rising from it, riding on a smooth stylised wave block',
    'violet purple',
  ],
};

async function draw(name) {
  const [subject, colour] = PICTURES[name];
  const prompt = `${subject}. ${STYLE.replace('{COLOUR}', colour)}`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: 'high',
      background: 'transparent',
      output_format: 'webp',
      output_compression: 80,
    }),
  });

  const body = await response.json();
  const b64 = body.data?.[0]?.b64_json;

  if (!b64) {
    throw new Error(`${name}: ${JSON.stringify(body.error ?? body).slice(0, 300)}`);
  }

  writeFileSync(join(OUT, `${name}.webp`), Buffer.from(b64, 'base64'));
  console.log('drew', name);
}

mkdirSync(OUT, { recursive: true });

const asked = process.argv.slice(2);
const names = asked.length
  ? asked
  : Object.keys(PICTURES).filter((name) => !existsSync(join(OUT, `${name}.webp`)));

await Promise.all(names.map((name) => draw(name).catch((error) => console.error(error.message))));
