# Concept: the timeline as a lesson workbench

Status: concept for discussion, 2026-10-23. Nothing is built. Reference studied: Learn Arduino
(learn-arduino-red.vercel.app), explored control by control on 2026-10-23.

## What the reference does

One screen, no page scroll. A 3D object in the middle, and everything else is a frame around it.

| Area | What it does in Learn Arduino |
|---|---|
| Stage (centre) | A 3D board you pan, rotate and zoom. Callout cards on leader lines name the parts; clicking a part flies the camera to it and a minimap appears bottom-left. A small toolbar under the stage: turn, zoom, reset, show current flow, show schematic. |
| Right panel | Tabs: Overview, Pinout (a table), Example (numbered "how the code works" steps), Specifications. An expand button gives a tab the full height. |
| Try it yourself (right, lower) | The lesson's code. Run steps through it line by line, prints to a serial monitor, and the stage reacts (dots run along the traces, the LED blinks). |
| Lesson strip (bottom) | 16 lesson cards with a thumbnail of each scene, ticks on finished ones, arrows to scroll. Each lesson has its own address (`#blink`). |
| Left sidebar (collapsible) | Icons that open flyouts: Lessons (the list, "2/16 done"), Components (the parts in view), Simulator, Settings (callout labels, current flow, floor grid, turntable, sound, reduce motion, reset progress), Language. |
| Header | Title and strapline, a progress counter ("Basics 2/16"), the date. |

Built with three.js; the scene is generated in code (no model files), the panels are plain page
elements over it.

## What our timeline is today

A horizontal strip of 16 milestones grouped by era, and under it one long article per milestone
(idea, where it came from, who, the paper, then "go deeper" steps). Two cards have an interactive
visual (Hopfield, transformer).

## The concept

Keep the reference's anatomy, change what each area means, and give it a look of its own.

| Area | In our timeline |
|---|---|
| Stage | The milestone's interactive figure: the idea you can press. Callouts name its parts (neuron, link, weight). |
| Stage toolbar | Reset, labels on or off, and one milestone-specific switch, the counterpart of "show current flow": for Hopfield, "show the energy" (draws the valley). |
| Right panel, tabs | **Idea** (the plain-words paragraph), **Where it came from**, **Who** (portraits), **Paper** (the original, with its one-paragraph summary). Same content as today's card, cut into tabs instead of one scroll. |
| Right panel, lower | **Step through it** instead of code: the card's "go deeper" steps as a numbered list. Pressing a step makes the stage act it out (Hopfield: 1 neurons and links, 2 store a memory, 3 update one neuron, 4 energy only goes down, 5 recall is rolling downhill, 6 limits). The counterpart of the serial monitor is a one-line readout: energy, which neuron is being checked. |
| Bottom strip | The timeline itself: 16 milestone cards, each with a thumbnail of its figure, grouped under era labels, with a tick when read. |
| Left sidebar | **Eras** (jump to one), **People** (everyone in the story, each linking to their milestones), **Papers** (the reading list), **Settings** (labels, sound, reduce motion, reset progress). |
| Header | "From neurons to ChatGPT", progress ("5 of 16 read"), the current year in large type instead of the date. |

### One object that grows through history

The strongest idea to borrow is that every lesson reuses the same board. Our version: **the same
grid of neurons on every stage**, and each milestone adds what it introduced.

- 1943, the artificial neuron: one neuron, its inputs and its threshold.
- 1949, Hebbian learning: links between neurons that strengthen when both fire.
- 1958, the perceptron: a row of inputs, one output, weights that learn from mistakes.
- 1982, Hopfield: the full grid, every neuron linked to every other, recall downhill.
- 1985, Boltzmann: the same grid with noise and hidden neurons.
- 1986, backpropagation: layers, and the error flowing backwards.

The reader sees one machine grow from 1943 to 2022 instead of sixteen unrelated pictures, and
the visual work is one engine extended, not sixteen figures drawn from scratch. Past 2006 the
grid gives way to new objects (word vectors, attention), which is honest: that is where the ideas
changed shape.

## A look of its own

**Chosen 2026-10-23, after three rounds of side-by-side boards (`docs/concept/`):** the night
instrument, signal blue `#5f9dff` on graphite `#23252b`, a short soft glow on lit parts only, a
smaller figure and a 500 px text panel. The settled look is `docs/concept/style-final.html`;
`style-board.html`, `style-board-night.html` and `style-board-blue.html` are the rounds it was
chosen against. The three starting directions were:

The reference is warm cream, navy board, teal accents, technical-drawing grid. Three directions
that differ from it, recommended first:

1. **Archive and lab notebook** (recommended): off-white paper, ink line drawing, one accent
   colour per era, year numbers set large in a serif, the paper's title and date on a typed
   index card in the panel. Fits a history site and the colorfigures hand-drawn figures we made.
2. **Night instrument**: the dark, hairline, single-glow look of the iso-glow figures. Striking,
   reads well on screens; less "history", more "machine".
3. **Museum gallery**: white walls, one object per plinth on the stage, labels like exhibit
   captions. Calm, but needs the most polish to not look empty.

## What it costs and what to decide

- **The figures are the cost.** The frame (strip, panel tabs, sidebar, settings, progress) is a
  few days in the existing Next.js app, reusing today's content files unchanged. The stage
  needs a figure per milestone; today we have two.
- **The engine choice** sets the look and the effort. Our colorfigures and iso-glow figures are
  SVG, which keeps them light and readable as pages; the reference's three.js 3D is more
  impressive and much more work per milestone.
- **Phones.** The reference is built for a wide screen. A public site needs a phone layout: the
  stage on top, the tabs under it, the strip as a swipe row.
- **Rollout.** One milestone first (Hopfield, since its figure exists), behind its own address,
  before committing all sixteen.
