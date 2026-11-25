import { useSignUpWithEmailPassword } from "@convex-dev/auth/methods/email-password/react";
import { Button } from "@/shared/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { AuthForm, emailField, newPasswordField } from "./auth-form";

export function EmailSignUpForm({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: () => void;
}) {
  const { signUp, pending } = useSignUpWithEmailPassword(api.auth);

  return (
    <div className="grid gap-3">
      <AuthForm
        fields={[emailField, newPasswordField]}
        label="Create account"
        pending={pending}
        submit={async ({ email, password }) => {
          const result = await signUp({ email, password });
          if (result.success) onSent();
          return result;
        }}
      />
      <Button variant="link" onPress={onBack} isDisabled={pending}>
        Back to sign in
      </Button>
    </div>
  );
}
