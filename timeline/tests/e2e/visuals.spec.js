// Tasks 26 and 28 — the interactive visuals inside "go deeper". REQ-13 (Hopfield network),
// REQ-14 (transformer animation, loaded only on request), REQ-17 (accessible).
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { sel } = require("./helpers");

async function openDeeper(page, slug) {
  await page.goto(`/${slug}/`);
  await page.locator(`${sel.part("deeper")} [data-testid="deeper-trigger"]`).click();
}

const neurons = (page) => page.locator('[data-testid="hopfield"] [data-testid="neuron"]');
const button = (page, name) => page.locator('[data-testid="hopfield"]').getByRole("button", { name });
const readState = (page) => neurons(page).evaluateAll((els) => els.map((e) => (e.getAttribute("aria-pressed") === "true" ? 1 : -1)));

test.describe("Hopfield network", () => {
  test("has at least 25 neurons that flip by click and by keyboard", async ({ page }) => {
    // REQ-13
    await openDeeper(page, "hopfield");
    expect(await neurons(page).count()).toBeGreaterThanOrEqual(25);
    const first = neurons(page).first();
    const before = await first.getAttribute("aria-pressed");
    await first.click();
    await expect(first).not.toHaveAttribute("aria-pressed", before);
    await first.focus();
    await page.keyboard.press(" ");
    await expect(first).toHaveAttribute("aria-pressed", before);
  });

  test("store, scramble five neurons, recall: the stored pattern comes back, step by step", async ({ page }) => {
    // REQ-13
    await openDeeper(page, "hopfield");
    await button(page, "Forget memories").click();
    await button(page, "Clear").click();
    expect((await readState(page)).every((s) => s === -1)).toBe(true);
    for (const i of [0, 4, 6, 8, 12, 16, 18, 20, 24]) await neurons(page).nth(i).click(); // an X
    const pattern = await readState(page);
    await button(page, "Remember this pattern").click();
    await expect(page.locator('[data-testid="stored-count"]')).toHaveText("1");

    await button(page, "Scramble 5 neurons").click();
    const scrambled = await readState(page);
    expect(scrambled.filter((s, i) => s !== pattern[i]).length).toBe(5);

    await button(page, "Recall").click();
    const status = page.locator('[data-testid="hopfield-status"]');
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toContainText("Step 1", { timeout: 5000 });
    await expect(status).toContainText("Stable", { timeout: 10000 });
    expect(await readState(page)).toEqual(pattern);
  });

  test("keyboard focus stays on Recall while and after the network settles", async ({ page }) => {
    // REQ-13. Added after the independent review (F-04): disabling every control dropped focus to <body>.
    await openDeeper(page, "hopfield");
    await button(page, "Scramble 5 neurons").click();
    await button(page, "Recall").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-testid="hopfield-status"]')).toContainText("Stable", { timeout: 10000 });
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe("Recall");
  });

  test("with reduced motion, recall settles at once", async ({ page }) => {
    // REQ-13, REQ-2. Added after the independent review (F-10).
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openDeeper(page, "hopfield");
    await button(page, "Scramble 5 neurons").click();
    await button(page, "Recall").click();
    await expect(page.locator('[data-testid="hopfield-status"]')).toContainText("Stable", { timeout: 300 });
  });

  test("remembering a pattern that is already stored does not use up a slot", async ({ page }) => {
    // REQ-13. Added after the independent review (F-12).
    await openDeeper(page, "hopfield");
    await expect(page.locator('[data-testid="stored-count"]')).toHaveText("1");
    await button(page, "Remember this pattern").click();
    await expect(page.locator('[data-testid="stored-count"]')).toHaveText("1");
    await expect(page.locator('[data-testid="hopfield-status"]')).toContainText("already remembered");
  });

  test("recall with nothing remembered says so instead of changing the grid", async ({ page }) => {
    // REQ-13
    await openDeeper(page, "hopfield");
    await button(page, "Forget memories").click();
    const before = await readState(page);
    await button(page, "Recall").click();
    await expect(page.locator('[data-testid="hopfield-status"]')).toContainText("Remember a pattern first");
    expect(await readState(page)).toEqual(before);
  });

  test("axe finds nothing serious or critical with the network open", async ({ page }) => {
    // REQ-13, REQ-17
    await openDeeper(page, "hopfield");
    await expect(neurons(page).first()).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});

test.describe("Transformer animation", () => {
  test("loads only when asked, inside the card, and the page it loads exists", async ({ page }) => {
    // REQ-14
    const requested = [];
    page.on("response", (res) => {
      if (res.url().includes("/explainers/transformer/")) requested.push(res.status());
    });
    await openDeeper(page, "transformer");
    const card = page.locator(sel.card);
    await expect(card.locator('[data-testid="transformer-play"]')).toBeVisible();
    await expect(card.locator("iframe")).toHaveCount(0);
    expect(requested).toEqual([]);

    await card.locator('[data-testid="transformer-play"]').click();
    const frame = card.locator("iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute("title", /transformer/i);
    // Corrected 2026-10-23 (declared): the expected src was ".../index.html", which the local
    // static server answers with a 301 to a clean URL. REQ-14 needs the explainer to load with
    // HTTP 200, so the iframe now points at the folder, and the 200 check below is unchanged.
    await expect(frame).toHaveAttribute("src", /\/explainers\/transformer\/$/);
    await expect.poll(() => requested[0]).toBe(200);
    await expect(page.frameLocator('[data-testid="card"] iframe').locator("canvas").first()).toBeAttached({ timeout: 15000 });
  });

  test("no other card loads the animation", async ({ page }) => {
    // REQ-14
    await openDeeper(page, "attention");
    await expect(page.locator('[data-testid="transformer-play"]')).toHaveCount(0);
  });
});
