---
name: "layered-explainer"
description: "Explain a concept in text at three audience levels (curious adult, tech-literate generalist, aspiring expert), Feynman-style - decompose into building blocks, explain each simply, then assemble."
---

# Layered Explainer

Turn one concept, or a series of related concepts, into readable text explanations for three audiences.
Text only. The output is meant to be read on its own and later turned into animations by another skill, so the structure must be clean and predictable.

## Inputs

- **Concept** to explain (required).
- **Source material** (optional): paper, card, notes. Prefer it over memory for facts.
- **Already-explained concepts** (optional): a list or folder of blocks that exist. Link to them; do not re-explain.
- **Levels** (optional): default is all three.

## The three audiences

| Level | Reader | Assumes | Allowed language | Target depth |
|---|---|---|---|---|
| **L1 Curious adult** | Smart adult, no IT, CS or AI background | Everyday life only | No jargon. No formulas. Everyday numbers only | The gist, and why it matters. Reader can retell it at dinner |
| **L2 Tech-literate generalist** | Studied engineering or CS, worked a few years, now in sales, CS, management | Variables, functions, algorithms, basic algebra, "input/output" | General tech vocabulary. Formulas written in words or one simple line | How it works, step by step. Reader can explain the mechanism to a colleague |
| **L3 Aspiring expert** | Works in tech, not yet in this field, wants to become an expert | Programming, linear algebra basics, reading papers | The field's own terms and notation, as in the papers | Why it works, its limits, what experts debate. Reader could hold a conversation with a specialist |

Rules across levels:
- **Standalone, linked.** Each level reads on its own. A higher level may point back ("L1 analogy: ...") in one line, never rely on it.
- **Expertise reversal.** Detail that helps L1 bores L3, and L3 detail overwhelms L1. Do not paste L1 content into L3.
- Every term is defined the first time it appears **at that level**.

## Process

### 1. Pin the core

- Write the concept's essence in **one sentence**. If you cannot, you do not understand it yet: read the sources again.
- Check facts (dates, names, formulas, claims) against sources. Never invent a citation.

### 2. Decompose (Feynman)

- Ask: "What must a reader already understand for this to make sense?"
- Repeat for each answer until you reach ideas an L1 reader already has from everyday life.
- Result: a **prerequisite map**, ordered bottom-up.
- Mark the **threshold concept**: the one troublesome idea that, once understood, makes the rest fall into place. Give it the most care.
- For a series of concepts, collect shared prerequisites as **building blocks**, explain each once, and link to them from every explainer that needs them.

### 3. Build up, level by level

Each level uses the same sections, in this order:

1. **Where this fits.** 1-2 bullets: what came before, what problem this solves. (Advance organizer.)
2. **Core idea.** 1-2 short sentences. Bold the key phrase.
3. **Building blocks.** The prerequisites from step 2, simplest first, 1-3 bullets each, or a link to the block. (Pre-training: name the parts before the mechanism.)
4. **Analogy.** One everyday analogy. Map it explicitly: "the X is like the Y, because both ...". Then **where it breaks**: 1-2 bullets. At L3 the analogy is optional; use the formal model instead.
5. **How it works.** Numbered steps, one action per step. (Segmenting.)
6. **Worked example.** Tiny and concrete. L1: a story with everyday objects. L2: small real numbers. L3: the formal notation, then the same small numbers. (Concreteness fading.) Check every number by running it.
7. **Misconceptions.** 2-3 items, refutation pattern: *"Common belief: ..."* then **"Actually: ..."** then why.
8. **Why it mattered.** 1-3 bullets linking to what came next.
9. **Check yourself.** 1-2 questions that require explaining, not recalling. Short answers below them.

L3 adds, inside "How it works" or after it:
- The key equations in the paper's notation, with every symbol named.
- The exact claim the paper proved or showed, and its assumptions.
- Limits, later corrections, and open debates, with citations (author, year).

### 4. Self-check before delivering

- **Feynman test:** any word an L1 reader would stop at? Replace it or define it.
- **Curse of knowledge:** any step you skipped because it felt obvious? Add it.
- **Illusion of depth:** does "How it works" let the reader predict what happens in a new case? If not, it is a description, not an explanation.
- **Accuracy:** dates, names, numbers and formulas checked against the source.
- **Format:** rules below.

## Formatting rules

- Markdown. Headings, bullets, numbered steps, **bold**, *italic*. Nothing else. No colours, emojis, or tables inside explanations (a table is fine in the prerequisite map).
- Short sentences: aim under 15 words, never over 25.
- One idea per bullet.
- **Bold**: the key term on first use, and the one takeaway per section. Not more than ~3 per section.
- *Italic*: names of works, and the "Common belief" label.
- Active voice. Concrete nouns. No filler ("It is important to note that").
- Formulas: L1 none; L2 at most one line, also said in words; L3 inline code style, e.g. `Δw_ij = η · x_i · y_j`.
- Length per level, as a guide: L1 250-450 words, L2 350-600, L3 500-800.

## Output layout

Single concept: one file, `<slug>.md`:

```
# <Concept>
One-sentence essence.

## Prerequisite map
(table or nested list, bottom-up; threshold concept marked)

## Level 1 - Curious adult
### Where this fits / Core idea / Building blocks / Analogy / How it works / Worked example / Misconceptions / Why it mattered / Check yourself

## Level 2 - Tech-literate generalist
(same sections)

## Level 3 - Aspiring expert
(same sections, plus equations, exact claims, limits and debates)

## Sources
```

Series of concepts (e.g. a timeline):
- `00-concept-map.md`: the order, the shared building blocks, which explainer needs which block, and the threads that run through the series.
- `blocks.md`: each building block at three levels, compact (3-6 bullets per level).
- `NN-<slug>.md`: one explainer per concept, linking to blocks by name.

## Evidence behind the method

- Feynman technique: explain simply, find gaps, return to sources, simplify.
- Ausubel (1968): what the learner already knows matters most; start with an advance organizer.
- Mayer: pre-training (name the parts first) and segmenting (small steps) reduce overload.
- Sweller, cognitive load theory; worked examples beat unguided problem solving for novices.
- Kalyuga, expertise reversal effect: support that helps novices hinders experts. Hence separate levels.
- Gentner, structure mapping: good analogies map relations, not surface features. State where they break.
- Fyfe et al. (2014), concreteness fading: concrete, then bridging, then abstract.
- Refutation texts (Kowalski & Taylor 2009; Tippett 2010): naming and correcting a misconception beats ignoring it.
- Meyer & Land (2003), threshold concepts: some ideas are troublesome and transformative; find and slow down on them.
- Biggs, SOLO taxonomy: L1 aims at connected gist, L2 at relational understanding, L3 at extended abstract.
- Rozenblit & Keil (2002), illusion of explanatory depth; Hinds (1999), curse of expertise: hence the self-check.