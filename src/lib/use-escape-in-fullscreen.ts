import { useEffect } from 'react';

/*
 * Escape, while a document is read full screen.
 *
 * In fullscreen the browser takes Escape for its own: it leaves fullscreen and the page never
 * hears the key. Somebody who opens a table or a diagram over a fullscreen document presses
 * Escape to go back to the document — and lost the document's fullscreen with it.
 *
 * The Keyboard Lock API is the one way a page may have that key while fullscreen. It is taken as
 * the document goes full screen, not later when a viewer opens: requested afterwards, Chrome
 * accepted the lock and went on leaving fullscreen on Escape all the same. With it held, Escape
 * reaches the page, and this module decides what it means — close the viewer on top if there is
 * one, otherwise leave fullscreen, which is what the key did before. Holding Escape still leaves
 * fullscreen whatever is open; the browser says so on screen.
 *
 * Chromium has the API; Safari and Firefox do not, and there the browser keeps the key: the first
 * Escape leaves fullscreen and leaves the viewer open, so a second one closes it.
 */

interface KeyboardLock {
  lock?: (codes?: string[]) => Promise<void>;
  unlock?: () => void;
}

const keyboard = () =>
  typeof navigator === 'undefined'
    ? undefined
    : (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard;

/** Viewers open over the page right now. Escape belongs to the top one while there is any. */
let overlays = 0;

/** Whether Escape is free to mean the document's own fullscreen, with no viewer open on top. */
export const escapeIsFree = () => overlays === 0;

/** Takes Escape for the page; called in the same gesture that requests fullscreen. */
export function holdEscape(): void {
  void keyboard()
    ?.lock?.(['Escape'])
    .catch(() => undefined);
}

/** Gives Escape back to the browser, when fullscreen ends. */
export function releaseEscape(): void {
  keyboard()?.unlock?.();
}

/**
 * Escape while fullscreen and no viewer is open: leave fullscreen, as the key did before the lock.
 * Registered once, by the fullscreen hook, while its element is full screen.
 */
export function escapeLeavesFullscreen(event: KeyboardEvent): void {
  if (event.key === 'Escape' && escapeIsFree() && document.fullscreenElement) {
    void document.exitFullscreen().catch(() => undefined);
  }
}

/** A viewer marks itself open for as long as it is mounted, so Escape closes it and nothing else. */
export function useEscapeInFullscreen(): void {
  useEffect(() => {
    overlays += 1;

    return () => {
      /* After the keydown that closed it has been seen by everybody, so it cannot also count as a
       * press with nothing open. */
      setTimeout(() => {
        overlays = Math.max(0, overlays - 1);
      }, 0);
    };
  }, []);
}
