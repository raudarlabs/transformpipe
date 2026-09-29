import { Check, ChevronDown, Copy, FileCode } from 'lucide-react';
import { type RefObject, useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { IconButton } from '@/ui/components/IconButton';
import { toast } from '@/ui/components/Toast';

/**
 * The page, as Markdown, for somebody about to paste it into an assistant.
 *
 * Made from what is on the screen, by this site's own HTML-to-Markdown converter — the same one
 * the HTML → Markdown page runs — so the copy is exactly the page the reader is looking at, in
 * their language, with nothing to keep in step. Controls do not come along: a button's label or a
 * copy icon's tooltip in the middle of a paragraph is noise to a model. Anything marked
 * `data-copy-skip` is left out too — an accordion, whose closed answers are not on the page — and
 * the caller puts the same thing beside it as plain `hidden` markup, which is copied and never shown.
 *
 * Links and pictures are made absolute, because a relative address means nothing once the text
 * has left the page.
 *
 * Synchronous, on a converter loaded ahead of time — see `loadConverter`. Both things this feeds
 * have to happen inside the click: a browser opens a new tab only as the direct result of one, and
 * Safari writes to the clipboard only then. Awaiting the converter first spent the click, and View
 * as Markdown opened nothing.
 */
function pageMarkdown(
  htmlToMarkdown: (html: string) => string,
  root: HTMLElement,
  heading: string
): string {
  const clone = root.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll('button, nav, script, style, svg, [aria-hidden="true"], [data-copy-skip]')
    .forEach((node) => node.remove());

  for (const [selector, attribute] of [
    ['a[href]', 'href'],
    ['img[src]', 'src'],
  ] as const) {
    clone.querySelectorAll(selector).forEach((node) => {
      const value = node.getAttribute(attribute);

      if (value) {
        node.setAttribute(attribute, new URL(value, window.location.href).href);
      }
    });
  }

  const address = `${window.location.origin}${window.location.pathname}`;

  const markdown = htmlToMarkdown(clone.innerHTML).trim();
  const source = `Source: ${address}`;

  /* Under the page's own title when it has one, so the copy does not open on the title twice. */
  const title = /^# .+$/m.exec(markdown);

  return title
    ? `${markdown.slice(0, title.index + title[0].length)}\n\n${source}${markdown.slice(title.index + title[0].length)}\n`
    : `# ${heading}\n\n${source}\n\n${markdown}\n`;
}

type Converter = typeof import('@shared/from-html');

let converter: Converter | null = null;
let loading: Promise<Converter> | null = null;

/** The converter, fetched once and kept, so the click that needs it finds it already here. */
function loadConverter(): Promise<Converter> {
  loading ??= import('@shared/from-html').then((module) => {
    converter = module;

    return module;
  });

  return loading;
}

interface CopyPageButtonProps {
  /** What to turn into Markdown: the page's content, without its chrome. */
  source: RefObject<HTMLElement | null>;
  /** The title the copy opens with, when the content root has no `h1` of its own. */
  heading: string;
}

/**
 * Copy page, with View as Markdown behind the arrow.
 *
 * A split button like the converter's download: the thing most people want under the thumb, the
 * other one a click away. Viewing opens the Markdown in a tab of its own as plain text, for reading
 * it before handing it over, or saving it.
 */
export function CopyPageButton({ source, heading }: CopyPageButtonProps) {
  const t = useT();
  const [isCopied, setIsCopied] = useState(false);

  /* Fetched once the page is up, not on the click — see `pageMarkdown`. */
  useEffect(() => {
    void loadConverter();
  }, []);

  /** The Markdown now if the converter is here, or once it has arrived if it is not yet. */
  const markdown = async () => {
    const { htmlToMarkdown } = converter ?? (await loadConverter());

    return source.current ? pageMarkdown(htmlToMarkdown, source.current, heading) : null;
  };

  const copy = async () => {
    try {
      const text = converter && source.current
        ? pageMarkdown(converter.htmlToMarkdown, source.current, heading)
        : await markdown();

      if (text === null) {
        return;
      }

      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(t('page.copy.done'));
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error(t('common.clipboard.error'));
    }
  };

  /*
   * A plain-text tab of its own, opened inside the click with the Markdown already in it. Blob
   * URLs are this page's origin, so the tab shows the text as it is and saves as a file.
   */
  const view = () => {
    if (!converter || !source.current) {
      // Not loaded yet, which is a second or two after the page opened at most.
      void markdown().catch(() => undefined);
      toast.error(t('page.copy.error'));

      return;
    }

    try {
      const text = pageMarkdown(converter.htmlToMarkdown, source.current, heading);
      const address = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));

      window.open(address, '_blank');
      setTimeout(() => URL.revokeObjectURL(address), 60_000);
    } catch {
      toast.error(t('page.copy.error'));
    }
  };

  return (
    <div className="flex shrink-0 items-center">
      <Button
        variant="secondary"
        size="sm"
        leftSlot={isCopied ? <Check /> : <Copy />}
        className="rounded-r-none"
        onClick={() => void copy()}
      >
        {t('page.copy.label')}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="secondary"
            size="sm"
            aria-label={t('page.copy.more')}
            className="ml-px rounded-l-none"
          >
            <ChevronDown />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem onSelect={() => void copy()} className="items-start gap-3 py-2">
            <Copy className="mt-0.5 size-4 shrink-0" />
            <span className="flex flex-col">
              <span className="font-medium text-ink-primary text-sm">
                {t('page.copy.markdown.title')}
              </span>
              <span className="text-ink-secondary text-xs">{t('page.copy.markdown.body')}</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={view} className="items-start gap-3 py-2">
            <FileCode className="mt-0.5 size-4 shrink-0" />
            <span className="flex flex-col">
              <span className="font-medium text-ink-primary text-sm">
                {t('page.copy.view.title')}
              </span>
              <span className="text-ink-secondary text-xs">{t('page.copy.view.body')}</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
