import api from "src/lib/axios";

export type ComparisonStat = {
  user: number;
  average: number | null;
  top10k_average: number | null;
  top100k_average: number | null;
};

// Sample-side rates for one half-season slice. Each value is a fraction
// (0..1) of sampled managers in that stratum who played the chip in this
// slice of the requested range.
export type ChipHalfStat = {
  average: number | null;
  top10k_average: number | null;
  top100k_average: number | null;
};

// Chip stat with first-half / second-half breakdown. Each chip type has
// two copies per season — one in GW1–19, one in GW20–38. The UI renders
// each half as its own bar whenever the requested range spans the GW20
// reset; otherwise only one half is non-null and a single bar is shown.
export type ChipUsageStat = {
  user: number; // 0, 1, or 2
  h1: ChipHalfStat | null;
  h2: ChipHalfStat | null;
};

export type CaptainSummary = {
  user_player_id: number | null;
  user_player_name: string | null;
  average_player_id: number | null;
  average_player_name: string | null;
  top10k_player_id: number | null;
  top10k_player_name: string | null;
  top100k_player_id: number | null;
  top100k_player_name: string | null;
};

export type ManagerComparison = {
  entry_id: number;
  start_gw: number;
  end_gw: number;
  total_points: ComparisonStat;
  transfers: ComparisonStat;
  wildcards: ChipUsageStat;
  free_hits: ChipUsageStat;
  bench_boosts: ChipUsageStat;
  hits: ComparisonStat;
  bench_points: ComparisonStat;
  captain_bonus: ComparisonStat;
  // Average net points per transfer made in range. User: total transfer
  // net (sum of in_player_points − out_player_points over each transfer's
  // remaining-range window) / number of transfers. Sample columns are
  // averages of per-manager averages across the stratum.
  avg_pts_per_transfer: ComparisonStat;
  avg_gw_score: ComparisonStat;
  most_captained: CaptainSummary;
  notes: {
    hits_average_partial: boolean;
    bench_average_partial: boolean;
    captain_average_partial: boolean;
    transfers_average_partial: boolean;
  };
};

export const getManagerComparison = async (
  entryId: number,
  startGw: number,
  endGw: number,
  signal?: AbortSignal,
): Promise<ManagerComparison> => {
  const { data } = await api.get<ManagerComparison>(`manager/${entryId}/comparison`, {
    params: { start: startGw, end: endGw },
    signal,
  });
  return data;
};
