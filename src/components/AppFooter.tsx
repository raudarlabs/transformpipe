import type { MouseEvent } from 'react';
import { CONVERSIONS, type ConversionId } from '@shared/conversions';
import { Logo } from '@/components/Logo';
import { blogPath } from '@/lib/blog';
import { useI18n, useT } from '@/lib/i18n/context';
import { localePath } from '@/lib/i18n/locales';
import { STATIC_PAGES, type StaticPageId, X_URL } from '@/lib/pages';
import type { Destination } from '@/lib/route';
import { cn } from '@/ui/lib/utils';
import { buttonVariants } from '@/ui/components/Button';
import { X_MARK_PATH } from '@/ui/components/ShareLinks';
import {
  SiteFooter,
  type FooterColumn,
} from '@/ui/components/SiteFooter';

interface AppFooterProps {
  onConversionChange: (id: ConversionId) => void;
  onViewChange: (view: Destination) => void;
  onOpenPage: (id: StaticPageId) => void;
}

/**
 * This app's footer: the design system's component, filled in from the app's own lists.
 *
 * Nothing here is typed out twice. Which conversions and which pages exist comes from
 * `shared/conversions.ts` and `src/lib/pages.ts`, and what each of them is called comes from the
 * catalogue under the same id — so a fifth conversion or a new legal page appears down here
 * without anybody remembering to add it, in whichever language the reader is in. That is the
 * failure this replaced: a footer that promised a self-contained HTML export and one line about
 * the browser, and nothing else.
 */
/** Whoever built this, and where they are. */
const MAKER = 'Raudar Labs';
const MAKER_URL = 'https://raudar.dev/';

/**
 * The name in "Built by Raudar Labs", made a link without a second string to translate.
 *
 * The sentence is translated five ways and the name is the same word in all five, so the line is
 * split on it rather than stored as three pieces per language — one of which every future
 * translation would have to get exactly right for the link to land anywhere.
 */
