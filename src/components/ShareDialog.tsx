import {
  Check,
  Copy,
  Eye,
  Link2,
  Lock,
  type LucideIcon,
  Mail,
  TimerOff,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api, type ShareMode, type ShareState } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { count } from '@/lib/usage';
import { FilterChips } from './FilterChips';
import { Button } from '@/ui/components/Button';
import { IconButton } from '@/ui/components/IconButton';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/ui/components/InputGroup';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/ui/components/Modal';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { Spinner } from '@/ui/components/Spinner';
import { toast } from '@/ui/components/Toast';
import { Typography } from '@/ui/components/Typography';

/**
 * Where this dialog's four calls go, and how a token becomes an address.
 *
 * The app talks to `/api/documents/:id/share` with its session cookie; the extension talks to the
 * public `/api/v1` with a bearer token, from a page whose origin is `chrome-extension://…`. Every
 * other thing about the dialog — the three modes, the link row, the list of addresses and what each
 * one means — is the same, so the transport is a parameter and there is one dialog rather than two
 * that drift.
 */
export interface ShareClient {
  get: (id: string) => Promise<ShareState>;
  setMode: (id: string, mode: ShareMode) => Promise<ShareState>;
  /** When the link stops working; null for never. The mode goes along unchanged. */
  setExpiry: (id: string, mode: ShareMode, expiresAt: string | null) => Promise<ShareState>;
  /** A password for the link, or null to remove it; the mode goes along unchanged. */
  setPassword: (id: string, mode: ShareMode, password: string | null) => Promise<ShareState>;
  add: (id: string, email: string) => Promise<ShareState>;
  remove: (id: string, email: string) => Promise<ShareState>;
  /** The page a share token opens. The app is on the site; the extension is not. */
  url: (token: string) => string;
}

/** The site's own: session cookie, same origin, links built from the address bar. */
export const appShareClient: ShareClient = {
  get: (id) => api.getShare(id),
  /*
   * Counted here and not in the dialog, so the extension — which passes its own client — counts
   * nothing: see "The browser extension" on the privacy page. Only what shares something counts,
   * a public link turned on or an address added; never the address.
   */
  setMode: async (id, mode) => {
    const state = await api.setShareMode(id, mode);

    if (mode === 'link') {
      count('share', 'link');
    }

    return state;
  },
  setExpiry: (id, mode, expiresAt) => api.setShareExpiry(id, mode, expiresAt),
  setPassword: (id, mode, password) => api.setSharePassword(id, mode, password),
  add: async (id, email) => {
    const state = await api.addShareRecipient(id, email);

    count('share', 'people');

    return state;
  },
  remove: (id, email) => api.removeShareRecipient(id, email),
  url: (token) => `${window.location.origin}/s/${token}`,
};

const HOUR_MS = 60 * 60 * 1000;

