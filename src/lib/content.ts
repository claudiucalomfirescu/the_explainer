import fs from "node:fs";
import path from "node:path";
import { type Milestone, type People, type Person, milestoneSchema, peopleSchema } from "./schema";
import { type Entry, validateContent } from "./validate";

export type Content = {
  /** Sorted by order (chronological). */
  milestones: Milestone[];
  people: Map<string, Person>;
};

const ROOT = process.cwd();
const MILESTONES_DIR = path.join(ROOT, "content", "milestones");
const PEOPLE_FILE = path.join(ROOT, "content", "people.json");
const PUBLIC_DIR = path.join(ROOT, "public");

function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`${path.basename(file)}: not valid JSON: ${(err as Error).message}`);
  }
}

function issues(file: string, error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((i) => `${file}: ${i.path.map(String).join(".") || "(root)"}: ${i.message}`);
}

/**
 * Reads content/ (REQ-9). Throws one error listing every problem, so `next build` fails with a
 * message that names each file and field.
 */
export function loadContent(dir = MILESTONES_DIR, peopleFile = PEOPLE_FILE, publicDir = PUBLIC_DIR): Content {
  const errors: string[] = [];

  const peopleResult = peopleSchema.safeParse(readJson(peopleFile));
  if (!peopleResult.success) errors.push(...issues("people.json", peopleResult.error));
  const people: People = peopleResult.success ? peopleResult.data : [];

  const entries: Entry[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const result = milestoneSchema.safeParse(readJson(path.join(dir, file)));
    if (result.success) entries.push({ file, data: result.data });
    else errors.push(...issues(file, result.error));
  }
  if (entries.length === 0 && errors.length === 0) errors.push(`${dir}: no milestone files`);

  errors.push(
    ...validateContent(entries, people, {
      fileExists: (p) => fs.existsSync(path.join(publicDir, p)),
    }),
  );
  if (errors.length > 0) {
    throw new Error(`Content is invalid (${errors.length} problem(s)):\n  ${errors.join("\n  ")}`);
  }

  return {
    milestones: entries.map((e) => e.data).sort((a, b) => a.order - b.order),
    people: new Map(people.map((p) => [p.id, p])),
  };
}

let cached: Content | undefined;

/** The validated content, read once per build process. */
export function getContent(): Content {
  cached ??= loadContent();
  return cached;
}

export function getMilestone(slug: string): Milestone | undefined {
  return getContent().milestones.find((m) => m.slug === slug);
}
