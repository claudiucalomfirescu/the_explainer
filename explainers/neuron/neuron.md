# The artificial neuron

Revision 2 (after independent review, see `review-log.md`).

An artificial neuron is a tiny decision-maker. It weighs several signals, adds them up, and turns the total into one output.

## Concept map

| # | Concept | Depth | Needs | Threshold? |
|---|---|---|---|---|
| 1 | Signals as numbers | Brief | everyday life | |
| 2 | Weights: how much each input counts | Full | 1 | **Yes** |
| 3 | Adding up the evidence (and the bias) | Brief | 1, 2 | |
| 4 | Activation: turning the total into an output | Brief | 3 | |
| 5 | The artificial neuron as a whole | Full | 1-4 | |

## How-it-works candidates

- **"A signal passing through one neuron"**: three inputs travel along connections of different strength and get added up. One output comes out. Then one input changes, and the output changes with it. (concepts #2-#5)
- **"A neuron learning"** (next episode, not covered in this text): after a wrong answer, the connection strengths shift a little so the next answer is closer.

## 1. Signals as numbers (Brief)

- A computer cannot feel "sunny" or "tired". It needs numbers.
- So each piece of information becomes a number, here between 0 and 1.
- 0 means "not at all", 1 means "fully". "Quite tired" might be 0.9.
- These numbers are the neuron's **inputs**.

## 2. Weights: how much each input counts (Full, threshold concept)

### Where this fits
- A neuron gets several inputs at once.
- They should not all count equally. Something has to decide how much each one matters.

### Core idea
- Each input has its own **weight**: a number that says **how much, and in which direction, this input pushes the decision**.

### Building blocks
- **Input**: a number describing one piece of information.
- **Weight**: a number attached to the connection that carries that input.
  - Large positive weight: this input pushes strongly towards "yes".
  - Weight near zero: this input barely matters.
  - Negative weight: this input pushes towards "no".

### Analogy
- Weights are like **how much you listen to each advisor, and which side they argue for**.
- Three friends advise you. Two argue for the run, one argues against.
- You listen hard to some and barely to others.
- Where it breaks:
  - You choose whom to listen to. A neuron's weights are just numbers. Training sets them, not understanding.
  - Advisors give opinions; inputs are plain measurements.
  - A negative weight does not mean the input is untrustworthy. It means the input is reliable evidence *against*.

### How it works, in words
1. Each input arrives along its own connection.
2. The connection multiplies the input by its weight.
3. A strong connection lets a lot of the signal through; a weak one lets little through.
4. A negative connection turns the signal into a push the other way.
5. The weighted signals then go on to be added up.

*Watch it: "A signal passing through one neuron".*

### Worked example
- Decision: "Should I go for a run?"
- Inputs: sunny = 1.0, free time = 0.8, tired = 0.9.
- Weights: sunny 0.6, free time 0.5, tired -0.7.
- Weighted signals: 1.0 × 0.6 = 0.6, 0.8 × 0.5 = 0.4, 0.9 × -0.7 = -0.63.
- Tiredness pulls hard against the run.

### Misconceptions
- *Common belief:* the weights are rules a programmer wrote in.
  **Actually:** they start random. **Training** then adjusts them: the network sees many examples and nudges each weight to reduce its mistakes. Nobody types them in.
- *Common belief:* a bigger input always means a bigger output.
  **Actually:** only if its weight is positive. With a negative weight, more input means less output.

### Why it matters
- A **neural network** is many neurons connected, the outputs of some feeding the inputs of others.
- **Weights (and biases) are where a network's learned knowledge lives.** Training means finding good values for them.
- Large models have billions of weights; each one is this same simple idea.

### Check yourself
1. Why can't the neuron just add up the raw inputs?
   - Because some inputs matter more than others, and some should count against the decision.
2. What happens to the output if you double a weight that is negative?
   - That input pushes even harder towards "no", so the output drops (as long as that input is not zero).

## 3. Adding up the evidence, and the bias (Brief)

- The neuron adds all the weighted signals into one total.
- It also adds a **bias**: a fixed nudge that sets how easy it is to say "yes" at all.
- Think of the bias as your mood before hearing any advice: lazy or eager.
- Example: 0.6 + 0.4 - 0.63 = 0.37. Bias -0.1 (slightly lazy). Total = **0.27**.

## 4. Activation: turning the total into an output (Brief)

- The total could be any number. The neuron squeezes it into a tidy range, here 0 to 1.
- This squeezing step is the **activation**. Here it is an S-curve:
  - total 0 gives 0.5;
  - total 1 gives about 0.73, total -1 about 0.27;
  - total 3 gives about 0.95, total -3 about 0.05. Big totals flatten near 1 or 0.
- Example: total 0.27 becomes **0.57**. "Slightly in favour of the run."
- Why it matters: networks are built in **layers**, rows of neurons where each row feeds the next. Without a bend like this, many layers would be no more powerful than one.

## 5. The artificial neuron as a whole (Full)

### Where this fits
- Inspired loosely by brain cells, which fire when enough incoming signals arrive.
- McCulloch and Pitts proposed it as a mathematical idea in 1943.
- Rosenblatt's **perceptron** (1958), a single neuron that adjusts its own weights from examples, made it able to learn.

### Core idea
- A neuron **weighs its inputs, adds them up, and squeezes the total into one output**.

### Building blocks
- Inputs (#1), weights (#2), sum and bias (#3), activation (#4).

### Analogy
- A **judge on a talent show**. The judge weighs several criteria and cares more about some.
- The judge starts with a personal bias, adds it all up, and gives one score.
- Where it breaks:
  - A judge has opinions and reasons; a neuron just does arithmetic.
  - A real brain cell is far more complex: timing, chemistry, thousands of connections.

### How it works, in words
1. Inputs arrive.
2. Each connection multiplies its input by its weight.
3. The weighted signals and the bias are added into one total.
4. The activation squeezes the total into the output.
5. The output can become an input to other neurons.

*Watch it: "A signal passing through one neuron".*

### Worked example
- Same run decision: output **0.57** when tired is 0.9.
- Now you are rested: tired = 0.1. Weighted signal becomes -0.07. Total = 0.83. Output = **0.70**.
- Same weights, different inputs, different answer. The neuron reacts to the situation.

### Misconceptions
- *Common belief:* an artificial neuron works like a brain cell.
  **Actually:** it borrows one idea (add up signals, then respond) and drops almost everything else.
- *Common belief:* one neuron is smart.
  **Actually:** one neuron can only make simple either/or splits. It cannot handle "yes if A or B, but not both". That needs many neurons in layers.

### Why it matters
- Large language models such as ChatGPT or Claude contain millions of units like this, connected by billions of weights.
- Their building blocks differ in detail (different activations, plus other parts such as attention), but the weigh-and-add idea is the same.
- Next step: connect neurons in layers, then let the network learn its weights.

### Check yourself
1. If every weight were zero, what would the output depend on?
   - Only the bias. The inputs would be ignored.
2. Why does the neuron need the squeezing step?
   - This S-curve keeps outputs between 0 and 1. Any activation adds the bend that makes stacked layers powerful.

## Sources
- McCulloch & Pitts (1943), *A Logical Calculus of the Ideas Immanent in Nervous Activity*, Bulletin of Mathematical Biophysics.
- Rosenblatt (1958), *The perceptron: A probabilistic model for information storage and organization in the brain*, Psychological Review.
- Numbers computed in Python (sigmoid activation).
