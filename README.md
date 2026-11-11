# The Explainer

Animated HTML and video explainers of AI concepts, plus the skills that make them.

## Repository map

| Folder | What it holds |
|---|---|
| `skills/` | Claude skills for the pipeline (`SKILL.md` + a `reviewer.md` brief each). The live copies sit in claude.ai skills; these files are the reviewed source. |
| `skills/concept-explainer/` | Stage 1: break an ask into core concepts and explain each in plain words, no maths. Ends with a list of mechanisms worth animating. |
| `skills/how-it-works/` | Stage 2: turn one mechanism into a scrubbable GSAP animation, via a state model and a written visual script. |
| `skills/archive/` | Retired skills (the three-level layered-explainer). |
| `explainers/` | Finished explainers, one folder each: concept text, review log, and `how-it-works/` visuals. |
| `tools/how-it-works/` | Build (inline GSAP into one HTML file) and keyframe rendering. |
| `docs/pipeline.md` | How the two skills connect, the review stages, and the decisions so far. |
| `timeline/` | The AI History Timeline web app (Next.js, static export). It has its own README, docs and tests. |

## Pipeline in one line

Ask → **concept-explainer** (intake, explain, independent review) → how-it-works candidates → **how-it-works** (state model, visual script, independent review, owner review, build, keyframe check).

## Explainers

- [`explainers/neuron/`](explainers/neuron/): one artificial neuron. The concept text is in `neuron.md`, and the 56-second animation is in `how-it-works/index.html` (open it in a browser).

## Commands

```bash
# Build a how-it-works visual (src.html -> self-contained index.html)
python3 tools/how-it-works/build.py explainers/neuron/how-it-works
# Render one keyframe per beat, plus a scrub-backwards check (needs Playwright + Chromium)
node tools/how-it-works/keyframes.js explainers/neuron/how-it-works

# Timeline app
cd timeline && pnpm install && pnpm dev
```

## Third-party code

- `tools/how-it-works/gsap-3.12.5.min.js` is GSAP 3.12.5 (GreenSock), under the GSAP standard licence (no charge). It is bundled locally because CDNs can be blocked, and it is inlined into each built visual.
