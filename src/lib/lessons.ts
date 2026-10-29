// Milestones that have a lesson screen (REQ-19). One list, read by the lesson route's static params
// and by the card that links to its lesson, so the two cannot disagree.
export const LESSON_SLUGS = ["hopfield"] as const;

export function hasLesson(slug: string): boolean {
  return (LESSON_SLUGS as readonly string[]).includes(slug);
}
