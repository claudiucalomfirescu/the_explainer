# Tasks — AI History Timeline (v1)

Upstream: `docs/plan.md`, `docs/spec.md`, `docs/architecture.md`. Test tasks come before the impl
tasks that make them pass; each impl task names the test task it implements. Unit tests live in
`tests/unit/*.test.js` (Vitest), browser tests in `tests/e2e/*.spec.js` (Playwright over the
exported `out/`), and every test carries a `// REQ-n` comment.

**Rule for every check** (prax global rules): a test is not done until it has been seen to fail.
Unit rules get a failing fixture each; browser tests are run red before the impl task; the layout
and accessibility tests carry a planted-failure control inside the test itself.

## Phase 1: Pilot (REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-9, REQ-16, REQ-17)

1. [SETUP] Scaffold Next.js 16.4 + Tailwind v4 + shadcn/ui with pnpm; add Motion, Lucide, zod,
   Vitest, Playwright, `@axe-core/playwright`, `serve`. `next.config.ts` per ADR-001. Scripts:
   `dev`, `build`, `test`, `test:e2e`. `.claude/launch.json` for the Browser pane.
   - Status: done (2026-10-22)
2. [TEST] Schema tests on fixtures (REQ-9, REQ-3, REQ-5, REQ-6, REQ-7)
   - One valid fixture passes. One failing fixture per rule: missing required field; unknown era;
     `shortTitle` over 40 characters; `idea` over 50 words; `idea` with three sentences; person
     note over 40 words; paper summary with one sentence and with five; `deeper` with two steps and
     with nine; zero papers and three papers.
   - Status: done (2026-10-22)
3. [IMPL] `src/lib/schema.ts`
   - Requirement IDs: REQ-9, REQ-3, REQ-5, REQ-6, REQ-7. Implements: Task 2.
   - Status: done (2026-10-22)
4. [TEST] Cross-file validation tests (REQ-9, REQ-4, REQ-5)
   - Failing fixtures: duplicate slug; duplicate person id; `cameFrom` to a missing slug; `cameFrom`
     to a later milestone; unknown person; portrait file missing; empty `cameFrom` on a milestone
     that is not the first. Each error message names the file and the field.
   - Status: done (2026-10-22)
5. [IMPL] `src/lib/validate.ts` and `src/lib/content.ts` (build throws on any error)
   - Requirement IDs: REQ-9, REQ-4, REQ-5. Implements: Task 4.
   - Status: done (2026-10-22)
6. [TEST] Content suite over the real `content/` folder (REQ-9, REQ-1)
   - Every file passes schema and cross-file validation; each present milestone sits in the era the
     spec's REQ-1 table gives it (expected map typed from the spec, not from the content).
   - Status: done (2026-10-22)
7. [IMPL] Pilot content: `01-artificial-neuron`, `02-hebbian-learning`, `03-perceptron`,
   `05-hopfield`, and `people.json` for their people. Slugs are short and shareable (the spec's
   example `/hopfield/`)
   - Requirement IDs: REQ-3, REQ-4, REQ-5, REQ-6, REQ-7. Implements: Task 6.
   - Facts checked against each paper's publisher record before writing.
   - Status: done (2026-10-22)
8. [TEST] Browser: timeline (REQ-1)
   - Seven era labels in the spec's order; markers in chronological order; each marker shows year
     and short title; eras with no pilot milestone still show their label.
   - Status: done (2026-10-22)
9. [TEST] Browser: card (REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7)
   - Click, Enter and Space on a marker open its card below the timeline (markers are links, which
     do not react to Space natively, so the test proves the added handler); exactly one card; active marker
     has `aria-current="true"`; the five parts appear in order; "go deeper" is closed until clicked
     or opened by keyboard; a `cameFrom` milestone link opens that card; a person without a portrait
     shows initials and no broken image.
   - Status: done (2026-10-22)
10. [TEST] Browser: URLs and share tags (REQ-8)
    - Direct load of `/hopfield/` shows that card; clicking a marker changes the URL; Back
      returns to the previous card; each page has its own `<title>`, description, `og:title`,
      `og:description`, `og:url`, `og:image`, `twitter:card`; `og:image` responds 200; `/` opens on
      the first milestone.
    - Status: done (2026-10-22)
11. [TEST] Browser: phone width (REQ-16)
    - At 375 px: document width equals viewport width; the strip scrolls sideways; the active
      marker is inside the strip's visible area; card body text ≥ 16 px. Control: a planted 600 px
      element must make the width check fail. (The credits ≥ 12 px clause has nothing to measure
      until portraits exist; it is tested in Task 20.)
    - Status: done (2026-10-22)
