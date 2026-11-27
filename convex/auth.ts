import { setupEmailPassword } from "@convex-dev/auth/methods/email-password/server";
import { setupUsernamePasskey } from "@convex-dev/auth/methods/username-passkey/server";
import { setupConvexAuth } from "@convex-dev/auth/server";
import { APP_NAME } from "../src/shared/lib/constants";
import { components, internal } from "./_generated/api";
import { env } from "./_generated/server";

const auth = setupConvexAuth({ component: components.auth });
const userCallbacks = { createUser: internal.users.createUser };
const siteUrl = new URL(env.SITE_URL);

const emailSender = {
  kind: "resend" as const,
  sendEmail: components.resend.lib.sendEmail,
  apiKey: env.RESEND_KEY,
  from: `${env.SENDER_NAME} <${env.SENDER_EMAIL}>`,
};

export const { signOut, refreshSession, isAuthenticated } = auth;

export const {
  signUpWithEmailPassword,
  completeSignUpWithEmailPassword,
  signInWithEmailPassword,
  startPasswordRecovery,
  checkPasswordRecovery,
  completePasswordRecovery,
} = setupEmailPassword(auth, {
  component: components.authEmail,
  passwordComponent: components.authPassword,
  emailSender,
  urls: {
    signUp: new URL("/validate-email", siteUrl).href,
    changeEmail: new URL("/confirm-email-change", siteUrl).href,
    recovery: new URL("/reset-password", siteUrl).href,
  },
}).attachUserCallbacks(userCallbacks);

export const {
  startSignInWithUsernamePasskey,
  startAutofillSignInWithUsernamePasskey,
  finishSignInWithUsernamePasskey,
  finishSignUpWithUsernamePasskey,
} = setupUsernamePasskey(auth, {
  component: components.authPasskey,
  usernameComponent: components.authUsername,
  rpId: env.PASSKEY_RP_ID ?? siteUrl.hostname,
  rpName: APP_NAME,
  origin:
    env.PASSKEY_ORIGIN?.split(",").map((origin) => origin.trim()) ??
    siteUrl.origin,
}).attachUserCallbacks(userCallbacks);
