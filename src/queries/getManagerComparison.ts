import type { ManagerComparison } from "./analytics-contracts.generated";
export type { ManagerComparison };
export type ComparisonStat = ManagerComparison["total_points"];
export type ChipUsageStat = ManagerComparison["wildcards"];
export type ChipHalfStat = NonNullable<ChipUsageStat["h1"]>;
export type CaptainSummary = ManagerComparison["most_captained"];
