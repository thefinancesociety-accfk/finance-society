// Full-page screenshots of every page at 390px and 1440px:  node scripts/screenshots.mjs
// Output: screenshots/<page>-<width>.png
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer";
import { serve, PAGES, ROOT, CHROME } from "./lib/serve.mjs";

const OUT = join(ROOT, "screenshots");
mkdirSync(OUT, { recursive: true });
const { server, url } = await serve();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const written = [];
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width < 800 ? 844 : 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    for (const [name, path] of PAGES) {
      await page.goto(url + path, { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);
      // Scroll through once so lazy-loaded images are fetched before the full-page capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
      });
      const file = join(OUT, `${name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      written.push(file);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(written.join("\n"));
