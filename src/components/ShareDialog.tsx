import { CalendarClock, Check, Copy, Eye, Link2, Lock, Mail, TimerOff, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  /** A password on the link, or null to remove it. */
  setPassword: (id: string, password: string | null) => Promise<ShareState>;
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
  setPassword: (id, password) => api.setSharePassword(id, password),
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

/**
 * How long the link works, beside the link itself.
 *
 * A native select rather than chips: the choices are relative ("for 7 days") but what is stored is
 * a date, so once one is chosen the honest thing to show is that date — which a chip reading
 * "7 days" a week later would not be. The select shows it as its own first option instead.
 *
 * A picked day goes through a button, not on change: a date field reports a value while the year is
 * still being typed, and year 0002 is a date in the past the server would refuse.
 */
function ExpiryRow({
  state,
  isBusy,
  onChange,
}: {
  state: ShareState;
  isBusy: boolean;
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
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-between gap-3">
        <Typography variant="span" textColor="secondary" className="text-xs">
          {t('dialog.share.expiry.label')}
        </Typography>

        <select
          value={isPicking ? 'pick' : ends !== null ? 'current' : 'never'}
          disabled={isBusy}
          onChange={(event) => choose(event.target.value)}
          className="h-8 rounded-md border border-stroke bg-surface-card px-2 text-ink-body text-xs"
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
      </label>

      {isPicking && (
        <div className="flex items-center justify-end gap-2">
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

      {ends !== null && (
        <Typography
          variant="p"
          textColor={hasEnded ? 'warning' : 'secondary'}
          className="flex items-start gap-2 text-xs"
        >
          {hasEnded ? (
            <TimerOff className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CalendarClock className="mt-0.5 size-4 shrink-0" />
          )}
          {t(hasEnded ? 'dialog.share.expiry.ended' : 'dialog.share.expiry.ends', { date: when })}
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
  onChange,
}: {
  state: ShareState;
  isBusy: boolean;
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Typography variant="span" textColor="secondary" className="text-xs">
          {t('dialog.share.password.label')}
        </Typography>

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
              leftSlot={<Lock />}
              disabled={isBusy}
              onClick={() => setIsEditing(true)}
            >
              {t('dialog.share.password.add')}
            </Button>
          ))}
      </div>

      {isEditing && (
        /*
          * Not a <form>: the field's own show/hide button has no type, so inside a form Enter
          * pressed it — the password turned visible instead of being saved. Enter is handled here.
          */
        <div className="flex items-start gap-2">
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
            type="button"
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

      <Typography variant="p" textColor="secondary" className="flex items-start gap-2 text-xs">
        <Lock className="mt-0.5 size-4 shrink-0" />
        {t(state.hasPassword ? 'dialog.share.password.on' : 'dialog.share.password.off')}
      </Typography>
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
  const { locale } = useI18n();
  const [state, setState] = useState<ShareState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!open || !documentId) {
      return;
    }

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

  const run = async (action: Promise<ShareState>) => {
    setIsBusy(true);

    try {
      setState(await action);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : t('dialog.share.error')
      );
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

  const addRecipient = () => {
    const address = email.trim();

    if (address) {
      void run(client.add(documentId, address)).then(() => setEmail(''));
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
            onValueChange={(value) =>
              void run(client.setMode(documentId, value as ShareMode))
            }
          />

          {isBusy && !state && (
            <div className="flex items-center gap-2 py-2">
              <Spinner />
              <Typography variant="span" textColor="secondary">
                {t('common.loading')}
              </Typography>
            </div>
          )}

          {state?.mode === 'private' && (
            <Typography
              variant="p"
              textColor="secondary"
              className="flex items-start gap-2 text-xs"
            >
              <Lock className="mt-0.5 size-4 shrink-0" />
              {t('dialog.share.private.note')}
            </Typography>
          )}

          {state && state.mode !== 'private' && state.token && (
            <div className="flex flex-col gap-2">
              <Typography
                variant="span"
                textColor="secondary"
                className="text-xs"
              >
                {t('dialog.share.link')}
              </Typography>

              <div className="flex items-center gap-2">
                <InputGroup size="sm">
                  <InputGroupAddon>
                    <Link2 className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    readOnly
                    value={client.url(state.token)}
                    aria-label={t('dialog.share.link.field')}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </InputGroup>

                <Button
                  variant="secondary"
                  size="sm"
                  leftSlot={isCopied ? <Check /> : <Copy />}
                  onClick={() => void copyLink()}
                >
                  {isCopied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>

              <Typography
                variant="p"
                textColor="secondary"
                className="flex items-start gap-2 text-xs"
              >
                {state.mode === 'link' ? (
                  <>
                    <Users className="mt-0.5 size-4 shrink-0" />
                    {t('dialog.share.link.note')}
                  </>
                ) : (
                  <>
                    <Mail className="mt-0.5 size-4 shrink-0" />
                    {t('dialog.share.people.note')}
                  </>
                )}
              </Typography>

              <ExpiryRow
                state={state}
                isBusy={isBusy}
                onChange={(expiresAt) =>
                  void run(client.setExpiry(documentId, state.mode, expiresAt))
                }
              />

              {state.mode === 'link' && (
                <PasswordRow
                  state={state}
                  isBusy={isBusy}
                  onChange={(password) => void run(client.setPassword(documentId, password))}
                />
              )}

              {/* Opens of this link, counted by the page's own picture — not people, and yours too. */}
              <Typography
                variant="p"
                textColor="secondary"
                className="flex items-start gap-2 text-xs"
              >
                <Eye className="mt-0.5 size-4 shrink-0" />
                {state.views === 0 || !state.lastViewedAt
                  ? t('dialog.share.views.none')
                  : t(state.views === 1 ? 'dialog.share.views.one' : 'dialog.share.views.many', {
                      count: state.views,
                      date: formatDateTime(Date.parse(state.lastViewedAt), INTL_LOCALES[locale]),
                    })}
              </Typography>
            </div>
          )}

          {state?.mode === 'people' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <InputGroup size="sm">
                  <InputGroupAddon>
                    <Mail className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={email}
                    type="email"
                    placeholder="name@company.com"
                    aria-label={t('dialog.share.email.label')}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addRecipient();
                      }
                    }}
                  />
                </InputGroup>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBusy || email.trim().length === 0}
                  onClick={addRecipient}
                >
                  {t('dialog.share.add')}
                </Button>
              </div>

              {state.emails.length > 0 ? (
                <ul className="flex flex-col divide-y divide-stroke rounded-md border border-stroke">
                  {state.emails.map((address) => (
                    <li
                      key={address}
                      className="flex items-center justify-between gap-2 px-3 py-1.5"
                    >
                      <Typography
                        variant="span"
                        textColor="body"
                        className="truncate text-xs"
                      >
                        {address}
                      </Typography>

                      <IconButton
                        variant="destructiveTertiary"
                        size="xs"
                        aria-label={t('dialog.share.remove.label', {
                          email: address,
                        })}
                        disabled={isBusy}
                        onClick={() =>
                          void run(client.remove(documentId, address))
                        }
                      >
                        <X />
                      </IconButton>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography
                  variant="span"
                  textColor="light"
                  className="text-xs"
                >
                  {t('dialog.share.people.empty')}
                </Typography>
              )}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
