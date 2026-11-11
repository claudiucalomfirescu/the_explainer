import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { OG_BASE, ogImageMeta } from "@/lib/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/paths";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });
// Labels on the lesson screen (REQ-19); self-hosted at build like the other two.
const mono = JetBrains_Mono({ variable: "--font-mono-lesson", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { ...OG_BASE, type: "website", images: ogImageMeta("site", SITE_NAME) },
  twitter: { card: "summary_large_image", images: ogImageMeta("site", SITE_NAME) },
};

/** The document shell only. The site chrome lives in (timeline)/layout.tsx; the lesson draws its own (ADR-004). */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
