/*
 * A picture from the web, as bytes, for a file that has to carry it inside — a book, a Word
 * document.
 *
 * Only ever from the browser. The page is the reader's, the request is one their browser would
 * make for the preview anyway, and a server that fetched an address a document's author chose
 * would be fetching `http://169.254.169.254/` for whoever asked (see `server/docx.ts`).
 *
 * Null when the server it lives on does not let a page read it — most that are not a CDN — or when
 * it is not a picture. Ten seconds each at most: a file that never arrives because one server is
 * slow is worse than a file with a link in it.
 */

const PICTURES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']);

export async function fetchPicture(url: string): Promise<{ mediaType: string; bytes: Uint8Array } | null> {
  try {
    const response = await fetch(url, { mode: 'cors', signal: AbortSignal.timeout(10_000) });
    const mediaType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();

    if (!response.ok || !PICTURES.has(mediaType)) return null;

    return { mediaType, bytes: new Uint8Array(await response.arrayBuffer()) };
  } catch {
    return null;
  }
}
