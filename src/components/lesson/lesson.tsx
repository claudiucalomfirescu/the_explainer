import Link from "next/link";
import type { Content } from "@/lib/content";
import { ERAS, type Milestone } from "@/lib/schema";
import { LessonRail } from "./lesson-rail";
import { LessonStage } from "./lesson-stage";
import { LessonTabs, type TabContent } from "./lesson-tabs";

/**
 * The lesson screen's frame (REQ-19): rail, header, the stage and steps (client), the text tabs
 * (client) and the era strip. Text comes from the milestone file, so the lesson and the card agree.
 */
export function Lesson({ milestone: m, content }: { milestone: Milestone; content: Content }) {
  const era = ERAS.find((e) => e.id === m.era)?.label ?? m.era;
  const titleOf = (slug: string) => content.milestones.find((x) => x.slug === slug)?.title ?? slug;

  const tabs: TabContent = {
    idea: m.idea,
    cameFrom: m.cameFrom.map((c) =>
      "milestone" in c ? { title: titleOf(c.milestone), href: `/${c.milestone}/`, note: c.note } : { title: c.label, note: c.note },
    ),
    people: m.people.map((p) => ({ name: content.people.get(p.person)?.name ?? p.person, note: p.note })),
    papers: m.papers.map((p) => ({
      title: p.title,
      byline: `${p.authors.join(", ")} · ${p.venue ?? p.publisher} · ${p.year}`,
      summary: p.summary,
      url: p.url,
    })),
  };

  return (
    <div className="lesson" data-testid="lesson">
      <LessonRail cardHref={`/${m.slug}/`} />

      <header className="lesson-head">
        <div>
          <p className="lesson-eyebrow">
            Lesson · {era} · {m.yearLabel}
          </p>
          <h1>{m.title}</h1>
        </div>
        <p className="lesson-year" aria-hidden="true">
          {m.yearLabel}
        </p>
      </header>

      <LessonStage steps={m.deeper.steps} />

      <LessonTabs content={tabs} />

      <nav className="lesson-strip" data-testid="lesson-strip" aria-label="All milestones">
        {ERAS.map((e) => {
          const items = content.milestones.filter((x) => x.era === e.id);
          return (
            <div key={e.id} className="lesson-era" data-testid="lesson-era">
              <span>{e.label}</span>
              <div className="lesson-era-row">
                {items.map((x) =>
                  x.slug === m.slug ? (
                    <span key={x.slug} className="lesson-ms" data-testid="lesson-milestone" data-slug={x.slug} aria-current="page">
                      <span className="y">{x.yearLabel}</span>
                      <span className="n">{x.shortTitle}</span>
                    </span>
                  ) : (
                    <Link key={x.slug} href={`/${x.slug}/`} className="lesson-ms" data-testid="lesson-milestone" data-slug={x.slug}>
                      <span className="y">{x.yearLabel}</span>
                      <span className="n">{x.shortTitle}</span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
