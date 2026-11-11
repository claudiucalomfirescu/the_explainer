import Link from "next/link";
import { Timeline } from "@/components/timeline";
import { getContent } from "@/lib/content";
import { SITE_NAME } from "@/lib/paths";

/** The site's chrome around every card page: skip link, header, timeline, footer (ADR-004). */
export default function TimelineLayout({ children }: { children: React.ReactNode }) {
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
    <>
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
    </>
  );
}
