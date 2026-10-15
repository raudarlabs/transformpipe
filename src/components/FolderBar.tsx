import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Files,
  Folder as FolderIcon,
  FolderInput,
  FolderOpen,
  FolderPlus,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
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
import { ShareDialog, type ShareClient } from '@/components/ShareDialog';
import { cn } from '@/ui/lib/utils';
import { toast } from '@/ui/components/Toast';

/*
 * The account's folders, the way a file browser shows them: a tree on the left, and over the list
 * the folder being looked at, with what can be done to it.
 *
 * It was a row of chips above the list, which wrapped onto as many lines as there were folders
 * and pushed the list down whenever a name was being typed. The tree keeps one height whatever it
 * holds — it scrolls inside itself — and a new folder is typed into it, where the folder will be.
 * A right click on a folder there offers what the menu over the list does, for that folder.
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
const linkOf = (token: string) => `${location.origin}/f/${token}`;

/** The share dialog, pointed at a folder's endpoints instead of a document's. */
const folderShareClient: ShareClient = {
  get: (id) => api.getFolderShare(id),
  setMode: (id, mode) => api.setFolderShare(id, { mode }),
  setExpiry: (id, mode, expiresAt) => api.setFolderShare(id, { mode, expiresAt }),
  setPassword: (id, mode, password) => api.setFolderShare(id, { mode, password }),
  add: (id, email) => api.addFolderRecipient(id, email),
  remove: (id, email) => api.removeFolderRecipient(id, email),
  url: linkOf,
  notes: { private: 'dialog.share.private.note.folder' },
};

const isShared = (folder: Folder) => Boolean(folder.share_token) && folder.share_mode !== 'private';

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

interface Shared {
  folders: Folder[];
  /** The folder being looked at; null is "All documents". */
  current: string | null;
  /** How many documents each folder holds, itself and below. */
  counts: Map<string, number>;
  onOpen: (id: string | null) => void;
  /** Something changed on the server: reload folders and documents. */
  onChanged: () => void;
  /** Documents dragged onto a folder; null is "All documents", out of every folder. */
  onDropDocuments: (ids: string[], folderId: string | null) => void;
}

/*
 * What can be done to a folder, the same from the menu over the list and from a right click in
 * the tree: rename, move, share by link, delete. Where a name is typed is the caller's — the trail
 * over the list, or the folder's own row — so renaming is handed back to it.
 */
function useFolderActions({ folders, current, counts, onOpen, onChanged }: Shared) {
  const t = useT();
  const run = useRun(onChanged);
  const [moving, setMoving] = useState<Folder | null>(null);

  const rename = (folder: Folder, name: string) => {
    const value = name.trim();

    if (value && value !== folder.name) void run(() => api.updateFolder(folder.id, { name: value }));
  };

  const remove = (folder: Folder, withContents: boolean) => {
    const count = counts.get(folder.id) ?? 0;

    // An empty folder costs nothing to lose; anything else is asked about.
    if (count > 0) {
      const question = withContents
        ? t('folders.delete.all.confirm', { name: folder.name, count })
        : t('folders.delete.keep.confirm', { name: folder.name });

      if (!window.confirm(question)) return;
    }

    const leaving = current !== null && subtreeOf(folders, folder.id).has(current);

    void run(async () => {
      await api.deleteFolder(folder.id, withContents);
      if (leaving) onOpen(folder.parent_id);
    }, t('folders.deleted', { name: folder.name }));
  };

  const [sharing, setSharing] = useState<Folder | null>(null);

  const copy = (folder: Folder) => {
    if (!folder.share_token) return;

    void navigator.clipboard
      .writeText(linkOf(folder.share_token))
      .then(() => toast.success(t('folders.share.copied')))
      .catch(() => undefined);
  };

  /* Closing the share dialog reloads the folders: the tree marks which ones are shared. */
  const shareDialog = (
    <ShareDialog
      documentId={sharing?.id ?? null}
      name={sharing?.name ?? ''}
      open={sharing !== null}
      onOpenChange={(open) => {
        if (!open) {
          setSharing(null);
          onChanged();
        }
      }}
      client={folderShareClient}
    />
  );

  const dialog = moving && (
    <MoveDialog
      open
      onOpenChange={(open) => !open && setMoving(null)}
      title={t('move.folder.title', { name: moving.name })}
      folders={folders}
      excluded={subtreeOf(folders, moving.id)}
      excludedNote={t('move.excluded', { name: moving.name })}
      noneLabel={t('move.top')}
      onCreated={onChanged}
      onMove={(target) => {
        const folder = moving;

        setMoving(null);
        if (target !== folder.parent_id) void run(() => api.updateFolder(folder.id, { parentId: target }));
      }}
    />
  );

  return { run, rename, remove, copy, share: setSharing, move: setMoving, dialog: <>{dialog}{shareDialog}</> };
}

