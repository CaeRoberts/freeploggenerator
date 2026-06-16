import type {
  ChecklistOptions,
  ChecklistPhase,
  PageSide,
  PlogConfig,
  RtCallBlock,
  SectionInstance,
} from "./types";

// A5 portrait in PDF points (1pt = 1/72"), ~5mm margins.
export const PAGE_W = 419.53;
export const PAGE_H = 595.28;
export const MARGIN = 14.17; // 5mm
export const CONTENT_W = PAGE_W - 2 * MARGIN;
export const CONTENT_H = PAGE_H - 2 * MARGIN;

// Shared row/band metrics so the JS overflow estimate matches the PDF.
export const TITLE_BAR_H = 22; // front-page title + header fields band
export const SECTION_HEADER_H = 13; // grey section title band
export const CHECKLIST_ITEM_H = 11.2;
export const CHECKLIST_PHASE_PAD = 2; // heavy rule + breathing room per phase
export const FUEL_ROW_H = 13;
export const COMMS_ROW_H = 13;
export const WRITING_LINE_H = 17;
export const MINIMA_H = 46;
export const SECTION_GAP = 5;
export const FOOTER_H = 11; // attribution strip reserved at the page bottom
export const MM = 72 / 25.4; // mm -> pt
export const DEFAULT_LOGO_W_MM = 42;
export const DEFAULT_LOGO_H_MM = 7;
export const RT_LINE_H = 9.5;
export const RT_BLOCK_TITLE_H = 11;
export const RT_NOTE_H = 9;

export function phaseHeight(phase: ChecklistPhase): number {
  return Math.max(phase.items.length, 1) * CHECKLIST_ITEM_H + CHECKLIST_PHASE_PAD;
}

export function rtBlockHeight(block: RtCallBlock): number {
  return RT_BLOCK_TITLE_H + block.lines.length * RT_LINE_H;
}

/** Split R/T blocks across two columns, minimising the height difference. */
export function balanceRtBlocks(
  blocks: RtCallBlock[]
): [RtCallBlock[], RtCallBlock[]] {
  if (blocks.length <= 1) return [blocks, []];
  const heights = blocks.map(rtBlockHeight);
  const total = heights.reduce((a, b) => a + b, 0);
  let best = blocks.length;
  let bestDiff = Infinity;
  let acc = 0;
  for (let k = 0; k <= blocks.length; k++) {
    const diff = Math.abs(acc - (total - acc));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = k;
    }
    if (k < blocks.length) acc += heights[k];
  }
  return [blocks.slice(0, best), blocks.slice(best)];
}

/**
 * Split phases into two columns, keeping order and phases intact,
 * minimising the height difference between columns.
 */
export function balanceChecklist(
  phases: ChecklistPhase[]
): [ChecklistPhase[], ChecklistPhase[]] {
  if (phases.length === 0) return [[], []];
  const heights = phases.map(phaseHeight);
  const total = heights.reduce((a, b) => a + b, 0);
  let best = phases.length;
  let bestDiff = Infinity;
  let acc = 0;
  for (let k = 0; k <= phases.length; k++) {
    const diff = Math.abs(acc - (total - acc));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = k;
    }
    if (k < phases.length) acc += heights[k];
  }
  return [phases.slice(0, best), phases.slice(best)];
}

export function checklistColumnHeights(
  options: ChecklistOptions
): { col1: number; col2: number } {
  if (options.layout === "two-column") {
    const [a, b] = balanceChecklist(options.phases);
    return {
      col1: a.reduce((s, p) => s + phaseHeight(p), 0),
      col2: b.reduce((s, p) => s + phaseHeight(p), 0),
    };
  }
  const col1 = options.phases.reduce((s, p) => s + phaseHeight(p), 0);
  return { col1, col2: 0 };
}

/**
 * True when the minima box should be absorbed into the shorter checklist
 * column instead of rendering as a standalone section: checklist is
 * two-column, both sections enabled, and on the same page.
 */
export function minimaSlottedIntoChecklist(
  sections: SectionInstance[],
  page: PageSide
): boolean {
  const checklist = sections.find(
    (s) => s.type === "checklist" && s.enabled && s.page === page
  );
  const minima = sections.find(
    (s) => s.type === "minima" && s.enabled && s.page === page
  );
  return Boolean(
    checklist &&
      minima &&
      checklist.type === "checklist" &&
      checklist.options.layout === "two-column"
  );
}

