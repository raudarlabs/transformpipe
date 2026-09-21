/*
 * The page as it actually looks, in one file.
 *
 * The other way of saving a page — find the article, convert it, render it in this product's own
 * stylesheet — is the right answer for something somebody is going to read or edit, and the wrong
 * one for a landing page: there is no article in a landing page to find, so what comes back is its
 * words in a column with none of its design and none of its pictures. That is what "it saved the
 * text and nothing else" means, and it is a fair complaint about the wrong tool rather than a bug
 * in this one.
 *
 * So this is the other tool. It takes the live document, inlines what it needs to stand alone —
 * stylesheets as text, images and fonts as data URIs — drops everything that would reach out to a
 * network or run, and hands back one string. It is what a browser's own "save page" would do if it
 * wrote a single file.
 *
 * Every line of it runs inside the page, serialised into `chrome.scripting.executeScript`, so it
 * closes over nothing and can use the page's own credentials and cache to read the assets it is
 * inlining. That last part is why this cannot happen in the extension: a stylesheet behind a login
 * is fetched here the way the page itself fetched it.
 */
export interface Snapshot {
  html: string;
  title: string;
  /** What had to be left as an address, so the caller can say so if it matters. */
  missed: number;
}

export async function snapshot(
  maxAsset: number,
  maxTotal: number
): Promise<Snapshot> {
  let spent = 0;
  let missed = 0;

  const asDataUri = async (url: string): Promise<string | null> => {
    if (!/^https?:\/\//i.test(url) || spent > maxTotal) {
      return null;
    }

    try {
      /*
       * Credentials first, because an image behind a login needs them — and then without, because
       * a CDN that allows anonymous reads refuses a credentialed one outright: `Access-Control-
       * Allow-Origin: *` and `include` cannot both be true. Six pictures came back as addresses in
       * a saved GitHub page for exactly that reason.
       */
      const response = await fetch(url, { credentials: 'include' }).catch(
        () => null
      );
      const answer =
        response && response.ok
          ? response
          : await fetch(url, { credentials: 'omit' }).catch(() => null);

      if (!answer?.ok) {
        return null;
      }

      const blob = await answer.blob();

      if (blob.size > maxAsset || spent + blob.size > maxTotal) {
        return null;
      }

      spent += blob.size;

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  /* `url(...)` inside a stylesheet, resolved against wherever that stylesheet lives. */
  const inlineCssUrls = async (css: string, base: string): Promise<string> => {
    const seen = new Map<string, string>();
    const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
      .map((match) => match[1])
      .filter((one) => one && !one.startsWith('data:'));

    for (const one of new Set(urls)) {
      let absolute: string;

      try {
        absolute = new URL(one, base).href;
      } catch {
        continue;
      }

      const data = await asDataUri(absolute);

      if (data) {
        seen.set(one, data);
      } else {
        seen.set(one, absolute);
        missed++;
      }
    }

    return css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (whole, one: string) =>
      seen.has(one) ? `url("${seen.get(one)}")` : whole
    );
  };

  /*
   * Only the rules this page actually uses.
   *
   * A modern site ships one stylesheet for the whole application — utility frameworks emit tens of
   * thousands of rules — and a page uses a few hundred of them. Carried whole, the saved file is
   * megabytes of CSS with the document buried under it, which is what "the code is a mess" means
   * when somebody opens it: the markup is there, it is just at line forty thousand.
   *
   * Dropping the rest is safe here in a way it is not in a live page: this file has no scripts, so
   * no class will ever be added to it that is not in it now. What a rule is tested against is its
   * selector with the state stripped off — `:hover` and `::before` describe a moment, not an
   * element — and anything that cannot be parsed or tested is kept, because a file that renders
   * wrong is worse than a file that is long.
   */
  const STATE =
    /::?(hover|active|focus|focus-visible|focus-within|visited|target|checked|disabled|enabled|required|valid|invalid|placeholder-shown|autofill|read-only|read-write|default|indeterminate|optional|in-range|out-of-range|user-invalid|user-valid|before|after|first-line|first-letter|selection|placeholder|backdrop|marker|file-selector-button|-webkit-[a-z-]+)\b(\([^)]*\))?/g;

  const used = (selector: string): boolean => {
    for (const one of selector.split(',')) {
      const clean = one.replace(STATE, '').replace(/\s+/g, ' ').trim();

      if (!clean || /^(html|body|:root|\*)$/.test(clean)) {
        return true;
      }

      try {
        if (document.querySelector(clean)) {
          return true;
        }
      } catch {
        /* A selector this browser cannot parse is a rule we are not qualified to drop. */
        return true;
      }
    }

    return false;
  };

  const keepRules = (rules: CSSRuleList): string => {
    const kept: string[] = [];

    for (const rule of [...rules]) {
      /* A style rule: the one kind there is any point in testing. */
      if (rule instanceof CSSStyleRule) {
        if (used(rule.selectorText)) {
          kept.push(rule.cssText);
        }

        continue;
      }

      /* Media, supports, layer, container: keep the wrapper, test what is inside it. */
      if (rule instanceof CSSGroupingRule) {
        const inner = keepRules(rule.cssRules);

        if (inner.trim()) {
          const head = rule.cssText.slice(0, rule.cssText.indexOf('{') + 1);

          kept.push(`${head}\n${inner}\n}`);
        }

        continue;
      }

      /* Font faces, keyframes, properties, page rules: small, and referenced by name. */
      kept.push(rule.cssText);
    }

    return kept.join('\n');
  };

  /**
   * The rules of a stylesheet this browser will not let us read directly.
   *
   * A cross-origin sheet refuses `cssRules`, so its text is fetched and parsed by handing it back
   * to the browser: a `<style media="not all">` is parsed and never applied, which makes its
   * `cssRules` readable without changing the page for the second it exists.
   */
  const keepFromText = (css: string): string => {
    const holder = document.createElement('style');

    holder.media = 'not all';
    holder.textContent = css;
    document.head.append(holder);

    let kept = css;

    try {
      if (holder.sheet?.cssRules) {
        kept = keepRules(holder.sheet.cssRules);
      }
    } catch {
      /* Unparseable here too: the text goes in as it came. */
    }

    holder.remove();

    return kept;
  };

  /*
   * Minified CSS, given its line breaks back.
   *
   * A snapshot is a file for a browser to open, not for a person to read — but it is still a file
   * somebody will open in an editor one day, and a site's stylesheets arrive as one line each, so
   * the whole thing lands as four unreadable lines. One rule per line costs nothing at render time
   * and is the difference between a file you can look through and a wall.
   */
  const readable = (css: string) =>
    css.includes('\n') ? css : css.replace(/}\s*/g, '}\n');

  const copy = document.documentElement.cloneNode(true) as HTMLElement;

  /*
   * Where a line break is safe, decided by the page itself.
   *
   * A saved page arrives as a few lines of half a million characters, which renders perfectly and
   * cannot be read by a person. Breaking it anywhere is not an option: whitespace between two
   * inline-block elements is a visible gap, so a formatter that does not know the CSS will move
   * things on the page to make the file prettier.
   *
   * This runs inside the page, where the answer is knowable: `getComputedStyle` says what each
   * element actually is, and a break before an element whose display is block, flex, grid or a
   * table part changes nothing at all. The clone is walked in lockstep with the live tree, before
   * anything is removed from it, so the two are still the same shape.
   */
  const INLINE = /^(inline|inline-block|inline-flex|inline-grid|contents|none)$/;
  const breakBefore = new WeakSet<Element>();
  const live = [document.documentElement, ...document.documentElement.querySelectorAll('*')];
  const copies = [copy, ...copy.querySelectorAll('*')];

  for (let index = 0; index < live.length && index < copies.length; index++) {
    const element = live[index];

    if (INLINE.test(getComputedStyle(element).display)) {
      continue;
    }

    /* Inside these, whitespace is content: a line break would show up in the rendered text. */
    if (element.closest('pre, textarea, code, samp, kbd')) {
      continue;
    }

    breakBefore.add(copies[index]);
  }

  /* Nothing that runs, and nothing that asks the network for more of the page. */
  for (const node of copy.querySelectorAll(
    'script, noscript, link[rel~="preload"], link[rel~="prefetch"], link[rel~="modulepreload"], iframe, object, embed'
  )) {
    node.remove();
  }

  /*
   * The page's `<style>` elements are paired with the copy's before anything is inserted.
   *
   * Both lists are taken here, above the link pass, and that is the whole of the fix for a bug
   * that made a saved page render with no styling at all. The pairing is by position — the nth
   * `<style>` in the copy is the nth in the document — and the link pass below replaces every
   * `<link rel=stylesheet>` with a *new* `<style>`. Ask the copy for its styles after that and
   * the list has grown: position 6 in the copy is now an inlined stylesheet while position 6 in
   * the document is still the sixth `<style>` the page wrote, and the loop overwrites the first
   * with the second.
   *
   * On mermaid.ai that meant every one of the site's stylesheets was replaced by the CSS of a
   * Mermaid diagram — 1.6 MB of `#mermaid-20 { … }` and not one rule that matched anything on
   * the page. `querySelectorAll` returns a static list, so taking both now keeps them aligned.
   */
  const liveStyles = [...document.querySelectorAll('style')];
  const copiedStyles = [...copy.querySelectorAll('style')];

  /*
   * Stylesheets, in the order the document has them.
   *
   * `cssRules` is read first because it is already parsed and already resolved; a cross-origin
   * sheet refuses that, and then the file is fetched as text the way the page would have. One of
   * the two works for almost everything.
   */
  const sheets = [...copy.querySelectorAll('link[rel~="stylesheet"]')];

  for (const sheet of sheets) {
    const href = sheet.getAttribute('href');

    if (!href) {
      sheet.remove();
      continue;
    }

    let absolute: string;

    try {
      absolute = new URL(href, document.baseURI).href;
    } catch {
      sheet.remove();
      continue;
    }

    let css: string | null = null;

    const sheetInPage = [...document.styleSheets].find(
      (one) => one.href === absolute
    );

    try {
      if (sheetInPage?.cssRules) {
        css = keepRules(sheetInPage.cssRules);
      }
    } catch {
      /* Cross-origin and not readable this way: fetched below instead. */
    }

    if (css === null) {
      try {
        const response = await fetch(absolute, { credentials: 'include' });

        css = response.ok ? keepFromText(await response.text()) : null;
      } catch {
        css = null;
      }
    }

    if (css === null) {
      missed++;
      continue;
    }

    const style = document.createElement('style');

    style.textContent = readable(await inlineCssUrls(css, absolute));
    sheet.replaceWith(style);
  }

  /*
   * The page's own `<style>` elements: same two passes, and the live one beside each is what has
   * the parsed rules. A framework's styles arrive this way as often as they arrive as a file.
   * Both lists were taken above, before the link pass could add to either.
   */
  for (let index = 0; index < copiedStyles.length; index++) {
    const style = copiedStyles[index];
    const sheet = liveStyles[index]?.sheet;
    let css = style.textContent ?? '';

    try {
      if (sheet?.cssRules) {
        css = keepRules(sheet.cssRules);
      }
    } catch {
      /* Keep what the element itself says. */
    }

    if (css.includes('url(')) {
      css = await inlineCssUrls(css, document.baseURI);
    }

    style.textContent = readable(css);
  }

  /* Pictures: the tag, the lazy attributes it may be hiding behind, and inline backgrounds. */
  const images = [...copy.querySelectorAll('img')];

  for (const image of images) {
    /*
     * A lazy image keeps its real address in `data-src` and a one-pixel placeholder in `src`, so
     * the placeholder is what a naive read carries into the file: a saved page full of grey dots.
     * The lazy attributes win whenever `src` is one of those.
     */
    const current = image.getAttribute('src') ?? '';
    const lazy =
      image.getAttribute('data-src') ||
      image.getAttribute('data-original') ||
      image.getAttribute('data-lazy-src') ||
      '';
    const placeholder =
      !current || current.startsWith('data:') || /\b1x1|spacer|blank\./.test(current);
    const candidate = placeholder && lazy ? lazy : current || lazy;

    let absolute = '';

    try {
      absolute = candidate ? new URL(candidate, document.baseURI).href : '';
    } catch {
      absolute = '';
    }

    if (!absolute) {
      continue;
    }

    const data = await asDataUri(absolute);

    image.setAttribute('src', data ?? absolute);
    image.removeAttribute('srcset');
    image.removeAttribute('loading');
    image.removeAttribute('data-src');

    if (!data) {
      missed++;
    }
  }

  for (const source of copy.querySelectorAll('picture source')) {
    source.remove();
  }

  for (const element of copy.querySelectorAll<HTMLElement>('[style*="url("]')) {
    element.setAttribute(
      'style',
      await inlineCssUrls(element.getAttribute('style') ?? '', document.baseURI)
    );
  }

  /*
   * A base, so anything that could not be carried still resolves, and a note saying where this came
   * from and when — a saved page with no provenance is a file nobody can place a year later.
   */
  const head = copy.querySelector('head') ?? copy.insertBefore(document.createElement('head'), copy.firstChild);
  const base = document.createElement('base');

  base.href = document.baseURI;
  head.prepend(base);

  const note = document.createComment(
    ` Saved from ${document.location.href} on ${new Date().toISOString()} by TransformPipe `
  );

  head.prepend(note);

  /*
   * The breaks, put in last — after the removing and the inlining, so nothing walks over them.
   * Two spaces per level of depth, capped: an app's markup is forty levels deep in places and an
   * indent that deep is a horizontal scrollbar rather than a structure anybody can see.
   */
  for (const element of [copy, ...copy.querySelectorAll('*')]) {
    if (!breakBefore.has(element) || !element.parentNode) {
      continue;
    }

    let depth = 0;

    for (let up = element.parentElement; up; up = up.parentElement) {
      depth++;
    }

    element.parentNode.insertBefore(
      document.createTextNode(`\n${'  '.repeat(Math.min(depth, 12))}`),
      element
    );
  }

  /* The head is not laid out, so its children are a separate, equally safe case. */
  for (const child of [...head.children]) {
    head.insertBefore(document.createTextNode('\n'), child);
  }

  head.append(document.createTextNode('\n'));

  return {
    html: `<!doctype html>\n${copy.outerHTML}`,
    title: document.title,
    missed,
  };
}
