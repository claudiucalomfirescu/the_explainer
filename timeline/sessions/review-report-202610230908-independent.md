**Targets:** `src/`, `tests/`, `scripts/`, `content/`, `.github/workflows/pages.yml`, `docs/deploy.md`

# Independent adversarial review, 2026-10-23

This was a fresh-context review. The reviewer read the spec, the ADRs, the architecture doc, the source, the tests and the content. It ran every suite, planted 13 new mutations and fact-checked the card text against sources. No project file was changed. Every mutated file was restored to its recorded SHA-256, checked across the project tree (`shasum -c` clean). `out/` was rebuilt as the root build at the end.

## What was run, and the results

| Command | Result |
|---|---|
| `pnpm test` (Vitest) | 6 files, 70 tests passed |
| `pnpm test:py` | 12 tests passed |
| `pnpm test:hosts` | Pages project: 2 passed (crawl under `/ai-history-timeline/`, 404). Root rebuild: 2 passed |
| `pnpm exec playwright test --project=root --workers=2` | 39 passed. Chrome launched every time, so there was no instrument issue |
| Scratch exploratory suite (in the scratchpad, served from `out/`) | Console: no errors or warnings on 16 direct loads and 16 client navigations. axe (wcag2a/aa, 21aa, 22aa) on all 16 cards with "go deeper" open, and on the 404 page: no violations at all. Reflow at 375 px and 320 px, all 16 cards with "go deeper" open: no page overflow, nothing past the viewport edge. Back and Forward over 3 cards: URL, h1, `aria-current` and `<title>` were all correct. The route announcer read the new card title. The skip link is visible on focus, and the next Tab lands inside the card |
| Pages build, scratch check | Space on a marker went to `/ai-history-timeline/lstm/`. The header link and the 404 page's link carry the base path. Home `og:url` is `…/ai-history-timeline/`. No 4xx apart from the deliberate 404 |
| Built HTML share tags (`out/index.html`, `out/hopfield/index.html`) | See F-07 |
| Workflow action tags (`checkout@v7`, `pnpm/action-setup@v6`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`) | All six tags exist on GitHub (API 200) |

## Probe table (new probes only; `scripts/run_probes.py` already covers U1–E8)

| Probe | Planted defect | Result |
|---|---|---|
| N1 | Text hydration mismatch inside the era label | CAUGHT, but only because the label text changed. The era-label test failed, not a hydration check |
| N1b | Attribute-only hydration mismatch on the timeline `<nav>` | MISSED. No test listens for console errors (low impact: production React keeps the server attribute silently) |
| N2 | Skip-link target `id="card"` renamed (the skip link goes nowhere) | MISSED |
| N3 | Hopfield intro paragraph shrunk to 14 px (below REQ-16's 16 px) | MISSED. The 16 px check covers only `/perceptron/` |
| N4 | Focus ring removed from the 25 Hopfield neurons (`outline-none`) | MISSED (rerun). The first run showed "CAUGHT", but only because an unrelated control test failed, see F-03 |
| N5 | Share-image route renders a blank card for every milestone (slug keeps `.png`) | MISSED. The tests check status 200 and content type, never the content |
| N6 | Transformer iframe `src` bypasses `asset()` | CAUGHT (Pages crawl) |
| N7 | Space key navigates with `window.location.assign(href)` (drops the base path on Pages) | MISSED on the Pages project. No host test presses Space |
| N7b | Same mutation, root suite | MISSED. On root, a full page load passes the URL and h1 checks |
| N8 | Deeper step headings h3 → h4 (skipped heading level) | MISSED (rerun). The first run "CAUGHT" only through the flaky controls, see F-03. axe's `heading-order` is "moderate" and the scans keep only serious/critical |
| N9 | "Bonus" badge dropped from the MoE marker (REQ-1: "The bonus card is marked as a bonus") | MISSED |
| N10 | Hopfield recall ignores reduced motion (600 ms steps always) | MISSED |
| N11 | Home page `og:url` removed | MISSED. Share tags are tested only on milestone pages |

## Findings

### BLOCKER

None.

### SHOULD-FIX

**F-01 CONFIRMED, SHOULD-FIX: Hebb did not work with Lashley "on memory in rats".**
- **Where:** `content/milestones/02-hebbian-learning.json:13`.
- **Evidence:** Hebb's 1936 Harvard PhD under Lashley was *The innate organization of visual perception in the rat*. It studied size and brightness perception in rats reared in the dark. Memory (the engram) was Lashley's own programme. Later, Hebb's work with Lashley at Yerkes was on chimpanzees.
- **Sources:**
  - https://en.wikipedia.org/wiki/Donald_O._Hebb
  - https://mcgill.ca/neuro/about/notable-figures/donald-hebb-phd
  - https://www.psych.ualberta.ca/GCPWS/Hebb/Biography/Hebb_bio4.html
- The Penfield half of the sentence is right: Montreal Neurological Institute, 1937–39, the effects of brain surgery on intelligence (McGill page above).
- **Fix:** "…and with Karl Lashley on vision in rats".

**F-02 CONFIRMED, SHOULD-FIX: Nowlan's doctorate was from Carnegie Mellon, not Toronto.**
- **Where:** `content/milestones/07b-mixture-of-experts.json:32`, which says "Doctoral student of Geoffrey Hinton at the University of Toronto".
- **Evidence:** CMU's Computer Science Department lists Steven Nowlan's PhD (May 1991) with Hinton as advisor. The thesis is tech report CMU-CS-91-126. Nowlan worked with Hinton in Toronto, and the 1989 and 1991 papers give a Toronto affiliation, but the degree was from CMU.
- **Sources:**
  - https://www.csd.cmu.edu/academics/doctoral/degrees-conferred/steven-nowlan
  - https://mailman.srv.cs.cmu.edu/pipermail/connectionists/1991-June/013418.html
- **Fix:** "Doctoral student of Geoffrey Hinton (a Carnegie Mellon doctorate), working with him in Toronto."

**F-03 CONFIRMED, SHOULD-FIX: the two "control" tests are flaky. A red run can come from them rather than from the planted defect.**
- **Where:** `tests/e2e/a11y.spec.js:13` and `tests/e2e/phone.spec.js:10`.
- **Evidence:** In the first probe batch, `phone.spec.js:10` failed on the N4 run. On the N8 run, both `a11y.spec.js:13` and `phone.spec.js:10` failed. Neither mutation touches what those controls plant. Rerun alone (N4, N8), the same mutations produced green suites (MISSED).
- **Likely cause (PLAUSIBLE):** each control calls `page.goto("/")` and at once appends a node to `<main>`. If that happens before hydration finishes, React can reconcile `<main>` and remove the node, so the control "passes the page" and fails.
- **Why it matters:** a flaky control turns some mutation runs into false CAUGHTs. This review saw two, so a probe table built on single runs can overstate coverage.
- **Fix:** wait for hydration before planting (for example `await page.locator('[data-testid="marker"]').first().focus()` after `waitForLoadState("networkidle")`), or plant into a node React does not own (append to `document.body`).

**F-04 CONFIRMED, SHOULD-FIX: pressing Recall in the Hopfield widget throws keyboard and screen-reader focus onto `<body>`.**
- **Where:** `src/components/hopfield-widget.tsx:91,103-127` (`disabled={running}` on every control).
- **Evidence:** in the scratch probe, Recall was focused and Enter pressed. During the run, focus was still on the Recall button. After "Stable…", `document.activeElement` was `BODY`. Chrome's sequential-navigation start point then sent the next Tab to "Clear". Screen readers (VoiceOver especially) lose their place when the focused control becomes `disabled`.
- **Spec:** REQ-13 asks that the visual be keyboard-operable (see also WCAG 2.4.3).
- **Fix:** use `aria-disabled` plus an early return in the handlers instead of `disabled`, or keep Recall enabled and ignore presses while running.

**F-05 CONFIRMED, SHOULD-FIX: REQ-16 (16 px body text) and REQ-17 focus visibility are checked on too narrow a sample.**
- **Where:** `tests/e2e/phone.spec.js:44-55` checks font size only on `/perceptron/`. `tests/e2e/a11y.spec.js:38` checks the focus indicator only on a timeline marker.
- **Evidence:** N3 (Hopfield text at 14 px) MISSED. N4 (no focus ring on 25 neurons) MISSED. No test checks the "Go deeper" trigger, the Hopfield buttons or the Play button for a focus indicator.
- **Fix:**
  - Loop the 16 px check over all 16 slugs with "go deeper" open.
  - Tab through the Hopfield widget and assert an outline or box-shadow on each focused control.

**F-06 CONFIRMED, SHOULD-FIX: REQ-1's "the bonus card is marked as a bonus" has no test.**
- **Where:** `src/components/timeline.tsx:94-96`. No assertion exists in `tests/e2e/timeline.spec.js`.
- **Evidence:** N9 MISSED.
- **Fix:** assert that the `mixture-of-experts` marker contains "Bonus" and that no other marker does.

**F-07 CONFIRMED, SHOULD-FIX: the share tags that matter for LinkedIn and X are tested only partly. The home page and milestone pages lose `og:site_name`, `og:locale`, and on home `og:type`.**
- **Where:** `src/app/page.tsx:7-10` and `src/app/[slug]/page.tsx:23-24`.
- **Evidence (built HTML):** `out/index.html` has no `og:type`, `og:site_name` or `og:locale`. `out/hopfield/index.html` has `og:type=article` but no `og:site_name` or `og:locale`. Only `out/404.html` carries the layout's set. Next.js merges `openGraph` shallowly, so a page-level `openGraph` replaces the layout's whole object. `og:type` is one of the four required Open Graph properties (https://ogp.me/#metadata).
- **Test gaps:**
  - N11 (home `og:url` removed) MISSED: no test reads the home page's share tags.
  - N5 (blank share image for every card) MISSED: only status and content type are checked.
- **Fix:**
  - Spread a shared `openGraph` base (siteName, locale, type) into each page's `openGraph`.
  - Add home to the share-tag test.
  - Assert that each `/og/<slug>.png` differs from `/og/site.png` (byte length or hash).

**F-08 CONFIRMED, SHOULD-FIX: the Space-key path is never tested on the Pages build.**
- **Where:** `tests/e2e/hosts.spec.js` (clicks only). Code: `src/components/timeline.tsx:72-77`.
- **Evidence:** N7 (Space handler drops the base path) MISSED on the Pages project. N7b MISSED on root. The current code is correct: a scratch check on the Pages build went to `/ai-history-timeline/lstm/`. The gap is that a regression would ship unseen.
- **Fix:** in `hosts.spec.js`, focus a marker, press Space, and assert the URL stays under `base.pathname`.

### NICE-TO-HAVE

**F-09 CONFIRMED: no test catches a dead skip link.**
- **Where:** `src/app/layout.tsx:36` → `src/app/template.tsx:35`.
- **Evidence:** N2 MISSED.
- **Fix:** assert `document.querySelector(skipLink.hash)` exists and that the next Tab after activating it lands inside the card.

**F-10 CONFIRMED: no test guards the Hopfield animation's reduced-motion setting.**
- **Where:** `src/components/hopfield-widget.tsx:59`.
- **Evidence:** N10 MISSED.
- **Fix:** under `reducedMotion: "reduce"`, assert that "Stable" appears within about 300 ms.

**F-11 CONFIRMED: there is no console-error or `pageerror` listener in any spec.**
- **Evidence:** N1b MISSED.
- Today the site logs nothing (scratch check). A listener in `hosts.spec.js` would catch runtime errors that only show in the static export.

**F-12 CONFIRMED: Hopfield UX details that confuse a non-expert.**
- **Where:** `src/components/hopfield-widget.tsx:37-44,131`.
- **What happens:**
  - "Remember this pattern" on the untouched H stores a duplicate, using up one of the three slots. Scratch probe: two presses gave 3 memories, all H, and the third press was refused.
  - The status line shows "energy -900" with no explanation on the widget.
- **Fix:**
  - Ignore a pattern that is already stored ("Already remembered").
  - Add a one-line gloss for energy, or hide it.

**F-13 PLAUSIBLE: evaluative language about researchers, against spec §Constraints ("no evaluative language about other researchers").**
- `07b-mixture-of-experts.json:28`: "one of the most influential figures in machine learning and statistics".
- `04-perceptrons-critique.json:9`: "Two respected scientists".
- **Fix:** state what they did instead (for example "who later built Berkeley's machine-learning group").

**F-14 PLAUSIBLE: two narrative claims that mislead by omission.**
- `04-perceptrons-critique.json:9` says "the field went quiet for over a decade". Neural network work continued through the 1970s (Amari, Kohonen, Grossberg, Fukushima's neocognitron in 1980, Werbos in 1974). Accounts of the "official history" of this episode treat the book's role as contested. Source: Olazaran, "A Sociological Study of the Official History of the Perceptrons Controversy", *Social Studies of Science* 26(3), 1996, https://doi.org/10.1177/030631296026003005.
  - **Fix:** "research and funding shrank sharply for over a decade."
- `09-deep-belief-networks.json:48` says that before 2006 deep networks "usually got stuck… so most people used shallow ones". It leaves out the convolutional networks that LeCun's group trained with backpropagation from 1989 (the AlexNet card cites them). Source: LeCun et al., "Backpropagation Applied to Handwritten Zip Code Recognition", 1989, https://doi.org/10.1162/neco.1989.1.4.541.
  - **Fix:** add "apart from convolutional networks for images".

**F-15 PLAUSIBLE: word2vec's "king − man + woman lands closest to queen" leaves out a known caveat.**
- **Where:** `11-word2vec.json:9` (part 1) and the step "Arithmetic on meaning".
- The result holds only when the three input words are excluded from the search. Otherwise the nearest word is usually "king" itself.
- **Source:** Nissim, van Noord, van der Goot, "Fair is Better than Sensational", *Computational Linguistics* 46(2), 2020, https://doi.org/10.1162/coli_a_00379.
- **Fix:** in the step only, add "(leaving out the three words you started from)". Part 1 can stay simple.

**F-16 PLAUSIBLE: the restricted Boltzmann machine is presented without its inventor.**
- **Where:** `06-boltzmann-machine.json:72`.
- Smolensky introduced it as the "harmonium" in 1986 (*Parallel Distributed Processing*, vol. 1, ch. 6). Hinton's 2002 contrastive divergence is what made it fast to train.
- **Source:** https://en.wikipedia.org/wiki/Restricted_Boltzmann_machine
- **Fix:** "…gives the restricted Boltzmann machine (Paul Smolensky, 1986)."

**F-17 PLAUSIBLE: two part-1 "idea" texts lean on terms a non-expert may not know (REQ-3).**
- `09-deep-belief-networks.json`: "without any labels", "fine-tuned", "layer".
- `13-transformer.json`: "built almost entirely from attention". A reader arriving from a shared link has not seen the attention card.
- **Fix:** add a plain gloss ("labels: the right answers"; "attention: each word deciding which other words matter to it").

**F-18 CONFIRMED: the Hebb paper link opens a different edition from the one the card names.**
- **Where:** `02-hebbian-learning.json:20-27`.
- The card names the 1949 Wiley book, but the DOI is the Psychology Press reissue. This is disclosed in the venue text and in `docs/link-check.md`.
- Recorded only so the owner knows the link opens a 2002/2005 edition. No change is needed if that is intended.

**F-19 CONFIRMED: share tags fall back silently to localhost.**
- **Where:** `src/lib/paths.ts:15-18`.
- A build with neither `NEXT_PUBLIC_SITE_URL` nor `VERCEL_PROJECT_PRODUCTION_URL` set writes `http://localhost:4173` into every `og:url`, `og:image` and canonical. Example: any host other than the two, or a Vercel project with system environment variables turned off.
- **Fix:** fail the build (or warn loudly) when `NODE_ENV=production`, `CI` is set and the fallback is used.

**F-20 CONFIRMED: `docs/architecture.md` has drifted from the code.**
- It describes `MotionConfig reducedMotion="user"` (line 89). The code uses `useReducedMotion()` in `template.tsx`.
- It lists `components/paper.tsx` and `components/hopfield/…` (lines 29-30). Neither exists; the widget is `hopfield-widget.tsx`.
- **Fix:** update the doc.

## Content claims checked and found correct (no action)

These claims were checked against the source or a reputable record and hold:

- **McCulloch and Pitts:** McCulloch was at the University of Illinois College of Medicine in Chicago (Illinois Neuropsychiatric Institute). Pitts was born in 1923, so he was a teenager in 1941–42.
- **Hebb's slogan and Shatz:** the phrase is attributed to Shatz, *Scientific American*, September 1992. The card says "usually credited", which fits: Löwel and Singer had a similar phrase earlier in 1992. Source: https://en.wikipedia.org/wiki/Carla_J._Shatz
- **SNARC:** built by Minsky in 1951.
- **Papert:** worked with Piaget in Geneva, and co-created Logo in 1967 with Feurzeig and Solomon.
- **1958 press:** the *New York Times* of 8 July 1958 said the machine would "walk, talk, see, write, reproduce itself and be conscious".
- **Mark I Perceptron:** a 20×20 photocell array, with motor-driven potentiometers for the weights. Source: https://en.wikipedia.org/wiki/Perceptron
- **Hopfield's paper:** affiliations Caltech and Bell Labs; capacity "about 0.15 N".
- **Nobel and Turing awards:** the 2024 Nobel Prize in Physics went to Hopfield and Hinton. Bengio, Hinton and LeCun share the 2018 Turing Award.
- **Boltzmann and backprop authors at the time:** Hinton at CMU and Sejnowski at Johns Hopkins (1985); Ackley a CMU student; Rumelhart and Williams at UCSD.
- **LSTM history:**
  - Hochreiter's 1991 TUM diploma thesis. It was a diploma thesis, not a doctorate, which the card's "thesis" allows.
  - Schmidhuber at IDSIA in 1997; LSTM bridged lags of "more than 1,000" steps.
  - The forget gate came from Gers, Schmidhuber and Cummins in 2000.
- **Deep belief nets:** Osindero a postdoc in Hinton's group; Teh at NUS with a Toronto PhD under Hinton; 1.25 % error on MNIST.
- **AlexNet:**
  - 60 million parameters, 5 convolutional plus 3 fully connected layers.
  - Two GTX 580s for "between five and six days".
  - ReLU "several times faster".
  - 15.3 % against 26.2 % top-5 error; about 1.2 million training images.
  - DNNresearch was acquired by Google in March 2013.
- **word2vec:** 1.6 billion words in under a day.
- **Attention:** Cho was first author of the 2014 GRU paper. "European Economic Area" maps to "zone économique européenne" in the paper's example.
- **Transformer:** the paper's footnote credits Shazeer with scaled dot-product attention, multi-head attention and the parameter-free position representation; 8 heads; 6 + 6 layers.
- **Mixture of experts:** 137 billion parameters and "thousands of experts" (arXiv abstract). Mixtral 8x7B and DeepSeek-V3 are sparse MoE models.
- **Scaling and GPT:**
  - Kaplan's affiliation in the paper is Johns Hopkins and OpenAI; Kaplan and Brown co-founded Anthropic.
  - Trends span "more than seven orders of magnitude".
  - GPT-1, GPT-2 and GPT-3 had 117 million, 1.5 billion and 175 billion parameters.
  - Chinchilla was published in 2022.
- **InstructGPT and ChatGPT:** the 1.3 billion parameter model was preferred over 175 billion GPT-3 (abstract). ChatGPT was released on 30 November 2022 and trained "using the same methods as InstructGPT".
- **Author counts:** GPT-3 has 5 + 26 = 31 authors; InstructGPT has 5 + 15 = 20.

The reviewer relied on its own knowledge of the primary papers for the items above. Web lookups were made only for the claims in F-01, F-02, Shatz, the Mark I and the Hebb–Penfield work.

## Counts

BLOCKER 0 · SHOULD-FIX 8 (F-01 to F-08) · NICE-TO-HAVE 12 (F-09 to F-20).
