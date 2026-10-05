import { Check, Link2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/ui/lib/utils';

/*
 * The pieces a product page is built from when it shows the product rather than a drawing of it:
 * a screenshot in a frame, the opening picture — the tool, and over it the page its link opens —
 * and a feature as words on one side and its screenshot on the other.
 *
 * `/agents/obsidian` was the first page built this way and the assistants' pages followed it, so the
 * pieces live here rather than in either page. Every picture they are given is a real one: the
 * tool running, and a page drawn by TransformPipe's own renderer.
 */

export interface Art {
  src: string;
  width: number;
  height: number;
}

/** A picture of the product, framed the way the site frames its cards. */
export function Shot({ art, className, eager = false }: { art: Art; className?: string; eager?: boolean }) {
  return (
    <img
      src={art.src}
      alt=""
      width={art.width}
      height={art.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn(
        'block h-auto w-full rounded-2xl border border-stroke bg-surface-card shadow-2xl',
        className
      )}
    />
  );
}

/*
 * The picture a page opens on: the tool, just after it did the thing — and, over it, in a browser
 * frame, the page its link opens.
 */
export function ShowcaseHero({
  back,
  front,
  url,
  chatFirst = false,
}: {
  back: Art;
  front: Art;
  url: string;
  /*
   * The tool in front and the page behind it. An assistant's picture is a card in a chat, and a
   * card is read across its whole width — the state on the right, the buttons along the bottom — so
   * the page that would sit over half of it goes behind instead, its head showing above the chat.
   */
  chatFirst?: boolean;
}) {
  const page = (
    <div className="overflow-hidden rounded-2xl border border-stroke bg-surface-card shadow-2xl">
      <div className="flex items-center gap-1.5 border-stroke border-b bg-surface-page px-3 py-2">
        <span className="size-2 rounded-full bg-ink-inactive/50" />
        <span className="size-2 rounded-full bg-ink-inactive/50" />
        <span className="size-2 rounded-full bg-ink-inactive/50" />
        <span className="ml-2 inline-flex min-w-0 items-center gap-1.5 truncate rounded-md bg-surface-card2 px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
          <Link2 className="size-3 shrink-0 text-brand-tertiary" />
          {url}
        </span>
      </div>
      <img src={front.src} alt="" width={front.width} height={front.height} decoding="async" className="block h-auto w-full" />
    </div>
  );

  if (chatFirst) {
    return (
      <div aria-hidden="true" className="relative pt-[30%]">
        <div className="absolute top-0 right-0 w-[62%]">{page}</div>
        <Shot art={back} className="relative w-[86%]" eager />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="relative pb-16 sm:pb-24">
      <Shot art={back} className="w-[88%]" eager />
      <div className="absolute right-0 bottom-0 w-[62%]">{page}</div>
    </div>
  );
}

/*
 * One feature: the words on one side, its picture on the other, alternating down the page. `ask`
 * is the sentence somebody types to get it, where there is one — an assistant's page has them, a
 * plugin's has commands instead.
 */
export function FeatureRow({
  title,
  body,
  result,
  ask,
  art,
  flip,
}: {
  title: string;
  body: ReactNode;
  result: string;
  ask?: string;
  art: Art;
  flip: boolean;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className={cn('flex flex-col gap-4', flip && 'lg:order-last')}>
        {ask && (
          <span className="flex items-center gap-2 self-start rounded-xl border border-stroke bg-surface-page px-4 py-2 font-mono text-ink-body text-sm">
            <span className="text-brand-tertiary">›</span>
            {ask}
          </span>
        )}
        <h3 className="font-semibold text-2xl text-ink-primary tracking-tight md:text-3xl">{title}</h3>
        <p className="text-base text-ink-secondary leading-relaxed [text-wrap:pretty]">{body}</p>
        <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-surface-accent px-2.5 py-1 font-mono text-brand-tertiary text-xs">
          <Check className="size-3.5" />
          {result}
        </span>
      </div>
      <Shot art={art} />
    </div>
  );
}

/*
 * Phones, three abreast, cut off at the bottom edge of the band like phones stood in a tray: the
 * middle one a little higher. Each screenshot is the top of a real phone screen.
 */
export function PhoneStrip({ heading, text, phones }: { heading: string; text: string; phones: string[] }) {
  return (
    <section className="dot-grid flex flex-col items-center gap-10 overflow-hidden rounded-3xl border border-stroke bg-surface-card px-4 pt-12 sm:px-8">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        <h2 className="font-semibold text-2xl text-ink-primary tracking-tight md:text-3xl">{heading}</h2>
        <p className="text-base text-ink-secondary">{text}</p>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'grid w-full items-end gap-3 sm:gap-6',
          phones.length === 2 ? 'max-w-xl grid-cols-2' : 'max-w-3xl grid-cols-3'
        )}
      >
        {phones.map((src, index) => (
          <div
            key={src}
            className={cn(
              'rounded-t-[2rem] border border-stroke border-b-0 bg-black p-1.5 pb-0 shadow-2xl sm:rounded-t-[2.5rem] sm:p-2.5 sm:pb-0',
              index === 1 && phones.length === 3 ? 'translate-y-0' : phones.length === 3 ? 'translate-y-6' : index === 1 ? 'translate-y-6' : 'translate-y-0'
            )}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="block h-auto w-full rounded-t-[1.6rem] sm:rounded-t-[2rem]"
              style={{ aspectRatio: '585 / 1000', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
