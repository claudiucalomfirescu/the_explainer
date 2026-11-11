import type { Metadata } from "next";
import { MilestoneCard } from "@/components/milestone-card";
import { getContent } from "@/lib/content";
import { OG_BASE, ogImageMeta } from "@/lib/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/paths";

export const metadata: Metadata = {
  openGraph: { ...OG_BASE, type: "website", title: SITE_NAME, description: SITE_DESCRIPTION, url: "/", images: ogImageMeta("site", SITE_NAME) },
  alternates: { canonical: "/" },
};

/** "/" opens on the first milestone's card (REQ-8). */
export default function Home() {
  const content = getContent();
  return <MilestoneCard milestone={content.milestones[0]} content={content} />;
}
