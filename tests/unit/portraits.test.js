// Task 20 — portraits with credits (REQ-12). The schema must refuse a licence that is not free and
// credits that do not point to Wikimedia Commons; the real registry must hold at least one portrait
// (so the browser checks have something to measure), and every portrait file must be a real, small
// image on disk.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { loadContent } from "@/lib/content";
import { personSchema } from "@/lib/schema";

const base = {
  id: "ada-example",
  name: "Ada Example",
  portrait: {
    file: "images/people/ada-example.jpg",
    author: "A. Photographer",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ada_Example.jpg",
  },
};
const withPortrait = (patch) => ({ ...base, portrait: { ...base.portrait, ...patch } });

describe("portrait credit rules", () => {
  test("free licences pass", () => {
    // REQ-12
    for (const [licence, licenceUrl] of [
      ["Public domain", "https://commons.wikimedia.org/wiki/Commons:Licensing#Material_in_the_public_domain"],
      ["CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/"],
      ["CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/"],
      ["CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0/"],
      ["CC BY-SA 2.0 de", "https://creativecommons.org/licenses/by-sa/2.0/de/"],
    ]) {
      const r = personSchema.safeParse(withPortrait({ licence, licenceUrl }));
      expect(r.error?.issues ?? [], licence).toEqual([]);
    }
  });

  test("licences that are not free fail", () => {
    // REQ-12
    for (const licence of ["CC BY-NC 4.0", "CC BY-ND 4.0", "CC BY-NC-SA 2.0", "All rights reserved", "Fair use"]) {
      expect(personSchema.safeParse(withPortrait({ licence })).success, licence).toBe(false);
    }
  });

  test("the licence link must go to Creative Commons or the Commons licensing page", () => {
    // REQ-12
    expect(personSchema.safeParse(withPortrait({ licenceUrl: "https://example.com/licence" })).success).toBe(false);
  });

  test("the source must be a Wikimedia Commons file page", () => {
    // REQ-12
    expect(personSchema.safeParse(withPortrait({ sourceUrl: "https://example.com/photo.jpg" })).success).toBe(false);
    expect(
      personSchema.safeParse(withPortrait({ sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/X.jpg" })).success,
    ).toBe(false);
  });
});

describe("portrait files on disk", () => {
  const { people } = loadContent();
  const portraits = [...people.values()].filter((p) => p.portrait);

  test("the registry holds at least one portrait", () => {
    // REQ-12 (without this floor every check below would pass on an empty set)
    expect(portraits.length).toBeGreaterThan(0);
  });

  test("every portrait file is a real JPEG or PNG under 250 KB", () => {
    // REQ-12, separate image files (never embedded) that stay light on a phone
    for (const p of portraits) {
      const file = path.join(process.cwd(), "public", p.portrait.file);
      const bytes = fs.readFileSync(file);
      const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
      const png = bytes.subarray(1, 4).toString("latin1") === "PNG";
      expect(jpeg || png, p.id).toBe(true);
      expect(bytes.length, p.id).toBeLessThan(250 * 1024);
    }
  });
});
