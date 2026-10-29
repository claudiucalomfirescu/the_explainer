import { z } from "zod";

// The seven eras of REQ-1, in display order.
export const ERAS = [
  { id: "1940s-50s", label: "1940s–50s" },
  { id: "first-ai-winter", label: "First AI winter" },
  { id: "1980s-revival", label: "1980s revival" },
  { id: "1990s-sequences", label: "1990s: sequences" },
  { id: "deep-learning", label: "Deep learning" },
  { id: "attention-transformers", label: "Attention and transformers" },
  { id: "scale", label: "Scale" },
] as const;

export type EraId = (typeof ERAS)[number]["id"];
const eraIds = ERAS.map((e) => e.id) as [EraId, ...EraId[]];

export const VISUALS = ["hopfield", "transformer"] as const;

/** Words separated by whitespace. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Sentences end with . ! or ? followed by whitespace or the end of the text. Content avoids
 * mid-sentence abbreviations ("e.g.", "et al.") so this count stays exact.
 */
export function countSentences(text: string): number {
  return text.trim().split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lower-case words joined by hyphens");
const text = z.string().trim().min(1);

const maxWords = (n: number) => (s: string) => countWords(s) <= n;
const sentencesBetween = (lo: number, hi: number) => (s: string) => {
  const c = countSentences(s);
  return c >= lo && c <= hi;
};

const cameFromSchema = z.union([
  z.object({ milestone: slug, note: text }).strict(),
  z.object({ label: text, note: text }).strict(),
]);

const paperSchema = z
  .object({
    title: text,
    authors: z.array(text).min(1),
    year: z.number().int().min(1800).max(2100),
    venue: text.optional(),
    publisher: text.optional(),
    url: z.url(),
    summary: text.refine(sentencesBetween(2, 4), "summary must be 2 to 4 sentences"),
  })
  .strict()
  .refine((p) => (p.venue === undefined) !== (p.publisher === undefined), {
    message: "a paper has a venue or a publisher, exactly one",
    path: ["venue"],
  });

const stepSchema = z.object({ heading: text, body: text }).strict();

export const milestoneSchema = z
  .object({
    slug,
    order: z.number().int().positive(),
    year: z.number().int().min(1800).max(2100),
    yearLabel: text,
    era: z.enum(eraIds),
    bonus: z.boolean().default(false),
    shortTitle: text.max(40),
    title: text,
    idea: text
      .refine(maxWords(50), "idea must be at most 50 words")
      .refine(sentencesBetween(1, 2), "idea must be one or two sentences"),
    cameFrom: z.array(cameFromSchema),
    people: z
      .array(
        z
          .object({
            person: slug,
            note: text.refine(maxWords(40), "person note must be at most 40 words"),
          })
          .strict(),
      )
      .min(1),
    moreAuthors: z.boolean().default(false),
    papers: z.array(paperSchema).min(1).max(2),
    deeper: z
      .object({
        steps: z.array(stepSchema).min(3).max(8),
        visual: z.enum(VISUALS).optional(),
      })
      .strict(),
  })
  .strict();

// REQ-12: free licences only. Public domain, CC0, CC BY and CC BY-SA (with an optional port code
// such as "de"); anything with NC or ND, or no licence, is refused.
const FREE_LICENCE = /^(Public domain|CC0 1\.0|CC BY(-SA)? \d\.\d( [a-z]{2})?)$/;

const portraitSchema = z
  .object({
    file: z.string().regex(/^images\/people\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/),
    author: text,
    licence: text.regex(FREE_LICENCE, "licence must be public domain, CC0, CC BY or CC BY-SA"),
    licenceUrl: z
      .url()
      .regex(/^https:\/\/(creativecommons\.org|commons\.wikimedia\.org)\//, "licence link must go to Creative Commons or Wikimedia Commons"),
    sourceUrl: z
      .url()
      .regex(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/, "source must be a Wikimedia Commons file page"),
  })
  .strict();

export const personSchema = z
  .object({ id: slug, name: text, portrait: portraitSchema.optional() })
  .strict();

// A list, not an id-keyed object: JSON.parse keeps only the last of two equal keys, so a
// duplicate id in an object could never be reported (REQ-9).
export const peopleSchema = z.array(personSchema);

export type Milestone = z.infer<typeof milestoneSchema>;
export type CameFrom = z.infer<typeof cameFromSchema>;
export type Paper = z.infer<typeof paperSchema>;
export type Person = z.infer<typeof personSchema>;
export type People = z.infer<typeof peopleSchema>;
