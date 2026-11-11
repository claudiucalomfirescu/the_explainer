// Tasks 38, 39 and 40 — the Hopfield lesson screen. REQ-19 (the screen), REQ-20 (a real network
// and an exact valley), REQ-21 (the lesson for everyone).
// Expected text is read from the milestone file (the content, upstream of the code under test);
// the letters H and T are typed here; era labels come from the spec (helpers.js).
const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { ERA_LABELS, pageOverflows } = require("./helpers");

const URL_ = "/lesson/hopfield/";
const M = JSON.parse(fs.readFileSync(path.join(__dirname, "../../content/milestones/05-hopfield.json"), "utf8"));
const bitmap = (rows) => rows.join("").split("").map((c) => (c === "#" ? 1 : -1));
const H = bitmap(["#...#", "#...#", "#####", "#...#", "#...#"]);
const T = bitmap(["#####", "..#..", "..#..", "..#..", "..#.."]);
const DIFFER = H.flatMap((v, i) => (v !== T[i] ? [i] : []));

const lesson = (page) => page.locator('[data-testid="lesson"]');
const neurons = (page) => page.locator('[data-testid="lesson-neuron"]');
const tool = (page, name) => page.locator('[data-testid="lesson-tools"]').getByRole("button", { name, exact: true });
const readState = (page) => neurons(page).evaluateAll((els) => els.map((e) => (e.getAttribute("aria-pressed") === "true" ? 1 : -1)));
const readout = (page) => page.locator('[data-testid="readout"]');

async function seriousFindings(page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

test.describe("the screen (REQ-19)", () => {
  test("has the milestone's title, its own page title and share tags, and no site chrome", async ({ page }) => {
    // REQ-19
    await page.goto(URL_);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(M.title);
    await expect(page).toHaveTitle(new RegExp(`^Lesson: ${M.title}`));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", M.idea);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /\/lesson\/hopfield\/$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/hopfield\.png$/);
    // The site's header strip of markers belongs to the card pages, not the lesson (ADR-004).
    await expect(page.locator('[data-testid="timeline"]')).toHaveCount(0);
  });

  test("tabs hold the milestone's idea, inspirations, people and paper", async ({ page }) => {
    // REQ-19
    await page.goto(URL_);
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveText(["Idea", "Where it came from", "Who", "Paper"]);
    const panel = page.getByRole("tabpanel");
    await expect(panel).toContainText(M.idea);
    await page.getByRole("tab", { name: "Where it came from" }).click();
    for (const c of M.cameFrom) await expect(panel).toContainText(c.note);
    await page.getByRole("tab", { name: "Who" }).click();
    for (const p of M.people) await expect(panel).toContainText(p.note);
    await page.getByRole("tab", { name: "Paper" }).click();
    await expect(panel).toContainText(M.papers[0].title);
    await expect(panel.getByRole("link", { name: /Read the paper/ })).toHaveAttribute("href", M.papers[0].url);
  });

  test("lists the six steps; choosing one shows its text", async ({ page }) => {
    // REQ-19
    await page.goto(URL_);
    const steps = page.locator('[data-testid="step"]');
    await expect(steps).toHaveCount(M.deeper.steps.length);
    for (let i = 0; i < M.deeper.steps.length; i++) await expect(steps.nth(i)).toContainText(M.deeper.steps[i].heading);
    await steps.nth(3).click();
    await expect(steps.nth(3)).toHaveAttribute("aria-current", "step");
    await expect(page.locator('[data-testid="step-text"]')).toHaveText(M.deeper.steps[3].body);
  });

  test("the strip holds all sixteen milestones in seven eras; Hopfield is current, the rest link to their cards", async ({ page }) => {
    // REQ-19
    await page.goto(URL_);
    await expect(page.locator('[data-testid="lesson-era"] > span')).toHaveText(ERA_LABELS);
    const items = page.locator('[data-testid="lesson-milestone"]');
    await expect(items).toHaveCount(16);
    const current = page.locator('[data-testid="lesson-milestone"][aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("data-slug", "hopfield");
    const links = await items.evaluateAll((els) => els.filter((e) => e.tagName === "A").map((e) => [e.dataset.slug, e.getAttribute("href")]));
    expect(links.length).toBe(15);
    for (const [slug, href] of links) expect(href).toBe(`/${slug}/`);
    await items.filter({ hasText: "1949" }).click();
    await expect(page).toHaveURL(/\/hebbian-learning\/$/);
  });

  test("links to the timeline and the card; the card links back to the lesson", async ({ page }) => {
    // REQ-19
    await page.goto(URL_);
    await expect(page.getByRole("link", { name: "Timeline" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "Read as a card" })).toHaveAttribute("href", "/hopfield/");
    await page.goto("/hopfield/");
    await page.locator('[data-testid="lesson-link"]').click();
    await expect(page).toHaveURL(/\/lesson\/hopfield\/$/);
    await expect(lesson(page)).toBeVisible();
  });

  test("no other milestone has a lesson", async ({ page }) => {
    // REQ-19
    const res = await page.goto("/lesson/perceptron/");
    expect(res.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("Page not found");
  });
});

test.describe("the network and the valley (REQ-20)", () => {
  test("starts on H; a neuron flips by click", async ({ page }) => {
    // REQ-20
    await page.goto(URL_);
    await expect(neurons(page)).toHaveCount(25);
    expect(await readState(page)).toEqual(H);
    await expect(readout(page)).toHaveAttribute("data-energy", "-312");
    await neurons(page).nth(1).click();
    await expect(neurons(page).nth(1)).toHaveAttribute("aria-pressed", "true");
  });

  test("Damage 5 flips five of the sixteen; Recall restores H and the energy never rises", async ({ page }) => {
    // REQ-20
    await page.goto(URL_);
    await tool(page, "Damage 5").click();
    const damaged = await readState(page);
    const flipped = damaged.flatMap((v, i) => (v !== H[i] ? [i] : []));
    expect(flipped.length).toBe(5);
    for (const i of flipped) expect(DIFFER).toContain(i);
    await expect(readout(page)).toHaveAttribute("data-place", "5");
    const ball = page.locator('[data-testid="ball"]');
    await expect(ball).toHaveAttribute("data-place", "5");
    // Record every energy the readout shows during recall.
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="readout"]');
      window.__energies = [Number(el.dataset.energy)];
      new MutationObserver(() => window.__energies.push(Number(el.dataset.energy))).observe(el, { attributes: true, attributeFilter: ["data-energy"] });
    });
    await tool(page, "Recall").click();
    await expect(readout(page)).toHaveAttribute("data-energy", "-312", { timeout: 20_000 });
    await expect(readout(page)).toHaveAttribute("data-running", "false", { timeout: 20_000 });
    expect(await readState(page)).toEqual(H);
    await expect(ball).toHaveAttribute("data-place", "0");
    const energies = await page.evaluate(() => window.__energies);
    expect(energies.length).toBeGreaterThan(2);
    for (let i = 1; i < energies.length; i++) expect(energies[i]).toBeLessThanOrEqual(energies[i - 1]);
  });

  test("Show the energy hides and shows the track; Reset returns to H", async ({ page }) => {
    // REQ-20
    await page.goto(URL_);
    const track = page.locator('[data-testid="track"]');
    await expect(track).toBeVisible();
    await tool(page, "Show the energy").click();
    await expect(tool(page, "Show the energy")).toHaveAttribute("aria-pressed", "false");
    await expect(track).toBeHidden();
    await tool(page, "Show the energy").click();
    await expect(track).toBeVisible();
    await tool(page, "Damage 5").click();
    await tool(page, "Reset").click();
    expect(await readState(page)).toEqual(H);
  });
});

