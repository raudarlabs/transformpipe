import { htmlToMarkdown } from './from-html.js';
import { md5 } from './md5.js';
import { heldPictures, pictureBudget } from './pictures.js';
import { buildTocDocument, withoutDuplicateTitle, type TocPage } from './zip-import.js';
import { decodeXml, textOf } from './xml.js';

/*
 * An Evernote `.enex` export, as one document.
 *
 * Not a zip this time: one XML file holding every note, and inside each note its content as
 * ENML — Evernote's own restricted XHTML — wrapped in a CDATA section so that one XML document
 * can carry another. So this is two parsers deep before there is a word to convert, and the
 * inner one already exists: ENML is close enough to XHTML that `htmlToMarkdown` reads it, once
 * the three tags that are Evernote's own have been turned into things it knows.
 *
 * Those three:
 *
 *   `<en-todo checked="true"/>`   a checkbox, which becomes a Markdown task list
 *   `<en-media hash="…"/>`        a picture or an attachment, addressed by the MD5 of its bytes
 *   `<en-crypt>`                  text encrypted with a passphrase nobody here has
 *
 * The middle one is why `md5.ts` exists. A note does not name its pictures: it names the hash of
 * their contents, and the `<resource>` elements further down the file carry the bytes. Matching
 * them means hashing.
 *
 * Tags come across as a line under each note's title. They are the whole organising principle of
 * an Evernote library — the reason a person has ten thousand notes and can still find one — and
 * dropping them silently would lose more than any amount of formatting.
 */

interface Resource {
  /** As the file wrote it. The bytes are decoded only to be hashed; nothing re-encodes them. */
  base64: string;
  mime: string;
  name: string;
}

const PICTURE_MIME = /^image\/(png|jpeg|gif|webp|bmp|avif|tiff)$/i;

function fromBase64(base64: string): Uint8Array {
  const clean = base64.replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);

  for (let at = 0; at < binary.length; at += 1) bytes[at] = binary.charCodeAt(at);

  return bytes;
}

/** `20260921T101500Z`, which is the only date format this export writes. */
function readDate(stamp: string | undefined): string {
  const match = /^(\d{4})(\d{2})(\d{2})T/.exec(stamp?.trim() ?? '');

  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

/** One tag of a note, whether the file escaped the inner XML or wrapped it in CDATA. */
function inner(note: string, tag: string): string | undefined {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(note);

  if (!match) return undefined;

  const cdata = /^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/.exec(match[1]);

  return cdata ? cdata[1] : decodeXml(match[1]);
}

/**
 * Evernote's checkboxes, made into a Markdown task list.
 *
 * A note writes one as `<div><en-todo checked="true"/>Book the room</div>` — a checkbox inside a
 * paragraph, not inside a list, because in Evernote it is not one. The HTML converter faithfully
 * produces `[x] Book the room` as a paragraph, and a paragraph that starts with `[x]` is not a
 * task list anywhere; it is the literal characters. The marker makes it one, and the blank line
 * between two of them goes, so that a list of things to do reads as a list of things to do.
 */
function asTaskList(markdown: string): string {
  return markdown
    .replace(/^(\[[ xX]\]\s)/gm, '- $1')
    .replace(/^(- \[[ xX]\] .*)\n\n(?=- \[[ xX]\] )/gm, '$1\n');
}

export function evernoteToMarkdown(enex: string, fallbackTitle: string): string {
  const notes = [...enex.matchAll(/<note>([\s\S]*?)<\/note>/g)].map((one) => one[1]);

  if (notes.length === 0) {
    throw new Error(
      'No notes found in that file — is it an .enex? Evernote writes one with File, Export notes.'
    );
  }

  /*
   * Held aside rather than written into the HTML, for the reason `pictures.ts` explains at
   * length: an `<img>` whose address is two million characters is not what an HTML parser is
   * built for, and this one is about to run over every note in the file.
   */
  const held = heldPictures(pictureBudget());

  const pages: TocPage[] = [];

  for (const [index, note] of notes.entries()) {
    const title = textOf(inner(note, 'title') ?? '') || `Note ${index + 1}`;
    const tags = [...note.matchAll(/<tag(?:\s[^>]*)?>([\s\S]*?)<\/tag>/g)]
      .map((one) => textOf(one[1]))
      .filter(Boolean);
    const created = readDate(inner(note, 'created'));

    /*
     * The resources of this note only. A hash is unique to its bytes, so a picture used in two
     * notes would match in both — which is correct — but a note is still only asked about its
     * own, because that is the scope the format gives them.
     */
    const resources = new Map<string, Resource>();

    for (const match of note.matchAll(/<resource>([\s\S]*?)<\/resource>/g)) {
      const data = /<data[^>]*>([\s\S]*?)<\/data>/.exec(match[1])?.[1];

      if (!data) continue;

      try {
        const base64 = data.replace(/\s+/g, '');

        resources.set(md5(fromBase64(base64)), {
          base64,
          mime: (textOf(inner(match[1], 'mime') ?? '') || 'application/octet-stream').toLowerCase(),
          name: textOf(inner(match[1], 'file-name') ?? ''),
        });
      } catch {
        /* Data this file wrote badly: the note is worth more than the attachment. */
      }
    }

    const content = inner(note, 'content') ?? '';

    const enml = content
      /* A checkbox, which the HTML converter already turns into a task list. */
      .replace(/<en-todo\b([^>]*)\/?>/gi, (_, attributes: string) =>
        /checked\s*=\s*"true"/i.test(attributes)
          ? '<input type="checkbox" checked>'
          : '<input type="checkbox">'
      )
      .replace(/<\/en-todo>/gi, '')
      /* Text nobody here has the passphrase for. Saying so beats printing nothing. */
      .replace(
        /<en-crypt\b[\s\S]*?<\/en-crypt>/gi,
        '<p><em>Encrypted text, which needs the passphrase it was written with</em></p>'
      )
      .replace(/<en-media\b([^>]*?)\/?>/gi, (whole, attributes: string) => {
        const hash = /hash\s*=\s*"([0-9a-f]+)"/i.exec(attributes)?.[1]?.toLowerCase();
        const resource = hash ? resources.get(hash) : undefined;

        if (!resource) return '';

        const alt = resource.name.replace(/[<>"]/g, '');

        if (!PICTURE_MIME.test(resource.mime)) {
          /* An attachment that is not a picture has nothing to become; it keeps its name. */
          return alt ? `<p><em>${alt}</em></p>` : '';
        }

        /*
         * The bytes arrived base64 already and are kept that way, so nothing is re-encoded: the
         * file's own text becomes the data URI, and its length is what the budget is charged.
         */
        return `<img src="${held.hold(`data:${resource.mime};base64,${resource.base64}`)}" alt="${alt}">`;
      })
      .replace(/<\/?en-note\b[^>]*>/gi, '');

    const body = asTaskList(
      held.restore(withoutDuplicateTitle(htmlToMarkdown(enml), title))
    ).trim();
    const about = [created, tags.length ? tags.join(', ') : ''].filter(Boolean).join(' · ');

    if (!body && !about) continue;

    pages.push({
      title,
      markdown: [`# ${title}`, about ? `*${about}*` : '', body].filter(Boolean).join('\n\n'),
    });
  }

  if (pages.length === 0) {
    throw new Error('Nothing came out of that .enex — every note in it was empty');
  }

  return buildTocDocument(fallbackTitle, pages);
}
