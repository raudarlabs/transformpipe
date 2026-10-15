import {
  Cloud,
  Combine,
  Download,
  FileText,
  GitCompare,
  MonitorSmartphone,
  Search,
  Share2,
  Users,
  Trash2,
  Upload,
  X,
  FolderInput,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hint } from '@/components/Hint';
import { FilterChips } from '@/components/FilterChips';
import { DRAG_DOCUMENTS, FolderBar, subtreeOf } from '@/components/FolderBar';
import { MoveDialog, pathOf } from '@/components/MoveDialog';
import { recentFolders, rememberFolder } from '@/lib/recent-folders';
import { ListSelectionBar } from '@/components/ListSelectionBar';
import { ShareDialog } from '@/components/ShareDialog';
import { VersionsDialog } from '@/components/VersionsDialog';
import {
  ALL_EXTENSIONS,
  CONVERSIONS,
  type ConversionId,
} from '@shared/conversions';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import {
  type DocFormat,
  FORMAT_LABELS,
  formatBytes,
  formatDateTime,
  formatRelative,
  toFileName,
} from '@/lib/format';
import { api, type Folder, type Usage } from '@/lib/api';
import { toast } from '@/ui/components/Toast';
import { readRoute, replaceFilter } from '@/lib/route';
import type { HistoryEntry } from '@/lib/history';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { Checkbox } from '@/ui/components/Checkbox';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/ui/components/InputGroup';
import { IconButton } from '@/ui/components/IconButton';
import { StatusView } from '@/ui/components/StatusView';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/Table';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

/** The order they are offered in: the document, the page it makes, then the words alone. */
const FORMATS: DocFormat[] = ['md', 'obsidian', 'html', 'txt', 'docx', 'confluence', 'jira', 'slack', 'epub'];

interface RowPartProps {
  entry: HistoryEntry;
  isShared: boolean;
}

/** What made this document. The name cannot say whether it came from a page, a Word file or a CSV. */
function KindBadge({ entry, isShared, className }: RowPartProps & { className?: string }) {
  const t = useT();
  const { content } = useI18n();

  if (isShared) {
    return (
      <span className="truncate text-ink-secondary">
        {entry.sharedBy || t('history.row.someone')}
      </span>
    );
  }

  return (
    <Badge
      variant={entry.kind === 'markdown-to-html' ? 'primary' : 'secondary'}
      size="sm"
      rounded="full"
      className={cn('justify-center', className)}
    >
      {content.conversions[entry.kind].short}
    </Badge>
  );
}

/**
 * Said on a row rather than on the page, now that a signed-in list holds both kinds.
 *
 * A conversion stays in this browser until somebody saves it, so a list that looked uniform would
 * be claiming that twenty-five things are in the account when one of them is. Shown only when
 * there is an account to compare against: signed out, every row is local and the page says so once
 * at the top.
 */
function UnsavedBadge({ entry, isSynced }: { entry: HistoryEntry; isSynced: boolean }) {
  const t = useT();

  if (!isSynced || entry.remote) {
    return null;
  }

  return (
    <Badge variant="attention" size="sm" rounded="full" className="justify-center">
      {t('history.row.unsaved')}
    </Badge>
  );
}

/**
 * Share, download in any format, remove.
 *
 * One component because the same three appear in a table row on a wide screen and in a card on a
 * phone, and three buttons that behave differently depending on which layout you happen to be
 * looking at is a bug waiting for somebody to change one of the two.
 */
