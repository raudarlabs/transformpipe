import { ChevronRight, Download, FileText, Folder, FolderOpen, RotateCcw, Save, Rows3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ConversionId } from '@shared/conversions';
import type { SplitResult } from '@/lib/conversion';
import { downloadImport, saveImport } from '@/lib/imports';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { formatBytes } from '@/lib/format';
import { markdownToHtml } from '@/lib/markdown';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { Card } from '@/ui/components/Card';
import { ProgressBar } from '@/ui/components/ProgressBar';
import { Typography } from '@/ui/components/Typography';
import { toast } from '@/ui/components/Toast';
import { cn } from '@/ui/lib/utils';

/*
 * An export, as the pages it is made of, before it is kept anywhere.
 *
 * The tree on the left is the folder it will become — the export's own sections as folders — and
 * a page opens on the right, rendered then and not before: rendering six hundred pages up front is
 * the work that froze the tab. From here it goes into the account in one press, onto disk as a .zip
 * laid out the same way, or back to being one document for somebody who wanted exactly that.
 */

interface Node {
  name: string;
  folders: Map<string, Node>;
  pages: number[];
}

function treeOf(split: SplitResult): Node {
  const root: Node = { name: split.title, folders: new Map(), pages: [] };

  split.pages.forEach((page, index) => {
    let node = root;

    for (const name of page.folder) {
      if (!node.folders.has(name)) node.folders.set(name, { name, folders: new Map(), pages: [] });
      node = node.folders.get(name)!;
    }

    node.pages.push(index);
  });

  const sort = (node: Node) => {
    node.pages.sort((a, b) => split.pages[a].position - split.pages[b].position);
    node.folders.forEach(sort);
  };

  sort(root);

  return root;
}

const countFolders = (node: Node): number =>
  [...node.folders.values()].reduce((sum, one) => sum + 1 + countFolders(one), 0);

interface ImportViewProps {
  split: SplitResult;
  kind: ConversionId;
  canSave: boolean;
  onSaved: (folderId: string) => void;
  onOneDocument: () => void;
  onReset: () => void;
}

export function ImportView({ split, kind, canSave, onSaved, onOneDocument, onReset }: ImportViewProps) {
  const t = useT();
  const { locale } = useI18n();
  const tree = useMemo(() => treeOf(split), [split]);
  const folders = useMemo(() => countFolders(tree), [tree]);
  const bytes = useMemo(() => split.pages.reduce((sum, page) => sum + page.markdown.length, 0), [split]);
  const [selected, setSelected] = useState<number | null>(tree.pages[0] ?? null);
  const [saving, setSaving] = useState<{ done: number; total: number } | null>(null);
  const html = useMemo(
    () => (selected === null ? '' : markdownToHtml(split.pages[selected].markdown)),
    [selected, split]
  );

  const save = async () => {
    setSaving({ done: 0, total: split.pages.length });

    try {
      const result = await saveImport(split, kind, (done, total) => setSaving({ done, total }));

      toast.success(t('import.saved', { count: result.saved, name: split.title }), {
        description: result.failed > 0 ? t('import.saved.failed', { count: result.failed }) : undefined,
      });
      onSaved(result.folderId);
    } catch (cause) {
      toast.error(t('import.save.error'), {
        description: cause instanceof Error ? cause.message : undefined,
      });
    } finally {
      setSaving(null);
    }
  };

  const pageItem = (index: number) => (
    <li key={`p-${index}`}>
      <button
        type="button"
        onClick={() => setSelected(index)}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm',
          selected === index ? 'bg-surface-accent text-ink-primary' : 'text-ink-body hover:bg-surface-chips'
        )}
      >
        <FileText className="size-3.5 shrink-0 text-ink-secondary" />
        <span className="truncate">{split.pages[index].title}</span>
      </button>
    </li>
  );

  /* A folder's first page — the section's own, a space's home — above its subfolders; the rest below. */
  const renderNode = (node: Node, depth: number) => (
    <ul className={cn('flex flex-col', depth > 0 && 'ml-3 border-stroke border-l pl-2')}>
      {node.pages.slice(0, 1).map(pageItem)}
      {[...node.folders.values()].map((folder) => (
        <li key={`f-${folder.name}`}>
          <details open={depth < 1}>
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded px-1.5 py-1 text-ink-body text-sm hover:bg-surface-chips">
              <ChevronRight className="size-3.5 shrink-0 text-ink-secondary transition-transform [details[open]>summary>&]:rotate-90" />
              <Folder className="size-4 shrink-0 text-brand-tertiary" />
              <span className="truncate">{folder.name}</span>
            </summary>
            {renderNode(folder, depth + 1)}
          </details>
        </li>
      ))}
      {node.pages.slice(1).map(pageItem)}
    </ul>
  );

  return (
    <div className="flex flex-col gap-4">
      <Card variant="outline" fullWidth rounded="lg" className="flex-row flex-wrap items-center justify-between gap-4 bg-surface-card">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-tertiary">
            <FolderOpen className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <Typography variant="span" weight="semibold" textColor="primary" className="truncate">
              {split.title}
            </Typography>
            <Typography variant="span" textColor="secondary" className="text-xs">
              {t('import.pages', { count: split.pages.length, folders })} · {formatBytes(bytes, INTL_LOCALES[locale])}
            </Typography>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="tertiary" size="sm" leftSlot={<RotateCcw />} onClick={onReset} disabled={saving !== null}>
            {t('converter.newfile')}
          </Button>
          <Button variant="secondary" size="sm" leftSlot={<Rows3 />} onClick={onOneDocument} disabled={saving !== null}>
            {t('import.one')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" leftSlot={<Download />} disabled={saving !== null}>
                {t('import.zip')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void downloadImport(split)}>{t('import.zip.markdown')}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void downloadImport(split, true)}>{t('import.zip.obsidian')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="primary"
            size="sm"
            leftSlot={<Save />}
            onClick={() => void save()}
            disabled={!canSave || saving !== null}
            title={canSave ? undefined : t('import.save.signedout')}
          >
            {t('import.save')}
          </Button>
        </div>
      </Card>

      {saving && (
        <div className="flex flex-col gap-2 rounded-xl border border-stroke bg-surface-card p-4" role="status" aria-live="polite">
          <Typography variant="span" textColor="secondary" className="text-sm">
            {t('import.saving', { done: saving.done, total: saving.total })}
          </Typography>
          <ProgressBar value={(saving.done / Math.max(1, saving.total)) * 100} />
        </div>
      )}

      {!canSave && (
        <Typography variant="p" textColor="light" className="text-sm">
          {t('import.save.signedout')}
        </Typography>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(14rem,20rem)_1fr]">
        <nav className="max-h-[70vh] overflow-auto rounded-xl border border-stroke bg-surface-page p-2" aria-label={split.title}>
          {renderNode(tree, 0)}
        </nav>

        <div className="rounded-xl border border-stroke bg-surface-page p-3 sm:p-6">
          {selected === null ? (
            <Typography variant="p" textColor="secondary">
              {t('import.pick')}
            </Typography>
          ) : (
            /* A link to another page of the export opens that page here: it has no address yet. */
            <div
              onClickCapture={(event) => {
                const link = (event.target as HTMLElement).closest('a');
                const target = link?.getAttribute('href')?.match(/^#tp-page-(\d+)$/);

                if (target) {
                  event.preventDefault();
                  setSelected(Number(target[1]));
                }
              }}
            >
              <DocumentPreview html={html} className="mx-auto max-w-3xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
