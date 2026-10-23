# ADR-003 — Embed the existing transformer explainer as a copied file in an iframe

- Status: accepted, 2026-10-22
- Requirements: REQ-14

## Context

The brief suggests reusing the existing explainer animation as the deepest layer of the
transformer card. It lives in the workspace at `Test/transformer-explainer/`; its build bundles
Three.js into one self-contained `index.html` (632 KB, no outside references, checked
2026-10-22).

## Decision

Copy that `index.html` into `public/explainers/transformer/` and load it in an `<iframe>` only
after the reader clicks "play the animation". The source project is never edited from here.

## Alternatives rejected

- **Port the scene into React Three Fiber.** Large rewrite for no reader-visible gain in v1.
- **Link out to a separately hosted copy.** Breaks the "plays inside the card" criterion and adds
  a third deployment.
- **Load the iframe with the page.** 632 KB and a WebGL context on every visit to the card.

## Consequences

The copy can drift from its source. `README.md` records where it came from and the date; to update,
rebuild the source project and copy the file again.
