/*
 * MD5, for content addressing and nothing else.
 *
 * Evernote's export format links a picture to its bytes by the MD5 of those bytes: the note says
 * `<en-media hash="9d3f…"/>` and somewhere below is a `<resource>` whose data hashes to that. It
 * is the only link between the two — there is no id, no file name that has to match — so reading
 * the format means computing the hash.
 *
 * MD5 is broken for every purpose it was designed for and this is not one of them: nothing here
 * is authenticated, verified or trusted because of it. It is a name for some bytes, chosen by
 * somebody else's file format in 2008, and the alternative to implementing it is guessing which
 * picture goes where.
 *
 * `crypto.subtle` cannot help: the Web Crypto API deliberately offers SHA and not MD5, in both
 * the browser and Node, for exactly the reason above.
 */

const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
  14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15,
  21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

/** `floor(abs(sin(i + 1)) * 2^32)`, the constants the algorithm is defined with. */
const K = Array.from({ length: 64 }, (_, index) =>
  Math.floor(Math.abs(Math.sin(index + 1)) * 4294967296)
);

const rotate = (value: number, by: number) => (value << by) | (value >>> (32 - by));

export function md5(bytes: Uint8Array): string {
  /* The message, its terminating one bit, zero padding, and its length in bits as 64 bits. */
  const length = bytes.length;
  const padded = new Uint8Array(((length + 8) >> 6) * 64 + 64);

  padded.set(bytes);
  padded[length] = 0x80;

  const bits = length * 8;
  const view = new DataView(padded.buffer);

  view.setUint32(padded.length - 8, bits >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bits / 4294967296), true);

  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

  for (let at = 0; at < padded.length; at += 64) {
    let [a, b, c, d] = [a0, b0, c0, d0];

    for (let i = 0; i < 64; i += 1) {
      let f: number;
      let g: number;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const sum = (a + f + K[i] + view.getUint32(at + g * 4, true)) | 0;

      a = d;
      d = c;
      c = b;
      b = (b + rotate(sum, SHIFTS[i])) | 0;
    }

    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  /* Little-endian, four words, as thirty-two lower-case hexadecimal characters. */
  const out = new DataView(new ArrayBuffer(16));

  out.setUint32(0, a0 >>> 0, true);
  out.setUint32(4, b0 >>> 0, true);
  out.setUint32(8, c0 >>> 0, true);
  out.setUint32(12, d0 >>> 0, true);

  return [...new Uint8Array(out.buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
