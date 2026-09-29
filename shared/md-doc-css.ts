/**
 * Markdown document styles.
 *
 * The rules are written once against `--md-*` custom properties and used both
 * in the in-app preview and in the exported standalone .html file, so what the
 * preview shows is byte-for-byte what gets downloaded. The document keeps its
 * light "paper" look regardless of the app theme — it is meant to be shared
 * and printed.
 */

type ThemeVars = Record<string, string>;

const DARK: ThemeVars = {
  '--md-ink': '#f9fafb',
  '--md-body': '#f4f4f5',
  '--md-secondary': '#d1d5db',
  '--md-brand': '#148f8d',
  '--md-brand-2': '#2fa29b',
  '--md-brand-3': '#14a8af',
  '--md-card': '#17171e',
  '--md-page': '#0f0e14',
  '--md-card-2': '#21212c',
  '--md-stroke': '#2a2834',
  '--md-table-header': '#2a2834',
  /*
   * Code, in six roles rather than the twenty a editor theme uses.
   *
   * Six is what a document needs: a reader is skimming a snippet, not editing it, and a block
   * painted in twenty colours reads as decoration. Keywords take the brand teal because that is
   * the colour this product already uses for "this is the important word".
   */
  '--md-syn-comment': '#7b8794',
  '--md-syn-key': '#2ebec4',
  '--md-syn-str': '#9ecb8b',
  '--md-syn-num': '#e0a77a',
  '--md-syn-fn': '#8ab4f8',
  '--md-syn-var': '#d1d5db',
  '--md-syn-del': '#f28b82',
  '--md-alert-note': '#5b9dd9',
  '--md-alert-tip': '#57b87f',
  '--md-alert-important': '#a482e0',
  '--md-alert-warning': '#d9a441',
  '--md-alert-caution': '#e06c6c',
};

const LIGHT: ThemeVars = {
  '--md-ink': '#0f172a',
  '--md-body': '#334155',
  '--md-secondary': '#5a6a80',
  '--md-brand': '#07807e',
  '--md-brand-2': '#066867',
  // Links in a rendered document, and the light value is the one that has to carry text: #0d8e97
  // measures 3.8:1 on this page's own background, which is under the 4.5 a body link needs.
  '--md-brand-3': '#0d717a',
  '--md-card': '#ffffff',
  '--md-page': '#f8fafc',
  '--md-card-2': '#f1f5f9',
  '--md-stroke': '#e2e8f0',
  '--md-table-header': '#eaeff5',
  /* The same six, darkened until each one carries text on paper. */
  '--md-syn-comment': '#6b7a8c',
  '--md-syn-key': '#0d717a',
  '--md-syn-str': '#2f7d4f',
  '--md-syn-num': '#a4552a',
  '--md-syn-fn': '#2a5db0',
  '--md-syn-var': '#334155',
  '--md-syn-del': '#b3261e',
  '--md-alert-note': '#2a5db0',
  '--md-alert-tip': '#1f7a52',
  '--md-alert-important': '#6d4bb0',
  '--md-alert-warning': '#a4552a',
  '--md-alert-caution': '#b3261e',
};

/**
 * The same values, for something that cannot read a custom property.
 *
 * Mermaid is handed a palette as literal colours at render time, not a stylesheet — so it needs
 * the numbers rather than the variable names, and it needs them from here rather than from a
 * second copy that drifts.
 */
export function mdDocVars(theme: 'dark' | 'light'): Readonly<ThemeVars> {
  return theme === 'dark' ? DARK : LIGHT;
}

const declare = (vars: ThemeVars) =>
  Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

/**
 * The document's own palette, frozen to literal values so the exported file needs nothing from
 * its host page. `selector` widens the scope for the export, where the page chrome around the
 * sheet reads the same variables.
 */
export function mdDocTheme(
  theme: 'dark' | 'light',
  selector = '.md-doc'
): string {
  return `${selector} {
${declare(theme === 'dark' ? DARK : LIGHT)}
}`;
}

