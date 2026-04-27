import api from "src/lib/axios";

export type ComparisonStat = {
  user: number;
  average: number | null;
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
  notes: {
    hits_average_partial: boolean;
    bench_average_partial: boolean;
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
