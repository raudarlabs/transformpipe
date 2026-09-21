import { useCallback, useEffect, useState, type RefObject } from 'react';

/*
 * Reading one element full screen, on a platform that may not have the API for it.
 *
 * `Element.requestFullscreen` does not exist on an iPhone. Safari implements the Fullscreen API on
 * macOS and on iPad, and on iOS it offers `webkitEnterFullscreen` on a `<video>` and nothing else
 * — so on a phone the call is not a rejected promise, it is a missing method, and
 * `frame.current?.requestFullscreen()` throws `TypeError: ... is not a function` before any
 * `.catch()` can run. The button did nothing at all, said nothing at all, and had done so on
 * every iPhone since the day it shipped.
 *
 * So: use the real thing where there is one, and put the element over the page where there is
 * not. The second is worse only in that the browser's own chrome stays; what somebody wants from
 * this button on a phone is the document without the rest of the page around it, and that is what
 * both of these give.
 *
 * The fallback has to carry its own way out. In real fullscreen the browser provides one — the
 * Escape key, a gesture, its own overlay — and the button that entered it is hidden along with
 * the rest of the page. Over the page, nothing provides one, so the caller renders an exit
 * control whenever `overlaid` is true. Escape still works, for a keyboard.
 */

export interface Fullscreen {
  /** Either kind: the caller sizes the frame the same way for both. */
  isFullscreen: boolean;
  /** The frame is over the page rather than genuinely full screen, and needs its own exit. */
  overlaid: boolean;
  toggle: () => void;
}

/** What an element laid over the page needs to be, whatever it was before. */
export const OVERLAY =
  'fixed inset-0 z-50 m-0 max-h-none max-w-none overflow-auto rounded-none border-0';

export function useFullscreen(frame: RefObject<HTMLElement | null>): Fullscreen {
  const [native, setNative] = useState(false);
  const [overlaid, setOverlaid] = useState(false);

  // Escape and the browser's own chrome can leave fullscreen without us, so follow the event.
  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement !== null);

    document.addEventListener('fullscreenchange', sync);

    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  /*
   * The page behind must not scroll under the overlay, and the overlay must not outlive the
   * screen that opened it: leaving this page while it is up would otherwise leave the body
   * locked with nothing on top of it.
   */
  useEffect(() => {
    if (!overlaid) return;

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOverlaid(false);
    };

    const scroll = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', escape);

    return () => {
      document.body.style.overflow = scroll;
      document.removeEventListener('keydown', escape);
    };
  }, [overlaid]);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();

      return;
    }

    if (overlaid) {
      setOverlaid(false);

      return;
    }

    const element = frame.current;

    /*
     * `typeof` rather than a try/catch around the call: the method being absent is the ordinary
     * case on a phone, not an error, and asking first keeps it out of the console.
     */
    if (element && typeof element.requestFullscreen === 'function') {
      void element.requestFullscreen().catch(() => setOverlaid(true));

      return;
    }

    setOverlaid(true);
  }, [frame, overlaid]);

  return { isFullscreen: native || overlaid, overlaid, toggle };
}
