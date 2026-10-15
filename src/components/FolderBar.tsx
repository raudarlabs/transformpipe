import { Check, ChevronRight, Copy, Folder as FolderIcon, FolderInput, FolderPlus, Link2, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
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

/** Folders in tree order with their depth, for a menu that lists them all. */
export function flatten(folders: Folder[]): Array<Folder & { depth: number }> {
  const out: Array<Folder & { depth: number }> = [];
  const walk = (parent: string | null, depth: number) => {
    folders
      .filter((one) => one.parent_id === parent)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .forEach((one) => {
        out.push({ ...one, depth });
        walk(one.id, depth + 1);
      });
  };

  walk(null, 0);

  return out;
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
}

export function FolderBar({ folders, current, counts, onOpen, onChanged }: FolderBarProps) {
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
          <button type="button" onClick={() => onOpen(null)} className="text-ink-secondary hover:text-ink-primary">
            {t('folders.all')}
          </button>
          {trail.map((one) => (
            <span key={one.id} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 text-ink-inactive" />
              <button
                type="button"
                onClick={() => onOpen(one.id)}
                className={one.id === current ? 'font-semibold text-ink-primary' : 'text-ink-secondary hover:text-ink-primary'}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="tertiary" size="xs" leftSlot={<FolderInput />}>
                    {t('folders.move')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-80 overflow-auto">
                  <DropdownMenuItem
                    disabled={here.parent_id === null}
                    onSelect={() => void run(() => api.updateFolder(here.id, { parentId: null }))}
                  >
                    {t('folders.top')}
                  </DropdownMenuItem>
                  {flatten(folders)
                    .filter((one) => !blocked.has(one.id))
                    .map((one) => (
                      <DropdownMenuItem
                        key={one.id}
                        disabled={one.id === here.parent_id}
                        onSelect={() => void run(() => api.updateFolder(here.id, { parentId: one.id }))}
                      >
                        <span style={{ paddingLeft: `${one.depth * 0.75}rem` }}>{one.name}</span>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
              onClick={() => onOpen(one.id)}
              className="flex items-center gap-1.5 rounded-lg border border-stroke bg-surface-page px-2.5 py-1.5 text-sm hover:border-brand-tertiary"
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
