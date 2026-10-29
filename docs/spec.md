# Spec — AI History Timeline (v1)

Upstream: `docs/brief.md` (the project brief, copied 2026-10-22). Where this spec and the brief
differ, this spec records the decision and the reason.

## Objective

A public, shareable website that tells the story of the ideas that led to today's large language
models, from the artificial neuron (1943) to ChatGPT (2022). Readers arrive from a LinkedIn or X
post, often on a phone, and can share a single milestone by its own link.

## Problem being solved

Most explanations of LLMs either start at the transformer or drown non-experts in maths. This site
shows the chain of ideas, who had them and what inspired each one, and lets a reader stop at
whatever depth suits them.

## Audience

1. **Curious non-experts first.** No jargon in the first layer of any card.
2. Technical readers second: the deeper layers carry mechanics and the original paper.

## Functional expectations

- A horizontal timeline of milestones grouped into seven eras.
- Clicking a milestone opens its card underneath the timeline. Every card has the same five parts,
  in this order: the idea in plain words; where it came from; who; the paper; go deeper.
- The **depth ladder**: the plain-words layer is visible at once; deeper layers are one deliberate
  action away, so a reader is never shown the technical detail first.
- Each milestone has its own URL and a share preview.
- Content lives in files separate from the code, one per milestone, so v2 can add milestones
  without code changes.

## Constraints

- **Static site only.** No server, database or API at run time (brief: "Static export is fine").
- **Stack** (brief): Next.js with the App Router, Tailwind CSS, shadcn/ui, Motion, D3 or plain SVG,
  Lucide icons. GSAP is not used (no scroll-driven effects are asked for). Three.js only through the
  existing transformer explainer (REQ-14).
- **Two hosts** (brief): Vercel Hobby (site at the domain root) and GitHub Pages (site under
  `/<repo-name>/`). The same source must work on both.
- **Images**: freely licensed, mainly Wikimedia Commons; every image credited with author and
  licence on the card.
