import { FileText, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { TrashEntry } from '@/lib/api';
import { formatBytes, formatRelative } from '@/lib/format';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { Button } from '@/ui/components/Button';
import { Checkbox } from '@/ui/components/Checkbox';
import { IconButton } from '@/ui/components/IconButton';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/components/InputGroup';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/components/Table';
import { Typography } from '@/ui/components/Typography';
import { ListSelectionBar } from './ListSelectionBar';

/*
 * What was deleted, for TRASH_DAYS (server/trash.ts), in the place a folder's documents would be —
 * and drawn with the same pieces as that list: its search box, its count-and-selection bar, its
 * table, its way of picking rows. Only the actions differ: put back, or delete for good.
 *
 * Delete for good and Empty trash are the only irreversible buttons in the history, so each asks
 * once, in the same bar, which keeps the list from moving while it asks.
 */
export function TrashView({
  entries,
  days,
  onRestore,
  onDelete,
  onEmpty,
}: {
  entries: TrashEntry[];
  days: number;
  /** One or several: a row's button sends one, the bar sends the ticked ones. */
  onRestore: (entries: TrashEntry[]) => void;
  onDelete: (entries: TrashEntry[]) => void;
  onEmpty: () => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const numbers = INTL_LOCALES[locale];
  const [query, setQuery] = useState('');
  const [asking, setAsking] = useState<'picked' | 'all' | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const anchor = useRef<string | null>(null);

  const found = useMemo(() => {
    const words = query.trim().toLowerCase();

    return words ? entries.filter((one) => one.name.toLowerCase().includes(words)) : entries;
  }, [entries, query]);
  const ticked = found.filter((one) => picked.includes(one.id));
  const left = (entry: TrashEntry) =>
    Math.max(0, Math.ceil((new Date(entry.purge_at).getTime() - Date.now()) / 86_400_000));

  /* As the history picks: a box ticks one, Shift a run in the order shown, Cmd or Ctrl on a row one more. */
  const pick = (id: string, event: { shiftKey: boolean }) => {
    const order = found.map((one) => one.id);

    if (event.shiftKey && anchor.current && anchor.current !== id && order.includes(anchor.current)) {
      const from = order.indexOf(anchor.current);
      const to = order.indexOf(id);

      setPicked((now) => [...new Set([...now, ...order.slice(Math.min(from, to), Math.max(from, to) + 1)])]);
    } else {
      setPicked((now) => (now.includes(id) ? now.filter((one) => one !== id) : [...now, id]));
    }

    anchor.current = id;
  };
  const done = () => {
    setPicked([]);
    setAsking(null);
  };

  const ask = (question: string, yes: () => void) => (
    <div className="flex items-center gap-2">
      <Typography variant="span" textColor="secondary" className="text-xs">
        {question}
      </Typography>
      <Button variant="destructive" size="xs" onClick={yes}>
        {t('trash.delete.yes')}
      </Button>
      <Button variant="tertiary" size="xs" onClick={() => setAsking(null)}>
        {t('trash.cancel')}
      </Button>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-h-9 flex-wrap items-center gap-2">
        <Typography variant="span" weight="semibold" textColor="primary" className="flex items-center gap-1.5 text-sm">
          <Trash2 className="size-4" aria-hidden />
          {t('trash.title')}
        </Typography>
        <Typography variant="span" textColor="secondary" className="text-sm">
          {t('trash.note', { days })}
        </Typography>
      </div>

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
            <IconButton variant="tertiary" size="xs" aria-label={t('history.search.clear')} onClick={() => setQuery('')}>
              <X />
            </IconButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      <ListSelectionBar
        sticky
        title={
          query
            ? t(entries.length === 1 ? 'history.count.filtered.one' : 'history.count.filtered.many', {
                found: found.length,
                total: entries.length,
              })
            : t(entries.length === 1 ? 'history.count.one' : 'history.count.many', { count: entries.length })
        }
        selectedCount={ticked.length}
        allSelected={found.length > 0 && ticked.length === found.length}
        isEmpty={found.length === 0}
        onSelectAll={() => setPicked(found.map((one) => one.id))}
        onClearSelection={done}
        rightSlot={
          ticked.length > 0 ? (
            asking === 'picked' ? (
              ask(t('trash.empty.ask', { count: ticked.length }), () => {
                onDelete(ticked);
                done();
              })
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="primaryTertiary"
                  size="xs"
                  className="!px-1.5 !py-1"
                  leftSlot={<RotateCcw />}
                  onClick={() => {
                    onRestore(ticked);
                    done();
                  }}
                >
                  {t('trash.restore')}
                </Button>
                <Button
                  variant="destructiveTertiary"
                  size="xs"
                  className="!px-1.5 !py-1"
                  leftSlot={<Trash2 />}
                  onClick={() => setAsking('picked')}
                >
                  {t('trash.delete.yes')}
                </Button>
              </div>
            )
          ) : entries.length > 0 ? (
            asking === 'all' ? (
              ask(t('trash.empty.ask', { count: entries.length }), () => {
                onEmpty();
                done();
              })
            ) : (
              <Button
                variant="destructiveTertiary"
                size="xs"
                className="!px-1.5 !py-1"
                leftSlot={<Trash2 />}
                onClick={() => setAsking('all')}
              >
                {t('trash.empty')}
              </Button>
            )
          ) : null
        }
      />

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-stroke border-dashed px-6 py-12 text-center">
          <Trash2 className="size-6 text-ink-inactive" aria-hidden />
          <Typography variant="span" weight="semibold" textColor="primary">
            {t('trash.none')}
          </Typography>
          <Typography variant="span" textColor="secondary" className="text-sm">
            {t('trash.none.detail', { days })}
          </Typography>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label={t('trash.pick.all')}
                  checked={ticked.length === 0 ? false : ticked.length === found.length ? true : 'indeterminate'}
                  onCheckedChange={() => setPicked(ticked.length === found.length ? [] : found.map((one) => one.id))}
                />
              </TableHead>
              <TableHead>{t('history.column.file')}</TableHead>
              <TableHead className="hidden w-44 md:table-cell">{t('trash.column.was')}</TableHead>
              <TableHead className="hidden w-32 text-center sm:table-cell">{t('trash.column.deleted')}</TableHead>
              <TableHead className="w-24 text-center">{t('trash.column.left')}</TableHead>
              <TableHead className="w-36">
                <span className="sr-only">{t('history.column.actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {found.map((entry) => (
              <TableRow
                key={entry.id}
                className={picked.includes(entry.id) ? 'is-selected' : undefined}
                onMouseDown={(event) => {
                  if (event.shiftKey) event.preventDefault();
                }}
                onClick={(event) => {
                  // A row with Shift, Cmd or Ctrl held picks it; the buttons in it do their own thing.
                  if ((event.shiftKey || event.metaKey || event.ctrlKey) && !(event.target as Element).closest('button')) {
                    pick(entry.id, event);
                  }
                }}
              >
                <TableCell>
                  <Checkbox
                    aria-label={t('history.row.select', { name: entry.name })}
                    checked={picked.includes(entry.id)}
                    onClick={(event) => {
                      event.preventDefault();
                      pick(entry.id, event);
                    }}
                  />
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-ink-inactive" />
                    <span className="truncate font-medium text-ink-primary">{entry.name}</span>
                    <span className="hidden shrink-0 text-ink-secondary xl:inline">{formatBytes(entry.size, numbers)}</span>
                  </span>
                </TableCell>
                <TableCell className="hidden max-w-0 md:table-cell">
                  <span className="block truncate text-ink-secondary">{entry.folder_path || t('folders.all')}</span>
                </TableCell>
                <TableCell className="hidden text-center text-ink-secondary sm:table-cell">
                  {formatRelative(new Date(entry.deleted_at).getTime(), numbers)}
                </TableCell>
                <TableCell className="text-center text-ink-secondary">
                  {t(left(entry) === 1 ? 'trash.left.one' : 'trash.left.many', { days: left(entry) })}
                </TableCell>
                <TableCell>
                  <span className="flex items-center justify-end gap-1">
                    <Button variant="outline" size="xs" leftSlot={<RotateCcw />} onClick={() => onRestore([entry])}>
                      {t('trash.restore')}
                    </Button>
                    <IconButton
                      variant="tertiary"
                      size="xs"
                      aria-label={t('trash.delete', { name: entry.name })}
                      title={t('trash.delete', { name: entry.name })}
                      onClick={() => {
                        setPicked([entry.id]);
                        setAsking('picked');
                      }}
                    >
                      <Trash2 />
                    </IconButton>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
