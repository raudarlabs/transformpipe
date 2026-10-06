import { ArrowRight, Check, Github, Link2, X } from 'lucide-react';
import { AppBreadcrumbs } from '@/components/AppBreadcrumbs';
import { ScrollToTop } from '@/components/ScrollToTop';
import { crumbsForStaticPage } from '@/lib/breadcrumbs';
import type { PluginWords } from '@/lib/i18n/content';
import { useI18n } from '@/lib/i18n/context';
import { OBSIDIAN_DIRECTORY, OBSIDIAN_INSTALL, OBSIDIAN_SOURCE } from '@/lib/obsidian-facts';
import type { StaticPage as Page } from '@/lib/pages';
import { cn } from '@/ui/lib/utils';
import {
  Clients,
  Compare,
  CopyField,
  InvitationBand,
  inlineCode,
  Label,
  Questions,
  SectionHead,
  WayButton,
  WaysRow,
} from './AgentsPage';
import { FeatureRow, PhoneStrip, ShowcaseHero } from './showcase';

/*
 * The Obsidian plugin's page, `/agents/obsidian`.
 *
 * The assistants' pages sell a connector, whose one action is an address to copy. This one sells a
 * plugin, whose action is Obsidian's own: a link that opens the app on the plugin, and the
 * directory listing for whoever is reading on a machine without it. The blocks that are the same
 * idea are the same components — the comparison and the questions — so the site says those things
 * one way.
 *
 * Every picture is the real thing: the plugin running in Obsidian and a page drawn by
 * TransformPipe's own renderer, cut into `public/obsidian/`. Which picture goes with which feature
 * is decided here, by position; the words do not know about pictures.
 */

const FEATURE_ART = [
  { src: '/obsidian/updated.webp', width: 1314, height: 864 },
  { src: '/obsidian/looks.webp', width: 1260, height: 1095 },
  { src: '/obsidian/share.webp', width: 1320, height: 780 },
  { src: '/obsidian/export.webp', width: 1440, height: 900 },
];

/*
 * What somebody runs to get each feature — the command, as Obsidian's palette shows it. The
 * assistants' pages put the sentence a person types in the same place; here it is a command, and
 * commands are Obsidian's own words, the same in every language.
 */
const FEATURE_ASK = ['Publish note', 'Open in browser', 'Share with people…', 'Export as PDF'];

const PHONE_ART = ['/obsidian/phone-palette.webp', '/obsidian/phone-published.webp', '/obsidian/phone-page.webp'];

/*
 * The way in, the way the assistants' pages offer theirs: the plugin's page in Obsidian's own
 * directory, as a button and as an address to copy.
 *
 * The button used to be `obsidian://show-plugin`, which works only on a computer that has Obsidian
 * with community plugins already turned on. On a fresh install — Windows included — Restricted mode
 * is on and the link does nothing; on a phone the browser rarely hands it over at all. The
 * directory's page opens everywhere and carries Obsidian's own Install button and the steps. The
 * app link stays, as a line under these, for whoever has Obsidian open right here.
 */
function WaysIn({ words, centred = false }: { words: PluginWords; centred?: boolean }) {
  return (
    <WaysRow
      field={<CopyField text={OBSIDIAN_DIRECTORY} breakAt={'https://community.obsidian.md'.length} copyLabel={words.copy} />}
      button={<WayButton href={OBSIDIAN_DIRECTORY}>{words.add}</WayButton>}
      centred={centred}
    />
  );
}

/** The invitation halfway down and at the end — the assistants' band, with Obsidian's way in. */
function Invitation({
  title,
  text,
  words,
  centred = false,
}: {
  title: string;
  text: string;
  words: PluginWords;
  centred?: boolean;
}) {
  return (
    <InvitationBand title={title} text={text} centred={centred}>
      <WaysIn words={words} centred={centred} />
    </InvitationBand>
  );
}

/* What each step looks like, drawn small in Obsidian's own words, which stay English everywhere. */
function StepPicture({ step }: { step: number }) {
  const frame =
    'flex h-28 w-full flex-col justify-center gap-2 rounded-2xl border border-stroke bg-surface-page p-4';

  if (step === 0) {
    return (
      <div className={frame}>
        <span className="font-mono text-[11px] text-ink-inactive">Community plugins</span>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <span className="flex min-w-0 items-center gap-2.5">
            <img src="/icon-48.png" alt="" width={48} height={48} className="size-6 shrink-0 rounded-md" />
            <span className="truncate font-semibold text-ink-primary text-xs">TransformPipe</span>
          </span>
          <span className="rounded-md bg-brand-primary px-2 py-0.5 font-semibold text-[11px] text-white">Install</span>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className={frame}>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold text-ink-primary text-xs">Account</span>
            <span className="truncate text-[10px] text-ink-inactive">Opens in your browser</span>
          </span>
          <span className="rounded-md bg-brand-primary px-2 py-0.5 font-semibold text-[11px] text-white">Sign in</span>
        </div>
      </div>
    );
  }

  return (
    <div className={frame}>
      <span className="truncate rounded-lg border border-stroke bg-surface-card px-3 py-2 font-mono text-ink-body text-xs">
        <span className="font-semibold text-ink-primary">TransformPipe:</span> Publish note
      </span>
      <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-surface-accent px-2 py-1 font-mono text-[11px] text-brand-tertiary">
        <Link2 className="size-3" />
        Published — the link is copied.
      </span>
    </div>
  );
}

