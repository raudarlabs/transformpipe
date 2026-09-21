import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { GoogleGlyph } from '@/components/GoogleGlyph';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import { Checkbox } from '@/ui/components/Checkbox';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/ui/components/InputGroup';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/ui/components/Modal';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { Separator } from '@/ui/components/Separator';
import { Typography } from '@/ui/components/Typography';

/*
 * Signing in, signing up, and asking for a reset link — one dialog, three views.
 *
 * Three views rather than three routes. Somebody who came here to convert a file is in the middle
 * of doing that: a page navigation loses the document they had open, and a dialog that switches
 * between "sign in" and "sign up" costs them nothing to change their mind in.
 *
 * Google stays on all three because it is the shortest path for anybody who has an account already,
 * and it sits below the form rather than above it: the form is what this dialog exists for now, and
 * the button that leaves the page belongs after the one that does not.
 *
 * Two panels, and the left one is the argument.
 *
 * A sign-in dialog is a narrow column of fields by convention, and a narrow column of fields is
 * what every product ships — which is how this one ended up unrecognisable as ours, and cramped
 * with it. The panel on the left says what the account is actually for, which is the one thing a
 * sign-in form never says, and it is what earns the width: the form beside it can breathe because
 * the dialog is now wide for a reason rather than tall for no reason.
 *
 * It is `sm:` and up. Below that there is no room for two of anything, and the form stands alone.
 *
 * The chrome is the app's own — the header's accent hairline across the top, and the same
 * uppercase eyebrow the converter puts over MARKDOWN and PREVIEW, over each field instead of an
 * icon inside it.
 *
 * No password rules are listed. The auth service enforces its own minimum and this app does not
 * know what it is — a list of requirements that disagrees with the server is worse than no list,
 * because it tells somebody their password is fine and then refuses it. What is shown instead is
 * whatever the service says went wrong, in its own words.
 */

type View = 'signin' | 'signup' | 'reset' | 'verify';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Which view to open on. The header's button opens sign-in; a gate can open sign-up. */
  initial?: View;
}

