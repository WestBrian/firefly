import { useStartPasswordRecovery } from "@convex-dev/auth/methods/email-password/react";
import { Button } from "@/shared/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { AuthForm, emailField } from "./auth-form";

export function PasswordRecoveryForm({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: () => void;
}) {
  const { startPasswordRecovery, pending } = useStartPasswordRecovery(api.auth);

  return (
    <div className="grid gap-3">
      <AuthForm
        fields={[emailField]}
        label="Send reset link"
        pending={pending}
        submit={async ({ email }) => {
          const result = await startPasswordRecovery({ email });
          if (result.success || result.userError.error === "EMAIL_NOT_FOUND") {
            onSent();
            return { success: true };
          }
          return result;
        }}
      />
      <Button variant="link" onPress={onBack} isDisabled={pending}>
        Back to sign in
      </Button>
    </div>
  );
}
