# Changelog

## 2026-10-22

- Initialized the project with `/prax-init` (app path) for a `/prax-app` run. Brief copied to
  `docs/brief.md`.
- Planning documents written and gated: spec (18 requirements), five-phase plan, architecture,
  ADR-001 to ADR-003, test-first tasks.
- Phase 1 pilot built: Next.js 16.4 static export with Tailwind and shadcn/ui; era timeline, card
  with the five parts, one URL and share image per milestone; four milestone cards (artificial
  neuron, Hebbian learning, perceptron, Hopfield network). 33 unit tests, 30 browser tests, 20
  mutation probes. Gate held for the owner's review.
- Phase 1 gated after the owner's review. Phase 2: the twelve remaining cards (all sixteen now
  live), 26 more people, a paper link and metadata checker (`scripts/check_links.py`, Crossref and
  arXiv) with its own tests, and `docs/link-check.md` (16 PASS, 2 confirmed by hand, 0 FAIL).
  Content suite now checks every card's year, people and inspirations against the brief.
- Phase 2 gated. Phase 3 started: portrait tests (free licences only, Commons sources, files on
  disk, credits at phone width), `scripts/find_portraits.py`, and `docs/portraits-approval.md`
  with 14 candidates for the owner's approval. Nothing downloaded yet.

## 2026-10-23

- Phase 3 done: the owner approved 12 portraits (Rosenblatt and Sutskever skipped). Downloaded
  as Commons thumbnails, cropped to 320 × 400, credited from the Commons records
  (`scripts/fetch_portraits.py`). The placeholder now matches the photo frame.
- Phase 3 gated complete. Next: Phase 4, the interactive Hopfield network and the transformer
  animation.
- Phase 4 done and gated: an interactive 25-neuron Hopfield network (draw, remember, scramble,
  recall step by step) on the Hopfield card, and the existing transformer animation inside the
  Transformer card, loaded only on request. 14 new tests, 8 new probes.
- Phase 5 done and the project shipped (built, tested, handed over; not deployed): the GitHub
  Pages build is crawled under `/ai-history-timeline/` and the root build at `/` (`pnpm
  test:hosts`); `.github/workflows/pages.yml` and `docs/deploy.md` for the owner. An independent
  Opus review found 0 blockers, 8 should-fix and 12 nice-to-have; 19 were fixed (content:
  Hebb–Lashley, Nowlan's doctorate, evaluative wording, omissions; code: share tags on every
  page, keyboard focus in the Hopfield widget; tests: wider samples and steadier controls), one
  was already known. 60 mutation probes, all caught.
- Portrait credits now say "cropped", as CC BY and CC BY-SA ask when an image is changed.