export function AuthDialog({
  open,
  onOpenChange,
  initial = 'signin',
}: AuthDialogProps) {
  const t = useT();
  const {
    user,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    requestPasswordReset,
    sendVerificationCode,
    verifyEmailCode,
    isSigningIn,
  } = useAuth();

  const [view, setView] = useState<View>(initial);
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [code, setCode] = useState('');
  /** What went wrong, or what happened — one line under the form, either way. */
  const [said, setSaid] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /*
   * Reopening starts clean.
   *
   * Without this, closing the dialog on a failed password and opening it again shows the old
   * refusal under an empty form, which reads as though the empty form had been refused.
   */
  useEffect(() => {
    if (open) {
      setView(initial);
      setSaid(null);
      setDone(false);
      setPassword('');
      setCode('');
      /*
       * Opened on the confirmation view from the account menu, the address is not something to
       * ask for again — it is on the account, and asking would invite a different one.
       */
      if (user?.email) {
        setEmail(user.email);
      }
    }
  }, [open, initial, user?.email]);

  const move = (next: View) => {
    setView(next);
    setSaid(null);
    setDone(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaid(null);

    if (view === 'reset') {
      const failed = await requestPasswordReset(email);

      setSaid(failed ?? t('auth.dialog.reset.sent'));
      setDone(!failed);

      return;
    }

    if (view === 'signup' && !accepted) {
      setSaid(t('auth.dialog.terms.required'));

      return;
    }

    if (view === 'verify') {
      const wrong = await verifyEmailCode(email, code);

      if (wrong) {
        setSaid(wrong);

        return;
      }

      setSaid(t('auth.dialog.verify.done'));
      setDone(true);
      /* Long enough to read the line, short enough not to become a step of its own. */
      setTimeout(() => onOpenChange(false), 1200);

      return;
    }

    const failed =
      view === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

    if (failed) {
      setSaid(failed);

      return;
    }

    /*
     * A new account goes straight to the code, and the code is sent from here.
     *
     * Signing up does not send one - the auth service leaves that to the application - so an
     * account made here used to sit unverified with nothing in the inbox and nowhere in the
     * product to confirm it. Signing in does not pass through this branch: somebody signing in has
     * confirmed already, or is reminded by the account menu if they have not.
     */
    if (view === 'signup') {
      await sendVerificationCode(email);
      setView('verify');
      setSaid(null);

      return;
    }

    onOpenChange(false);
  };

  const title =
    view === 'signin'
      ? t('auth.dialog.signin.title')
      : view === 'signup'
        ? t('auth.dialog.signup.title')
        : view === 'verify'
          ? t('auth.dialog.verify.title')
          : t('auth.dialog.reset.title');

  /* The converter's eyebrow, over a field instead of over a pane. */
  const eyebrow =
    'font-medium text-ink-secondary text-xxs uppercase tracking-[0.12em]';

  /* The left panel, and only where there is room for one. */
  const aside: [string, string][] = [
    [t('auth.dialog.aside.history'), t('auth.dialog.aside.history.detail')],
    [t('auth.dialog.aside.links'), t('auth.dialog.aside.links.detail')],
    [t('auth.dialog.aside.api'), t('auth.dialog.aside.api.detail')],
    [
      t('auth.dialog.aside.extension'),
      t('auth.dialog.aside.extension.detail'),
    ],
  ];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {/*
        * `grid-rows-[minmax(0,1fr)]` is what makes the column below actually scroll.
        *
        * The form column already asked to: `min-h-0` and `overflow-y-auto`, which is the right
        * pair. But a grid row defaults to `auto`, and an `auto` row sizes to its content and is
        * then *clipped* by the container's `max-height` rather than compressed by it — so on a
        * phone held sideways the row laid out at its natural 460 pixels inside a dialog clamped
        * to 336, and 124 pixels of the form were unreachable. Bounding the row hands the
        * constraint down to where the scrolling already was.
        */}
      <ModalContent className="grid max-w-[42rem] grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:grid-cols-[15rem_1fr]">
        <div className="hidden flex-col gap-6 border-stroke border-r bg-gradient-to-b from-surface-accent to-surface-card p-7 sm:flex">
          <Logo className="h-5 w-auto self-start text-ink-primary" />

          <Typography
            variant="p"
            textColor="secondary"
            className="text-sm leading-relaxed"
          >
            {t('auth.dialog.aside.lede')}
          </Typography>

          <ul className="flex flex-col gap-3.5">
            {aside.map(([name, detail]) => (
              <li className="flex gap-2.5" key={name}>
                <Check className="mt-0.5 size-3.5 shrink-0 text-brand-tertiary" />
                <Typography
                  variant="span"
                  textColor="secondary"
                  className="text-xs leading-snug"
                >
                  <span className="font-medium text-ink-body">{name}</span>
                  {' — '}
                  {detail}
                </Typography>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-h-0 flex-col">
          {/* The header's own hairline, over the half of the dialog that is the form. */}
          <div
            aria-hidden
            className="h-0.5 shrink-0 bg-gradient-to-r from-brand-tertiary via-brand-primary to-transparent"
          />

          <div className="flex min-h-0 flex-col overflow-y-auto p-7">
            <ModalHeader className="mb-6">
              <ModalTitle>{title}</ModalTitle>
              {view === 'reset' && (
                <Typography
                  variant="p"
                  textColor="secondary"
                  className="text-sm"
                >
                  {t('auth.dialog.reset.lede')}
                </Typography>
              )}

              {view === 'verify' && (
                <Typography
                  variant="p"
                  textColor="secondary"
                  className="text-sm"
                >
                  {t('auth.dialog.verify.lede', { email })}
                </Typography>
              )}
            </ModalHeader>

            <form className="flex flex-col gap-4" onSubmit={submit}>
              {view !== 'verify' && (
                <div className="flex flex-col gap-2">
                  <label className={eyebrow} htmlFor="auth-email">
                    {t('auth.dialog.email')}
                  </label>
                  <InputGroup size="xl" inputId="auth-email">
                    <InputGroupInput
                      type="email"
                      required
                      autoComplete="email"
                      aria-label={t('auth.dialog.email')}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </InputGroup>
                </div>
              )}

              {view === 'verify' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <label className={eyebrow} htmlFor="auth-code">
                      {t('auth.dialog.verify.code')}
                    </label>
                    <button
                      type="button"
                      className="rounded text-brand-tertiary text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand"
                      onClick={async () => {
                        const failed = await sendVerificationCode(email);

                        setSaid(failed ?? t('auth.dialog.verify.resent'));
                        setDone(!failed);
                      }}
                    >
                      {t('auth.dialog.verify.resend')}
                    </button>
                  </div>
                  <InputGroup size="xl" inputId="auth-code">
                    <InputGroupInput
                      required
                      /*
                       * `inputMode` and `one-time-code` are what make a phone offer the code from
                       * the message instead of a keyboard, and what stop a password manager
                       * filling the field with something else.
                       */
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      aria-label={t('auth.dialog.verify.code')}
                      className="text-center text-base tracking-[0.5em]"
                      value={code}
                      onChange={(event) =>
                        setCode(
                          event.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                    />
                  </InputGroup>
                </div>
              )}

              {view !== 'reset' && view !== 'verify' && (
                <div className="flex flex-col gap-2">
                  {/*
                    * "Forgot?" sits on the label's line, not under the field.
                    *
                    * Under it, it is a third thing stacked between the password and the button,
                    * and it reads as a step. On the label's line it is what it is: a way out of
                    * this one field, offered where the field is named.
                    */}
                  <div className="flex items-baseline justify-between gap-3">
                    <label className={eyebrow} htmlFor="auth-password">
                      {t('auth.dialog.password')}
                    </label>
                    {view === 'signin' && (
                      <button
                        type="button"
                        className="rounded text-brand-tertiary text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand"
                        onClick={() => move('reset')}
                      >
                        {t('auth.dialog.forgot')}
                      </button>
                    )}
                  </div>
                  <PasswordInput
                    id="auth-password"
                    required
                    /*
                     * The browser needs telling which one this is: `current-password` on a sign-in
                     * and `new-password` on a sign-up, or a password manager offers the wrong
                     * thing and saves the wrong thing.
                     */
                    autoComplete={
                      view === 'signin' ? 'current-password' : 'new-password'
                    }
                    aria-label={t('auth.dialog.password')}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    inputGroupProps={{ size: 'xl' }}
                    /* The padlock goes with the envelope: the label says which field this is. */
                    classNames={{ startAddonClassName: 'hidden' }}
                  />
                </div>
              )}

              {view === 'signup' && (
                <label className="flex items-center gap-2 text-ink-secondary text-xs">
                  <Checkbox
                    checked={accepted}
                    onCheckedChange={(value) => setAccepted(value === true)}
                  />
                  {/* One sentence with the link dropped into it, so it can be reordered. */}
                  {t('auth.dialog.terms')
                    .split('{terms}')
                    .map((piece, index) => (
                      <span key={index}>
                        {piece}
                        {index === 0 && (
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-tertiary hover:underline"
                          >
                            {t('auth.dialog.terms.link')}
                          </a>
                        )}
                      </span>
                    ))}
                </label>
              )}

              {said && (
                <Typography
                  variant="p"
                  className={
                    done ? 'text-ink-secondary text-xs' : 'text-danger text-xs'
                  }
                  role={done ? 'status' : 'alert'}
                >
                  {said}
                </Typography>
              )}

              <Button
                type="submit"
                size="xl"
                rounded="full"
                fullWidth
                className="mt-1"
                isLoading={isSigningIn}
              >
                {view === 'signin'
                  ? t('auth.dialog.submit.signin')
                  : view === 'signup'
                    ? t('auth.dialog.submit.signup')
                    : view === 'verify'
                      ? t('auth.dialog.verify.submit')
                      : t('auth.dialog.submit.reset')}
              </Button>
            </form>

            {view !== 'reset' && view !== 'verify' && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <Separator className="flex-1" />
                  <Typography
                    variant="span"
                    textColor="secondary"
                    className="text-xxs uppercase tracking-[0.12em]"
                  >
                    {t('auth.dialog.or')}
                  </Typography>
                  <Separator className="flex-1" />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="xl"
                  rounded="full"
                  fullWidth
                  leftSlot={<GoogleGlyph aria-hidden className="size-4" />}
                  onClick={() => void signIn()}
                >
                  {t('auth.dialog.google')}
                </Button>
              </>
            )}

            {view === 'verify' ? (
              /*
               * A way out that is not a dead end. The account exists and works; what is missing is
               * a confirmed address, and trapping somebody in a modal over it is a worse product
               * than letting them convert a file and confirm from the account menu later.
               */
              <button
                type="button"
                className="mt-5 self-center rounded text-ink-secondary text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand"
                onClick={() => onOpenChange(false)}
              >
                {t('auth.dialog.verify.later')}
              </button>
            ) : view === 'reset' ? (
              <button
                type="button"
                className="mt-5 self-center rounded text-brand-tertiary text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand"
                onClick={() => move('signin')}
              >
                {t('auth.dialog.back')}
              </button>
            ) : (
              /*
               * Under Google rather than above it. The form is what this dialog is for, Google is
               * the shortcut past it, and "do you have one of these at all" is the question that
               * comes after both — not one wedged between the button and the alternative to it.
               */
              <Typography
                variant="p"
                textColor="secondary"
                className="mt-5 text-center text-xs"
              >
                {view === 'signin'
                  ? t('auth.dialog.tonew')
                  : t('auth.dialog.toexisting')}{' '}
                <button
                  type="button"
                  className="rounded font-medium text-brand-tertiary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-brand"
                  onClick={() => move(view === 'signin' ? 'signup' : 'signin')}
                >
                  {view === 'signin'
                    ? t('auth.dialog.tonew.action')
                    : t('auth.dialog.toexisting.action')}
                </button>
              </Typography>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
