import { useSignInWithEmailPassword } from "@convex-dev/auth/methods/email-password/react";
import { api } from "../../../../convex/_generated/api";
import { AuthForm, emailField, passwordField } from "./auth-form";

export function EmailSignInForm({
  onSubmittingChange,
}: {
  onSubmittingChange: (submitting: boolean) => void;
}) {
  const { signIn, pending } = useSignInWithEmailPassword(api.auth);

  return (
    <AuthForm
      fields={[emailField, passwordField]}
      label="Sign in"
      variant="secondary"
      pending={pending}
      onSubmittingChange={onSubmittingChange}
      submit={({ email, password }) => signIn({ email, password })}
    />
  );
}
