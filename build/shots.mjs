// Screenshots of the built site (dist/) for a review e-mail: desktop 1440×900 and a phone (Pixel 7) per target.
//   node build/shots.mjs --out <dir> index.html#projects cs/index.html#contact privacy.html
// Serves dist/ itself (no vite needed), shows everything at once (reduced motion: no half-finished animations)
// and writes JPEGs named NN-<desktop|phone>-<page>-<anchor>.jpg. Used by the Sajtik agent (mail-orchestrator).
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const BASE = "/posmtrade-public-site/";
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
if (outIdx < 0 || !args[outIdx + 1]) {
  console.error("usage: node build/shots.mjs --out <dir> <page[#anchor]>...");
  process.exit(2);
}
const out = args[outIdx + 1];
const targets = args.filter((_, i) => i !== outIdx && i !== outIdx + 1);
if (!targets.length) targets.push("index.html");
if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/ is missing – run npm run build first");
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".json": "application/json" };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  if (!url.startsWith(BASE)) return res.writeHead(404).end();
  let file = normalize(join(dist, url.slice(BASE.length)));
  if (!file.startsWith(dist)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}${BASE}`;

const browser = await chromium.launch();
const written = [];
let n = 0;
for (const target of targets) {
  const [page, anchor = ""] = target.split("#");
  for (const [kind, opts] of [
    ["desktop", { viewport: { width: 1440, height: 900 } }],
    ["phone", { ...devices["Pixel 7"] }],
  ]) {
    const ctx = await browser.newContext({ ...opts, reducedMotion: "reduce" });
    const tab = await ctx.newPage();
    await tab.goto(origin + (page || "index.html"), { waitUntil: "load" });
    const name = `${String(++n).padStart(2, "0")}-${kind}-${(page || "index").replace(/[/.]/g, "-")}${anchor ? `-${anchor}` : ""}.jpg`;
    const section = anchor ? tab.locator(`#${anchor}`).first() : null;
    await tab.waitForTimeout(400);
    if (section && (await section.count())) {
      // the whole section, so a change at its end (e.g. the office line under the contacts) is in the picture
      await tab.addStyleTag({ content: ".site-header{position:static!important}.skip-link,.scroll-progress{display:none!important}" });
      await section.screenshot({ path: join(out, name), type: "jpeg", quality: 80 });
    } else {
      await tab.screenshot({ path: join(out, name), type: "jpeg", quality: 80 });
    }
    written.push(join(out, name));
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(JSON.stringify({ shots: written }));
