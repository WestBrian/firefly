import { setupConvexAuthNextjs } from "@convex-dev/auth/ssr/nextjs";
import { api } from "../../../convex/_generated/api";
import { convexUrl } from "./convex-url";

export const {
  convexAuthNextjsProxy,
  ConvexAuthNextjsServerProvider,
  isAuthenticatedNextjs,
} = setupConvexAuthNextjs({
  convexUrl,
  refreshSession: api.auth.refreshSession,
  isAuthenticated: api.auth.isAuthenticated,
});
