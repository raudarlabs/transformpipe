import { useEffect, useState } from 'react';
import { api, type UpdatesState } from './api';
import { useAuth } from './auth';

/*
 * Whether the signed-in account gets the monthly product update — one answer for the whole page.
 *
 * Two places show it, the box on the changelog and the switch in the account menu, and both can be
 * on screen at once. Each asking on its own meant pressing Subscribe in one left the other saying
 * Off. So the answer lives here, is fetched once per signed-in account, and every change reaches
 * every place that shows it.
 */

let current: UpdatesState | null = null;
let fetchedFor: string | null = null;
const listeners = new Set<(state: UpdatesState | null) => void>();

function publish(state: UpdatesState | null) {
  current = state;
  listeners.forEach((listener) => listener(state));
}

export function useUpdates() {
  const { user } = useAuth();
  const [state, setState] = useState<UpdatesState | null>(current);

  useEffect(() => {
    listeners.add(setState);
    setState(current);

    return () => {
      listeners.delete(setState);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      fetchedFor = null;
      publish(null);
      return;
    }

    if (fetchedFor === user.id) {
      return;
    }

    fetchedFor = user.id;
    api
      .updates()
      .then(publish)
      .catch(() => publish(null));
  }, [user]);

  /** Throws when the server refuses, so the caller can say so; the shared answer stays as it was. */
  const set = async (subscribed: boolean) => {
    publish(await api.setUpdates(subscribed));
  };

  return { state, set };
}
