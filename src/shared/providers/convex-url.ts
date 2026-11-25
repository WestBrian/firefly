const url = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!url) {
  throw new Error("Set NEXT_PUBLIC_CONVEX_URL to your Convex deployment URL.");
}

export const convexUrl = url;
