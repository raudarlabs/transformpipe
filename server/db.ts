import { neon } from '@neondatabase/serverless';

let cached: ReturnType<typeof neon> | null = null;

/** Neon HTTP client — one per process, created lazily. */
export function sql() {
  if (!cached) {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }

    cached = neon(url);
  }

  return cached;
}

export interface DocumentRow {
  id: string;
  name: string;
  /** Which conversion produced it, from shared/conversions. */
  kind: string;
  size: number;
  stats: Record<string, number>;
  created_at: string;
  markdown?: string;
  summary?: string | null;
  summary_created_at?: string | null;
  replaces?: string | null;
  /** The folder it is filed in, and its place among that folder's pages. */
  folder_id?: string | null;
  position?: number | null;
}

/**
 * Whether a string is shaped like one of our document ids.
 *
 * Here rather than in one of the two routers because both need it: a value that is not a uuid
 * reaches a uuid column as a driver error, and the request that was wrong gets answered 500. The
 * API asked this question and the app's own endpoints did not, which is how the same bad id got
 * two different answers.
 */
export const looksLikeId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * What a document is searched by: its words, not its pictures.
 *
 * A picture carried inside a document is a `data:` address of base64, and Postgres made a search
 * vector out of it as if it were prose — one page of an imported Confluence space with a few
 * screenshots came to 1.5 MB of vector against a limit of 1 MB, and the save failed with a 500.
 * The pictures go, and so does anything past the first 400,000 characters of text, which is far
 * more than anybody searches by and well inside the limit.
 */
export const searchText = (markdown: string) =>
  markdown.replace(/data:[a-z0-9.+/-]+;base64,[A-Za-z0-9+/=\s]*/gi, '').slice(0, 400_000);
