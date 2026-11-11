// ADR-001: next/link adds the base path itself; plain src strings do not. Every image and iframe
// source goes through asset() so the GitHub Pages build (served under a sub-path) still resolves.
export function asset(publicPath: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/${publicPath.replace(/^\/+/, "")}`;
}

export const SITE_NAME = "From neurons to ChatGPT";
export const SITE_DESCRIPTION =
  "The ideas behind today's language models, from the artificial neuron of 1943 to ChatGPT in 2022. Each milestone starts in plain words and goes as deep as you like.";

/**
 * Absolute address used for share tags (REQ-8). Set NEXT_PUBLIC_SITE_URL at build time (the Pages
 * workflow passes the URL GitHub reports, base path included). On Vercel it falls back to the
 * production domain Vercel provides at build time, so no setting is needed there.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:4173");
