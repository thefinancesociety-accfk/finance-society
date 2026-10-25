// Renders the social banners to PNG:  node scripts/social/render.mjs
// Output: social/linkedin-banner-1584x396.png (outside the published site folders).
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer";
import { serve, ROOT, CHROME } from "../lib/serve.mjs";

const OUT = join(ROOT, "social");
mkdirSync(OUT, { recursive: true });
const { server, url } = await serve();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1584, height: 396, deviceScaleFactor: 1 });
  await page.goto(url + "/scripts/social/linkedin-banner.html", { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const file = join(OUT, "linkedin-banner-1584x396.png");
  await page.screenshot({ path: file });
  console.log(file);
} finally {
  await browser.close();
  server.close();
}
