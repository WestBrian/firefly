import { convexAuthNextjsProxy } from "@/shared/providers/convex";

export default convexAuthNextjsProxy();

export const config = {
  matcher: ["/((?!auth(?:/|$)|_next/static|_next/image|favicon.ico).*)"],
};
