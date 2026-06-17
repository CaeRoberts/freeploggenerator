import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  ChecklistOptions,
  ChecklistPhase,
  ColumnDef,
  CommsNavOptions,
  ExportLayout,
  FlightLogOptions,
  FuelPlanOptions,
  LinesOptions,
  PageSide,
  PlogConfig,
  RouteSketchOptions,
  RtCallBlock,
  RtCallField,
  RtCallOptions,
  SectionInstance,
} from "@/lib/types";
import {
  CONTENT_H,
  CONTENT_W,
  FOOTER_H,
  MARGIN,
  MINIMA_H,
  PAGE_H,
  PAGE_W,
  SECTION_GAP,
  balanceChecklist,
  balanceRtBlocks,
  checklistColumnHeights,
  flexSectionId,
  frontTitleHeight,
  logoBox,
  minimaSlottedIntoChecklist,
  pageSections,
} from "@/lib/metrics";

const SITE = "www.freeploggenerator.com";

const INK = "#111111";
const BAND = "#d8d8d8";
const SHADE = "#ebebeb";
const HAIR = "#aaaaaa";
const FAINT = "#bbbbbb";

const HEAVY = 1.1;
const THIN = 0.4;

// A4 landscape (pts). Two A5 portrait halves (2 × 419.53 = 839.06) sit side
// by side with ~1.4pt slack each side.
const A4L_W = 841.89;
const A4L_H = 595.28;

const styles = StyleSheet.create({
  page: {
    padding: MARGIN,
    fontFamily: "Helvetica",
    fontSize: 6.5,
    color: INK,
    backgroundColor: "#ffffff",
  },
  // Fixed-size box that anchors the 180° back-page rotation to the page
  // centre. Content is an absolutely-positioned child so it flows at its
  // natural height — when it overflows, the page edge clips it instead of
  // react-pdf collapsing the flex rows (which blanked the checklist).
  stage: {
    width: CONTENT_W,
    height: CONTENT_H,
  },
  flow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CONTENT_W,
    // Fills the page (minus the footer strip) so the flexible section can
    // grow, yet can exceed it (clipped by the page edge) without collapsing
    // when content overflows.
    minHeight: CONTENT_H - FOOTER_H,
    flexDirection: "column",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_H,
    borderTopWidth: 0.4,
    borderTopColor: HAIR,
    paddingTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  band: {
    backgroundColor: BAND,
    borderWidth: HEAVY,
    borderColor: INK,
    borderBottomWidth: 0,
    paddingVertical: 2.2,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.8,
    letterSpacing: 0.6,
  },
  boxed: {
    borderWidth: HEAVY,
    borderColor: INK,
  },
});

function SectionBand({ title }: { title: string }) {
  return <Text style={styles.band}>{title}</Text>;
}

/* ----------------------------- title bar ----------------------------- */

