---
state: shipped
since: 2026-10-23
priority: medium
health: green
one_liner: Public web timeline of the ideas behind today's LLMs, 1943 to 2022, where each milestone opens a card from plain words to the paper.
phase: Built, tested on both hosts and handed over; waiting for the owner to deploy
roadmap:
  - Owner creates the repository, turns on GitHub Pages and connects Vercel (docs/deploy.md)
  - Compare the two hosts on speed and share previews, then pick one address to share
  - Use the 2024 Nobel Prize in Physics (Hopfield and Hinton) as the hook for the launch post
done_recently:
  - 2026-10-23 · Both hosts tested, deploy steps written, independent review findings fixed
  - 2026-10-23 · Interactive Hopfield network and the transformer animation added to their cards
  - 2026-10-23 · Twelve approved portraits added with photographer and licence credits
  - 2026-10-22 · Found 14 free portrait candidates for 31 people; list ready for approval
  - 2026-10-22 · All sixteen milestone cards written; every paper link and record checked
updated: 2026-10-23
---

# Status

## Current state

`/prax-app` run 202610221749, new application. Planning steps 1 to 7 done and gated. **Phase 1
gated complete 2026-10-22 22:26** after the owner's review. **Phase 2 gated complete
2026-10-22 22:46** (all sixteen cards, sources verified). Phase 3 (portraits, REQ-12) is next; its
first step ends in a candidate list for the owner to approve before anything is downloaded.

### Phase 3 (paused for the owner on 2026-10-22, resumed after approval)

Tasks 20 and 21 done: portrait tests written and run red; the schema now refuses licences that
are not free. `docs/portraits-approval.md` lists 14 candidates (12 recommended, 2 advised against)
and 17 people with no free photo. **Waiting on the owner's approval before any download** (Task
22). Until then one unit test is red by design: "the registry holds at least one portrait", the
floor that stops the portrait checks passing on an empty set.

### Owner decisions (2026-10-22, at the Phase 1 pause)

1. Pilot approved as built: "Pilot passes. Gate Phase 1 and start Phase 2."
2. Reviewer tier for code phases, option (c): in-context review with mutation probes at every
   phase, plus one independent Opus review before Phase 5.
3. Repository name `ai-history-timeline`, as the spec assumed, so the GitHub Pages sub-path is
   `/ai-history-timeline/`.

**Recoverability.** The repository was initialized on 2026-10-22 with no commits; the owner
commits on request (workspace git policy). Until then, every key document is snapshotted to
`archive/pre-review-<timestamp>/` before a review edits it, and replaced files are moved to
`archive/`, never deleted.

## Phase 1

### Phase 1 — definition of done (checked 2026-10-22 18:18)

| Item | Result | Evidence |
|---|---|---|
| All Phase 1 test tasks written and passing | pass | Vitest 33/33; Playwright 30/30 against `out/` (Chrome 156) |
| All impl tasks complete; export has the home URL and the four milestone URLs | pass | `out/index.html`, `out/{artificial-neuron,hebbian-learning,perceptron,hopfield}/index.html`, `out/og/*.png` |
| Code reviewed | pass | `sessions/review-report-202610221818.md` (20 mutation probes, all caught after one test fix) |
| Architecture integrity preserved | pass | three documented changes, re-gated in the same report |
| Status updated; requirement IDs marked with proof | pass | this file |
| Owner review of the pilot | pass (2026-10-22 22:26) | owner decisions above |

### Requirement proof (Phase 1)

