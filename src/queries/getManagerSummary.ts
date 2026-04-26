import api from "src/lib/axios";

export type ManagerSummary = {
  entry_id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  total_points: number | null;
  overall_rank: number | null;
  current_event: number | null;
};

export const getManagerSummary = async (
  entryId: number,
): Promise<ManagerSummary> => {
  const { data } = await api.get<ManagerSummary>(`manager/${entryId}/summary`);
  return data;
};
