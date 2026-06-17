export type SectionType =
  | "flightLog"
  | "checklist"
  | "rtCall"
  | "fuelPlan"
  | "commsNav"
  | "clearance"
  | "routeSketch"
  | "minima"
  | "notes";

export type PageSide = "front" | "back";

export interface ColumnDef {
  id: string;
  label: string;
  shaded: boolean;
}

export interface FlightLogOptions {
  rows: number; // 4–16
  columns: ColumnDef[];
  heightFraction: number; // 0.3–0.6 of page height
  /** Pre-filled cell text, keyed by `${columnId}:${rowIndex}`. */
  values?: Record<string, string>;
}

export interface ChecklistItem {
  id: string;
  label: string;
  action: string;
}

export interface ChecklistPhase {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistOptions {
  layout: "one-column" | "two-column";
  phases: ChecklistPhase[];
}

export interface FuelPlanRow {
  id: string;
  label: string;
  bold: boolean;
}

export interface FuelPlanOptions {
  rows: FuelPlanRow[];
}

export interface CommsNavOptions {
  rows: number;
  /** Pre-filled cell text, keyed by `${col}:${rowIndex}` (col = station|freq|id). */
  values?: Record<string, string>;
}

/** One labelled blank: a bold prompt, a dotted fill, and a faint hint. */
export interface RtCallField {
  label: string; // e.g. "from", "level"
  hint: string; // faint guidance in parentheses, e.g. "departure"; "" for none
}

export interface RtCallLine {
  id: string;
  /** Plain line with no blanks (e.g. "VFR / IFR / SVFR*"); takes precedence. */
  text?: string;
  /** One or two labelled fill-in fields rendered left to right. */
  fields?: RtCallField[];
}

export interface RtCallBlock {
  id: string;
  title: string; // e.g. "ZONE TRANSIT REQUEST"
  lines: RtCallLine[];
}

/** A CAP413-style radio-telephony call card with fill-in prompts. */
export interface RtCallOptions {
  blocks: RtCallBlock[];
  note: string; // footer reference, e.g. "Full phraseology: CAP413."
}

export interface LinesOptions {
  lines: number;
}

export interface RouteSketchOptions {
  heightFraction: number; // 0.2–0.6
}

export type MinimaOptions = Record<string, never>;

interface SectionBase {
  id: string;
  enabled: boolean;
  page: PageSide;
}

export type SectionInstance = SectionBase &
  (
    | { type: "flightLog"; options: FlightLogOptions }
    | { type: "checklist"; options: ChecklistOptions }
    | { type: "rtCall"; options: RtCallOptions }
    | { type: "fuelPlan"; options: FuelPlanOptions }
    | { type: "commsNav"; options: CommsNavOptions }
    | { type: "clearance"; options: LinesOptions }
    | { type: "notes"; options: LinesOptions }
    | { type: "routeSketch"; options: RouteSketchOptions }
    | { type: "minima"; options: MinimaOptions }
  );

export interface PlogConfig {
  version: 1;
  title: string;
  /**
   * Optional logo (a downscaled PNG data URL) shown in place of the title
   * text on the card — e.g. a flight school's branding. Kept on-device and
   * in JSON export / PDF, but omitted from share links to keep them short.
   */
  logo?: string;
  logoWidth?: number; // logo box width in mm
  logoHeight?: number; // logo box height in mm
  pageSize: "A5" | "FLYBOYS_5x8"; // A5 shipped first; enum ready for 5"x8"
  invertBack: boolean; // the bottom-flip trick
  headerFields: string[];
  sections: SectionInstance[];
}

/**
 * Output format chosen at download time (not part of the saved design):
 * - duplexA5: two A5 pages, back rotated per invertBack — print double-sided.
 * - sideBySideA4: one A4-landscape sheet with the two A5 pages side by side —
 *   print single-sided, then cut down the middle.
 */
export type ExportLayout = "duplexA5" | "sideBySideA4";

export const SECTION_LABELS: Record<SectionType, string> = {
  flightLog: "Flight log",
  checklist: "Checklist",
  rtCall: "R/T calls",
  fuelPlan: "Fuel plan",
  commsNav: "Comms / Nav",
  clearance: "Clearance / ATIS",
  routeSketch: "Route sketch",
  minima: "Minima",
  notes: "Notes",
};

export const STANDARD_COLUMNS = [
  "FROM",
  "TO",
  "MSA",
  "ALT",
  "TRK",
  "WIND",
  "HDG (M)",
  "DIST",
  "TIME",
  "ETA",
  "ATA",
  "FUEL",
] as const;