/**
 * The palette left to the reader's own setting.
 *
 * A downloaded file freezes the theme its owner was looking at — that is the file they saw. A page
 * we serve has no such owner: whoever opens the link brings their own preference, so it ships both
 * palettes and lets the browser choose.
 */
export function mdDocResponsiveTheme(selector = '.md-doc'): string {
  return `${selector} {
${declare(LIGHT)}
}

@media (prefers-color-scheme: dark) {
${selector} {
${declare(DARK)}
}
}`;
}

/**
 * An article is the page it is on, not a document pasted onto it.
 *
 * The document palette exists to make an uploaded file look like paper on the converter's screen —
 * a sheet, lighter than the page behind it. On the blog that reading is wrong: the article *is* the
 * page, and a sheet there is a light rectangle sitting inside a darker one with a visible edge.
 *
 * So the card goes transparent, and `--md-page` — which is what code blocks and alternating table
 * rows are painted with — moves up to the card colour, or those would be painted the same as the
 * page behind them and disappear.
 */
export function mdArticleSurface(theme: 'dark' | 'light'): string {
  const vars = theme === 'dark' ? DARK : LIGHT;

  return `.md-article,
.md-article .md-doc {
  --md-card: transparent;
  --md-page: ${vars['--md-card-2']};
}`;
}

/** On paper a dark document is a wall of ink, so printing always uses the light values. */
export function mdDocPrintOverride(selector = '.md-doc'): string {
  return `@media print {
${selector} {
${declare(LIGHT)}
}
}`;
}

/** Typography + block rules — identical in preview and export. */
/**
 * How wide a document is, wherever one is read on its own.
 *
 * Five rules have to agree on it: the shared page's bar, the document, the footer under it and the
 * panel at its foot, and the preview in the app when it goes full screen. They used to agree by
 * having a number typed into each, in two files — the shared page at 48rem and the full-screen
 * preview at 56, so the view somebody was sent was narrower than the one its author edited in.
 *
 * A TypeScript constant rather than a CSS custom property. A property declared in one style block
 * and read in another is undefined on any page that includes the second without the first, and an
 * undefined `max-width` is not an error anybody sees: it is `none`, and a bar the width of the
 * screen. A constant is substituted when the string is built and cannot be missing.
 *
 * 56rem is a line of about a hundred characters, which is the long end of comfortable for prose and
 * the right trade here: shared documents are reports and specifications, dense with tables, and
 * the complaint that moved this was a five-column table scrolling beside empty margins.
 */
export const MD_MEASURE = '56rem';

