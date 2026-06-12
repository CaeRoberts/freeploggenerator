/** Dev smoke test: renders each template to /tmp so layout changes can be eyeballed. */
import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { PlogDocument } from "../components/pdf/PlogDocument";
import { ifrTemplate, vfrTemplate, blankTemplate } from "../lib/templates";

async function main() {
  await renderToFile(<PlogDocument config={ifrTemplate()} />, "/tmp/plogtest/ifr.pdf");
  await renderToFile(<PlogDocument config={vfrTemplate()} />, "/tmp/plogtest/vfr.pdf");
  await renderToFile(<PlogDocument config={blankTemplate()} />, "/tmp/plogtest/blank.pdf");
  console.log("rendered OK");
}
main().catch((e) => { console.error(e); process.exit(1); });
