import { setupConvexAuthNextjs } from "@convex-dev/auth/ssr/nextjs";
import { env } from "@/env";
import { api } from "../../../convex/_generated/api";

export const {
  convexAuthNextjsProxy,
  ConvexAuthNextjsServerProvider,
  isAuthenticatedNextjs,
} = setupConvexAuthNextjs({
  convexUrl: env.NEXT_PUBLIC_CONVEX_URL,
  refreshSession: api.auth.refreshSession,
  isAuthenticated: api.auth.isAuthenticated,
});
