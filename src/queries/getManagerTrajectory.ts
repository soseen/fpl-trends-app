import api from "src/lib/axios";

export type ManagerTrajectoryPoint = {
  gw: number;
  overall_rank: number;
  gw_rank: number;
  points: number;
  total_points: number;
};

export type ManagerTrajectory = {
  entry_id: number;
  gws: ManagerTrajectoryPoint[];
};

export const getManagerTrajectory = async (
  entryId: number,
): Promise<ManagerTrajectory> => {
  const { data } = await api.get<ManagerTrajectory>(
    `manager/${entryId}/trajectory`,
  );
  return data;
};
