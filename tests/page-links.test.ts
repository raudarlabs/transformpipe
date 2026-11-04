import { beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * The database answers which of the owner's documents are shared and by what token; here a map
 * stands in for it, and every query sees the ids it was asked about.
 */
const shared = new Map<string, string>();
const asked: string[][] = [];

vi.mock('../server/db.js', () => ({
  sql: () => (_strings: TemplateStringsArray, ...values: unknown[]) => {
    const ids = values[1] as string[];

    asked.push(ids);

    return Promise.resolve(ids.filter((id) => shared.has(id)).map((id) => ({ id, share_token: shared.get(id) })));
  },
}));

const { linkSharedMarkdown, linkSharedPages } = await import('../server/page-links.js');

const SHARED = '11111111-1111-4111-8111-111111111111';
const PRIVATE = '22222222-2222-4222-8222-222222222222';
const IN_FOLDER = '33333333-3333-4333-8333-333333333333';

beforeEach(() => {
  shared.clear();
  shared.set(SHARED, 'tok en');
  asked.length = 0;
});

describe('linkSharedPages', () => {
  it('sends a shared page to its own link, keeping the heading', async () => {
    const html = `<a href="/markdown-to-word?doc=${SHARED}#doc-budget" class="x">Budget</a>`;

    expect(await linkSharedPages(html, 'owner')).toBe(`<a href="/s/tok%20en#doc-budget" class="x">Budget</a>`);
  });

  it('reads a private page as its words', async () => {
    const html = `<a href="/markdown-to-word?doc=${PRIVATE}">Secret</a>`;

    expect(await linkSharedPages(html, 'owner')).toBe(
      '<span class="md-unshared" title="A page that is not shared">Secret</span>'
    );
  });

  it('keeps the app address for the owner reading their own share', async () => {
    const html = `<a href="/markdown-to-word?doc=${PRIVATE}">Secret</a>`;

    expect(await linkSharedPages(html, 'owner', { isOwner: true })).toBe(html);
  });

  it('does not hand the owner the app address in a file that leaves the site', async () => {
    const html = `<a href="/markdown-to-word?doc=${PRIVATE}">Secret</a>`;

    expect(await linkSharedPages(html, 'owner', { isOwner: true, origin: 'https://transformpipe.com' })).toBe(
      '<span class="md-unshared" title="A page that is not shared">Secret</span>'
    );
  });

  it('opens a page inside the shared folder there, without asking the database about it', async () => {
    const html = `<a href="/markdown-to-word?doc=${IN_FOLDER}">Sibling</a>`;
    const folder = { token: 'f1', inside: new Set([IN_FOLDER]) };

    expect(await linkSharedPages(html, 'owner', { folder })).toBe(`<a href="/f/f1/${IN_FOLDER}">Sibling</a>`);
    expect(asked.flat()).not.toContain(IN_FOLDER);
  });

  it('makes links whole for a file that leaves the site', async () => {
    const html = `<a href="/markdown-to-word?doc=${SHARED}">Shared</a>`;

    expect(await linkSharedPages(html, 'owner', { origin: 'https://transformpipe.com' })).toBe(
      '<a href="https://transformpipe.com/s/tok%20en">Shared</a>'
    );
  });

  it('knows the front page, where Markdown to HTML lives', async () => {
    const html = `<a href="/?doc=${SHARED}">Home</a>`;

    expect(await linkSharedPages(html, 'owner')).toBe('<a href="/s/tok%20en">Home</a>');
  });

  it('leaves ordinary links alone', async () => {
    const html = '<a href="https://example.com/?doc=1">Elsewhere</a>';

    expect(await linkSharedPages(html, 'owner')).toBe(html);
  });
});

describe('linkSharedMarkdown', () => {
  it('rewrites shared links and reduces private ones to words', async () => {
    const markdown = `[One](/markdown-to-word?doc=${SHARED}#doc-a) and [Two](/markdown-to-word?doc=${PRIVATE})`;

    expect(await linkSharedMarkdown(markdown, 'owner', { origin: 'https://t.co' })).toBe(
      '[One](https://t.co/s/tok%20en#doc-a) and Two'
    );
  });

  it('reads an address in angle brackets', async () => {
    expect(await linkSharedMarkdown(`[One](</markdown-to-word?doc=${SHARED}>)`, 'owner', {})).toBe('[One](/s/tok%20en)');
  });

  it('leaves an image alone', async () => {
    const markdown = `![Chart](/markdown-to-word?doc=${PRIVATE})`;

    expect(await linkSharedMarkdown(markdown, 'owner', {})).toBe(markdown);
  });

  it('asks about each document once', async () => {
    const markdown = `[a](/markdown-to-word?doc=${SHARED}) [b](/markdown-to-word?doc=${SHARED})`;

    await linkSharedMarkdown(markdown, 'owner', {});

    expect(asked).toEqual([[SHARED]]);
  });
});