12. [TEST] Browser: accessibility (REQ-17)
    - axe on `/` and `/perceptron/`: no serious or critical findings; Tab reaches a marker and it
      shows a focus outline; one `h1` per page. Control: a planted unlabeled button must make axe
      report a serious or critical finding.
    - Status: done (2026-10-22)
13. [IMPL] Layout, Timeline, MilestoneCard, Person, Paper, Deeper, template with Motion, metadata
    and Open Graph image
    - Requirement IDs: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-16, REQ-17.
      Implements: Tasks 8, 9, 10, 11, 12.
    - Status: done (2026-10-22)
14. [INT] Phase 1 integration
    - `pnpm build`, then unit and browser suites green over `out/`; record the Open Graph image
      outcome (generated or static fallback) in status; screenshot desktop and 375 px for the owner.
    - Status: done (2026-10-22)

## Phase 2: All sixteen cards with verified sources (REQ-10, REQ-11)

15. [TEST] Content suite extended (REQ-10, REQ-1)
    - Exactly sixteen files; the slugs of the brief's fifteen rows plus the bonus; each file's year
      and people match the brief's table (expected values typed from `docs/brief.md`), unless an ADR
      records a sourced correction; the bonus is flagged.
    - Status: done (2026-10-22)
16. [TEST] Link checker tests (REQ-11)
    - `tests/unit/test_check_links.py`: a known-bad URL is reported failing; a title mismatch is
      reported; a 403 from a publisher is reported "needs manual confirmation", never "pass".
    - Status: done (2026-10-22)
17. [IMPL] `scripts/check_links.py` (follows redirects; compares title, first author, year with
    Crossref for DOIs and the arXiv API for arXiv ids)
    - Requirement IDs: REQ-11. Implements: Task 16.
    - Status: done (2026-10-22)
18. [IMPL] The twelve remaining content files and their people
    - Requirement IDs: REQ-10. Implements: Task 15.
    - Status: done (2026-10-22)
19. [INT] Phase 2 integration
    - Run the checker, write `docs/link-check.md` (date, each paper's result, manual
      confirmations); full suites green; content review for accuracy and plain language.
    - Status: done (2026-10-22)

## Phase 3: Portraits with credits (REQ-12)

20. [TEST] Portrait tests (REQ-12)
    - Unit: every registry portrait has file, author, licence, licence URL and source URL, and the
      file exists. Browser: every portrait on every page loads (no 404), has alt text naming the
      person, and shows its credit line at ≥ 12 px, also at 375 px width (REQ-16 credits clause).
      Added: the schema refuses licences that are not free (NC, ND, none) and credits that do not
      point to a Commons file page; a floor of at least one portrait keeps the checks from passing
      on an empty set.
    - Status: done (2026-10-22); the floor test turned green when Task 22 added the portraits
21. [IMPL] `scripts/find_portraits.py`: query the Wikimedia Commons API per person; list file,
    author, licence and source; write the candidate list for the owner's approval
    - Requirement IDs: REQ-12. Implements: Task 20 (inputs).
    - Status: done (2026-10-22): `docs/portraits-approval.md`; owner approved 12 of 14
22. [IMPL] Download the approved files (resized), fill `people.json`
    - Requirement IDs: REQ-12. Implements: Task 20.
    - Done with `scripts/fetch_portraits.py` and `scripts/portraits_approved.json` (crop boxes).
    - Status: done (2026-10-23)
23. [INT] Phase 3 integration: suites green; screenshots.
    - Status: done (2026-10-23)

## Phase 4: Interactive visuals (REQ-13, REQ-14)

24. [TEST] Hopfield model (REQ-13)
    - Weights symmetric with zero diagonal; a stored pattern is stable; for every flip count 1 to
      12 on a 25-neuron pattern (several random seeds) recall returns the stored pattern exactly;
      13 or more flips may return the inverse, and the test asserts recall still stops.
    - Status: done (2026-10-23)
25. [IMPL] `src/lib/hopfield.ts`
    - Requirement IDs: REQ-13. Implements: Task 24.
    - Status: done (2026-10-23)
26. [TEST] Browser: Hopfield widget (REQ-13)
    - At least 25 cells; click and keyboard flip a cell (`aria-pressed` changes); store, scramble,
      recall restores the stored pattern; the live region announces steps and "stable".
    - Status: done (2026-10-23)
27. [IMPL] Hopfield widget inside the Hopfield card's "go deeper"
    - Requirement IDs: REQ-13. Implements: Task 26.
    - Status: done (2026-10-23)
28. [TEST] Browser: transformer animation (REQ-14)
    - No iframe before the button is pressed; after it, an iframe inside the transformer card loads
      the explainer with status 200.
    - Status: done (2026-10-23)
