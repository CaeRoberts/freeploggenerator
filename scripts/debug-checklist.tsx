import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { PlogDocument } from "../components/pdf/PlogDocument";
import { vfrTemplate } from "../lib/templates";

const cfg = vfrTemplate();
// keep only the checklist on the front to isolate the bug
cfg.sections = cfg.sections.map((s) => ({ ...s, enabled: s.type === "checklist" }));
renderToFile(<PlogDocument config={cfg} />, "/tmp/plogtest/checklist.pdf").then(() => console.log("ok"));