function TitleBar({ config }: { config: PlogConfig }) {
  const logo = logoBox(config);
  return (
    <View
      style={{
        height: frontTitleHeight(config),
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: SECTION_GAP,
      }}
    >
      {config.logo && logo ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          src={config.logo}
          style={{ width: logo.w, height: logo.h, objectFit: "contain" }}
        />
      ) : (
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: 1 }}>
          {config.title}
        </Text>
      )}
      <View style={{ flexDirection: "row" }}>
        {config.headerFields.map((field, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginLeft: 10,
              width: 72,
              borderBottomWidth: THIN,
              borderBottomColor: INK,
              paddingBottom: 1,
            }}
          >
            <Text style={{ fontSize: 5.5, color: "#555555" }}>{field}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ----------------------------- flight log ---------------------------- */

const COLUMN_FLEX: Record<string, number> = {
  FROM: 1.7,
  TO: 1.7,
  WIND: 1.25,
  "HDG (M)": 1.15,
  ETA: 1.05,
  ATA: 1.05,
};

function FlightLog({ options }: { options: FlightLogOptions }) {
  const columns = options.columns;
  const flex = (c: ColumnDef) => COLUMN_FLEX[c.label] ?? 1;
  return (
    <View
      style={[
        styles.boxed,
        { height: options.heightFraction * CONTENT_H, flexDirection: "column" },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: BAND,
          borderBottomWidth: HEAVY,
          borderBottomColor: INK,
          minHeight: 13,
          alignItems: "center",
        }}
      >
        {columns.map((c, i) => (
          <View
            key={c.id}
            style={{
              flex: flex(c),
              borderRightWidth: i < columns.length - 1 ? THIN : 0,
              borderRightColor: INK,
              alignSelf: "stretch",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 5.8,
                textAlign: "center",
              }}
            >
              {c.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexGrow: 1, flexDirection: "column" }}>
        {Array.from({ length: options.rows }).map((_, r) => (
          <View
            key={r}
            style={{
              flexGrow: 1,
              flexBasis: 0,
              flexDirection: "row",
              borderBottomWidth: r < options.rows - 1 ? THIN : 0,
              borderBottomColor: HAIR,
            }}
          >
            {columns.map((c, i) => {
              const val = options.values?.[`${c.id}:${r}`];
              return (
                <View
                  key={c.id}
                  style={{
                    flex: flex(c),
                    borderRightWidth: i < columns.length - 1 ? THIN : 0,
                    borderRightColor: HAIR,
                    backgroundColor: c.shaded ? SHADE : undefined,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 1,
                  }}
                >
                  {val ? (
                    <Text style={{ fontSize: 6, textAlign: "center" }}>{val}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ----------------------------- checklist ----------------------------- */

function PhaseBlock({ phase, last }: { phase: ChecklistPhase; last: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexShrink: 0,
        borderBottomWidth: last ? 0 : HEAVY,
        borderBottomColor: INK,
      }}
    >
      <View
        style={{
          width: 56,
          borderRightWidth: THIN,
          borderRightColor: INK,
          paddingTop: 1.5,
          paddingHorizontal: 2.5,
        }}
      >
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 5.6 }}>
          {phase.name}
        </Text>
      </View>
      <View style={{ flexGrow: 1, flexBasis: 0 }}>
        {phase.items.map((item, i) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              flexShrink: 0,
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: 11.2,
              paddingHorizontal: 3,
              borderBottomWidth: i < phase.items.length - 1 ? 0.3 : 0,
              borderBottomColor: "#cccccc",
            }}
          >
            <Text style={{ fontSize: 6.3 }}>{item.label}</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6.3 }}>
              {item.action}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MinimaBox({ slim }: { slim?: boolean }) {
  return (
    <View
      style={[
        styles.boxed,
        slim
          ? { flexGrow: 1, minHeight: 30, marginTop: 4 }
          : { height: MINIMA_H },
      ]}
    >
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize: 5.8,
          letterSpacing: 0.5,
          padding: 2.5,
          color: "#555555",
        }}
      >
        MINIMA (DA / MDA)
      </Text>
    </View>
  );
}

function Checklist({
  options,
  slotMinima,
}: {
  options: ChecklistOptions;
  slotMinima: boolean;
}) {
  if (options.layout === "two-column") {
    const [colA, colB] = balanceChecklist(options.phases);
    const { col1, col2 } = checklistColumnHeights(options);
    const shorter = col1 <= col2 ? 0 : 1;
    const renderColumn = (phases: ChecklistPhase[], idx: number) => (
      <View
        style={[styles.boxed, { flexGrow: 1, flexBasis: 0, marginLeft: idx === 1 ? 5 : 0 }]}
      >
        {phases.map((p, i) => (
          <PhaseBlock
            key={p.id}
            phase={p}
            last={i === phases.length - 1 && !(slotMinima && idx === shorter)}
          />
        ))}
        {slotMinima && idx === shorter ? <MinimaBoxInline /> : null}
      </View>
    );
    return (
      <View style={{ flexDirection: "column" }}>
        <SectionBand title="CHECKS" />
        <View style={{ flexDirection: "row", alignItems: "stretch" }}>
          {renderColumn(colA, 0)}
          {renderColumn(colB, 1)}
        </View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: "column" }}>
      <SectionBand title="CHECKS" />
      <View style={styles.boxed}>
        {options.phases.map((p, i) => (
          <PhaseBlock key={p.id} phase={p} last={i === options.phases.length - 1} />
        ))}
      </View>
    </View>
  );
}

/** Minima absorbed into the leftover space of the shorter checklist column. */
function MinimaBoxInline() {
  return (
    <View style={{ flexGrow: 1, minHeight: 26 }}>
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize: 5.8,
          letterSpacing: 0.5,
          padding: 2.5,
          color: "#555555",
        }}
      >
        MINIMA (DA / MDA)
      </Text>
    </View>
  );
}

/* ------------------------------ fuel plan ---------------------------- */

function FuelPlan({ options, flex }: { options: FuelPlanOptions; flex: boolean }) {
  return (
    <View style={{ flexDirection: "column", flexGrow: flex ? 1 : 0 }}>
      <SectionBand title="FUEL PLAN" />
      <View style={[styles.boxed, { flexGrow: flex ? 1 : 0 }]}>
        {options.rows.map((row, i) => (
          <View
            key={row.id}
            style={{
              flexDirection: "row",
              minHeight: 13,
              flexGrow: flex ? 1 : 0,
              borderBottomWidth: i < options.rows.length - 1 ? THIN : 0,
              borderBottomColor: HAIR,
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1.4,
                paddingHorizontal: 3,
                borderRightWidth: THIN,
                borderRightColor: HAIR,
                alignSelf: "stretch",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 6.3,
                  fontFamily: row.bold ? "Helvetica-Bold" : "Helvetica",
                }}
              >
                {row.label}
              </Text>
            </View>
            <View
              style={{
                flex: 0.6,
                borderRightWidth: THIN,
                borderRightColor: HAIR,
                alignSelf: "stretch",
              }}
            />
            <View style={{ flex: 0.6, alignSelf: "stretch" }} />
          </View>
        ))}
      </View>
    </View>
  );
}

/* ------------------------------ comms/nav ---------------------------- */

function CommsNav({ options, flex }: { options: CommsNavOptions; flex: boolean }) {
  const headers = [
    ["STATION", 1.6],
    ["FREQ", 0.9],
    ["ID", 0.6],
  ] as const;
  return (
    <View style={{ flexDirection: "column", flexGrow: flex ? 1 : 0 }}>
      <SectionBand title="COMMS / NAV" />
      <View style={[styles.boxed, { flexGrow: flex ? 1 : 0 }]}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: BAND,
            borderBottomWidth: HEAVY,
            borderBottomColor: INK,
            minHeight: 11,
            alignItems: "center",
          }}
        >
          {headers.map(([label, f], i) => (
            <View
              key={label}
              style={{
                flex: f,
                borderRightWidth: i < headers.length - 1 ? THIN : 0,
                borderRightColor: INK,
                alignSelf: "stretch",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                  fontSize: 5.8,
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
        {Array.from({ length: options.rows }).map((_, r) => (
          <View
            key={r}
            style={{
              flexDirection: "row",
              minHeight: 12,
              flexGrow: flex ? 1 : 0,
              borderBottomWidth: r < options.rows - 1 ? THIN : 0,
              borderBottomColor: HAIR,
            }}
          >
            {headers.map(([label, f], i) => (
              <View
                key={label}
                style={{
                  flex: f,
                  borderRightWidth: i < headers.length - 1 ? THIN : 0,
                  borderRightColor: HAIR,
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/* --------------------------- writing sections ------------------------ */

function WritingLines({
  title,
  options,
  flex,
}: {
  title: string;
  options: LinesOptions;
  flex: boolean;
}) {
  return (
    <View style={{ flexDirection: "column", flexGrow: flex ? 1 : 0 }}>
      <SectionBand title={title} />
      <View
        style={[
          styles.boxed,
          { flexGrow: flex ? 1 : 0, paddingHorizontal: 4, paddingBottom: 4 },
        ]}
      >
        {Array.from({ length: options.lines }).map((_, i) => (
          <View
            key={i}
            style={{
              height: flex ? undefined : 17,
              flexGrow: flex ? 1 : 0,
              borderBottomWidth: 0.6,
              borderBottomColor: HAIR,
              borderBottomStyle: "dotted",
            }}
          />
        ))}
      </View>
    </View>
  );
}

/* ------------------------------ r/t calls ---------------------------- */

function RtField({ field, last }: { field: RtCallField; last: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        marginRight: last ? 0 : 4,
      }}
    >
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 5.4 }}>
        {field.label}
      </Text>
      <View
        style={{
          flexGrow: 1,
          marginHorizontal: 1.5,
          marginBottom: 1,
          borderBottomWidth: 0.5,
          borderBottomColor: HAIR,
          borderBottomStyle: "dotted",
        }}
      />
      {field.hint ? (
        <Text style={{ fontSize: 4.4, fontStyle: "italic", color: FAINT }}>
          ({field.hint})
        </Text>
      ) : null}
    </View>
  );
}

function RtBlock({ block }: { block: RtCallBlock }) {
  return (
    <View style={{ marginBottom: 3 }}>
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize: 5.2,
          letterSpacing: 0.4,
          paddingBottom: 1,
          marginBottom: 1,
          borderBottomWidth: 0.4,
          borderBottomColor: INK,
        }}
      >
        {block.title}
      </Text>
      {block.lines.map((line) =>
        line.text !== undefined ? (
          <Text
            key={line.id}
            style={{
              fontSize: 5,
              color: "#444444",
              minHeight: 9.5,
              paddingTop: 1,
            }}
          >
            {line.text}
          </Text>
        ) : (
          <View
            key={line.id}
            style={{
              flexDirection: "row",
              minHeight: 9.5,
              alignItems: "flex-end",
              paddingBottom: 0.5,
            }}
          >
            {(line.fields ?? []).map((field, fi, arr) => (
              <RtField key={fi} field={field} last={fi === arr.length - 1} />
            ))}
          </View>
        )
      )}
    </View>
  );
}

function RtCall({ options }: { options: RtCallOptions }) {
  const [colA, colB] = balanceRtBlocks(options.blocks);
  return (
    <View style={{ flexDirection: "column" }}>
      <SectionBand title="R/T CALLS" />
      <View style={[styles.boxed, { padding: 4 }]}>
        <View style={{ flexDirection: "row", alignItems: "stretch" }}>
          <View style={{ flex: 1, flexBasis: 0, paddingRight: 5 }}>
            {colA.map((block) => (
              <RtBlock key={block.id} block={block} />
            ))}
          </View>
          <View
            style={{
              flex: 1,
              flexBasis: 0,
              paddingLeft: 5,
              borderLeftWidth: 0.4,
              borderLeftColor: HAIR,
            }}
          >
            {colB.map((block) => (
              <RtBlock key={block.id} block={block} />
            ))}
          </View>
        </View>
        {options.note ? (
          <Text
            style={{ fontSize: 4.6, fontStyle: "italic", color: FAINT, marginTop: 1 }}
          >
            {options.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ----------------------------- route sketch -------------------------- */

function RouteSketch({ options }: { options: RouteSketchOptions }) {
  return (
    <View
      style={[styles.boxed, { height: options.heightFraction * CONTENT_H }]}
    >
      <Text
        style={{
          fontSize: 5.8,
          letterSpacing: 0.8,
          color: FAINT,
          padding: 3,
        }}
      >
        ROUTE SKETCH
      </Text>
    </View>
  );
}

/* ------------------------------- pages ------------------------------- */

function Section({
  section,
  flex,
  slotMinima,
}: {
  section: SectionInstance;
  flex: boolean;
  slotMinima: boolean;
}) {
  switch (section.type) {
    case "flightLog":
      return <FlightLog options={section.options} />;
    case "checklist":
      return <Checklist options={section.options} slotMinima={slotMinima} />;
    case "rtCall":
      return <RtCall options={section.options} />;
    case "fuelPlan":
      return <FuelPlan options={section.options} flex={flex} />;
    case "commsNav":
      return <CommsNav options={section.options} flex={flex} />;
    case "clearance":
      return <WritingLines title="CLEARANCE / ATIS" options={section.options} flex={flex} />;
    case "notes":
      return <WritingLines title="NOTES" options={section.options} flex={flex} />;
    case "routeSketch":
      return <RouteSketch options={section.options} />;
    case "minima":
      return <MinimaBox />;
  }
}

function PageContent({
  config,
  page,
}: {
  config: PlogConfig;
  page: PageSide;
}) {
  const sections = pageSections(config, page);
  const flexId = flexSectionId(sections);
  const slotMinima = minimaSlottedIntoChecklist(config.sections, page);
  return (
    <>
      {page === "front" ? <TitleBar config={config} /> : null}
      {sections.map((section, i) => (
        <View
          key={section.id}
          style={{
            marginBottom: i < sections.length - 1 ? SECTION_GAP : 0,
            flexGrow: section.id === flexId ? 1 : 0,
            flexShrink: 0,
            flexDirection: "column",
          }}
        >
          <Section
            section={section}
            flex={section.id === flexId}
            slotMinima={slotMinima && section.type === "checklist"}
          />
        </View>
      ))}
    </>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer}>
      <Text style={{ fontSize: 4.8, color: FAINT, letterSpacing: 0.3 }}>
        PLOG generated at {SITE}
      </Text>
    </View>
  );
}

/** The fixed-size, optionally-rotated content area + attribution footer. */
function PageStage({
  config,
  page,
  rotate,
}: {
  config: PlogConfig;
  page: PageSide;
  rotate: boolean;
}) {
  return (
    <View style={[styles.stage, rotate ? { transform: "rotate(180deg)" } : {}]}>
      <View style={styles.flow}>
        <PageContent config={config} page={page} />
      </View>
      <PageFooter />
    </View>
  );
}

/** One A5 area (margin + content) for the side-by-side A4 sheet. */
function A5Half({
  config,
  page,
  rotate,
}: {
  config: PlogConfig;
  page: PageSide;
  rotate: boolean;
}) {
  return (
    <View style={{ width: PAGE_W, height: PAGE_H, padding: MARGIN }}>
      <PageStage config={config} page={page} rotate={rotate} />
    </View>
  );
}

export interface PlogDocumentProps {
  config: PlogConfig;
  /**
   * When set, renders only that page and never rotates it — used by the
   * live preview so the back page reads upright on screen even though the
   * exported PDF prints it inverted for the bottom-flip.
   */
  previewPage?: PageSide;
  /** Output format. Ignored when previewPage is set. */
  exportLayout?: ExportLayout;
}

export function PlogDocument({
  config,
  previewPage,
  exportLayout = "duplexA5",
}: PlogDocumentProps) {
  if (!previewPage && exportLayout === "sideBySideA4") {
    const rotateBack = config.invertBack;
    return (
      <Document
        title={config.title}
        producer="freeploggenerator"
        creator="freeploggenerator"
      >
        <Page
          size={[A4L_W, A4L_H]}
          style={{
            backgroundColor: "#ffffff",
            fontFamily: "Helvetica",
            color: INK,
          }}
          wrap={false}
        >
          <View
            style={{
              width: A4L_W,
              height: A4L_H,
              flexDirection: "row",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <A5Half config={config} page="front" rotate={false} />
            <A5Half config={config} page="back" rotate={rotateBack} />
            {/* Dashed guide for cutting the sheet into two A5 cards. */}
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: A4L_W / 2,
                borderLeftWidth: 0.5,
                borderLeftColor: "#cccccc",
                borderLeftStyle: "dashed",
              }}
            />
          </View>
        </Page>
      </Document>
    );
  }

  const pages: PageSide[] = previewPage ? [previewPage] : ["front", "back"];
  return (
    <Document title={config.title} producer="freeploggenerator" creator="freeploggenerator">
      {pages.map((side) => {
        const rotate = !previewPage && side === "back" && config.invertBack;
        return (
          <Page key={side} size={[PAGE_W, PAGE_H]} style={styles.page} wrap={false}>
            <PageStage config={config} page={side} rotate={rotate} />
          </Page>
        );
      })}
    </Document>
  );
}
