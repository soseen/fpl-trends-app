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

// One played fixture for a (player, GW) pair. `team_score` /
// `opponent_score` are flipped for away matches so the first number is
// always the player's club.
export type PlayerMatch = {
  opponent_short: string;
  was_home: boolean;
  team_score: number | null;
  opponent_score: number | null;
};

export type PlayerImpactGwBreakdown = {
  gw: number;
  multiplier: number;
  points: number;
  ownership_pct: number;
  eo: number;
  excess: number;
  rank_impact_gw: number;
  // True if the player had a fixture in this GW. False = blank GW
  // (player's club didn't play). Rendered as "—" in the per-GW table to
  // distinguish from "had a fixture but scored 0".
  had_fixture: boolean;
  // Per-fixture match info — empty for blanks, one entry for normal
  // GWs, two for DGWs.
  matches: PlayerMatch[];
  // Match events for this GW — populated by the backend SUM-aggregating
  // history rows across DGW fixtures. Used in the per-player accordion's
  // breakdown table to show WHY a given GW score was what it was.
  minutes: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  defensive_contribution: number;
  saves: number;
  bonus: number;
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
  // Top 10 players the user did NOT have during the GW range who scored
  // points and were widely owned in the stratum — i.e. they boosted other
  // managers' totals and so dragged the user's relative rank down.
  // Convention: `played_count`, `starts`, `captaincies`,
  // `triple_captaincies`, and `points_for_user` are all 0; `raw_points` is
  // the total points the player scored across GWs the user didn't own
  // them; `rank_impact` is signed and always non-positive.
  rank_killers: PlayerImpact[];
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
