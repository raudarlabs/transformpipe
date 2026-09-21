/**
 * A conversion's name, with its arrow bound to the word it points at.
 *
 * Fifteen labels in five languages do not all fit one line at every window width, and the layout
 * that pretended they did is what put `OpenDocument →` on one line and `Markdown` on the next.
 * Wrapping is fine. Wrapping *after* the arrow is not: the arrow is left pointing at the end of
 * a line. A non-breaking space after it moves the break in front of it, where a reader would put
 * it — `OpenDocument` and then `→ Markdown`.
 *
 * Applied at render time rather than written into the catalogue, so the strings stay ordinary
 * text that a translator can read and a search can match.
 */
export function boundArrow(label: string): string {
  return label.replace(/(→|->)\s+/g, '$1 ');
}
