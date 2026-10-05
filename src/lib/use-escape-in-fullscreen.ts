import { useEffect } from 'react';

/*
 * Escape that closes what is open over a fullscreen page, rather than the fullscreen itself.
 *
 * In fullscreen the browser takes Escape for its own: it leaves fullscreen, and the page never
 * hears the key. Somebody reading a document full screen who opens a table or a diagram over it
 * presses Escape to go back to the document — and lost the document's fullscreen with it.
 *
 * The Keyboard Lock API is the one way a page may have that key while fullscreen, and only while
 * fullscreen it asked for: Escape then reaches the page, and leaving fullscreen takes a press and
 * hold, which the browser itself says on screen. Chromium has it; Safari and Firefox do not, and
 * there the first Escape leaves fullscreen and leaves the viewer open, so a second one closes it —
 * nothing is lost, it just takes one more press.
 *
 * Locked for as long as the caller is mounted, released when it goes, so the document's own
 * Escape works again the moment the viewer has closed.
 */

interface KeyboardLock {
  lock?: (codes?: string[]) => Promise<void>;
  unlock?: () => void;
}

export function useEscapeInFullscreen(): void {
  useEffect(() => {
    const keyboard = (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard;

    if (!document.fullscreenElement || !keyboard?.lock) return;

    /* Refused outside a fullscreen the page requested, or in an insecure context; harmless. */
    void keyboard.lock(['Escape']).catch(() => undefined);

    return () => keyboard.unlock?.();
  }, []);
}
