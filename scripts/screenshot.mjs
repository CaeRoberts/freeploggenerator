/** Dev helper: serve ./out and capture screenshots. Usage: node scripts/screenshot.mjs [path] [outfile] [width] [height] */
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import puppeteer from "puppeteer";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".ico": "image/x-icon", ".txt": "text/plain", ".svg": "image/svg+xml" };
const root = join(process.cwd(), "out");

const server = http.createServer(async (req, res) => {
  let path = req.url.split("?")[0].split("#")[0];
  if (path.endsWith("/")) path += "index.html";
  if (!extname(path)) path += ".html";
  try {
    const data = await readFile(join(root, path));
    res.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});

const pagePath = process.argv[2] ?? "/";
const outfile = process.argv[3] ?? "/tmp/shot.png";
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);

await new Promise((r) => server.listen(4173, r));
const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("console error:", m.text()); });
page.on("pageerror", (e) => console.log("page error:", e.message));
await page.setViewport({ width, height });
await page.goto(`http://localhost:4173${pagePath}`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: outfile, fullPage: false });
console.log(outfile);
await browser.close();
server.close();
