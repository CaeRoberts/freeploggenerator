import type { PlogConfig, SectionInstance } from "./types";
import { newId } from "./templates";

/**
 * Guarantees every id in a config is unique. Older configs (from
 * localStorage, a shared link or an imported file) could contain duplicate
 * ids because of the previous counter-based generator; duplicates collide
 * as React keys and duplicate rows in the editor and preview when
 * reordered. This reassigns any repeat (keeping the first occurrence) so
 * such configs are healed the moment they load.
 */
export function normalizeConfig(config: PlogConfig): PlogConfig {
  const seen = new Set<string>();
  const fix = (id: string): string => {
    if (id && !seen.has(id)) {
      seen.add(id);
      return id;
    }
    let next = newId("id");
    while (seen.has(next)) next = newId("id");
    seen.add(next);
    return next;
  };

  const sections = config.sections.map((s): SectionInstance => {
    const id = fix(s.id);
    switch (s.type) {
      case "flightLog": {
        const remap: Record<string, string> = {};
        const columns = s.options.columns.map((c) => {
          const nid = fix(c.id);
          remap[c.id] = nid;
          return { ...c, id: nid };
        });
        const values = s.options.values
          ? Object.fromEntries(
              Object.entries(s.options.values).map(([k, v]) => {
                const sep = k.lastIndexOf(":");
                const cid = k.slice(0, sep);
                const row = k.slice(sep + 1);
                return [`${remap[cid] ?? cid}:${row}`, v];
              })
            )
          : undefined;
        return { ...s, id, options: { ...s.options, columns, values } };
      }
      case "checklist":
        return {
          ...s,
          id,
          options: {
            ...s.options,
            phases: s.options.phases.map((p) => ({
              ...p,
              id: fix(p.id),
              items: p.items.map((it) => ({ ...it, id: fix(it.id) })),
            })),
          },
        };
      case "fuelPlan":
        return {
          ...s,
          id,
          options: {
            ...s.options,
            rows: s.options.rows.map((r) => ({ ...r, id: fix(r.id) })),
          },
        };
      case "rtCall":
        return {
          ...s,
          id,
          options: {
            ...s.options,
            blocks: s.options.blocks.map((b) => ({
              ...b,
              id: fix(b.id),
              lines: b.lines.map((l) => ({ ...l, id: fix(l.id) })),
            })),
          },
        };
      default:
        return { ...s, id };
    }
  });

  return { ...config, sections };
}
