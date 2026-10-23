// Task 33 — the deploy handover files are present and consistent (REQ-18). The workflow is read
// as text: it must build with the base path GitHub Pages reports, publish out/ with .nojekyll,
// and deploy with the official Pages actions; docs/deploy.md must cover each owner step.
import fs from "node:fs";
import { describe, expect, test } from "vitest";

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

describe("GitHub Pages workflow", () => {
  const wf = read(".github/workflows/pages.yml");

  test("exists, runs on push to main and by hand", () => {
    // REQ-18
    expect(wf).toMatch(/on:\s*\n\s*push:\s*\n\s*branches:\s*\[\s*main\s*\]/);
    expect(wf).toContain("workflow_dispatch");
  });

  test("builds with the base path and site URL that GitHub Pages reports", () => {
    // REQ-15, REQ-18
    expect(wf).toContain("actions/configure-pages@");
    expect(wf).toMatch(/BASE_PATH:\s*\$\{\{\s*steps\.pages\.outputs\.base_path\s*\}\}/);
    expect(wf).toMatch(/NEXT_PUBLIC_SITE_URL:\s*\$\{\{\s*steps\.pages\.outputs\.base_url\s*\}\}/);
    expect(wf).toMatch(/pnpm install --frozen-lockfile/);
    expect(wf).toMatch(/pnpm build/);
  });

  test("runs the unit tests before publishing", () => {
    // REQ-18
    expect(wf.indexOf("pnpm test")).toBeGreaterThan(-1);
    expect(wf.indexOf("pnpm test")).toBeLessThan(wf.indexOf("upload-pages-artifact"));
  });

  test("publishes out/ with .nojekyll through the official Pages actions", () => {
    // REQ-18
    expect(wf).toMatch(/touch out\/\.nojekyll/);
    expect(wf).toMatch(/actions\/upload-pages-artifact@v\d+[\s\S]*path:\s*\.?\/?out\/?\s*$/m);
    expect(wf).toContain("actions/deploy-pages@");
    expect(wf).toMatch(/pages:\s*write/);
    expect(wf).toMatch(/id-token:\s*write/);
  });
});

describe("docs/deploy.md", () => {
  const doc = read("docs/deploy.md");

  test("covers every owner step", () => {
    // REQ-18
    for (const heading of [
      "## 1. Create the GitHub repository",
      "## 2. Turn on GitHub Pages",
      "## 3. Connect Vercel",
      "## 4. Compare the two hosts",
      "## 5. Custom domain (optional)",
    ]) {
      expect(doc, heading).toContain(heading);
    }
    expect(doc).toContain("ai-history-timeline");
    expect(doc).toContain("NEXT_PUBLIC_SITE_URL");
  });
});
