/*
 * Pictures from an export, made the size a page needs before they are carried inside it.
 *
 * A Confluence space's screenshots are often 1.5 to 2 MB each — a full-resolution PNG of a whole
 * screen — and a page has room for a few megabytes of pictures, so whole sections arrived with
 * their screenshots replaced by their names. Nobody reads a document at 3,000 pixels wide: anything
 * larger than `LONGEST` on its long side is drawn down to it, and anything still heavy is re-encoded
 * — as PNG where it has transparency, which a JPEG would fill with black, and as JPEG where it
 * does not. A picture is only replaced when the new one is smaller.
 *
 * Runs in the conversion worker, with `OffscreenCanvas`; where that is missing the pictures stay
 * as they were and the page's allowance decides, as it always did.
 */

const LONGEST = 1600;
/** Below this a picture is left alone: the saving is not worth the quality. */
const LIGHT = 120 * 1024;
const RASTER = /\.(png|jpe?g|webp|bmp)$/i;

async function hasTransparency(bitmap: ImageBitmap): Promise<boolean> {
  // A small copy is enough to see whether any of it is see-through.
  const canvas = new OffscreenCanvas(Math.min(64, bitmap.width), Math.min(64, bitmap.height));
  const context = canvas.getContext('2d');

  if (!context) return false;

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let at = 3; at < data.length; at += 4) {
    if (data[at] < 250) return true;
  }

  return false;
}

async function shrinkOne(bytes: Uint8Array): Promise<Uint8Array | null> {
  const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)]));
  const scale = Math.min(1, LONGEST / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');

  if (!context) return null;

  const transparent = await hasTransparency(bitmap);

  if (!transparent) {
    // A JPEG has no transparency; white is what a page shows behind a picture anyway.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob(
    transparent ? { type: 'image/png' } : { type: 'image/jpeg', quality: 0.85 }
  );

  return new Uint8Array(await blob.arrayBuffer());
}

export async function shrinkPictures(
  pictures: Map<string, Uint8Array>,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') return;

  const heavy = [...pictures].filter(([path, bytes]) => RASTER.test(path) && bytes.length > LIGHT);

  for (const [index, [path, bytes]] of heavy.entries()) {
    onProgress?.(index + 1, heavy.length);

    try {
      const smaller = await shrinkOne(bytes);

      if (smaller && smaller.length < bytes.length) pictures.set(path, smaller);
    } catch {
      // A picture the browser cannot decode stays as it was.
    }
  }
}
