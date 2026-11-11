// Task 6 — the real content/ folder. REQ-9: every file passes the schema and the cross-file
// checks. REQ-1: each milestone sits in the era that the spec's REQ-1 table gives it. The expected
// map below is typed from docs/spec.md (REQ-1 table), never derived from the content files.
import { describe, expect, test } from "vitest";
import { loadContent } from "@/lib/content";

const EXPECTED_ERA = {
  "artificial-neuron": "1940s-50s",
  "hebbian-learning": "1940s-50s",
  perceptron: "1940s-50s",
  "perceptrons-critique": "first-ai-winter",
  hopfield: "1980s-revival",
  "boltzmann-machine": "1980s-revival",
  backpropagation: "1980s-revival",
  "mixture-of-experts": "1990s-sequences",
  lstm: "1990s-sequences",
  "deep-belief-networks": "deep-learning",
  alexnet: "deep-learning",
  word2vec: "deep-learning",
  attention: "attention-transformers",
  transformer: "attention-transformers",
  "gpt-scaling": "scale",
  "chatgpt-rlhf": "scale",
};

// Phase 2, Task 15 — the brief's table (docs/brief.md, "The 15 milestones (v1)" plus the bonus
// card), typed by hand from the brief. year = the brief's year column (the first year of a range);
// people = the person ids for the names the brief gives; cites = the brief's "Inspired by"
// numbers that are milestones, as slugs; moreAuthors = rows where the brief says "et al.".
const BRIEF = {
  "artificial-neuron": { year: 1943, people: ["warren-mcculloch", "walter-pitts"], cites: [] },
  "hebbian-learning": { year: 1949, people: ["donald-hebb"], cites: [] },
  perceptron: { year: 1958, people: ["frank-rosenblatt"], cites: ["artificial-neuron", "hebbian-learning"] },
  "perceptrons-critique": { year: 1969, people: ["marvin-minsky", "seymour-papert"], cites: ["perceptron"] },
  hopfield: { year: 1982, people: ["john-hopfield"], cites: ["hebbian-learning"] },
  "boltzmann-machine": { year: 1985, people: ["geoffrey-hinton", "terry-sejnowski", "david-ackley"], cites: ["hopfield"] },
  backpropagation: {
    year: 1986,
    people: ["david-rumelhart", "geoffrey-hinton", "ronald-williams"],
    cites: ["perceptron", "perceptrons-critique"],
  },
  "mixture-of-experts": {
    year: 1991,
    people: ["robert-jacobs", "michael-jordan", "steven-nowlan", "geoffrey-hinton", "noam-shazeer"],
    cites: [],
    moreAuthors: true,
  },
  lstm: { year: 1997, people: ["sepp-hochreiter", "jurgen-schmidhuber"], cites: ["backpropagation"] },
  "deep-belief-networks": {
    year: 2006,
    people: ["geoffrey-hinton", "simon-osindero", "yee-whye-teh"],
    cites: ["boltzmann-machine"],
  },
  alexnet: {
    year: 2012,
    people: ["alex-krizhevsky", "ilya-sutskever", "geoffrey-hinton"],
    cites: ["backpropagation", "deep-belief-networks"],
  },
  word2vec: { year: 2013, people: ["tomas-mikolov"], cites: [], moreAuthors: true },
  attention: {
    year: 2014,
    people: ["dzmitry-bahdanau", "kyunghyun-cho", "yoshua-bengio"],
    cites: ["lstm", "word2vec"],
  },
  transformer: { year: 2017, people: ["ashish-vaswani", "noam-shazeer"], cites: ["attention"], moreAuthors: true },
  "gpt-scaling": {
    year: 2018,
    people: ["alec-radford", "tom-brown", "jared-kaplan"],
    cites: ["transformer"],
    moreAuthors: true,
  },
  "chatgpt-rlhf": { year: 2022, people: ["long-ouyang"], cites: ["gpt-scaling"], moreAuthors: true },
};

describe("v1 content is complete and matches the brief (Phase 2)", () => {
  const content = loadContent();
  const bySlug = new Map(content.milestones.map((m) => [m.slug, m]));

  test("exactly the sixteen cards of the brief exist", () => {
    // REQ-10
    expect([...bySlug.keys()].sort()).toEqual(Object.keys(BRIEF).sort());
  });

  for (const [slug, row] of Object.entries(BRIEF)) {
    test(`${slug}: year, people, inspirations and author note match the brief`, () => {
      // REQ-10, REQ-4, REQ-5
      const m = bySlug.get(slug);
      expect(m, slug).toBeDefined();
      expect(m.year).toBe(row.year);
      expect(m.people.map((p) => p.person).sort()).toEqual([...row.people].sort());
      const cited = m.cameFrom.filter((c) => "milestone" in c).map((c) => c.milestone);
      for (const c of row.cites) expect(cited, `${slug} should cite ${c}`).toContain(c);
      expect(m.moreAuthors).toBe(row.moreAuthors ?? false);
      // REQ-4: every milestone after the first lists at least one inspiration
      if (slug !== "artificial-neuron") expect(m.cameFrom.length).toBeGreaterThan(0);
    });
  }

  test("every era of REQ-1 holds at least one milestone", () => {
    // REQ-1
    const eras = new Set(content.milestones.map((m) => m.era));
    expect(eras.size).toBe(7);
  });
});

describe("content folder", () => {
  const content = loadContent();

  test("loads without a single validation error", () => {
    // REQ-9 (loadContent throws on any problem; reaching here means none)
    expect(content.milestones.length).toBeGreaterThan(0);
  });

  test("every milestone is one the spec expects, in the era the spec gives it", () => {
    // REQ-1
    for (const m of content.milestones) {
      expect(EXPECTED_ERA, `unexpected slug ${m.slug}`).toHaveProperty(m.slug);
      expect(m.era, m.slug).toBe(EXPECTED_ERA[m.slug]);
    }
  });

  test("milestones are in chronological order", () => {
    // REQ-1
    const years = content.milestones.map((m) => m.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });

  test("the bonus flag is set on the mixture-of-experts card only", () => {
    // REQ-1
    for (const m of content.milestones) expect(m.bonus, m.slug).toBe(m.slug === "mixture-of-experts");
  });
});
