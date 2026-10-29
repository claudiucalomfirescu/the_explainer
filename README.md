# AI History Timeline

A small public web app that tells the story of the ideas that led to today's large language
models, from the artificial neuron of 1943 to ChatGPT in 2022. Every milestone opens a card that
starts in plain words and lets the reader drill down to the mechanics and the original paper.

**State:** see `docs/status.md` (frontmatter header).

## Scope (v1)

- 15 milestones plus a bonus mixture-of-experts card, grouped into seven eras on a horizontal
  timeline.
- One shareable URL per milestone (for example `/hopfield/`).
- Static site: no server. Targets Vercel and GitHub Pages.

v1.1 adds one lesson screen, `/lesson/hopfield/`: the Hopfield network and its energy valley on a
single dark screen, with the card's text in tabs and every milestone in a strip
(`docs/concept-lesson-layout.md`, ADR-004).

The project brief is `docs/brief.md` (copied from the starter kit, 2026-10-22). To publish the
site, follow `docs/deploy.md`.

## Key folders

| Folder | What it holds |
|---|---|
| `content/milestones/` | One JSON file per milestone: the content, kept apart from the code |
| `public/images/people/` | Portraits, one file per person; credits in `content/people.json` |
| `public/explainers/transformer/` | The copied transformer animation (see "Copied material") |
| `.github/workflows/` | The GitHub Pages workflow |
| `src/` | The Next.js app (App Router, static export) |
| `tests/` | Content tests (Vitest) and browser tests (Playwright) |
| `scripts/` | One-off checks, for example the paper-link checker |
| `docs/` | Spec, plan, architecture, tasks, status, ADRs |

## How it runs

```bash
pnpm install
pnpm dev          # local development on http://localhost:3000
pnpm build        # static export into out/
pnpm test         # unit and content tests (Vitest)
pnpm test:e2e     # browser tests against out/ (run pnpm build first); uses the installed Google Chrome
pnpm test:hosts   # builds and crawls the GitHub Pages variant, then the root variant
pnpm build:pages  # the GitHub Pages variant (base path /ai-history-timeline)
pnpm test:py      # link-checker tests (Python, no network)
pnpm check:links  # live paper link and metadata check; rewrites docs/link-check.md
python3 -I scripts/find_portraits.py      # free portrait candidates from Wikidata/Commons (no download)
python3 -E scripts/fetch_portraits.py fetch|build reports/portraits-raw-<ts>   # approved portraits only (needs Pillow)
python3 -I scripts/run_probes.py "$PWD"   # mutation probes: each planted defect must turn a test red
```

## Copied material

- `public/explainers/transformer/index.html` is a byte-for-byte copy of
  `Test/transformer-explainer/index.html` in the AI_Projects workspace, copied 2026-10-23
  (SHA-256 `a43456b6c32383be37e5042e33279d3335ddac574fc47527f49169a98a559c38`). Never edit it
  here: rebuild the source project and copy the file again (ADR-003).

`NEXT_PUBLIC_SITE_URL` sets the absolute address used in share previews (default
`http://localhost:4173`); set it per host when deploying (Phase 5).
