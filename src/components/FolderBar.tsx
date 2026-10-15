import { Check, ChevronRight, Copy, Folder as FolderIcon, FolderInput, FolderPlus, Link2, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState, type DragEvent, type FormEvent } from 'react';
import { api, type Folder } from '@/lib/api';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { Input } from '@/ui/components/Input';
import { MoveDialog } from '@/components/MoveDialog';
import { cn } from '@/ui/lib/utils';
import { toast } from '@/ui/components/Toast';

/*
 * The account's folders, the way a file browser shows them: where you are, what is inside, and
 * what can be done to it.
 *
 * The top is "All documents" — every document, filed or not, which is what this page always was —
 * and a folder shows everything in it and below it, so an import of six hundred pages is one click
 * from all six hundred. Making, renaming, moving and deleting all happen here and then ask the page
 * to load the account again: a folder's count, its place and its documents all change together.
 */

/** Every folder under `id`, and `id` itself — what a folder shows, and where it cannot be moved. */
export function subtreeOf(folders: Folder[], id: string): Set<string> {
  const ids = new Set([id]);
  let grew = true;

  while (grew) {
    grew = false;

    for (const one of folders) {
      if (one.parent_id && ids.has(one.parent_id) && !ids.has(one.id)) {
        ids.add(one.id);
        grew = true;
      }
    }
  }

  return ids;
}

interface FolderBarProps {
  folders: Folder[];
  /** The folder being looked at; null is "All documents". */
  current: string | null;
  /** How many documents each folder holds, itself and below. */
  counts: Map<string, number>;
  onOpen: (id: string | null) => void;
  /** Something changed on the server: reload folders and documents. */
  onChanged: () => void;
  /** Documents dragged onto a folder here; null is "All documents", out of every folder. */
  onDropDocuments: (ids: string[], folderId: string | null) => void;
}

/** What a drag carries: rows of the history, or one of these folders. */
export const DRAG_DOCUMENTS = 'application/x-tp-documents';
const DRAG_FOLDER = 'application/x-tp-folder';

