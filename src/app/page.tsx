import { IconChartLine } from "@tabler/icons-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignIn } from "@/features/auth/components/sign-in";
import { isAuthenticatedNextjs } from "@/shared/providers/convex";
import portfolioIllustration from "./portfolio-illustration.webp";

// TODO(#11): Remove after upgrading to a Next.js release with the validation fix.
export const instant = false;

export default async function Home() {
  if (await isAuthenticatedNextjs()) redirect("/dashboard");

  return (
    <main className="min-h-svh bg-linear-to-br from-background via-background to-muted">
      <div className="mx-auto flex min-h-svh max-w-xl flex-col px-6 py-7 sm:px-10 sm:py-10 lg:max-w-7xl lg:px-14">
        <header className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <IconChartLine aria-hidden="true" className="size-5" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">
            Firefly
          </span>
        </header>

        <div className="grid items-center gap-8 pt-10 pb-4 sm:gap-10 sm:pt-14 lg:flex-1 lg:grid-cols-2 lg:gap-16 lg:py-12 xl:gap-20">
          <section
            aria-labelledby="home-title"
            className="space-y-5 lg:space-y-8"
          >
            <div className="space-y-3 lg:space-y-5">
              <h1
                id="home-title"
                className="max-w-lg text-4xl leading-tight font-semibold tracking-tighter text-balance sm:text-5xl xl:text-6xl"
              >
                A clearer view of your investments.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg">
                Your workspace for portfolios and investment research.
              </p>
            </div>

            <div className="relative hidden aspect-2/1 overflow-hidden rounded-3xl bg-muted ring-1 ring-border lg:block">
              <Image
                src={portfolioIllustration}
                alt=""
                fill
                sizes="(min-width: 1280px) 544px, (min-width: 1024px) 45vw, 1px"
                loading="eager"
                className="object-cover"
              />
            </div>
          </section>

          <div className="w-full max-w-lg lg:h-104 lg:max-w-sm lg:justify-self-center">
            <SignIn />
          </div>
        </div>
      </div>
    </main>
  );
}
