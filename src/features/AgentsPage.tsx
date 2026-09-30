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
import { CHATGPT_PLUGINS, CLAUDE_DIRECTORY, MCP_PATH } from '@/lib/mcp-facts';
import { staticPage, type StaticPage as Page } from '@/lib/pages';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/Accordion';
import { Faq } from '@/ui/components/Faq';
import { SectionHeading } from '@/ui/components/SectionHeading';
import { cn } from '@/ui/lib/utils';
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
const CLIENT_PAGES: Record<number, 'agents-claude' | 'agents-chatgpt'> = {
  0: 'agents-claude',
  1: 'agents-chatgpt',
};

/**
 * Which assistant's way in a page offers beside the address.
 *
 * Claude has a listing, so its button opens the listing and one click connects. ChatGPT has none
 * yet: its button opens the Plugins screen where the address is pasted. Every other page — the
 * overview included — leads with Claude, the one that connects in a click.
 */
type Way = 'claude' | 'chatgpt';

const wayFor = (id: Page['id']): Way => (id === 'agents-chatgpt' ? 'chatgpt' : 'claude');

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

/*
 * The address, with the button that copies it inside the field.
 *
 * It used to be a field and, beside it, a bordered button spelling out "Copy the address" — as
 * wide as the address and as loud as the way in, for the lesser of the two. An icon in the field's
 * own corner is where a copy control is looked for; its words stay as the tooltip and the label a
 * screen reader reads, and the tick after a copy says it worked.
 */
