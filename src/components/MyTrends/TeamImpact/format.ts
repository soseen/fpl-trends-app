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
