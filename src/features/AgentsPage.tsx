import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckSquare,
  Copy,
  ExternalLink,
  Link2,
  Square,
  Terminal,
  Users,
  X,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { AppBreadcrumbs } from '@/components/AppBreadcrumbs';
import { ScrollToTop } from '@/components/ScrollToTop';
import { crumbsForStaticPage } from '@/lib/breadcrumbs';
import type { LandingWords } from '@/lib/i18n/content';
import { useI18n, useT } from '@/lib/i18n/context';
import { localePath } from '@/lib/i18n/locales';
import { MCP_PATH } from '@/lib/mcp-facts';
import { staticPage, type StaticPage as Page } from '@/lib/pages';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/Accordion';
import { Faq } from '@/ui/components/Faq';
import { SectionHeading } from '@/ui/components/SectionHeading';
import { toast } from '@/ui/components/Toast';

/*
 * The pages for assistants: `/agents`, and one per assistant under it.
 *
 * Built on the product's own idea rather than on a landing-page kit: a document goes in as the
 * Markdown an assistant writes and comes out as a page in an account, and the page is drawn that
 * way — the source above, the finished document below, a pipe between them. The words are the
 * catalogue's `landing` object; the prerenderer prints the same object as prose.
 *
 * The one action is copying the connector's address, offered at the top, halfway down and at the
 * end. Nothing here signs anybody in: adding the connector in the assistant is what starts the
 * sign-in, so asking for it on this page first would be a second door in front of the first one.
 */

/** Where Claude's connector settings are, for the link beside the address. */
const CLAUDE_CONNECTORS = 'https://claude.ai/settings/connectors';

/*
 * The pictures, by position — a picture is not language. Drawn by `scripts/agents-art.mjs` and
 * committed. The use cases take the first four; the assistants' table takes one per row, in the
 * order the catalogue lists them, Claude first.
 */
const USE_CASE_ART = [
  '/agents/keep.webp',
  '/agents/share.webp',
  '/agents/find.webp',
  '/agents/versions.webp',
];
const CLIENT_ART = [
  '/agents/client-claude.webp',
  '/agents/client-chatgpt.webp',
  '/agents/client-cursor.webp',
  '/agents/client-gemini.webp',
  '/agents/client-vscode.webp',
  '/agents/client-windsurf.webp',
];

/** Which row of the assistants' table has a page, and so works today. */
const CLIENT_PAGES: Record<number, 'agents-claude'> = { 0: 'agents-claude' };

/** `like this` in the catalogue, as a code span — the one markup the static pages allow. */
function inlineCode(text: string): ReactNode[] {
  return text.split('`').map((piece, index) =>
    index % 2 === 1 ? (
      <code
        key={`${index}-${piece}`}
        className="break-all rounded bg-surface-card2 px-1 py-0.5 font-mono text-[0.9em] text-ink-body"
      >
        {piece}
      </code>
    ) : (
      piece
    )
  );
}

/** The sentence without its quotation marks, for where it is shown as something typed. */
const unquote = (text: string) => text.replace(/[“”"«»„]/g, '').trim();

function useCopy(text: string) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.info(t('agents.copied'));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* A browser that refuses the clipboard still shows the text, selectable, beside the button. */
    }
  };

  return { copied, copy };
}

/** The address and the button that copies it. */
function CopyAddress({ label }: { label: string }) {
  const url = `${window.location.origin}${MCP_PATH}`;
  const { copied, copy } = useCopy(url);

  return (
    <div className="flex w-full max-w-lg flex-col gap-2 rounded-xl border border-stroke bg-surface-card p-1.5 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 select-all truncate px-2.5 py-2 font-mono text-ink-body text-sm">
        {url}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-brand-secondary"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {label}
      </button>
    </div>
  );
}

/** The small label over a heading: a bar of the brand colour and the words in mono. */
function Label({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-ink-inactive text-xs uppercase tracking-wider">
      <span className="h-3.5 w-0.5 rounded-full bg-brand-primary" />
      {children}
    </span>
  );
}

function SectionHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h2 className="font-semibold text-2xl text-ink-primary tracking-tight md:text-3xl">
        {title}
      </h2>
      {intro && <p className="text-base text-ink-secondary leading-relaxed">{intro}</p>}
    </div>
  );
}

