import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MilestoneCard } from "@/components/milestone-card";
import { getContent, getMilestone } from "@/lib/content";
import { OG_BASE, ogImageMeta } from "@/lib/og";

// Every milestone is written at build time; anything else is a 404 (static export, ADR-001).
export const dynamicParams = false;

export function generateStaticParams() {
  return getContent().milestones.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMilestone(slug);
  if (!m) return {};
  const title = `${m.title} (${m.yearLabel})`;
  return {
    title,
    description: m.idea,
    alternates: { canonical: `/${m.slug}/` },
    openGraph: { ...OG_BASE, title, description: m.idea, url: `/${m.slug}/`, type: "article", images: ogImageMeta(m.slug, title) },
    twitter: { card: "summary_large_image", title, description: m.idea, images: ogImageMeta(m.slug, title) },
  };
}

/** One page per milestone (REQ-8). */
export default async function MilestonePage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const m = getMilestone(slug);
  if (!m) notFound();
  return <MilestoneCard milestone={m} content={getContent()} />;
}