function AddressField({ copyLabel }: { copyLabel: string }) {
  const url = `${window.location.origin}${MCP_PATH}`;
  const { copied, copy } = useCopy(url);

  return (
    <div className="relative flex min-h-12 w-full min-w-0 items-center rounded-xl border border-stroke bg-surface-card">
      {/*
        * One line wherever there is room, and otherwise a break in the one place a person would
        * put it — after the host, before the path. An ellipsis hid the part that says which
        * server it is. `break-words` is only for a screen too narrow even for the host.
        */}
      <code className="min-w-0 flex-1 select-all break-words py-3 pr-12 pl-3.5 font-mono text-ink-body text-sm">
        {window.location.origin}
        <wbr />
        {MCP_PATH}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={copyLabel}
        title={copyLabel}
        className={cn(
          'absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand',
          copied
            ? 'text-brand-tertiary'
            : 'text-ink-secondary hover:bg-state-hover hover:text-ink-primary'
        )}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

/** The one-click way in: TransformPipe's listing in Claude's connector directory. */
function AddToClaude() {
  const t = useT();

  return (
    <a
      href={CLAUDE_DIRECTORY}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-primary px-5 font-semibold text-base text-white no-underline shadow-lg transition-colors hover:bg-brand-secondary"
    >
      {t('agents.claude.add')}
      <ExternalLink className="size-4" />
    </a>
  );
}

/** ChatGPT's way in: the Plugins screen, where Add, then Create MCP App, takes the address. */
function OpenChatGpt() {
  const t = useT();

  return (
    <a
      href={CHATGPT_PLUGINS}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-primary px-5 font-semibold text-base text-white no-underline shadow-lg transition-colors hover:bg-brand-secondary"
    >
      {t('agents.chatgpt.open')}
      <ExternalLink className="size-4" />
    </a>
  );
}

/*
 * The two ways in, on one line: the address for every MCP client, and the directory for Claude.
 *
 * The button sits where the copy button used to — at the end of the field's row, the same height
 * — when there is room for both; when there is not, it takes a line of its own, above, as wide
 * as the address. "Room" is the row's own width, not the screen's: the same component sits in a
 * narrow column beside the demo and in a wide block of its own, and a screen breakpoint was wrong
 * for one or the other — at 1024px it put the button beside a field too narrow for the address.
 *
 * So no breakpoint. The field asks for 26rem, which is what the production address needs on one
 * line; if the button does not fit beside that, it wraps, and `flex-wrap-reverse` puts the line it
 * wraps onto on top. The grow factors do the widths: 1000 to 1 means that in a row the field takes
 * the spare space and the button keeps its size, and alone on a line the button fills it.
 */
function WaysIn({
  action,
  way,
  centred = false,
}: {
  action: string;
  way: Way;
  centred?: boolean;
}) {
  return (
    <div className={cn('flex w-full flex-wrap-reverse items-start gap-3', centred && 'justify-center')}>
      <div className="flex min-w-0 flex-[1000_1_26rem]">
        <AddressField copyLabel={action} />
      </div>
      <div className="flex flex-[1_0_auto]">
        {way === 'chatgpt' ? <OpenChatGpt /> : <AddToClaude />}
      </div>
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
        {/* `pretty`: no last line that is one word long. The words are written to four lines at
            full width; everywhere narrower they wrap wherever they wrap, and a lone "time." on a
            line of its own made one card a line taller than the rest for the sake of one word. */}
        <p className="text-ink-secondary text-sm leading-relaxed [text-wrap:pretty]">{item.body}</p>
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
  way,
  centred = false,
}: {
  title: string;
  text: string;
  action: string;
  way: Way;
  centred?: boolean;
}) {
  return (
    <section
      className={`dot-grid flex flex-col gap-6 rounded-3xl border border-stroke bg-surface-card px-4 py-10 sm:px-6 md:px-12 md:py-14 ${
        centred ? 'items-center text-center' : 'lg:flex-row lg:items-center lg:justify-between'
      }`}
    >
      <div className={`flex max-w-xl flex-col gap-2 ${centred ? 'items-center' : 'lg:min-w-0 lg:flex-1'}`}>
        <span className="font-semibold text-2xl text-ink-primary tracking-tight md:text-3xl">
          {title}
        </span>
        <span className="text-base text-ink-secondary">{text}</span>
      </div>
      {/* 38rem beside the words, 42 on its own: room for the address on one line and the button
          beside it (26rem + the button). Any narrower and `WaysIn` stacks them, which is right on
          a phone and wrong on a desktop, where the button belongs where the copy button was. */}
      <div className={centred ? 'w-full max-w-2xl' : 'w-full lg:w-[38rem] lg:shrink-0'}>
        <WaysIn action={action} way={way} centred={centred} />
      </div>
    </section>
  );
}

/*
 * What each of the three steps looks like, drawn small: the directory listing, the connection it
 * asks for, and what comes back. The labels inside are Claude's own interface and addresses, which
 * stay as they are in every language.
 */
function StepPicture({ step, ask, way }: { step: number; ask: string; way: Way }) {
  const frame =
    'flex h-28 w-full flex-col justify-center gap-2 rounded-2xl border border-stroke bg-surface-page p-4';

  /* ChatGPT's own screens, in its own words: the Add menu, then the form the address goes into. */
  if (way === 'chatgpt' && step === 0) {
    return (
      <div className={frame}>
        <span className="font-mono text-[11px] text-ink-inactive">chatgpt.com/plugins</span>
        <div className="flex flex-col gap-1 self-end rounded-lg border border-stroke bg-surface-card px-3 py-2 text-[11px]">
          <span className="text-ink-inactive">Create plugin</span>
          <span className="font-semibold text-ink-primary">Create MCP App</span>
        </div>
      </div>
    );
  }

  if (way === 'chatgpt' && step === 1) {
    return (
      <div className={frame}>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <span className="truncate font-mono text-ink-primary text-[11px]">
            transformpipe.com/api/mcp
          </span>
          <span className="shrink-0 text-[10px] text-ink-inactive">OAuth</span>
        </div>
        <span className="self-end rounded-md bg-brand-primary px-2 py-0.5 font-semibold text-[11px] text-white">
          Create
        </span>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className={frame}>
        <span className="font-mono text-[11px] text-ink-inactive">claude.ai/directory/tp</span>
        <div className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <img
            src="/icon-48.png"
            alt=""
            width={48}
            height={48}
            className="size-6 shrink-0 rounded-md"
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-ink-primary text-xs">TransformPipe</span>
            <span className="truncate text-[10px] text-ink-inactive">Connector directory</span>
          </span>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className={frame}>
        <div className="flex items-center justify-between rounded-lg border border-stroke bg-surface-card px-3 py-2">
          <span className="font-mono text-ink-primary text-xs">TransformPipe</span>
          <span className="rounded-md bg-brand-primary px-2 py-0.5 font-semibold text-[11px] text-white">
            Connect
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-md border border-stroke bg-surface-card px-2 py-1 text-[11px] text-ink-secondary">
          <Check className="size-3 text-brand-tertiary" />
          Signed in with Google
        </span>
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
                    {works && index === 0 && (
                      <a
                        href={CLAUDE_DIRECTORY}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 self-start font-semibold text-brand-tertiary text-sm no-underline hover:underline"
                      >
                        {t('agents.claude.add')}
                        <ExternalLink className="size-4" />
                      </a>
                    )}
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
          {/*
            * Each heading starts where its column's words start, not where its marks do.
            *
            * The rows open with a mark — a 12px dash, a 16px tick — and a 10px gap before the text,
            * while the headings began at the column's edge, so they sat a mark's width left of the
            * words under them. The same slot goes in front of each heading: empty over the dashes,
            * and the accent bar centred in it over the ticks.
            */}
          <span className="flex items-center gap-2.5 px-6 py-4 font-mono text-ink-inactive text-xs uppercase tracking-wider">
            <span aria-hidden="true" className="w-3 shrink-0" />
            {words.left}
          </span>
          <span className="flex items-center gap-2.5 bg-surface-accent px-6 py-4 font-mono font-semibold text-brand-tertiary text-xs uppercase tracking-wider">
            <span aria-hidden="true" className="flex w-4 shrink-0 justify-center">
              <span className="h-3.5 w-0.5 rounded-full bg-brand-primary" />
            </span>
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
  const way = wayFor(page.id);

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
          <div className="flex flex-wrap items-center gap-3">
            <Label>{landing.eyebrow}</Label>
            {/* A listing to point at is Claude's alone for now; ChatGPT's page says it works. */}
            {way === 'claude' ? (
              <a
                href={CLAUDE_DIRECTORY}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/40 bg-surface-accent px-2.5 py-0.5 font-semibold text-[11px] text-brand-tertiary no-underline hover:border-brand-primary"
              >
                <Check className="size-3" />
                {t('agents.listed')}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/40 bg-surface-accent px-2.5 py-0.5 font-semibold text-[11px] text-brand-tertiary">
                <Check className="size-3" />
                {t('agents.chatgpt.works')}
              </span>
            )}
          </div>
          <h1 className="font-semibold text-4xl text-ink-primary leading-[1.1] tracking-tight md:text-5xl">
            {words.title}
          </h1>
          <p className="text-ink-secondary text-lg leading-relaxed">{words.lede}</p>
          <WaysIn action={action} way={way} />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
        {/*
          * Every row as tall as the tallest, not only the two cards in it.
          *
          * A grid stretches the cards sharing a row and nothing more, so four cards whose words
          * ran to five, four, three and three lines came out as two tall and two short, with the
          * result chips of one row sitting lower than the other's. The words are written to four
          * lines in English; `auto-rows-fr` is what keeps the four the same size in the languages
          * where they wrap differently. Two columns only — stacked on a phone, each card is as
          * tall as its own words.
          */}
        <div className="grid gap-4 md:auto-rows-fr md:grid-cols-2">
          {landing.useCases.items.map((item, index) => (
            <UseCase key={item.title} item={item} art={USE_CASE_ART[index % USE_CASE_ART.length]} />
          ))}
        </div>
      </section>

      <Compare words={landing.compare} />

      <AddressBlock
        title={landing.middle.title}
        text={landing.middle.text}
        action={action}
        way={way}
      />

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
                <StepPicture step={index} ask={landing.useCases.items[1]?.ask ?? ''} way={way} />
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
        way={way}
        centred
      />

      <ScrollToTop />
    </article>
  );
}
