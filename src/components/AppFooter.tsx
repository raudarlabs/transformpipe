import { CONVERSIONS, type ConversionId } from '@shared/conversions';
import { Logo } from '@/components/Logo';
import { useI18n, useT } from '@/lib/i18n/context';
import { boundArrow } from '@/lib/labels';
import { pagesIn, REPO_URL, STATIC_PAGES, type StaticPageId, X_URL } from '@/lib/pages';
import type { Destination } from '@/lib/route';
import { cn } from '@/ui/lib/utils';
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

export function AppFooter({
  onConversionChange,
  onViewChange,
  onOpenPage,
}: AppFooterProps) {
  const t = useT();
  const { content } = useI18n();

  const page = (id: StaticPageId) => {
    const one = STATIC_PAGES.find((each) => each.id === id)!;

    return {
      label: content.pages[id].label,
      href: one.path,
      onNavigate: () => onOpenPage(id),
    };
  };

  const columns: FooterColumn[] = [
    {
      heading: t('footer.converter'),
      links: CONVERSIONS.map((one) => ({
        label: boundArrow(content.conversions[one.id].label),
        href: one.path,
        onNavigate: () => onConversionChange(one.id),
      })),
      // Fifteen conversions in one list read as a wall; two columns read as a menu.
      twoLists: true,
    },
    {
      heading: t('footer.resources'),
      links: [
        {
          label: t('footer.docs'),
          href: '/docs',
          onNavigate: () => onViewChange('docs'),
        },
        {
          label: t('footer.blog'),
          href: '/blog',
          onNavigate: () => onViewChange('blog'),
        },
        {
          label: t('footer.live'),
          href: '/markdown-live-preview',
          onNavigate: () => onViewChange('livePreview'),
        },
        {
          label: t('footer.changelog'),
          href: '/changelog',
          onNavigate: () => onViewChange('changelog'),
        },
        /*
         * The extension, which was reachable from the changelog and the sitemap and nowhere a
         * person would look. This column is where the other ways in live — the documentation, the
         * blog, the live preview — and it is the way in that has to be installed.
         */
        page('extension'),
        page('agents'),
        /*
         * What this is, next to where to ask about it. `/about` had its own address and no way in
         * from the chrome — the only links to it were the sitemap and a sentence on a blog page.
         */
        page('about'),
        page('support'),
      ],
    },
    {
      heading: t('footer.legal'),
      links: [page('privacy'), page('terms'), page('cookies')],
    },
  ];

  return (
    <SiteFooter
      brand={<Logo />}
      tagline={t('footer.tagline')}
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
