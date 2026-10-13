import { Check, Mail } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api, type UpdatesState } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Typography } from '@/ui/components/Typography';

/*
 * The monthly product update, offered where somebody is already reading what shipped.
 *
 * Signed in, it is one press and the account's own address — nothing to type. Signed out, the
 * address goes to Brevo's double opt-in and nothing is sent until its owner confirms; the page
 * says so, because "subscribed" would be untrue until then. Coming back from that confirmation
 * lands here with `?subscribed=1`, and the box says it worked.
 *
 * `id="updates"` is the address the emails link to.
 */
export function UpdatesSignup() {
  const t = useT();
  const { user, isLoading } = useAuth();
  const [state, setState] = useState<UpdatesState | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setConfirmed(new URLSearchParams(location.search).get('subscribed') === '1');
  }, []);

  useEffect(() => {
    if (!user) {
      setState(null);
      return;
    }

    let live = true;

    api
      .updates()
      .then((next) => live && setState(next))
      .catch(() => live && setState(null));

    return () => {
      live = false;
    };
  }, [user]);

  const toggle = async (subscribed: boolean) => {
    setIsBusy(true);
    setError(null);

    try {
      setState(await api.setUpdates(subscribed));
    } catch {
      setError(t('updates.error'));
    } finally {
      setIsBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError(null);

    try {
      await api.confirmUpdates(email.trim());
      setSent(true);
    } catch {
      setError(t('updates.error'));
    } finally {
      setIsBusy(false);
    }
  };

  // Signed in on a deployment with no mail service for it: nothing to offer.
  if (isLoading || (user && state && !state.available)) {
    return null;
  }

  return (
    <section
      id="updates"
      className="flex scroll-mt-28 flex-col gap-3 rounded-xl border border-stroke bg-surface-card p-5"
    >
      <div className="flex items-center gap-2">
        <Mail className="size-4 text-ink-secondary" aria-hidden />
        <Typography variant="span" className="text-sm font-semibold">
          {t('updates.title')}
        </Typography>
      </div>

      <Typography variant="p" textColor="secondary" className="text-xs leading-relaxed">
        {t('updates.lede')}
      </Typography>

      {confirmed && !user && (
        <Typography variant="p" className="flex items-center gap-1.5 text-xs font-medium">
          <Check className="size-4 text-brand-tertiary" aria-hidden />
          {t('updates.confirmed')}
        </Typography>
      )}

      {user ? (
        state === null ? null : !state.verified ? (
          <Typography variant="p" textColor="light" className="text-xs">
            {t('updates.unverified')}
          </Typography>
        ) : state.subscribed ? (
          <div className="flex flex-col gap-2">
            <Typography variant="p" className="flex items-center gap-1.5 text-xs font-medium">
              <Check className="size-4 text-brand-tertiary" aria-hidden />
              {t('updates.subscribed')}
            </Typography>
            <Button
              variant="tertiary"
              size="sm"
              isLoading={isBusy}
              onClick={() => void toggle(false)}
              className="self-start"
            >
              {t('updates.unsubscribe')}
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            isLoading={isBusy}
            onClick={() => void toggle(true)}
            className="self-start"
          >
            {t('updates.subscribe')}
          </Button>
        )
      ) : sent ? (
        <Typography variant="p" className="flex items-center gap-1.5 text-xs font-medium">
          <Check className="size-4 text-brand-tertiary" aria-hidden />
          {t('updates.check')}
        </Typography>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-2">
          <label htmlFor="updates-email" className="sr-only">
            {t('updates.email.label')}
          </label>
          <Input
            id="updates-email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('updates.email.placeholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" variant="primary" size="sm" isLoading={isBusy} className="self-start">
            {t('updates.subscribe')}
          </Button>
        </form>
      )}

      {error && (
        <Typography variant="p" className="text-danger text-xs" role="alert">
          {error}
        </Typography>
      )}
    </section>
  );
}
