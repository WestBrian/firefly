import { setupConvexAuthServer } from "@convex-dev/auth/ssr";
import { env } from "@/env";
import { api } from "../../../convex/_generated/api";

export const auth = setupConvexAuthServer({
  convexUrl: env.NEXT_PUBLIC_CONVEX_URL,
  refreshSession: api.auth.refreshSession,
  signOut: api.auth.signOut,
  signIn: [
    api.auth.signInWithEmailPassword,
    api.auth.completeSignUpWithEmailPassword,
    api.auth.completePasswordRecovery,
    api.auth.finishSignInWithUsernamePasskey,
    api.auth.finishSignUpWithUsernamePasskey,
  ],
  cookieOptions: { secure: env.NODE_ENV === "production" },
});
