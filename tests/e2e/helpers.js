// Shared selectors and expectations for the browser tests. Era labels are typed from
// docs/spec.md (REQ-1), never read from the app.
const ERA_LABELS = [
  "1940s–50s",
  "First AI winter",
  "1980s revival",
  "1990s: sequences",
  "Deep learning",
  "Attention and transformers",
  "Scale",
];

const PART_ORDER = ["idea", "came-from", "who", "paper", "deeper"];

const sel = {
  timeline: '[data-testid="timeline"]',
  strip: '[data-testid="timeline-strip"]',
  era: '[data-testid="era"]',
  marker: '[data-testid="marker"]',
  markerFor: (slug) => `[data-testid="marker"][data-slug="${slug}"]`,
  card: '[data-testid="card"]',
  part: (name) => `[data-testid="card"] [data-part="${name}"]`,
};

/** True when the page itself scrolls sideways (REQ-16). */
async function pageOverflows(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

module.exports = { ERA_LABELS, PART_ORDER, sel, pageOverflows };