| ID | Proof | State |
|---|---|---|
| REQ-1 | `tests/e2e/timeline.spec.js` (7 eras in order, chronological markers, era containment); `tests/unit/content.test.js` (era map from the spec) | proven for the code; re-checked on full content in Phase 2 |
| REQ-2 | `tests/e2e/card.spec.js` (click, Enter, Space, one card, `aria-current`, reduced motion, scroll only when needed) | proven |
| REQ-3 | `tests/unit/schema.test.js` (50 words, 2 sentences); `tests/e2e/card.spec.js` | proven |
| REQ-4 | `tests/unit/validate.test.js` (resolve, earlier only, first may be empty); `tests/e2e/card.spec.js` (links vs plain text) | proven |
| REQ-5 | `tests/unit/schema.test.js` (note ≤ 40 words); `tests/e2e/card.spec.js` (name, note, initials placeholder) | proven with placeholders; portraits are REQ-12 |
| REQ-6 | `tests/unit/schema.test.js` (venue or publisher, URL, 2–4 sentence summary, 1–2 papers); `tests/e2e/card.spec.js` | proven |
| REQ-7 | `tests/unit/schema.test.js` (3–8 steps); `tests/e2e/card.spec.js` (closed by default, click and keyboard) | proven |
| REQ-8 | `tests/e2e/urls.spec.js` (direct load, home, address, Back, title and share tags, image 200 as `image/png`) | proven; share URLs use localhost until Phase 5 sets the site address |
| REQ-9 | `tests/unit/schema.test.js`, `tests/unit/validate.test.js`, `tests/unit/content.test.js` | proven |
| REQ-16 | `tests/e2e/phone.spec.js` (no sideways page scroll with a planted-overflow control, strip scrolls, active marker in view, body text ≥ 16 px) | proven except the credits clause (Phase 3) |
| REQ-17 | `tests/e2e/a11y.spec.js` (axe on two pages with go deeper closed and open, with a planted-failure control; focus indicator; one h1) | proven |

REQ-10 to REQ-15 and REQ-18 belong to later phases (`docs/plan.md`): REQ-10, REQ-11 (Phase 2),
REQ-12 (Phase 3), REQ-13, REQ-14 (Phase 4), REQ-15, REQ-18 (Phase 5).

### Decisions made during Phase 1

- Share images are a `.png` route, not the `opengraph-image` file convention (no file extension in
  the export). Recorded in `docs/architecture.md`.
- `cacheComponents` and `partialPrefetching` are off (they keep hidden copies of previous pages).
- People registry is a list (duplicate ids must be detectable).
- Browser tests use the installed Google Chrome (`channel: "chrome"`, version 156) instead of
  downloading Playwright's own build.

## Phase 2

### Phase 2 — definition of done (checked 2026-10-22 22:46)

| Item | Result | Evidence |
|---|---|---|
| All Phase 2 test tasks written and passing | pass | Vitest 51/51 (content suite covers sixteen files against the brief); link-checker tests 11/11; Playwright 30/30 on the sixteen-card export |
| Sixteen files pass validation; every era holds its milestones | pass | `tests/unit/content.test.js` (exact slug set, years, people, inspirations, era map, seven eras filled) |
| Link check run; every paper resolved or confirmed by hand, none failing | pass | `docs/link-check.md`: 16 PASS, 2 MANUAL confirmed by hand, 0 FAIL |
| Content reviewed for accuracy and plain language | pass | `sessions/review-report-202610222246.md` (29 mutation probes caught; what is and is not verified listed) |
| Architecture integrity preserved | pass | no design change; the checker follows the plan's Task 17 |
| Status updated; REQ-10 and REQ-11 marked complete | pass | this file |

### Requirement proof (Phase 2)

| ID | Proof | State |
|---|---|---|
| REQ-10 | `tests/unit/content.test.js` "v1 content is complete and matches the brief" (16 cards; year, people, inspirations, author note per row) | proven |
| REQ-11 | `scripts/check_links.py` with `tests/unit/test_check_links.py`; last run in `docs/link-check.md` (2026-10-22 22:40) | proven |
| REQ-1 | re-checked on full content: seven eras all filled, chronological, bonus flagged | proven on full content |

Not verified against a primary source: biographical notes and historical context (listed in the
review report); to be fact-checked by the independent review before Phase 5.

## Phase 3

Gated complete 2026-10-23 08:02. The owner approved 12 portraits on 2026-10-22 (Rosenblatt and
Sutskever skipped, see `docs/portraits-approval.md`).

### Phase 3 — definition of done (checked 2026-10-23 08:02)

