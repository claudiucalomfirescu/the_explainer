// Task 12 — accessibility. REQ-17.
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { sel } = require("./helpers");

async function seriousFindings(page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

test("control: axe reports a planted unlabelled button", async ({ page }) => {
  // REQ-17 (proves the scan below can fail)
  // Planted after hydration into <body> (independent review F-03: planting into <main> before
  // hydration made this control flaky).
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.id = "planted-button";
    document.body.appendChild(b);
  });
  await expect(page.locator("#planted-button")).toBeAttached();
  expect((await seriousFindings(page)).length).toBeGreaterThan(0);
});

for (const path of ["/", "/perceptron/"]) {
  test(`axe finds nothing serious or critical on ${path}`, async ({ page }) => {
    // REQ-17. The card check guards against scanning a 404 page, which passed in the red run
    // against the bare scaffold (2026-10-22).
    await page.goto(path);
    await expect(page.locator(sel.card)).toHaveCount(1);
    expect(await seriousFindings(page)).toEqual([]);
  });

  test(`axe finds nothing serious or critical on ${path} with go deeper open`, async ({ page }) => {
    // REQ-17
    await page.goto(path);
    await page.locator('[data-testid="deeper-trigger"]').click();
    expect(await seriousFindings(page)).toEqual([]);
  });
}

test("keyboard: Tab reaches a marker, and it shows a focus indicator", async ({ page }) => {
  // REQ-17
  await page.goto("/");
  let onMarker = false;
  for (let i = 0; i < 40 && !onMarker; i++) {
    await page.keyboard.press("Tab");
    onMarker = await page.evaluate(() => document.activeElement?.dataset?.testid === "marker");
  }
  expect(onMarker).toBe(true);
  const style = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement);
    return { outline: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow };
  });
  expect((style.outline !== "none" && style.width > 0) || style.shadow !== "none").toBe(true);
});

test("every interactive control on the deeper cards shows a focus indicator", async ({ page }) => {
  // REQ-17. Added after the independent review (F-05): only a timeline marker was checked.
  const shows = () =>
    page.evaluate(() => {
      const s = getComputedStyle(document.activeElement);
      return (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
    });
  for (const [slug, selectors] of [
    ["hopfield", ['[data-testid="deeper-trigger"]', '[data-testid="neuron"]', '[data-testid="hopfield"] button:not([data-testid="neuron"])']],
    ["transformer", ['[data-testid="transformer-play"]']],
  ]) {
    await page.goto(`/${slug}/`);
    await page.locator('[data-testid="deeper-trigger"]').click();
    await page.keyboard.press("Tab"); // keyboard modality, so :focus-visible applies
    for (const selector of selectors) {
      const all = page.locator(selector);
      for (let i = 0; i < (await all.count()); i++) {
        await all.nth(i).evaluate((el) => el.focus({ focusVisible: true }));
        expect(await shows(), `${slug}: ${selector} #${i}`).toBe(true);
      }
    }
  }
});

test("the skip link lands in the card", async ({ page }) => {
  // REQ-17. Added after the independent review (F-09).
  await page.goto("/hopfield/");
  const skip = page.getByRole("link", { name: "Skip to the milestone card" });
  const hash = await skip.getAttribute("href");
  await expect(page.locator(hash)).toHaveCount(1);
  await skip.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest('[data-testid="card"]'))).toBe(true);
});

test("one h1 per page", async ({ page }) => {
  // REQ-17
  for (const path of ["/", "/hopfield/"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});
