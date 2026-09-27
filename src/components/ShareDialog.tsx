import { Check, Copy, Link2, Lock, Mail, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, type ShareMode, type ShareState } from '@/lib/api';
import { useT } from '@/lib/i18n/context';
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
  add: async (id, email) => {
    const state = await api.addShareRecipient(id, email);

    count('share', 'people');

    return state;
  },
  remove: (id, email) => api.removeShareRecipient(id, email),
  url: (token) => `${window.location.origin}/s/${token}`,
};

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
