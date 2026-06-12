/** Dev e2e check: persistence, share URL round-trip, export modal. */
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import puppeteer from "puppeteer";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
const root = join(process.cwd(), "out");
const server = http.createServer(async (req, res) => {
  let p = req.url.split("?")[0].split("#")[0];
  if (p.endsWith("/")) p += "index.html";
  if (!extname(p)) p += ".html";
  try {
    const data = await readFile(join(root, p));
    res.writeHead(200, { "content-type": MIME[extname(p)] ?? "application/octet-stream" });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(4174, r));

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const results = [];
const check = (name, ok) => { results.push(`${ok ? "PASS" : "FAIL"}  ${name}`); };

const ctx = await browser.createBrowserContext();
await browser.defaultBrowserContext().overridePermissions("http://localhost:4174", ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:4174/", { waitUntil: "networkidle0" });
await page.waitForSelector('input[aria-label="PLOG title"]');

// 1. edit title, reload, expect persistence
await page.click('input[aria-label="PLOG title"]');
await page.keyboard.down("Control");
await page.keyboard.press("a");
await page.keyboard.up("Control");
await page.type('input[aria-label="PLOG title"]', "TEST PLOG 99");
await new Promise((r) => setTimeout(r, 300));
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector('input[aria-label="PLOG title"]');
const title = await page.$eval('input[aria-label="PLOG title"]', (el) => el.value);
check("localStorage persistence restores edited title", title === "TEST PLOG 99");

// 2. share URL reproduces config in a fresh context
await page.evaluate(() => navigator.clipboard.writeText(""));
await page.click("xpath/.//button[contains(., 'Share layout')]");
await new Promise((r) => setTimeout(r, 300));
const url = await page.evaluate(() => navigator.clipboard.readText());
check("share button produces #c= URL", url.includes("#c="));
const fresh = await ctx.newPage();
await fresh.goto(url, { waitUntil: "networkidle0" });
await fresh.waitForSelector('input[aria-label="PLOG title"]');
const freshTitle = await fresh.$eval('input[aria-label="PLOG title"]', (el) => el.value);
check("shared URL reproduces layout in fresh context", freshTitle === "TEST PLOG 99");

// 3. export modal opens, download produces a PDF
const client = await page.createCDPSession();
await client.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: "/tmp/plogtest" });
await page.click("xpath/.//button[contains(., 'Download PDF')]");
await page.waitForSelector('[role="dialog"]');
const note = await page.$eval('[role="dialog"]', (el) => el.textContent);
check("export modal shows duplex note", note.includes("flip on long edge"));
await page.click('xpath/.//div[@role="dialog"]//button[contains(., "Download PDF")]');
await new Promise((r) => setTimeout(r, 2500));
const saved = await page.$eval('[role="dialog"]', (el) => el.textContent);
check("download completes (button reports saved)", saved.includes("Saved"));

// 4. template switch via dropdown
page.on("dialog", (d) => d.accept());
await page.select('select[aria-label="Apply a template"]', "vfr");
await new Promise((r) => setTimeout(r, 500));
const vfrTitle = await page.$eval('input[aria-label="PLOG title"]', (el) => el.value);
check("VFR template applies", vfrTitle === "VFR PLOG");

console.log(results.join("\n"));
await browser.close();
server.close();
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
