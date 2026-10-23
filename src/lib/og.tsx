import { ImageResponse } from "next/og";
import { SITE_NAME } from "./paths";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Fields every page's openGraph must repeat: Next.js merges openGraph shallowly, so a page-level
 * openGraph replaces the layout's whole object (independent review F-07).
 */
export const OG_BASE = { siteName: SITE_NAME, locale: "en_GB" } as const;

/** Metadata entry for a share image written by app/og/[file]/route.tsx. */
export function ogImageMeta(name: string, alt: string) {
  return [{ url: `/og/${name}.png`, ...OG_SIZE, type: "image/png", alt }];
}

/** The share image: site name, year and title on the site's paper colour (REQ-8). */
export function ogImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f4ee",
          color: "#1d1b18",
          padding: "72px 80px",
          borderLeft: "24px solid #2f45c4",
        }}
      >
        <div style={{ fontSize: 34, color: "#2f45c4", fontWeight: 600 }}>{SITE_NAME}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, color: "#5c574e" }}>{eyebrow}</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }}>{title}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
