import { setupConvexAuthServer } from "@convex-dev/auth/ssr";
import { api } from "../../../convex/_generated/api";
import { convexUrl } from "./convex-url";

export const auth = setupConvexAuthServer({
  convexUrl,
  refreshSession: api.auth.refreshSession,
  signOut: api.auth.signOut,
  signIn: [
    api.auth.signInWithEmailPassword,
    api.auth.completeSignUpWithEmailPassword,
    api.auth.completePasswordRecovery,
    api.auth.finishSignInWithUsernamePasskey,
    api.auth.finishSignUpWithUsernamePasskey,
  ],
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
});