- **Accuracy**: every year, name, title and venue on a card must match a primary source (the paper
  or its publisher's record). A claim that cannot be sourced is cut, not softened.
- **Public-facing writing**: plain sentences, no internal tooling, no evaluative language about
  other researchers' work.
- **Deploying is the owner's action.** Building and verifying the export locally is in scope;
  creating accounts, creating the GitHub repository and pushing are done by the owner (REQ-18).

## Acceptance criteria

### Timeline and navigation

- **REQ-1 — Era timeline.** The home page shows every milestone on one horizontal timeline, in
  chronological order, grouped under seven labelled eras: *1940s–50s*, *First AI winter*,
  *1980s revival*, *1990s: sequences*, *Deep learning*, *Attention and transformers*, *Scale*. Each
  milestone marker shows its year and a short title (at most 40 characters; the card shows the full
  title). The bonus card is marked as a bonus. Milestones sit in eras as follows (numbers are the
  brief's table rows):

  | Era | Milestones |
  |---|---|
  | 1940s–50s | 1 artificial neuron, 2 Hebbian learning, 3 perceptron |
  | First AI winter | 4 *Perceptrons* critique |
  | 1980s revival | 5 Hopfield network, 6 Boltzmann machine, 7 backpropagation |
  | 1990s: sequences | bonus mixture of experts (1991), 8 LSTM |
  | Deep learning | 9 deep belief networks, 10 AlexNet, 11 word2vec |
  | Attention and transformers | 12 attention, 13 transformer |
  | Scale | 14 GPT and scaling laws, 15 ChatGPT and RLHF |
- **REQ-2 — Card opens below the timeline.** Activating a milestone (click, tap, or Enter/Space
  when focused) opens that milestone's card directly below the timeline and, when the card's top is
  outside the viewport, scrolls it into view.
  Exactly one card is open at a time; the active marker is visibly highlighted and carries
  `aria-current="true"`. The card change is animated with Motion, and the animation is skipped
  when the reader's system asks for reduced motion.
- **REQ-8 — One URL per milestone.** Every milestone has a URL of the form `/<slug>/` (for example
  `/hopfield/`). Opening that URL directly shows the timeline with that card open. Activating a
  milestone changes the address bar to its URL, and the browser Back button returns to the previous
  card. Each milestone page has its own `<title>`, meta description, `og:title`, `og:description`,
  `og:url` and `og:image`, plus `twitter:card`, so a pasted link previews with that milestone's
  name. The home page `/` opens on the first milestone's card.

### The card (five parts, in order)

- **REQ-3 — The idea in plain words.** One or two sentences, at most 50 words, with no term a
  non-expert would need to look up (no "gradient", "vector", "loss" and similar without an
  everyday explanation in the same sentence).
- **REQ-4 — Where it came from.** A list of the ideas or people that inspired this milestone. An
  inspiration that is itself a milestone on the timeline is a link that opens that milestone's card
  (REQ-8 URL). An inspiration that is not a milestone (for example "neuroscience" or "spin-glass
  physics") is plain text with a one-sentence note. Every milestone except the first lists at least
  one inspiration.
- **REQ-5 — Who.** Each person has a name, a short note (at most 40 words: who they were and what
  they contributed here) and a portrait or a placeholder (REQ-12). Where the brief names a team
  ("OpenAI (… et al.)"), the card names the paper's first author and the people the brief names,
  and says the paper had more authors.
- **REQ-6 — The paper.** Title, authors, year, venue, a link, and a summary of two to four
  sentences on what it showed or made possible. Books (Hebb 1949, Minsky and Papert 1969) carry the
  publisher instead of a venue and link to a stable catalogue or publisher page. Milestones with two
  defining papers (GPT and scaling laws; mixture of experts) list both.
- **REQ-7 — Go deeper.** The technical mechanics in three to eight short steps, written for a reader
  who has finished parts 1–4. It is collapsed by default and opens on one click or key press
  (depth ladder). Where an interactive visual exists (REQ-13, REQ-14) it sits inside this part.

### Content

- **REQ-9 — Content files, validated.** Each milestone is one JSON file in `content/milestones/`.
  The build reads every file in that folder, checks it against one schema, and **fails** with a
  message naming the file and field when: a required field is missing; two files share a slug; an
  inspiration points to a slug that does not exist; an inspiration points to a later milestone; a
  part exceeds its length limit. Adding a valid file adds a milestone with no code change.
- **REQ-10 — v1 content complete.** The 15 milestones of the brief's table plus the bonus mixture
  of experts card exist, each with all five parts filled. Year, people and "inspired by" match the
  brief's table unless a correction is recorded in `docs/decisions/` with its source.
- **REQ-11 — Sources verified.** Every paper link resolves (HTTP 200 after redirects, or a
  publisher page that names the paper), and each paper's title, first author and year match the
  publisher's or arXiv's record. The check is a script; its last run's results, with the date, are
  recorded in `docs/link-check.md`.

### Images and visuals

- **REQ-12 — Portraits with credits.** Portraits are separate files under
  `public/images/people/`, never embedded in HTML or JSON. Each used portrait has a free licence
  (public domain or Creative Commons) and its card shows the author, the licence name with a link
  to the licence, and a link to the source page. A person with no freely licensed portrait shows a
  neutral placeholder with their initials, never a broken image. Every image has alt text naming
  the person.
- **REQ-13 — Interactive Hopfield network.** The Hopfield card's "go deeper" part contains a grid
  of at least 25 neurons the reader can flip by click or tap. The reader can store the current
  pattern, scramble some neurons, and press "recall"; the network then updates step by step until
  it stops changing. With one stored pattern and fewer than half the neurons flipped, recall
  restores the stored pattern exactly. The visual is keyboard operable and announces its state to
  screen readers.
- **REQ-14 — Transformer animation.** The transformer card's "go deeper" part offers the existing
  transformer explainer animation (the self-contained Three.js page in the workspace). It loads
  only when the reader asks for it, so the page stays light, and it plays inside the card.

### Platform

- **REQ-15 — Static export on both hosts.** `pnpm build` produces a folder of static files with no
  server code. The same source builds for the domain root (Vercel) and for a sub-path such as
  `/ai-history-timeline/` (GitHub Pages) by one setting; in both builds every page, link, image
  and script resolves (no 404 in the browser's network log when visiting every milestone URL).
- **REQ-16 — Works on a phone.** At 375 px viewport width the page has no horizontal page scroll;
  the timeline scrolls sideways inside its own strip; the active marker is scrolled into view; body
  text on the card is at least 16 px (credits and captions at least 12 px) and no line is cut off.
- **REQ-17 — Accessible.** Everything is operable by keyboard with a visible focus ring; text meets
  WCAG 2.2 AA contrast; headings follow one outline per page; an automated accessibility scan
  (axe) of the home page and one milestone page reports no serious or critical issues.
- **REQ-18 — Deploy handover.** The repository contains a GitHub Actions workflow that builds and
  publishes to GitHub Pages, Vercel settings that need no edits, and `docs/deploy.md`: the steps
  the owner runs to create the repository, connect Vercel, enable Pages, and compare the two hosts
  (load time, preview card on LinkedIn and X, custom-domain path).

### Lesson view (v1.1, added 2026-10-23)

The concept and the chosen look are in `docs/concept-lesson-layout.md`; the settled mock-up is
`docs/concept/style-final.html`. This change builds one lesson, for the Hopfield network, beside
the existing card; the card and its widget stay as they are.

- **REQ-19 — Hopfield lesson screen.** `/lesson/hopfield/` is one screen in the chosen style
  (graphite `#23252b`, signal blue `#5f9dff`, a short soft glow on lit parts only, a 500 px text
  panel on wide screens). It shows: a stage with the network and its energy track and a toolbar
  (Reset, Links, Show the energy, Damage 5, Recall); tabs Idea, Where it came from, Who and Paper
  holding the same text as the Hopfield milestone file; the milestone's "go deeper" steps as a
  numbered list, where choosing a step makes the stage act it out and shows that step's text; a
  strip of all sixteen milestones grouped by era, Hopfield marked as current and every other one
  linking to its card; links to the timeline and to the Hopfield card. The page has its own title,
  description and share tags. The Hopfield card links to the lesson. No other milestone has a
  lesson, so any other `/lesson/<slug>/` is the site's 404 page.
- **REQ-20 — A real network and an exact valley.** The stage runs the same model as REQ-13 with H
  and T stored. The energy shown always equals the model's energy and never rises during recall.
  "Damage 5" flips five of the sixteen neurons where H and T differ, and Recall then updates one
  neuron at a time until nothing changes and restores H exactly. The track is the loop
  H → T → inverse H → inverse T → H (flip the sixteen, then the other nine, then back): its height
  at each state is that state's energy, the ball sits at the network's current place on it, and
  recall started anywhere on the loop stays on it.
- **REQ-21 — The lesson works for everyone.** Every control works by keyboard with a visible focus
  ring; every neuron is a button that reports its state; the step text is announced; text meets
  WCAG 2.2 AA contrast on the dark background; an axe scan reports no serious or critical issue.
  At 375 px the page has no sideways scroll (stage, panel and strip stack, the strip scrolls in its
  own row). With reduced motion asked for, nothing animates. On both hosts the page loads with no
  error response or console error.

Not in this change: a reading-progress counter, sidebar sections for eras, people and papers, and
lessons for the other fifteen milestones (`docs/concept-lesson-layout.md`, "What it costs").

## Out of scope (v1)

- Custom domain, analytics or tracking, comments, a CMS, translations.
- Dark mode (candidate for v2). The lesson screen of REQ-19 has its own dark design; it is not a
  site-wide dark mode, and the card pages stay light.
- GSAP and new Three.js work beyond embedding the existing explainer.
- Interactive visuals other than the Hopfield network and the transformer embed.

## Assumptions

1. Package manager pnpm, Node 24, Next.js 16.4 (the current release on 2026-10-22).
2. The GitHub repository will be named `ai-history-timeline`, so the Pages sub-path is
   `/ai-history-timeline/`. If the owner picks another name, only the build setting changes.
3. The transformer explainer at `Test/transformer-explainer/` is the "existing explainer-animations
   project" the brief refers to; it is copied into this project, never edited at its source.
