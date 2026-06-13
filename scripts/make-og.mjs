/** Generates public/og.png — the social share card. */
import puppeteer from "puppeteer";
import { join } from "node:path";
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body { background:#faf8f3; color:#1a1817; font-family: Georgia, 'Times New Roman', serif;
    display:flex; align-items:center; justify-content:center; }
  .card { width:1120px; height:550px; border:2px solid #1a1817; padding:64px 72px;
    display:flex; flex-direction:column; justify-content:space-between; position:relative; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; }
  .kicker { font-family:'JetBrains Mono', ui-monospace, monospace; font-size:20px; letter-spacing:3px;
    text-transform:uppercase; color:#8a8378; }
  .navy { width:64px; height:8px; background:#1b2a4a; }
  .word { font-size:108px; line-height:1; letter-spacing:-2px; }
  .tag { font-family: Helvetica, Arial, sans-serif; font-size:30px; color:#4a4641; margin-top:22px; max-width:820px; line-height:1.35; }
  .foot { display:flex; justify-content:space-between; align-items:flex-end; }
  .foot .mono { font-family:'JetBrains Mono', ui-monospace, monospace; font-size:20px; color:#8a8378; letter-spacing:1px; }
  .url { font-family: Helvetica, Arial, sans-serif; font-size:22px; color:#1b2a4a; font-weight:600; }
</style></head><body>
  <div class="card">
    <div class="top"><div class="kicker">kneeboard plog builder</div><div class="navy"></div></div>
    <div>
      <div class="word">freeploggenerator</div>
      <div class="tag">Design a custom pilot's log and download it as a print-ready A5 PDF. Flight log, checklists, fuel plan &amp; frequencies — free, no sign-up.</div>
    </div>
    <div class="foot"><div class="mono">A5 · 148 × 210 mm · duplex bottom-flip</div><div class="url">freeploggenerator.com</div></div>
  </div>
</body></html>`;
const browser = await puppeteer.launch({ args:["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width:1200, height:630, deviceScaleFactor:1 });
await page.setContent(html, { waitUntil:"networkidle0" });
await page.screenshot({ path: join(process.cwd(),"public","og.png") });
console.log("wrote public/og.png");
await browser.close();
