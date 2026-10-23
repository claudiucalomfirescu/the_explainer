// Task 20 — portraits on every card. REQ-12 (loads, alt names the person, credit with licence and
// source links) and the REQ-16 credits clause (credit text at least 12 px at 375 px wide).
const { test, expect } = require("@playwright/test");
const { sel, pageOverflows } = require("./helpers");

test.use({ viewport: { width: 375, height: 812 } });

async function slugs(page) {
  await page.goto("/");
  return page.locator(sel.marker).evaluateAll((els) => els.map((e) => e.dataset.slug));
}

test("every portrait on every card loads, is named, and carries its credit", async ({ page }) => {
  // REQ-12, REQ-16
  const failed = [];
  page.on("response", (res) => {
    if (res.url().includes("/images/people/") && res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  let seen = 0;
  for (const slug of await slugs(page)) {
    await page.goto(`/${slug}/`);
    const people = page.locator(`${sel.part("who")} [data-testid="person"]`);
    for (let i = 0; i < (await people.count()); i++) {
      const person = people.nth(i);
      const name = (await person.locator("h3").innerText()).trim();
      const img = person.locator("img");
      if ((await img.count()) === 0) {
        await expect(person.locator('[data-testid="portrait-placeholder"]'), `${slug}: ${name}`).toHaveCount(1);
        continue;
      }
      seen++;
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0), { message: `${slug}: ${name} image loads` })
        .toBe(true);
      await expect(img).toHaveAttribute("alt", `Portrait of ${name}`);
      const caption = person.locator("figcaption");
      await expect(caption.locator('a[href^="https://commons.wikimedia.org/wiki/File:"]'), `${slug}: ${name} source`).toHaveCount(1);
      expect(await caption.locator("a").count(), `${slug}: ${name} licence link`).toBe(2);
      const size = await caption.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(size, `${slug}: ${name} credit size`).toBeGreaterThanOrEqual(12);
    }
    expect(await pageOverflows(page), slug).toBe(false);
  }
  expect(failed).toEqual([]);
  expect(seen, "portraits seen across all cards").toBeGreaterThan(0);
});
