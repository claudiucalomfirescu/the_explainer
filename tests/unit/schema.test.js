// Task 2 — schema rules on fixtures. Every rule has a fixture that must FAIL, and the failure must
// name the field. REQ-9 (validated content), REQ-3 (idea limits), REQ-5 (person note limit),
// REQ-6 (paper fields and summary length), REQ-7 (go-deeper step count), REQ-1 (era ids, short title).
import { describe, expect, test } from "vitest";
import { milestoneSchema, peopleSchema } from "@/lib/schema";
import valid from "../fixtures/valid-milestone.json";

const clone = () => structuredClone(valid);
const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

function expectFailOn(data, field) {
  const result = milestoneSchema.safeParse(data);
  expect(result.success).toBe(false);
  const paths = result.error.issues.map((i) => i.path.join("."));
  expect(paths.some((p) => p === field || p.startsWith(`${field}.`))).toBe(true);
}

describe("milestone schema", () => {
  test("the valid fixture passes", () => {
    // REQ-9
    const result = milestoneSchema.safeParse(clone());
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data.bonus).toBe(false);
    expect(result.data.moreAuthors).toBe(false);
  });

  test("a missing required field fails and names the field", () => {
    // REQ-9
    const d = clone();
    delete d.title;
    expectFailOn(d, "title");
  });

  test("an unknown field fails (no silent typos)", () => {
    // REQ-9
    const d = clone();
    d.titel = "typo";
    const result = milestoneSchema.safeParse(d);
    expect(result.success).toBe(false);
  });

  test("an unknown era fails", () => {
    // REQ-1
    const d = clone();
    d.era = "renaissance";
    expectFailOn(d, "era");
  });

  test("a bad slug fails", () => {
    // REQ-8, REQ-9
    const d = clone();
    d.slug = "Hopfield Network";
    expectFailOn(d, "slug");
  });

  test("a short title over 40 characters fails; exactly 40 passes", () => {
    // REQ-1
    const d = clone();
    d.shortTitle = "x".repeat(41);
    expectFailOn(d, "shortTitle");
    d.shortTitle = "x".repeat(40);
    expect(milestoneSchema.safeParse(d).success).toBe(true);
  });

  test("an idea over 50 words fails; exactly 50 passes", () => {
    // REQ-3
    const d = clone();
    d.idea = `${words(51)}.`;
    expectFailOn(d, "idea");
    d.idea = `${words(50)}.`;
    expect(milestoneSchema.safeParse(d).success).toBe(true);
  });

  test("an idea of three sentences fails", () => {
    // REQ-3
    const d = clone();
    d.idea = "One. Two. Three.";
    expectFailOn(d, "idea");
  });

  test("a person note over 40 words fails", () => {
    // REQ-5
    const d = clone();
    d.people[0].note = `${words(41)}.`;
    expectFailOn(d, "people");
  });

  test("no people fails", () => {
    // REQ-5
    const d = clone();
    d.people = [];
    expectFailOn(d, "people");
  });

  test("a paper summary of one sentence fails, and of five sentences fails", () => {
    // REQ-6
    const d = clone();
    d.papers[0].summary = "Only one sentence here.";
    expectFailOn(d, "papers");
    d.papers[0].summary = "One. Two. Three. Four. Five.";
    expectFailOn(d, "papers");
  });

  test("a paper with both venue and publisher, or neither, fails", () => {
    // REQ-6
    const d = clone();
    d.papers[0].publisher = "Wiley";
    expectFailOn(d, "papers");
    delete d.papers[0].publisher;
    delete d.papers[0].venue;
    expectFailOn(d, "papers");
  });

  test("a paper without a valid URL fails", () => {
    // REQ-6
    const d = clone();
    d.papers[0].url = "not a url";
    expectFailOn(d, "papers");
  });

  test("zero papers fails, and three papers fails", () => {
    // REQ-6
    const d = clone();
    d.papers = [];
    expectFailOn(d, "papers");
    d.papers = [valid.papers[0], valid.papers[0], valid.papers[0]];
    expectFailOn(d, "papers");
  });

  test("go deeper with two steps fails, and with nine steps fails", () => {
    // REQ-7
    const d = clone();
    const step = valid.deeper.steps[0];
    d.deeper.steps = [step, step];
    expectFailOn(d, "deeper");
    d.deeper.steps = Array.from({ length: 9 }, () => step);
    expectFailOn(d, "deeper");
  });

  test("an unknown interactive visual fails", () => {
    // REQ-7
    const d = clone();
    d.deeper.visual = "spaceship";
    expectFailOn(d, "deeper");
  });
});

describe("people schema", () => {
  test("a person with a complete portrait credit passes", () => {
    // REQ-12
    const result = peopleSchema.safeParse([
      {
        id: "ada-example",
        name: "Ada Example",
        portrait: {
          file: "images/people/ada-example.jpg",
          author: "A. Photographer",
          licence: "CC BY-SA 4.0",
          licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
        },
      },
      { id: "bo-example", name: "Bo Example" },
    ]);
    expect(result.error?.issues ?? []).toEqual([]);
  });

  test("a portrait without its licence fails", () => {
    // REQ-12
    const result = peopleSchema.safeParse([
      {
        id: "ada-example",
        name: "Ada Example",
        portrait: {
          file: "images/people/ada-example.jpg",
          author: "A. Photographer",
          licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
        },
      },
    ]);
    expect(result.success).toBe(false);
  });

  test("a bad person id fails", () => {
    // REQ-9
    expect(peopleSchema.safeParse([{ id: "Ada Example", name: "Ada" }]).success).toBe(false);
  });
});
