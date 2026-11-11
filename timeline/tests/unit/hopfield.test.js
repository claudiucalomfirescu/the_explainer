// Task 24 — the Hopfield model behind the interactive visual. REQ-13.
// Expectations come from the spec gate's arithmetic (sessions/review-report-202610221751.md):
// with one stored ±1 pattern of 25 neurons and Hebbian weights, asynchronous recall restores the
// pattern exactly whenever at most 12 neurons are flipped; 13 flips lead to the inverse pattern.
import { describe, expect, test } from "vitest";
import { energy, recall, rng, sweep, train, updateNeuron } from "@/lib/hopfield";

const N = 25;
function randomPattern(rand) {
  return Array.from({ length: N }, () => (rand() < 0.5 ? -1 : 1));
}
function flip(pattern, k, rand) {
  const idx = [...pattern.keys()].sort(() => rand() - 0.5).slice(0, k);
  return pattern.map((s, i) => (idx.includes(i) ? -s : s));
}

describe("weights", () => {
  test("are symmetric with a zero diagonal", () => {
    // REQ-13
    const rand = rng(1);
    const w = train([randomPattern(rand), randomPattern(rand)]);
    for (let i = 0; i < N; i++) {
      expect(w[i][i]).toBe(0);
      for (let j = 0; j < N; j++) expect(w[i][j]).toBe(w[j][i]);
    }
  });

  test("follow Hebb's rule: +1 for every pattern where two neurons agree, -1 where they differ", () => {
    // REQ-13
    const a = [1, 1, -1];
    const b = [1, -1, -1];
    const w = train([a, b]);
    expect(w[0][1]).toBe(a[0] * a[1] + b[0] * b[1]); // 1 + -1 = 0
    expect(w[0][2]).toBe(a[0] * a[2] + b[0] * b[2]); // -1 + -1 = -2
    expect(w[1][2]).toBe(a[1] * a[2] + b[1] * b[2]); // -1 + 1 = 0
  });
});

describe("updates", () => {
  test("a neuron takes the sign of its input, and keeps its state when the input is zero", () => {
    // REQ-13
    const w = [
      [0, 1, -1],
      [1, 0, 0],
      [-1, 0, 0],
    ];
    expect(updateNeuron(w, [-1, 1, -1], 0)).toEqual({ state: [1, 1, -1], changed: true }); // input 1 + 1 = 2
    expect(updateNeuron(w, [1, 1, 1], 0)).toEqual({ state: [1, 1, 1], changed: false }); // input 1 - 1 = 0: keep
    expect(updateNeuron(w, [-1, 1, 1], 0)).toEqual({ state: [-1, 1, 1], changed: false }); // input 0: keep -1
  });

  test("no single update raises the energy", () => {
    // REQ-13
    const rand = rng(7);
    const w = train([randomPattern(rand), randomPattern(rand), randomPattern(rand)]);
    let s = randomPattern(rand);
    for (let t = 0; t < 200; t++) {
      const before = energy(w, s);
      s = updateNeuron(w, s, Math.floor(rand() * N)).state;
      expect(energy(w, s)).toBeLessThanOrEqual(before + 1e-9);
    }
  });

  test("a stored pattern is stable: a full sweep changes nothing", () => {
    // REQ-13
    const rand = rng(3);
    const p = randomPattern(rand);
    const r = sweep(train([p]), p, [...p.keys()]);
    expect(r.changed).toBe(0);
    expect(r.state).toEqual(p);
  });
});

describe("recall", () => {
  test("restores the stored pattern exactly for every flip count from 1 to 12, over many seeds", () => {
    // REQ-13
    for (let seed = 1; seed <= 40; seed++) {
      const rand = rng(seed);
      const p = randomPattern(rand);
      const w = train([p]);
      for (let k = 1; k <= 12; k++) {
        const result = recall(w, flip(p, k, rand), rng(seed * 100 + k));
        expect(result.state, `seed ${seed}, ${k} flips`).toEqual(p);
        expect(result.sweeps.at(-1).changed).toBe(0);
      }
    }
  });

  test("with 13 or more flips it still stops, in a stable state (here the inverse pattern)", () => {
    // REQ-13
    for (let seed = 1; seed <= 20; seed++) {
      const rand = rng(seed);
      const p = randomPattern(rand);
      const w = train([p]);
      const result = recall(w, flip(p, 13, rand), rng(seed));
      expect(result.state).toEqual(p.map((s) => -s));
      expect(sweep(w, result.state, [...p.keys()]).changed).toBe(0);
    }
  });

  test("reports each sweep, ending with a sweep that changed nothing", () => {
    // REQ-13 (the widget announces these steps)
    const rand = rng(5);
    const p = randomPattern(rand);
    const result = recall(train([p]), flip(p, 6, rand), rng(5));
    expect(result.sweeps.length).toBeGreaterThanOrEqual(2);
    expect(result.sweeps[0].changed).toBeGreaterThan(0);
    expect(result.sweeps.at(-1).changed).toBe(0);
    expect(result.sweeps.every((s) => s.state.length === N)).toBe(true);
  });
});
