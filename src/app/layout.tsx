import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Source_Serif_4 } from "next/font/google";
import { Timeline } from "@/components/timeline";
import { getContent } from "@/lib/content";
import { OG_BASE, ogImageMeta } from "@/lib/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/paths";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { ...OG_BASE, type: "website", images: ogImageMeta("site", SITE_NAME) },
  twitter: { card: "summary_large_image", images: ogImageMeta("site", SITE_NAME) },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { milestones } = getContent();
  const timeline = milestones.map(({ slug, year, yearLabel, era, shortTitle, bonus }) => ({
    slug,
    year,
    yearLabel,
    era,
    shortTitle,
    bonus,
  }));

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <a
          href="#card"
          className="sr-only rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to the milestone card
        </a>
        <header className="mx-auto max-w-6xl px-4 pt-8 pb-5 sm:px-6">
          <p className="font-heading text-2xl font-semibold sm:text-3xl">
            <Link href="/" className="hover:underline">
              {SITE_NAME}
            </Link>
          </p>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            The ideas behind today&rsquo;s language models, 1943 to 2022. Pick a milestone on the timeline; each card
            starts in plain words and goes as deep as you like.
          </p>
        </header>
        <Timeline milestones={timeline} />
        <main>{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pt-6 pb-12 text-sm text-muted-foreground sm:px-6">
          Sources are linked on every card. Portrait credits sit under each portrait.
        </footer>
      </body>
    </html>
  );
}