export const MD_DOC_STYLE = `
.md-doc {
  background: var(--md-card);
  color: var(--md-body);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 0.9375rem;
  line-height: 1.7;
  word-break: break-word;
}

.md-doc > *:first-child { margin-top: 0; }
.md-doc > *:last-child { margin-bottom: 0; }

.md-doc h1,
.md-doc h2,
.md-doc h3,
.md-doc h4,
.md-doc h5,
.md-doc h6 {
  margin: 1.75em 0 0.6em;
  color: var(--md-ink);
  font-weight: 600;
  line-height: 1.3;
  scroll-margin-top: 5rem;
}

.md-doc h1 { margin-top: 0; font-size: 1.875rem; letter-spacing: -0.01em; }
.md-doc h2 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--md-stroke);
  font-size: 1.5rem;
  letter-spacing: -0.01em;
}
.md-doc h3 { font-size: 1.25rem; }
.md-doc h4 { font-size: 1.0625rem; }
.md-doc h5 { font-size: 0.9375rem; }
.md-doc h6 { color: var(--md-secondary); font-size: 0.875rem; }

.md-doc p { margin: 0.85em 0; }

.md-doc strong { color: var(--md-ink); font-weight: 600; }
.md-doc em { font-style: italic; }
.md-doc del { color: var(--md-secondary); text-decoration: line-through; }

.md-doc a {
  color: var(--md-brand-3);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.md-doc a:hover { color: var(--md-brand-2); }

.md-doc ul,
.md-doc ol { margin: 0.85em 0; padding-left: 1.5rem; }
.md-doc ul { list-style: disc; }
.md-doc ol { list-style: decimal; }
.md-doc li { margin: 0.25em 0; }
.md-doc li > ul,
.md-doc li > ol { margin: 0.25em 0; }
.md-doc li::marker { color: var(--md-secondary); }
.md-doc li:has(> input[type="checkbox"]),
.md-doc li:has(> p:first-child > input[type="checkbox"]:first-child),
.md-doc li.task-list-item { list-style: none; margin-left: -1.25rem; }
.md-doc input[type="checkbox"] { margin-right: 0.5rem; accent-color: var(--md-brand); }

.md-doc blockquote {
  margin: 1em 0;
  padding: 0.15em 0 0.15em 1rem;
  border-left: 3px solid var(--md-brand-2);
  color: var(--md-secondary);
}
.md-doc blockquote > *:first-child { margin-top: 0; }
.md-doc blockquote > *:last-child { margin-bottom: 0; }

.md-doc code {
  padding: 0.15em 0.4em;
  border-radius: 0.25rem;
  background: var(--md-card-2);
  color: var(--md-body);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85em;
}

.md-doc pre {
  margin: 1.15em 0;
  padding: 0.9rem 1rem;
  overflow-x: auto;
  border: 1px solid var(--md-stroke);
  border-radius: 0.75rem;
  background: var(--md-page);
  line-height: 1.55;
}
.md-doc pre code {
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-size: 0.8125rem;
}

.md-doc hr {
  margin: 2em 0;
  border: 0;
  border-top: 1px solid var(--md-stroke);
}

/*
 * The limit and the scrolling belong to the box, not to the table.
 *
 * With both on the table, a wide one does not scroll — the table layout obeys the limit and
 * squeezes its columns instead, and a ten-column compatibility table in a side panel came back
 * one letter per line. Here the box is as wide as there is room for and scrolls, and the table
 * inside it takes the width its content needs.
 */
.md-doc .md-table {
  max-width: 100%;
  margin: 1.15em 0;
  overflow-x: auto;
}

.md-doc table {
  width: max-content;
  max-width: none;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.md-doc th,
.md-doc td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--md-stroke);
  text-align: left;
  vertical-align: top;
}
.md-doc th {
  background: var(--md-table-header);
  color: var(--md-ink);
  font-weight: 600;
  white-space: nowrap;
}
.md-doc tbody tr:nth-child(even) td { background: var(--md-page); }

.md-doc img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/*
 * A drawn mermaid diagram. Until the browser draws one the fence is still a pre.md-mermaid,
 * which needs no rule of its own: it is a code block, and it is meant to look like one.
 */
.md-doc .md-diagram {
  margin: 1.4em 0;
  padding: 0.9rem 1rem;
  overflow-x: auto;
  border: 1px solid var(--md-stroke);
  border-radius: 0.75rem;
  background: var(--md-page);
  text-align: center;
}

/*
 * Its own size, and the figure scrolls when that is wider than the page.
 *
 * A max-width of 100% reads as the careful choice and is the wrong one here: a diagram is a drawing
 * with text in it, and halving it to fit a narrow pane halves the labels too, at which point
 * nobody can read it and it may as well not be there. Centring applies to one that fits and
 * leaves one that does not starting at the left edge, where reading it begins.
 */
.md-doc .md-diagram svg {
  max-width: none;
  height: auto;
}

/*
 * Maths. There is no stylesheet to ship here — MathML is laid out by the browser, with the maths
 * font it already has — so this is only about where the formula sits on the page.
 */
.md-doc .md-math {
  /* A span as well as a div: LaTeX's own display delimiters arrive inside a paragraph. */
  display: block;
  margin: 1.25em 0;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: center;
}
.md-doc math { font-size: 1.05em; }
.md-doc .md-math math { font-size: 1.15em; }

/*
 * Highlighted code. Classes come from highlight.js; the colours are this document's.
 *
 * Grouped by what a reader is looking for rather than by grammar, which is why one rule carries a
 * dozen selectors: hljs-section, hljs-selector-tag and hljs-keyword are the same thing in
 * three languages, and colouring them apart would tell a reader nothing.
 */
.md-doc .hljs-comment,
.md-doc .hljs-quote { color: var(--md-syn-comment); font-style: italic; }

.md-doc .hljs-keyword,
.md-doc .hljs-selector-tag,
.md-doc .hljs-section,
.md-doc .hljs-doctag,
.md-doc .hljs-meta .hljs-keyword,
.md-doc .hljs-tag { color: var(--md-syn-key); }

.md-doc .hljs-string,
.md-doc .hljs-regexp,
.md-doc .hljs-char.escape_,
.md-doc .hljs-addition,
.md-doc .hljs-meta .hljs-string,
.md-doc .hljs-symbol { color: var(--md-syn-str); }

.md-doc .hljs-number,
.md-doc .hljs-literal,
.md-doc .hljs-bullet,
.md-doc .hljs-link,
.md-doc .hljs-selector-attr,
.md-doc .hljs-selector-pseudo { color: var(--md-syn-num); }

.md-doc .hljs-title,
.md-doc .hljs-name,
.md-doc .hljs-built_in,
.md-doc .hljs-type,
.md-doc .hljs-class,
.md-doc .hljs-selector-id,
.md-doc .hljs-selector-class,
.md-doc .hljs-template-tag { color: var(--md-syn-fn); }

.md-doc .hljs-attr,
.md-doc .hljs-attribute,
.md-doc .hljs-property,
.md-doc .hljs-variable,
.md-doc .hljs-params,
.md-doc .hljs-template-variable,
.md-doc .hljs-subst,
.md-doc .hljs-meta { color: var(--md-syn-var); }

.md-doc .hljs-deletion { color: var(--md-syn-del); }

.md-doc .hljs-emphasis { font-style: italic; }
.md-doc .hljs-strong { font-weight: 600; }

/*
 * An alert — a NOTE marker and its relatives. A quote with a coloured edge and a word on top.
 *
 * One rule and a variable per kind, rather than five blocks: the only thing that differs between
 * a note and a caution is the colour, and writing that five times is five places to forget.
 */
.md-doc .md-alert {
  border-left-width: 3px;
  border-left-color: var(--md-alert);
  border-left-style: solid;
  border-radius: 0 0.5rem 0.5rem 0;
  background: var(--md-card-2);
  padding: 0.85rem 1.1rem;
  margin: 1.25em 0;
  font-style: normal;
  color: var(--md-body);
}
.md-doc .md-alert-note { --md-alert: var(--md-alert-note); }
.md-doc .md-alert-tip { --md-alert: var(--md-alert-tip); }
.md-doc .md-alert-important { --md-alert: var(--md-alert-important); }
.md-doc .md-alert-warning { --md-alert: var(--md-alert-warning); }
.md-doc .md-alert-caution { --md-alert: var(--md-alert-caution); }

.md-doc .md-alert-title {
  margin: 0 0 0.35em;
  color: var(--md-alert);
  font-weight: 600;
  font-size: 0.9375em;
}
.md-doc .md-alert > :last-child { margin-bottom: 0; }

.md-doc mark {
  padding: 0.05em 0.2em;
  border-radius: 0.2rem;
  background: var(--md-alert-warning);
  color: var(--md-page);
}

/* Footnotes: the rule that separates them, the list itself, and the way back up. */
.md-doc .md-fnrule { margin-top: 2.5em; }
.md-doc .md-footnotes {
  padding-left: 1.2em;
  font-size: 0.875em;
  color: var(--md-secondary);
}
.md-doc .md-footnotes li { margin: 0.35em 0; }
.md-doc .md-fnref { font-size: 0.75em; }
.md-doc .md-fnref a,
.md-doc .md-fnback {
  color: var(--md-brand-3);
  text-decoration: none;
}
.md-doc .md-fnback { margin-left: 0.35em; }

.md-doc kbd {
  padding: 0.1em 0.4em;
  border: 1px solid var(--md-stroke);
  border-bottom-width: 2px;
  border-radius: 0.25rem;
  background: var(--md-card);
  font-family: inherit;
  font-size: 0.8em;
}
`;

