import {
  Activity,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileCode2,
  FileText,
  Maximize2,
  Minimize2,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { DocStats } from '@/components/DocStats';
import { checkDocument } from '@shared/check';
import { DocumentCheck } from '@/components/DocumentCheck';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentViews } from '@/components/DocumentViews';
import { Hint } from '@/components/Hint';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ShareDialog } from '@/components/ShareDialog';
import { AppBreadcrumbs } from '@/components/AppBreadcrumbs';
import { ConversionPicker } from '@/components/ConversionPicker';
import { crumbsForConversion } from '@/lib/breadcrumbs';
import { STATIC_PAGES } from '@/lib/pages';
import { articleCardImage } from '@/lib/covers';
import { Dropzone } from '@/components/Dropzone';
import { PasteBox } from '@/components/PasteBox';
import {
  type Conversion,
  type ConversionId,
  DEFAULT_CONVERSION,
} from '@shared/conversions';
import { articlePath, articlesFor, formatArticleDate } from '@/lib/blog';
import { FAQ_FLAGS } from '@/lib/faq';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { ArticleCard } from '@/ui/components/ArticleCard';
import { CodeBlock } from '@/ui/components/Code';
import { Faq } from '@/ui/components/Faq';
import { SectionHeading } from '@/ui/components/SectionHeading';
import { useTheme } from '@/lib/theme';
import { OVERLAY, useFullscreen } from '@/lib/use-fullscreen';
import type { ConvertedDoc } from '@/lib/types';
import { buildStandaloneHtml, markdownToHtml } from '@/lib/markdown';
import { downloadDoc, printDoc, saveBlob } from '@/lib/download';
import { count } from '@/lib/usage';
import {
  type DocFormat,
  FORMAT_LABELS,
  formatBytes,
  formatDateTime,
  toFileName,
} from '@/lib/format';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/components/Tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { IconButton } from '@/ui/components/IconButton';
import { Skeleton } from '@/ui/components/Skeleton';
import { Spinner } from '@/ui/components/Spinner';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';
import { toast } from '@/ui/components/Toast';

/** Conversions with nothing to paste, because the source is a binary or an archive. */
const BINARY_CONVERSIONS = new Set<ConversionId>([
  'word-to-markdown',
  'notion-to-markdown',
  'confluence-to-markdown',
  'obsidian-to-markdown',
  'excel-to-markdown',
  'powerpoint-to-markdown',
  'epub-to-markdown',
  'odt-to-markdown',
  'rtf-to-markdown',
]);

interface ConverterPageProps {
  /** Which conversion this screen is: what it accepts and where it lives. Its words come from the catalogue. */
  conversion: Conversion;
  doc: ConvertedDoc | null;
  isBusy: boolean;
  onConversionChange: (id: ConversionId) => void;
  onFiles: (files: File[]) => void;
  onReset: () => void;
  /** Whether there is an account to save into. Signed out, the button says so rather than hiding. */
  canSave: boolean;
  onSave: () => void;
  onGoToBlog: () => void;
  onGoToLivePreview: (markdown: string) => void;
  onOpenArticle: (slug: string) => void;
}

