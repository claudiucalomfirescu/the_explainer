// Task 4 — cross-file validation. Each rule has a planted failure, and each error names the file
// and the field. REQ-9 (build fails on inconsistent content), REQ-4 (inspirations resolve and are
// earlier), REQ-5 (people exist), REQ-12 (portrait files exist).
import { describe, expect, test } from "vitest";
import { milestoneSchema } from "@/lib/schema";
import { validateContent } from "@/lib/validate";
import valid from "../fixtures/valid-milestone.json";

function milestone(file, patch) {
  const data = milestoneSchema.parse({ ...structuredClone(valid), ...patch });
  return { file, data };
}

const people = [
  { id: "ada-example", name: "Ada Example" },
  {
    id: "bo-example",
    name: "Bo Example",
    portrait: {
      file: "images/people/bo-example.jpg",
      author: "A. Photographer",
      licence: "CC BY 4.0",
      licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Bo.jpg",
    },
  },
];
const allFilesExist = { fileExists: () => true };

const first = () => milestone("01-first.json", { slug: "first", order: 1, cameFrom: [] });
const second = (patch = {}) =>
  milestone("02-second.json", {
    slug: "second",
    order: 2,
    cameFrom: [{ milestone: "first", note: "Builds on the first." }],
    ...patch,
  });

describe("validateContent", () => {
  test("a consistent set has no errors", () => {
    // REQ-9
    expect(validateContent([first(), second()], people, allFilesExist)).toEqual([]);
  });

  test("a duplicate slug is reported with both files", () => {
    // REQ-9
    const errors = validateContent(
      [first(), second(), second({ order: 3 })].map((m, i) =>
        i === 2 ? { ...m, file: "03-copy.json" } : m,
      ),
      people,
      allFilesExist,
    );
    expect(errors.some((e) => e.startsWith("03-copy.json: slug:") && e.includes("02-second.json"))).toBe(true);
  });

  test("a duplicate order is reported", () => {
    // REQ-9
    const errors = validateContent([first(), second({ order: 1 })], people, allFilesExist);
    expect(errors.some((e) => e.startsWith("02-second.json: order:"))).toBe(true);
  });

  test("a duplicate person id is reported", () => {
    // REQ-9, REQ-5
    const errors = validateContent([first(), second()], [...people, { id: "ada-example", name: "Ada Again" }], allFilesExist);
    expect(errors.some((e) => e.startsWith("people.json: [2].id:"))).toBe(true);
  });

  test("an inspiration pointing to a missing slug is reported", () => {
    // REQ-4, REQ-9
    const errors = validateContent(
      [first(), second({ cameFrom: [{ milestone: "nowhere", note: "Missing." }] })],
      people,
      allFilesExist,
    );
    expect(errors.some((e) => e.startsWith("02-second.json: cameFrom[0].milestone:") && e.includes("nowhere"))).toBe(true);
  });

  test("an inspiration pointing to a later milestone is reported", () => {
    // REQ-4, REQ-9
    // Corrected 2026-10-22 (declared, before the validator existed): the first version planted an
    // "early" milestone with order 0, which the schema rejects (order must be positive), so the
    // test died in its own fixture. Now the first milestone cites the second one instead.
    const errors = validateContent(
      [
        milestone("01-first.json", {
          slug: "first",
          order: 1,
          cameFrom: [{ milestone: "second", note: "From the future." }],
        }),
        second(),
      ],
      people,
      allFilesExist,
    );
    expect(errors.some((e) => e.startsWith("01-first.json: cameFrom[0].milestone:") && e.includes("later"))).toBe(true);
  });

  test("an unknown person is reported", () => {
    // REQ-5, REQ-9
    const errors = validateContent(
      [first(), second({ people: [{ person: "nobody", note: "Not in the registry." }] })],
      people,
      allFilesExist,
    );
    expect(errors.some((e) => e.startsWith("02-second.json: people[0].person:") && e.includes("nobody"))).toBe(true);
  });

  test("a missing portrait file is reported", () => {
    // REQ-12, REQ-9
    const errors = validateContent([first(), second()], people, { fileExists: () => false });
    expect(errors.some((e) => e.startsWith("people.json: [1].portrait.file:") && e.includes("bo-example.jpg"))).toBe(true);
  });

  test("an empty inspiration list on a milestone that is not the first is reported", () => {
    // REQ-4, REQ-9
    const errors = validateContent([first(), second({ cameFrom: [] })], people, allFilesExist);
    expect(errors.some((e) => e.startsWith("02-second.json: cameFrom:"))).toBe(true);
  });

  test("the first milestone may have no inspirations", () => {
    // REQ-4
    const errors = validateContent([first()], people, allFilesExist);
    expect(errors).toEqual([]);
  });
});
