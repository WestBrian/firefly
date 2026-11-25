"use client";

import {
  useCompletePasswordRecovery,
  useCompleteSignUpWithEmailPassword,
  type CompletePasswordRecoveryState,
  type CompleteSignUpState,
} from "@convex-dev/auth/methods/email-password/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { api } from "../../../../convex/_generated/api";
import { authErrorMessage } from "../lib/auth-errors";
import { AuthForm, newPasswordField } from "./auth-form";

export function EmailLink({ flow }: { flow: "verification" | "recovery" }) {
  const code = useSearchParams().get("code");
  const CompleteLink = flow === "verification" ? VerifyEmail : ResetPassword;
  return (
    <main className="mx-auto grid w-full max-w-md gap-4 px-6 py-16">
      {!code ? (
        <LinkError message="This link is missing its code. Request a new one." />
      ) : (
        <CompleteLink key={code} code={code} />
      )}
    </main>
  );
}

function VerifyEmail({ code }: { code: string }) {
  return (
    <LinkResult
      state={useCompleteSignUpWithEmailPassword(api.auth, { emailCode: code })}
    />
  );
}

function ResetPassword({ code }: { code: string }) {
  const state = useCompletePasswordRecovery(api.auth, { emailCode: code });

  if (state.status !== "ready") return <LinkResult state={state} />;

  return (
    <Card variant="panel">
      <CardHeader>
        <CardTitle>
          <h1>Reset your password</h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AuthForm
          fields={[newPasswordField]}
          label="Reset password"
          pending={state.pending}
          submit={({ password }) =>
            state.completePasswordRecovery({ newPassword: password })
          }
        />
      </CardContent>
    </Card>
  );
}

function LinkResult({
  state,
}: {
  state:
    | CompleteSignUpState
    | Exclude<CompletePasswordRecoveryState, { status: "ready" }>;
}) {
  const router = useRouter();
  const complete = state.status === "complete";
  useEffect(() => {
    if (complete) router.replace("/dashboard");
  }, [complete, router]);

  if (state.status === "error")
    return <LinkError message={authErrorMessage(state.userError)} />;
  return (
    <Alert role="status">
      <AlertDescription>
        {complete ? "Signing you in…" : "Checking your link…"}
      </AlertDescription>
    </Alert>
  );
}

function LinkError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>Couldn’t open this link</h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Link href="/" className={buttonVariants({ variant: "link" })}>
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
