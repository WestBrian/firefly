import "./globals.css";
import { Inter, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geistMonoHeading = Geist_Mono({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, geistMonoHeading.variable)}>
      <body>{children}</body>
    </html>
  );
}
