import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson/lesson";
import { getContent, getMilestone } from "@/lib/content";
import { LESSON_SLUGS } from "@/lib/lessons";
import { OG_BASE, ogImageMeta } from "@/lib/og";
import "../lesson.css";

// Only milestones with a lesson are written; any other /lesson/<slug>/ is the 404 page (REQ-19).
export const dynamicParams = false;

export function generateStaticParams() {
  return LESSON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMilestone(slug);
  if (!m) return {};
  const title = `Lesson: ${m.title}`;
  const url = `/lesson/${m.slug}/`;
  return {
    title,
    description: m.idea,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, title, description: m.idea, url, type: "article", images: ogImageMeta(m.slug, m.title) },
    twitter: { card: "summary_large_image", title, description: m.idea, images: ogImageMeta(m.slug, m.title) },
  };
}

/** The lesson screen for one milestone (REQ-19, ADR-004: outside the site chrome). */
export default async function LessonPage({ params }: PageProps<"/lesson/[slug]">) {
  const { slug } = await params;
  const m = getMilestone(slug);
  if (!m) notFound();
  return <Lesson milestone={m} content={getContent()} />;
}