29. [IMPL] Copy the explainer into `public/explainers/transformer/`, add the embed, and add its
    provenance (source path and copy date) to `README.md` (ADR-003)
    - Requirement IDs: REQ-14. Implements: Task 28.
    - Status: done (2026-10-23)
30. [INT] Phase 4 integration: suites green; screenshots of both visuals.
    - Status: done (2026-10-23)

## Phase 5: Both hosts and the deploy handover (REQ-15, REQ-18)

31. [TEST] Browser suite parameterised over two builds (REQ-15)
    - Root build and `/ai-history-timeline/` build; for each, visit every milestone URL and fail on
      any response with status 400 or above.
    - Status: done (2026-10-23)
32. [IMPL] `build:pages` script and a static server that serves `out/` under the sub-path
    - Requirement IDs: REQ-15. Implements: Task 31.
    - Status: done (2026-10-23)
33. [TEST] Deploy files present and consistent (REQ-18)
    - The Pages workflow builds with `BASE_PATH=/ai-history-timeline`, uploads `out/`, and writes
      `.nojekyll`; `docs/deploy.md` covers repository creation, Vercel, Pages and the comparison.
    - Status: done (2026-10-23)
34. [IMPL] `.github/workflows/pages.yml` and `docs/deploy.md`
    - Requirement IDs: REQ-18. Implements: Task 33.
    - Status: done (2026-10-23)
35. [INT] Final acceptance (prax-app Step 8): both builds green, every REQ demonstrated,
    `prax_check` with no FAIL, changelog and status updated.
    - Status: done (2026-10-23)

## Phase 6: The Hopfield lesson screen (REQ-19, REQ-20, REQ-21)

36. [TEST] Unit: the valley loop (REQ-20)
    - `tests/unit/valley.test.js`: the loop has 50 states; positions 0, 16, 25 and 41 are H, T,
      inverse H and inverse T, each at energy -312; `loopEnergy` equals the model's energy at every
      position; `placeOf` returns the position for every loop state and null for a state off the
      loop; for every way to flip 5 of the 16 neurons where H and T differ (several seeds each),
      recall restores H, the energy never rises, and every intermediate state is on the loop.
    - Status: done (2026-10-23)
37. [IMPL] `src/lib/valley.ts`
    - Requirement IDs: REQ-20. Implements: Task 36.
    - Status: done (2026-10-23)
38. [TEST] Browser: the lesson screen (REQ-19)
    - `tests/e2e/lesson.spec.js`: `/lesson/hopfield/` has one h1 with the milestone title, its own
      title and share tags; the Idea tab shows the milestone's idea text and the other three tabs
      its came-from notes, people and paper title; six steps with the milestone's headings, and
      choosing one shows its body text; the strip has sixteen milestones in seven eras, Hopfield
      marked current and the others linking to `/<slug>/`; links to `/` and `/hopfield/`; the
      Hopfield card links to the lesson; `/lesson/perceptron/` is a 404.
    - Status: done (2026-10-23)
39. [TEST] Browser: the lesson's network and valley (REQ-20)
    - Same file: 25 neuron buttons start as H; clicking one flips its `aria-pressed`; Damage 5 flips
      exactly five; Recall restores H, the readout reaching energy -312, and the readout never
      rises between steps; the ball's position matches the readout's loop position; Show the
      energy hides and shows the track.
    - Status: done (2026-10-23)
40. [TEST] Browser: the lesson for everyone (REQ-21)
    - Same file: keyboard alone reaches and operates a neuron, a tab, a step and Recall with a
      visible focus ring; axe reports no serious or critical issue before and after Recall; at
      375 px no sideways page scroll and the strip scrolls inside itself; with reduced motion,
      Recall finishes at once. `tests/e2e/hosts.spec.js` adds the lesson URL to the crawl on both
      builds (no error response, no console error).
    - Status: done (2026-10-23)
41. [IMPL] Route group: move the site chrome and card pages into `app/(timeline)/` (ADR-004)
    - Requirement IDs: REQ-19. Implements: Task 38 (the lesson renders without the site chrome),
      with every existing test still passing unchanged.
    - Status: done (2026-10-23)
42. [IMPL] The lesson page, its components and `lesson.css`; the link from the Hopfield card
    - Requirement IDs: REQ-19, REQ-20, REQ-21. Implements: Tasks 38, 39, 40.
    - Status: done (2026-10-23)
43. [INT] Phase 6 integration: Vitest, ESLint, Playwright root and `test:hosts` green; new mutation
    probes caught; screenshots of the lesson at 1440 px and 375 px.
    - Status: done (2026-10-23)
