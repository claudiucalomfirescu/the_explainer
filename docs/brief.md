# AI History Timeline — Claude Code Starter Kit

A small, shareable web app that tells the story of the ideas that led to today's LLMs, from the artificial neurons of the 1940s to ChatGPT. Hand this document to Claude Code as the project brief.

## Goal and audience

- Public, shareable site (LinkedIn / X), aimed at curious non-experts first.
- Every idea uses a **depth ladder**: a very simple explanation first, then step-by-step drill-down into the technical details and the original paper. Readers stop wherever they like.
- Version 1 covers about 15 key milestones and can grow later.

## Navigation and layout

- **Main view: a horizontal timeline** of milestones grouped into eras (1940s–50s, first AI winter, 1980s revival, 1990s sequences, deep learning, attention and transformers, scale).
- **Clicking a milestone opens a card underneath the timeline.** Each card has the same structure:
  1. **The idea in plain words.** One or two sentences, no jargon.
  2. **Where it came from.** Which earlier idea or person inspired it, with a clickable link back to that milestone so readers can follow the thread.
  3. **Who.** The people, with a portrait and a short note on each.
  4. **The paper.** Title, year, venue, link, and a short summary of what it showed or made possible.
  5. **Go deeper.** The technical mechanics, optionally with a small interactive visual.
- Each milestone should have its own URL (for example `/hopfield`) so single cards can be shared.

## The 15 milestones (v1)

| # | Year | Milestone | People | Inspired by |
| --- | --- | --- | --- | --- |
| 1 | 1943 | Artificial neuron | Warren McCulloch, Walter Pitts | Neuroscience, logic |
| 2 | 1949 | Hebbian learning ("fire together, wire together") | Donald Hebb | Neuroscience |
| 3 | 1958 | Perceptron | Frank Rosenblatt | 1, 2 |
| 4 | 1969 | *Perceptrons* critique and the first AI winter | Marvin Minsky, Seymour Papert | 3 |
| 5 | 1982 | Hopfield network | John Hopfield | 2, spin-glass/Ising physics, Amari 1972, Little 1974 |
| 6 | 1985 | Boltzmann machine | Geoffrey Hinton, Terry Sejnowski (with David Ackley) | 5, statistical physics |
| 7 | 1986 | Backpropagation | David Rumelhart, Geoffrey Hinton, Ronald Williams | 3, answers 4 |
| 8 | 1997 | LSTM | Sepp Hochreiter, Jürgen Schmidhuber | Recurrent networks, 7 |
| 9 | 2006 | Deep belief networks | Geoffrey Hinton, Simon Osindero, Yee-Whye Teh | 6 (restricted Boltzmann machines) |
| 10 | 2012 | AlexNet | Alex Krizhevsky, Ilya Sutskever, Geoffrey Hinton | 7, 9, GPUs, ImageNet |
| 11 | 2013 | Word2vec (words as vectors) | Tomas Mikolov et al. | Neural language models |
| 12 | 2014 | Attention | Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio | 8, 11 |
| 13 | 2017 | Transformer | Ashish Vaswani, Noam Shazeer et al. | 12 |
| 14 | 2018–2020 | GPT and scaling laws | OpenAI (Radford, Brown, Kaplan et al.) | 13 |
| 15 | 2022 | ChatGPT and learning from human feedback (RLHF) | OpenAI (Ouyang et al.) | 14 |

**Bonus card:** Mixture of experts. Jacobs, Jordan, Nowlan and Hinton (1991), scaled up by Shazeer et al. at Google (2017), now used in most large models.

## Paper links (starting points; verify each one)

