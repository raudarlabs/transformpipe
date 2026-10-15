import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Files,
  Folder as FolderIcon,
  FolderInput,
  FolderOpen,
  FolderPlus,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { api, type Folder } from '@/lib/api';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { IconButton } from '@/ui/components/IconButton';
import { MoveDialog } from '@/components/MoveDialog';
import { cn } from '@/ui/lib/utils';
import { toast } from '@/ui/components/Toast';

/*
 * The account's folders, the way a file browser shows them: a tree on the left, and over the list
 * the folder being looked at, with what can be done to it.
 *
 * It was a row of chips above the list, which wrapped onto as many lines as there were folders
 * and pushed the list down whenever a name was being typed. The tree keeps one height whatever it
 * holds — it scrolls inside itself — and a new folder is typed into it, where the folder will be.
 *
 * "All documents" is every document, filed or not, which is what this page always was, and a
 * folder shows everything in it and below it, so an import of six hundred pages is one click from
 * all six hundred. Making, renaming, moving and deleting ask the page to load the account again:
 * a folder's count, its place and its documents all change together.
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

/** What a drag carries: rows of the history, or one of these folders. */
export const DRAG_DOCUMENTS = 'application/x-tp-documents';
const DRAG_FOLDER = 'application/x-tp-folder';

const OPEN_KEY = 'tp.openFolders';
const byName = (a: Folder, b: Folder) => a.name.localeCompare(b.name, undefined, { numeric: true });

function ancestorsOf(folders: Folder[], id: string | null): string[] {
  const ids: string[] = [];
  let at = folders.find((one) => one.id === id);

  while (at) {
    ids.push(at.id);
    at = folders.find((one) => one.id === at!.parent_id);
  }

  return ids;
}

/** Saying what went wrong, and reloading what changed when it did not. */
function useRun(onChanged: () => void) {
  const t = useT();

  return async (work: () => Promise<unknown>, done?: string) => {
    try {
      await work();
      if (done) toast.success(done);
      onChanged();
    } catch (cause) {
      toast.error(t('folders.error'), { description: cause instanceof Error ? cause.message : undefined });
    }
  };
}

/*
 * Any folder shown takes a drop: documents dragged from the list, or another folder. "All
 * documents" takes documents out of every folder, and a folder to the top.
 */