| Item | Result | Evidence |
|---|---|---|
| All Phase 3 test tasks written and passing | pass | Vitest 57/57 (portrait rules and files, floor green); Playwright 31/31 incl. `tests/e2e/portraits.spec.js` |
| All impl tasks complete; owner approved the download list | pass | `docs/portraits-approval.md` (decision and result); 12 files in `public/images/people/` |
| Code reviewed; architecture integrity preserved | pass | `sessions/review-report-202610230700.md` (P1 to P7 probes caught); no design change |
| Status updated; REQ-12 marked complete | pass | this file |

### Requirement proof (Phase 3)

| ID | Proof | State |
|---|---|---|
| REQ-12 | `tests/unit/portraits.test.js` (free licences only, Commons sources, real small files, at least one portrait); `tests/e2e/portraits.spec.js` (every portrait loads, alt names the person, credit with licence and source links, placeholder otherwise) | proven |
| REQ-16 | credits clause: `tests/e2e/portraits.spec.js` (credit text at least 12 px at 375 px, no sideways scroll) | proven in full |

## Phase 4

Gated complete 2026-10-23 08:49.

### Phase 4 — definition of done (checked 2026-10-23 08:49)

| Item | Result | Evidence |
|---|---|---|
| All Phase 4 test tasks written and passing | pass | Vitest 65/65 (`tests/unit/hopfield.test.js`, 8 tests); Playwright 37/37 (`tests/e2e/visuals.spec.js`, 6 tests) |
| All impl tasks complete; the explainer source project untouched | pass | copy is byte-identical (SHA-256 in `README.md`); nothing written under `Test/transformer-explainer/` |
| Code reviewed; architecture integrity preserved | pass | `sessions/review-report-202610230849.md` (8 probes caught); matches architecture and ADR-003 |
| Status updated; REQ-13 and REQ-14 marked complete | pass | this file |

### Requirement proof (Phase 4)

| ID | Proof | State |
|---|---|---|
| REQ-13 | `tests/unit/hopfield.test.js` (weights, updates, energy, exact recall for 1 to 12 flips over 40 seeds); `tests/e2e/visuals.spec.js` (25 neurons, click and keyboard, store, scramble, recall restores the pattern, announced steps, axe clean) | proven |
| REQ-14 | `tests/e2e/visuals.spec.js` (no iframe or request before the button; iframe inside the card loads with 200 and draws its canvas; no other card has it) | proven |

## Phase 5 and final acceptance

Gated complete 2026-10-23 09:24. Owner option (c): the independent Opus review ran before this
gate (`sessions/review-report-202610230908-independent.md`: 0 blockers, 8 should-fix, 12
nice-to-have); every finding was verified and acted on except F-18, which was already known
(`sessions/review-report-202610230923.md`).

### Phase 5 — definition of done (checked 2026-10-23 09:24)

| Item | Result | Evidence |
|---|---|---|
| All Phase 5 test tasks passing against both builds (no error response on any page) | pass | `pnpm test:hosts`: Pages 2/2, root 2/2 (`reports/final-acceptance-202610230914.log`) |
| All impl tasks complete | pass | `.github/workflows/pages.yml`, `docs/deploy.md`, `scripts/serve-subpath.js`, `build:pages`, `test:hosts` |
| Code reviewed; architecture integrity preserved | pass | independent review plus `sessions/review-report-202610230923.md`; `docs/architecture.md` corrected and re-gated there |
| Status updated; REQ-15 and REQ-18 marked complete | pass | this file |

### Requirement proof (Phase 5)

| ID | Proof | State |
|---|---|---|
| REQ-15 | `tests/e2e/hosts.spec.js` on both builds: 16 cards, links, share tags, icon, portraits, client navigation by click and Space, the animation, 404 page; no error response, network error or console error | proven locally; not yet on a live host |
| REQ-18 | `tests/unit/deploy.test.js` (workflow structure and order, `docs/deploy.md` sections) | proven; the workflow has not yet run on GitHub |

### Final acceptance (prax-app Step 8)

