// Task 10 — one URL per milestone, history, and share tags. REQ-8.
const { test, expect } = require("@playwright/test");
const { sel } = require("./helpers");

const PILOT = ["artificial-neuron", "hebbian-learning", "perceptron", "hopfield"];

test("opening a milestone URL directly shows that card, highlighted", async ({ page }) => {
  // REQ-8
  await page.goto("/hopfield/");
  await expect(page.locator(`${sel.card} h1`)).toContainText("Hopfield");
  await expect(page.locator(sel.markerFor("hopfield"))).toHaveAttribute("aria-current", "true");
});

test("the home page opens on the first milestone", async ({ page }) => {
  // REQ-8
  await page.goto("/");
  await expect(page.locator(`${sel.card} h1`)).toContainText("artificial neuron");
  await expect(page.locator(sel.markerFor("artificial-neuron"))).toHaveAttribute("aria-current", "true");
});

test("activating a marker changes the address, and Back returns to the previous card", async ({ page }) => {
  // REQ-8
  await page.goto("/perceptron/");
  await page.locator(sel.markerFor("hopfield")).click();
  await expect(page).toHaveURL(/\/hopfield\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/perceptron\/$/);
  await expect(page.locator(`${sel.card} h1`)).toContainText("perceptron");
  await expect(page.locator(sel.markerFor("perceptron"))).toHaveAttribute("aria-current", "true");
});

test("every milestone page has its own title and share tags, and the share image loads", async ({ page, request }) => {
  // REQ-8
  const titles = new Set();
  for (const slug of PILOT) {
    await page.goto(`/${slug}/`);
    const title = await page.title();
    titles.add(title);
    const meta = (name) => page.locator(`meta[name="${name}"], meta[property="${name}"]`).first().getAttribute("content");
    const description = await meta("description");
    expect(description?.length, slug).toBeGreaterThan(20);
    expect(await meta("og:title"), slug).toBeTruthy();
    expect(await meta("og:description"), slug).toBeTruthy();
    expect(await meta("og:url"), slug).toMatch(new RegExp(`/${slug}/$`));
    expect(await meta("twitter:card"), slug).toBe("summary_large_image");
    const image = await meta("og:image");
    expect(image, slug).toBeTruthy();
    const path = new URL(image).pathname;
    const res = await request.get(path);
    expect(res.status(), `${slug} og:image ${path}`).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^image\//);
  }
  expect(titles.size).toBe(PILOT.length);
});

test("the home page and every milestone carry the full share-tag set, with a distinct image each", async ({ page, request }) => {
  // REQ-8. Added after the independent review (F-07): a page-level openGraph replaced the
  // layout's, dropping og:site_name, og:locale and (on home) og:type; and a blank image for
  // every card would have passed.
  const meta = (name) => page.locator(`meta[property="${name}"]`).first().getAttribute("content");
  await page.goto("/");
  expect(await meta("og:url")).toMatch(/\/$/);
  expect(await meta("og:type")).toBe("website");
  expect(await meta("og:site_name")).toBe("From neurons to ChatGPT");
  expect(await meta("og:locale")).toBeTruthy();
  const siteImage = await (await request.get(new URL(await meta("og:image")).pathname)).body();

  await page.goto("/");
  const slugs = await page.locator('[data-testid="marker"]').evaluateAll((els) => els.map((e) => e.dataset.slug));
  const seen = new Set([siteImage.toString("base64")]);
  for (const slug of slugs) {
    await page.goto(`/${slug}/`);
    expect(await meta("og:type"), slug).toBe("article");
    expect(await meta("og:site_name"), slug).toBe("From neurons to ChatGPT");
    expect(await meta("og:locale"), slug).toBeTruthy();
    const body = await (await request.get(new URL(await meta("og:image")).pathname)).body();
    expect(body.length, slug).toBeGreaterThan(10_000);
    const key = body.toString("base64");
    expect(seen.has(key), `${slug}: share image identical to another`).toBe(false);
    seen.add(key);
  }
});
