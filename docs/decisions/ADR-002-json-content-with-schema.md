# ADR-002 — Milestone content as JSON validated by a schema

- Status: accepted, 2026-10-22
- Requirements: REQ-3 to REQ-7, REQ-9, REQ-10

## Context

The brief allows Markdown/MDX or JSON, one file per milestone, kept apart from the code. Every card
has the same five parts with length limits, and the "where it came from" links form a graph that
must stay consistent as milestones are added.

## Decision

One JSON file per milestone, plus a `people.json` registry, validated at build time with zod and a
pure cross-file check (`validate.ts`). The build fails on any violation.

## Alternatives rejected

- **MDX per milestone.** Better for long prose with embedded components, but the five-part
  structure and the limits would live in conventions rather than a schema, and cross-file checks
  would need a front-matter parser anyway.
- **People inside each milestone file.** Geoffrey Hinton appears on four cards; his portrait credit
  would be repeated four times and could drift.

## Consequences

Prose in JSON needs escaped quotes and no line breaks; body text is short by design, so this is
acceptable. Paragraphs inside a "go deeper" step use a blank-line convention the card renders.
