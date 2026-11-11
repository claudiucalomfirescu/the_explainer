"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// False until the first page has mounted. The first render (including the static HTML) must show
// the card fully, so only later navigations animate in.
let hasNavigated = false;

/**
 * Re-mounts on every navigation (Next.js template), so the card can animate in (REQ-2). The
 * animation is skipped when the reader asks for reduced motion, and the card is scrolled into
 * view only when its top is outside the viewport.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Decided once per mount: animate only navigations after the first page, never on reduced motion.
  const [animateIn] = useState(() => hasNavigated && !reduce);

  useEffect(() => {
    if (!hasNavigated) {
      hasNavigated = true;
      return;
    }
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight) {
      el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }, [reduce]);

  return (
    <motion.div
      ref={ref}
      id="card"
      data-testid="card-motion"
      className="scroll-mt-4"
      initial={animateIn ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
