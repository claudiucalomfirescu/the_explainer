---
name: "how-it-works"
description: "Build an animated HTML visual showing how an AI mechanism works (neuron, network learning, attention): model it, write a verbal visual script, review, then build a scrubbable GSAP animation."
---

# How It Works (animated mechanism visuals)

The concept-explainer skill says *what* an idea is. This skill shows *how it works*: things on screen that move, flow and transform, so the reader watches the mechanism happen.

Typical inputs come from the concept-explainer's **How-it-works candidates** list, e.g. "a signal passing through one neuron", "a network adjusting its weights after a wrong answer", "attention mixing information between words".

## Principle: if you cannot say it, you cannot build it

Before any code, write a **visual script**: plain sentences that say what is on screen, how it moves, and in what order. The visual script is the spec. The build stage only implements it. If a beat cannot be described in words, it is not understood well enough to animate.

## Inputs

- **Mechanism** (required): one how-it-works candidate, with its one-sentence "what the visual should show".
- **Concept explainer** (recommended): the concept-explainer output, for vocabulary, analogy and the worked example. Reuse its terms exactly.
- **Narration** (optional): later, a voice track. For now, on-screen captions.

## Stages

### 1. Scope the mechanism

- One visual shows **one mechanism**, 30-90 seconds. Split anything bigger into episodes (e.g. "forward pass", then "error", then "weight update").
- Write the mechanism's **question** in one line: "What happens to an input as it passes through one neuron?"
- Write the **takeaway**: the one sentence the viewer should be able to say after watching.

### 2. Model the mechanism (the state model)

Write down, as a list, before any visuals:

- **Actors**: the things that exist (inputs, weights, neuron body, output, words, vectors...).
- **State**: what each actor holds that can change (a value, a strength, an on/off, a position).
- **Steps**: the ordered transitions, each "actor A does X, so state S changes from ... to ...".
- **Tiny real example**: actual small numbers that run through the steps. Compute them with code, so every value shown on screen is correct.

This is the truth the animation must respect. Numbers on screen come from here, never invented.

### 3. Choose the visual grammar

Fix one mapping from meaning to visual, and keep it the same across every visual in the series:

| Meaning | Visual |
|---|---|
| Signal / information flowing | Teal pulse travelling along a line |
| Strength (weight, attention score) | Line thickness and brightness |
| Inhibition / negative | Coral |
| Activation (how "on" a unit is) | Fill brightness of the node |
| A value being computed | The number appears in an HTML label next to the actor |
| Change during learning | The old value fades, the new one grows in, with a short ghost trail |

Palette and look follow the project's technical style: deep navy background, thin off-white linework, teal active, coral inhibition, no shadows, no cartoon shapes. **All text is HTML/SVG labels, never baked into images.**

### 4. Write the visual script

A numbered list of **beats**. Each beat has exactly these fields:

```
Beat 3 - "Weighting the inputs"
On screen:  three input nodes on the left, one neuron on the right, three lines joining them.
Motion:     a teal pulse leaves each input at the same time; line 1 is thick, line 3 is thin;
            the pulses arrive with brightness proportional to the line thickness.
Order:      pulses leave together (0.0s), arrive together (1.2s), then the three products
            appear as labels on the lines (1.4s), one after another 0.2s apart.
Caption:    "Each input is multiplied by how much the neuron trusts it."   (max ~12 words)
Numbers:    0.9 × 0.8 = 0.72, 0.5 × 0.4 = 0.20, 1.0 × 0.1 = 0.10   (from the state model)
Viewer should notice: the strong connection dominates.
```

Rules for the script:
- One new idea per beat. A beat is 3-10 seconds.
- Introduce actors before they act (pre-training): a beat that names the parts comes first.
- Motion must mean something. No decorative movement. Every move maps to a step in the state model.
- Keep the camera still unless zoom carries meaning (e.g. zoom from network into one neuron).
- End with a beat that replays the whole mechanism at speed, with the takeaway as the caption.

### 5. Independent review, then the user's review gate

First run a **separate reviewer** (a subagent with fresh context). It receives only `mechanism.md`, `visual-script.md` and the brief in [`reviewer.md`](reviewer.md); never the writer's reasoning or any HTML. Fix every blocker and major, mark the script "Revision N (after independent review)", and log findings and fixes in `review-log.md`.

Then show the visual script and the review log (and, ideally, 3-4 still keyframes rendered from a rough HTML draft) to the user **before** the full build. Changing words is cheap; changing animation is not.

### 6. Build

- One self-contained `index.html`. GSAP bundled locally (CDNs may be blocked). three.js only when 3D carries meaning; pin its version.
- **One paused GSAP master timeline.** One child timeline per beat, added with a label named after the beat (`tl.addLabel("beat-3-weighting")`). Scrubbing, chapters and later voice sync all hang off these labels.
- Diagrams as SVG, built in code or from Mermaid/D2 output, so every part can be animated.
- Player controls: play/pause, scrubber, beat chapters, caption line.
- Numbers on screen are read from a `state` object generated from the stage-2 model.
- Scrub-safety gotchas:
  - Counting number labels are proxy tweens with `onUpdate`. Always seek with `tl.seek(t, false)`; the default suppresses callbacks and the labels freeze.
  - Use `fromTo(..., {immediateRender:false})` for anything a later beat moves again.
  - Never switch label text in `onStart`; use a second label element.
- In Playwright never return the timeline from `page.evaluate` (write `() => { seek(t) }`): serialising it hangs or kills the page.
- Repo tooling: write `src.html` with a `<script>/*GSAP*/</script>` placeholder, then `python3 tools/how-it-works/build.py <dir>` inlines GSAP into `index.html`; `node tools/how-it-works/keyframes.js <dir>` renders the keyframes.

### 7. Check

- Render one keyframe near the end of each beat with Playwright and look at every frame.
- Also render a **scrub-backwards** frame (seek to the end, then back into a middle beat): labels and bars must show that beat's values.
- Run the keyframe part of [`reviewer.md`](reviewer.md) and record the result in `review-log.md`.
- For each beat check: does the screen match the "On screen" line, does the motion happen in the stated order, are labels legible, are numbers equal to the state model?
- Optional MP4: Playwright screenshot loop + FFmpeg, or `npx hyperframes render`.

## Output layout

```
<slug>/
  mechanism.md      # scope, question, takeaway, state model, visual grammar used
  visual-script.md  # the beats
  review-log.md     # reviewer findings, fixes, keyframe check
  index.html        # the animation
  keyframes/        # one PNG per beat, for review
```

## Later (not in v1)

- Voice: narration from the visual script captions, Kokoro TTS with word timestamps, GSAP labels synced to words.
- A shared component library (neuron, layer, weight line, token chip, attention arc) reused across visuals.
