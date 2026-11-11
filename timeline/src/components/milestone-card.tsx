import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Content } from "@/lib/content";
import { hasLesson } from "@/lib/lessons";
import { ERAS, type Milestone } from "@/lib/schema";
import { Deeper } from "./deeper";
import { Person } from "./person";

function PartHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">
      {children}
    </h2>
  );
}

/**
 * The card: five parts in a fixed order (REQ-3 to REQ-7). Parts 1 to 4 are open; part 5 is
 * behind one click (the depth ladder).
 */
export function MilestoneCard({ milestone: m, content }: { milestone: Milestone; content: Content }) {
  const era = ERAS.find((e) => e.id === m.era)?.label;
  const index = content.milestones.findIndex((x) => x.slug === m.slug);
  const prev = content.milestones[index - 1];
  const next = content.milestones[index + 1];
  const bySlug = new Map(content.milestones.map((x) => [x.slug, x]));
  const id = (part: string) => `${m.slug}-${part}`;

  return (
    <article data-testid="card" aria-labelledby={id("title")} className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <p data-small-print className="text-sm text-muted-foreground">
        {m.yearLabel} · {era}
        {m.bonus && " · Bonus card"}
      </p>
      <h1 id={id("title")} className="mt-1 font-heading text-3xl leading-tight font-semibold text-balance sm:text-4xl">
        {m.title}
      </h1>

      <section data-part="idea" aria-labelledby={id("idea")} className="mt-6">
        <h2 id={id("idea")} className="sr-only">
          The idea in plain words
        </h2>
        <p className="font-heading text-xl leading-relaxed sm:text-2xl">{m.idea}</p>
      </section>

      <section data-part="came-from" aria-labelledby={id("came-from")} className="mt-10">
        <PartHeading id={id("came-from")}>Where it came from</PartHeading>
        <ul className="space-y-3">
          {m.cameFrom.length === 0 && <li>This is where the story starts.</li>}
          {m.cameFrom.map((source) =>
            "milestone" in source ? (
              <li key={source.milestone}>
                <Link
                  href={`/${source.milestone}/`}
                  scroll={false}
                  className="font-semibold text-primary underline underline-offset-4 hover:no-underline"
                >
                  {bySlug.get(source.milestone)?.title} ({bySlug.get(source.milestone)?.yearLabel})
                </Link>
                <p className="mt-0.5">{source.note}</p>
              </li>
            ) : (
              <li key={source.label}>
                <span className="font-semibold">{source.label}</span>
                <p className="mt-0.5">{source.note}</p>
              </li>
            ),
          )}
        </ul>
      </section>

      <section data-part="who" aria-labelledby={id("who")} className="mt-10">
        <PartHeading id={id("who")}>Who</PartHeading>
        <ul className="space-y-5">
          {m.people.map((p) => {
            const person = content.people.get(p.person);
            return person ? <Person key={p.person} person={person} note={p.note} /> : null;
          })}
        </ul>
        {m.moreAuthors && (
          <p className="mt-4 text-muted-foreground">
            {m.papers.length > 1 ? "These papers had" : "The paper had"} more authors than are shown here.
          </p>
        )}
      </section>

      <section data-part="paper" aria-labelledby={id("paper")} className="mt-10">
        <PartHeading id={id("paper")}>{m.papers.length > 1 ? "The papers" : "The paper"}</PartHeading>
        <div className="space-y-4">
          {m.papers.map((paper) => (
            <div key={paper.url} className="rounded-lg border border-border bg-card p-4 sm:p-5">
              <p className="font-heading text-lg leading-snug font-semibold">
                <a href={paper.url} className="underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
                  {paper.title}
                  <ExternalLink aria-hidden="true" className="ml-1.5 inline size-4 align-[-2px] text-primary" />
                </a>
              </p>
              <p className="mt-1 text-muted-foreground">
                {paper.authors.join(", ")} · {paper.year} · {paper.venue ?? paper.publisher}
              </p>
              <p className="mt-3">{paper.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-part="deeper" aria-labelledby={id("deeper")} className="mt-10">
        <Deeper steps={m.deeper.steps} visual={m.deeper.visual} headingId={id("deeper")} />
        {hasLesson(m.slug) && (
          <p className="mt-4">
            <Link data-testid="lesson-link" href={`/lesson/${m.slug}/`} className="font-medium text-primary underline underline-offset-4">
              Open the lesson: the network and its energy valley on one screen
            </Link>
          </p>
        )}
      </section>

      <nav aria-label="Previous and next milestone" className="mt-12 flex flex-wrap justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link href={`/${prev.slug}/`} scroll={false} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span>
              <span className="sr-only">Previous: </span>
              {prev.shortTitle}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/${next.slug}/`} scroll={false} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
            <span>
              <span className="sr-only">Next: </span>
              {next.shortTitle}
            </span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </nav>
    </article>
  );
}
