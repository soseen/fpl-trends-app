import api from "src/lib/axios";

// Mirrors fpl-trends-api/src/managers/getCaptainImpact.ts response types.
// Keep these two files in lockstep — the backend is the source of truth.

export type CaptainPlayer = {
  player_id: number;
  web_name: string;
  code: number;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  raw_points: number;
  multiplier: number;
  effective_points: number;
  effective_multiplier: number;
  ownership_pct: number;
  captain_rate: number;
  triple_captain_rate: number;
  minutes: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  defensive_contribution: number;
  saves: number;
  bonus: number;
};

export type CaptainEvent = {
  gw: number;
  user_captain: CaptainPlayer;
  template_captain: CaptainPlayer | null;
  top10k_captain: CaptainPlayer | null;
  matched_template: boolean;
  matched_top10k: boolean;
  differential_vs_template: number;
  differential_vs_top10k: number;
  user_captain_bonus: number;
  expected_captain_bonus: number | null;
  captaincy_excess: number | null;
  rank_impact: number | null;
};

export type CaptainImpact = {
  entry_id: number;
  start_gw: number;
  end_gw: number;
  events: CaptainEvent[];
  total_user_captain_pts: number;
  total_template_captain_pts: number;
  total_top10k_captain_pts: number;
  total_diff_vs_template: number;
  total_diff_vs_top10k: number;
  total_user_captain_bonus: number;
  total_expected_captain_bonus: number | null;
  total_captaincy_excess: number | null;
  total_rank_impact: number | null;
  matched_template_count: number;
  matched_top10k_count: number;
  total_with_captain: number;
  notes: {
    rank_per_point: number | null;
    stratum_avg_range_points: number | null;
    fallback_used: boolean;
    partial_rank_impact: boolean;
    incomplete_picks: boolean;
    small_sample_gws: number[];
  };
};

export const getCaptainImpact = async (
  entryId: number,
  startGw: number,
  endGw: number,
  signal?: AbortSignal,
): Promise<CaptainImpact> => {
  const { data } = await api.get<CaptainImpact>(`manager/${entryId}/captain-impact`, {
    params: { start: startGw, end: endGw },
    signal,
  });
  return data;
};
