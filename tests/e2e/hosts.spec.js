// Task 31 — the same crawl on both builds (REQ-15): the root build as Vercel serves it, and the
// GitHub Pages build served under /ai-history-timeline/. All URLs here are RELATIVE ("hopfield/",
// not "/hopfield/"), so they resolve under each project's base URL.
const { test, expect } = require("@playwright/test");
const { sel } = require("./helpers");

test("every milestone page, image, share image and the animation load without a 4xx or 5xx", async ({ page, request, baseURL }) => {
  // REQ-15, REQ-8, REQ-12, REQ-14
  test.setTimeout(180_000);
  const failures = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`);
  });
  // Runtime errors that only show in the static export (independent review F-11).
  page.on("pageerror", (err) => failures.push(`pageerror ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") failures.push(`console ${msg.text()}`);
  });
  // Prefetches cancelled by the next navigation report net::ERR_ABORTED; that is not a broken
  // resource (seen in the first red run, 2026-10-23). Every other network error counts.
  page.on("requestfailed", (req) => {
    if (req.failure()?.errorText !== "net::ERR_ABORTED") failures.push(`failed ${req.failure()?.errorText} ${req.url()}`);
  });

  await page.goto("./");
  const slugs = await page.locator(sel.marker).evaluateAll((els) => els.map((e) => e.dataset.slug));
  expect(slugs.length).toBe(16);
  const base = new URL(baseURL.endsWith("/") ? baseURL : `${baseURL}/`);

  for (const slug of slugs) {
    await page.goto(`${slug}/`);
    await expect(page.locator(`${sel.card} h1`)).toBeVisible();
    // Every link to another milestone stays under the base path.
    const hrefs = await page.locator(`${sel.marker}, ${sel.card} a[href^="/"]`).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const h of hrefs) expect(h.startsWith(base.pathname), `${slug}: link ${h}`).toBe(true);
    // Share tags point to this host, under the base path, and the image exists.
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
    expect(ogUrl, slug).toBe(new URL(`${slug}/`, base).href);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(new URL(ogImage).pathname.startsWith(base.pathname), `${slug}: og:image ${ogImage}`).toBe(true);
    expect((await request.get(ogImage)).status(), `${slug}: og:image`).toBe(200);
    const icon = await page.locator('link[rel="icon"]').first().getAttribute("href");
    expect((await request.get(new URL(icon, page.url()).href)).status(), `${slug}: icon ${icon}`).toBe(200);
    // Portraits load (they sit outside next/link, so they test asset()).
    for (const img of await page.locator(`${sel.card} img`).all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0), { message: `${slug}: portrait` }).toBe(true);
    }
  }

  // Client-side navigation keeps the base path too, by click and by the Space-key handler
  // (independent review F-08: Space was never tested on the Pages build).
  await page.goto("hopfield/");
  await page.locator(sel.markerFor("lstm")).click();
  await expect(page).toHaveURL(new URL("lstm/", base).href);
  await page.locator(sel.markerFor("word2vec")).focus();
  await page.keyboard.press(" ");
  await expect(page).toHaveURL(new URL("word2vec/", base).href);
  await expect(page.locator(`${sel.card} h1`)).toContainText("Word2vec");

  // The lesson screen loads under the base path, its links stay under it, and its share tags point
  // to this host (REQ-21, Task 40).
  await page.goto("lesson/hopfield/");
  await expect(page.locator('[data-testid="lesson"] h1')).toBeVisible();
  // The inspiration links live in a tab; open it so they are in the crawl (declared correction,
  // Phase 6 report: probe W14 showed the tab's links were never checked).
  await page.getByRole("tab", { name: "Where it came from" }).click();
  await expect(page.getByRole("tabpanel").locator('a[href^="/"]').first()).toBeVisible();
  const lessonHrefs = await page.locator('[data-testid="lesson"] a[href^="/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(lessonHrefs.length).toBeGreaterThan(15);
  for (const h of lessonHrefs) expect(h.startsWith(base.pathname), `lesson: link ${h}`).toBe(true);
  expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(new URL("lesson/hopfield/", base).href);
  const lessonOg = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect((await request.get(lessonOg)).status(), "lesson: og:image").toBe(200);
  await page.locator('[data-testid="lesson-tools"]').getByRole("button", { name: "Damage 5", exact: true }).click();
  await page.locator('[data-testid="lesson-tools"]').getByRole("button", { name: "Recall", exact: true }).click();
  await expect(page.locator('[data-testid="readout"]')).toHaveAttribute("data-running", "false", { timeout: 20_000 });

  // The transformer animation loads under the base path.
  await page.goto("transformer/");
  await page.locator('[data-testid="deeper-trigger"]').click();
  await page.locator('[data-testid="transformer-play"]').click();
  await expect(page.frameLocator('[data-testid="card"] iframe').locator("canvas").first()).toBeAttached({ timeout: 15000 });

  expect(failures).toEqual([]);
});

test("a URL that is not a milestone gets the site's 404 page", async ({ page }) => {
  // REQ-15
  const res = await page.goto("no-such-milestone/");
  expect(res.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page not found");
});
