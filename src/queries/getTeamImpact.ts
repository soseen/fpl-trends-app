import type { TeamImpact } from "./analytics-contracts.generated";
export type { TeamImpact };
export type TeamImpactTile = NonNullable<TeamImpact["most_played_xi"]>["gk"];
export type PlayerImpact = TeamImpact["players"][number];
export type PlayerImpactGwBreakdown = PlayerImpact["per_gw"][number];
export type PlayerMatch = PlayerImpactGwBreakdown["matches"][number];
