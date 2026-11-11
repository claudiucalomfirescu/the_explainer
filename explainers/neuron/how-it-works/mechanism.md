# Mechanism: a signal passing through one neuron

## Scope
- **Question:** What happens to three inputs as they pass through one artificial neuron?
- **Takeaway:** "The neuron weighs each input, adds them up with a bias, and squeezes the total into one output."
- **Length:** about 60 seconds, 8 beats.
- Out of scope: learning (next episode), networks of neurons.

## State model

### Actors
| Actor | State that can change |
|---|---|
| Input nodes x1 "sunny", x2 "free time", x3 "tired" | value (0-1), lit/unlit |
| Connections w1, w2, w3 | weight value, thickness, colour (teal +, coral -) |
| Pulses on each connection | position along line, brightness |
| Neuron body: sum section | running total |
| Bias marker | value |
| Neuron body: activation section | S-curve, dot on curve |
| Output node y | value, brightness |

### Steps (run 1: tired)
1. Inputs light up: x = (1.0, 0.8, 0.9).
2. Connections show weights: w = (0.6, 0.5, -0.7). Thickness ∝ |w|; w3 coral.
3. Pulses travel. On arrival each carries x·w: 0.60, 0.40, -0.63.
4. Sum fills up step by step: 0.60 → 1.00 → 0.37.
5. Bias -0.1 is added: total 0.27.
6. Total moves onto the S-curve x-axis at 0.27; dot rises to 0.57.
7. Output node brightens to 0.57.

### Steps (run 2: rested)
- x3 changes 0.9 → 0.1. Weighted signal -0.07. Sum 0.93, total 0.83, output 0.70.

All numbers computed in Python: sigmoid(0.27) = 0.567, sigmoid(0.83) = 0.696.

```json
{
  "inputs":  {"sunny": 1.0, "free_time": 0.8, "tired": [0.9, 0.1]},
  "weights": {"sunny": 0.6, "free_time": 0.5, "tired": -0.7},
  "bias": -0.1,
  "run1": {"products": [0.60, 0.40, -0.63], "sum": 0.37, "total": 0.27, "output": 0.57},
  "run2": {"products": [0.60, 0.40, -0.07], "sum": 0.93, "total": 0.83, "output": 0.70}
}
```

## Visual grammar used
- Teal pulse = signal travelling. Coral = pushing against (negative weight).
- Line thickness = weight strength. Node fill brightness = value.
- All words and numbers are HTML labels. Navy background, thin off-white lines, no shadows.