/** The two lists — what leaves the vault and what never does — and the notes under them. */
function Sent({ words }: { words: PluginWords['trust'] }) {
  return (
    <section className="flex flex-col gap-10">
      <SectionHead title={words.heading} />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: words.sent, list: words.can, yes: true },
          { title: words.never, list: words.cannot, yes: false },
        ].map((column) => (
          <div key={column.title} className="flex flex-col gap-4 rounded-3xl border border-stroke bg-surface-card p-6">
            <Label>{column.title}</Label>
            <ul className="flex flex-col">
              {column.list.map((line) => (
                <li
                  key={line}
                  className="flex items-center gap-3 border-stroke border-b py-3 text-ink-body text-sm last:border-b-0"
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full',
                      column.yes ? 'bg-surface-accent text-brand-primary' : 'bg-surface-card2 text-ink-inactive'
                    )}
                  >
                    {column.yes ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {words.notes.map((note) => (
          <div key={note.title} className="flex flex-col gap-1.5 border-brand-primary border-l-2 pl-4">
            <h3 className="font-semibold text-base text-ink-primary">{note.title}</h3>
            <p className="text-ink-secondary text-sm leading-relaxed">{note.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ObsidianPage({ page, onGoToConverter }: { page: Page; onGoToConverter: () => void }) {
  const { content, locale } = useI18n();
  const words = content.pages[page.id];
  const plugin = words.plugin;

  if (!plugin) {
    return null;
  }

  return (
    <article className="flex w-full flex-col gap-20 pb-8 md:gap-24">
      <AppBreadcrumbs items={crumbsForStaticPage(page, content, locale)} onNavigate={onGoToConverter} />

      {/* ------------------------------------------------------------------ the opening */}
      <header className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Label>{plugin.eyebrow}</Label>
            <a
              href={OBSIDIAN_DIRECTORY}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/40 bg-surface-accent px-2.5 py-0.5 font-semibold text-[11px] text-brand-tertiary no-underline hover:border-brand-primary"
            >
              <Check className="size-3" />
              {plugin.listed}
            </a>
          </div>
          <h1 className="font-semibold text-4xl text-ink-primary leading-[1.1] tracking-tight md:text-5xl">
            {words.title}
          </h1>
          <p className="text-ink-secondary text-lg leading-relaxed">{words.lede}</p>
          <WaysIn words={plugin} />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a
              href={OBSIDIAN_INSTALL}
              className="inline-flex items-center gap-1.5 text-brand-tertiary underline-offset-2 hover:underline"
            >
              {plugin.open}
              <ArrowRight className="size-3.5" />
            </a>
            <a
              href={OBSIDIAN_SOURCE}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-brand-tertiary underline-offset-2 hover:underline"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
          </div>
        </div>
        <ShowcaseHero
          back={{ src: '/obsidian/note.webp', width: 1440, height: 900 }}
          front={{ src: '/obsidian/page.webp', width: 1290, height: 1133 }}
          url="transformpipe.com/s/k3v9q2"
          chatFirst
        />
      </header>

      {/* ------------------------------------------------------------------ what it does */}
      <section className="flex flex-col gap-10">
        <SectionHead title={plugin.features.heading} intro={plugin.features.intro} />
        <div className="flex flex-col gap-20">
          {plugin.features.items.map((item, index) => (
            <FeatureRow
              key={item.title}
              ask={FEATURE_ASK[index]}
              title={item.title}
              body={item.body}
              result={item.result}
              art={FEATURE_ART[index % FEATURE_ART.length]}
              flip={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      <PhoneStrip heading={plugin.phone.heading} text={plugin.phone.text} phones={PHONE_ART} />

      <Compare words={plugin.compare} />

      <Invitation title={plugin.middle.title} text={plugin.middle.text} words={plugin} />

      {/* ------------------------------------------------------------------ getting it */}
      <section className="flex flex-col gap-10">
        <SectionHead title={plugin.steps.heading} />
        <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-1 rounded-full md:block"
            style={{
              backgroundImage:
                'linear-gradient(to right, hsl(var(--brand-primary)), hsl(var(--brand-400)), hsl(var(--brand-primary)))',
            }}
          />
          {plugin.steps.items.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-center gap-5">
              <span className="relative z-10 flex size-11 items-center justify-center rounded-full border-4 border-brand-primary bg-surface-page font-mono font-semibold text-ink-primary text-sm">
                {index + 1}
              </span>
              <div className="flex w-full flex-1 flex-col gap-4 rounded-3xl border border-stroke bg-surface-card p-5">
                <StepPicture step={index} />
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-ink-primary text-lg">{step.title}</h3>
                  <p className="text-ink-secondary text-sm leading-relaxed">{inlineCode(step.body)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Sent words={plugin.trust} />

      {/* The same table as the assistants' pages: every way into the one account, this one lit. */}
      {content.pages.agents.landing && (
        <Clients
          words={{ ...plugin.others, items: content.pages.agents.landing.clients.items }}
          current={page.id}
        />
      )}

      <Questions words={plugin.faq} />

      <Invitation title={plugin.bottom.title} text={plugin.bottom.text} words={plugin} centred />

      <ScrollToTop />
    </article>
  );
}
