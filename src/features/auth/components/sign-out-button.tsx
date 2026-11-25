"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSignOut() {
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/auth/signout", { method: "POST" });
      if (!response.ok) throw new Error("Sign-out request failed.");
      await signOut();
      router.replace("/");
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        variant="outline"
        isDisabled={pending}
        onPress={() => void handleSignOut()}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {failed && (
        <Alert variant="destructive">
          <AlertDescription>
            Couldn’t sign out. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
