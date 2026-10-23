import { getContent, getMilestone } from "@/lib/content";
import { ogImage } from "@/lib/og";

// Share images are written at build time as /og/<slug>.png (and /og/site.png). The .png extension
// matters: the file-convention route (opengraph-image) is exported without one, and static hosts
// then serve it with no image content type (REQ-8, found by the share-tag test on 2026-10-22).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ file: "site.png" }, ...getContent().milestones.map((m) => ({ file: `${m.slug}.png` }))];
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.png$/, "");
  if (slug === "site") return ogImage({ eyebrow: "1943 to 2022", title: "The ideas behind today's language models" });
  const m = getMilestone(slug);
  return ogImage({ eyebrow: m?.yearLabel ?? "", title: m?.title ?? "" });
}
