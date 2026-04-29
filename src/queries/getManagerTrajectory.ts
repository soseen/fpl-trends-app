import api from "src/lib/axios";

export type ManagerTrajectoryPoint = {
  gw: number;
  overall_rank: number;
  gw_rank: number;
  points: number;
  total_points: number;
  event_transfers: number;
  event_transfers_cost: number; // -4 hits per transfer over the free one (0/4/8/…)
};

export type ManagerTrajectory = {
  entry_id: number;
  gws: ManagerTrajectoryPoint[];
};

export const getManagerTrajectory = async (
  entryId: number,
): Promise<ManagerTrajectory> => {
  const { data } = await api.get<ManagerTrajectory>(`manager/${entryId}/trajectory`);
  return data;
};
