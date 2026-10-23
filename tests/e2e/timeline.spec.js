// Task 8 — the era timeline. REQ-1.
const { test, expect } = require("@playwright/test");
const { ERA_LABELS, sel } = require("./helpers");

test("shows the seven eras in the spec's order, each labelled", async ({ page }) => {
  // REQ-1
  await page.goto("/");
  const labels = page.locator(`${sel.era} [data-testid="era-label"]`);
  await expect(labels).toHaveText(ERA_LABELS);
});

test("markers are in chronological order and show year and short title", async ({ page }) => {
  // REQ-1
  await page.goto("/");
  const markers = page.locator(sel.marker);
  const count = await markers.count();
  expect(count).toBeGreaterThanOrEqual(4);
  const years = [];
  for (let i = 0; i < count; i++) {
    const m = markers.nth(i);
    years.push(Number(await m.getAttribute("data-year")));
    const year = (await m.locator('[data-testid="marker-year"]').innerText()).trim();
    const title = (await m.locator('[data-testid="marker-title"]').innerText()).trim();
    expect(year).toMatch(/^\d{4}(–\d{4})?$/);
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(40);
  }
  expect(years).toEqual([...years].sort((a, b) => a - b));
});

test("each marker sits inside the era its content names", async ({ page }) => {
  // REQ-1
  await page.goto("/");
  const pairs = await page.locator(sel.marker).evaluateAll((els) =>
    els.map((el) => [el.dataset.era, el.closest('[data-testid="era"]')?.dataset.eraId]),
  );
  // Without this floor the loop below passes on a page with no markers at all (seen in the red
  // run against the bare scaffold, 2026-10-22).
  expect(pairs.length).toBeGreaterThanOrEqual(4);
  for (const [markerEra, containerEra] of pairs) expect(containerEra).toBe(markerEra);
});

test("the bonus card's marker, and only it, is marked Bonus", async ({ page }) => {
  // REQ-1. Added after the independent review (F-06).
  await page.goto("/");
  await expect(page.locator(sel.markerFor("mixture-of-experts"))).toContainText("Bonus");
  await expect(page.locator(sel.marker).filter({ hasText: "Bonus" })).toHaveCount(1);
});

test("eras without a milestone yet still show their label", async ({ page }) => {
  // REQ-1 (the pilot has no milestone in most eras; the labels must still render)
  await page.goto("/");
  await expect(page.locator(sel.era)).toHaveCount(7);
});