function linkToMaker(sentence: string) {
  const [before, ...rest] = sentence.split(MAKER);

  if (rest.length === 0) {
    return sentence;
  }

  return (
    <>
      {before}
      <a
        href={MAKER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition-colors hover:text-brand-tertiary"
      >
        {MAKER}
      </a>
      {rest.join(MAKER)}
    </>
  );
}

/**
 * The two halves of a conversion's label, "Markdown → Word", so a column headed "From Markdown" can
 * say "Word". Every label in every language has the one arrow; one that ever lacks it is shown
 * whole rather than cut.
 */
function sides(label: string): [string, string] {
  const [from, to] = label.split(' → ');

  return to === undefined ? [label, label] : [from, to];
}

/** A plain left click, which the app handles itself; anything else is the browser's. */
function inApp(event: MouseEvent<HTMLAnchorElement>, go: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  event.preventDefault();
  go();
}

export function AppFooter({
  onConversionChange,
  onViewChange,
  onOpenPage,
}: AppFooterProps) {
  const t = useT();
  const { content, locale } = useI18n();

  /*
   * Every address in the reader's language. The footer used to hand out the English path whatever
   * page it sat on, so a German reader's every footer link — about 38 of them — led out of German,
   * and the app's own copy of the page disagreed with the prerendered one beneath it.
   */
  const at = (path: string) => localePath(locale, path);

  const page = (id: StaticPageId) => {
    const one = STATIC_PAGES.find((each) => each.id === id)!;

    return {
      label: content.pages[id].label,
      href: at(one.path),
      onNavigate: () => onOpenPage(id),
    };
  };

  const conversion = (one: (typeof CONVERSIONS)[number], side: 0 | 1) => {
    const label = content.conversions[one.id].label;

    return {
      label: sides(label)[side],
      fullLabel: label,
      href: at(one.path),
      onNavigate: () => onConversionChange(one.id),
    };
  };

  const fromMarkdown = CONVERSIONS.filter((one) => one.id.startsWith('markdown-to-'));
  const toMarkdown = CONVERSIONS.filter((one) => !one.id.startsWith('markdown-to-'));

  const columns: FooterColumn[] = [
    {
      heading: t('footer.fromMarkdown'),
      links: fromMarkdown.map((one) => conversion(one, 1)),
    },
    {
      heading: t('footer.toMarkdown'),
      links: toMarkdown.map((one) => conversion(one, 0)),
      // Fourteen names in one list read as a wall; two columns read as a menu.
      twoLists: true,
    },
    {
      heading: t('footer.product'),
      collapseUntilWide: true,
      links: [
        {
          label: t('footer.live'),
          href: at('/markdown-live-preview'),
          onNavigate: () => onViewChange('livePreview'),
        },
        {
          label: t('footer.docs'),
          href: at('/docs'),
          onNavigate: () => onViewChange('docs'),
        },
        /*
         * Not the assistants page or the extension: the band above links both as its two buttons,
         * and listing them again made this column two lines longer than every other one.
         */
        page('obsidian'),
        page('share-markdown'),
        page('api'),
        page('cli'),
        page('github-action'),
      ],
    },
    {
      heading: t('footer.company'),
      collapseUntilWide: true,
      links: [
        page('about'),
        {
          label: t('footer.blog'),
          href: blogPath(locale),
          onNavigate: () => onViewChange('blog'),
        },
        {
          label: t('footer.changelog'),
          href: at('/changelog'),
          onNavigate: () => onViewChange('changelog'),
        },
        page('support'),
        page('privacy'),
        page('terms'),
        page('cookies'),
      ],
    },
  ];

  const agents = page('agents');
  const extension = page('extension');

  return (
    <SiteFooter
      brand={<Logo />}
      tagline={t('footer.tagline')}
      cta={
        /*
         * The two ways in that have to be set up rather than visited — an assistant connected, the
         * extension installed — and so the two a reader who has scrolled this far is likeliest to
         * have missed. One filled button, one outlined: two of the same would ask which matters.
         */
        <section
          aria-label={t('footer.cta.title')}
          className="flex flex-col gap-4 rounded-xl border border-stroke bg-surface-card p-5 md:flex-row md:items-center md:justify-between md:px-6"
        >
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-base text-ink-primary">{t('footer.cta.title')}</p>
            <p className="text-ink-secondary text-sm">{t('footer.cta.body')}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:shrink-0">
            <a
              href={agents.href}
              onClick={(event) => inApp(event, agents.onNavigate)}
              className={buttonVariants({ variant: 'primary', size: 'md', className: 'px-4 no-underline' })}
            >
              {t('footer.cta.connect')}
            </a>
            <a
              href={extension.href}
              onClick={(event) => inApp(event, extension.onNavigate)}
              className={buttonVariants({ variant: 'outline', size: 'md', className: 'px-4 no-underline' })}
            >
              {t('footer.cta.extension')}
            </a>
          </div>
        </section>
      }
      follow={
        /*
         * The account, as its mark — the same one and the same round shape as the share links
         * beside an article, so X looks like one decision wherever it appears. The name is for a
         * screen reader and for the tooltip, since a mark alone says nothing to either.
         */
        <a
          href={X_URL}
          target="_blank"
          rel="me noopener noreferrer"
          aria-label={`${t('footer.x')}${t('footer.external')}`}
          title={t('footer.x')}
          className={cn(
            'flex size-9 items-center justify-center rounded-full border border-stroke text-ink-secondary',
            'transition-colors hover:border-stroke-hover hover:bg-state-hover hover:text-ink-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page'
          )}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className="size-4">
            <path d={X_MARK_PATH} />
          </svg>
        </a>
      }
      columns={columns}
      /* The year is a number, not a word: it goes in as a value the sentence has a hole for. */
      note={linkToMaker(t('footer.note', { year: new Date().getFullYear() }))}
      externalLabel={t('footer.external')}
    />
  );
}