/** A menu's items for one folder. `onRename` and `onNewInside` are where the name gets typed. */
function FolderMenuItems({
  folder,
  count,
  actions,
  onRename,
  onNewInside,
}: {
  folder: Folder;
  count: number;
  actions: ReturnType<typeof useFolderActions>;
  onRename: () => void;
  onNewInside?: () => void;
}) {
  const t = useT();

  return (
    <>
      {onNewInside && (
        <DropdownMenuItem onSelect={onNewInside}>
          <FolderPlus className="size-4" />
          {t('move.new.inside')}
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onSelect={onRename}>
        <Pencil className="size-4" />
        {t('folders.rename')}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => actions.move(folder)}>
        <FolderInput className="size-4" />
        {t('folders.move.folder')}
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => actions.share(folder)}>
        {folder.share_mode === 'people' ? <Users className="size-4" /> : <Link2 className="size-4" />}
        {t('folders.share.dialog')}
      </DropdownMenuItem>
      {isShared(folder) && (
        <>
          <DropdownMenuItem onSelect={() => actions.copy(folder)}>
            <Copy className="size-4" />
            {t('folders.share.copy')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => window.open(linkOf(folder.share_token!), '_blank', 'noopener')}>
            <ExternalLink className="size-4" />
            {t('folders.share.open')}
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator />
      {count === 0 ? (
        <DropdownMenuItem className="text-ink-danger" onSelect={() => actions.remove(folder, false)}>
          <Trash2 className="size-4" />
          {t('folders.delete.empty')}
        </DropdownMenuItem>
      ) : (
        <>
          <DropdownMenuItem className="text-ink-danger" onSelect={() => actions.remove(folder, false)}>
            <Trash2 className="size-4" />
            {t('folders.delete.keep')}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-ink-danger" onSelect={() => actions.remove(folder, true)}>
            <Trash2 className="size-4" />
            {t('folders.delete.all', { count })}
          </DropdownMenuItem>
        </>
      )}
    </>
  );
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

/**
 * A name being typed in a row: Enter or the tick keeps it, Escape or the cross drops it, and
 * clicking away keeps it, as in a file browser.
 */
function NameField({ initial, onDone }: { initial: string; onDone: (name: string | null) => void }) {
  const t = useT();
  const [value, setValue] = useState(initial);
  const done = useRef(false);

  const finish = (keep: boolean) => {
    if (done.current) return;
    done.current = true;
    onDone(keep ? value : null);
  };

  return (
    <>
      <input
        autoFocus
        value={value}
        maxLength={200}
        aria-label={t('folders.name')}
        placeholder={t('folders.name')}
        className="min-w-0 flex-1 rounded border border-brand-tertiary bg-surface-page px-1.5 py-0.5 text-ink-primary text-sm outline-none"
        onChange={(event) => setValue(event.target.value)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') finish(true);
          if (event.key === 'Escape') finish(false);
        }}
        onBlur={() => finish(true)}
      />
      {/* The buttons keep the field focused while pressed, so its blur does not decide for them. */}
      <IconButton
        variant="primaryTertiary"
        size="2xs"
        aria-label={t('folders.save')}
        title={`${t('folders.save')} (Enter)`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => finish(true)}
      >
        <Check />
      </IconButton>
      <IconButton
        variant="tertiary"
        size="2xs"
        aria-label={t('folders.cancel')}
        title={`${t('folders.cancel')} (Esc)`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => finish(false)}
      >
        <X />
      </IconButton>
    </>
  );
}

export function FolderTree(props: Shared & { /** Every document of the account. */ total: number }) {
  const { folders, current, counts, total, onOpen, onDropDocuments } = props;
  const t = useT();
  const actions = useFolderActions(props);
  const [open, setOpen] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(OPEN_KEY) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });
  /** Where a new folder is being named: a folder's id, 'top', or nothing. */
  const [creating, setCreating] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  /** A right click: which folder ('top' for "All documents") and where the pointer was. */
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
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

  const { over, target } = useDrop(folders, onDropDocuments, actions.run, (id) => {
    if (!open.has(id)) remember(new Set([...open, id]));
  });

  const startCreating = (parent: string | null) => {
    setCreating(parent ?? 'top');
    setShown(true);
    if (parent && !open.has(parent)) remember(new Set([...open, parent]));
  };

  const finishCreating = (name: string | null) => {
    const parent = creating === 'top' ? null : creating;

    setCreating(null);
    if (name?.trim()) void actions.run(() => api.createFolder(name.trim(), parent));
  };

  const contextMenu = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setMenu({ id, x: event.clientX, y: event.clientY });
  };

  const indent = (depth: number) => ({ paddingLeft: `${0.5 + depth * 1}rem` });

  const branch = (parent: string | null, depth: number): ReactNode => {
    const children = folders.filter((one) => one.parent_id === parent).sort(byName);

    return (
      <ul role={parent ? 'group' : undefined}>
        {creating === (parent ?? 'top') && (
          <li>
            <div className="flex items-center gap-1.5 py-1 pr-2" style={indent(depth)}>
              <span className="size-4 shrink-0" />
              <FolderPlus className="size-4 shrink-0 text-brand-tertiary" />
              <NameField initial="" onDone={finishCreating} />
            </div>
          </li>
        )}
        {children.map((one) => {
          const hasChildren = folders.some((child) => child.parent_id === one.id) || creating === one.id;
          const isOpen = open.has(one.id);
          const isHere = one.id === current;
          const Icon = isHere ? FolderOpen : FolderIcon;

          return (
            <li key={one.id} role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={isHere}>
              <div
                draggable={renaming !== one.id}
                onDragStart={(event) => {
                  event.dataTransfer.setData(DRAG_FOLDER, one.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onContextMenu={contextMenu(one.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm',
                  isHere ? 'bg-surface-accent font-medium text-ink-primary' : 'text-ink-body hover:bg-surface-chips',
                  (over(one.id) || menu?.id === one.id) && 'ring-2 ring-brand-tertiary ring-inset'
                )}
                style={indent(depth)}
                {...target(one.id)}
              >
                <button
                  type="button"
                  aria-label={isOpen ? t('move.collapse') : t('move.expand')}
                  className={cn(
                    'shrink-0 rounded text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-tertiary',
                    !hasChildren && 'invisible'
                  )}
                  onClick={() => toggle(one.id)}
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                {renaming === one.id ? (
                  <>
                    <Icon className="size-4 shrink-0 text-brand-tertiary" />
                    <NameField
                      initial={one.name}
                      onDone={(name) => {
                        setRenaming(null);
                        if (name !== null) actions.rename(one, name);
                      }}
                    />
                  </>
                ) : (
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    title={one.name}
                    onClick={() => {
                      onOpen(one.id);
                      setShown(false);
                    }}
                  >
                    <Icon className="size-4 shrink-0 text-brand-tertiary" />
                    <span className="truncate">{one.name}</span>
                    {isShared(one) &&
                      (one.share_mode === 'people' ? (
                        <Users className="size-3.5 shrink-0 text-brand-tertiary" aria-label={t('folders.share.people')} />
                      ) : (
                        <Link2 className="size-3.5 shrink-0 text-brand-tertiary" aria-label={t('folders.share.shared')} />
                      ))}
                    <span className="ml-auto pl-1 text-ink-secondary text-xs">{counts.get(one.id) ?? 0}</span>
                  </button>
                )}
              </div>
              {isOpen && hasChildren && branch(one.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  const menuFolder = menu && menu.id !== 'top' ? folders.find((one) => one.id === menu.id) : null;

  return (
    <nav
      aria-label={t('folders.trail')}
      className="flex flex-col rounded-xl border border-stroke bg-surface-card lg:sticky lg:top-16 lg:max-h-[min(32rem,calc(100vh-5rem))]"
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
          onClick={() => startCreating(current)}
        >
          <FolderPlus />
        </IconButton>
      </div>

      {/*
        * Never taller than 32rem, nor than the screen: past that it scrolls inside, so 5 folders
        * or 500 leave the page the same length.
        */}
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
          onContextMenu={contextMenu('top')}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-md py-1 pr-2 pl-2 text-left text-sm',
            current === null ? 'bg-surface-accent font-medium text-ink-primary' : 'text-ink-body hover:bg-surface-chips',
            (over(null) || menu?.id === 'top') && 'ring-2 ring-brand-tertiary ring-inset'
          )}
          {...target(null)}
        >
          <Files className="size-4 shrink-0 text-ink-secondary" />
          <span className="truncate">{t('folders.all')}</span>
          <span className="ml-auto pl-1 text-ink-secondary text-xs">{total}</span>
        </button>
        {branch(null, 0)}
      </div>

      {/* The right-click menu opens where the pointer was, from a trigger with no size of its own. */}
      {/*
        * Not modal: a modal menu holds focus while it fades out, and the name field it just opened
        * would never get it.
        */}
      <DropdownMenu modal={false} open={menu !== null} onOpenChange={(isOpen) => !isOpen && setMenu(null)}>
        <DropdownMenuTrigger asChild>
          <span aria-hidden className="pointer-events-none fixed size-0" style={{ left: menu?.x ?? 0, top: menu?.y ?? 0 }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64" onCloseAutoFocus={(event) => event.preventDefault()}>
          {menuFolder ? (
            <FolderMenuItems
              folder={menuFolder}
              count={counts.get(menuFolder.id) ?? 0}
              actions={actions}
              onRename={() => setRenaming(menuFolder.id)}
              onNewInside={() => startCreating(menuFolder.id)}
            />
          ) : (
            <DropdownMenuItem onSelect={() => startCreating(null)}>
              <FolderPlus className="size-4" />
              {t('folders.new')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {actions.dialog}
    </nav>
  );
}

/** Over the list: where you are, as links back up, and what can be done to the folder. */
export function FolderHeader(props: Shared) {
  const { folders, current, counts, onOpen, onDropDocuments } = props;
  const t = useT();
  const actions = useFolderActions(props);
  const { over, target } = useDrop(folders, onDropDocuments, actions.run);
  const here = folders.find((one) => one.id === current) ?? null;
  const [renaming, setRenaming] = useState(false);

  const trail = useMemo(
    () => ancestorsOf(folders, current).reverse().map((id) => folders.find((one) => one.id === id)!),
    [folders, current]
  );

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
            {one.id === current && renaming ? (
              <span className="flex min-w-[16rem] items-center gap-1">
                <NameField
                  initial={one.name}
                  onDone={(name) => {
                    setRenaming(false);
                    if (name !== null) actions.rename(one, name);
                  }}
                />
              </span>
            ) : (
              crumb(one.id, one.name, one.id === current)
            )}
          </span>
        ))}
      </div>

      {here && (
        <div className="flex items-center gap-1">
          {/* Sharing is the one thing worth a button of its own: whether it is shared is news. */}
          <Button
            variant="tertiary"
            size="xs"
            leftSlot={here.share_mode === 'people' && isShared(here) ? <Users /> : <Link2 />}
            onClick={() => actions.share(here)}
          >
            {isShared(here)
              ? t(here.share_mode === 'people' ? 'folders.share.people' : 'folders.share.shared')
              : t('folders.share')}
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton variant="tertiary" size="xs" aria-label={t('folders.actions')}>
                <MoreHorizontal />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64" onCloseAutoFocus={(event) => event.preventDefault()}>
              <FolderMenuItems
                folder={here}
                count={counts.get(here.id) ?? 0}
                actions={actions}
                onRename={() => setRenaming(true)}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {actions.dialog}
        </div>
      )}
    </div>
  );
}
