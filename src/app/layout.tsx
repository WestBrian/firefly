import "./globals.css";
import { Inter, Geist_Mono } from "next/font/google";
import { cn } from "@/shared/lib/utils";
import { Suspense } from "react";
import { ConvexAuthNextjsServerProvider } from "@/shared/providers/convex";

const geistMonoHeading = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable, geistMonoHeading.variable)}
    >
      <body>
        <Suspense>
          <ConvexAuthNextjsServerProvider>
            {children}
          </ConvexAuthNextjsServerProvider>
        </Suspense>
      </body>
    </html>
  );
}