/** Page chrome for the exported standalone document. */
export const MD_DOC_PAGE_STYLE = `
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 3rem 1.25rem 4rem;
  background: var(--md-page);
  -webkit-font-smoothing: antialiased;
}

.md-page {
  max-width: ${MD_MEASURE};
  margin: 0 auto;
  padding: 2.5rem 3rem 3rem;
  border: 1px solid var(--md-stroke);
  border-radius: 1rem;
  background: var(--md-card);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
}

.md-footer {
  max-width: ${MD_MEASURE};
  margin: 1rem auto 0;
  color: var(--md-secondary);
  font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 0.75rem;
  text-align: right;
}

/* The line under a document is the one place it says where it came from; a default blue there
 * would be the loudest thing on the page. */
.md-footer a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.md-footer a:hover { color: var(--md-brand-3); }

@media (max-width: 640px) {
  body { padding: 1rem 0.75rem 2rem; }
  .md-page { padding: 1.5rem 1.25rem 2rem; }
}

@media print {
  body { padding: 0; background: #ffffff; }
  .md-page {
    max-width: none;
    border: 0;
    border-radius: 0;
    background: #ffffff;
    box-shadow: none;
  }
  .md-footer { display: none; }
}
`;

/**
 * The preview frame, and what fullscreen does to it.
 *
 * Reading a long document inside a page that also has an app around it is cramped, so fullscreen
 * hands the whole screen to the sheet: the frame becomes the page background, and the sheet itself
 * takes the height and scrolls, keeping a readable measure rather than stretching lines across a
 * 27-inch monitor.
 */
