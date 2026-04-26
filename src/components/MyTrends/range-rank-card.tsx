import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagerRangeRank } from "src/queries/getManagerRangeRank";

type Props = {
  data: ManagerRangeRank;
  startGw: number;
  endGw: number;
};

const formatRank = (rank: number | null): string =>
  rank === null ? "—" : rank.toLocaleString("en-GB");

const RangeRankCard: React.FC<Props> = ({ data, startGw, endGw }) => {
  const overall = data.overall_rank;
  const range = data.range_rank;

  let direction: "better" | "worse" | "same" | "unknown" = "unknown";
  let colorClass = "text-text";
  if (overall !== null && range !== null) {
    if (range < overall) {
      direction = "better";
      colorClass = "text-emerald-400";
    } else if (range > overall) {
      direction = "worse";
      colorClass = "text-rose-400";
    } else {
      direction = "same";
      colorClass = "text-text";
    }
  }

  const prefix = data.confidence === "exact" ? "" : "≈ ";
  const rangeLabel =
    startGw === endGw ? `GW ${startGw}` : `GWs ${startGw}–${endGw}`;

  return (
    <Card className="border-secondary bg-primary text-text shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">My rank</CardTitle>
        <p className="text-xs text-text/60">
          {rangeLabel} ·{" "}
          {data.confidence === "exact"
            ? "exact (top 10k census)"
            : data.confidence === "estimated"
              ? `estimated from ${data.sample_size.toLocaleString("en-GB")} sampled managers`
              : "approximate (no sample yet for this rank tier)"}
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text/60">
            Overall (season)
          </p>
          <p className="text-2xl font-semibold">{formatRank(overall)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text/60">
            {rangeLabel}
          </p>
          <p className={`text-2xl font-semibold ${colorClass}`}>
            {prefix}
            {formatRank(range)}
          </p>
          {direction === "better" && (
            <p className="text-xs text-emerald-400">
              ↑ better than overall in this range
            </p>
          )}
          {direction === "worse" && (
            <p className="text-xs text-rose-400">
              ↓ worse than overall in this range
            </p>
          )}
          {direction === "same" && (
            <p className="text-xs text-text/60">matches overall</p>
          )}
        </div>
        <div className="col-span-2 border-t border-secondary pt-2 text-xs text-text/60">
          {data.range_total.toLocaleString("en-GB")} pts in this range
        </div>
      </CardContent>
    </Card>
  );
};

export default RangeRankCard;
