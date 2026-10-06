import { AuthDialog } from '@/components/AuthDialog';
import { useAuth } from '@/lib/auth';

/*
 * The page an app's sign-in lands on when nobody is signed in here.
 *
 * Obsidian, or an assistant, sends the browser to /api/oauth/authorize; a signed-out person is
 * parked at /?connect=<id>, and this opens the sign-in over whatever the page is, naming the app.
 * Google, a password, or a new account with its code — whichever they pick, the auth provider
 * carries on to the consent page the moment there is a session. Closing it gives up the connection
 * and leaves them on the site, which is a page they can use rather than a dead end.
 */
export function ConnectGate() {
  const { user, connecting, leaveConnect } = useAuth();

  if (!connecting || user) {
    return null;
  }

  return (
    <AuthDialog
      open
      initial="signup"
      connectingTo={connecting.client}
      /* Stays open: the auth provider is already on its way to the consent page. */
      onSignedIn={() => undefined}
      onOpenChange={(open) => {
        if (!open) {
          leaveConnect();
        }
      }}
    />
  );
}
