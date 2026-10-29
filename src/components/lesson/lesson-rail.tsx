"use client";

import Link from "next/link";
import { BookOpen, ChartNoAxesGantt, Menu } from "lucide-react";
import { useState } from "react";

/** The collapsible rail on the lesson's left edge (REQ-19): back to the timeline, or the card view. */
export function LessonRail({ cardHref }: { cardHref: string }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="lesson-rail" data-open={open} aria-label="Lesson">
      <button type="button" aria-expanded={open} aria-label={open ? "Collapse the menu" : "Expand the menu"} onClick={() => setOpen((o) => !o)}>
        <Menu aria-hidden="true" />
      </button>
      <Link href="/" aria-label="Timeline">
        <ChartNoAxesGantt aria-hidden="true" />
        <span className="lab">Timeline</span>
      </Link>
      <Link href={cardHref} aria-label="Read as a card">
        <BookOpen aria-hidden="true" />
        <span className="lab">Read as a card</span>
      </Link>
    </nav>
  );
}