/** A day as `<input type="date">` spells it, in the reader's own time zone. */
const localDay = (at: Date) =>
  `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;

/** The last moment of a picked day, locally: "until the 7th" means the 7th still works. */
const endOfDay = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);

  return new Date(year, month - 1, date, 23, 59, 59).toISOString();
};

/** One line of the link's settings: its name on the left, its control on the right. */
const settingRow = 'flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2';

/**
 * How long the link works.
 *
 * A native select rather than chips: the choices are relative ("in 7 days") but what is stored is
 * a date, so once one is chosen the honest thing to show is that date — which a chip reading
 * "7 days" a week later would not be. The select shows it as its own first option instead, and
 * that is the whole of what it says: the date in the control is the explanation.
 *
 * A picked day goes through a button, not on change: a date field reports a value while the year is
 * still being typed, and year 0002 is a date in the past the server would refuse.
 */
function ExpiryRow({
  state,
  isBusy,
  disabled = false,
  onChange,
}: {
  state: ShareState;
  isBusy: boolean;
  /** Private: there is no link to end, so the row is there and cannot be used. */
  disabled?: boolean;
  onChange: (expiresAt: string | null) => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const [isPicking, setIsPicking] = useState(false);
  const [day, setDay] = useState('');

  const ends = state.expiresAt ? Date.parse(state.expiresAt) : null;
  const hasEnded = ends !== null && ends <= Date.now();
  const when = ends !== null ? formatDateTime(ends, INTL_LOCALES[locale]) : '';

  const choose = (value: string) => {
    setIsPicking(value === 'pick');

    if (value === 'never') {
      onChange(null);
    } else if (value !== 'pick' && value !== 'current') {
      onChange(new Date(Date.now() + Number(value) * HOUR_MS).toISOString());
    }
  };

  return (
    <div className={settingRow}>
      <label htmlFor="share-expiry" className="text-ink-secondary text-xs">
        {t('dialog.share.expiry.label')}
      </label>

      <select
        id="share-expiry"
        value={isPicking ? 'pick' : ends !== null ? 'current' : 'never'}
        disabled={isBusy || disabled}
        onChange={(event) => choose(event.target.value)}
        className="h-8 rounded-md border border-stroke bg-surface-card px-2 text-ink-body text-xs disabled:opacity-50"
      >
        {ends !== null && (
          <option value="current">{t('dialog.share.expiry.until', { date: when })}</option>
        )}
        <option value="never">{t('dialog.share.expiry.never')}</option>
        {/* In hours, so the shortest and the longest are the same arithmetic. */}
        <option value="1">{t('dialog.share.expiry.hour')}</option>
        <option value="24">{t('dialog.share.expiry.day')}</option>
        <option value="168">{t('dialog.share.expiry.week')}</option>
        <option value="720">{t('dialog.share.expiry.month')}</option>
        <option value="pick">{t('dialog.share.expiry.pick')}</option>
      </select>

      {isPicking && (
        <div className="flex w-full items-center justify-end gap-2">
          <input
            type="date"
            min={localDay(new Date())}
            value={day}
            aria-label={t('dialog.share.expiry.date')}
            onChange={(event) => setDay(event.target.value)}
            className="h-8 rounded-md border border-stroke bg-surface-card px-2 text-ink-body text-xs"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy || !day || day < localDay(new Date())}
            onClick={() => {
              onChange(endOfDay(day));
              setIsPicking(false);
              setDay('');
            }}
          >
            {t('dialog.share.expiry.set')}
          </Button>
        </div>
      )}

      {/* The one state that needs words: the link is dead, and the fix is in the control above. */}
      {hasEnded && (
        <Typography
          variant="p"
          textColor="warning"
          className="flex w-full items-start gap-2 text-xs"
        >
          <TimerOff className="mt-0.5 size-4 shrink-0" />
          {t('dialog.share.expiry.ended', { date: when })}
        </Typography>
      )}
    </div>
  );
}

const PASSWORD_MIN = 8;

/**
 * A password on a link — set, changed or taken off, and never shown, because it is not kept: the
 * server holds a hash of it. So the row says only whether there is one, and changing it means
 * typing a new one rather than editing the old.
 *
 * Link mode only. A share with specific people already asks each reader to sign in as themselves,
 * and a password on top would be a second key to the same door.
 */
function PasswordRow({
  state,
  isBusy,
  disabled = false,
  onChange,
}: {
  state: ShareState;
  isBusy: boolean;
  /** Private: there is no link to guard, so the row is there and cannot be used. */
  disabled?: boolean;
  onChange: (password: string | null) => void;
}) {
  const t = useT();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const tooShort = draft.length > 0 && draft.length < PASSWORD_MIN;

  const save = () => {
    if (draft.length >= PASSWORD_MIN) {
      onChange(draft);
      setDraft('');
      setIsEditing(false);
    }
  };

  return (
    <div className={settingRow}>
      <span className="flex items-center gap-1.5 text-ink-secondary text-xs">
        {state.hasPassword && <Lock className="size-3.5 text-brand-tertiary" />}
        {t('dialog.share.password.label')}
      </span>

      {!isEditing &&
        (state.hasPassword ? (
          <span className="flex items-center gap-1">
            <Button variant="tertiary" size="sm" disabled={isBusy} onClick={() => setIsEditing(true)}>
              {t('dialog.share.password.change')}
            </Button>
            <Button variant="tertiary" size="sm" disabled={isBusy} onClick={() => onChange(null)}>
              {t('dialog.share.password.remove')}
            </Button>
          </span>
        ) : (
          <Button
            variant="tertiary"
            size="sm"
            disabled={isBusy || disabled}
            onClick={() => setIsEditing(true)}
          >
            {t('dialog.share.password.add')}
          </Button>
        ))}

      {isEditing && (
        /*
          * Not a <form>: the field's own show/hide button has no type, so inside a form Enter
          * pressed it — the password turned visible instead of being saved. Enter is handled here.
          */
        <div className="flex w-full items-start gap-2">
          <PasswordInput
            autoFocus
            autoComplete="new-password"
            value={draft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                save();
              }
            }}
            minLength={PASSWORD_MIN}
            maxLength={200}
            placeholder={t('dialog.share.password.placeholder')}
            aria-label={t('dialog.share.password.label')}
            onChange={(event) => setDraft(event.target.value)}
            inputGroupProps={{
              size: 'sm',
              isInvalid: tooShort,
              errorText: tooShort ? t('dialog.share.password.short') : undefined,
            }}
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy || draft.length < PASSWORD_MIN}
            onClick={save}
          >
            {t('dialog.share.expiry.set')}
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              setDraft('');
              setIsEditing(false);
            }}
          >
            {t('dialog.share.password.cancel')}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * The addresses a share names, in the frame beside the end date — where a link has its password.
 *
 * Each one added is emailed the link, which is said once in the panel's line above rather than
 * here. The list appears under the field once it has somebody on it, and scrolls past a few rows,
 * so a long audience does not push the dialog off screen.
 */
function PeopleRow({
  emails,
  isBusy,
  onAdd,
  onRemove,
}: {
  emails: string[];
  isBusy: boolean;
  onAdd: (email: string) => Promise<boolean>;
  onRemove: (email: string) => void;
}) {
  const t = useT();
  const [email, setEmail] = useState('');

  const add = () => {
    const address = email.trim();

    if (address) {
      void onAdd(address).then((added) => added && setEmail(''));
    }
  };

  return (
    <div className={settingRow}>
      <label htmlFor="share-people" className="text-ink-secondary text-xs">
        {t('dialog.share.people.label')}
      </label>

      {/* One line, like the password it stands in for, so the three modes are one height. */}
      <div className="flex min-w-0 flex-1 basis-56 items-center justify-end gap-2">
        <InputGroup size="sm">
          <InputGroupAddon>
            <Mail className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="share-people"
            value={email}
            type="email"
            placeholder="name@company.com"
            aria-label={t('dialog.share.email.label')}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
          />
        </InputGroup>

        <Button
          variant="secondary"
          size="sm"
          disabled={isBusy || email.trim().length === 0}
          onClick={add}
        >
          {t('dialog.share.add')}
        </Button>
      </div>

      {/* Only once there is somebody on it; the line above the frame says who may open it. */}
      {emails.length > 0 && (
        <ul className="flex max-h-28 w-full flex-col divide-y divide-stroke overflow-y-auto rounded-md border border-stroke">
          {emails.map((address) => (
            <li key={address} className="flex items-center justify-between gap-2 px-3 py-1.5">
              <Typography variant="span" textColor="body" className="truncate text-xs">
                {address}
              </Typography>

              <IconButton
                variant="destructiveTertiary"
                size="xs"
                aria-label={t('dialog.share.remove.label', { email: address })}
                disabled={isBusy}
                onClick={() => onRemove(address)}
              >
                <X />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/*
 * What differs between the three modes, and nothing else: the line that says who can open it and
 * the icon beside it. Everything around that is the one panel below, the same in every mode.
 */
const MODES: Record<ShareMode, { icon: LucideIcon; note: string }> = {
  private: { icon: Lock, note: 'dialog.share.private.note' },
  link: { icon: Users, note: 'dialog.share.link.note' },
  people: { icon: Mail, note: 'dialog.share.people.note' },
};

/**
 * The whole of the dialog below the mode chips, and the same panel in all three modes.
 *
 * It was three layouts, one per chip, and the dialog changed height every time a chip was pressed —
 * and every change to one layout had to be remembered in the other two. Now each part is always
 * there and only its state changes: the address row is empty and disabled while the document is
 * private, the frame always holds the end date and a second row (the password for a link, the
 * addresses for named people), and the opens line is always at the foot. A change made here is
 * made for every mode at once.
 */
function SharePanel({
  state,
  isBusy,
  isCopied,
  url,
  onCopy,
  onExpiry,
  onPassword,
  onAdd,
  onRemove,
}: {
  state: ShareState;
  isBusy: boolean;
  isCopied: boolean;
  /** The address the token opens, or null while there is none. */
  url: string | null;
  onCopy: () => void;
  onExpiry: (expiresAt: string | null) => void;
  onPassword: (password: string | null) => void;
  onAdd: (email: string) => Promise<boolean>;
  onRemove: (email: string) => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const isPrivate = state.mode === 'private' || !url;
  const { icon: Icon, note } = MODES[state.mode];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <InputGroup size="sm">
          <InputGroupAddon>
            <Link2 className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            readOnly
            value={url ?? ''}
            placeholder={t('dialog.share.link.none')}
            disabled={isPrivate}
            aria-label={t('dialog.share.link.field')}
            onFocus={(event) => event.currentTarget.select()}
          />
        </InputGroup>

        <Button
          variant="secondary"
          size="sm"
          leftSlot={isCopied ? <Check /> : <Copy />}
          disabled={isPrivate}
          onClick={onCopy}
        >
          {isCopied ? t('common.copied') : t('common.copy')}
        </Button>
      </div>

      {/* Two lines kept for it in every mode, so a line that wraps in one language or one mode
       * does not make that mode taller than the others. */}
      <Typography variant="p" textColor="secondary" className="flex min-h-8 items-start gap-2 text-xs">
        <Icon className="mt-0.5 size-4 shrink-0" />
        {t(note)}
      </Typography>

      <div className="flex flex-col divide-y divide-stroke rounded-lg border border-stroke">
        <ExpiryRow state={state} isBusy={isBusy} disabled={isPrivate} onChange={onExpiry} />

        {state.mode === 'people' ? (
          <PeopleRow emails={state.emails} isBusy={isBusy} onAdd={onAdd} onRemove={onRemove} />
        ) : (
          /* Usable while private too: a password set ahead guards the link from its first second. */
          <PasswordRow state={state} isBusy={isBusy} onChange={onPassword} />
        )}
      </div>

      {/* Opens of this link, in a line; the Views tab has each of them. */}
      <Typography variant="span" textColor="light" className="flex items-center gap-1.5 text-xs">
        <Eye className="size-3.5 shrink-0" />
        {isPrivate
          ? t('dialog.share.views.private')
          : state.views === 0 || !state.lastViewedAt
            ? t('dialog.share.views.none')
            : t(state.views === 1 ? 'dialog.share.views.one' : 'dialog.share.views.many', {
                count: state.views,
                date: formatDateTime(Date.parse(state.lastViewedAt), INTL_LOCALES[locale]),
              })}
      </Typography>
    </div>
  );
}

/**
 * The one question the dialog asks before doing what it was told.
 *
 * Going private deletes the link's token, which is the only way revoking means anything — and it
 * also means a link somebody sent last week is dead for good, and sharing again makes a different
 * one. That surprised the person it was built for: links they had shared "stopped working", and
 * the reason was a click on Private that looked like a setting rather than an ending. Every other
 * change keeps the address, so this is the only one that asks.
 *
 * It stands where the panel stood and at its height, so the dialog does not change size under the
 * pointer; the safe answer has the focus.
 */
function RevokeConfirm({
  height,
  isBusy,
  onConfirm,
  onCancel,
}: {
  height: number;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();

  return (
    <div
      role="alertdialog"
      aria-labelledby="share-revoke-title"
      aria-describedby="share-revoke-body"
      className="flex flex-col justify-center gap-3 rounded-lg border border-stroke p-4"
      style={height ? { minHeight: height } : undefined}
    >
      <Typography
        id="share-revoke-title"
        variant="p"
        weight="semibold"
        textColor="primary"
        className="flex items-center gap-2 text-sm"
      >
        <TriangleAlert className="size-4 shrink-0 text-warning" />
        {t('dialog.share.revoke.title')}
      </Typography>
      <Typography id="share-revoke-body" variant="p" textColor="secondary" className="text-xs">
        {t('dialog.share.revoke.body')}
      </Typography>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" disabled={isBusy} onClick={onConfirm}>
          {t('dialog.share.revoke.confirm')}
        </Button>
        <Button variant="secondary" size="sm" disabled={isBusy} autoFocus onClick={onCancel}>
          {t('dialog.share.revoke.cancel')}
        </Button>
      </div>
    </div>
  );
}

interface ShareDialogProps {
  /** The document's id in the account; sharing needs a server-side row. */
  documentId: string | null;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Left out on the site, where it is the site's own. */
  client?: ShareClient;
}

export function ShareDialog({
  documentId,
  name,
  open,
  onOpenChange,
  client = appShareClient,
}: ShareDialogProps) {
  const t = useT();
  const [state, setState] = useState<ShareState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  /** The panel's height while Private waits to be confirmed; null when nothing is being asked. */
  const [confirming, setConfirming] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !documentId) {
      return;
    }

    setConfirming(null);

    setIsBusy(true);
    client
      .get(documentId)
      .then(setState)
      .catch((cause: Error) => toast.error(cause.message))
      .finally(() => setIsBusy(false));
  }, [open, documentId, client]);

  if (!documentId) {
    return null;
  }

  /** Whether it worked, so a field that was typed into is cleared only when it did. */
  const run = async (action: Promise<ShareState>): Promise<boolean> => {
    setIsBusy(true);

    try {
      setState(await action);

      return true;
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : t('dialog.share.error')
      );

      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const copyLink = async () => {
    if (!state?.token) {
      return;
    }

    try {
      await navigator.clipboard.writeText(client.url(state.token));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error(t('common.clipboard.error'));
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>{t('dialog.share.title')}</ModalTitle>
          <Typography variant="span" textColor="secondary" className="text-xs">
            {name}
          </Typography>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <FilterChips
            value={state?.mode ?? 'private'}
            items={[
              { value: 'private', label: t('dialog.share.mode.private') },
              { value: 'link', label: t('dialog.share.mode.link') },
              { value: 'people', label: t('dialog.share.mode.people') },
            ]}
            onValueChange={(value) => {
              const mode = value as ShareMode;

              // Ending a live link is the one change that cannot be taken back; ask first.
              if (mode === 'private' && state && state.mode !== 'private' && state.token) {
                setConfirming(panel.current?.offsetHeight ?? 0);

                return;
              }

              setConfirming(null);
              void run(client.setMode(documentId, mode));
            }}
          />

          {isBusy && !state ? (
            <div className="flex items-center gap-2 py-2">
              <Spinner />
              <Typography variant="span" textColor="secondary">
                {t('common.loading')}
              </Typography>
            </div>
          ) : state && confirming !== null ? (
            <RevokeConfirm
              height={confirming}
              isBusy={isBusy}
              onCancel={() => setConfirming(null)}
              onConfirm={() =>
                void run(client.setMode(documentId, 'private')).then((done) => {
                  if (done) {
                    setConfirming(null);
                  }
                })
              }
            />
          ) : state ? (
            <div ref={panel}>
              <SharePanel
                state={state}
                isBusy={isBusy}
                isCopied={isCopied}
                url={state.mode !== 'private' && state.token ? client.url(state.token) : null}
                onCopy={() => void copyLink()}
                onExpiry={(expiresAt) => void run(client.setExpiry(documentId, state.mode, expiresAt))}
                onPassword={(password) => void run(client.setPassword(documentId, state.mode, password))}
                onAdd={(address) => run(client.add(documentId, address))}
                onRemove={(address) => void run(client.remove(documentId, address))}
              />
            </div>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