export type FlexKind = "fixed" | "flex";

/** Natural (or fractional) height of a section, excluding the inter-section gap. */
export function sectionHeight(section: SectionInstance): number {
  switch (section.type) {
    case "flightLog":
      return section.options.heightFraction * CONTENT_H;
    case "routeSketch":
      return section.options.heightFraction * CONTENT_H;
    case "checklist": {
      const { col1, col2 } = checklistColumnHeights(section.options);
      const body =
        section.options.layout === "two-column" ? Math.max(col1, col2) : col1;
      return SECTION_HEADER_H + body + 4;
    }
    case "fuelPlan":
      return SECTION_HEADER_H + section.options.rows.length * FUEL_ROW_H;
    case "commsNav":
      return SECTION_HEADER_H + (section.options.rows + 1) * COMMS_ROW_H;
    case "clearance":
    case "notes":
      return SECTION_HEADER_H + section.options.lines * WRITING_LINE_H;
    case "rtCall": {
      const [a, b] = balanceRtBlocks(section.options.blocks);
      const colA = a.reduce((s, bl) => s + rtBlockHeight(bl), 0);
      const colB = b.reduce((s, bl) => s + rtBlockHeight(bl), 0);
      return (
        SECTION_HEADER_H +
        Math.max(colA, colB) +
        (section.options.note ? RT_NOTE_H : 0) +
        6
      );
    }
    case "minima":
      return MINIMA_H;
  }
}

export function pageSections(
  config: PlogConfig,
  page: PageSide
): SectionInstance[] {
  let list = config.sections.filter((s) => s.enabled && s.page === page);
  if (minimaSlottedIntoChecklist(config.sections, page)) {
    list = list.filter((s) => s.type !== "minima");
  }
  return list;
}

/**
 * The one flexible section on a page: the first enabled clearance/notes,
 * else the last stretchable table (fuel plan / comms-nav). It absorbs
 * leftover height. Fraction-sized sections (flight log, route sketch)
 * keep their configured height and never flex.
 */
export function flexSectionId(sections: SectionInstance[]): string | null {
  const writing = sections.find(
    (s) => s.type === "clearance" || s.type === "notes"
  );
  if (writing) return writing.id;
  for (let i = sections.length - 1; i >= 0; i--) {
    const t = sections[i].type;
    if (t === "fuelPlan" || t === "commsNav") return sections[i].id;
  }
  return null;
}

export interface PageLayout {
  sections: SectionInstance[];
  flexId: string | null;
  /** Total natural height including gaps and the front title bar. */
  usedHeight: number;
  overflow: boolean;
}

/** Writing lines can compress to roughly this height when their section flexes. */
const WRITING_LINE_MIN = 9;

/** Logo box in pt (width/height), or null when no logo is set. */
export function logoBox(config: PlogConfig): { w: number; h: number } | null {
  if (!config.logo) return null;
  return {
    w: (config.logoWidth ?? DEFAULT_LOGO_W_MM) * MM,
    h: (config.logoHeight ?? DEFAULT_LOGO_H_MM) * MM,
  };
}

/** Height of the front-page title row, growing to fit a tall logo. */
export function frontTitleHeight(config: PlogConfig): number {
  const box = logoBox(config);
  return box ? Math.max(TITLE_BAR_H, box.h + 2) : TITLE_BAR_H;
}

export function computePageLayout(
  config: PlogConfig,
  page: PageSide
): PageLayout {
  const sections = pageSections(config, page);
  const flexId = flexSectionId(sections);
  const top = page === "front" ? frontTitleHeight(config) + SECTION_GAP : 0;
  const gaps = Math.max(sections.length - 1, 0) * SECTION_GAP;
  const total =
    top +
    gaps +
    sections.reduce((sum, s) => {
      // A flexible writing section squeezes its dotted lines to fit, so
      // count it at its minimum height rather than its natural one.
      if (s.id === flexId && (s.type === "clearance" || s.type === "notes")) {
        return sum + SECTION_HEADER_H + s.options.lines * WRITING_LINE_MIN;
      }
      return sum + sectionHeight(s);
    }, 0);
  // The attribution footer reserves a strip at the bottom of every page.
  return {
    sections,
    flexId,
    usedHeight: total,
    overflow: total > CONTENT_H - FOOTER_H + 1,
  };
}
