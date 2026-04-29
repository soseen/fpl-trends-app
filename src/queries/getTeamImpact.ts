import api from "src/lib/axios";

// Mirrors fpl-trends-api/src/managers/getTeamImpact.ts response types.
// Keep these two files in lockstep — the backend is the source of truth.

export type TeamImpactTile = {
  player_id: number;
  // FPL CDN photo code — used by `getFootballersImage(code)` in
  // src/utils/images.ts. Distinct from `player_id` (per-season element id).
  code: number;
  web_name: string;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  points_for_user: number;
  rank_impact: number; // signed; positive = rank improved
};

export type PlayerImpactGwBreakdown = {
  gw: number;
  multiplier: number;
  points: number;
  ownership_pct: number;
  eo: number;
  excess: number;
  rank_impact_gw: number;
};

export type PlayerImpact = {
  player_id: number;
  code: number;
  web_name: string;
  team_code: number;
  element_type: number;
  points_for_user: number;
  raw_points: number;
  starts: number;
  captaincies: number;
  triple_captaincies: number;
  played_count: number;
  avg_ownership_pct: number;
  avg_eo_in_stratum: number;
  rank_impact: number;
  per_gw: PlayerImpactGwBreakdown[];
};

export type TeamImpact = {
  entry_id: number;
  start_gw: number;
  end_gw: number;
  most_played_xi: {
    gk: TeamImpactTile;
    def: TeamImpactTile[];
    mid: TeamImpactTile[];
    fwd: TeamImpactTile[];
  } | null;
  players: PlayerImpact[];
  totals: {
    user_range_points: number;
    stratum_avg_range_points: number | null;
    rank_per_point: number | null;
    attributed_excess: number;
  };
  notes: {
    incomplete_picks: boolean;
    fallback_used: boolean;
    small_sample_gws: number[];
  };
};

export const getTeamImpact = async (
  entryId: number,
  startGw: number,
  endGw: number,
): Promise<TeamImpact> => {
  const { data } = await api.get<TeamImpact>(`manager/${entryId}/team-impact`, {
    params: { start: startGw, end: endGw },
  });
  return data;
};
