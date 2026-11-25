import { IconChartLine } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { isAuthenticatedNextjs } from "@/shared/providers/convex";

// TODO(#11): Remove after upgrading to a Next.js release with the validation fix.
export const instant = false;

export default async function Dashboard() {
  if (!(await isAuthenticatedNextjs())) redirect("/");

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-5 sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <IconChartLine aria-hidden="true" className="size-4" />
            </span>
            <span className="font-heading text-lg font-semibold">Firefly</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:px-10 lg:px-14">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Portfolio overview</h2>
            </CardTitle>
            <CardDescription>No portfolio data yet.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
