/** Dev helper: convert a PDF to PNGs for visual inspection. */
import { pdfToPng } from "pdf-to-png-converter";
import { writeFileSync } from "node:fs";

async function main() {
  const file = process.argv[2];
  const pages = await pdfToPng(file, { viewportScale: 2 });
  for (const p of pages) {
    const out = file.replace(/\.pdf$/, `-p${p.pageNumber}.png`);
    if (p.content) writeFileSync(out, p.content);
    console.log(out);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
