"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { energy, recall, rng, train, type State } from "@/lib/hopfield";
import { cn } from "@/lib/utils";

const SIDE = 5;
const N = SIDE * SIDE;
const SCRAMBLE = 5; // fewer than half of 25, so recall of one memory always succeeds (REQ-13)
const MAX_MEMORIES = 3;
const STEP_MS = 600;

// The letter H, remembered from the start so the first visit can go straight to scramble and recall.
const LETTER_H: State = Array.from({ length: N }, (_, i) => {
  const row = Math.floor(i / SIDE);
  const col = i % SIDE;
  return col === 0 || col === SIDE - 1 || row === 2 ? 1 : -1;
});

/** The interactive Hopfield network in the Hopfield card's "go deeper" part (REQ-13). */
export function HopfieldWidget() {
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>(LETTER_H);
  const [memories, setMemories] = useState<State[]>([LETTER_H]);
  const [status, setStatus] = useState("One pattern is remembered: the letter H. Scramble it, then press Recall.");
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const weights = useMemo(() => (memories.length ? train(memories) : null), [memories]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // While recall runs, controls are aria-disabled rather than disabled: a disabled button loses
  // keyboard and screen-reader focus (independent review F-04). The handlers ignore presses instead.
  const toggle = (i: number) => {
    if (running) return;
    setState((s) => s.map((v, j) => (j === i ? -v : v)));
  };

  const remember = () => {
    if (running) return;
    if (memories.some((m) => m.every((v, i) => v === state[i]))) {
      setStatus("This pattern is already remembered.");
      return;
    }
    if (memories.length >= MAX_MEMORIES) {
      setStatus(`This small network holds up to ${MAX_MEMORIES} memories. Forget them to start again.`);
      return;
    }
    setMemories((m) => [...m, state]);
    setStatus(`Pattern remembered. The network now holds ${memories.length + 1}.`);
  };

  const scramble = () => {
    if (running) return;
    const picks = [...Array(N).keys()].sort(() => Math.random() - 0.5).slice(0, SCRAMBLE);
    setState((s) => s.map((v, i) => (picks.includes(i) ? -v : v)));
    setStatus(`${SCRAMBLE} neurons flipped at random. Press Recall to let the network settle.`);
  };

  const runRecall = () => {
    if (running) return;
    if (!weights) {
      setStatus("Remember a pattern first: draw one and press Remember this pattern.");
      return;
    }
    const { sweeps } = recall(weights, state, rng(Date.now() >>> 0));
    setRunning(true);
    const delay = reduce ? 0 : STEP_MS;
    sweeps.forEach((s, k) => {
      timers.current.push(
        window.setTimeout(() => {
          setState(s.state);
          const last = k === sweeps.length - 1;
          setStatus(
            last
              ? `Stable after ${k + 1} step${k ? "s" : ""}: no neuron wants to change.`
              : `Step ${k + 1}: ${s.changed} neuron${s.changed === 1 ? "" : "s"} changed.`,
          );
          if (last) setRunning(false);
        }, delay * (k + 1)),
      );
    });
  };

  return (
    <div data-testid="hopfield" className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <h3 className="text-base font-semibold">Try it: a 25-neuron Hopfield network</h3>
      <p className="mt-1">
        Click squares to draw. Remember a pattern, scramble it, then recall it. Dark squares are +1, light squares −1.
      </p>
      <div className="mt-4 flex flex-wrap items-start gap-6">
        <div role="group" aria-label="Neurons, 5 by 5" className="grid grid-cols-5 gap-1.5">
          {state.map((v, i) => (
            <button
              key={i}
              type="button"
              data-testid="neuron"
              aria-pressed={v === 1}
              aria-label={`Neuron row ${Math.floor(i / SIDE) + 1}, column ${(i % SIDE) + 1}`}
              aria-disabled={running}
              onClick={() => toggle(i)}
              className={cn(
                "size-11 rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-disabled:cursor-wait",
                v === 1 ? "border-primary bg-primary" : "border-border bg-muted hover:bg-accent",
              )}
            />
          ))}
        </div>
        {/* min-w-56: the controls wrap under the grid on a phone instead of shrinking beside it */}
        <div className="min-w-56 flex-1 space-y-3 [&_[aria-disabled=true]]:opacity-50">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={remember} aria-disabled={running}>
              Remember this pattern
            </Button>
            <Button type="button" variant="outline" onClick={scramble} aria-disabled={running}>
              Scramble {SCRAMBLE} neurons
            </Button>
            <Button type="button" variant="outline" onClick={runRecall} aria-disabled={running}>
              Recall
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={() => !running && setState(new Array(N).fill(-1))} aria-disabled={running}>
              Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (running) return;
                setMemories([]);
                setStatus("Memories forgotten. Draw a pattern and press Remember this pattern.");
              }}
              aria-disabled={running}
            >
              Forget memories
            </Button>
          </div>
          <p className="text-muted-foreground">
            Memories: <span data-testid="stored-count">{memories.length}</span>
            {weights && <> · energy {energy(weights, state)} (lower means more settled)</>}
          </p>
          <p data-testid="hopfield-status" aria-live="polite" className="font-medium">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
