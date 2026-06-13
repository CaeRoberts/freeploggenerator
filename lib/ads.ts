/**
 * Single source of truth for whether ad spaces appear at all. When this is
 * false the ad placements render nothing (no placeholder, no reserved
 * space); when true they reserve their height and show a placeholder until
 * a real ad loads (consent granted + client/slot configured).
 *
 * NEXT_PUBLIC_* is inlined at build time, so changing it requires a rebuild.
 */
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
