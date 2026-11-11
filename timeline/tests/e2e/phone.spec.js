// Task 11 — phone width. REQ-16. The credits ≥ 12 px clause is tested in Phase 3 (Task 20), when
// credit lines exist.
const { test, expect } = require("@playwright/test");
const { sel, pageOverflows } = require("./helpers");

test.use({ viewport: { width: 375, height: 812 } });

const PILOT = ["artificial-neuron", "hebbian-learning", "perceptron", "hopfield"];

test("control: the overflow check catches a planted 600 px element", async ({ page }) => {
  // REQ-16 (proves the check below can fail)
  // Planted after hydration and into <body>, which React does not reconcile: planted into <main>
  // before hydration, React could remove it and the control would flake (independent review F-03).
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    const d = document.createElement("div");
    d.id = "planted-overflow";
    d.style.width = "600px";
    d.style.height = "10px";
    document.body.appendChild(d);
  });
  await expect(page.locator("#planted-overflow")).toBeAttached();
  expect(await pageOverflows(page)).toBe(true);
});

test("no page scrolls sideways at 375 px", async ({ page }) => {
  // REQ-16
  for (const slug of PILOT) {
    await page.goto(`/${slug}/`);
    expect(await pageOverflows(page), slug).toBe(false);
    await page.locator(`${sel.part("deeper")} [data-testid="deeper-trigger"]`).click();
    expect(await pageOverflows(page), `${slug} with go deeper open`).toBe(false);
  }
});

test("the timeline strip scrolls sideways and keeps the active marker in view", async ({ page }) => {
  // REQ-16
  await page.goto("/hopfield/");
  const strip = page.locator(sel.strip);
  const sizes = await strip.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(sizes.scroll).toBeGreaterThan(sizes.client);
  await expect
    .poll(async () => {
      const s = await strip.boundingBox();
      const m = await page.locator(sel.markerFor("hopfield")).boundingBox();
      return m.x >= s.x - 1 && m.x + m.width <= s.x + s.width + 1;
    })
    .toBe(true);
});

test("card body text is at least 16 px on every card, go deeper and its visuals included", async ({ page }) => {
  // REQ-16. Widened from /perceptron/ alone after the independent review (F-05).
  await page.goto("/");
  const slugs = await page.locator(sel.marker).evaluateAll((els) => els.map((e) => e.dataset.slug));
  expect(slugs.length).toBe(16);
  for (const slug of slugs) {
    await page.goto(`/${slug}/`);
    await page.locator(`${sel.part("deeper")} [data-testid="deeper-trigger"]`).click();
    const sizes = await page
      .locator(`${sel.card} p`)
      .evaluateAll((ps) => ps.filter((p) => !p.closest("[data-small-print]")).map((p) => parseFloat(getComputedStyle(p).fontSize)));
    expect(sizes.length, slug).toBeGreaterThan(5);
    for (const s of sizes) expect(s, slug).toBeGreaterThanOrEqual(16);
  }
});
