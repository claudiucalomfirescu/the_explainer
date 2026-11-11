"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type State, energy, rng } from "@/lib/hopfield";
import { LANDMARKS, LETTER_H, LETTER_T, LOOP_LENGTH, VALLEY_WEIGHTS as W, loopEnergy, placeOf, recallSteps } from "@/lib/valley";

type Step = { heading: string; body: string };
type Check = { neuron: number; next: number } | null;

const N = 25;
const CELL = 44;
const PAD = 22;
const NET = 2 * PAD + 4 * CELL; // the network's square, in px
const at = (i: number) => [PAD + (i % 5) * CELL, PAD + Math.floor(i / 5) * CELL];
const DIFFER = LETTER_H.flatMap((v, i) => (v !== LETTER_T[i] ? [i] : []));
const CHANGED_MS = 420;
const QUIET_MS = 45;

// The track shows the loop from inverse T (position 41, drawn at -9) through H and T to inverse H (25).
const T0 = -9;
const T1 = 25;
const tx = (t: number) => 18 + (t - T0) * 8;
const ty = (e: number) => 196 - ((e + 312) / 256) * 156;
const TRACK = Array.from({ length: T1 - T0 + 1 }, (_, n) => [tx(T0 + n), ty(loopEnergy(T0 + n))]);
const CURVE = TRACK.map(([x, y], n) => `${n ? "L" : "M"}${x} ${y.toFixed(1)}`).join("");
const fmt = (e: number) => (e < 0 ? "−" : "") + Math.abs(e);

function placeText(p: number | null): string {
  if (p === null) return "off the track";
  if (p === LANDMARKS.H) return "in the H valley";
  if (p === LANDMARKS.T) return "in the T valley";
  if (p === LANDMARKS["-H"]) return "in the inverse H valley";
  if (p === LANDMARKS["-T"]) return "in the inverse T valley";
  return "on a slope";
}

/**
 * The stage and the steps list (REQ-19, REQ-20, REQ-21): the network as 25 buttons, the energy
 * track, the toolbar and the six steps. One state object; recall is shown one neuron at a time.
 */
