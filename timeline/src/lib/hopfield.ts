// The Hopfield network behind the interactive visual (REQ-13). Neurons are +1 or -1; weights
// follow Hebb's rule with a zero diagonal; updates are asynchronous (one neuron at a time), which
// guarantees the energy never rises and recall always stops.

export type State = number[];
export type Weights = number[][];
export type Sweep = { state: State; changed: number };

/** Hebbian weights: w[i][j] = sum over patterns of p[i] * p[j], and w[i][i] = 0. */
export function train(patterns: State[]): Weights {
  const n = patterns[0]?.length ?? 0;
  const w = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (const p of patterns) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) if (i !== j) w[i][j] += p[i] * p[j];
    }
  }
  return w;
}

/** Energy E = -1/2 * sum over i, j of w[i][j] * s[i] * s[j]. */
export function energy(w: Weights, s: State): number {
  let e = 0;
  for (let i = 0; i < s.length; i++) for (let j = 0; j < s.length; j++) e += w[i][j] * s[i] * s[j];
  return -e / 2;
}

/** Update neuron i: take the sign of its input; keep the current state when the input is zero. */
export function updateNeuron(w: Weights, s: State, i: number): { state: State; changed: boolean } {
  let input = 0;
  for (let j = 0; j < s.length; j++) input += w[i][j] * s[j];
  const next = input > 0 ? 1 : input < 0 ? -1 : s[i];
  if (next === s[i]) return { state: s, changed: false };
  const state = s.slice();
  state[i] = next;
  return { state, changed: true };
}

/** Update every neuron once, in the given order. */
export function sweep(w: Weights, s: State, order: number[]): Sweep {
  let state = s;
  let changed = 0;
  for (const i of order) {
    const r = updateNeuron(w, state, i);
    state = r.state;
    if (r.changed) changed++;
  }
  return { state, changed };
}

/** Small seeded random number generator (mulberry32), so a recall can be replayed exactly. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(n: number, rand: () => number): number[] {
  const order = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Sweep in a fresh random order until a sweep changes nothing. Returns every sweep so the widget
 * can show recall step by step. maxSweeps is a safety limit; asynchronous updates always stop.
 */
export function recall(w: Weights, start: State, rand: () => number, maxSweeps = 100): { state: State; sweeps: Sweep[] } {
  const sweeps: Sweep[] = [];
  let state = start;
  for (let k = 0; k < maxSweeps; k++) {
    const s = sweep(w, state, shuffled(state.length, rand));
    sweeps.push(s);
    state = s.state;
    if (s.changed === 0) break;
  }
  return { state, sweeps };
}
