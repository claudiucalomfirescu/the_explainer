# Explainer pipeline: two skills

## How the two skills connect

1. **concept-explainer** (replaces layered-explainer)
   - Intake: break the ask into 3-7 core concepts, bottom-up, mark the threshold concept, pick depth per concept (Full / Brief / Link).
   - Explain each concept at one level, between the old L1 and L2. Conceptual, no maths.
   - Output ends with a **How-it-works candidates** list: the mechanisms worth watching, each with one sentence on what the visual should show.
2. **how-it-works** (new)
   - Takes one candidate at a time.
   - Scope -> state model (actors, state, steps, real tiny numbers) -> visual grammar -> **visual script** (beats: on screen / motion / order / caption / numbers) -> review gate -> build (GSAP master timeline, SVG, HTML labels) -> keyframe check.
   - Reuses the concept explainer's terms and worked example, so text and visual tell the same story.

A full explainer of, say, "the transformer" = concept explainer text + a few short how-it-works visuals (e.g. "attention mixing words", "one token through a layer"), linked from the matching concept's "Watch it" line.

## Review stages

Each stage is checked by an **independent reviewer**: a subagent with fresh context, the output files, and a written brief. It never sees the writer's reasoning, and it never edits files.

| After | Reviewer brief | Then |
|---|---|---|
| Concept text | `skills/concept-explainer/reviewer.md` | Fix the findings, log them in `review-log.md`, deliver |
| Visual script | `skills/how-it-works/reviewer.md` | Fix the findings, log them, then the owner reviews the script before the build |
| Build | Keyframe part of the same brief, plus a scrub-backwards frame | Fix, log, publish |

A writer's self-check does not replace the reviewer. In the first neuron run, both reviews came back FIX FIRST (`explainers/neuron/review-log.md`).

## Decisions (2026-11-11)

1. The skill is renamed to **concept-explainer**. The three-level layered-explainer is archived in `skills/archive/`.
2. There are **two separate skills**. They produce different outputs and have different review points.
3. A visual is 30-90 s per mechanism. A bigger mechanism is split into episodes.
4. v1 uses on-screen captions only. Voice (Kokoro, word timestamps) comes later.
5. The first test is "a signal passing through one neuron" (`explainers/neuron/`). Next is "a network learning from one mistake".
