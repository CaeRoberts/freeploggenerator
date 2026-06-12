export type SectionType =
  | "flightLog"
  | "checklist"
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
