"use client";

import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { VISUALS } from "@/lib/schema";
import { HopfieldWidget } from "./hopfield-widget";
import { TransformerEmbed } from "./transformer-embed";

type Visual = (typeof VISUALS)[number];

type Step = { heading: string; body: string };

/** Part 5, closed by default: the last rung of the depth ladder (REQ-7), with the card's visual. */
export function Deeper({ steps, visual, headingId }: { steps: Step[]; visual?: Visual; headingId: string }) {
  return (
    <Collapsible>
      <h2 id={headingId} className="m-0">
        <CollapsibleTrigger
          data-testid="deeper-trigger"
          className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left font-heading text-xl font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span>
            Go deeper: how it works
            <span className="mt-0.5 block font-sans text-sm font-normal text-muted-foreground">
              {steps.length} short steps
            </span>
          </span>
          <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-data-[panel-open]:rotate-180" />
        </CollapsibleTrigger>
      </h2>
      <CollapsibleContent>
        <ol className="mt-4 space-y-5 border-l-2 border-primary/30 pl-5">
          {steps.map((step, i) => (
            <li key={step.heading} data-testid="deeper-step">
              <h3 className="text-base font-semibold">
                <span className="mr-2 text-primary tabular-nums">{i + 1}.</span>
                {step.heading}
              </h3>
              <p className="mt-1">{step.body}</p>
            </li>
          ))}
        </ol>
        {visual === "hopfield" && <HopfieldWidget />}
        {visual === "transformer" && <TransformerEmbed />}
      </CollapsibleContent>
    </Collapsible>
  );
}
