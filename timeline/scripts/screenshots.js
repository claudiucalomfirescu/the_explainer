// Takes review screenshots of the exported site (served on :4175) at desktop and phone width.
// Usage: node scripts/screenshots.js <outDir>
const { chromium } = require("@playwright/test");
const { spawn } = require("node:child_process");

(async () => {
  const outDir = process.argv[2] || `reports/screenshots-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12)}`;
  require("node:fs").mkdirSync(outDir, { recursive: true });
  const server = spawn("pnpm", ["exec", "serve", "out", "-l", "4175", "--no-clipboard"], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 1500));
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const [name, viewport] of [["desktop", { width: 1366, height: 900 }], ["phone", { width: 375, height: 812 }]]) {
      const page = await browser.newPage({ viewport });
      await page.goto("http://localhost:4175/hopfield/");
      await page.screenshot({ path: `${outDir}/hopfield-${name}.png`, fullPage: false });
      await page.locator('[data-testid="deeper-trigger"]').click();
      await page.screenshot({ path: `${outDir}/hopfield-${name}-full.png`, fullPage: true });
      await page.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
})();