export function ConverterPage({
  conversion,
  doc,
  isBusy,
  onConversionChange,
  onFiles,
  onReset,
  canSave,
  onSave,
  onGoToBlog,
  onGoToLivePreview,
  onOpenArticle,
}: ConverterPageProps) {
  const t = useT();
  const { content, locale } = useI18n();
  /** What this conversion is called and says, in the reader's language. */
  const words = content.conversions[conversion.id];
  const [isCopied, setIsCopied] = useState(false);
  const [tab, setTab] = useState<'preview' | 'source' | 'summary' | 'check' | 'views'>(
    'preview'
  );

  /* The same parse the panel makes, so the badge and the list can never disagree. */
  const problems = useMemo(
    () => (doc ? checkDocument(doc.markdown).length : 0),
    [doc]
  );

  const [isShareOpen, setIsShareOpen] = useState(false);
  const previewFrame = useRef<HTMLDivElement>(null);
  const {
    isFullscreen,
    overlaid,
    toggle: toggleFullscreen,
  } = useFullscreen(previewFrame);

  const [summary, setSummary] = useState<string | null>(null);
  /** Asked for, and nothing written yet. */
  const [summaryLoading, setSummaryLoading] = useState(false);
  /** Arriving: the text so far is on the screen and more is coming. */
  const [summaryWriting, setSummaryWriting] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  /*
   * Which request is the current one. A summary streams for several seconds, and a reader who
   * opens another document in that time must not have the first one's text land on the second.
   */
  const summaryRequest = useRef(0);

  // A different document — reset to a clean slate rather than showing a stale summary.
  useEffect(() => {
    summaryRequest.current += 1;
    setSummary(null);
    setSummaryError(null);
    setSummaryLoading(false);
    setSummaryWriting(false);
  }, [doc?.remoteId]);

  /*
   * Streamed, not fetched whole: a summary takes the model several seconds, and a box that sits
   * empty for all of them and then fills at once reads as nothing happening followed by a jolt.
   * The first words replace the placeholder as soon as they exist.
   */
  const loadSummary = async (force = false) => {
    if (!doc?.remoteId) {
      return;
    }

    const mine = ++summaryRequest.current;
    /* Kept to put back if a regenerate fails before writing anything: the old one is still true. */
    const previous = summary;
    let arrived = false;

    setSummary(null);
    setSummaryLoading(true);
    setSummaryWriting(false);
    setSummaryError(null);

    try {
      const result = await api.streamSummary(doc.remoteId, {
        force,
        onText: (text) => {
          if (mine !== summaryRequest.current || !text) {
            return;
          }

          arrived = true;
          setSummaryLoading(false);
          setSummaryWriting(true);
          setSummary(text);
        },
      });

      if (mine === summaryRequest.current) {
        setSummary(result.summary);
      }
    } catch (cause) {
      if (mine === summaryRequest.current) {
        const why = cause instanceof Error ? cause.message : t('converter.summary.error');

        if (previous && !arrived) {
          setSummary(previous);
          toast.error(why);
        } else {
          setSummaryError(why);
        }
      }
    } finally {
      if (mine === summaryRequest.current) {
        setSummaryLoading(false);
        setSummaryWriting(false);
      }
    }
  };

  // The first time somebody opens the tab for this document, ask for it — a cache hit costs
  // nothing on the server, and asking again on every render would. Deliberately keyed only on
  // `tab` and the document's id: `summary`/`summaryLoading`/`summaryError` are this effect's own
  // output, and including them would make it re-run the moment it sets them.
  useEffect(() => {
    if (
      tab === 'summary' &&
      doc?.remoteId &&
      !summary &&
      !summaryLoading &&
      !summaryWriting &&
      !summaryError
    ) {
      void loadSummary();
    }
  }, [tab, doc?.remoteId]);

  const { theme } = useTheme();

  /*
   * What the person came here for decides the whole of this screen's right-hand side.
   *
   * Somebody who converted a Word file wants the Markdown: handing them "Download .html" as the
   * one obvious button makes them go looking for the thing they actually asked for. So the primary
   * format follows the conversion, and the rest stay one click away.
   */
  const primary: DocFormat = conversion.to === 'html' ? 'html' : 'md';
  const secondary: DocFormat[] = (['md', 'obsidian', 'html', 'txt'] as DocFormat[]).filter(
    (one) => one !== primary
  );

  /*
   * The front page's shorter list of questions: the doubts, without the details.
   *
   * Zipped here rather than imported ready-made, because the words belong to the locale on screen
   * and the flags do not — `FAQ_FLAGS[n]` is about `content.faq[n]`, position being the only id a
   * question has. See `src/lib/faq.ts`.
   */
  const questions = useMemo(
    () =>
      content.faq
        .map((one, index) => ({ ...one, ...FAQ_FLAGS[index] }))
        .filter((one) => !one.detail),
    [content.faq]
  );

  const standalone = useMemo(
    () =>
      doc
        ? buildStandaloneHtml({
            title: doc.name,
            body: doc.html,
            createdAt: doc.createdAt,
            theme,
          })
        : '',
    [doc, theme]
  );

  if (!doc) {
    return (
      <div className="flex flex-col gap-6">
        {/* On the front page the trail is there but unlinked — see `crumbsForConversion`. */}
        <AppBreadcrumbs
          items={crumbsForConversion(conversion, content, locale)}
          onNavigate={() => onConversionChange(DEFAULT_CONVERSION)}
        />

        <div className="flex flex-col gap-1">
          {/* The page's own h1: the header carries a wordmark, not a heading. */}
          <Typography
            variant="h1"
            weight="semibold"
            textColor="primary"
            className="text-lg md:text-lg"
          >
            {words.title}
          </Typography>
          <Typography variant="p" textColor="secondary">
            {words.blurb}
          </Typography>
        </div>

        <Dropzone
          isBusy={isBusy}
          extensions={conversion.extensions}
          title={t('converter.dropzone.title', {
            extension: conversion.extensions[0],
          })}
          hint={words.hint}
          onFiles={onFiles}
        />

        {/*
         * Word, Notion, Confluence, Obsidian and Excel are the exceptions: each takes a binary or
         * an archive, so there is nothing to paste — `PasteBox` renders disabled for those rather
         * than being left out, so this row is the same height on every conversion's page and the
         * picker below it does not jump. Everywhere else the pasted text becomes a file with this
         * conversion's own extension so that `onFiles` does the converting, the size check and the
         * rest exactly as it does for a dropped file.
         */}
        <PasteBox
          isBusy={isBusy}
          extension={conversion.extensions[0]}
          disabledReason={
            BINARY_CONVERSIONS.has(conversion.id)
              ? t('converter.paste.unavailable', { extension: conversion.extensions[0] })
              : undefined
          }
          /*
           * Only for Markdown: the live preview renders Markdown, so offering it beside a CSV
           * would send somebody to a page that cannot do what they came for.
           */
          onGoToLivePreview={
            conversion.id === DEFAULT_CONVERSION ? onGoToLivePreview : undefined
          }
          onText={(text) =>
            onFiles([
              new File([text], `pasted${conversion.extensions[0]}`, {
                type: 'text/plain',
              }),
            ])
          }
        />

        {/*
          * The how-to page for this format, linked from the one screen where somebody is holding
          * that kind of file. Found by matching the page's own `action` against this conversion's
          * address rather than by a second mapping — the pages already say which conversion they
          * end on, and two lists of the same fact is one list that goes stale. `covers` is the same
          * page saying which *other* conversions it answers for, which is how the three screens
          * that all take a `.zip` share one guide.
          *
          * This is also what keeps those pages reachable. They used to sit in the footer as a
          * column of nine, which was a wall on every page of the site to serve a reader who has
          * exactly one file in front of them.
          */}
        {(() => {
          const guide = STATIC_PAGES.find(
            (one) =>
              one.action === conversion.path ||
              one.covers?.includes(conversion.path)
          );

          return guide ? (
            <Typography variant="p" textColor="light" className="text-center text-sm">
              {t('converter.howto')}{' '}
              <a
                href={guide.path}
                className="text-brand-tertiary underline underline-offset-2"
              >
                {content.pages[guide.id].label}
              </a>
            </Typography>
          ) : null;
        })()}

        <ConversionPicker
          current={conversion.id}
          onChange={onConversionChange}
        />

        {/* Below the fold: two bands, each opening with a pill, so the page stops reading as one sheet. */}
        {articlesFor(locale).length > 0 && (
          <section className="mt-6 flex flex-col items-center gap-6 border-stroke border-t pt-12">
            <SectionHeading
              align="center"
              size="lg"
              eyebrow={t('converter.blog.eyebrow')}
              title={t('converter.blog.title')}
              description={t('converter.blog.blurb')}
            />

            {/* Six: two full rows of three, so the last row is never one card on its own. */}
            <div className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3">
              {articlesFor(locale)
                .slice(0, 6)
                .map((article) => (
                  <ArticleCard
                    key={article.slug}
                    title={article.title}
                    description={article.description}
                    href={articlePath(article.slug, locale)}
                    image={articleCardImage(article.slug)}
                    onOpen={() => onOpenArticle(article.slug)}
                    tag={article.tag}
                    meta={formatArticleDate(article.date, INTL_LOCALES[locale])}
                  />
                ))}
            </div>

            <Button variant="secondary" size="sm" onClick={onGoToBlog}>
              {t('converter.blog.all')}
            </Button>
          </section>
        )}

        {/* Addressable: the footer links here, so it needs somewhere to land. */}
        <section
          id="faq"
          className="dot-grid mt-10 flex flex-col items-center gap-8 rounded-2xl border border-stroke bg-surface-card px-4 py-12 sm:px-10"
        >
          <SectionHeading
            align="center"
            size="lg"
            eyebrow={t('converter.faq.eyebrow')}
            title={t('converter.faq.title')}
            description={t('converter.faq.blurb')}
          />

          <Faq items={questions} className="max-w-3xl" />
        </section>
      </div>
    );
  }

  const source = primary === 'html' ? standalone : doc.markdown;

  const handleDownload = (format: DocFormat) => {
    downloadDoc(doc.name, doc.markdown, doc.createdAt, theme, format);
    count('download', format);

    toast.success(t('converter.download.done', { format: FORMAT_LABELS[format] }), {
      description: toFileName(doc.name, format),
    });
  };

  const handleDownloadDocx = async () => {
    if (!doc.remoteId) {
      return;
    }

    try {
      const blob = await api.downloadDocx(doc.remoteId);

      saveBlob(`${doc.name.replace(/\.[^.]+$/, '')}.docx`, blob);
      count('download', 'docx');
      toast.success(t('converter.download.done', { format: 'Word' }));
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : t('converter.download.docx.error')
      );
    }
  };

  const handlePrint = async () => {
    try {
      await printDoc(doc.name, doc.html, doc.createdAt, theme, t);
    } catch (cause) {
      toast.error(t('converter.print.error'), {
        description:
          cause instanceof Error
            ? cause.message
            : t('converter.print.error.hint'),
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success(
        t('converter.copy.done', { format: FORMAT_LABELS[primary] })
      );
    } catch {
      toast.error(t('common.clipboard.error'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card
        variant="outline"
        fullWidth
        rounded="lg"
        className="flex-row flex-wrap items-center justify-between gap-4 bg-surface-card"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-tertiary">
            <FileText className="size-5" />
          </span>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <Typography
                variant="span"
                weight="semibold"
                textColor="primary"
                className="truncate"
              >
                {doc.name}
              </Typography>
              <Badge variant="success" size="sm" rounded="full">
                {t('converter.badge.converted')}
              </Badge>

              {doc.sources && (
                <Badge variant="secondary" size="sm" rounded="full">
                  {t('converter.badge.merged', { count: doc.sources.length })}
                </Badge>
              )}
            </div>
            <Typography variant="span" textColor="secondary" className="text-xs">
              {formatBytes(doc.size, INTL_LOCALES[locale])} ·{' '}
              {formatDateTime(doc.createdAt, INTL_LOCALES[locale])}
            </Typography>
            <div className="mt-1">
              <DocStats stats={doc.stats} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="tertiary"
            size="sm"
            leftSlot={<RotateCcw />}
            onClick={onReset}
          >
            {t('converter.newfile')}
          </Button>
          {/*
           * Nothing reaches the account on its own any more, so this is the button that puts it
           * there. Disabled rather than hidden when signed out: a control that is missing teaches
           * nobody that the account is where documents live.
           */}
          <Hint
            content={
              doc.remoteId
                ? t('converter.save.done')
                : canSave
                  ? t('converter.save.hint')
                  : t('converter.save.hint.signedout')
            }
          >
            <span>
              <Button
                variant="secondary"
                size="sm"
                leftSlot={doc.remoteId ? <Check /> : <Save />}
                disabled={!canSave || Boolean(doc.remoteId)}
                onClick={onSave}
              >
                {doc.remoteId ? t('converter.saved') : t('converter.save')}
              </Button>
            </span>
          </Hint>

          <Hint
            content={
              doc.remoteId
                ? t('converter.share.hint')
                : canSave
                  ? t('converter.share.hint.unsaved')
                  : t('converter.share.hint.signedout')
            }
          >
            <span>
              <Button
                variant="secondary"
                size="sm"
                leftSlot={<Share2 />}
                disabled={!doc.remoteId}
                onClick={() => setIsShareOpen(true)}
              >
                {t('converter.share')}
              </Button>
            </span>
          </Hint>

          <Button
            variant="secondary"
            size="sm"
            leftSlot={isCopied ? <Check /> : <Copy />}
            onClick={handleCopy}
          >
            {isCopied
              ? t('common.copied')
              : t('converter.copy', { format: FORMAT_LABELS[primary] })}
          </Button>

          {/* A split button: the conversion's own format under the thumb, the others in the menu. */}
          <div className="flex items-center">
            <Button
              variant="primary"
              size="sm"
              leftSlot={<Download />}
              className="rounded-r-none"
              onClick={() => handleDownload(primary)}
            >
              {t('converter.download', { format: primary })}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  variant="primary"
                  size="sm"
                  aria-label={t('converter.download.more')}
                  className="ml-px rounded-l-none"
                >
                  <ChevronDown />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondary.map((one) => (
                  <DropdownMenuItem
                    key={one}
                    onSelect={() => handleDownload(one)}
                  >
                    <Download className="size-4" />
                    {FORMAT_LABELS[one]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onSelect={() => void handlePrint()}>
                  <Printer className="size-4" />
                  {t('converter.print')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!doc.remoteId}
                  onSelect={() => void handleDownloadDocx()}
                >
                  <FileText className="size-4" />
                  {doc.remoteId
                    ? t('converter.download.docx')
                    : t('converter.download.docx.needsSave')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          setTab(value as 'preview' | 'source' | 'summary' | 'check' | 'views')
        }
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          {/*
            * The strip scrolls rather than wrapping or shrinking.
            *
            * Four tabs — Preview, the source, AI Summary, Check and its count — come to 494
            * pixels, and a phone is 375. It had been three tabs and fitted; the fourth arrived
            * and took the whole page sideways with it, which is the failure nobody sees on a
            * desktop and everybody sees on a train. `no-scrollbar` is the same pair of classes
            * the blog's tag row uses for the same reason.
            */}
          <div className="no-scrollbar -mx-1 max-w-full overflow-x-auto px-1">
            <TabsList>
            <TabsTrigger value="preview">
              <Eye className="size-4" />
              {t('converter.tab.preview')}
            </TabsTrigger>
            <TabsTrigger value="source">
              <FileCode2 className="size-4" />
              {primary === 'html'
                ? t('converter.tab.html')
                : t('converter.tab.markdown')}
            </TabsTrigger>
            <TabsTrigger value="summary">
              <Sparkles className="size-4" />
              {t('converter.tab.summary')}
            </TabsTrigger>
            {/*
              * The count is on the tab, not behind it.
              *
              * A check nobody opens is a check nobody has, and the whole point of this one is that
              * a person who was not looking for problems learns there are some. The number is the
              * cheapest way to say so, and it costs a parse the page has already paid for.
              */}
            <TabsTrigger value="check">
              <ShieldCheck className="size-4" />
              {t('converter.tab.check')}
              {problems > 0 && (
                <span className="ml-1 rounded-full bg-surface-chips px-1.5 py-px text-ink-secondary text-xxs">
                  {problems}
                </span>
              )}
            </TabsTrigger>
            {/* Only for a saved document: an unsaved one has no link for anybody to open. */}
            {doc.remoteId && (
              <TabsTrigger value="views">
                <Activity className="size-4" />
                {t('converter.tab.views')}
              </TabsTrigger>
            )}
            </TabsList>
          </div>

          {tab === 'preview' && (
            <Hint
              content={
                isFullscreen
                  ? t('converter.fullscreen.exit')
                  : t('converter.fullscreen.enter')
              }
            >
              <IconButton
                variant="tertiary"
                size="sm"
                aria-label={
                  isFullscreen
                    ? t('converter.fullscreen.exit')
                    : t('converter.fullscreen.enter')
                }
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 /> : <Maximize2 />}
              </IconButton>
            </Hint>
          )}
        </div>

        <TabsContent value="preview" className="outline-none">
          <div
            ref={previewFrame}
            className={cn(
              'md-preview-frame rounded-xl border border-stroke bg-surface-page p-3 sm:p-6',
              overlaid && OVERLAY
            )}
          >
            {/*
              * Laid over the page rather than genuinely full screen, the control that got us
              * here is underneath — so the way out has to be in here. Real fullscreen has the
              * browser's own, and this button is hidden along with everything else.
              */}
            {overlaid && (
              <IconButton
                variant="secondary"
                size="sm"
                aria-label={t('converter.fullscreen.exit')}
                className="fixed top-3 right-3 z-10 shadow-rest"
                onClick={toggleFullscreen}
              >
                <Minimize2 />
              </IconButton>
            )}

            <DocumentPreview
              html={doc.html}
              className="mx-auto max-w-3xl rounded-lg border border-stroke p-6 shadow-rest sm:p-10"
            />

            <ScrollToTop />
          </div>
        </TabsContent>

        <TabsContent value="source" className="outline-none">
          <CodeBlock
            language={primary === 'html' ? 'html' : 'markdown'}
            className="max-h-[70vh] rounded-xl bg-surface-page"
          >
            {source}
          </CodeBlock>
        </TabsContent>

        <TabsContent value="check" className="outline-none">
          <DocumentCheck markdown={doc.markdown} />
        </TabsContent>

        {doc.remoteId && (
          <TabsContent value="views" className="outline-none">
            {/* Mounted when the tab opens, so the list is fetched when somebody looks at it. */}
            {tab === 'views' && (
              <DocumentViews documentId={doc.remoteId} onShare={() => setIsShareOpen(true)} />
            )}
          </TabsContent>
        )}

        <TabsContent value="summary" className="outline-none">
          <div className="flex flex-col items-start gap-4 rounded-xl border border-stroke bg-surface-page p-6">
            {!doc.remoteId ? (
              <Typography variant="p" textColor="secondary">
                {t('converter.summary.needsSave')}
              </Typography>
            ) : summaryLoading ? (
              /* Before the first words: say it is working, and show roughly the shape coming. */
              <div className="flex w-full flex-col gap-3" role="status" aria-live="polite">
                <span className="flex items-center gap-2 text-ink-secondary text-sm">
                  <Spinner size="sm" />
                  {t('converter.summary.loading')}
                </span>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : summaryError ? (
              <>
                {/* What did arrive stays, dimmed, above the reason it stopped. */}
                {summary && (
                  <div className="w-full opacity-60">
                    <DocumentPreview html={markdownToHtml(summary)} className="md-article" />
                  </div>
                )}
                <Typography variant="p" textColor="secondary">
                  {summaryError}
                </Typography>
                <Button
                  variant="secondary"
                  size="sm"
                  leftSlot={<RefreshCw />}
                  onClick={() => void loadSummary()}
                >
                  {t('converter.summary.retry')}
                </Button>
              </>
            ) : summary ? (
              <>
                <div className="w-full" aria-busy={summaryWriting}>
                  <DocumentPreview html={markdownToHtml(summary)} className="md-article" />
                </div>
                {summaryWriting ? (
                  <span
                    className="flex items-center gap-2 text-ink-secondary text-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <Spinner size="sm" />
                    {t('converter.summary.writing')}
                  </span>
                ) : (
                  <Button
                    variant="tertiary"
                    size="sm"
                    leftSlot={<RefreshCw />}
                    onClick={() => void loadSummary(true)}
                  >
                    {t('converter.summary.regenerate')}
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      <ShareDialog
        documentId={doc.remoteId ?? null}
        name={doc.name}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
      />
    </div>
  );
}
