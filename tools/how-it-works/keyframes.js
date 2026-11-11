// Render one keyframe near the end of each beat, plus a scrub-backwards check, for a how-it-works visual.
// The page must expose window.__beats ([{id,start,dur}]) and window.__seek(t) (which seeks with callbacks on).
// Usage: node tools/how-it-works/keyframes.js explainers/neuron/how-it-works [backBeatIndex=4]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const dir = path.resolve(process.argv[2]);
  const backIdx = Number(process.argv[3] ?? 4);
  const outDir = path.join(dir, 'keyframes');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1232, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + path.join(dir, 'index.html') + '?still');
  const viewport = await page.$('#viewport');
  const clip = await viewport.boundingBox();
  const beats = await page.evaluate(() => window.__beats);
  const shot = async (t, name) => {
    await page.evaluate((x) => { window.__seek(x); }, t); // never return the timeline: serialising it kills the page
    await page.waitForTimeout(60);
    await page.screenshot({ clip, path: path.join(outDir, name) });
  };
  for (const b of beats) await shot(b.start + b.dur - 0.4, `${b.id}.png`);
  const back = beats[backIdx];
  if (back) {
    await page.evaluate(() => { window.__seek(1e6); });
    await shot(back.start + back.dur - 0.4, `scrub-back-${back.id}.png`);
  }
  await browser.close();
  console.log(`${beats.length} keyframes in ${outDir}; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  if (errors.length) process.exit(1);
})();
