# Architecture — AI History Timeline (v1)

Upstream: `docs/spec.md`. Decisions with alternatives are in `docs/decisions/`.

## Shape

A Next.js 16.4 App Router site built with `output: "export"`: every URL is an HTML file written at
build time, and the browser needs no server. Content is read from JSON files during the build only.

```text
content/
  milestones/NN-<slug>.json     one file per milestone (REQ-9)
  people.json                   people registry: name, portrait file, credit (REQ-5, REQ-12)
public/
  images/people/<person>.jpg    portraits (Phase 3)
  explainers/transformer/       copied transformer explainer (Phase 4, ADR-003)
src/
  app/
    layout.tsx                  html shell, fonts, site metadata
    (timeline)/layout.tsx       site header, the Timeline (persists across pages), footer (ADR-004)
    (timeline)/page.tsx         "/"  → card of the first milestone
    (timeline)/[slug]/page.tsx  "/<slug>/" → card of that milestone; generateStaticParams
    (timeline)/template.tsx     re-mounts the card on each navigation so Motion can animate it
    lesson/[slug]/page.tsx      "/lesson/hopfield/" → the lesson screen (Phase 6, see below)
    og/[file]/route.tsx         share images /og/<slug>.png, written at build time (see below)
  components/
    timeline.tsx                client: eras, markers (next/link), active state, sideways scroll
    milestone-card.tsx          server: the five parts in order
    deeper.tsx                  client: shadcn Collapsible holding part 5 (closed by default)
    person.tsx                  portrait or initials placeholder, credit line
    hopfield-widget.tsx         client: the interactive Hopfield network (REQ-13)
    transformer-embed.tsx       client: the explainer iframe, loaded on request (REQ-14)
    ui/…                        shadcn/ui generated components
  lib/
    schema.ts                   zod schemas for a milestone file and the people registry
    validate.ts                 pure cross-file checks (slugs, inspirations, order, people)
    content.ts                  reads content/ with fs, runs schema + validate, throws on error
    paths.ts                    asset(path): prefixes the base path for images and iframes
    hopfield.ts                 Phase 4 pure model
tests/
  unit/*.test.js                Vitest: schema, cross-file validation, content suite, Hopfield model
  e2e/*.spec.js                 Playwright against the built out/ folder, plus axe scans
scripts/
  check_links.py                Phase 2: paper link and metadata check (REQ-11)
```

Tests are `.js` on purpose: the workspace compliance checker scans `.js` (not `.ts`) for
requirement IDs, and every test carries a `// REQ-n` comment naming what it proves.

## Content model (REQ-9)

A milestone file:

| Field | Type and rule |
|---|---|
| `slug` | lower-case, hyphenated, unique; equals the URL segment |
| `order` | integer used for sorting (chronological; ties broken by this) |
| `year` | integer, the year shown first (for "2018–2020" the 2018) |
| `yearLabel` | string shown on the marker, e.g. `"2018–2020"` |
| `era` | one of the seven era ids of REQ-1 |
| `bonus` | boolean, default false |
| `shortTitle` | ≤ 40 characters (marker) |
| `title` | full title (card heading) |
| `idea` | part 1: ≤ 50 words, at most 2 sentences |
| `cameFrom` | part 2: list of `{ "milestone": slug, "note" }` or `{ "label", "note" }` |
| `people` | part 3: list of `{ "person": id, "note" (≤ 40 words) }`; `moreAuthors` boolean |
| `papers` | part 4: 1–2 of `{ title, authors[], year, venue or publisher, url, summary }`; summary 2–4 sentences |
| `deeper` | part 5: 3–8 steps, each `{ "heading", "body" }`; optional `visual` id |

`people.json` is a list of `{ id, name, portrait?: { file, author, licence, licenceUrl,
sourceUrl } }`. A list rather than an id-keyed object, because `JSON.parse` silently keeps the last
of two equal keys, so a duplicate id could never be reported. A person without `portrait` gets the
initials placeholder.

`validate.ts` rejects: duplicate slugs or person ids; a `cameFrom.milestone` that does not exist or
whose `order` is not lower than the citing milestone's; a `people.person` not in the registry; a
portrait file that does not exist under `public/`; a milestone other than the first with an empty
`cameFrom`. Every error names the file and the field. `content.ts` throws, so `next build` fails.

