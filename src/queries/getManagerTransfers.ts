import api from "src/lib/axios";

// Mirrors fpl-trends-api/src/managers/getManagerTransfers.ts response types.
// Keep these two files in lockstep - the backend is the source of truth.

export type ActiveChip = "wildcard" | "freehit" | "bboost" | "3xc" | "manager" | null;

export type TransferImpactPlayer = {
  player_id: number;
  web_name: string;
  // FPL CDN photo code - passed to <FootballerImage code={...} />.
  code: number;
  team_code: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  // Points the player contributed in the per-pair comparison window:
  //   Window  = [transfer.gw, lastOwnedGw] for normal transfers (where
  //             lastOwnedGw is the GW before the IN player was next
  //             transferred OUT, or endGw if still owned). For Free Hit
  //             transfers the window is [fhGw, fhGw] (single GW).
  //   IN side -> starter-aware (benched = 0, captaincy is not doubled).
  //   OUT side -> raw points across the window, with chip-event bench
  //             players scaled by their pre-chip start rate.
  // See backend type comment for the full rationale.
  points_in_window: number;
  // Positive for IN point contribution, negative for OUT points left behind.
  rank_impact: number | null;
  avg_ownership_pct: number | null;
};

export type TransferImpactPair = {
  player_in: TransferImpactPlayer;
  player_out: TransferImpactPlayer;
  net_points: number; // in.points_in_window - out.points_in_window
  // net_points translated through the manager's rank-density sample.
  net_rank_impact: number | null;
  // GW the IN player was later transferred out (lastOwnedGw + 1).
  // null when the IN player is still owned at endGw, or when the
  // transfer is a Free Hit (auto-revert next GW is implicit).
  in_sold_gw: number | null;
};

// One per GW with kept transfers OR with a chip whose effect we surface
// (currently bench boost - included so we can show a "+X bench points"
// tile even when no transfers were made that week). Ghost transfers
// (intra-GW reversals where the IN player never made the final XV) are
// filtered server-side and never appear here.
export type TransferImpactEvent = {
  gw: number;
  pairs: TransferImpactPair[];
  // Sum of pair nets, before hit cost.
  gross_net_points: number;
  // Hit cost in raw points (e.g., 4 = one -4 hit).
  hits_cost: number;
  // gross_net_points - hits_cost. Headline number for the card.
  combined_net_points: number;
  gross_rank_impact: number | null;
  hits_rank_impact: number | null;
  combined_rank_impact: number | null;
  chip: ActiveChip;
  // Set only when chip === "bboost". Display-only - not included in
  // any total. null otherwise.
  bench_boost_points: number | null;
};

// Per-GW free-transfer state. One entry per GW in [start_gw, end_gw];
// rolled GWs still get a row with `used = 0`. Used to render the "X/Y"
// counter chip on each GW card.
export type FreeTransferState = {
  gw: number;
  used: number;
  // Null when the API cannot infer the exact FT bank reliably from FPL's
  // public history payload. The UI then falls back to the plain transfer
  // count instead of showing a fake denominator.
  available: number | null;
};

export type ManagerTransfers = {
  entry_id: number;
  start_gw: number;
  end_gw: number;
  events: TransferImpactEvent[]; // sorted by gw desc (most recent first)
  total_transfers: number;
  total_net_points: number;
  total_rank_impact: number | null;
  // null when total_transfers === 0 - frontend renders an empty state
  // rather than a misleading "0 / 0".
  avg_net_per_transfer: number | null;
  free_transfers: FreeTransferState[];
  // True when the FPL transfers fetch failed and the response is built
  // from stale persisted rows. Frontend shows a subtle "best-effort" hint.
  incomplete: boolean;
  notes: {
    rank_per_point: number | null;
    stratum_avg_range_points: number | null;
    fallback_used: boolean;
    incomplete_picks: boolean;
  };
};

export const getManagerTransfers = async (
  entryId: number,
  startGw: number,
  endGw: number,
  signal?: AbortSignal,
): Promise<ManagerTransfers> => {
  const { data } = await api.get<ManagerTransfers>(`manager/${entryId}/transfers`, {
    params: { start: startGw, end: endGw },
    signal,
  });
  return data;
};