- Every requirement REQ-1 to REQ-18 has its proof in this file.
- Last full run, 2026-10-23: Vitest 70/70, Python 12/12, ESLint clean, Playwright root 46/46,
  `test:hosts` 2/2 and 2/2, mutation probes 60 of 60 CAUGHT.
- `prax_check`: run at this boundary (result in the run ledger row below).
- Shipped means built, tested and handed over. **Deploying is the owner's step** (`docs/deploy.md`);
  nothing has been pushed or deployed.

## Known issues

- Three of the independent reviewer's probes have no standing probe yet: an attribute-only
  hydration mismatch, the Space key on a root build, and a skipped heading level (moderate in axe).
- The GitHub Pages workflow and Vercel have not run for real; first deploy may surface host issues.

## prax-check warnings acknowledged

- `naming: archive/` — `archive/og-file-convention/` and `archive/scaffold-defaults/` hold files
  moved aside during the build (the replaced share-image routes and the scaffold's unused
  images), not timestamped snapshots of live files; their paths are cited in
  `docs/architecture.md`, so they keep their names. Snapshots use `archive/pre-review-<timestamp>/`.

## Blockers

None.

## Run ledger
| run | step | done at | gate | evidence |
|-----|------|---------|------|----------|
| 202610221749 | S1 project readiness | 202610221750 | n/a | docs/brief.md |
| 202610221749 | S2-S3 spec with requirement IDs | 202610221751 | pass (tier 3, 1 cycle, 4 fixes) | sessions/review-report-202610221751.md |
| 202610221749 | S4 phased plan | 202610221752 | pass (tier 3, 1 cycle, 1 fix) | sessions/review-report-202610221752.md |
| 202610221749 | S5 architecture and ADR-001 to ADR-003 | 202610221754 | pass (tier 3, 1 cycle, 3 fixes) | sessions/review-report-202610221754.md |
| 202610221749 | S6 test-first tasks | 202610221755 | pass (tier 3, 1 cycle, 4 fixes) | sessions/review-report-202610221755.md |
| 202610221749 | S7 cross-document coherence | 202610221756 | pass (1 fix, architecture re-gated) | sessions/review-report-202610221756.md |
| 202610221749 | S7 Phase 1 built and reviewed | 202610221818 | pass (20 probes, 1 test corrected) | sessions/review-report-202610221818.md |
| 202610221749 | Phase 1 gate | 202610221818 | held: owner review pending | docs/status.md#phase-1 |
| 202610221749 | Phase 1 gate | 202610222226 | pass (owner review; 6 of 6 items) | docs/status.md#phase-1 |
| 202610221749 | S7 Phase 2 built and reviewed | 202610222246 | pass (29 probes, 1 test and 1 probe corrected) | sessions/review-report-202610222246.md |
| 202610221749 | Phase 2 gate | 202610222246 | pass (6 of 6 items) | docs/status.md#phase-2 |
| 202610221749 | Phase 3 tasks 20-21 tests and candidate list | 202610222329 | paused: owner approval of portraits | docs/portraits-approval.md |
| 202610221749 | S7 Phase 3 built and reviewed | 202610230700 | pass (7 probes, 2 crop fixes, 1 layout revert) | sessions/review-report-202610230700.md |
| 202610221749 | Phase 3 gate | 202610230802 | pass (4 of 4 items) | docs/status.md#phase-3 |
| 202610221749 | S7 Phase 4 built and reviewed | 202610230849 | pass (8 probes, 1 layout fix, 1 test corrected) | sessions/review-report-202610230849.md |
| 202610221749 | Phase 4 gate | 202610230849 | pass (4 of 4 items) | docs/status.md#phase-4 |
| 202610221749 | S7 Phase 5 built, independent review, fixes | 202610230923 | pass (60 of 60 probes; 19 of 20 review findings fixed, 1 known) | sessions/review-report-202610230923.md |
| 202610221749 | Phase 5 gate and final acceptance | 202610230924 | pass (4 of 4 items; every REQ proven) | docs/status.md#phase-5-and-final-acceptance |
