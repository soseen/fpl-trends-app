import api from "src/lib/axios";

export type ManagerRangeRank = {
  entry_id: number;
  overall_rank: number | null;
  range_rank: number | null;
  range_total: number;
  start_gw: number;
  end_gw: number;
  stratum_used: 1 | 2 | 3 | null;
  confidence: "exact" | "estimated" | "approximate";
  sample_size: number;
};

export const getManagerRangeRank = async (
  entryId: number,
  startGw: number,
  endGw: number,
): Promise<ManagerRangeRank> => {
  const { data } = await api.get<ManagerRangeRank>(
    `manager/${entryId}/range-rank`,
    { params: { start: startGw, end: endGw } },
  );
  return data;
};