/*
 * The picture the page opens on: the document as the chat has it, the pipe, and the document as
 * the account has it. Both halves are drawn from the same words, so they cannot disagree, and
 * the Markdown is spelled out — the asterisks are the point of the top half.
 */
function PipeDemo({ demo }: { demo: LandingWords['demo'] }) {
  const [prose, done, todo] = demo.lines;

  return (
    <div aria-hidden="true" className="relative flex flex-col items-stretch">
      <div className="mr-8 flex flex-col gap-3 rounded-2xl border border-stroke bg-surface-card2 p-5 md:mr-16">
        <Label>{demo.from}</Label>
        <pre className="overflow-hidden whitespace-pre-wrap font-mono text-ink-body text-sm leading-relaxed">
          <span className="text-brand-tertiary"># </span>
          {demo.title}
          {'\n\n'}
          <span className="text-brand-tertiary">&gt; </span>
          {prose}
          {'\n\n'}
          <span className="text-brand-tertiary">- [x] </span>
          {done}
          {'\n'}
          <span className="text-brand-tertiary">- [ ] </span>
          {todo}
        </pre>
      </div>

      {/* The pipe: a line of the brand colour, and the one joint where the document changes. */}
      <div className="relative flex h-16 items-center justify-center">
        <span
          className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, hsl(var(--stroke-border)), hsl(var(--brand-primary)), hsl(var(--stroke-border)))',
          }}
        />
        <span className="pipe-drop absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_12px_hsl(var(--brand-400))]" />
        <span className="relative flex size-9 items-center justify-center rounded-full border-2 border-brand-primary bg-surface-page text-brand-primary shadow-lg">
          <ArrowDown className="size-4" />
        </span>
      </div>

      <div className="ml-8 flex flex-col gap-4 rounded-2xl border border-stroke bg-surface-card p-5 shadow-2xl md:ml-16">
        <div className="flex items-center justify-between gap-3">
          <Label>{demo.to}</Label>
          <span className="rounded-md bg-surface-card2 px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
            {demo.meta}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-ink-primary text-xl tracking-tight">{demo.title}</span>
          <span className="border-brand-primary border-l-2 pl-3 text-ink-secondary text-sm">
            {prose}
          </span>
          <span className="flex items-center gap-2 text-ink-body text-sm">
            <CheckSquare className="size-4 text-brand-primary" />
            <span className="text-ink-inactive line-through">{done}</span>
          </span>
          <span className="flex items-center gap-2 text-ink-body text-sm">
            <Square className="size-4 text-ink-inactive" />
            {todo}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-stroke border-t pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-accent px-2 py-1 font-mono text-brand-tertiary text-xs">
            <Link2 className="size-3.5" />
            transformpipe.com/s/k3v9q…
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-card2 px-2 py-1 text-ink-secondary text-xs">
            <Users className="size-3.5" />
            {demo.shared}
          </span>
        </div>
      </div>
    </div>
  );
}

/** One use case: what somebody types, what it is for, and what it leaves behind. */
function UseCase({
  item,
  art,
}: {
  item: LandingWords['useCases']['items'][number];
  art: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-stroke bg-surface-card">
      <div className="flex items-center gap-2 border-stroke border-b bg-surface-page px-5 py-3 font-mono text-sm">
        <span className="text-brand-tertiary">›</span>
        <span className="truncate text-ink-body">{unquote(item.ask)}</span>
      </div>
      <div className="relative flex flex-1 flex-col gap-3 p-6 pr-28">
        <img
          src={art}
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute top-4 right-4 size-24 object-contain drop-shadow-lg"
        />
        <h3 className="font-semibold text-ink-primary text-xl tracking-tight">{item.title}</h3>
        <p className="text-ink-secondary text-sm leading-relaxed">{item.body}</p>
      </div>
      <div className="px-6 pb-6">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-accent px-2.5 py-1 font-mono text-brand-tertiary text-xs">
          <Check className="size-3.5" />
          {item.result}
        </span>
      </div>
    </div>
  );
}