function RowActions({
  entry,
  isShared,
  isReopenable,
  hasVersions,
  onShare,
  onVersions,
  onDownload,
  onRemove,
}: RowPartProps & {
  isReopenable: boolean;
  hasVersions: boolean;
  onShare: (entry: HistoryEntry) => void;
  onVersions: (entry: HistoryEntry) => void;
  onDownload: (entry: HistoryEntry, format: DocFormat) => void;
  onRemove: (id: string) => void;
}) {
  const t = useT();

  return (
    <span className="flex items-center justify-end gap-1">
      {entry.remote && hasVersions && (
        <Hint content={t('history.row.versions')}>
          <IconButton
            variant="tertiary"
            size="sm"
            aria-label={t('history.row.versions.label', { name: entry.name })}
            onClick={() => onVersions(entry)}
          >
            <GitCompare />
          </IconButton>
        </Hint>
      )}

      {entry.remote && !isShared && (
        <Hint content={t('history.row.share')}>
          <IconButton
            variant="tertiary"
            size="sm"
            aria-label={t('history.row.share.label', { name: entry.name })}
            onClick={() => onShare(entry)}
          >
            <Share2 />
          </IconButton>
        </Hint>
      )}

      {/*
        * A menu rather than one button: the chips used to decide what a download handed over, and
        * now that they say what a document came from, the row has to offer the choice itself.
        */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!isReopenable}>
          <IconButton
            variant="tertiary"
            size="sm"
            aria-label={t('history.row.download.label', { name: entry.name })}
            disabled={!isReopenable}
          >
            <Download />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {FORMATS.map((one) => (
            <DropdownMenuItem key={one} onSelect={() => onDownload(entry, one)}>
              {toFileName(entry.name, one)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {!isShared && (
        <Hint content={t('history.row.remove')}>
          <span>
            <IconButton
              variant="destructiveTertiary"
              size="sm"
              aria-label={t('history.row.remove')}
              onClick={() => onRemove(entry.id)}
            >
              <Trash2 />
            </IconButton>
          </span>
        </Hint>
      )}
    </span>
  );
}

interface HistoryPageProps {
  entries: HistoryEntry[];
  /** True when the list comes from the signed-in account rather than this browser. */
  isSynced: boolean;
  onOpen: (entry: HistoryEntry) => void;
  /** Same handler the dropzone uses, so a new document can start from this page. */
  onFiles: (files: File[]) => void;
  onDownload: (entry: HistoryEntry, format: DocFormat) => void;
  onDownloadMany: (entries: HistoryEntry[], format: DocFormat) => void;
  onMerge: (entries: HistoryEntry[]) => void;
  onRemove: (id: string) => void;
  onRemoveMany: (ids: string[]) => void;
  onClear: () => void;
  onGoToConverter: () => void;
  /** The account's documents changed on the server — a folder moved, documents were moved into one. */
  onRefresh: () => void;
  /** The folder to open on, when the page was reached from somewhere that just made one. */
  initialFolder?: string | null;
}

type SortKey = 'name' | 'size' | 'words' | 'createdAt';

export function HistoryPage({
  entries,
  isSynced,
  onOpen,
  onFiles,
  onDownload,
  onDownloadMany,
  onMerge,
  onRemove,
  onRemoveMany,
  onClear,
  onGoToConverter,
  onRefresh,
  initialFolder = null,
}: HistoryPageProps) {
  const t = useT();
  const { content, locale } = useI18n();
  /* The tag `Intl` wants, which is not the tag in the address — see `INTL_LOCALES`. */
  const numbers = INTL_LOCALES[locale];
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  /**
   * Ids the server found by content rather than by name — null means "no search in flight",
   * distinct from an empty set, which means "searched, nothing matched by content".
   *
   * Only the account's own documents are covered: content search is a database query, so a
   * conversion that has not been saved yet is invisible to it and still only matches by name.
   */
  const [contentMatches, setContentMatches] = useState<Set<string> | null>(null);
  /**
   * One row of chips: everything, one conversion, or somebody else's files.
   *
   * Everything is the default, because a list that opens filtered is a list somebody has to notice
   * is filtered — and the reason to come here is usually "where is that file", not "show me the
   * ones that came from Word". It lives in the address too, so a refresh keeps the same view.
   */
  const [chip, setChip] = useState<'all' | ConversionId | 'shared'>(() => {
    const filter = readRoute().filter ?? '';

    if (filter === 'shared') {
      return 'shared';
    }

    return CONVERSIONS.some((one) => one.id === filter)
      ? (filter as ConversionId)
      : 'all';
  });
  const [shared, setShared] = useState<HistoryEntry[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  const isShared = chip === 'shared';
  const filePicker = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sharing, setSharing] = useState<HistoryEntry | null>(null);
  const [viewingVersionsOf, setViewingVersionsOf] = useState<HistoryEntry | null>(
    null
  );

  /**
   * Every id worth showing the versions button on: it `replaces` something, or something in this
   * same list `replaces` it. Computed from the list already in hand — no extra request to ask a
   * question the list already answers.
   */
  const hasVersions = useMemo(() => {
    const ids = new Set<string>();

    for (const entry of entries) {
      if (entry.replaces) {
        ids.add(entry.replaces);
        ids.add(entry.id);
      }
    }

    return ids;
  }, [entries]);
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const loadShared = useCallback(() => {
    setIsLoadingShared(true);

    api
      .listSharedWithMe()
      .then(setShared)
      .catch(() => setShared([]))
      .finally(() => setIsLoadingShared(false));
  }, []);

  /*
   * Loaded up front, not only when the chip is picked: an account whose own history is empty must
   * still be told that something was shared with it, and the empty state is decided before any
   * chip is touched.
   */
  useEffect(() => {
    if (isSynced) {
      loadShared();
    } else {
      setShared([]);
    }
  }, [isSynced, loadShared]);

  // What is left of the account's allowance — the number people want before they hit the wall.
  useEffect(() => {
    if (!isSynced) {
      setUsage(null);
      return;
    }

    api
      .usage()
      .then(setUsage)
      .catch(() => setUsage(null));
  }, [isSynced, entries.length]);

  // A row that has gone — deleted here or on another device — must not stay selected.
  useEffect(() => {
    setSelected((current) =>
      current.filter((id) => entries.some((entry) => entry.id === id))
    );
  }, [entries]);

  /*
   * Chips for the conversions that actually produced something, and only when there is more than
   * one of them: an account with nothing but Markdown does not need to be offered a filter that
   * selects all of it.
   */

  /*
   * Folders, for an account: the one being looked at, and how much each holds. The top shows every
   * document, filed or not; a folder shows what is in it and in everything under it.
   */
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folder, setFolder] = useState<string | null>(initialFolder);

  const loadFolders = useCallback(() => {
    api.listFolders().then(setFolders).catch(() => setFolders([]));
  }, []);

  useEffect(() => {
    if (isSynced) loadFolders();
  }, [isSynced, loadFolders]);

  const subtrees = useMemo(
    () => new Map(folders.map((one) => [one.id, subtreeOf(folders, one.id)])),
    [folders]
  );
  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const [id, tree] of subtrees) {
      counts.set(id, entries.filter((entry) => entry.folderId && tree.has(entry.folderId)).length);
    }

    return counts;
  }, [subtrees, entries]);

  const inFolder = useMemo(
    () =>
      folder === null
        ? entries
        : entries.filter((entry) => entry.folderId && subtrees.get(folder)?.has(entry.folderId)),
    [entries, folder, subtrees]
  );

  /* The chips and the count say what is in the folder being looked at, not in the whole account. */
  const kinds = useMemo(() => {
    const counted = new Map<string, number>();

    for (const entry of inFolder) {
      counted.set(entry.kind, (counted.get(entry.kind) ?? 0) + 1);
    }

    return CONVERSIONS.filter((one) => counted.has(one.id)).map((one) => ({
      value: one.id,
      label: content.conversions[one.id].label,
      count: counted.get(one.id) ?? 0,
    }));
  }, [inFolder, content]);

  const source = isShared
    ? shared
    : chip === 'all'
      ? inFolder
      : inFolder.filter((entry) => entry.kind === chip);

  const [choosing, setChoosing] = useState(false);

  /* Documents into a folder, from the menu, the dialog or a drop; the folder joins the recent ones. */
  const moveDocuments = async (ids: string[], target: string | null) => {
    try {
      await api.moveDocuments(ids, target);
      rememberFolder(target);
      setSelected([]);
      onRefresh();
      loadFolders();
    } catch (cause) {
      toast.error(t('folders.error'), { description: cause instanceof Error ? cause.message : undefined });
    }
  };

  /* A row of the account's own can be dragged onto a folder: itself, or every selected row with it. */
  const dragRow = (entry: HistoryEntry) =>
    isSynced && !isShared && entry.remote
      ? {
          draggable: true,
          onDragStart: (event: React.DragEvent) => {
            const ids = selected.includes(entry.id) ? selected : [entry.id];

            event.dataTransfer.setData(DRAG_DOCUMENTS, JSON.stringify(ids));
            event.dataTransfer.effectAllowed = 'move';
          },
        }
      : {};

  const moveSelected = async (target: string | null) => {
    try {
      await api.moveDocuments(selected, target);
      rememberFolder(target);
      setSelected([]);
      onRefresh();
      loadFolders();
    } catch (cause) {
      toast.error(t('folders.error'), { description: cause instanceof Error ? cause.message : undefined });
    }
  };

  // Debounced: a keystroke should not be a request, and the one that lands is for whatever was
  // last typed — an older, slower response arriving after a newer one is why this checks `query`
  // against its own closure before applying what it found.
  useEffect(() => {
    const needle = query.trim();

    if (!needle || !isSynced) {
      setContentMatches(null);
      return;
    }

    const timer = setTimeout(() => {
      void api
        .listDocuments({ q: needle })
        .then((results) => {
          if (query.trim() === needle) {
            setContentMatches(new Set(results.map((entry) => entry.id)));
          }
        })
        .catch(() => {
          // A search that failed leaves the name-only filter in place rather than an error banner
          // over a page that still mostly works.
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isSynced]);

  const found = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return needle
      ? source.filter(
          (entry) =>
            entry.name.toLowerCase().includes(needle) ||
            contentMatches?.has(entry.id)
        )
      : source;
  }, [source, query, contentMatches]);

  /*
   * Only rows whose source is still available — and are on screen — can be picked. Somebody
   * else's documents are not selectable at all: merge, delete and clear are owner's verbs.
   */
  const selectableIds = useMemo(
    () =>
      isShared
        ? []
        : found
            .filter((entry) => entry.markdown !== undefined || entry.remote)
            .map((entry) => entry.id),
    [found, isShared]
  );

  const selectedEntries = useMemo(
    // Oldest first, so a merge reads as a chain in the order the files were made.
    () =>
      entries
        .filter((entry) => selected.includes(entry.id))
        .sort((a, b) => a.createdAt - b.createdAt),
    [entries, selected]
  );

  const allSelected =
    selectableIds.length > 0 && selected.length === selectableIds.length;

  const rows = useMemo(() => {
    const value = (entry: HistoryEntry) => {
      switch (sort.key) {
        case 'name':
          return entry.name.toLowerCase();
        case 'size':
          return entry.size;
        case 'words':
          return entry.stats.words;
        default:
          return entry.createdAt;
      }
    };

    return [...found].sort((a, b) => {
      const left = value(a);
      const right = value(b);
      const order =
        typeof left === 'string' && typeof right === 'string'
          ? left.localeCompare(right)
          : Number(left) - Number(right);

      return sort.direction === 'asc' ? order : -order;
    });
  }, [found, sort]);

  /** Clicking a header sorts by it; clicking the active one flips the direction. */
  const sortBy = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'name' ? 'asc' : 'desc' }
    );

  const directionOf = (key: SortKey) =>
    sort.key === key ? sort.direction : undefined;

  // A click on a control inside the row must not also open the document.
  const stopRowClick = (event: { stopPropagation: () => void }) =>
    event.stopPropagation();

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  if (entries.length === 0 && shared.length === 0) {
    return (
      <StatusView
        tone="muted"
        title={t('history.empty.title')}
        description={
          isSynced ? t('history.empty.synced') : t('history.empty.local')
        }
        actions={
          <Button variant="primary" size="sm" onClick={onGoToConverter}>
            {t('history.empty.action')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography variant="h4" weight="semibold" textColor="primary">
          {t('history.title')}
        </Typography>
        <Typography
          variant="p"
          textColor="secondary"
          className="flex items-center gap-1.5"
        >
          {isSynced ? (
            <Cloud className="size-4 text-brand-tertiary" />
          ) : (
            <MonitorSmartphone className="size-4" />
          )}
          {isSynced ? t('history.mixed') : t('history.local')}
          {usage && (
            <span className="text-ink-inactive">
              {/* Four numbers in one sentence: all four are values, none of them is a word. */}
              {t('history.usage', {
                bytes: formatBytes(usage.bytes, numbers),
                maxBytes: formatBytes(usage.limits.bytes, numbers),
                documents: usage.documents,
                maxDocuments: usage.limits.documents,
              })}
            </span>
          )}
        </Typography>
      </div>

      <button
        type="button"
        onClick={() => filePicker.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          const files = Array.from(event.dataTransfer.files ?? []);

          if (files.length > 0) {
            onFiles(files);
          }
        }}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border border-dropzone-border border-dashed px-6 py-6 text-center',
          'bg-surface-card transition-colors duration-base',
          'hover:border-dropzone-border-active',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2',
          isDragging && 'border-dropzone-border-active bg-dropzone-bg-active'
        )}
      >
        {/*
          * This one takes everything, and the conversion is chosen from the extension — so the
          * label had better not promise Markdown.
          */}
        <span className="flex items-center gap-2 font-semibold text-ink-primary text-sm">
          <Upload className="size-4 text-brand-tertiary" />
          {t('history.drop.title')}
        </span>
        <Typography variant="span" textColor="secondary" className="text-xs">
          {t('history.drop.hint')}
        </Typography>
      </button>

      <input
        ref={filePicker}
        type="file"
        accept={ALL_EXTENSIONS.join(',')}
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);

          if (files.length > 0) {
            onFiles(files);
          }

          event.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup size="sm">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            placeholder={t('history.search.placeholder')}
            aria-label={t('history.search.label')}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <IconButton
                variant="tertiary"
                size="xs"
                aria-label={t('history.search.clear')}
                onClick={() => setQuery('')}
              >
                <X />
              </IconButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <MoveDialog
        open={choosing}
        onOpenChange={setChoosing}
        title={t(selected.length === 1 ? 'move.title.one' : 'move.title.many', { count: selected.length })}
        folders={folders}
        onCreated={loadFolders}
        onMove={(target) => {
          setChoosing(false);
          void moveSelected(target);
        }}
      />

      {isSynced && !isShared && (
        <FolderBar
          folders={folders}
          current={folder}
          counts={folderCounts}
          onOpen={(id) => {
            setSelected([]);
            setFolder(id);
          }}
          onChanged={() => {
            loadFolders();
            onRefresh();
          }}
          onDropDocuments={(ids, target) => void moveDocuments(ids, target)}
        />
      )}

      <FilterChips
        value={chip}
        items={[
          { value: 'all', label: t('history.chip.all'), count: inFolder.length },
          ...(kinds.length > 1 ? kinds : []),
          // Nobody can share with a browser: the chip belongs to an account.
          ...(isSynced
            ? [
                {
                  value: 'shared',
                  label: t('history.chip.shared'),
                  count: shared.length,
                },
              ]
            : []),
        ]}
        onValueChange={(value) => {
          setSelected([]);
          setChip(value as 'all' | ConversionId | 'shared');
          replaceFilter(value);
        }}
      />

      {isShared ? (
        <Typography
          variant="p"
          textColor="secondary"
          className="flex min-h-[37px] items-center gap-1.5 text-sm"
        >
          <Users className="size-4" />
          {isLoadingShared
            ? t('common.loading')
            : t(
                found.length === 1
                  ? 'history.shared.one'
                  : 'history.shared.many',
                { count: found.length }
              )}
        </Typography>
      ) : (
      <ListSelectionBar
        sticky
        title={
          query
            ? t(
                inFolder.length === 1
                  ? 'history.count.filtered.one'
                  : 'history.count.filtered.many',
                { found: found.length, total: inFolder.length }
              )
            : t(
                inFolder.length === 1
                  ? 'history.count.one'
                  : 'history.count.many',
                { count: inFolder.length }
              )
        }
        selectedCount={selected.length}
        allSelected={allSelected}
        isEmpty={selectableIds.length === 0}
        onSelectAll={() => setSelected(selectableIds)}
        onClearSelection={() => setSelected([])}
        rightSlot={
          selected.length > 0 ? (
            <div className="flex items-center gap-2">
              <Hint
                content={
                  selected.length < 2
                    ? t('history.merge.hint.few')
                    : t('history.merge.hint')
                }
              >
                <span>
                  <Button
                    variant="primaryTertiary"
                    size="xs"
                    className="!px-1.5 !py-1"
                    leftSlot={<Combine />}
                    disabled={selected.length < 2}
                    onClick={() => onMerge(selectedEntries)}
                  >
                    {t('history.merge')}
                  </Button>
                </span>
              </Hint>

              {isSynced && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="primaryTertiary"
                      size="xs"
                      className="!px-1.5 !py-1"
                      leftSlot={<FolderInput />}
                    >
                      {t('folders.moveto')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {/* The last few folders things went into, each with where it is: one click. */}
                    {recentFolders()
                      .filter((id) => folders.some((one) => one.id === id))
                      .map((id) => {
                        const path = pathOf(folders, id);

                        return (
                          <DropdownMenuItem key={id} onSelect={() => void moveSelected(id)}>
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate">{path[path.length - 1]}</span>
                              {path.length > 1 && (
                                <span className="truncate text-ink-secondary text-xs">
                                  {path.slice(0, -1).join(' › ')}
                                </span>
                              )}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                    <DropdownMenuItem onSelect={() => void moveSelected(null)}>
                      {t('folders.none')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setChoosing(true)}>
                      {t('move.choose')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="primaryTertiary"
                    size="xs"
                    className="!px-1.5 !py-1"
                    leftSlot={<Download />}
                  >
                    {t('history.download')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {FORMATS.map((one) => (
                    <DropdownMenuItem
                      key={one}
                      onSelect={() => onDownloadMany(selectedEntries, one)}
                    >
                      {FORMAT_LABELS[one]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="destructiveTertiary"
                size="xs"
                className="!px-1.5 !py-1"
                leftSlot={<Trash2 />}
                onClick={() => onRemoveMany(selected)}
              >
                {t('history.delete')}
              </Button>
            </div>
          ) : (
            <Button
              variant="destructiveTertiary"
              size="xs"
              className="!px-1.5 !py-1"
              leftSlot={<Trash2 />}
              onClick={onClear}
            >
              {t('history.clear')}
            </Button>
          )
        }
      />
      )}

      {/*
        * On a phone, cards.
        *
        * The table used to stay a table and lose columns, and the column it gave up first was the
        * name — a list of documents showing only "just now", which is the one thing nobody came
        * here to read. A card has room for the name on its own line and everything else under it.
        */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {rows.map((entry) => {
          const isReopenable =
            entry.markdown !== undefined || entry.remote === true;
          const isSelected = selected.includes(entry.id);

          return (
            <li
              key={entry.id}
              {...dragRow(entry)}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-stroke bg-surface-card p-3',
                isSelected && 'border-brand-tertiary'
              )}
            >
              <div className="flex items-start gap-3">
                {!isShared && (
                  <span
                    className="pt-0.5"
                    onClick={stopRowClick}
                    onKeyDown={stopRowClick}
                  >
                    <Checkbox
                      aria-label={t('history.row.select', { name: entry.name })}
                      checked={isSelected}
                      disabled={!isReopenable}
                      onCheckedChange={() => toggle(entry.id)}
                    />
                  </span>
                )}

                <button
                  type="button"
                  disabled={!isReopenable}
                  onClick={() => isReopenable && onOpen(entry)}
                  className={cn(
                    'flex min-w-0 flex-1 flex-col items-start gap-1 text-left',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-offset-2',
                    isReopenable ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <span className="flex w-full min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-brand-tertiary" />
                    <span className="truncate font-medium text-ink-primary text-sm">
                      {entry.name}
                    </span>
                  </span>

                  <span className="flex flex-wrap items-center gap-2 text-ink-secondary text-xs">
                    <KindBadge entry={entry} isShared={isShared} />
                    <UnsavedBadge entry={entry} isSynced={isSynced} />
                    <span>{formatBytes(entry.size, numbers)}</span>
                    <span aria-hidden>·</span>
                    <span>{formatRelative(entry.createdAt, numbers)}</span>
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 border-stroke border-t pt-2">
                <Typography variant="span" textColor="light" className="text-xs">
                  {t(
                    entry.stats.headings === 1
                      ? 'history.row.stats.one'
                      : 'history.row.stats.many',
                    {
                      words: entry.stats.words,
                      headings: entry.stats.headings,
                    }
                  )}
                </Typography>

                <RowActions
                  entry={entry}
                  isShared={isShared}
                  isReopenable={isReopenable}
                  hasVersions={hasVersions.has(entry.id)}
                  onShare={setSharing}
                  onVersions={setViewingVersionsOf}
                  onDownload={onDownload}
                  onRemove={onRemove}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Table
        className="table-fixed"
        wrapperClassName="hidden shadow-rest sm:block"
      >
        <TableHeader>
          <TableRow>
            {!isShared && (
            <TableHead className="w-10">
              <Checkbox
                aria-label={
                  allSelected ? t('common.deselectall') : t('common.selectall')
                }
                checked={
                  allSelected
                    ? true
                    : selected.length > 0
                      ? 'indeterminate'
                      : false
                }
                disabled={selectableIds.length === 0}
                onCheckedChange={() =>
                  setSelected(selected.length > 0 ? [] : selectableIds)
                }
              />
            </TableHead>
            )}
            <TableHead
              sortable
              sortDirection={directionOf('name')}
              onSort={() => sortBy('name')}
            >
              {t('history.column.file')}
            </TableHead>
            <TableHead className="hidden w-52 sm:table-cell">
              {isShared
                ? t('history.column.sharedby')
                : t('history.column.type')}
            </TableHead>
            <TableHead
              className="hidden w-32 sm:table-cell"
              sortable
              sortDirection={directionOf('size')}
              onSort={() => sortBy('size')}
            >
              {t('history.column.size')}
            </TableHead>
            <TableHead
              className="hidden w-52 md:table-cell"
              sortable
              sortDirection={directionOf('words')}
              onSort={() => sortBy('words')}
            >
              {t('history.column.content')}
            </TableHead>
            <TableHead
              className="w-36"
              sortable
              sortDirection={directionOf('createdAt')}
              onSort={() => sortBy('createdAt')}
            >
              {t('history.column.converted')}
            </TableHead>
            <TableHead className="w-32 text-right">
              {t('history.column.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((entry) => {
            const isReopenable =
              entry.markdown !== undefined || entry.remote === true;
            const isSelected = selected.includes(entry.id);

            return (
              <TableRow
                key={entry.id}
                {...dragRow(entry)}
                // The whole row opens the document; the controls in it do their own thing.
                data-interactive={isReopenable ? '' : undefined}
                role={isReopenable ? 'button' : undefined}
                tabIndex={isReopenable ? 0 : undefined}
                aria-label={
                  isReopenable
                    ? t('history.row.open.label', { name: entry.name })
                    : undefined
                }
                className={cn(
                  isSelected && 'is-selected',
                  isReopenable &&
                    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand focus-visible:ring-inset'
                )}
                onClick={() => isReopenable && onOpen(entry)}
                onKeyDown={(event) => {
                  if (isReopenable && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onOpen(entry);
                  }
                }}
              >
                {!isShared && (
                <TableCell onClick={stopRowClick} onKeyDown={stopRowClick}>
                  <Checkbox
                    aria-label={t('history.row.select', { name: entry.name })}
                    checked={isSelected}
                    disabled={!isReopenable}
                    onCheckedChange={() => toggle(entry.id)}
                  />
                </TableCell>
                )}

                <TableCell className="max-w-0">
                  <Hint
                    content={
                      isReopenable
                        ? t('history.row.open')
                        : t('history.row.unavailable')
                    }
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-brand-tertiary" />
                      <span className="truncate font-medium text-ink-primary">
                        {entry.name}
                      </span>
                    </span>
                  </Hint>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <span className="flex items-center gap-2">
                    <KindBadge entry={entry} isShared={isShared} className="w-24" />
                    <UnsavedBadge entry={entry} isSynced={isSynced} />
                  </span>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  {formatBytes(entry.size, numbers)}
                </TableCell>

                <TableCell className="hidden text-ink-secondary md:table-cell">
                  {t(
                    entry.stats.headings === 1
                      ? 'history.row.stats.one'
                      : 'history.row.stats.many',
                    {
                      words: entry.stats.words,
                      headings: entry.stats.headings,
                    }
                  )}
                </TableCell>

                <TableCell>
                  <Hint content={formatDateTime(entry.createdAt, numbers)}>
                    <span>{formatRelative(entry.createdAt, numbers)}</span>
                  </Hint>
                </TableCell>

                <TableCell
                  className="text-right"
                  onClick={stopRowClick}
                  onKeyDown={stopRowClick}
                >
                  <RowActions
                    entry={entry}
                    isShared={isShared}
                    isReopenable={isReopenable}
                    hasVersions={hasVersions.has(entry.id)}
                    onShare={setSharing}
                    onVersions={setViewingVersionsOf}
                    onDownload={onDownload}
                    onRemove={onRemove}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ShareDialog
        documentId={sharing?.id ?? null}
        name={sharing?.name ?? ''}
        open={sharing !== null}
        onOpenChange={(open) => !open && setSharing(null)}
      />

      <VersionsDialog
        documentId={viewingVersionsOf?.id ?? null}
        open={viewingVersionsOf !== null}
        onOpenChange={(open) => !open && setViewingVersionsOf(null)}
      />
    </div>
  );
}
