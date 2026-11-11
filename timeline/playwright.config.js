// Browser tests run against the exported site in out/, never the dev server: the export is what
// ships (docs/architecture.md, Testing). Two projects (REQ-15):
//   root   the build for the domain root (Vercel); every spec runs here
//   pages  the GitHub Pages build, served under /ai-history-timeline/; only the host crawl runs
// Both serve the same out/ folder, so build the matching variant first: `pnpm test:e2e` for root,
// `pnpm test:hosts` builds and tests the Pages variant, then rebuilds and tests root.
const { defineConfig } = require("@playwright/test");

const ROOT_PORT = 4173;
const PAGES_PORT = 4180;
const PREFIX = "/ai-history-timeline";

module.exports = defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    // The installed Google Chrome (same major as this Playwright's pinned Chromium), so no
    // browser download is needed.
    channel: "chrome",
  },
  projects: [
    { name: "root", use: { baseURL: `http://localhost:${ROOT_PORT}` } },
    { name: "pages", testMatch: /hosts\.spec\.js/, use: { baseURL: `http://localhost:${PAGES_PORT}${PREFIX}/` } },
  ],
  webServer: [
    {
      command: `pnpm exec serve out -l ${ROOT_PORT} --no-clipboard`,
      url: `http://localhost:${ROOT_PORT}/`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: `node scripts/serve-subpath.js ${PAGES_PORT} ${PREFIX} out`,
      url: `http://localhost:${PAGES_PORT}${PREFIX}/`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
