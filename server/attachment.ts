/**
 * A `Content-Disposition` for a download, for any file name somebody might give a document.
 *
 * Header values are bytes, not text: `Headers` refuses any character above U+00FF, so a document
 * called `Insightis-конкуренты.md` made every download of it throw before a byte was sent, and the
 * person got a bare 500. Five routes wrote the name into the header as it was — the shared page's
 * HTML, and Word and PDF from the app and from the API — so any name outside Latin-1, which is most
 * of the world's, could not be downloaded at all.
 *
 * RFC 6266 has the answer and every browser since 2011 reads it: `filename*` carries the real name
 * percent-encoded as UTF-8, and `filename` beside it carries an ASCII stand-in for the rare client
 * that does not. The stand-in keeps the letters it can — `é` becomes `e` — replaces the rest, and
 * drops the two characters that would end a quoted string early.
 */
export function attachment(fileName: string): string {
  const fallback =
    fileName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e]/g, '_')
      .replace(/["\\]/g, '_')
      .trim() || 'document';

  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
