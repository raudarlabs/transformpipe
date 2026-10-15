/*
 * The folders this browser moved things into last, newest first — what the Move to menu offers
 * before it offers a search. Five, because a person sorting an import into folders goes back and
 * forth between a handful, and more than that is a list to read rather than a click.
 *
 * Kept in localStorage: it is a convenience of this browser, and losing it costs one extra click.
 */

const KEY = 'tp.recentFolders';
const KEEP = 5;

export function recentFolders(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');

    return Array.isArray(value) ? value.filter((one): one is string => typeof one === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberFolder(id: string | null): void {
  if (!id) return;

  try {
    localStorage.setItem(KEY, JSON.stringify([id, ...recentFolders().filter((one) => one !== id)].slice(0, KEEP)));
  } catch {
    // Remembering is a nicety, not a need.
  }
}