function useDrop(
  folders: Folder[],
  onDropDocuments: (ids: string[], folderId: string | null) => void,
  run: ReturnType<typeof useRun>,
  /** Called while something hovers a folder for a moment: a closed folder opens, as in Finder. */
  onLinger?: (id: string) => void
) {
  const [over, setOver] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const target = (id: string | null) => ({
    onDragOver: (event: DragEvent) => {
      const types = event.dataTransfer.types;

      if (!types.includes(DRAG_DOCUMENTS) && !types.includes(DRAG_FOLDER)) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const key = id ?? 'top';

      if (over !== key) {
        setOver(key);
        clearTimeout(timer.current);
        if (id && onLinger) timer.current = setTimeout(() => onLinger(id), 700);
      }
    },
    onDragLeave: () => {
      clearTimeout(timer.current);
      setOver(null);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      clearTimeout(timer.current);
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

  return { over: (id: string | null) => over === (id ?? 'top'), target };
}

interface FolderTreeProps {
  folders: Folder[];
  /** The folder being looked at; null is "All documents". */
  current: string | null;
  /** How many documents each folder holds, itself and below. */
  counts: Map<string, number>;
  /** Every document of the account, for "All documents". */
  total: number;
  onOpen: (id: string | null) => void;
  /** Something changed on the server: reload folders and documents. */
  onChanged: () => void;
  /** Documents dragged onto a folder; null is "All documents", out of every folder. */
  onDropDocuments: (ids: string[], folderId: string | null) => void;
}

export function FolderTree({ folders, current, counts, total, onOpen, onChanged, onDropDocuments }: FolderTreeProps) {
  const t = useT();
  const run = useRun(onChanged);
  const [open, setOpen] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(OPEN_KEY) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });
  /** Where a new folder is being named: a folder's id, 'top', or nothing. */
  const [creating, setCreating] = useState<string | null>(null);
  const [name, setName] = useState('');
  /* On a phone the tree folds away under one line; on a wide screen it is always there. */
  const [shown, setShown] = useState(false);
  const here = folders.find((one) => one.id === current) ?? null;

  const remember = (next: Set<string>) => {
    setOpen(next);
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify([...next]));
    } catch {
      // Remembering what was open is a convenience.
    }
  };

  /* The folder being looked at is always visible in the tree, whoever opened it and from where. */
  useEffect(() => {
    const path = ancestorsOf(folders, current).slice(1);

    if (path.some((id) => !open.has(id))) remember(new Set([...open, ...path]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, folders]);

  const toggle = (id: string) => {
    const next = new Set(open);

    if (next.has(id)) next.delete(id);
    else next.add(id);
    remember(next);
  };

  const { over, target } = useDrop(folders, onDropDocuments, run, (id) => {
    if (!open.has(id)) remember(new Set([...open, id]));
  });

  const startCreating = () => {
    setName('');
    setCreating(current ?? 'top');
    setShown(true);
    if (current && !open.has(current)) remember(new Set([...open, current]));
  };

  const finishCreating = (keep: boolean) => {
    const value = name.trim();
    const parent = creating === 'top' ? null : creating;

    setCreating(null);
    setName('');
    if (keep && value) void run(() => api.createFolder(value, parent));
  };

  const newRow = (depth: number) => (
    <li>
      <div className="flex items-center gap-1.5 py-1 pr-2" style={{ paddingLeft: `${0.5 + depth * 1}rem` }}>
        <span className="size-4 shrink-0" />
        <FolderPlus className="size-4 shrink-0 text-brand-tertiary" />
        <input
          autoFocus
          value={name}
          maxLength={200}
          aria-label={t('folders.name')}
          placeholder={t('folders.name')}
          className="min-w-0 flex-1 rounded border border-brand-tertiary bg-surface-page px-1.5 py-0.5 text-ink-primary text-sm outline-none"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') finishCreating(true);
            if (event.key === 'Escape') finishCreating(false);
          }}
          onBlur={() => finishCreating(true)}
        />
        {/*
          * Enter alone was the only way to finish, which nobody is told. The buttons keep the
          * field focused while pressed, so the blur above does not decide for them first.
          */}
        <IconButton
          variant="primaryTertiary"
          size="2xs"
          aria-label={t('folders.create')}
          title={`${t('folders.create')} (Enter)`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => finishCreating(true)}
        >
          <Check />
        </IconButton>
        <IconButton
          variant="tertiary"
          size="2xs"
          aria-label={t('folders.cancel')}
          title={`${t('folders.cancel')} (Esc)`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => finishCreating(false)}
        >
          <X />
        </IconButton>
      </div>
    </li>
  );

  const branch = (parent: string | null, depth: number): ReactNode => {
    const children = folders.filter((one) => one.parent_id === parent).sort(byName);

    return (
      <ul role={parent ? 'group' : undefined}>
        {creating === (parent ?? 'top') && newRow(depth)}
        {children.map((one) => {
          const hasChildren = folders.some((child) => child.parent_id === one.id) || creating === one.id;
          const isOpen = open.has(one.id);
          const isHere = one.id === current;

          return (
            <li key={one.id} role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={isHere}>
              <div
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(DRAG_FOLDER, one.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm',
                  isHere ? 'bg-surface-accent font-medium text-ink-primary' : 'text-ink-body hover:bg-surface-chips',
                  over(one.id) && 'ring-2 ring-brand-tertiary ring-inset'
                )}
                style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
                {...target(one.id)}
              >
                <button
                  type="button"
                  aria-label={isOpen ? t('move.collapse') : t('move.expand')}
                  className={cn('shrink-0 text-ink-secondary', !hasChildren && 'invisible')}
                  onClick={() => toggle(one.id)}
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                  title={one.name}
                  onClick={() => {
                    onOpen(one.id);
                    setShown(false);
                  }}
                >
                  {isHere ? (
                    <FolderOpen className="size-4 shrink-0 text-brand-tertiary" />
                  ) : (
                    <FolderIcon className="size-4 shrink-0 text-brand-tertiary" />
                  )}
                  <span className="truncate">{one.name}</span>
                  <span className="ml-auto pl-1 text-ink-secondary text-xs">{counts.get(one.id) ?? 0}</span>
                </button>
              </div>
              {isOpen && hasChildren && branch(one.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <nav
      aria-label={t('folders.trail')}
      className="flex flex-col rounded-xl border border-stroke bg-surface-card lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)]"
    >
      <div className="flex items-center gap-1 border-stroke border-b px-2 py-1.5">
        <button
          type="button"
          aria-expanded={shown}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-ink-secondary text-xs lg:pointer-events-none"
          onClick={() => setShown(!shown)}
        >
          <ChevronDown className={cn('size-4 shrink-0 transition-transform lg:hidden', !shown && '-rotate-90')} />
          <span className="font-semibold uppercase tracking-wide">{t('folders.trail')}</span>
          {/* Folded on a phone, the line still says where you are. */}
          <span className="truncate normal-case lg:hidden">· {here?.name ?? t('folders.all')}</span>
        </button>
        <IconButton
          variant="tertiary"
          size="xs"
          aria-label={t('folders.new')}
          title={here ? `${t('move.new.inside')} “${here.name}”` : t('folders.new')}
          onClick={startCreating}
        >
          <FolderPlus />
        </IconButton>
      </div>

      {/* One height whatever it holds: 5 folders or 500, the list below stays where it is. */}
      <div
        role="tree"
        className={cn('min-h-0 flex-1 overflow-auto p-1.5 max-lg:max-h-72', !shown && 'max-lg:hidden')}
      >
        <button
          type="button"
          onClick={() => {
            onOpen(null);
            setShown(false);
          }}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-md py-1 pr-2 pl-2 text-left text-sm',
            current === null ? 'bg-surface-accent font-medium text-ink-primary' : 'text-ink-body hover:bg-surface-chips',
            over(null) && 'ring-2 ring-brand-tertiary ring-inset'
          )}
          {...target(null)}
        >
          <Files className="size-4 shrink-0 text-ink-secondary" />
          <span className="truncate">{t('folders.all')}</span>
          <span className="ml-auto pl-1 text-ink-secondary text-xs">{total}</span>
        </button>
        {branch(null, 0)}
      </div>
    </nav>
  );
}

interface FolderHeaderProps {
  folders: Folder[];
  current: string | null;
  counts: Map<string, number>;
  onOpen: (id: string | null) => void;
  onChanged: () => void;
  onDropDocuments: (ids: string[], folderId: string | null) => void;
}

/** Over the list: where you are, as links back up, and what can be done to the folder. */
export function FolderHeader({ folders, current, counts, onOpen, onChanged, onDropDocuments }: FolderHeaderProps) {
  const t = useT();
  const run = useRun(onChanged);
  const { over, target } = useDrop(folders, onDropDocuments, run);
  const here = folders.find((one) => one.id === current) ?? null;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [copied, setCopied] = useState(false);

  const trail = useMemo(
    () => ancestorsOf(folders, current).reverse().map((id) => folders.find((one) => one.id === id)!),
    [folders, current]
  );

  const finishRenaming = (keep: boolean) => {
    const value = renaming?.trim();

    setRenaming(null);
    if (keep && here && value && value !== here.name) void run(() => api.updateFolder(here.id, { name: value }));
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

  const crumb = (id: string | null, label: string, last: boolean) => (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className={cn(
        'truncate rounded px-1',
        last ? 'font-semibold text-ink-primary' : 'text-ink-secondary hover:text-ink-primary',
        over(id) && 'ring-2 ring-brand-tertiary'
      )}
      {...target(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {crumb(null, t('folders.all'), here === null)}
        {trail.map((one) => (
          <span key={one.id} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-3.5 shrink-0 text-ink-inactive" />
            {/* Renamed where the name is, on the same line: nothing below moves. */}
            {one.id === current && renaming !== null ? (
              <input
                autoFocus
                value={renaming}
                maxLength={200}
                aria-label={t('folders.rename')}
                className="h-7 min-w-0 rounded border border-brand-tertiary bg-surface-page px-1.5 font-semibold text-ink-primary text-sm outline-none"
                onChange={(event) => setRenaming(event.target.value)}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') finishRenaming(true);
                  if (event.key === 'Escape') finishRenaming(false);
                }}
                onBlur={() => finishRenaming(true)}
              />
            ) : (
              crumb(one.id, one.name, one.id === current)
            )}
          </span>
        ))}
      </div>

      {here && (
        <div className="flex items-center gap-1">
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
              <IconButton variant="tertiary" size="xs" aria-label={t('folders.actions')}>
                <MoreHorizontal />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setRenaming(here.name)}>
                <Pencil className="size-4" />
                {t('folders.rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setMoving(true)}>
                <FolderInput className="size-4" />
                {t('folders.move.folder')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-ink-danger" onSelect={() => remove(false)}>
                <Trash2 className="size-4" />
                {t('folders.delete.keep')}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-ink-danger" onSelect={() => remove(true)}>
                <Trash2 className="size-4" />
                {t('folders.delete.all', { count: counts.get(here.id) ?? 0 })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <MoveDialog
            open={moving}
            onOpenChange={setMoving}
            title={t('move.folder.title', { name: here.name })}
            folders={folders}
            excluded={subtreeOf(folders, here.id)}
            excludedNote={t('move.excluded', { name: here.name })}
            noneLabel={t('move.top')}
            onCreated={onChanged}
            onMove={(target) => {
              setMoving(false);
              if (target !== here.parent_id) void run(() => api.updateFolder(here.id, { parentId: target }));
            }}
          />
        </div>
      )}
    </div>
  );
}
