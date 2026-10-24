// Lighthouse on Home and Team (mobile and desktop):  node scripts/lighthouse.mjs [page ...]
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { serve, PAGES, CHROME } from "./lib/serve.mjs";

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : ["home", "team"];
const { server, url } = await serve();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--remote-debugging-port=0"] });
const port = +new URL(browser.wsEndpoint()).port;
const rows = [];
let worst = 100;
try {
  for (const name of wanted) {
    const path = Object.fromEntries(PAGES)[name];
    for (const formFactor of ["mobile", "desktop"]) {
      const settings = formFactor === "desktop"
        ? { formFactor, screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttlingMethod: "simulate" }
        : { formFactor };
      const { lhr } = await lighthouse(url + path, { port, output: "json", logLevel: "error" }, {
        extends: "lighthouse:default",
        settings: { ...settings, onlyCategories: ["performance", "accessibility", "best-practices", "seo"] }
      });
      const s = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
      worst = Math.min(worst, ...Object.values(s));
      rows.push({ page: name, formFactor, ...s });
      const failing = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "manual");
      for (const a of failing) console.log(`  ${name}/${formFactor}: ${a.id} (${a.score}) ${a.displayValue || ""}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.table(rows);
process.exit(worst >= 90 ? 0 : 1);
