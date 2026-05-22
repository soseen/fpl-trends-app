import api from "src/lib/axios";

export type ManagerRangeRank = {
  entry_id: number;
  overall_rank: number | null;
  total_points: number | null;
  // Sample-based estimate — what the comparison-card shows as the
  // primary "GWs X–Y" rank.
  range_rank: number | null;
  // FPL's published cumulative rank at end_gw, only populated for
  // startGw=1 queries (FPL doesn't store partial-range answers).
  // Useful as a ground-truth comparison alongside `range_rank`.
  range_rank_official: number | null;
  range_total: number;
  overall_rank_before: number | null;
  overall_rank_after: number | null;
  start_gw: number;
  end_gw: number;
  stratum_used: 1 | 2 | 3 | null;
  confidence: "exact" | "estimated" | "approximate";
  sample_size: number;
  sample_status: "final" | "refreshing" | "stale";
  sample_finalized: boolean;
};

export const getManagerRangeRank = async (
  entryId: number,
  startGw: number,
  endGw: number,
  signal?: AbortSignal,
): Promise<ManagerRangeRank> => {
  const { data } = await api.get<ManagerRangeRank>(`manager/${entryId}/range-rank`, {
    params: { start: startGw, end: endGw },
    signal,
  });
  return data;
};
