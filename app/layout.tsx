import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { Analytics } from "@/components/Analytics";
import { CookieProvider } from "@/components/cookies/CookieProvider";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";
import "@/styles/animations.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  ...defaultMetadata,
};

export const viewport: Viewport = {
  themeColor: "#213398",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`} suppressHydrationWarning>
        <CookieProvider>
          {children}
          <ScrollToTop />
          <Analytics />
        </CookieProvider>
      </body>
    </html>
  );
}