test.describe("the lesson for everyone (REQ-21)", () => {
  test("keyboard alone operates a neuron, a tab, a step and Recall, each with a focus ring", async ({ page }) => {
    // REQ-21
    await page.goto(URL_);
    const shows = () =>
      page.evaluate(() => {
        const s = getComputedStyle(document.activeElement);
        return (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
      });
    await page.keyboard.press("Tab"); // keyboard modality, so :focus-visible applies
    const n = neurons(page).nth(1);
    await n.evaluate((el) => el.focus({ focusVisible: true }));
    expect(await shows(), "neuron").toBe(true);
    await page.keyboard.press(" ");
    await expect(n).toHaveAttribute("aria-pressed", "true");
    const tab = page.getByRole("tab", { name: "Paper" });
    await tab.evaluate((el) => el.focus({ focusVisible: true }));
    expect(await shows(), "tab").toBe(true);
    await page.keyboard.press("Enter");
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const step = page.locator('[data-testid="step"]').nth(1);
    await step.evaluate((el) => el.focus({ focusVisible: true }));
    expect(await shows(), "step").toBe(true);
    await page.keyboard.press("Enter");
    await expect(step).toHaveAttribute("aria-current", "step");
    const recall = tool(page, "Recall");
    await recall.evaluate((el) => el.focus({ focusVisible: true }));
    expect(await shows(), "Recall").toBe(true);
  });

  test("the step text and the readout are announced", async ({ page }) => {
    // REQ-21
    await page.goto(URL_);
    await expect(page.locator('[data-testid="step-text"]')).toHaveAttribute("aria-live", "polite");
    await expect(readout(page)).toHaveAttribute("aria-live", "polite");
  });

  test("axe finds nothing serious or critical, before and after a recall", async ({ page }) => {
    // REQ-21
    await page.goto(URL_);
    await expect(lesson(page)).toBeVisible();
    expect(await seriousFindings(page)).toEqual([]);
    await tool(page, "Damage 5").click();
    await tool(page, "Recall").click();
    await expect(readout(page)).toHaveAttribute("data-running", "false", { timeout: 20_000 });
    await page.getByRole("tab", { name: "Who" }).click();
    expect(await seriousFindings(page)).toEqual([]);
  });

  test("at 375 px: no sideways page scroll, and the strip scrolls inside itself", async ({ page }) => {
    // REQ-21
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(URL_);
    await expect(lesson(page)).toBeVisible();
    expect(await pageOverflows(page)).toBe(false);
    const strip = page.locator('[data-testid="lesson-strip"]');
    expect(await strip.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  });

  test("with reduced motion, Recall finishes at once", async ({ page }) => {
    // REQ-21
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(URL_);
    await tool(page, "Damage 5").click();
    await tool(page, "Recall").click();
    await expect(readout(page)).toHaveAttribute("data-running", "false", { timeout: 500 });
    expect(await readState(page)).toEqual(H);
  });
});
