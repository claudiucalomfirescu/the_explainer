# Plan — AI History Timeline (v1)

Upstream: `docs/spec.md`. Five phases, each a vertical slice that ends in a site you can open.
Phase 1 is a **pilot**: the whole app on four milestones, so layout, tone and card depth are judged
before the other twelve cards are written. The run pauses for the owner's review after Phase 1.

## Phase 1: Pilot — the app end to end on four milestones (REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-9, REQ-16, REQ-17)

### Objectives

- Scaffold Next.js 16.4 + Tailwind + shadcn/ui as a static export.
- Content schema, loader and build-time validation (REQ-9), including the people registry.
- Timeline with all seven eras, markers, highlighting and phone-width scrolling (REQ-1, REQ-16).
- Card with the five parts and the collapsed "go deeper" layer (REQ-3 to REQ-7). Portraits are the
  initials placeholder in this phase; real images arrive in Phase 3.
- One static page per milestone with its own title, description and share preview (REQ-8).
- Pilot content: milestones 1 (artificial neuron), 2 (Hebbian learning), 3 (perceptron) and
  5 (Hopfield network). The set is closed under "inspired by", so validation passes, and it spans
  two eras.

### Definition of done

- [ ] All Phase 1 test tasks written and passing (unit + browser + accessibility scan)
- [ ] All Phase 1 impl tasks complete; `pnpm build` produces `out/` with a page for the home URL and
      for each of the four milestone URLs
- [ ] Code reviewed (`/prax-review` on the changed code and tests; report in `sessions/`)
- [ ] Architecture integrity preserved (matches `docs/architecture.md` and the ADRs)
- [ ] Status updated; Phase 1 requirement IDs marked complete with their proof
- [ ] Owner review of the pilot collected before Phase 2 starts

REQ-1 is proven here for the code (eras, order, grouping) and re-checked against the full content
in Phase 2. REQ-5 is proven with the placeholder; portraits are REQ-12 in Phase 3.

## Phase 2: All sixteen cards with verified sources (REQ-10, REQ-11)

### Objectives

- Write the remaining twelve milestone files (4, 6 to 15, bonus) to the pilot's standard.
- A link and metadata checker (`scripts/check_links.py`) for every paper; results in
  `docs/link-check.md`. Record any correction to the brief's table as an ADR with its source.

### Definition of done

- [ ] All Phase 2 test tasks written and passing (the content suite now covers sixteen files)
- [ ] All sixteen files pass validation; every era of REQ-1 holds its milestones
- [ ] Link check run; every paper resolved or manually confirmed, none failing
- [ ] Content reviewed for accuracy and plain language (`/prax-review`; report in `sessions/`)
- [ ] Architecture integrity preserved
- [ ] Status updated; REQ-10 and REQ-11 marked complete

## Phase 3: Portraits with credits (REQ-12)

### Objectives

- Find a freely licensed portrait for each person on Wikimedia Commons, read its licence and author
  from the Commons API, and present the list to the owner before downloading.
- Store the files under `public/images/people/`; credits in the people registry; placeholder kept
  for anyone without a free image.

### Definition of done

- [ ] All Phase 3 test tasks written and passing (every referenced image exists; every portrait has
      author, licence, licence link and source link; alt text present)
- [ ] All impl tasks complete; the owner approved the download list
- [ ] Code reviewed; architecture integrity preserved
- [ ] Status updated; REQ-12 marked complete

## Phase 4: Interactive visuals (REQ-13, REQ-14)

### Objectives

- Hopfield network: a pure, unit-tested model (store, update, recall) and an interactive grid in
  the Hopfield card's "go deeper" part.
- Transformer: the existing explainer copied into `public/`, loaded on request inside the
  transformer card.

### Definition of done

- [ ] All Phase 4 test tasks written and passing (model unit tests, browser tests for both visuals)
- [ ] All impl tasks complete; the explainer source project is untouched
- [ ] Code reviewed; architecture integrity preserved
- [ ] Status updated; REQ-13 and REQ-14 marked complete

## Phase 5: Both hosts and the deploy handover (REQ-15, REQ-18)

### Objectives

- Build for the domain root and for the `/ai-history-timeline/` sub-path; browser tests run
  against both builds.
- GitHub Actions workflow for Pages, Vercel settings, and `docs/deploy.md` for the owner.

### Definition of done

- [ ] All Phase 5 test tasks written and passing against both builds (no 404 on any page)
- [ ] All impl tasks complete
- [ ] Code reviewed; architecture integrity preserved
- [ ] Status updated; REQ-15 and REQ-18 marked complete

## Final acceptance (prax-app Step 8)

Full browser suite on both builds, every acceptance criterion demonstrated, `prax_check` with no
FAIL, changelog and status updated. Deploying is the owner's step (`docs/deploy.md`).
