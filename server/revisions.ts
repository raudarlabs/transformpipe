import { sql } from './db.js';
import { deleteSources, readSource } from './source.js';

/*
 * The text a document had before an in-place update.
 *
 * An update keeps the document's id, its link and everything decided about the link — which is
 * what a note published from Obsidian needs, and what "fix the typo in the doc I sent" means in a
 * conversation. The cost is that the previous text is gone from the page, so it is kept here
 * first: the newest `REVISIONS_KEPT`, per document. See `m2h_document_revision` in the schema for
 * why ten, and why they count as bytes but not as documents.
 *
 * A POST is untouched by any of this. It still makes a new document every time, which is what
 * the GitHub Action and the CLI's plain `push` rely on: a link in an old pull-request comment
 * keeps showing what that commit said.
 */

export const REVISIONS_KEPT = 10;

export interface RevisionRow {
  id: string;
  document_id: string;
  written_at: string;
  replaced_at: string;
  name: string;
  size: number;
  markdown?: string | null;
  blob_path?: string | null;
}

/**
 * Keeps what a document has now as its newest revision, and returns the revision's id.
 *
 * Nothing is uploaded: the revision takes over the file the document's text is in — or the text
 * itself, for a document kept in its row — and the update writes the new text to a new file. So
 * no file is ever written twice, which is what the store cannot be trusted to read back at once.
 */
export async function keepRevision(document: {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at?: string | null;
  blob_path: string | null;
  markdown: string | null;
}): Promise<string> {
  const [row] = (await sql()`
    insert into m2h_document_revision (document_id, written_at, name, size, blob_path, markdown)
    values (${document.id}, ${document.updated_at ?? document.created_at}, ${document.name},
            ${document.size}, ${document.blob_path}, ${document.markdown})
    returning id
  `) as Array<{ id: string }>;

  return row.id;
}

/** Takes a revision back out without its file, for an update that failed after keeping one. */
export async function forgetRevision(revisionId: string): Promise<void> {
  await sql()`delete from m2h_document_revision where id = ${revisionId}`;
}

/** Everything past the newest `REVISIONS_KEPT`, deleted with its text. Returns how many remain. */
export async function pruneRevisions(documentId: string): Promise<number> {
  const gone = (await sql()`
    delete from m2h_document_revision
    where document_id = ${documentId}
      and id not in (
        select id from m2h_document_revision
        where document_id = ${documentId}
        order by replaced_at desc
        limit ${REVISIONS_KEPT}
      )
    returning blob_path
  `) as Array<{ blob_path: string | null }>;

  await deleteSources(gone.map((row) => row.blob_path));

  const [left] = (await sql()`
    select count(*)::int as n from m2h_document_revision where document_id = ${documentId}
  `) as Array<{ n: number }>;

  return left.n;
}

/** A document's revisions, newest first, without their text. */
export async function listRevisions(documentId: string): Promise<RevisionRow[]> {
  return (await sql()`
    select id, document_id, written_at, replaced_at, name, size
    from m2h_document_revision
    where document_id = ${documentId}
    order by replaced_at desc
  `) as RevisionRow[];
}

/** One revision with its text, or null when it is not one of this document's. */
export async function readRevision(
  documentId: string,
  revisionId: string
): Promise<(RevisionRow & { markdown: string }) | null> {
  const rows = (await sql()`
    select id, document_id, written_at, replaced_at, name, size, markdown, blob_path
    from m2h_document_revision
    where document_id = ${documentId} and id = ${revisionId}
  `) as RevisionRow[];

  if (!rows[0]) {
    return null;
  }

  // No id or owner passed: a revision's text is never moved to the document's own path.
  const markdown = await readSource({ blob_path: rows[0].blob_path, markdown: rows[0].markdown });

  return markdown === null ? null : { ...rows[0], markdown };
}

/**
 * The files behind the revisions of documents that are about to be deleted.
 *
 * Asked before the delete, because the rows go with the document (on delete cascade) and the
 * paths would go with them; the files are then removed with the document's own.
 */
export async function revisionFiles(userId: string, documentId?: string): Promise<(string | null)[]> {
  const rows = (documentId
    ? await sql()`
        select r.blob_path from m2h_document_revision r
        join m2h_document d on d.id = r.document_id
        where d.user_id = ${userId} and d.id = ${documentId}
      `
    : await sql()`
        select r.blob_path from m2h_document_revision r
        join m2h_document d on d.id = r.document_id
        where d.user_id = ${userId}
      `) as Array<{ blob_path: string | null }>;

  return rows.map((row) => row.blob_path);
}
