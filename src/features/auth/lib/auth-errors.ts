import type {
  CompletePasswordRecoveryResult,
  CompletePasswordRecoveryState,
  CompleteSignUpState,
  SignInResult,
  SignUpResult,
  StartPasswordRecoveryResult,
} from "@convex-dev/auth/methods/email-password/react";
import type {
  SignInWithUsernamePasskeyResult,
  UsernamePasskeyAutofillError,
} from "@convex-dev/auth/methods/username-passkey/react";

export type AuthResult =
  | SignInResult
  | SignUpResult
  | StartPasswordRecoveryResult
  | CompletePasswordRecoveryResult
  | SignInWithUsernamePasskeyResult;

type AuthError =
  | Extract<
      AuthResult | CompleteSignUpState | CompletePasswordRecoveryState,
      { userError: unknown }
    >["userError"]
  | UsernamePasskeyAutofillError;

export function authErrorMessage(error: AuthError): string {
  switch (error.error) {
    case "INVALID_EMAIL":
      return "Enter a valid email address.";
    case "INVALID_CREDENTIALS":
    case "USER_NOT_FOUND":
      return "The email address or password is incorrect.";
    case "EMAIL_TAKEN":
      return "Try signing in or resetting your password.";
    case "EMAIL_NOT_FOUND":
      return "Couldn’t find an account for that email address.";
    case "PASSWORD_TOO_SHORT":
      return `Use at least ${error.minimumLength} characters for your password.`;
    case "PASSWORD_TOO_LONG":
      return `Use at most ${error.maximumLength} characters for your password.`;
    case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
      return "Remove spaces at the start or end of your password.";
    case "PASSWORD_TOO_COMMON":
      return "Choose a less common password.";
    case "RATE_LIMITED":
      return `Too many attempts. Try again in ${Math.ceil((error.retryAfterMs ?? 1000) / 1000)} seconds.`;
    case "MISSING_SECRET":
      return "Open the link in the browser where you requested it.";
    case "INVALID_CHALLENGE":
    case "INCORRECT_CODE":
      return "This link has expired or is invalid. Request a new one.";
    case "USERNAME_TOO_SHORT":
      return "Enter a username.";
    case "USERNAME_TOO_LONG":
      return `Use at most ${error.maximumLength} characters for your username.`;
    case "USERNAME_HAS_SURROUNDING_WHITESPACE":
      return "Remove spaces at the start or end of your username.";
    case "USERNAME_HAS_INVALID_CHARACTERS":
      return "Choose a username with supported characters.";
    case "USERNAME_TAKEN":
      return "Choose a different username.";
    case "WEBAUTHN_UNSUPPORTED":
      return "Try a browser that supports passkeys or continue with email.";
    case "CEREMONY_ABORTED":
      return "Passkey sign-in was canceled or timed out. Try again.";
    case "PASSKEY_ALREADY_REGISTERED":
      return "This passkey is already registered. Select a different passkey.";
    case "UNKNOWN_CREDENTIAL":
      return "Select the passkey you registered for this username.";
    case "CHALLENGE_EXPIRED":
      return "The passkey request expired. Try again.";
    case "ALREADY_PENDING":
      return "Finish the current passkey prompt first.";
    case "PROTOCOL_ERROR":
    case "OTHER_ERROR":
      return "Something went wrong. Please try again.";
    default:
      error satisfies never;
      return "Something went wrong. Please try again.";
  }
}
