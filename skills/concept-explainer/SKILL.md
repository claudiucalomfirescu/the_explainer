---
name: "concept-explainer"
description: "Explain an AI concept, model or paper in plain text for a smart non-specialist: break the ask into core concepts, explain each without maths, and flag mechanisms for a how-it-works visual."
---

# Concept Explainer

Turn an ask ("explain transformers", "what is RLHF", "explain this paper") into clear text explanations of its core concepts.
One audience, one level. Conceptual, not mathematical.
Text only. The output is read on its own, and it also feeds the **how-it-works** skill, which builds animated visuals of mechanisms.

This replaces the earlier three-level layered-explainer (L1/L2/L3). The expert level was too mathematical for almost every reader, so there is now a single level between the old L1 and L2.

## Inputs

- **Ask** (required): a concept, a model, a paper, or a question.
- **Source material** (optional): paper, card, notes. Prefer it over memory for facts.
- **Already-explained concepts** (optional): a list or folder of concepts that exist. Link to them; do not re-explain.

## The reader

| Reader | Assumes | Language | Target |
|---|---|---|---|
| Smart adult, curious about AI. May work near tech (sales, product, management, a few years of engineering long ago). Not an ML practitioner. | Everyday life, plus the idea of "input, process, output", a spreadsheet, a percentage, a graph. | Plain words. A technical term is fine when it earns its place, and it is defined in one line the first time. **No formulas, no notation, no Greek letters.** Small everyday numbers are fine. | The reader understands **what the idea is, why it exists, and roughly how it works**, and can explain it to a colleague without notes. |

Rules:
- **Concepts, not calculus.** Say what a computation *does* and *why*, never how to compute it symbolically. "Each word scores how relevant every other word is" is in; `softmax(QKᵀ/√d)` is out.
- **Mechanism in words, at the level of parts and steps.** Name the parts, say what each one does, say what flows between them. Leave the moving picture to the how-it-works skill.
- Every term is defined the first time it appears.

## Process

### 1. Intake: decompose the ask into core concepts

This step runs once per ask, before any explaining.

1. **Pin the core.** Write what the ask is about in **one sentence**. If you cannot, read the sources again.
2. **Break it down (Feynman).** Ask: "What must a reader already understand for this to make sense?" Repeat for each answer until you reach ideas the reader has from everyday life.
3. **Pick the core concepts.** From that tree, keep the 3-7 concepts the ask really depends on. Fold minor ones into their parent. Order them bottom-up.
4. **Mark the threshold concept**: the one troublesome idea that makes the rest fall into place. Give it the most care.
5. **Decide depth per concept.** For each core concept choose one:
   - **Full**: central to the ask; gets the full section layout below.
   - **Brief**: needed but supporting; 3-6 bullets (what it is, why it matters here, one analogy).
   - **Link**: already explained elsewhere; one line and a link.
6. **Flag mechanisms.** For each concept, ask: "Would a reader understand this much better by *watching it happen*?" Things that move, flow, transform or repeat (a signal passing through a neuron, a network learning, attention mixing words) are mechanisms. List them as **how-it-works candidates**, each with one sentence on what the visual should show. Do not explain the mechanism in motion here; that is the how-it-works skill's job.

Write the result as the **concept map** (see Output layout) before explaining anything.

### 2. Explain each core concept

Each **Full** concept uses these sections, in this order:

1. **Where this fits.** 1-2 bullets: what came before, what problem this solves.
2. **Core idea.** 1-2 short sentences. Bold the key phrase.
3. **Building blocks.** The parts, simplest first, 1-3 bullets each, or a link to another concept. (Name the parts before the mechanism.)
4. **Analogy.** One everyday analogy. Map it explicitly: "the X is like the Y, because both ...". Then **where it breaks**: 1-2 bullets.
5. **How it works, in words.** 3-7 numbered steps, one action per step. Parts and what flows between them; no maths. If this concept is a how-it-works candidate, end with: *"Watch it: <name of the visual>."*
6. **Worked example.** Tiny and concrete: everyday objects or small round numbers. Check every number by running it.
7. **Misconceptions.** 2-3 items: *"Common belief: ..."* then **"Actually: ..."** then why.
8. **Why it matters.** 1-3 bullets linking to what came next or what it enables.
9. **Check yourself.** 1-2 questions that require explaining, not recalling. Short answers below them.

### 3. Self-check before delivering

- **Jargon test:** any word the reader would stop at? Replace it or define it.
- **Maths test:** any formula, symbol, or step that only makes sense with algebra? Rewrite it as what it does.
- **Curse of knowledge:** any step skipped because it felt obvious? Add it.
- **Illusion of depth:** can the reader predict what happens in a new case? If not, it is a description, not an explanation.
- **Accuracy:** dates, names and numbers checked against the source. Never invent a citation.
- **Handoff:** every how-it-works candidate has a one-sentence "what the visual should show".

### 4. Independent review (required before delivering)

The self-check is not enough: the writer is anchored on its own reasoning. Run a **separate reviewer** (a subagent with fresh context) that receives only the explainer file, its sources, and the brief in [`reviewer.md`](reviewer.md). It does not see the writer's reasoning and does not edit the file.

- Fix every blocker and major (or write down why a finding is wrong).
- Mark the explainer "Revision N (after independent review)".
- Save `review-log.md` next to it: verdict, each finding, severity, how it was handled.
- Deliver only then, together with the review log. If the fixes were large, review again.

## Formatting rules

- Markdown. Headings, bullets, numbered steps, **bold**, *italic*. No colours, emojis, or tables inside explanations (tables are fine in the concept map).
- Short sentences: aim under 15 words, never over 25.
- One idea per bullet.
- **Bold**: the key term on first use, and the one takeaway per section. Not more than ~3 per section.
- Active voice. Concrete nouns. No filler.
- Length per Full concept, as a guide: 350-600 words.

## Output layout

Single ask: `<slug>.md` plus `review-log.md` beside it.

`<slug>.md`:

```
# <Ask>
One-sentence essence.

## Concept map
| # | Concept | Depth (Full/Brief/Link) | Needs | Threshold? |
(bottom-up order)

## How-it-works candidates
- <visual name>: <what the visual should show, one sentence> (concept #N)

## <Concept 1>
### Where this fits / Core idea / Building blocks / Analogy / How it works, in words / Worked example / Misconceptions / Why it matters / Check yourself

## <Concept 2 (Brief)>
- bullets

## Sources
```

Series of asks (e.g. a timeline):
- `00-concept-map.md`: the order, shared concepts, which explainer needs which, threads that run through the series, and all how-it-works candidates.
- `concepts.md`: shared concepts, Brief depth.
- `NN-<slug>.md`: one explainer per ask, linking to shared concepts by name.

## Evidence behind the method

- Feynman technique: explain simply, find gaps, return to sources, simplify.
- Ausubel (1968): start from what the learner knows; open with an advance organizer.
- Mayer: pre-training (name the parts first) and segmenting (small steps) reduce overload.
- Sweller, cognitive load theory: worked examples help novices.
- Gentner, structure mapping: good analogies map relations, not surface features. State where they break.
- Refutation texts (Kowalski & Taylor 2009; Tippett 2010): naming and correcting a misconception beats ignoring it.
- Meyer & Land (2003), threshold concepts.
- Rozenblit & Keil (2002), illusion of explanatory depth; Hinds (1999), curse of expertise.
