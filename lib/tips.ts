/**
 * Tip jar + yearly supporters scoreboard.
 *
 * The app is fully static (no backend), so the leaderboard is a curated
 * list you maintain here: once a year — or whenever — reconcile the payouts
 * from your third-party tip provider and update TIP_YEARS below. The "tip"
 * action itself is just a link out to that provider, so no scripts, cookies
 * or consent are involved until the visitor chooses to leave the site.
 */

export interface Tipper {
  /** Display name (person or company). */
  name: string;
  /** Total contributed in the year — used to rank the board. */
  amount: number;
  /** Optional link to the tipper's website. */
  url?: string;
  /**
   * Optional logo for the company wall. Drop the asset in
   * /public/tippers and reference it here, e.g. "/tippers/acme.svg".
   */
  logo?: string;
  /** Marks a company (vs an individual) — companies get the logo wall. */
  company?: boolean;
}

export interface TipYear {
  year: number;
  tippers: Tipper[];
}

/** Where the "Tip" button sends people. Override per-deploy with env. */
export const TIP_URL =
  process.env.NEXT_PUBLIC_TIP_URL ?? "https://ko-fi.com/freeploggenerator";
export const TIP_PROVIDER = process.env.NEXT_PUBLIC_TIP_PROVIDER ?? "Ko-fi";
export const TIP_CURRENCY = process.env.NEXT_PUBLIC_TIP_CURRENCY ?? "£";
/** Rough yearly running cost (hosting + domain) the tip jar aims to cover. */
export const TIP_GOAL = Number(process.env.NEXT_PUBLIC_TIP_GOAL ?? 30);

/**
 * Curated leaderboard, newest year first. To feature a company on the logo
 * wall, set `company: true` and point `logo` at an asset in /public/tippers.
 *
 * Example entry:
 *   {
 *     year: 2026,
 *     tippers: [
 *       { name: "Acme Avionics", amount: 250, company: true,
 *         logo: "/tippers/acme.svg", url: "https://acme.example" },
 *       { name: "J. Bloggs", amount: 20 },
 *     ],
 *   }
 */
export const TIP_YEARS: TipYear[] = [{ year: 2026, tippers: [] }];

export function availableYears(): number[] {
  return TIP_YEARS.map((y) => y.year).sort((a, b) => b - a);
}

export function tipYear(year?: number): TipYear {
  if (year != null) {
    const found = TIP_YEARS.find((y) => y.year === year);
    if (found) return found;
  }
  // Default to the most recent year on the board.
  return (
    [...TIP_YEARS].sort((a, b) => b.year - a.year)[0] ?? {
      year: new Date().getFullYear(),
      tippers: [],
    }
  );
}

/** All tippers for a year, highest contribution first. */
export function rankedTippers(y: TipYear): Tipper[] {
  return [...y.tippers].sort((a, b) => b.amount - a.amount);
}

/** Companies with a logo, for the wall — highest contribution first. */
export function featuredTippers(y: TipYear): Tipper[] {
  return rankedTippers(y).filter((t) => t.company && t.logo);
}

/** Total contributed in a year — drives the running-costs meter. */
export function tipTotal(y: TipYear): number {
  return y.tippers.reduce((sum, t) => sum + (t.amount || 0), 0);
}

export function formatTip(amount: number): string {
  return `${TIP_CURRENCY}${amount.toLocaleString()}`;
}

/** Initials fallback for a tipper shown without a logo image. */
export function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