export const MD_PREVIEW_STYLE = `
/* The sheet the document sits on — painted here so its padding is part of the page, not a gap. */
.md-sheet {
  background: var(--md-card);
}

/*
 * An article's own measure.
 *
 * The blog column is 880px wide, matching the reference site's, and at the document's 15px that is
 * about 117 characters a line — well past the 65 to 75 a reader is comfortable with. A point of
 * type buys back seven characters and costs nothing else, so an article gets 16px while the
 * converter's preview and the exported file keep the document's own size.
 */
.md-article .md-doc {
  font-size: 1rem;
}

/*
 * Room above a heading for the app's sticky header.
 *
 * Only in the preview: jumping to a heading from a contents list otherwise lands with the heading
 * itself underneath the header, so the reader arrives at the paragraph after the one they asked
 * for. The exported document has no header, and this rule is not in its stylesheet.
 */
.md-doc :is(h1, h2, h3, h4, h5, h6) {
  scroll-margin-top: 7rem;
}

.md-preview-frame:fullscreen {
  display: flex;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: var(--md-page);
  overflow-y: auto;
}

.md-preview-frame:fullscreen .md-sheet {
  width: 100%;
  max-width: ${MD_MEASURE};
  height: max-content;
  margin: 0 auto;
  padding: 3rem 3.5rem;
  border: 1px solid var(--md-stroke);
  border-radius: 1rem;
}

@media (max-width: 640px) {
  .md-preview-frame:fullscreen .md-sheet {
    padding: 1.5rem 1.25rem;
  }
}
`;