export function FolderBar({ folders, current, counts, onOpen, onChanged, onDropDocuments }: FolderBarProps) {
  const t = useT();
  const [editing, setEditing] = useState<'new' | 'rename' | null>(null);
  const [name, setName] = useState('');
  const here = folders.find((one) => one.id === current) ?? null;

  const trail = useMemo(() => {
    const path: Folder[] = [];
    let at = here;

    while (at) {
      path.unshift(at);
      at = folders.find((one) => one.id === at!.parent_id) ?? null;
    }

    return path;
  }, [folders, here]);

  const children = folders
    .filter((one) => one.parent_id === current)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const run = async (work: () => Promise<unknown>, done?: string) => {
    try {
      await work();
      if (done) toast.success(done);
      onChanged();
    } catch (cause) {
      toast.error(t('folders.error'), { description: cause instanceof Error ? cause.message : undefined });
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const value = name.trim();

    if (!value) return;

    if (editing === 'new') {
      void run(() => api.createFolder(value, current));
    } else if (editing === 'rename' && here) {
      void run(() => api.updateFolder(here.id, { name: value }));
    }

    setEditing(null);
    setName('');
  };

  const remove = (withContents: boolean) => {
    if (!here) return;

    const count = counts.get(here.id) ?? 0;
    const question = withContents
      ? t('folders.delete.all.confirm', { name: here.name, count })
      : t('folders.delete.keep.confirm', { name: here.name });

    if (!window.confirm(question)) return;

    void run(async () => {
      await api.deleteFolder(here.id, withContents);
      onOpen(here.parent_id);
    }, t('folders.deleted', { name: here.name }));
  };

  const blocked = here ? subtreeOf(folders, here.id) : new Set<string>();
  const [movingFolder, setMovingFolder] = useState(false);
  const [over, setOver] = useState<string | null>(null);

  /*
   * Any folder shown here takes a drop: documents dragged from the list below, or another folder
   * dragged onto it. "All documents" takes documents out of every folder and a folder to the top.
   */
  const dropTarget = (id: string | null) => ({
    onDragOver: (event: DragEvent) => {
      const types = event.dataTransfer.types;

      if (types.includes(DRAG_DOCUMENTS) || types.includes(DRAG_FOLDER)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setOver(id ?? 'top');
      }
    },
    onDragLeave: () => setOver(null),
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      setOver(null);

      const documents = event.dataTransfer.getData(DRAG_DOCUMENTS);
      const folder = event.dataTransfer.getData(DRAG_FOLDER);

      if (documents) {
        try {
          onDropDocuments(JSON.parse(documents) as string[], id);
        } catch {
          // Not ours.
        }
      } else if (folder && folder !== id && !(id && subtreeOf(folders, folder).has(id))) {
        void run(() => api.updateFolder(folder, { parentId: id }));
      }
    },
  });
  const highlight = (id: string | null) => over === (id ?? 'top') && 'ring-2 ring-brand-tertiary rounded-md';
  const [copied, setCopied] = useState(false);
  const link = here?.share_token ? `${location.origin}/f/${here.share_token}` : null;

  const share = (on: boolean) => {
    if (!here) return;

    void run(async () => {
      const token = await api.shareFolder(here.id, on);

      if (token) {
        await navigator.clipboard.writeText(`${location.origin}/f/${token}`).catch(() => undefined);
        toast.success(t('folders.share.on'), { description: `${location.origin}/f/${token}` });
      }
    }, on ? undefined : t('folders.share.off.done'));
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stroke bg-surface-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label={t('folders.trail')} className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => onOpen(null)}
            className={cn('px-1 text-ink-secondary hover:text-ink-primary', highlight(null))}
            {...dropTarget(null)}
          >
            {t('folders.all')}
          </button>
          {trail.map((one) => (
            <span key={one.id} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 text-ink-inactive" />
              <button
                type="button"
                onClick={() => onOpen(one.id)}
                className={cn(
                  'px-1',
                  one.id === current ? 'font-semibold text-ink-primary' : 'text-ink-secondary hover:text-ink-primary',
                  highlight(one.id)
                )}
                {...dropTarget(one.id)}
              >
                {one.name}
              </button>
            </span>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-1">
          <Button variant="tertiary" size="xs" leftSlot={<FolderPlus />} onClick={() => { setEditing('new'); setName(''); }}>
            {t('folders.new')}
          </Button>
          {here && (
            <>
              <Button variant="tertiary" size="xs" leftSlot={<Pencil />} onClick={() => { setEditing('rename'); setName(here.name); }}>
                {t('folders.rename')}
              </Button>
              {/* "Move folder", not "Move": the selection's "Move to" sits just below. */}
              <Button variant="tertiary" size="xs" leftSlot={<FolderInput />} onClick={() => setMovingFolder(true)}>
                {t('folders.move.folder')}
              </Button>
              <MoveDialog
                open={movingFolder}
                onOpenChange={setMovingFolder}
                title={t('move.folder.title', { name: here.name })}
                folders={folders}
                excluded={blocked}
                excludedNote={t('move.excluded', { name: here.name })}
                noneLabel={t('move.top')}
                onCreated={onChanged}
                onMove={(target) => {
                  setMovingFolder(false);
                  if (target !== here.parent_id) void run(() => api.updateFolder(here.id, { parentId: target }));
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="tertiary" size="xs" leftSlot={<Link2 />}>
                    {link ? t('folders.share.shared') : t('folders.share')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {link ? (
                    <>
                      <DropdownMenuItem
                        onSelect={() => {
                          void navigator.clipboard.writeText(link).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                        }}
                      >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        {t('folders.share.copy')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => window.open(link, '_blank', 'noopener')}>
                        <Link2 className="size-4" />
                        {t('folders.share.open')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => share(false)}>{t('folders.share.off')}</DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onSelect={() => share(true)}>{t('folders.share.on.action')}</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="destructiveTertiary" size="xs" leftSlot={<Trash2 />}>
                    {t('folders.delete')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => remove(false)}>{t('folders.delete.keep')}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => remove(true)}>
                    {t('folders.delete.all', { count: counts.get(here.id) ?? 0 })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={submit} className="flex items-center gap-2">
          <Input
            autoFocus
            value={name}
            maxLength={200}
            aria-label={t(editing === 'new' ? 'folders.new' : 'folders.rename')}
            placeholder={t('folders.name')}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && setEditing(null)}
          />
          <Button type="submit" size="sm" variant="primary">
            {t(editing === 'new' ? 'folders.create' : 'folders.save')}
          </Button>
          <Button type="button" size="sm" variant="tertiary" onClick={() => setEditing(null)}>
            {t('folders.cancel')}
          </Button>
        </form>
      )}

      {children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {children.map((one) => (
            <button
              key={one.id}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_FOLDER, one.id);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => onOpen(one.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-stroke bg-surface-page px-2.5 py-1.5 text-sm hover:border-brand-tertiary',
                over === one.id && 'border-brand-tertiary border-dashed bg-surface-accent'
              )}
              {...dropTarget(one.id)}
            >
              <FolderIcon className="size-4 text-brand-tertiary" />
              <span className="max-w-[16rem] truncate">{one.name}</span>
              <span className="text-ink-secondary text-xs">{counts.get(one.id) ?? 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
