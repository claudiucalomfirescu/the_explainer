// Task 36 — the valley loop behind the lesson screen. REQ-20.
// Expectations are derived here, not read from the code under test:
// - H and T are typed below as 5 x 5 bitmaps; they differ in 16 neurons and agree in 9.
// - With H and T stored (zero diagonal), energy(s) = -1/2 * ((H.s)^2 + (T.s)^2 - 2N). At s = H:
//   H.s = 25, T.s = H.T = -7, so energy = -(625 + 49 - 50) / 2 = -312. Same for T and both inverses.
import { describe, expect, test } from "vitest";
import { energy, rng, train, updateNeuron } from "@/lib/hopfield";
import { LETTER_H, LETTER_T, LOOP_LENGTH, LANDMARKS, loopEnergy, loopState, placeOf, recallSteps } from "@/lib/valley";

const N = 25;
const bitmap = (rows) => rows.join("").split("").map((c) => (c === "#" ? 1 : -1));
const H = bitmap(["#...#", "#...#", "#####", "#...#", "#...#"]);
const T = bitmap(["#####", "..#..", "..#..", "..#..", "..#.."]);
const W = train([H, T]);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const formulaEnergy = (s) => -(dot(H, s) ** 2 + dot(T, s) ** 2 - 2 * N) / 2;
const differ = H.map((v, i) => (v !== T[i] ? i : -1)).filter((i) => i >= 0);
const same = (a, b) => a.every((v, i) => v === b[i]);

function* choose(items, k, start = 0, acc = []) {
  if (acc.length === k) return yield acc.slice();
  for (let i = start; i < items.length; i++) {
    acc.push(items[i]);
    yield* choose(items, k, i + 1, acc);
    acc.pop();
  }
}

describe("the letters", () => {
  test("are H and T, differing in 16 neurons and agreeing in 9", () => {
    // REQ-20
    expect(LETTER_H).toEqual(H);
    expect(LETTER_T).toEqual(T);
    expect(differ.length).toBe(16);
  });
});

describe("the loop H -> T -> inverse H -> inverse T -> H", () => {
  test("has 50 states, one neuron apart each step, closing on itself", () => {
    // REQ-20
    expect(LOOP_LENGTH).toBe(50);
    for (let t = 0; t < 50; t++) {
      const a = loopState(t), b = loopState(t + 1);
      expect(a.filter((v, i) => v !== b[i]).length, `step ${t}`).toBe(1);
    }
    expect(loopState(50)).toEqual(loopState(0));
  });

  test("passes H, T, inverse H and inverse T at 0, 16, 25 and 41, each at energy -312", () => {
    // REQ-20
    expect(LANDMARKS).toEqual({ H: 0, T: 16, "-H": 25, "-T": 41 });
    expect(loopState(0)).toEqual(H);
    expect(loopState(16)).toEqual(T);
    expect(loopState(25)).toEqual(H.map((v) => -v));
    expect(loopState(41)).toEqual(T.map((v) => -v));
    for (const t of [0, 16, 25, 41]) expect(loopEnergy(t)).toBe(-312);
  });

  test("has the model's energy at every position, and the formula agrees", () => {
    // REQ-20
    for (let t = 0; t < 50; t++) {
      expect(loopEnergy(t)).toBe(energy(W, loopState(t)));
      expect(loopEnergy(t)).toBe(formulaEnergy(loopState(t)));
    }
    // The tall hill between H and T, the low hill between T and inverse H.
    expect(loopEnergy(8)).toBe(-56);
    expect(Math.max(...[17, 18, 19, 20, 21, 22, 23, 24].map(loopEnergy))).toBe(-232);
  });

  test("placeOf finds every loop state, whichever neurons are flipped, and nothing off the loop", () => {
    // REQ-20
    for (let t = 0; t < 50; t++) expect(placeOf(loopState(t))).toBe(t);
    // Any 5 of the 16 differing neurons flipped from H is position 5, not only the first five.
    const s = H.slice();
    for (const i of [differ[15], differ[3], differ[9], differ[0], differ[12]]) s[i] *= -1;
    expect(placeOf(s)).toBe(5);
    // One differing and one agreeing neuron flipped together is inside the square, not on its edge.
    const off = H.slice();
    off[differ[0]] *= -1;
    off[H.findIndex((v, i) => v === T[i])] *= -1;
    expect(placeOf(off)).toBeNull();
  });
});

describe("recall from Damage 5", () => {
  test("restores H for every way to flip 5 of the 16, the energy never rises, every state stays on the loop", () => {
    // REQ-20 — 4,368 damages x 3 update orders
    let runs = 0;
    for (const picks of choose(differ, 5)) {
      for (let seed = 0; seed < 3; seed++) {
        const start = H.slice();
        for (const i of picks) start[i] *= -1;
        const steps = recallSteps(W, start, rng(seed * 7919 + runs));
        let e = energy(W, start);
        for (const step of steps) {
          expect(step.energy).toBeLessThanOrEqual(e);
          expect(step.energy).toBe(energy(W, step.state));
          expect(placeOf(step.state)).not.toBeNull();
          e = step.energy;
        }
        expect(same(steps.at(-1)?.state ?? start, H)).toBe(true);
        runs++;
      }
    }
    expect(runs).toBe(4368 * 3);
    // Time budget, not an expectation: ~13,000 recalls with three checks per step run past the
    // default 5 s (declared correction, sessions/review-report of Phase 6).
  }, 120_000);

  test("records every neuron checked, changed or not, and ends with a full sweep that changes nothing", () => {
    // REQ-20
    const start = H.slice();
    for (const i of differ.slice(0, 5)) start[i] *= -1;
    const steps = recallSteps(W, start, rng(4));
    expect(steps.filter((s) => s.changed).length).toBe(5);
    const last25 = steps.slice(-25);
    expect(last25.every((s) => !s.changed)).toBe(true);
    expect(new Set(last25.map((s) => s.neuron)).size).toBe(25);
    for (const s of steps) expect(s.changed).toBe(updateNeuron(W, s.before, s.neuron).changed);
  });
});
