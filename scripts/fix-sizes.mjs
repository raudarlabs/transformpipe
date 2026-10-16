/* Recounts every document's and revision's `size` from the Markdown it actually holds.
 *
 *   node --env-file=.env.development.local scripts/fix-sizes.mjs           show what would change
 *   node --env-file=.env.development.local scripts/fix-sizes.mjs --write   change it
 *
 * Until 16 October 2026 a document saved from the app kept the size the browser sent, which was the
 * dropped file's — a 50 MB deck that came out as 300 KB of Markdown counted 50 MB against the
 * account, and a spreadsheet that grew counted less than it held. Quotas, the folder download's
 * pieces and every size on a page read this column, so it has to be the Markdown's UTF-8 length.
 *
 * Idempotent: a row whose size is already right is left alone, and one whose source cannot be read
 * is reported and skipped.
 */
import { neon } from '@neondatabase/serverless';
import { get } from '@vercel/blob';
import { config } from 'dotenv';

config({ path: ['.env.local', '.env'], quiet: true });

const write = process.argv.includes('--write');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const blobAuth = process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {};
const sql = neon(process.env.DATABASE_URL);
const encoder = new TextEncoder();

async function bytesOf(row) {
  if (row.markdown != null) return encoder.encode(row.markdown).length;
  if (!row.blob_path) return null;

  const found = await get(row.blob_path, { access: 'private', ...blobAuth }).catch(() => null);

  if (!found || found.statusCode !== 200) return null;

  return (await new Response(found.stream).arrayBuffer()).byteLength;
}

async function pooled(items, width, work) {
  let next = 0;

  await Promise.all(
    Array.from({ length: width }, async () => {
      while (next < items.length) await work(items[next++]);
    })
  );
}

async function recount(table, rows) {
  const wrong = [];
  const unreadable = [];

  await pooled(rows, 12, async (row) => {
    const bytes = await bytesOf(row);

    if (bytes === null) unreadable.push(row);
    else if (bytes !== Number(row.size)) wrong.push({ ...row, bytes });
  });

  const before = wrong.reduce((sum, row) => sum + Number(row.size), 0);
  const after = wrong.reduce((sum, row) => sum + row.bytes, 0);

  console.log(
    `${table}: ${rows.length} rows, ${wrong.length} wrong (${(before / 1048576).toFixed(1)} MB recorded, ${(after / 1048576).toFixed(1)} MB held), ${unreadable.length} unreadable`
  );

  if (write) {
    for (const row of wrong) {
      await sql.query(`update ${table} set size = $1 where id = $2`, [row.bytes, row.id]);
    }
  }

  return { wrong, unreadable };
}

const documents = await sql`select id, user_id, name, size, markdown, blob_path from m2h_document`;
const revisions = await sql`select id, size, markdown, blob_path from m2h_document_revision`;

const result = await recount('m2h_document', documents);

await recount('m2h_document_revision', revisions);

const byUser = new Map();

for (const row of result.wrong) {
  const one = byUser.get(row.user_id) ?? { before: 0, after: 0, count: 0 };

  one.before += Number(row.size);
  one.after += row.bytes;
  one.count += 1;
  byUser.set(row.user_id, one);
}

for (const [user, one] of [...byUser].sort((a, b) => Math.abs(b[1].before - b[1].after) - Math.abs(a[1].before - a[1].after)).slice(0, 10)) {
  console.log(`  ${user}: ${one.count} documents, ${(one.before / 1048576).toFixed(1)} MB → ${(one.after / 1048576).toFixed(1)} MB`);
}

console.log(write ? 'Written.' : '\nRun again with --write to correct them.');
