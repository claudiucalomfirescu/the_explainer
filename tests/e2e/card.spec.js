// Task 9 — the card under the timeline. REQ-2 (opens below, one at a time, keyboard, animation
// skipped on reduced motion, scroll only when needed), REQ-3 to REQ-7 (the five parts and the
// depth ladder).
const { test, expect } = require("@playwright/test");
const { PART_ORDER, sel } = require("./helpers");

test.use({ viewport: { width: 1280, height: 800 } });

test("clicking a marker opens its card below the timeline, alone and highlighted", async ({ page }) => {
  // REQ-2
  await page.goto("/");
  await page.locator(sel.markerFor("hebbian-learning")).click();
  await expect(page).toHaveURL(/\/hebbian-learning\/$/);
  await expect(page.locator(`${sel.card} h1`)).toContainText("Hebbian");
  await expect(page.locator(sel.card)).toHaveCount(1);
  const timeline = await page.locator(sel.timeline).boundingBox();
  const card = await page.locator(sel.card).boundingBox();
  expect(card.y).toBeGreaterThanOrEqual(timeline.y + timeline.height - 1);
  await expect(page.locator(sel.markerFor("hebbian-learning"))).toHaveAttribute("aria-current", "true");
  await expect(page.locator(`${sel.marker}[aria-current="true"]`)).toHaveCount(1);
});

test("Enter and Space on a focused marker open its card", async ({ page }) => {
  // REQ-2 (markers are links; Space needs its own handler)
  await page.goto("/");
  await page.locator(sel.markerFor("perceptron")).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/perceptron\/$/);
  await page.locator(sel.markerFor("hopfield")).focus();
  await page.keyboard.press(" ");
  await expect(page).toHaveURL(/\/hopfield\/$/);
  await expect(page.locator(`${sel.card} h1`)).toContainText("Hopfield");
});

test("the page does not jump when the card is already in view", async ({ page }) => {
  // REQ-2
  await page.goto("/");
  await page.locator(sel.markerFor("perceptron")).click();
  await expect(page).toHaveURL(/\/perceptron\/$/);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("following a link from the bottom of a card brings the new card's top into view", async ({ page }) => {
  // REQ-2, REQ-4. Corrected 2026-10-22 as a declared step: the first version (1280 x 800, link to
  // a shorter card) passed with the scroll code disabled, because the browser clamped the scroll
  // position of the shorter page and the card top landed in view by accident (mutation probe E4,
  // MISSED). A 400 px tall viewport and a link to the long Hopfield card keep the new card's top
  // off-screen unless the app scrolls it into view.
  //
  // Corrected again 2026-10-22 (Phase 2, declared): the link was hard-coded as perceptron → hopfield,
  // which stopped being the "next" link once the 1969 card existed. It now follows the next link of
  // the Hopfield card (long, with go deeper open) to whatever card comes next.
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto("/hopfield/");
  await page.locator('[data-testid="deeper-trigger"]').click();
  const next = page.locator(`${sel.card} nav[aria-label="Previous and next milestone"] a`).last();
  const target = await next.getAttribute("href");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await next.click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));
  await expect
    .poll(async () => {
      const top = (await page.locator(sel.card).boundingBox()).y;
      return top >= -1 && top < 400;
    })
    .toBe(true);
});

test("the card change is not animated when the reader asks for reduced motion", async ({ page }) => {
  // REQ-2
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(sel.markerFor("hopfield")).click();
  await expect(page.locator(`${sel.card} h1`)).toContainText("Hopfield");
  const style = await page
    .locator('[data-testid="card-motion"]')
    .evaluate((el) => ({ opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform }));
  expect(style).toEqual({ opacity: "1", transform: "none" });
});

test("the five parts appear in order", async ({ page }) => {
  // REQ-3, REQ-4, REQ-5, REQ-6, REQ-7
  await page.goto("/hopfield/");
  const parts = await page.locator(`${sel.card} [data-part]`).evaluateAll((els) => els.map((e) => e.dataset.part));
  expect(parts).toEqual(PART_ORDER);
});

test("the plain-words idea is at most 50 words", async ({ page }) => {
  // REQ-3
  for (const slug of ["artificial-neuron", "hebbian-learning", "perceptron", "hopfield"]) {
    await page.goto(`/${slug}/`);
    const text = await page.locator(`${sel.part("idea")} p`).first().innerText();
    expect(text.trim().split(/\s+/).length, slug).toBeLessThanOrEqual(50);
  }
});

test("inspirations: milestones are links, other influences are plain text with a note", async ({ page }) => {
  // REQ-4
  await page.goto("/hopfield/");
  const part = page.locator(sel.part("came-from"));
  await expect(part.locator('a[href$="/hebbian-learning/"]')).toHaveCount(1);
  await expect(part).toContainText("spin glasses");
  await expect(part.locator("a", { hasText: "spin glasses" })).toHaveCount(0);
});

test("people show a name, a note and an initials placeholder without a broken image", async ({ page }) => {
  // REQ-5
  await page.goto("/artificial-neuron/");
  const who = page.locator(sel.part("who"));
  await expect(who.locator('[data-testid="person"]')).toHaveCount(2);
  await expect(who).toContainText("Walter Pitts");
  await expect(who.locator('[data-testid="portrait-placeholder"]').first()).toHaveText("WM");
  const broken = await page.locator(`${sel.card} img`).evaluateAll((imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).length);
  expect(broken).toBe(0);
});

test("the paper shows title, authors, year, venue or publisher, a link and a summary", async ({ page }) => {
  // REQ-6
  await page.goto("/hebbian-learning/");
  const paper = page.locator(sel.part("paper"));
  await expect(paper).toContainText("The Organization of Behavior");
  await expect(paper).toContainText("Donald O. Hebb");
  await expect(paper).toContainText("1949");
  await expect(paper).toContainText("John Wiley & Sons");
  await expect(paper.locator('a[href="https://doi.org/10.4324/9781410612403"]')).toHaveCount(1);
  await expect(paper).toContainText("cell assemblies");
});

test("go deeper is closed until the reader opens it, by click or keyboard", async ({ page }) => {
  // REQ-7
  await page.goto("/perceptron/");
  const trigger = page.locator(`${sel.part("deeper")} [data-testid="deeper-trigger"]`);
  const steps = page.locator(`${sel.part("deeper")} [data-testid="deeper-step"]`);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(steps.first()).toBeHidden();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(steps.first()).toBeVisible();
  expect(await steps.count()).toBeGreaterThanOrEqual(3);

  await page.goto("/hopfield/");
  const trigger2 = page.locator(`${sel.part("deeper")} [data-testid="deeper-trigger"]`);
  await trigger2.focus();
  await page.keyboard.press("Enter");
  await expect(trigger2).toHaveAttribute("aria-expanded", "true");
});
