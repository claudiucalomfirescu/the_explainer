"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { ERAS } from "@/lib/schema";

export type TimelineMilestone = {
  slug: string;
  year: number;
  yearLabel: string;
  era: string;
  shortTitle: string;
  bonus: boolean;
};

/**
 * The horizontal era timeline (REQ-1). It lives in the root layout, so it stays mounted across
 * navigations and keeps its own scroll position; the active marker comes from the URL (REQ-8).
 */
export function Timeline({ milestones }: { milestones: TimelineMilestone[] }) {
  const segment = useSelectedLayoutSegment();
  const active = segment ?? milestones[0]?.slug;
  const router = useRouter();
  const reduce = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);

  // Keep the active marker inside the strip's visible area (REQ-16). Scrolls the strip only,
  // never the page. The first positioning is instant, so a shared link opens with its marker
  // already in view; later changes glide unless the reader asks for reduced motion.
  useEffect(() => {
    const strip = stripRef.current;
    const marker = strip?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    if (!strip || !marker) return;
    const first = !positioned.current;
    positioned.current = true;
    const s = strip.getBoundingClientRect();
    const m = marker.getBoundingClientRect();
    if (m.left >= s.left && m.right <= s.right) return;
    const left = strip.scrollLeft + (m.left - s.left) - (s.width - m.width) / 2;
    strip.scrollTo({ left, behavior: first || reduce ? "instant" : "smooth" });
  }, [active, reduce]);

  return (
    <nav aria-label="Timeline of milestones" data-testid="timeline" className="border-y border-border bg-card/70">
      <div ref={stripRef} data-testid="timeline-strip" className="timeline-strip overflow-x-auto overscroll-x-contain">
        <ol className="mx-auto flex w-max min-w-full gap-0 px-4 py-4 sm:px-6">
          {ERAS.map((era) => {
            const items = milestones.filter((m) => m.era === era.id);
            return (
              <li
                key={era.id}
                data-testid="era"
                data-era-id={era.id}
                className="flex flex-col border-l border-border pr-3 pl-3 first:border-l-0 first:pl-0"
              >
                <span data-testid="era-label" className="text-sm font-semibold text-muted-foreground">
                  {era.label}
                </span>
                <ol className="relative mt-3 flex gap-2 before:absolute before:inset-x-0 before:top-[7px] before:h-px before:bg-border">
                  {items.length === 0 && (
                    <li className="w-28 pt-6 text-sm text-muted-foreground italic">More soon</li>
                  )}
                  {items.map((m) => {
                    const isActive = m.slug === active;
                    const href = `/${m.slug}/`;
                    return (
                      <li key={m.slug}>
                        <Link
                          href={href}
                          scroll={false}
                          data-testid="marker"
                          data-slug={m.slug}
                          data-year={m.year}
                          data-era={m.era}
                          aria-current={isActive ? "true" : undefined}
                          onKeyDown={(e) => {
                            // Links react to Enter only; REQ-2 asks for Space too.
                            if (e.key === " ") {
                              e.preventDefault();
                              router.push(href, { scroll: false });
                            }
                          }}
                          className="group relative flex w-36 flex-col items-start gap-1 rounded-md px-1.5 pb-2 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-[current=true]:bg-accent"
                        >
                          <span
                            aria-hidden="true"
                            className="relative z-10 size-3.5 rounded-full border-2 border-primary bg-background transition-colors group-aria-[current=true]:bg-primary"
                          />
                          <span data-testid="marker-year" className="text-sm font-semibold tabular-nums">
                            {m.yearLabel}
                          </span>
                          <span
                            data-testid="marker-title"
                            className="text-sm leading-snug text-muted-foreground group-aria-[current=true]:font-medium group-aria-[current=true]:text-foreground"
                          >
                            {m.shortTitle}
                          </span>
                          {m.bonus && (
                            <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Bonus</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
