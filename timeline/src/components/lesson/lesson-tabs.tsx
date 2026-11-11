"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

export type TabContent = {
  idea: string;
  cameFrom: { title: string; href?: string; note: string }[];
  people: { name: string; note: string }[];
  papers: { title: string; byline: string; summary: string; url: string }[];
};

const TABS = [
  ["idea", "Idea"],
  ["came-from", "Where it came from"],
  ["who", "Who"],
  ["paper", "Paper"],
] as const;
type TabId = (typeof TABS)[number][0];

/** The panel's text tabs (REQ-19), with the ARIA tab pattern: arrow keys move, Enter or Space opens. */
export function LessonTabs({ content }: { content: TabContent }) {
  const [active, setActive] = useState<TabId>("idea");
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + TABS.length) % TABS.length;
    refs.current[next]?.focus();
    setActive(TABS[next][0]);
  };

  return (
    <section className="lesson-tabs" aria-label="About this milestone">
      <div role="tablist" aria-label="About this milestone" className="lesson-tablist">
        {TABS.map(([id, label], i) => (
          <button
            key={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-${id}-tab`}
            aria-selected={active === id}
            aria-controls={`${base}-panel`}
            tabIndex={active === id ? 0 : -1}
            onClick={() => setActive(id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-${active}-tab`} className="lesson-tabpanel" tabIndex={0}>
        {active === "idea" && <p className="lesson-idea">{content.idea}</p>}
        {active === "came-from" && (
          <ul>
            {content.cameFrom.map((c) => (
              <li key={c.title} className="lesson-box">
                <h2>{c.href ? <Link href={c.href}>{c.title}</Link> : c.title}</h2>
                <p>{c.note}</p>
              </li>
            ))}
          </ul>
        )}
        {active === "who" && (
          <ul>
            {content.people.map((p) => (
              <li key={p.name} className="lesson-box">
                <h2>{p.name}</h2>
                <p>{p.note}</p>
              </li>
            ))}
          </ul>
        )}
        {active === "paper" &&
          content.papers.map((p) => (
            <div key={p.title} className="lesson-box">
              <h2>{p.title}</h2>
              <p className="lesson-byline">{p.byline}</p>
              <p>{p.summary}</p>
              <p>
                <a href={p.url}>Read the paper</a>
              </p>
            </div>
          ))}
      </div>
    </section>
  );
}
