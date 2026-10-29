# ADR-001 — Static export with a configurable base path

- Status: accepted, 2026-10-22
- Requirements: REQ-8, REQ-15, REQ-18

## Context

The brief asks for one source deployed to two free hosts: Vercel (site at the domain root) and
GitHub Pages (site under `/<repo>/` for a project repository). Pages serves static files only.

## Decision

Build with Next.js `output: "export"`, `trailingSlash: true` and `images.unoptimized: true`. The
base path comes from one build variable (`BASE_PATH`, mirrored to `NEXT_PUBLIC_BASE_PATH`); every
non-link asset path goes through one helper, `asset()`.

## Alternatives rejected

- **Vercel with server rendering, Pages as a second build.** Two rendering modes means two sets of
  behaviour to test, and Pages would still need the export.
- **Hash routing (`/#hopfield`).** Works without a base path, but a fragment URL cannot carry its
  own share preview, which REQ-8 needs.
- **A user-site repository (`<user>.github.io`) to avoid the sub-path.** It works, but takes the
  owner's one user-site slot; the owner can still choose it, and the build then uses an empty base
  path.

## Consequences

`next/image` optimisation is off (images are pre-sized by hand). Any new code that writes a
root-relative `src` breaks the Pages build; the Phase 5 browser test over the sub-path build catches
it.
