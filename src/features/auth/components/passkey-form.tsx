import { useSignInWithUsernamePasskey } from "@convex-dev/auth/methods/username-passkey/react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import { authErrorMessage } from "../lib/auth-errors";
import { AuthForm, usernameField } from "./auth-form";

export function PasskeyForm({ onBack }: { onBack: () => void }) {
  const { signIn, pending, autofill } = useSignInWithUsernamePasskey(api.auth);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="grid gap-3">
      <AuthForm
        fields={[usernameField]}
        label="Continue with passkey"
        pending={pending}
        onSubmittingChange={setSubmitting}
        submit={({ username }) => signIn({ username })}
      >
        {autofill.lastError && (
          <Alert variant="destructive">
            <AlertDescription>
              {authErrorMessage(autofill.lastError)}
            </AlertDescription>
          </Alert>
        )}
      </AuthForm>
      <Button
        variant="link"
        onPress={onBack}
        isDisabled={pending || submitting}
      >
        Back to sign-in options
      </Button>
    </div>
  );
}