export function LessonStage({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion();
  const [s, setS] = useState<State>(LETTER_H);
  const [check, setCheck] = useState<Check>(null);
  const [linksOn, setLinksOn] = useState(true);
  const [energyOn, setEnergyOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const current = useRef<State>(LETTER_H);
  const timers = useRef<number[]>([]);
  const seed = useRef(1);

  useEffect(() => {
    seed.current = Date.now() % 100_000;
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const show = (next: State) => {
    current.current = next;
    setS(next);
  };
  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setRunning(false);
    setCheck(null);
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const reset = () => {
    stop();
    show(LETTER_H);
  };
  const flip = (i: number) => {
    stop();
    const next = current.current.slice();
    next[i] = -next[i];
    show(next);
  };
  const damage = () => {
    stop();
    const rand = rng(seed.current++);
    const order = DIFFER.slice().sort(() => rand() - 0.5).slice(0, 5);
    show(LETTER_H.map((v, i) => (order.includes(i) ? -v : v)));
  };
  const recall = () => {
    stop();
    const plan = recallSteps(W, current.current, rng(seed.current++));
    if (reduce || plan.length === 0) {
      show(plan.at(-1)?.state ?? current.current);
      return;
    }
    setRunning(true);
    let k = 0;
    const tick = () => {
      if (k >= plan.length) {
        setCheck(null);
        setRunning(false);
        return;
      }
      const st = plan[k++];
      setCheck({ neuron: st.neuron, next: st.state[st.neuron] });
      show(st.state);
      later(st.changed ? CHANGED_MS : QUIET_MS, tick);
    };
    tick();
  };

  // What each "go deeper" step makes the stage do.
  const act = (i: number) => {
    setActive(i);
    stop();
    if (i === 0) {
      show(LETTER_H);
      setCheck({ neuron: 12, next: LETTER_H[12] });
    } else if (i === 1) {
      show(LETTER_T);
      later(reduce ? 0 : 1100, () => show(LETTER_H));
    } else if (i === 2) {
      const n = DIFFER[0];
      show(LETTER_H.map((v, j) => (j === n ? -v : v)));
      setCheck({ neuron: n, next: LETTER_H[n] });
      later(reduce ? 0 : 1200, () => {
        show(LETTER_H);
        later(reduce ? 0 : 900, () => setCheck(null));
      });
    } else if (i === 3 || i === 4) {
      setEnergyOn(true);
      damage();
      later(reduce ? 0 : 600, recall);
    } else {
      show(LETTER_H);
    }
  };

  const e = energy(W, s);
  const place = placeOf(s);
  const drawn = place === null ? null : place > T1 ? place - LOOP_LENGTH : place;
  const onTrack = drawn !== null && drawn >= T0 && drawn <= T1;

  return (
    <>
      <section className="lesson-stage" aria-label="The network and its energy">
        <p className="lesson-caption" data-testid="step-text" aria-live="polite">
          {active !== null ? steps[active].body : ""}
        </p>

        <div className="lesson-figures">
          <figure className="lesson-figure">
            <figcaption>
              <strong>The network</strong>
              <span>25 neurons, every pair linked</span>
            </figcaption>
            <div className="lesson-net" style={{ width: NET, height: NET }}>
              <svg className="lesson-links" width={NET} height={NET} aria-hidden="true">
                {linksOn &&
                  check &&
                  Array.from({ length: N }, (_, j) => {
                    if (j === check.neuron || W[check.neuron][j] === 0) return null;
                    const [x1, y1] = at(check.neuron);
                    const [x2, y2] = at(j);
                    const yes = W[check.neuron][j] * s[j] * check.next > 0;
                    return <line key={j} x1={x1} y1={y1} x2={x2} y2={y2} className={yes ? "yes" : "no"} />;
                  })}
              </svg>
              {s.map((v, i) => {
                const [x, y] = at(i);
                return (
                  <button
                    key={i}
                    type="button"
                    data-testid="lesson-neuron"
                    className="lesson-neuron"
                    data-check={check?.neuron === i || undefined}
                    aria-pressed={v > 0}
                    aria-label={`Neuron ${i + 1}, row ${Math.floor(i / 5) + 1}, column ${(i % 5) + 1}`}
                    style={{ left: x, top: y }}
                    onClick={() => flip(i)}
                  />
                );
              })}
            </div>
          </figure>

          {energyOn && (
            <figure className="lesson-figure" data-testid="track">
              <figcaption>
                <strong>The valley</strong>
                <span>height is energy</span>
              </figcaption>
              <svg className="lesson-track" viewBox="0 0 308 236" role="img" aria-label={`Energy track: the network is ${placeText(place)}, energy ${fmt(e)}`}>
                <path className="ground" d={`${CURVE}L${tx(T1)} 206L${tx(T0)} 206Z`} />
                <path className="curve" d={CURVE} />
                <line className="axis" x1={tx(T0) - 6} y1={206} x2={tx(T1) + 6} y2={206} />
                <text className="mark big" x={tx(0)} y={226}>H</text>
                <text className="mark big" x={tx(16)} y={226}>T</text>
                <text className="mark" x={tx(T0)} y={226}>{"−T"}</text>
                <text className="mark" x={tx(T1)} y={226}>{"−H"}</text>
                <text className="mark" x={tx(8)} y={ty(loopEnergy(8)) - 12}>the ridge</text>
                <circle
                  data-testid="ball"
                  data-place={place ?? ""}
                  className="ball"
                  cx={onTrack ? tx(drawn) : -50}
                  cy={onTrack ? ty(e) - 9 : -50}
                  r={9}
                  visibility={onTrack ? "visible" : "hidden"}
                />
              </svg>
            </figure>
          )}
        </div>

        <div className="lesson-tools" data-testid="lesson-tools" role="toolbar" aria-label="Network controls">
          <button type="button" onClick={reset}>Reset</button>
          <button type="button" aria-pressed={linksOn} onClick={() => setLinksOn((o) => !o)}>Links</button>
          <button type="button" aria-pressed={energyOn} onClick={() => setEnergyOn((o) => !o)}>Show the energy</button>
          <button type="button" onClick={damage}>Damage 5</button>
          <button type="button" onClick={recall}>Recall</button>
        </div>
      </section>

      <section className="lesson-steps" aria-labelledby="lesson-steps-title">
        <h2 id="lesson-steps-title">
          Step through it <span>{steps.length} steps</span>
        </h2>
        <ol>
          {steps.map((st, i) => (
            <li key={st.heading}>
              <button type="button" data-testid="step" aria-current={active === i ? "step" : undefined} onClick={() => act(i)}>
                <b aria-hidden="true">{i + 1}</b>
                {st.heading}
              </button>
            </li>
          ))}
        </ol>
        <p className="lesson-readout" data-testid="readout" aria-live="polite" data-energy={e} data-place={place ?? ""} data-running={running}>
          Energy {fmt(e)} · {placeText(place)}
          {running ? " · recalling" : ""}
        </p>
      </section>
    </>
  );
}