## Routing, navigation and state (REQ-2, REQ-8)

- `generateStaticParams` returns every slug; `dynamicParams = false`.
- Markers are `next/link` elements to `/<slug>/` with `scroll={false}`; Next's client navigation
  keeps the layout (and the Timeline's scroll position) mounted and pushes a history entry, so
  Back works. Links react to Enter but not to Space, so each marker adds a Space key handler that
  navigates the same way (REQ-2).
- The Timeline reads the active slug with `useSelectedLayoutSegment()`; on `/` the active slug is
  the first milestone. The active marker gets `aria-current="true"` and is scrolled into the strip's
  view.
- `template.tsx` wraps the page in a Motion element keyed by path. A small client effect scrolls the
  card into view only when its top is outside the viewport. It reads `useReducedMotion()` and skips
  the entrance animation (and smooth scrolling) when the reader asks for reduced motion; the first
  page load never animates, so the static HTML shows the card at once.

## Share previews (REQ-8)

`generateMetadata` gives each page its title, description (the plain-words idea), Open Graph and
Twitter tags. `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`. Share images are generated at build
time with `next/og` by a static route handler, `app/og/[file]/route.tsx`, which writes
`/og/<slug>.png` per milestone and `/og/site.png` for the home page; `lib/og.tsx` holds the design
and the metadata entry. (Built 2026-10-22: the `opengraph-image.tsx` file convention exported the
images without a file extension, so a static server sent no image content type. The `.png` route
fixes that; the first attempt is kept in `archive/og-file-convention/`.)

## Next.js settings that differ from the scaffold

`create-next-app` 16.4 turns on `cacheComponents` and `partialPrefetching`. Both are off here: with
`cacheComponents`, client navigation keeps the previous page mounted but hidden (React
`<Activity>`), which this site does not need and which would put two cards in the DOM after a
navigation (REQ-2 asks for exactly one).

## Base path (REQ-15, ADR-001)

- `next.config.ts` reads `BASE_PATH` (empty for Vercel, `/ai-history-timeline` for Pages) into
  `basePath`, with `trailingSlash: true` and `images.unoptimized: true`, and copies the same value
  into `env.NEXT_PUBLIC_BASE_PATH`, so there is one setting.
- `next/link` adds the base path itself. Plain `src` strings do not: every image and iframe source
  goes through `asset()` in `lib/paths.ts`, which reads `NEXT_PUBLIC_BASE_PATH`. No component writes a root-relative path by hand. This rule is in force
  from Phase 1, so Phase 5 only adds the sub-path build and its tests.

## Styling and accessibility (REQ-16, REQ-17)

- Tailwind v4 with shadcn/ui (Collapsible, Button, Badge, Separator). Lucide icons. Fonts through
  `next/font` (self-hosted at build). Light theme only (dark mode is out of scope).
- The timeline strip is `overflow-x: auto` inside a page that never scrolls sideways. No
  `overflow-x: hidden` or `clip` on `html` or `body`: that would hide an overflowing element instead
  of fixing it, and the 375 px test (document width equals viewport width) could then never fail.
- Native elements first (links, buttons, `<details>`-equivalent Collapsible with correct ARIA),
  visible focus ring from Tailwind's `focus-visible` utilities.

## Interactive visuals (REQ-13, REQ-14)

- `lib/hopfield.ts`: Hebbian weights from stored ±1 patterns (zero diagonal), asynchronous updates
  in a fixed or seeded order, `recall` runs until a full sweep changes nothing. Pure and unit tested.
  The widget is a grid of `<button aria-pressed>` cells, rendered in plain SVG-styled HTML; no D3
  needed for a grid. A live region announces "step n, k neurons changed" and "stable".
- Transformer: `public/explainers/transformer/index.html` is a copy of
  `Test/transformer-explainer/index.html` (a 632 KB single file with no outside references). The
  card shows a button; clicking it inserts an `<iframe>` whose `src` goes through `asset()`.

## Lesson screen (Phase 6: REQ-19, REQ-20, REQ-21, ADR-004)

```text
src/app/
  layout.tsx                    document shell only: html, body, fonts, site metadata
  (timeline)/layout.tsx         skip link, header, Timeline, main, footer (moved here, ADR-004)
  (timeline)/page.tsx           "/"            (moved, URL unchanged)
  (timeline)/[slug]/page.tsx    "/<slug>/"     (moved, URL unchanged)
  (timeline)/template.tsx       the card's entrance animation (moved)
  lesson/[slug]/page.tsx        "/lesson/hopfield/": server page; reads the milestone, renders Lesson
  lesson/lesson.css             the lesson's design tokens and layout, scoped under .lesson
src/components/lesson/
  lesson.tsx                    server: the screen's frame (rail, header, strip) and grid areas
  lesson-stage.tsx              client: network, track, toolbar, and the steps list with its
                                readout (one state object; renders two grid areas, stage and steps)
  lesson-tabs.tsx               client: the four text tabs (the panel's upper grid area)
src/lib/valley.ts               pure: the 50-state loop, its energies, a state's place on it
src/lib/lessons.ts              the one list of milestones with a lesson (route params, card link)
```

- **Model.** The stage uses `lib/hopfield.ts` (`train`, `energy`, `updateNeuron`, `rng`) with H and
  T stored, and `lib/valley.ts` for the track: `loopState(t)` (the state at loop position t),
  `loopEnergy(t)`, `placeOf(state)` (the loop position, or null off the loop). Recall is driven one
  neuron at a time from the stage with a timer, so each step can be shown; the order is a seeded
  shuffle per sweep, as in `recall`.
- **Content.** Tabs and steps read the Hopfield milestone through `getMilestone`, so the lesson and
  the card cannot disagree. The strip reads `getContent().milestones` and links every other
  milestone to `/<slug>/` with `next/link`.
- **Design.** Plain CSS in `lesson.css` under a `.lesson` root, from the settled mock-up's tokens:
  graphite `#23252b`, signal blue `#5f9dff`, the soft glow as two `drop-shadow` filters on lit
  parts only. Mono labels from `next/font` (JetBrains Mono), body in Geist. The card pages' theme
  is untouched.
- **Layout.** Wide screens: a grid of rail, stage and a 500 px panel over a strip, filling the
  viewport. Below 900 px the areas stack and the page scrolls; the strip scrolls sideways inside
  itself.
- **Accessibility.** Neurons are `<button aria-pressed>`; the step text sits in an `aria-live`
  region; tabs use the ARIA tab pattern; reduced motion makes recall instant.

## Testing (all phases)

| Layer | Tool | What it proves |
|---|---|---|
| Unit | Vitest | schema and cross-file rules on fixtures (each rule has a failing fixture); the real `content/` folder passes; Hopfield model |
| Browser | Playwright (installed Chrome) over `out/` served statically; project `root` runs every spec, project `pages` runs the host crawl under `/ai-history-timeline/` (`scripts/serve-subpath.js`) | timeline, card, URLs, Back, share tags, 375 px layout, visuals, portraits, both hosts, no 4xx or console errors |
| Accessibility | `@axe-core/playwright` | no serious or critical findings on `/`, a milestone page and the open Hopfield widget; focus indicators; skip link |
| Probes | `scripts/run_probes.py` | each planted defect turns a named test red |
| Links | `scripts/check_links.py` | REQ-11, run on demand, results in `docs/link-check.md` |

Browser tests run against the **exported** files, not the dev server, because the export is what
ships.

## Hosting (REQ-18)

- Vercel: framework preset Next.js, no `BASE_PATH`; Vercel serves `out/` from a static export.
- GitHub Pages: `.github/workflows/pages.yml` builds with the base path and site address that
  `actions/configure-pages` reports (`/ai-history-timeline` for this repository) and publishes
  `out/` with the official Pages actions; `out/.nojekyll` keeps the `_next/` folder.
- A CI build with no site address fails (`next.config.ts`), so share tags never point at localhost.
- `pnpm test:hosts` builds the Pages variant into `out/`, crawls it under the sub-path, then
  rebuilds and crawls the root variant (Next's `distDir` is not used for a second output folder:
  Next owns and clears it).