- McCulloch & Pitts, "A Logical Calculus of the Ideas Immanent in Nervous Activity" (1943): https://doi.org/10.1007/BF02478259
- Hebb, *The Organization of Behavior* (1949, book)
- Rosenblatt, "The Perceptron" (1958): https://doi.org/10.1037/h0042519
- Minsky & Papert, *Perceptrons* (1969, book)
- Hopfield, "Neural networks and physical systems with emergent collective computational abilities" (1982): https://doi.org/10.1073/pnas.79.8.2554
- Ackley, Hinton & Sejnowski, "A Learning Algorithm for Boltzmann Machines" (1985): https://doi.org/10.1207/s15516709cog0901\_7
- Rumelhart, Hinton & Williams, "Learning representations by back-propagating errors" (1986): https://doi.org/10.1038/323533a0
- Jacobs, Jordan, Nowlan & Hinton, "Adaptive Mixtures of Local Experts" (1991): https://doi.org/10.1162/neco.1991.3.1.79
- Hochreiter & Schmidhuber, "Long Short-Term Memory" (1997): https://doi.org/10.1162/neco.1997.9.8.1735
- Hinton, Osindero & Teh, "A Fast Learning Algorithm for Deep Belief Nets" (2006): https://doi.org/10.1162/neco.2006.18.7.1527
- Krizhevsky, Sutskever & Hinton, "ImageNet Classification with Deep Convolutional Neural Networks" (NeurIPS 2012)
- Mikolov et al., "Efficient Estimation of Word Representations in Vector Space" (2013): https://arxiv.org/abs/1301.3781
- Bahdanau, Cho & Bengio, "Neural Machine Translation by Jointly Learning to Align and Translate" (2014): https://arxiv.org/abs/1409.0473
- Shazeer et al., "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer" (2017): https://arxiv.org/abs/1701.06538
- Vaswani et al., "Attention Is All You Need" (2017): https://arxiv.org/abs/1706.03762
- Kaplan et al., "Scaling Laws for Neural Language Models" (2020): https://arxiv.org/abs/2001.08361
- Brown et al., "Language Models are Few-Shot Learners" (GPT-3, 2020): https://arxiv.org/abs/2005.14165
- Ouyang et al., "Training language models to follow instructions with human feedback" (2022): https://arxiv.org/abs/2203.02155

## Tech stack

- **Framework:** Next.js (React). Static export is fine, so no server is needed.
- **Styling:** Tailwind CSS.
- **Components:** shadcn/ui for cards, dialogs and buttons.
- **Animation:** Motion (formerly Framer Motion) for transitions. Add GSAP only if scroll-driven effects are wanted.
- **Diagrams:** D3 or plain SVG for 2D visuals, such as an interactive Hopfield network with nodes you can flip.
- **3D (optional):** Three.js / React Three Fiber, reusing the existing explainer-animations project (transformer animation) as the deepest layer of the transformer card.
- **Icons:** Lucide.
- **Content:** Keep each milestone in its own Markdown/MDX or JSON file, separate from the code, so new milestones are easy to add.

A simpler alternative for a first test is a single HTML file plus CSS and an images folder. That runs on GitHub Pages as is.

## Images

- Portraits of the people go in an `images/` folder as separate files, not embedded in the HTML.
- Use freely licensed images, mainly from Wikimedia Commons, and credit each photographer and license on the card.

## Hosting

Both are free for this project. Test both.

- **Vercel (Hobby plan):** free, personal and non-commercial use only. About 100 GB transfer and around 1 million requests per month. Connect the GitHub repo and every push deploys automatically to `your-app.vercel.app`.
- **GitHub Pages:** free for public repos. Static files only (HTML, CSS, JS, images), which is all this app needs.
- Custom domain (optional): about $10–15 per year.

## Build steps for Claude Code

1. Scaffold the project (Next.js + Tailwind + shadcn/ui), or start from a Vercel template.
2. Create the milestone content files from the table above, using the five-part card structure.
3. Build the timeline view, then the card view with "where it came from" links between milestones.
4. Add portraits with credits.
5. Add one interactive visual as a pilot, such as the Hopfield network.
6. Push to GitHub, deploy on Vercel and on GitHub Pages, and compare.

## Useful links

- Next.js: https://nextjs.org
- Next.js showcase (inspiration): https://nextjs.org/showcase
- Vercel templates: https://vercel.com/templates
- Vercel Next.js templates: https://vercel.com/templates/next.js
- Vercel sign-up: https://vercel.com/signup
- GitHub Pages: https://pages.github.com
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Motion: https://motion.dev
- D3: https://d3js.org
- Three.js: https://threejs.org
- Lucide icons: https://lucide.dev
- Wikimedia Commons: https://commons.wikimedia.org
