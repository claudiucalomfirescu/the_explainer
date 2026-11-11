# Neuron test: independent review log (2026-11-11)

Each reviewer ran with fresh context, saw only the output files and its instruction file, and never saw the writer's reasoning.

## Concept text review (skills/concept-explainer/reviewer.md): FIX FIRST

All arithmetic and dates were verified correct.

| Finding | Severity | Fix in revision 2 |
|---|---|---|
| "built from millions to billions of these units" mixes up units and weights; LLMs also have attention and other activations | Blocker | Now: "millions of units, billions of weights; building blocks differ in detail, but the weigh-and-add idea is the same" |
| "Weights are where all the knowledge lives" ignores biases | Blocker | Now: "Weights (and biases)" |
| Undefined: training, neural network, layers, perceptron, "straight dividing line" | Major | Each is defined in one line; the dividing line became "cannot handle yes if A or B, but not both" |
| Advisor analogy tied a negative weight to "often wrong" | Major | Advisors now argue for or against, and a break point says "negative is not untrustworthy" |
| S-curve gave no reference points, so the reader can't predict a new case | Major | Added 0 → 0.5, ±1 → 0.73/0.27, ±3 → 0.95/0.05 |
| Minor: layer vs neuron collapse, zero-input caveat, "usually 0-1", full citations, long sentences, too much bold, passive voice | Minor | Fixed |

New-case test the reviewer posed: raining (sunny 0), free 0.8, tired 0.9 gives a total of -0.33. With the new reference points, the reader can now place it as about 0.42, leaning against.

## Visual script review (skills/how-it-works/reviewer.md): FIX FIRST

All numbers matched the state model.

| Finding | Severity | Fix in revision 2 |
|---|---|---|
| Beat 8 replay said "bar rises to 0.93" (hides 1.00) and didn't list the run-2 products | Blocker | The full run-2 sequence is now written out |
| Sum bar, S-curve axes and global layout were underspecified, so a builder would have to guess | Blocker | Added a layout table with positions, sizes, scales and colours |
| Beat 5 had two ideas (sum + bias) | Major | Split into beat 5 "Adding up" and beat 6 "The bias" |
| Bias, the two halves and the meaning of the output weren't introduced in beat 1 | Major | Beat 1 now draws them; the output is labelled "go for a run?" |
| "Coral pulse almost as big as the other two together" was false | Major | Now: "the brightest single pulse" |
| "Big totals flatten" wasn't earned | Major | A ghost dot sweeps the whole curve first |
| "Thin coral pulse" broke the visual grammar; the replay was too crowded | Major | Dim pulse, a 10 s beat, and a "before 0.57" ghost label |
| Minor: label naming, beat 1 timing, products staggered, takeaway dropped the bias | Minor | Fixed |

## Keyframe check (after build)

One frame near the end of each beat, plus a scrub-backwards test (seek to the end, then back to beat 5).

Two bugs were found and fixed:
- The number labels did not update when scrubbing, because GSAP's seek suppresses callbacks by default.
- The "out" label overlapped the neuron border, and the bias tab overlapped the "add up" label.

Final frames are in `how-it-works/keyframes/`. All numbers on screen match the state model.
