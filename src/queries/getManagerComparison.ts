import api from "src/lib/axios";

export type ComparisonStat = {
  user: number;
  average: number | null;
  top10k_average: number | null;
};

export type CaptainSummary = {
  user_player_id: number | null;
  user_player_name: string | null;
  average_player_id: number | null;
  average_player_name: string | null;
  top10k_player_id: number | null;
  top10k_player_name: string | null;
};

export type ManagerComparison = {
  entry_id: number;
  start_gw: number;
  end_gw: number;
  total_points: ComparisonStat;
  transfers: ComparisonStat;
  wildcards: ComparisonStat;
  free_hits: ComparisonStat;
  bench_boosts: ComparisonStat;
  hits: ComparisonStat;
  bench_points: ComparisonStat;
  captain_bonus: ComparisonStat;
  avg_gw_score: ComparisonStat;
  most_captained: CaptainSummary;
  notes: {
    hits_average_partial: boolean;
    bench_average_partial: boolean;
    captain_average_partial: boolean;
  };
};

export const getManagerComparison = async (
  entryId: number,
  startGw: number,
  endGw: number,
): Promise<ManagerComparison> => {
  const { data } = await api.get<ManagerComparison>(`manager/${entryId}/comparison`, {
    params: { start: startGw, end: endGw },
  });
  return data;
};
