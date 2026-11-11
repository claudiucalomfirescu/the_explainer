# Visual script: a signal passing through one neuron

Revision 2 (after independent review, see `../review-log.md`).

## Layout (fixed for the whole visual)

Stage 1600 × 900 px (16:9), deep navy background, scaled to fit. Camera never moves.

| Element | Position / size | Look |
|---|---|---|
| Title | top-left (60, 50) | small caps, muted |
| Input nodes "sunny", "free time", "tired" | centres (250, 250), (250, 450), (250, 650); radius 38 | off-white outline; fill teal, opacity = value × 0.85 |
| Input name labels | 110 px left of each node | muted, lowercase |
| Input value labels | 68 px below each node | off-white, tabular numbers |
| Connections | from node edge to neuron left edge at y = 390 / 450 / 510 | grey 1.5 px until weighted; then thickness = 14 px × weight size; teal if positive, coral if negative |
| Weight labels | midpoint of each line, 40 px above it | teal or coral |
| Neuron body | rounded rect x 620-1180, y 300-600 (radius 40) | off-white outline, labelled "neuron" above |
| "add up" half | left half, x 620-900; label below body | |
| Sum bar | x 735-775; 0 at y 540; 180 px per 1.0; frame up to 1.15; zero line | teal fill; running total label right of bar top |
| Bias tab | small coral bar, rests at y 640 under the sum bar, labelled "bias −0.10" | dim until beat 6 |
| "squeeze" half | right half, x 900-1180; label below body | |
| S-curve axes | x from −3 to 3 → px 940-1150; y from 0 to 1 → px 560-350; tick at 0.5 | grey axes, off-white curve, teal dot, teal dashed line to x 1160 |
| Output node | centre (1390, 450), radius 38, labelled "go for a run?" above | fill teal, opacity = value × 0.85; value label below |
| Caption | centred at y 820 | off-white, max ~12 words |

---

**Beat 1 - "The parts"** (7 s)
- On screen: empty stage; parts draw in.
- Motion and order: input nodes grow in top to bottom (0.3-1.0 s), each with its name label; the three grey lines grow together (1.3-2.1 s) with the label "connections" on the middle line; the neuron outline draws (2.3-3.5 s) with "neuron" above it; the divider, "add up", "squeeze" and the dim bias tab with its label fade in (3.6-4.2 s); the output line and output node grow (4.3-5.0 s) with "go for a run?" above it.
- Caption: "A neuron takes several inputs and gives one output."
- Viewer should notice: three in, one out, and the neuron has two halves.

**Beat 2 - "Signals become numbers"** (5 s)
- On screen: the three inputs.
- Motion: each input node fills to its value, top to bottom, 0.3 s apart; the value label counts up from 0.
- Numbers: 1.00, 0.80, 0.90.
- Caption: "Each input is a number between 0 and 1."
- Viewer should notice: "tired" is almost fully on.

**Beat 3 - "Not all inputs count the same"** (7 s)
- On screen: the three connections.
- Motion: each line thickens to 14 px × weight size and turns teal or coral; its weight label fades in. "connections" label fades out.
- Order: top (0.8 s), middle (1.4 s), pause, bottom (2.6 s).
- Numbers: 0.60, 0.50, −0.70 → thickness 8.4, 7.0, 9.8 px.
- Caption: "Each connection has a weight. Coral means it pushes against."
- Viewer should notice: "tired" has the thickest line, and it is coral.

**Beat 4 - "Weighting the inputs"** (7 s)
- On screen: inputs, weighted lines, neuron.
- Motion: three pulses leave together and travel the lines in 1.5 s. Pulse size and brightness ∝ product size. Pulse 3 is coral.
- Order: depart 0.6 s, arrive 2.1 s; all three product labels appear together at the neuron's left edge at 2.2 s.
- Numbers: 1.0 × 0.6 = 0.60, 0.8 × 0.5 = 0.40, 0.9 × −0.7 = −0.63.
- Caption: "Each input is multiplied by its weight."
- Viewer should notice: the coral pulse is the brightest single pulse.

**Beat 5 - "Adding up"** (4 s)
- On screen: the "add up" half: sum bar frame, zero line, total label.
- Motion: each product label dims as its amount enters the bar, 0.8 s apart; bar and label move together.
- Numbers: 0 → 0.60 → 1.00 → 0.37.
- Caption: "The neuron adds up the weighted inputs."
- Viewer should notice: tiredness cancels most of the "yes".

**Beat 6 - "The bias"** (4 s)
- On screen: the bias tab under the bar.
- Motion: tab lights coral, slides up to the bar top, then the bar drops by 0.10; the tab fades.
- Numbers: 0.37 + (−0.10) = 0.27.
- Caption: "Then a bias: a built-in nudge before any input."
- Viewer should notice: this neuron starts slightly against.

**Beat 7 - "Squeezing the total"** (7 s)
- On screen: the "squeeze" half: axes with a tick at 0.5, the S-curve draws in.
- Motion: a faint ghost dot sweeps the curve from far left to far right (1.5 s), showing it flattens near 0 and near 1. Then the teal dot slides along the x-axis to 0.27, rises to the curve, and a dashed line carries its height to the right edge.
- Numbers: in 0.27 → out 0.57.
- Caption: "The activation squeezes any total into 0 to 1."
- Viewer should notice: big totals flatten near 1, small ones near 0.

**Beat 8 - "One output"** (5 s)
- On screen: output node.
- Motion: one teal pulse travels from the neuron to the output; the output node fills to 0.57; its label counts up.
- Caption: "Output 0.57: slightly in favour of going for a run."
- Viewer should notice: the output is just above the middle.

**Beat 9 - "Change one input"** (10 s)
- On screen: everything.
- Motion and order:
  1. A small ghost label "before 0.57" stays beside the output (0.3 s).
  2. "tired" dims from 0.90 to 0.10 (0.5 s).
  3. The sum bar, curve dot and labels reset.
  4. Replay at about double speed:
     - The pulses travel; the coral pulse is now dim (brightness ∝ 0.07) on the unchanged thick coral line.
     - The products are 0.60, 0.40 and −0.07.
     - The bar goes 0.60 → 1.00 → 0.93, then the bias brings it to 0.83.
     - The dot moves to 0.83 on x and rises to 0.70 on y.
     - The output pulse arrives and the output fills to 0.70 (7 s in total).
  5. Hold with the takeaway caption (2 s).
- Caption first: "Rested? Same weights, different answer: 0.70."
- Caption last (takeaway): "Weigh, add with a bias, squeeze: that is one neuron."
- Viewer should notice: 0.57 → 0.70, only one input changed.

---

Total = 7 + 5 + 7 + 7 + 4 + 4 + 7 + 5 + 10 = 56 s.
