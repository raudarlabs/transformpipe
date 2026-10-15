import { ExternalLink, FileText, Folder as FolderIcon, FolderOpen, LogIn, Save } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthDialog } from '@/components/AuthDialog';
import { Logo } from '@/components/Logo';
import { api, type SharedFolderView } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { ProgressBar } from '@/ui/components/ProgressBar';
import { Spinner } from '@/ui/components/Spinner';
import { StatusView } from '@/ui/components/StatusView';
import { toast } from '@/ui/components/Toast';
import { Typography } from '@/ui/components/Typography';

/**
 * A folder someone shared, as the app shows it: what is in it, and keeping all of it.
 *
 * The folder itself is read at /f/<token>, a page the server renders for anybody. This is where
 * that page sends a reader who has to sign in first — a folder shared with named people — and
 * where its "Save to your account" goes, because keeping a copy needs an account and the server's
 * page has no script to ask for one. Saving copies every folder and page into the reader's own
 * account, links between the pages included, and opens the copy in their documents.
 */
export function SharedFolderPage({ token }: { token: string }) {
  const t = useT();
  const { user } = useAuth();
  const [view, setView] = useState<SharedFolderView | null>(null);
  const [error, setError] = useState<{ message: string; needsSignIn: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  /* Where a copy has got to: pages read from the owner's folder, then pages written into yours. */
  const [progress, setProgress] = useState<{ stage: 'reading' | 'writing'; done: number; total: number } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const link = `/f/${encodeURIComponent(token)}`;

  useEffect(() => {
    setIsLoading(true);
    api
      .getSharedFolder(token)
      .then((shared) => {
        setView(shared);
        setError(null);
      })
      .catch((cause: Error) => setError({ message: cause.message, needsSignIn: /sign in/i.test(cause.message) }))
      .finally(() => setIsLoading(false));
    // Signing in changes who is asking, so the answer can change too.
  }, [token, user]);

  const save = async () => {
    if (!user) {
      setIsAuthOpen(true);

      return;
    }

    if (!view) return;

    setIsSaving(true);

    try {
      const copy = await api.saveSharedFolder(token, setProgress);

      toast.success(t('sharedFolder.saved', { count: copy.documents, name: view.folder.name }));
      window.location.href = `/history?folder=${encodeURIComponent(copy.folderId)}`;
    } catch (cause) {
      toast.error(t('sharedFolder.save.error'), { description: cause instanceof Error ? cause.message : undefined });
      setIsSaving(false);
      setProgress(null);
    }
  };

  /* The tree as the folder's page lists it: each folder's pages in their order, subfolders by name. */
  const tree = useMemo(() => {
    if (!view) return null;

    const page = (one: SharedFolderView['documents'][number]) => (
      <li key={one.id}>
        <a href={`${link}/${one.id}`} className="flex items-center gap-1.5 rounded px-1.5 py-1 text-ink-body text-sm hover:bg-surface-chips">
          <FileText className="size-3.5 shrink-0 text-ink-secondary" />
          <span className="truncate">{one.name.replace(/\.(md|markdown|txt)$/i, '')}</span>
        </a>
      </li>
    );

    const branch = (id: string, depth: number): ReactNode => {
      const pages = view.documents
        .filter((one) => one.folder_id === id)
        .sort((a, b) => (a.position ?? 1e9) - (b.position ?? 1e9) || a.name.localeCompare(b.name, undefined, { numeric: true }));
      const folders = view.folders
        .filter((one) => one.parent_id === id)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      return (
        <ul className={depth > 0 ? 'ml-4 border-stroke border-l pl-2' : undefined}>
          {/* A folder's first page — a section's own — above its subfolders, the rest below. */}
          {pages.slice(0, 1).map(page)}
          {folders.map((one) => (
            <li key={one.id}>
              <details open={depth < 1}>
                <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded px-1.5 py-1 text-ink-body text-sm hover:bg-surface-chips">
                  <FolderIcon className="size-4 shrink-0 text-brand-tertiary" />
                  <span className="truncate">{one.name}</span>
                </summary>
                {branch(one.id, depth + 1)}
              </details>
            </li>
          ))}
          {pages.slice(1).map(page)}
        </ul>
      );
    };

    return branch(view.root, 0);
  }, [view, link]);

  return (
    <div className="flex min-h-full flex-col bg-surface-page">
      <header className="sticky top-0 z-20 border-stroke border-b bg-surface-card/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-4 px-6">
          <a href="/" aria-label="TransformPipe">
            <Logo />
          </a>
          {view && (
            <Typography variant="span" weight="medium" textColor="secondary" className="hidden min-w-0 truncate sm:block">
              {view.folder.name}
            </Typography>
          )}
          {!user && (
            <Button className="ml-auto" variant="secondary" size="sm" leftSlot={<LogIn />} onClick={() => setIsAuthOpen(true)}>
              {t('header.signin')}
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-4 px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16">
            <Spinner />
            <Typography variant="span" textColor="secondary">
              {t('sharedFolder.loading')}
            </Typography>
          </div>
        )}

        {!isLoading && error && (
          <StatusView
            tone={error.needsSignIn ? 'info' : 'muted'}
            title={error.needsSignIn ? t('sharedFolder.signin.title') : t('sharedFolder.missing.title')}
            description={error.needsSignIn ? t('sharedFolder.signin.detail') : error.message}
            actions={
              error.needsSignIn ? (
                <Button variant="secondary" size="sm" rounded="full" leftSlot={<LogIn />} onClick={() => setIsAuthOpen(true)}>
                  {t('header.signin')}
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => (window.location.href = '/')}>
                  {t('shared.missing.action')}
                </Button>
              )
            }
          />
        )}

        <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />

        {!isLoading && view && (
          <>
            <Card fullWidth rounded="lg" className="flex-row flex-wrap items-center justify-between gap-4 bg-surface-card">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-tertiary">
                  <FolderOpen className="size-5" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <Typography variant="span" weight="semibold" textColor="primary" className="truncate">
                    {view.folder.name}
                  </Typography>
                  <Typography variant="span" textColor="secondary" className="text-xs">
                    {t(view.documents.length === 1 ? 'sharedFolder.count.one' : 'sharedFolder.count.many', {
                      count: view.documents.length,
                    })}
                    {view.folder.owner && ` · ${t('sharedFolder.by', { owner: view.folder.owner })}`}
                  </Typography>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" leftSlot={<ExternalLink />} onClick={() => (window.location.href = link)}>
                  {t('sharedFolder.open')}
                </Button>
                {view.mine ? (
                  <Button variant="primary" size="sm" onClick={() => (window.location.href = '/history')}>
                    {t('sharedFolder.mine.open')}
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" leftSlot={isSaving ? <Spinner size="sm" /> : <Save />} disabled={isSaving} onClick={() => void save()}>
                    {isSaving ? t('sharedFolder.saving', { count: view.documents.length }) : t('sharedFolder.save')}
                  </Button>
                )}
              </div>
            </Card>

            {isSaving ? (
              /* Reading counts for the first half of the bar and writing for the second. */
              <div className="flex flex-col gap-2 rounded-xl border border-stroke bg-surface-card p-4" role="status" aria-live="polite">
                <Typography variant="span" textColor="secondary" className="text-sm">
                  {progress
                    ? t(progress.stage === 'reading' ? 'sharedFolder.progress.reading' : 'sharedFolder.progress.writing', {
                        done: progress.done,
                        total: progress.total,
                      })
                    : t('sharedFolder.saving', { count: view.documents.length })}
                </Typography>
                <ProgressBar
                  value={
                    progress
                      ? ((progress.stage === 'writing' ? 50 : 0) + (progress.done / Math.max(1, progress.total)) * 50)
                      : 0
                  }
                />
              </div>
            ) : (
              <Typography variant="p" textColor="secondary" className="text-sm">
                {view.mine ? t('sharedFolder.mine') : t('sharedFolder.save.note')}
              </Typography>
            )}

            <nav aria-label={view.folder.name} className="rounded-xl border border-stroke bg-surface-card p-3">
              {tree}
            </nav>
          </>
        )}
      </main>
    </div>
  );
}
