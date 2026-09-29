import {
  Check,
  Copy,
  Download,
  FileText,
  LogIn,
  Save,
  Share2,
  UserPlus,
  Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_CONVERSION } from '@shared/conversions';
import { getDocStats } from '@shared/markdown';
import { DocStats } from '@/components/DocStats';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Logo } from '@/components/Logo';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ShareDialog } from '@/components/ShareDialog';
import { api, type SharedDocument } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatBytes, formatDateTime, toFileName } from '@/lib/format';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { buildStandaloneHtml, markdownToHtml } from '@/lib/markdown';
import { AuthDialog } from '@/components/AuthDialog';
import { useTheme } from '@/lib/theme';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Spinner } from '@/ui/components/Spinner';
import { StatusView } from '@/ui/components/StatusView';
import { toast } from '@/ui/components/Toast';
import { Typography } from '@/ui/components/Typography';

/**
 * A document someone shared, read-only.
 *
 * Reached at /open/<token> and nowhere else in the app: it has no history, no upload and no account
 * of its own — a link handed to somebody should open the document, not the product.
 *
 * Not to be confused with the page at /s/<token>, which the server renders for a reader it knows
 * nothing about — see `GET /s/:token` in `server/app.ts`, and the exclusions in
 * `src/lib/i18n/content.ts`. That one has only `Accept-Language` to guess a language from and its
 * words are not in the catalogue. This is the app, arrived at by somebody the server sent here to
 * sign in, so it reads the catalogue and follows the language they chose like every other screen.
 */
