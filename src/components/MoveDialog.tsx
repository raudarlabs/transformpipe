import { ChevronDown, ChevronRight, Folder as FolderIcon, FolderX, FolderPlus, Search } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, type Folder } from '@/lib/api';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/ui/components/Modal';
import { cn } from '@/ui/lib/utils';

/*
 * Where to move something, chosen from every folder at once.
 *
 * The dropdown this replaced listed every folder of the account in one indented column, which for
 * an imported space was forty names with no way to find one. Here the tree folds — open to the
 * folder already chosen — and typing searches every folder by name and shows each match with its
 * path, because "Processes" alone does not say which of three it is. A folder can be made on the
 * spot inside whichever one is selected.
 */

/** A folder's path from the top, as names. */
export function pathOf(folders: Folder[], id: string): string[] {
  const path: string[] = [];
  let at = folders.find((one) => one.id === id);

  while (at) {
    path.unshift(at.name);
    at = folders.find((one) => one.id === at!.parent_id);
  }

  return path;
}

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  folders: Folder[];
  /** Folders that cannot be chosen — a folder being moved, and everything inside it. */
  excluded?: Set<string>;
  /** Whether "No folder" (the top) is a destination. */
  allowNone?: boolean;
  onMove: (folderId: string | null) => void;
  /** A folder was made here; the caller reloads the list. */
  onCreated: () => void;
}

const sortByName = (a: Folder, b: Folder) => a.name.localeCompare(b.name, undefined, { numeric: true });

export function MoveDialog({
  open,
  onOpenChange,
  title,
  folders,
  excluded = new Set(),
  allowNone = true,
  onMove,
  onCreated,
}: MoveDialogProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [naming, setNaming] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setChosen(null);
      setNaming(null);
      // The top level open, so the first thing seen is more than one line.
      setExpanded(new Set(folders.filter((one) => one.parent_id === null).map((one) => one.id)));
    }
  }, [open]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return needle
      ? folders
          .filter((one) => !excluded.has(one.id) && one.name.toLowerCase().includes(needle))
          .sort(sortByName)
          .slice(0, 50)
      : [];
  }, [folders, query, excluded]);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const create = async (event: FormEvent) => {
    event.preventDefault();

    const name = naming?.trim();

    if (!name) return;

    const made = await api.createFolder(name, chosen);

    setNaming(null);
    setChosen(made.id);
    if (chosen) setExpanded((current) => new Set(current).add(chosen));
    onCreated();
  };

  const rowClass = (id: string | null) =>
    cn(
      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
      chosen === id ? 'bg-surface-accent text-ink-primary' : 'text-ink-body hover:bg-surface-chips'
    );

  const branch = (parent: string | null, depth: number): React.ReactNode =>
    folders
      .filter((one) => one.parent_id === parent && !excluded.has(one.id))
      .sort(sortByName)
      .map((one) => {
        const hasChildren = folders.some((child) => child.parent_id === one.id && !excluded.has(child.id));
        const isOpen = expanded.has(one.id);

        return (
          <li key={one.id}>
            <div className={rowClass(one.id)} style={{ paddingLeft: `${0.5 + depth * 1.1}rem` }}>
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
                className="flex min-w-0 flex-1 items-center gap-2"
                onClick={() => setChosen(one.id)}
                onDoubleClick={() => onMove(one.id)}
              >
                <FolderIcon className="size-4 shrink-0 text-brand-tertiary" />
                <span className="truncate">{one.name}</span>
                {one.documents > 0 && <span className="ml-auto text-ink-secondary text-xs">{one.documents}</span>}
              </button>
            </div>
            {isOpen && hasChildren && <ul>{branch(one.id, depth + 1)}</ul>}
          </li>
        );
      });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-3">
          <div className="relative">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-ink-secondary" />
            <Input
              autoFocus
              value={query}
              placeholder={t('move.search')}
              aria-label={t('move.search')}
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="max-h-[50vh] min-h-[16rem] overflow-auto rounded-lg border border-stroke p-1">
            {query.trim() ? (
              matches.length === 0 ? (
                <p className="p-3 text-ink-secondary text-sm">{t('move.nothing')}</p>
              ) : (
                <ul>
                  {matches.map((one) => (
                    <li key={one.id}>
                      <button
                        type="button"
                        className={rowClass(one.id)}
                        onClick={() => setChosen(one.id)}
                        onDoubleClick={() => onMove(one.id)}
                      >
                        <FolderIcon className="size-4 shrink-0 text-brand-tertiary" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{one.name}</span>
                          <span className="truncate text-ink-secondary text-xs">
                            {pathOf(folders, one.id).slice(0, -1).join(' › ') || t('move.top')}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <ul>
                {allowNone && (
                  <li>
                    <button type="button" className={rowClass(null)} onClick={() => setChosen(null)} onDoubleClick={() => onMove(null)}>
                      <FolderX className="size-4 shrink-0 text-ink-secondary" />
                      {t('folders.none')}
                    </button>
                  </li>
                )}
                {branch(null, 0)}
              </ul>
            )}
          </div>

          {naming !== null && (
            <form onSubmit={(event) => void create(event)} className="flex items-center gap-2">
              <Input
                autoFocus
                value={naming}
                maxLength={200}
                placeholder={t('folders.name')}
                aria-label={t('folders.name')}
                onChange={(event) => setNaming(event.target.value)}
              />
              <Button type="submit" size="sm" variant="secondary">
                {t('folders.create')}
              </Button>
            </form>
          )}
        </ModalBody>
        <ModalFooter className="flex items-center gap-2">
          <Button variant="tertiary" size="sm" leftSlot={<FolderPlus />} onClick={() => setNaming('')}>
            {chosen ? t('move.new.inside') : t('folders.new')}
          </Button>
          <span className="flex-1" />
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('folders.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={chosen === null && !allowNone}
            onClick={() => onMove(chosen)}
          >
            {t('move.here')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
