/*
 * How big one document may be — two numbers, because two different things impose them.
 *
 * They used to be one number in two places, which is how a 2 MB file came to convert perfectly,
 * appear on screen, and then fail to save: the dropzone said 10 MB and the account said 1 MB. The
 * fix is not a single number — it is naming each ceiling and saying which is which, so the app can
 * tell somebody what will happen before they wait for it.
 */

/**
 * What the converter accepts.
 *
 * Converting happens in the browser, so this is a judgement about the machine in front of the
 * person rather than a platform limit. 10 MB of Markdown is around 1.5 million words.
 */
export const DOCUMENT_BYTES = 10 * 1024 * 1024;

/**
 * What can be kept in an account, and it is not our choice.
 *
 * A Vercel Function refuses a request or a response body over 4.5 MB with a bare 413 that our code
 * never sees — so a document larger than this could neither be saved nor read back, and the person
 * would get the platform's error page instead of a sentence from us. 4 MB leaves room for the name
 * and the JSON around the Markdown.
 *
 * Raising it means keeping the Markdown out of the request entirely: the browser uploading to blob
 * storage directly and reads redirecting to a signed URL. That is a real change to how documents
 * move, not a bigger number, so until it is made this is the honest ceiling.
 */
export const KEEP_BYTES = 4 * 1024 * 1024;

/**
 * What all the pictures in one document may weigh once embedded.
 *
 * It follows from `KEEP_BYTES` rather than being chosen: a picture is carried as a `data:` URI —
 * see `pictures.ts` for why it is carried and not uploaded — which is text, and it lands in the
 * same 4 MB a document has to fit inside to be saved at all. Half of that leaves the other half
 * for the words, which is a million of them; a document whose pictures spend more than its prose
 * is an album, and an album that cannot be saved is worse than one with two photographs missing.
 *
 * Measured against the encoded length, not the file on disk, because the encoded length is what
 * actually has to fit.
 */
export const PICTURES_BYTES = 2 * 1024 * 1024;

/**
 * What one picture may weigh, so that the first one cannot spend everything.
 *
 * Without it a single photograph straight off a phone takes the whole allowance and the twelve
 * screenshots after it — the ones that were carrying the argument — are all left behind. A
 * megabyte encoded is about 750 KB on disk, which is a generous screenshot and a small photo.
 */
export const PICTURE_BYTES = 1024 * 1024;
