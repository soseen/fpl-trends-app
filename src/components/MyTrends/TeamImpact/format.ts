// Format a signed rank delta for display. Positive = rank improved (good).
// Examples:
//   15400  → "+15.4k"
//   -2300  → "-2.3k"
//   1_200_000 → "+1.2m"
//   0      → "0"
export const formatRankDelta = (n: number): string => {
  if (!Number.isFinite(n) || Math.abs(n) < 50) return "0";
  const sign = n > 0 ? "+" : "-";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}m`;
  }
  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 1_000)}k`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}${Math.round(abs)}`;
};

// Color class for a rank-impact value: positive = improvement (magenta-ish),
// negative = regression (rose), near-zero = muted text.
export const rankImpactColorClass = (n: number): string => {
  if (!Number.isFinite(n) || Math.abs(n) < 50) return "text-text/60";
  return n > 0 ? "text-emerald-400" : "text-rose-400";
};

// Background pill color: magenta tint for positive, rose for negative.
export const rankImpactPillClass = (n: number): string => {
  if (!Number.isFinite(n) || Math.abs(n) < 50) {
    return "bg-accent4/30 text-text/70";
  }
  return n > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300";
};

// FPL haul threshold: a single-GW score worth highlighting. 9+ pts is the
// canonical "did well" line — captaincy bonus on a 5-pt return, double
// digits on a clean sheet for a defender, etc. Used by the per-GW
// breakdown to flag the user's actual scoring weeks.
export const POINTS_HAUL_THRESHOLD = 9;

// Defcon bonus = "the player crossed FPL's defensive-contribution threshold
// in this GW", awarded as a +2 in their score. Any defcon bonus > 0 over
// the range is worth a green tint as a "this stat earned you points" cue.
//
// Returns the colour class, or null when there's nothing to highlight.
export const defconHighlightClass = (count: number): string | null =>
  count > 0 ? "text-emerald-400" : null;