/** The invitation halfway down and at the end: the address itself, on the worksheet texture. */
function AddressBlock({
  title,
  text,
  action,
  centred = false,
}: {
  title: string;
  text: string;
  action: string;
  centred?: boolean;
}) {
  return (
    <section
      className={`dot-grid flex flex-col gap-6 rounded-3xl border border-stroke bg-surface-card px-6 py-10 md:px-12 md:py-14 ${
        centred ? 'items-center text-center' : 'lg:flex-row lg:items-center lg:justify-between'
      }`}
    >
      <div className={`flex max-w-xl flex-col gap-2 ${centred ? 'items-center' : ''}`}>
        <span className="font-semibold text-2xl text-ink-primary tracking-tight md:text-3xl">
          {title}
        </span>
        <span className="text-base text-ink-secondary">{text}</span>
      </div>
      <CopyAddress label={action} />
    </section>
  );
}

/*
 * What each of the three steps looks like, drawn small: the address, the screen it goes into, and
 * what comes back. The labels inside are Claude's own interface and an address, which stay as
 * they are in every language.
 */
function StepPicture({ step, ask }: { step: number; ask: string }) {
  const frame =
    'flex h-28 w-full flex-col justify-center gap-2 rounded-2xl border border-stroke bg-surface-page p-4';

  if (step === 0) {
    return (
      <div className={frame}>
        <div className="flex items-center gap-2 rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <Link2 className="size-3.5 shrink-0 text-brand-tertiary" />
          <span className="truncate font-mono text-ink-body text-xs">transformpipe.com/api/mcp</span>
          <span className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-primary text-white">
            <Copy className="size-3" />
          </span>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className={frame}>
        <span className="font-mono text-[11px] text-ink-inactive">Settings › Connectors</span>
        <div className="flex items-center justify-between rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <span className="font-mono text-ink-primary text-xs">TransformPipe</span>
          <span className="rounded-md bg-brand-primary px-2 py-0.5 font-semibold text-[11px] text-white">
            Connect
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={frame}>
      <span className="truncate font-mono text-ink-body text-xs">
        <span className="text-brand-tertiary">› </span>
        {unquote(ask)}
      </span>
      <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-surface-accent px-2 py-1 font-mono text-[11px] text-brand-tertiary">
        <Link2 className="size-3" />
        transformpipe.com/s/k3v9q…
      </span>
    </div>
  );
}

function CommandBlock({ words }: { words: NonNullable<LandingWords['command']> }) {
  const { copied, copy } = useCopy(words.code);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-stroke bg-surface-card p-6 md:flex-row md:items-center md:gap-8 md:p-8">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-accent text-brand-primary">
        <Terminal className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-ink-primary text-lg">{words.heading}</h3>
          <p className="text-ink-secondary text-sm">{words.body}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-3">
          <span className="select-none font-mono text-brand-300 text-sm">$</span>
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-white">
            {words.code}
          </code>
          <button
            type="button"
            onClick={() => void copy()}
            aria-label={words.heading}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The two lists — what the connector may do and may not — and the notes under them. */
function Reach({ words }: { words: LandingWords['trust'] }) {
  const t = useT();

  return (
    <section className="flex flex-col gap-10">
      <SectionHead title={words.heading} />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: t('agents.can'), list: words.can, yes: true },
          { title: t('agents.cannot'), list: words.cannot, yes: false },
        ].map((column) => (
          <div
            key={column.title}
            className="flex flex-col gap-4 rounded-3xl border border-stroke bg-surface-card p-6"
          >
            <Label>{column.title}</Label>
            <ul className="flex flex-col">
              {column.list.map((line) => (
                <li
                  key={line}
                  className="flex items-center gap-3 border-stroke border-b py-3 text-ink-body text-sm last:border-b-0"
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                      column.yes
                        ? 'bg-surface-accent text-brand-primary'
                        : 'bg-surface-card2 text-ink-inactive'
                    }`}
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
      <div className={`grid gap-6 ${words.notes.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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

/*
 * The assistants, as a table rather than a gallery: which connect, how, and whether it works yet.
 * A row opens to say more — for Claude, where its page is; for the rest, what is being tried.
 */
function Clients({ words, current }: { words: LandingWords['clients']; current: Page['id'] }) {
  const t = useT();
  const { content, locale } = useI18n();

  return (
    <section className="flex flex-col gap-10">
      <SectionHead title={words.heading} intro={words.intro} />

      <div className="overflow-hidden rounded-3xl border border-stroke bg-surface-card">
        <div className="hidden grid-cols-[1.2fr_1.6fr_9rem_1.5rem] gap-4 border-stroke border-b bg-surface-page px-5 py-3 font-mono text-ink-inactive text-xs uppercase tracking-wider md:grid">
          <span>{t('agents.col.assistant')}</span>
          <span>{t('agents.col.how')}</span>
          <span>{t('agents.col.status')}</span>
          <span />
        </div>

        <Accordion type="single" collapsible defaultValue={words.items[0]?.name}>
          {words.items.map((item, index) => {
            const target = CLIENT_PAGES[index];
            const works = Boolean(target);
            const link = target && target !== current ? staticPage(target) : null;

            return (
              <AccordionItem key={item.name} value={item.name}>
                <AccordionTrigger className="rounded-none px-5 py-4 hover:bg-surface-page">
                  <span className="grid flex-1 grid-cols-[1fr_auto] items-center gap-4 text-left md:grid-cols-[1.2fr_1.6fr_9rem]">
                    <span className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-card2">
                        <img
                          src={CLIENT_ART[index] ?? CLIENT_ART[CLIENT_ART.length - 1]}
                          alt=""
                          width={1024}
                          height={1024}
                          loading="lazy"
                          decoding="async"
                          className="size-8 object-contain"
                        />
                      </span>
                      <span className="font-semibold text-base text-ink-primary">{item.name}</span>
                    </span>
                    <span className="hidden text-ink-secondary text-sm md:block">{item.how}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 justify-self-start whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${
                        works
                          ? 'bg-surface-accent text-brand-tertiary'
                          : 'bg-surface-card2 text-ink-inactive'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${works ? 'bg-brand-primary' : 'bg-ink-inactive'}`}
                      />
                      {works ? t('agents.status.works') : t('agents.status.testing')}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 md:pl-[4.75rem]">
                  <div className="flex max-w-2xl flex-col gap-3">
                    <span className="text-ink-secondary text-sm md:hidden">{item.how}</span>
                    <p className="text-ink-body text-sm leading-relaxed">{item.body}</p>
                    {link && (
                      <a
                        href={localePath(locale, link.path)}
                        className="inline-flex items-center gap-1.5 self-start font-semibold text-brand-tertiary text-sm no-underline hover:underline"
                      >
                        {content.pages[link.id].title}
                        <ArrowRight className="size-4" />
                      </a>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}

/*
 * The objection, answered as a table: one property per row, said both ways. The column this page
 * is about is lit; the other is not crossed out — it is what most people do today, and a row
 * that sneered at it would be less believable than one that simply says what differs.
 */
function Compare({ words }: { words: LandingWords['compare'] }) {
  return (
    <section className="flex flex-col gap-10">
      <SectionHead title={words.heading} intro={words.intro} />

      <div className="overflow-hidden rounded-3xl border border-stroke bg-surface-card">
        <div className="hidden grid-cols-[1fr_1.3fr_1.3fr] border-stroke border-b md:grid">
          <span className="px-6 py-4" />
          <span className="px-6 py-4 font-mono text-ink-inactive text-xs uppercase tracking-wider">
            {words.left}
          </span>
          <span className="flex items-center gap-2 bg-surface-accent px-6 py-4 font-mono font-semibold text-brand-tertiary text-xs uppercase tracking-wider">
            <span className="h-3.5 w-0.5 rounded-full bg-brand-primary" />
            {words.right}
          </span>
        </div>

        {words.rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 border-stroke border-b px-6 py-5 last:border-b-0 md:grid-cols-[1fr_1.3fr_1.3fr] md:gap-0 md:p-0"
          >
            <span className="font-semibold text-ink-primary text-sm md:px-6 md:py-5">
              {row.label}
            </span>
            <span className="flex items-start gap-2.5 text-ink-secondary text-sm md:px-6 md:py-5">
              <span className="mt-2 h-px w-3 shrink-0 bg-ink-inactive" />
              {row.left}
            </span>
            <span className="flex items-start gap-2.5 rounded-lg bg-surface-accent px-3 py-2 text-ink-primary text-sm md:rounded-none md:px-6 md:py-5">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-primary" />
              {row.right}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/*
 * The questions, drawn by the front page's own block — the same section, heading and accordion
 * — so that a question looks like a question everywhere on the site rather than three ways.
 */
function Questions({ words }: { words: LandingWords['faq'] }) {
  const t = useT();

  return (
    <section className="dot-grid flex flex-col items-center gap-8 rounded-2xl border border-stroke bg-surface-card px-4 py-12 sm:px-10">
      <SectionHeading
        align="center"
        size="lg"
        eyebrow={t('converter.faq.eyebrow')}
        title={words.heading}
        description={words.intro}
      />

      <Faq
        items={words.items.map((item) => ({
          question: item.question,
          answer: inlineCode(item.answer),
        }))}
        className="max-w-3xl"
      />
    </section>
  );
}

export function AgentsPage({ page, onGoToConverter }: { page: Page; onGoToConverter: () => void }) {
  const t = useT();
  const { content, locale } = useI18n();
  const words = content.pages[page.id];
  const landing = words.landing;
  const guide = localePath(locale, staticPage('how-to-assistant').path);
  const action = words.action ?? '';

  if (!landing) {
    return null;
  }

  return (
    <article className="flex w-full flex-col gap-20 pb-8 md:gap-24">
      <AppBreadcrumbs
        items={crumbsForStaticPage(page, content, locale)}
        onNavigate={onGoToConverter}
      />

      {/* ------------------------------------------------------------------ the opening */}
      <header className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <Label>{landing.eyebrow}</Label>
          <h1 className="font-semibold text-4xl text-ink-primary leading-[1.1] tracking-tight md:text-5xl">
            {words.title}
          </h1>
          <p className="text-ink-secondary text-lg leading-relaxed">{words.lede}</p>
          <CopyAddress label={action} />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a
              href={CLAUDE_CONNECTORS}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-brand-tertiary underline-offset-2 hover:underline"
            >
              {t('agents.claude.settings')}
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href={guide}
              className="inline-flex items-center gap-1.5 text-brand-tertiary underline-offset-2 hover:underline"
            >
              {t('agents.guide')}
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>
        {/* Drawn first on a wide screen, after the words on a narrow one: the words are what a phone
            reader needs before the picture of them. */}
        <div className="lg:order-first">
          <PipeDemo demo={landing.demo} />
        </div>
      </header>

      {/* ------------------------------------------------------------------ what it is for */}
      <section className="flex flex-col gap-10">
        <SectionHead title={landing.useCases.heading} intro={landing.useCases.intro} />
        <div className="grid gap-4 md:grid-cols-2">
          {landing.useCases.items.map((item, index) => (
            <UseCase key={item.title} item={item} art={USE_CASE_ART[index % USE_CASE_ART.length]} />
          ))}
        </div>
      </section>

      <Compare words={landing.compare} />

      <AddressBlock title={landing.middle.title} text={landing.middle.text} action={action} />

      {/* ------------------------------------------------------------------ connecting */}
      <section className="flex flex-col gap-10">
        <SectionHead title={landing.steps.heading} />

        <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* The pipe the three steps sit on, where they are in a row. */}
          <span
            aria-hidden="true"
            className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-1 rounded-full md:block"
            style={{
              backgroundImage:
                'linear-gradient(to right, hsl(var(--brand-primary)), hsl(var(--brand-400)), hsl(var(--brand-primary)))',
            }}
          />
          {landing.steps.items.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-center gap-5">
              <span className="relative z-10 flex size-11 items-center justify-center rounded-full border-4 border-brand-primary bg-surface-page font-mono font-semibold text-ink-primary text-sm">
                {index + 1}
              </span>
              <div className="flex w-full flex-1 flex-col gap-4 rounded-3xl border border-stroke bg-surface-card p-5">
                <StepPicture step={index} ask={landing.useCases.items[1]?.ask ?? ''} />
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-ink-primary text-lg">{step.title}</h3>
                  <p className="text-ink-secondary text-sm leading-relaxed">
                    {inlineCode(step.body)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {landing.command && <CommandBlock words={landing.command} />}
      </section>

      <Reach words={landing.trust} />

      <Clients words={landing.clients} current={page.id} />

      <Questions words={landing.faq} />

      <AddressBlock
        title={landing.bottom.title}
        text={landing.bottom.text}
        action={action}
        centred
      />

      <ScrollToTop />
    </article>
  );
}
