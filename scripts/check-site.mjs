#!/usr/bin/env node
// Site check: run before every commit.  node scripts/check-site.mjs
// Fails (exit 1) on: broken internal links/assets, files named in content.js that do not exist,
// images without alt text, the society's former name anywhere in the site.
// Warns (exit 0) on: "[TO ADD" placeholders.
// Writes the result to .site-check/last.json for the build-panel mod.
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative, resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FORMER_NAME = ["Finance & Research Club", "Finance &amp; Research Club"];
const SCAN_EXT = new Set([".html", ".js", ".css", ".md", ".xml", ".txt", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "screenshots", ".site-check", "mods"]);

const errors = [];
const warnings = [];
const rel = (f) => relative(ROOT, f).split(sep).join("/");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = walk(ROOT);
// Site pages only: HTML under scripts/ (e.g. the social banner source) is tooling, not a page.
const htmlFiles = files.filter((f) => f.endsWith(".html") && !rel(f).startsWith("scripts/"));

// Resolve a site URL path (as served) to a file on disk.
function resolveTarget(fromFile, href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return fromFile; // pure #anchor
  const base = clean.startsWith("/") ? join(ROOT, clean) : join(dirname(fromFile), clean);
  if (clean.endsWith("/") || (existsSync(base) && statSync(base).isDirectory())) return join(base, "index.html");
  return base;
}

// 1. Internal links and assets in HTML; alt text on <img>.
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(url)) continue;
    const target = resolveTarget(f, url);
    if (!existsSync(target)) errors.push(`${rel(f)}: broken link "${url}"`);
  }
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url && !existsSync(resolveTarget(f, url))) errors.push(`${rel(f)}: broken srcset "${url}"`);
    }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) errors.push(`${rel(f)}: <img> without alt: ${m[0].slice(0, 80)}`);
  }
}

// 2. content.js: every referenced file exists; every photo has alt text; ids unique.
let site;
try {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(join(ROOT, "js/content.js"), "utf8"), ctx);
  site = ctx.window.SITE;
} catch (e) {
  errors.push(`js/content.js does not parse: ${e.message}`);
}
if (site) {
  const need = (p, where) => {
    if (!p || /^https?:/.test(p)) return;
    if (!existsSync(join(ROOT, p))) errors.push(`content.js ${where}: file not found "${p}"`);
  };
  const ids = new Set();
  for (const e of site.events || []) {
    if (ids.has(e.id)) errors.push(`content.js event id "${e.id}" is used twice`);
    ids.add(e.id);
    for (const a of e.attachments || []) need(a.href, `event "${e.id}" attachment`);
    for (const p of e.photos || []) {
      need(p.src, `event "${e.id}" photo`);
      if (!p.alt || !p.alt.trim()) errors.push(`content.js event "${e.id}": photo "${p.src}" has no alt text`);
    }
    if (e.date && !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) errors.push(`content.js event "${e.id}": date must be YYYY-MM-DD`);
  }
  for (const p of site.team || []) need(p.photo, `team "${p.name}" photo`);
  for (const r of site.research || []) {
    need(r.file, `research "${r.title}"`);
    for (const k of ["title", "authors", "date", "takeaway"]) if (!r[k] || !r[k].length) errors.push(`content.js research "${r.title || "?"}": missing ${k}`);
  }
}

// 3. Former name (fail) and placeholders (warn), across all text files.
for (const f of files) {
  if (!SCAN_EXT.has(extname(f)) || f.endsWith("check-site.mjs")) continue;
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const n of FORMER_NAME) if (line.includes(n)) errors.push(`${rel(f)}:${i + 1}: contains the former name`);
    if (line.includes("[TO ADD") && !f.endsWith("README.md")) warnings.push(`${rel(f)}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}

// 4. Every page has the required head tags.
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  const is404 = f.endsWith("404.html");
  for (const [label, re] of [
    ["<title>", /<title>[^<]+<\/title>/],
    ["meta description", /<meta name="description"/],
    ["og:title", /property="og:title"/],
    ["og:image", /property="og:image"/],
    ["twitter:card", /name="twitter:card"/],
    ["canonical", /rel="canonical"/]
  ]) {
    if (is404 && label === "canonical") continue;
    if (!re.test(html)) errors.push(`${rel(f)}: missing ${label}`);
  }
}

const ok = errors.length === 0;
const result = { ok, at: new Date().toISOString(), errors, warnings, placeholders: warnings.length, pages: htmlFiles.length };
mkdirSync(join(ROOT, ".site-check"), { recursive: true });
writeFileSync(join(ROOT, ".site-check/last.json"), JSON.stringify(result, null, 2));

for (const w of warnings) console.log("warn  " + w);
for (const e of errors) console.log("ERROR " + e);
console.log(`\n${ok ? "PASS" : "FAIL"}: ${htmlFiles.length} pages, ${errors.length} errors, ${warnings.length} placeholder warnings`);
process.exit(ok ? 0 : 1);
