import api from "src/lib/axios";

// Mirrors fpl-trends-api/src/managers/getManagerTransfers.ts response types.
// Keep these two files in lockstep — the backend is the source of truth.

export type ActiveChip =
  | "wildcard"
  | "freehit"
  | "bboost"
  | "3xc"
  | "manager"
  | null;

export type TransferImpactPlayer = {
  player_id: number;
  web_name: string;
  // FPL CDN photo code — passed to <FootballerImage code={...} />.
  code: number;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  // Points the player contributed in the window:
  //   IN side  → multiplier-aware (benched = 0, captained = 2× points, etc.)
  //   OUT side → raw history points (best-effort; we can't know whether
  //              the user would have actually played them).
  // See backend type comment for the full rationale.
  points_in_window: number;
};

export type TransferImpactPair = {
  player_in: TransferImpactPlayer;
  player_out: TransferImpactPlayer;
  net_points: number; // in.points_in_window − out.points_in_window
};

// One per GW with kept transfers OR a bench-boost. Ghost transfers
// (intra-GW reversals where the IN player never made the final XV) are
// filtered server-side and never appear here.
export type TransferImpactEvent = {
  gw: number;
  pairs: TransferImpactPair[];
  // Sum of pair nets, before hit cost.
  gross_net_points: number;
  // Hit cost in raw points (e.g., 4 = one −4 hit).
  hits_cost: number;
  // gross_net_points − hits_cost. Headline number for the card.
  combined_net_points: number;
  chip: ActiveChip;
  // Only set when chip === "bboost". When set, the card shows a flat
  // bench-points figure instead of the OUT/IN comparison (the previous
  // team's bench wouldn't have been BB-prepared, so the comparison is
  // unfair — see user spec).
  bench_boost_points: number | null;
};

export type ManagerTransfers = {
  entry_id: number;
  start_gw: number;
  end_gw: number;
  events: TransferImpactEvent[]; // sorted by gw desc (most recent first)
  total_transfers: number;
  total_net_points: number;
  // null when total_transfers === 0 — frontend renders an empty state
  // rather than a misleading "0 / 0".
  avg_net_per_transfer: number | null;
  // True when the FPL transfers fetch failed and the response is built
  // from stale persisted rows. Frontend shows a subtle "best-effort" hint.
  incomplete: boolean;
};

export const getManagerTransfers = async (
  entryId: number,
  startGw: number,
  endGw: number,
): Promise<ManagerTransfers> => {
  const { data } = await api.get<ManagerTransfers>(
    `manager/${entryId}/transfers`,
    {
      params: { start: startGw, end: endGw },
    },
  );
  return data;
};
