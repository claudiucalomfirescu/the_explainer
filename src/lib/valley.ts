// The valley behind the lesson screen (REQ-20). With the letters H and T stored, the energy of a
// state depends only on how many of the 16 neurons where H and T differ are flipped from H, and
// how many of the 9 where they agree. Walking H -> T -> inverse H -> inverse T -> H one neuron at a
// time is a loop of 50 states whose height is that energy, and recall started on it stays on it.

import { type State, type Weights, energy, train, updateNeuron } from "./hopfield";

const fromRows = (rows: string[]): State => rows.join("").split("").map((c) => (c === "#" ? 1 : -1));

export const LETTER_H: State = fromRows(["#...#", "#...#", "#####", "#...#", "#...#"]);
export const LETTER_T: State = fromRows(["#####", "..#..", "..#..", "..#..", "..#.."]);
export const VALLEY_WEIGHTS: Weights = train([LETTER_H, LETTER_T]);

/** Neurons where H and T differ (16) and where they agree (9), in index order. */
const DIFFER = LETTER_H.flatMap((v, i) => (v !== LETTER_T[i] ? [i] : []));
const AGREE = LETTER_H.flatMap((v, i) => (v === LETTER_T[i] ? [i] : []));
const ND = DIFFER.length;
const NA = AGREE.length;

export const LOOP_LENGTH = 2 * (ND + NA);
/** Loop positions of the four states the network holds. */
export const LANDMARKS = { H: 0, T: ND, "-H": ND + NA, "-T": 2 * ND + NA } as const;

/** Counts flipped from H at loop position t: k of the differing neurons, j of the agreeing ones. */
function countsAt(t: number): [number, number] {
  const p = ((t % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;
  if (p <= ND) return [p, 0];
  if (p <= ND + NA) return [ND, p - ND];
  if (p <= 2 * ND + NA) return [ND - (p - ND - NA), NA];
  return [0, NA - (p - 2 * ND - NA)];
}

/** The state at loop position t: H with the first k differing and first j agreeing neurons flipped. */
export function loopState(t: number): State {
  const [k, j] = countsAt(t);
  const s = LETTER_H.slice();
  for (let a = 0; a < k; a++) s[DIFFER[a]] *= -1;
  for (let b = 0; b < j; b++) s[AGREE[b]] *= -1;
  return s;
}

export function loopEnergy(t: number): number {
  return energy(VALLEY_WEIGHTS, loopState(t));
}

/** Where a state sits on the loop (any neurons may be the flipped ones), or null if it is off it. */
export function placeOf(s: State): number | null {
  const k = DIFFER.filter((i) => s[i] !== LETTER_H[i]).length;
  const j = AGREE.filter((i) => s[i] !== LETTER_H[i]).length;
  if (j === 0) return k;
  if (k === ND) return ND + j;
  if (j === NA) return ND + NA + (ND - k);
  if (k === 0) return (2 * ND + NA + (NA - j)) % LOOP_LENGTH;
  return null;
}

export type RecallStep = { neuron: number; before: State; state: State; changed: boolean; input: number; energy: number };

/**
 * Recall as single-neuron steps, so the lesson can show each one: sweep all neurons in a fresh
 * shuffled order until a whole sweep changes nothing (the same rule as `recall` in hopfield.ts).
 */
export function recallSteps(w: Weights, start: State, rand: () => number, maxSweeps = 50): RecallStep[] {
  const steps: RecallStep[] = [];
  let s = start;
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    const order = [...s.keys()];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let changed = 0;
    for (const n of order) {
      const input = w[n].reduce((sum, wij, j) => sum + wij * s[j], 0);
      const r = updateNeuron(w, s, n);
      steps.push({ neuron: n, before: s, state: r.state, changed: r.changed, input, energy: energy(w, r.state) });
      if (r.changed) changed++;
      s = r.state;
    }
    if (!changed) break;
  }
  return steps;
}
