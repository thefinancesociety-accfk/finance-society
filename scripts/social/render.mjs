// Renders the social banners to PNG:  node scripts/social/render.mjs
// Output: social/linkedin-banner-1584x396.png and social/cash-iq-logo-1024.png.
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

  // CA$H IQ circular logo: transparent outside the circle, so it sits cleanly in round profile photos.
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  await page.goto(url + "/scripts/social/cash-iq-logo.html", { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const logo = join(OUT, "cash-iq-logo-1024.png");
  await page.screenshot({ path: logo, omitBackground: true });
  console.log(logo);
  // Same logo on a solid square, for apps that turn transparency white.
  await page.evaluate(() => { document.body.style.background = "#0B0B0C"; });
  const square = join(OUT, "cash-iq-logo-1024-square.png");
  await page.screenshot({ path: square });
  console.log(square);
} finally {
  await browser.close();
  server.close();
}
