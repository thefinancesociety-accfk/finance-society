// Tiny static server for local checks (mirrors Cloudflare Pages: folder -> index.html, unknown -> 404.html).
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".pdf": "application/pdf", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};

export function serve(port = 0) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    let file = join(ROOT, path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      let body = await readFile(file);
      const type = TYPES[extname(file)] || "application/octet-stream";
      const headers = { "content-type": type, "cache-control": "public, max-age=604800" };
      // Compress text like Cloudflare does, so local audits reflect production.
      if (/text|javascript|xml/.test(type) && /gzip/.test(req.headers["accept-encoding"] || "")) {
        body = gzipSync(body);
        headers["content-encoding"] = "gzip";
      }
      res.writeHead(200, headers);
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      res.end(await readFile(join(ROOT, "404.html")));
    }
  });
  return new Promise((ok) => server.listen(port, "127.0.0.1", () => ok({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

export const PAGES = [
  ["home", "/"], ["about", "/about/"], ["team", "/team/"], ["events", "/events/"],
  ["research", "/research/"], ["join", "/join/"], ["contact", "/contact/"], ["404", "/missing-page"]
];

export const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
