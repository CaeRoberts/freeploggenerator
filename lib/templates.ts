import type {
  ChecklistPhase,
  ColumnDef,
  PlogConfig,
  SectionInstance,
} from "./types";

let uid = 0;
/**
 * Collision-proof id. Prefers crypto.randomUUID (unique across sessions,
 * shares and imports); falls back to time + randomness + a counter for
 * non-secure contexts. The old counter-only scheme replayed the same
 * sequence on every page load, so cross-session ids could collide — which
 * broke React keys and duplicated rows when reordering.
 */
const id = (prefix: string) => {
  const g = typeof globalThis !== "undefined" ? globalThis : undefined;
  if (g?.crypto?.randomUUID) return `${prefix}-${g.crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

export const newId = id;

function cols(labels: string[], shadedLabels: string[] = []): ColumnDef[] {
  return labels.map((label) => ({
    id: id("col"),
    label,
    shaded: shadedLabels.includes(label),
  }));
}

function phases(
  data: [string, [string, string][]][]
): ChecklistPhase[] {
  return data.map(([name, items]) => ({
    id: id("ph"),
    name,
    items: items.map(([label, action]) => ({ id: id("it"), label, action })),
  }));
}

const IFR_PHASES: [string, [string, string][]][] = [
  [
    "AFTER T/O",
    [
      ["Gear", "UP"],
      ["Flaps", "UP"],
      ["Landing light", "A/R"],
    ],
  ],
  [
    "CLIMB",
    [
      ["Power", "CHECK"],
      ["EIS", "CHECK"],
      ["OAT", "CHECK"],
      ["Ice", "CHECK"],
    ],
  ],
  [
    "ICE DRILL",
    [
      ["Pitot heat", "ON"],
      ["De-ice", "NORM–A/R"],
      ["Ice light", "A/R"],
      ["Cabin heat & defrost", "ON"],
      ["Windshield de-ice", "A/R"],
    ],
  ],
  [
    "CRUISE",
    [
      ["Fuel", "CHECK"],
      ["Radios", "SET"],
      ["EIS", "CHECK"],
      ["Ice", "CHECK"],
      ["De-ice contents", "CHECK"],
    ],
  ],
  [
    "DESCENT",
    [
      ["Landing data", "RECEIVED"],
      ["Altimeters", "SET"],
      ["COM/NAV/FMS", "SET"],
      ["Approach brief", "COMPLETED"],
      ["Seatbelts", "SECURE"],
    ],
  ],
  [
    "APPROACH",
    [
      ["Landing/taxi lights", "ON"],
      ["Fuel selectors", "ON"],
      ["Parking brake", "OFF"],
    ],
  ],
  [
    "FINAL",
    [
      ["Gear", "DOWN"],
      ["Flaps", "APP"],
      ["Parking brake", "OFF"],
    ],
  ],
  [
    "LANDING",
    [
      ["Gear", "DOWN"],
      ["Flaps", "LDG"],
      ["Rudder trim", "NEUTRAL"],
      ["Parking brake", "OFF"],
    ],
  ],
  [
    "GO AROUND",
    [
      ["Power", "MAX"],
      ["Flaps", "APP"],
      ["Gear", "UP"],
      ["Flaps", "UP"],
      ["Landing/taxi light", "A/R"],
    ],
  ],
];

const VFR_PHASES: [string, [string, string][]][] = [
  [
    "AFTER T/O",
    [
      ["Flaps", "UP"],
      ["Landing light", "A/R"],
      ["Engine Ts & Ps", "CHECK"],
    ],
  ],
  [
    "CRUISE — FREDA",
    [
      ["Fuel", "CHECK"],
      ["Radio", "SET"],
      ["Engine Ts & Ps", "CHECK"],
      ["DI", "ALIGNED"],
      ["Altimeter", "SET"],
    ],
  ],
  [
    "DESCENT",
    [
      ["ATIS/Weather", "NOTED"],
      ["Altimeter", "SET"],
      ["Approach/join", "PLANNED"],
    ],
  ],
  [
    "PRE-LANDING — BUMFICHH",
    [
      ["Brakes", "CHECKED"],
      ["Undercarriage", "DOWN"],
      ["Mixture", "RICH"],
      ["Fuel", "ON & SUFFICIENT"],
      ["Instruments", "SET"],
      ["Carb heat", "A/R"],
      ["Hatches", "SECURE"],
      ["Harnesses", "SECURE"],
    ],
  ],
  [
    "GO AROUND",
    [
      ["Power", "FULL"],
      ["Attitude", "SET"],
      ["Flaps", "RETRACT IN STAGES"],
    ],
  ],
];

const FUEL_ROWS: [string, boolean][] = [
  ["Start / taxi", false],
  ["Dep to dest", false],
  ["Div (30 min)", false],
  ["Hold (45 min)", false],
  ["Cont 5%", false],
  ["Total req", true],
  ["Total carried", true],
];

function fuelRows() {
  return FUEL_ROWS.map(([label, bold]) => ({ id: id("fr"), label, bold }));
}

export function ifrTemplate(): PlogConfig {
  const sections: SectionInstance[] = [
    {
      id: id("sec"),
      type: "flightLog",
      enabled: true,
      page: "front",
      options: {
        rows: 12,
        columns: cols(
          ["FROM", "TO", "MSA", "ALT", "TRK", "WIND", "HDG (M)", "DIST", "TIME", "ETA", "ATA", "FUEL"],
          ["HDG (M)"]
        ),
        heightFraction: 0.5,
      },
    },
    {
      id: id("sec"),
      type: "checklist",
      enabled: true,
      page: "front",
      options: { layout: "two-column", phases: phases(IFR_PHASES) },
    },
    {
      id: id("sec"),
      type: "minima",
      enabled: true,
      page: "front",
      options: {},
    },
    {
      id: id("sec"),
      type: "routeSketch",
      enabled: true,
      page: "back",
      options: { heightFraction: 0.35 },
    },
    {
      id: id("sec"),
      type: "clearance",
      enabled: true,
      page: "back",
      options: { lines: 6 },
    },
    {
      id: id("sec"),
      type: "fuelPlan",
      enabled: true,
      page: "back",
      options: { rows: fuelRows() },
    },
    {
      id: id("sec"),
      type: "commsNav",
      enabled: true,
      page: "back",
      options: { rows: 9 },
    },
    {
      id: id("sec"),
      type: "notes",
      enabled: false,
      page: "back",
      options: { lines: 5 },
    },
  ];
  return {
    version: 1,
    title: "IFR PLOG",
    pageSize: "A5",
    invertBack: true,
    headerFields: ["C/S", "Date", "A/C"],
    sections,
  };
}

export function vfrTemplate(): PlogConfig {
  const sections: SectionInstance[] = [
    {
      id: id("sec"),
      type: "flightLog",
      enabled: true,
      page: "front",
      options: {
        rows: 8,
        columns: cols(
          ["FROM", "TO", "SAFE ALT", "ALT", "TRK", "WIND", "HDG (M)", "DIST", "TIME", "ETA", "ATA", "FUEL"],
          ["HDG (M)"]
        ),
        heightFraction: 0.4,
      },
    },
    {
      id: id("sec"),
      type: "checklist",
      enabled: true,
      page: "front",
      options: { layout: "one-column", phases: phases(VFR_PHASES) },
    },
    {
      id: id("sec"),
      type: "routeSketch",
      enabled: true,
      page: "back",
      options: { heightFraction: 0.5 },
    },
    {
      id: id("sec"),
      type: "fuelPlan",
      enabled: true,
      page: "back",
      options: { rows: fuelRows() },
    },
    {
      id: id("sec"),
      type: "commsNav",
      enabled: true,
      page: "back",
      options: { rows: 5 },
    },
    {
      id: id("sec"),
      type: "notes",
      enabled: true,
      page: "back",
      options: { lines: 4 },
    },
    {
      id: id("sec"),
      type: "clearance",
      enabled: false,
      page: "back",
      options: { lines: 5 },
    },
    {
      id: id("sec"),
      type: "minima",
      enabled: false,
      page: "front",
      options: {},
    },
  ];
  return {
    version: 1,
    title: "VFR PLOG",
    pageSize: "A5",
    invertBack: true,
    headerFields: ["C/S", "Date", "A/C"],
    sections,
  };
}

export function blankTemplate(): PlogConfig {
  const sections: SectionInstance[] = [
    {
      id: id("sec"),
      type: "flightLog",
      enabled: true,
      page: "front",
      options: {
        rows: 12,
        columns: cols(
          ["FROM", "TO", "MSA", "ALT", "TRK", "WIND", "HDG (M)", "DIST", "TIME", "ETA", "ATA", "FUEL"],
          ["HDG (M)"]
        ),
        heightFraction: 0.5,
      },
    },
    {
      id: id("sec"),
      type: "checklist",
      enabled: false,
      page: "front",
      options: { layout: "one-column", phases: [] },
    },
    {
      id: id("sec"),
      type: "minima",
      enabled: false,
      page: "front",
      options: {},
    },
    {
      id: id("sec"),
      type: "fuelPlan",
      enabled: false,
      page: "back",
      options: { rows: fuelRows() },
    },
    {
      id: id("sec"),
      type: "commsNav",
      enabled: false,
      page: "back",
      options: { rows: 9 },
    },
    {
      id: id("sec"),
      type: "routeSketch",
      enabled: false,
      page: "back",
      options: { heightFraction: 0.35 },
    },
    {
      id: id("sec"),
      type: "clearance",
      enabled: false,
      page: "back",
      options: { lines: 6 },
    },
    {
      id: id("sec"),
      type: "notes",
      enabled: false,
      page: "back",
      options: { lines: 6 },
    },
  ];
  return {
    version: 1,
    title: "PLOG",
    pageSize: "A5",
    invertBack: true,
    headerFields: ["C/S", "Date", "A/C"],
    sections,
  };
}

export type TemplateId = "ifr" | "vfr" | "blank";

export const TEMPLATES: { id: TemplateId; name: string; build: () => PlogConfig }[] = [
  { id: "ifr", name: "IFR Template", build: ifrTemplate },
  { id: "vfr", name: "VFR Template", build: vfrTemplate },
  { id: "blank", name: "Blank canvas", build: blankTemplate },
];
