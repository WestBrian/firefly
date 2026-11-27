"use client";

import { useState } from "react";
import { IconChartLine, IconFingerprint } from "@tabler/icons-react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { redirect } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { APP_NAME } from "@/shared/lib/constants";
import { AnimatedAuthPanel } from "./animated-auth-panel";
import { EmailSignInForm } from "./email-sign-in-form";
import { EmailSignUpForm } from "./email-sign-up-form";
import { InboxNotice } from "./inbox-notice";
import { PasskeyForm } from "./passkey-form";
import { PasswordRecoveryForm } from "./password-recovery-form";

export function SignIn() {
  return (
    <>
      <AuthLoading>
        <SignInCardSkeleton />
      </AuthLoading>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInCard />
      </Unauthenticated>
    </>
  );
}

function RedirectToDashboard() {
  return redirect("/dashboard");
}

function SignInCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <span className="sr-only" role="status">
        Checking your session…
      </span>
      <div className="invisible" aria-hidden="true" inert>
        <SignInCard />
      </div>
      <Skeleton className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}

function SignInCard() {
  const [step, setStep] = useState<
    | "options"
    | "passkey"
    | "signup"
    | "recovery"
    | "verify-inbox"
    | "reset-inbox"
  >("options");
  const back = () => setStep("options");
  const panels = {
    options: (
      <SignInOptions
        onPasskey={() => setStep("passkey")}
        onSignUp={() => setStep("signup")}
        onRecovery={() => setStep("recovery")}
      />
    ),
    passkey: <PasskeyForm onBack={back} />,
    signup: (
      <EmailSignUpForm onBack={back} onSent={() => setStep("verify-inbox")} />
    ),
    recovery: (
      <PasswordRecoveryForm
        onBack={back}
        onSent={() => setStep("reset-inbox")}
      />
    ),
    "verify-inbox": (
      <InboxNotice onBack={back}>
        Open the link we sent to verify your email and sign in.
      </InboxNotice>
    ),
    "reset-inbox": (
      <InboxNotice onBack={back}>
        If there’s an account for that address, we’ll send a password reset
        link.
      </InboxNotice>
    ),
  };

  return (
    <Card variant="panel">
      <CardHeader>
        <div className="mx-auto mb-2 grid size-10 place-items-center rounded-xl bg-muted">
          <IconChartLine aria-hidden="true" className="size-5" />
        </div>
        <CardTitle>
          <h2>Welcome to {APP_NAME}</h2>
        </CardTitle>
        <CardDescription>Sign in or create your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatedAuthPanel step={step} direction={step === "options" ? -1 : 1}>
          {panels[step]}
        </AnimatedAuthPanel>
      </CardContent>
    </Card>
  );
}

function SignInOptions({
  onPasskey,
  onSignUp,
  onRecovery,
}: {
  onPasskey: () => void;
  onSignUp: () => void;
  onRecovery: () => void;
}) {
  const [submittingEmail, setSubmittingEmail] = useState(false);

  return (
    <div className="grid gap-5">
      <Button
        className="w-full"
        size="lg"
        onPress={onPasskey}
        isDisabled={submittingEmail}
      >
        <IconFingerprint aria-hidden="true" data-icon="inline-start" />
        Continue with passkey
      </Button>
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="flex-1">
          <Separator aria-hidden="true" />
        </div>
        <span>or continue with email</span>
        <div className="flex-1">
          <Separator aria-hidden="true" />
        </div>
      </div>
      <EmailSignInForm onSubmittingChange={setSubmittingEmail} />
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="link" onPress={onSignUp} isDisabled={submittingEmail}>
          Create account
        </Button>
        <Button
          variant="link"
          onPress={onRecovery}
          isDisabled={submittingEmail}
        >
          Forgot password?
        </Button>
      </div>
    </div>
  );
}
