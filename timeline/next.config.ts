import type { NextConfig } from "next";

// ADR-001: one static export for two hosts. BASE_PATH is empty for Vercel (domain root) and
// "/ai-history-timeline" for GitHub Pages. The same value is exposed to client code as
// NEXT_PUBLIC_BASE_PATH so asset() in src/lib/paths.ts can prefix image and iframe sources.
const basePath = process.env.BASE_PATH ?? "";

// A CI build without a site address would write http://localhost into every share tag
// (independent review F-19). GitHub Pages passes NEXT_PUBLIC_SITE_URL; Vercel provides
// VERCEL_PROJECT_PRODUCTION_URL. Local builds keep the localhost default.
if (process.env.CI && !process.env.NEXT_PUBLIC_SITE_URL && !process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  throw new Error("Set NEXT_PUBLIC_SITE_URL for this build: share previews need the site's public address.");
}

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
