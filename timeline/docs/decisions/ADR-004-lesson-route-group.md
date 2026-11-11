# ADR-004 — Give the lesson screen its own layout with a route group

- Status: accepted, 2026-10-23
- Requirements: REQ-19, REQ-21

## Context

The root layout (`app/layout.tsx`) draws the site header, the timeline strip and the footer around
every page. The lesson screen of REQ-19 is a full-screen layout of its own (its strip, its panel,
its dark design), so it must not sit inside that chrome. Every existing URL must stay as it is.

## Decision

Keep only the document shell in `app/layout.tsx` (html, body, fonts, site metadata). Move the
header, timeline, main, footer and skip link into `app/(timeline)/layout.tsx`, and move the pages
that use them into the same group: `(timeline)/page.tsx`, `(timeline)/[slug]/page.tsx` and
`(timeline)/template.tsx`. Route groups are left out of the URL, so `/` and `/<slug>/` do not
change. The lesson lives outside the group at `app/lesson/[slug]/page.tsx` and draws its own
layout. `generateStaticParams` there returns only `hopfield`, with `dynamicParams = false`.

## Alternatives rejected

- **Hide the chrome on lesson URLs from inside the root layout** (a client wrapper that reads the
  segment and returns nothing). Works, but every page would carry the check, the header markup
  would still be in the lesson's HTML until hydration, and the rule would be hidden in a component
  instead of the folder structure.
- **A second root layout** (two route groups each with its own `<html>`). A full page load between
  the two groups and two copies of the document shell, for no gain.
- **Put the lesson inside the card page.** The card is a scrolling article; the lesson is a fixed
  screen. One page cannot be both.

## Consequences

`app/not-found.tsx` stays at the root, so the 404 page now shows without the header and the
timeline; it already carries its own link back to the start, and the host test checks its heading.
The skip link moves with the header into the group layout; the lesson has its own.