export function SharedDocumentPage({ token }: { token: string }) {
  const t = useT();
  const { locale } = useI18n();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [document, setDocument] = useState<SharedDocument | null>(null);
  /* The copy on this account, once there is one: what Share is then allowed to publish. */
  const [copyId, setCopyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<{ message: string; needsSignIn: boolean } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    api
      .getShared(token)
      .then((shared) => {
        setDocument(shared);
        setError(null);
        /*
         * One open, counted the way the page at /s/<token> counts it: by asking for its picture.
         * A reader of an addressed share lands here rather than there, and would otherwise not be
         * counted at all.
         */
        new Image().src = `/s/${encodeURIComponent(token)}/seen`;
      })
      .catch((cause: Error) =>
        setError({
          message: cause.message,
          needsSignIn: /sign in/i.test(cause.message),
        })
      )
      .finally(() => setIsLoading(false));
    // Signing in changes who is asking, so the answer can change too.
  }, [token, user]);

  /*
   * Saving somebody else's document to your own account, which is a copy and says so.
   *
   * Signed out, the button does not sit there disabled explaining itself: it opens the sign-in
   * dialog, because a reader who just pressed Save has said what they want and the account is one
   * screen away. Signing in re-reads the document — see the effect above — and they press it again.
   */
  const saveCopy = async (): Promise<string | null> => {
    if (!user) {
      setIsAuthOpen(true);

      return null;
    }

    if (copyId || !document) {
      return copyId;
    }

    setIsSaving(true);

    try {
      const markdown = document.markdown;
      const entry = await api.createDocument({
        name: document.name,
        kind: DEFAULT_CONVERSION,
        size: new TextEncoder().encode(markdown).length,
        markdown,
        stats: getDocStats(markdown, markdownToHtml(markdown)),
      });

      setCopyId(entry.id);
      toast.success(t('shared.save.done'));

      return entry.id;
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : t('shared.save.error'));

      return null;
    } finally {
      setIsSaving(false);
    }
  };

  /* Sharing is something you do with your own document, so this saves one first. */
  const shareCopy = async () => {
    const id = copyId ?? (await saveCopy());

    if (id) {
      setIsShareOpen(true);
    }
  };

  const copyMarkdown = async () => {
    if (!document) {
      return;
    }

    try {
      await navigator.clipboard.writeText(document.markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error(t('common.clipboard.error'));
    }
  };

  const download = () => {
    if (!document) {
      return;
    }

    const html = buildStandaloneHtml({
      title: document.name,
      body: markdownToHtml(document.markdown),
      createdAt: document.createdAt,
      theme,
    });
    const url = URL.createObjectURL(
      new Blob([html], { type: 'text/html;charset=utf-8' })
    );
    const link = window.document.createElement('a');

    link.href = url;
    link.download = toFileName(document.name, 'html');
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-full flex-col bg-surface-page">
      <header className="sticky top-0 z-20 border-stroke border-b bg-surface-card/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-4 px-6">
          <a href="/" aria-label="TransformPipe">
            <Logo />
          </a>

          {document && (
            <Typography
              variant="span"
              weight="medium"
              textColor="secondary"
              className="hidden min-w-0 truncate sm:block"
            >
              {document.name}
            </Typography>
          )}

          {/*
            * The bar carries the account now, because the document's own controls moved into the
            * card below it — where they are on every other screen that shows a document.
            */}
          {!user && (
            <Button
              className="ml-auto"
              variant="secondary"
              size="sm"
              leftSlot={<LogIn />}
              onClick={() => setIsAuthOpen(true)}
            >
              {t('header.signin')}
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16">
            <Spinner />
            <Typography variant="span" textColor="secondary">
              {t('shared.loading')}
            </Typography>
          </div>
        )}

        {!isLoading && error && (
          <StatusView
            tone={error.needsSignIn ? 'info' : 'muted'}
            title={
              error.needsSignIn
                ? t('shared.signin.title')
                : t('shared.missing.title')
            }
            description={
              error.needsSignIn
                ? t('shared.signin.detail')
                : error.message
            }
            actions={
              error.needsSignIn ? (
                <Button
                  variant="secondary"
                  size="sm"
                  rounded="full"
                  leftSlot={<LogIn />}
                  /*
                   * The dialog, not straight to Google.
                   *
                   * This button was the last place in the product that could only sign somebody in
                   * one way — and it is the worst place for that, because the person clicking it
                   * was invited by an email sent to an address that may well not be a Google
                   * account. Being told to sign in "with the address it was shared with" and then
                   * offered only Google is a dead end.
                   */
                  onClick={() => setIsAuthOpen(true)}
                >
                  {t('header.signin')}
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => {
                  window.location.href = '/';
                }}>
                  {t('shared.missing.action')}
                </Button>
              )
            }
          />
        )}

        <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />

        {!isLoading && document && (
          <div className="flex flex-col gap-4">
            {/*
              * The same card the converter puts above a document it has just made, because it is
              * the same object: a name, what it weighs, when it was made, what is in it, and the
              * things you can do with it. A shared document used to get a line of small print
              * instead, which read as a preview of a document rather than as the document.
              *
              * What differs is only the verbs. Save makes a copy on your own account; Share is
              * about that copy and not about somebody else's original; and neither sits there
              * disabled when you are signed out — they open the sign-in dialog, because a reader
              * who pressed Save has already said what they want.
              */}
            <Card
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
                      {document.name}
                    </Typography>
                    <Badge variant="secondary" size="sm" rounded="full">
                      {t('shared.badge')}
                    </Badge>
                  </div>

                  <Typography
                    variant="span"
                    textColor="secondary"
                    className="text-xs"
                  >
                    {formatBytes(
                      new TextEncoder().encode(document.markdown).length,
                      INTL_LOCALES[locale]
                    )}{' '}
                    ·{' '}
                    {t('shared.meta', {
                      date: formatDateTime(
                        document.createdAt,
                        INTL_LOCALES[locale]
                      ),
                    })}
                  </Typography>

                  <div className="mt-1">
                    <DocStats
                      stats={getDocStats(
                        document.markdown,
                        markdownToHtml(document.markdown)
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSaving}
                  leftSlot={copyId ? <Check /> : <Save />}
                  onClick={() => void saveCopy()}
                >
                  {copyId ? t('shared.saved') : t('shared.save')}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSaving}
                  leftSlot={<Share2 />}
                  onClick={() => void shareCopy()}
                >
                  {t('converter.share')}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftSlot={isCopied ? <Check /> : <Copy />}
                  onClick={() => void copyMarkdown()}
                >
                  {isCopied
                    ? t('common.copied')
                    : t('converter.copy', { format: 'Markdown' })}
                </Button>

                <Button
                  size="sm"
                  leftSlot={<Download />}
                  onClick={download}
                >
                  {t('converter.download', { format: 'html' })}
                </Button>
              </div>
            </Card>

            <ShareDialog
              documentId={copyId}
              name={document.name}
              open={isShareOpen}
              onOpenChange={setIsShareOpen}
            />

            <div className="md-preview-frame rounded-xl border border-stroke bg-surface-page p-3 sm:p-6">
              <DocumentPreview
                html={markdownToHtml(document.markdown)}
                className="mx-auto max-w-3xl rounded-lg border border-stroke p-6 shadow-rest sm:p-10"
              />

              <ScrollToTop />
            </div>

            {/*
              * What this page is for, after the document.
              *
              * Somebody arrives here because a colleague sent them a link, reads a document that
              * plainly came out of something, and until now had a wordmark in the corner to go on.
              * Shown only to a reader who is not signed in: an account holder reading a document
              * shared with them does not need to be sold the account they already have.
              */}
            {!user && (
              <section className="flex flex-col gap-4 rounded-xl border border-stroke bg-surface-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex flex-col gap-1">
                  <Typography
                    variant="h2"
                    weight="semibold"
                    textColor="primary"
                    className="text-base"
                  >
                    {t('shared.cta.title')}
                  </Typography>

                  <Typography
                    variant="p"
                    textColor="secondary"
                    className="max-w-prose text-sm"
                  >
                    {t('shared.cta.body')}
                  </Typography>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    rounded="full"
                    leftSlot={<Wand2 />}
                    onClick={() => {
                      window.location.href = '/?from=shared';
                    }}
                  >
                    {t('shared.cta.primary')}
                  </Button>

                  {/* The same dialog the header offers, for the same reason the sign-in button
                    * above uses it: whoever was sent this link may not have a Google account. */}
                  <Button
                    variant="secondary"
                    size="sm"
                    rounded="full"
                    leftSlot={<UserPlus />}
                    onClick={() => setIsAuthOpen(true)}
                  >
                    {t('shared.cta.secondary')}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
