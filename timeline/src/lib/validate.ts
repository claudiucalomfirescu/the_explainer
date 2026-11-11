import type { Milestone, People } from "./schema";

export type Entry = { file: string; data: Milestone };
export type ValidateOptions = {
  /** Whether a path relative to public/ exists, e.g. "images/people/hinton.jpg". */
  fileExists: (publicPath: string) => boolean;
};

/**
 * Cross-file checks that a single-file schema cannot make (REQ-9). Returns one message per
 * problem, each starting with "<file>: <field>:", so the build log points at the fix.
 */
export function validateContent(entries: Entry[], people: People, opts: ValidateOptions): string[] {
  const errors: string[] = [];

  const bySlug = new Map<string, Entry>();
  const byOrder = new Map<number, Entry>();
  for (const entry of entries) {
    const { slug, order } = entry.data;
    const sameSlug = bySlug.get(slug);
    if (sameSlug) errors.push(`${entry.file}: slug: "${slug}" is already used by ${sameSlug.file}`);
    else bySlug.set(slug, entry);
    const sameOrder = byOrder.get(order);
    if (sameOrder) errors.push(`${entry.file}: order: ${order} is already used by ${sameOrder.file}`);
    else byOrder.set(order, entry);
  }

  const personIds = new Set<string>();
  people.forEach((person, i) => {
    if (personIds.has(person.id)) errors.push(`people.json: [${i}].id: "${person.id}" appears twice`);
    personIds.add(person.id);
    if (person.portrait && !opts.fileExists(person.portrait.file)) {
      errors.push(`people.json: [${i}].portrait.file: file not found: public/${person.portrait.file}`);
    }
  });

  const firstOrder = Math.min(...entries.map((e) => e.data.order));
  for (const { file, data } of entries) {
    if (data.cameFrom.length === 0 && data.order !== firstOrder) {
      errors.push(`${file}: cameFrom: only the first milestone may list no inspirations`);
    }
    data.cameFrom.forEach((source, i) => {
      if (!("milestone" in source)) return;
      const cited = bySlug.get(source.milestone);
      if (!cited) {
        errors.push(`${file}: cameFrom[${i}].milestone: unknown milestone "${source.milestone}"`);
      } else if (cited.data.order >= data.order) {
        errors.push(
          `${file}: cameFrom[${i}].milestone: "${source.milestone}" is a later milestone (order ${cited.data.order} ≥ ${data.order})`,
        );
      }
    });
    data.people.forEach((p, i) => {
      if (!personIds.has(p.person)) errors.push(`${file}: people[${i}].person: unknown person "${p.person}"`);
    });
  }

  return errors;
}
