/*
 * What every cover on the site is a picture of — the subjects `og-art.mjs` asks an image model for.
 *
 * Its own module, not inside `og-art.mjs`, because the blog's checker reads it too: that script
 * draws, needs an API key and exits without one, and a check that two articles do not share a
 * picture has to run on every build without either.
 *
 * Three layers, most specific first. A page has its own (`PAGES`). An article named in `BY_SLUG`
 * has its own. Anything else falls into a bucket by the words in its slug (`BY_TOPIC`). The buckets
 * came first and were the problem: twenty or so objects across seventy articles put three
 * magnifying glasses and five spreadsheets on the blog's index, often side by side, because the
 * articles that match one bucket are usually written in the same week. So an article that would
 * share its object with another is given one of its own in `BY_SLUG`, and `check-blog.mjs` fails
 * the build on a second match — a new article that lands in a bucket somebody already has needs a
 * line here, not a sixth copy.
 */

/** The same stable hash `og-images.mjs` uses, so a slug always lands on the same variant. */
export function seedOf(slug) {
  let h = 2166136261;

  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

/*
 * What each article is a picture of.
 *
 * The same topic mapping `og-images.mjs` uses for its drawn fallback, so the two never disagree
 * about what an article is about — written here as the sentence a model needs rather than as
 * boxes and cylinders.
 */
export const BY_TOPIC = [
  /*
   * Broad buckets carry several subjects rather than one.
   *
   * Twenty subjects across sixty-three articles is fine until you notice where the repeats fall:
   * every "best X converter" matched one rule and the index showed three magnifying glasses in a
   * row, next to three near-identical titles. So the widest buckets — comparisons, and the plain
   * "one format into another" pieces that are most of this blog — spread across a few subjects
   * picked by the slug's own hash.
   */
  [/obsidian|vault|wikilink/, 'a cluster of glossy spheres of two sizes joined by slender rods into a knowledge graph, one larger sphere at its centre'],
  [/confluence|wiki|documentation-that-lives|static-site/, 'an open book with softly curved pages and a ribbon bookmark, a few loose pages lifting from it'],
  [/notion|zip|archive|export/, 'a sturdy storage box with its lid lifted off and floating just above it, several document pages rising out of the open box'],
  [/summar|assistant|chatgpt|mcp|ai-output/, 'a rounded cube with a large four-pointed sparkle hovering above it and two smaller sparkles beside it'],
  [/excel|csv|tsv|spreadsheet|table/, 'a spreadsheet slab built from a neat grid of raised square cells, a few cells standing taller than the rest like a small bar chart'],
  [/json|database/, 'three stacked cylindrical discs forming a database, with a small ring of cables looping out of one side'],
  [/command-line|\bcli\b|terminal|pandoc/, 'a chunky monitor on a small stand, its screen showing a few simple raised bars and a single blinking caret block'],
  [/github-actions|automat|batch|publish-markdown-from/, 'two interlocking cog wheels of different sizes, the larger one lying at an angle'],
  [/\bapi\b|connector/, 'a rounded plug sliding into a socket block, a short looping cable trailing from it'],
  [/safe|saniti|xss|secure/, 'a rounded shield standing upright with a raised check mark on its face and a row of small studs along its rim'],
  [/share|link|shareable/, 'two thick interlocking rings, one passing through the other, with a small sphere resting where they meet'],
  [/merg|combine|many-markdown/, 'three flat document plates funnelling into one larger plate below them, arrows implied by their angle'],
  [/escap|syntax|footnote|flavour|commonmark|line-breaks|code-blocks|front-matter/, [
    'two facing curly brace shapes carved as thick solid blocks, with a small cube floating between them',
    'a row of small tiles standing on edge, one of them flipped over to face the other way',
    'a short chain of linked cubes with one cube lifted slightly out of line',
  ]],
  [/editor|vs-code|typora|dillinger|stackedit|live-preview|in-javascript|in-python/, [
    'a wide monitor on a stand, its screen carrying a few raised bars and a small floating panel drifting off one corner',
    'a laptop standing half open, a few raised bars on its screen',
    'a floating rectangular window panel with a thick cursor arrow resting on it',
  ]],
  [/best-|compare|alternative|choosing|converters|what-not-to-keep/, [
    'a magnifying glass with a thick rim hovering over a flat slab, a few raised bars visible through its lens',
    'a balance scale with a small cube resting on each of its two pans',
    'a three-step podium with a small rounded cube standing on the tallest step',
    'two flat panels standing side by side with a thin gap between them, the left one raised slightly higher',
  ]],
  [/release-notes|changelog|schedule/, 'a round clock lying at an angle with simple raised hands, a small stack of pages beside it'],
  [/repo|folder|docs-in|how-to-open|open-md/, 'an open folder with three documents rising out of it in a fan'],
  [/google-docs|cloud|web-page|save-a-web|online-document/, 'a rounded cloud with a document page descending from it on a small arrow'],
  [/workflow|toolbox|mammoth|turndown|libraries/, [
    'an open toolbox with a thick handle, a few simple tools standing up inside it',
    'a short segment of conveyor belt with a small box riding on it',
    'three thick tubes joined into a pipeline, a small cube travelling through the middle one',
  ]],
  [/pdf|word|docx|plain-text|html|markdown-to/, [
    'a stack of three flat document pages offset from each other, the top one lifting away',
    'a single document page curling and folding into a different shape in mid-air',
    'two document pages facing each other with a small thick arrow block between them',
    'a document page sliding out of a narrow slot in a solid block',
  ]],
];

export const FALLBACK = 'a stack of three flat document pages offset from each other, the top one lifting away';

/* The accent per tag, named rather than given as a hex: a model reads a word, not a number. */
export const COLOURS = {
  Converting: 'teal cyan',
  Syntax: 'periwinkle blue',
  Publishing: 'warm amber',
  Automation: 'mint green',
  Safety: 'coral red',
  Workflow: 'violet purple',
  Code: 'sky blue',
};

export const DEFAULT_COLOUR = COLOURS.Converting;

/*
 * The pages that are not articles.
 *
 * They have no frontmatter to read a topic from, so a hash was picking their subject — which put a
 * knowledge graph on the front page, a picture that belongs to an article about Obsidian and says
 * nothing about a converter. Named here instead, with the same accent `og-images.mjs` gives each
 * one, so the whole site shares one set rather than the blog having a set and everything else
 * having whatever came up.
 */
export const PAGES = {
  home: ['a flat document page on the left and a structured slab of stacked bars on the right, with a thick chevron arrow block between them pointing right', 'teal cyan'],
  blog: ['a small stack of closed books lying flat with one open book resting on top of them', 'periwinkle blue'],
  docs: ['a thick manual standing upright with a ribbon bookmark trailing from it', 'sky blue'],
  about: ['three rounded cubes of different sizes grouped closely together', 'violet purple'],
  contact: ['a paper envelope lying at an angle with its flap slightly open', 'violet purple'],
  privacy: ['a chunky padlock with a rounded body and a thick shackle, closed', 'coral red'],
  terms: ['a folded document with a round seal disc pressed onto its corner', 'coral red'],
  cookies: ['a round cookie-shaped disc with a few raised round chips on its top face', 'coral red'],

  /* The how-to pages: the file itself, as an object somebody is about to open. */
  'how-to/open-md': ['a single document page standing upright with a few raised lines of text on it and one corner turned over', 'teal cyan'],
  'how-to/open-html': ['a browser window panel floating at an angle with a few raised bars inside it', 'teal cyan'],
  'how-to/open-docx': ['a thick bound document lying at an angle with a few raised lines on its cover', 'warm amber'],
  'how-to/open-csv': ['a narrow slab of two columns of small raised cells, like a comma-separated file', 'mint green'],
  'how-to/open-json': ['two facing curly brace blocks with a small stack of tiles between them', 'sky blue'],
  'how-to/open-txt': ['a plain flat page with evenly spaced raised lines and nothing else on it', 'periwinkle blue'],
  'how-to/open-xlsx': ['a workbook of three stacked sheets, the top one a grid of raised cells', 'mint green'],
  'how-to/open-zip': ['a closed archive box with a zip seam running across its lid', 'violet purple'],
  'how-to/assistant': ['a rounded plug sliding into a socket block with a small four-pointed sparkle floating above the join', 'mint green'],
};

/*
 * Articles with an object of their own, because the bucket their slug falls into is already taken.
 *
 * Each says something about its article rather than its format: Pandoc is the multi-tool, the
 * "sorted by why you are looking" piece is a signpost, footnotes are a slip hanging off a page.
 */
export const BY_SLUG = {
  'best-csv-to-markdown-converters':
    'a row of three small spreadsheet tiles on a low podium, the middle tile standing tallest',
  'convert-excel-to-markdown-table':
    'a thick ledger book lying open with a raised grid of square cells across both pages',
  'convert-json-to-markdown-table':
    'a pair of large curly brace blocks with a small grid of square cells held between them',
  'markdown-tables-that-survive-conversion':
    'a grid of square tiles with one corner tile cracked and lifted, a small clamp holding the rest of the grid together',
  'markdown-to-html-converter':
    'a document page passing through an arched gateway and coming out the other side as a browser window panel',
  'markdown-to-pdf':
    'a compact printer block with a single sheet of paper sliding out of its front slot',
  'markdown-to-plain-text':
    'a document page with its raised markings peeled off and lying beside it as a small pile of loose pieces',
  'markdown-to-word':
    'a thick bound report with a few raised lines on its cover and a pencil resting across it',
  'stackedit-alternatives':
    'two stacked notebooks with a loop of two curved arrow blocks resting on top of them',
  'markdown-to-html-in-javascript':
    'a browser window panel with a small gear turning inside it',
  'markdown-to-html-in-python':
    'a coiled tube looping twice around a small upright document page',
  'markdown-to-html-in-vs-code':
    'a split editor panel with two side-by-side panes, the right pane showing a few raised blocks',
  'ai-output-to-a-shareable-page':
    'a speech bubble block turning into a flat document page as it drifts away, a small sparkle at its corner',
  'converting-documents-from-an-assistant':
    'a speech bubble block with a document page sliding out of its tail',
  'what-a-document-costs-an-assistant':
    'a small stack of round tokens like coins standing beside an upright document page',
  'code-blocks-in-markdown':
    'a thick rectangular block fenced in on three sides by low walls, raised bars on its top face',
  'front-matter-and-what-converters-do-with-it':
    'a document page with a separate small card clipped onto its top edge',
  'markdown-footnotes-support':
    'a document page with a tiny separate slip hanging from its bottom edge on a short thread',
  'documentation-that-lives-in-the-repo':
    'a small tree of branching rods with flat document pages for leaves',
  'free-confluence-to-markdown-converter':
    'a bundle of pages tied with a ribbon, one page sliding free of the bundle',
  'static-site-generator-or-converter':
    'a small house-shaped block built from stacked document pages',
  'best-word-to-markdown-converters':
    'three document pages standing in a row, each a little taller than the last, a raised check mark resting on the tallest',
  'markitdown-alternatives':
    'a signpost with three arrow-shaped boards pointing in different directions',
  'convert-markdown-to-html-online':
    'a globe made of a lattice of rings with a document page resting on top of it',
  'markdown-vs-html':
    'a seesaw with a plain flat page on one end and a page covered in raised angle-bracket blocks on the other',
  'free-notion-to-markdown-converter':
    'a stack of modular building blocks with one block lifted off the top',
  'pictures-in-a-document-export':
    'a picture frame with a small mountain shape inside it, sliding into a document page',
  'free-obsidian-to-markdown-converter':
    'a faceted crystal gem standing on a small square base',
  'markdown-from-notion-obsidian-and-confluence':
    'a wide tray collecting document pages that slide into it down three chutes',
  'what-is-pandoc':
    'a pocket multi-tool with several blades and tools fanned out',
  'pandoc-alternatives-for-markdown-to-html':
    'a pegboard with several tools of different sizes hanging side by side',
  'batch-convert-markdown-files':
    'a tall stack of document pages feeding into a block that sends out an equally tall stack on its other side',
  'best-html-to-markdown-converters':
    'a measuring ruler lying across two document pages of different lengths',
  'what-not-to-keep-from-a-docx':
    'a sieve with a few document scraps resting in it and small pieces falling through',
  'convert-epub-to-markdown':
    'an e-reader tablet lying at an angle with a few pages lifting out of its screen',
  'convert-powerpoint-to-markdown':
    'a presentation easel holding a slide board, a small stack of note cards at its foot',
  'self-contained-html-explained':
    'a sealed glass capsule with a document page and a few small blocks enclosed inside it',
  'save-a-web-page-as-markdown':
    'a browser window panel with a document page being lifted out of it by a small hook',
  'images-and-links-that-still-work':
    'a picture frame and a document page joined by a short sturdy chain',
  'sanitising-markdown-safely':
    'a funnel with a fine mesh filter inside it, a few small blocks caught on the mesh',
  'markdown-line-breaks-and-lists':
    'a short staircase of flat bars, each step set in a little further than the one above',
};

export function subjectFor(slug) {
  if (PAGES[slug]) {
    return PAGES[slug][0];
  }

  if (BY_SLUG[slug]) {
    return BY_SLUG[slug];
  }

  for (const [pattern, subject] of BY_TOPIC) {
    if (pattern.test(slug)) {
      return Array.isArray(subject)
        ? subject[seedOf(slug) % subject.length]
        : subject;
    }
  }

  return FALLBACK;
}

/** Groups of articles that would get the same object: an empty list is the only good answer. */
export function sharedSubjects(slugs) {
  const bySubject = new Map();

  for (const slug of slugs) {
    const subject = subjectFor(slug);

    bySubject.set(subject, [...(bySubject.get(subject) ?? []), slug]);
  }

  return [...bySubject.values()].filter((group) => group.length > 1);
}
