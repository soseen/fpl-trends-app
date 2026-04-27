import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagerRangeRank } from "src/queries/getManagerRangeRank";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

type Props = { data: ManagerRangeRank; startGw: number; endGw: number };

const formatRank = (rank: number | null): string =>
  rank === null ? "—" : rank.toLocaleString("en-GB");

const RangeRankCard: React.FC<Props> = ({ data, startGw, endGw }) => {
  const { totalPlayers } = useSelector((state: RootState) => state.totalPlayers);
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

  const percentageOverall = Math.ceil(((overall ?? 0) / totalPlayers) * 100) / 100;
  const percentageRange = Math.ceil(((range ?? 0) / totalPlayers) * 100) / 100;

  const prefix = data.confidence === "exact" ? "" : "≈ ";
  const rangeLabel = startGw === endGw ? `GW ${startGw}` : `GWs ${startGw}–${endGw}`;

  return (
    <Card className="text-md flex w-full flex-col rounded-sm bg-accent2 p-1 pb-8 text-text shadow-md md:text-base lg:pb-8 lg:text-xl">
      <CardHeader className="mb-4 w-full rounded-md bg-accent5 p-2 shadow-md md:mb-8">
        <CardTitle className="text-base shadow-sm md:text-lg lg:text-2xl">
          My rank
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-9 gap-2">
        <div className="col-span-4">
          <div className="px-2text-center w-fit self-center justify-self-center rounded-t-md bg-magenta text-sm text-text md:px-8 md:pt-1 md:text-sm lg:px-12 lg:text-base">
            Overall
          </div>
          <div className="w-fit min-w-[80%] flex-col items-center self-center justify-self-center rounded-md bg-accent3 px-8 py-4 text-center shadow-sm md:py-6 lg:px-16">
            <p className="text-lg font-semibold md:mb-2 md:text-5xl">
              {formatRank(overall)}
            </p>
            <p className="text-text/60 text-xs md:text-sm">Top {percentageOverall}%</p>
          </div>
          <div className="w-fit self-center justify-self-center rounded-b-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pb-1 md:text-sm lg:px-12 lg:text-base">
            {data.range_total.toLocaleString("en-GB")} pts
          </div>
        </div>
        <div className="col-span-1 h-full w-[1px] self-center justify-self-center bg-accent4" />
        <div className="col-span-4">
          <div className="w-fit self-center justify-self-center rounded-t-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pt-1 md:text-sm lg:px-12 lg:text-base">
            {rangeLabel}
          </div>
          <div className="w-fit min-w-[80%] flex-col items-center self-center justify-self-center rounded-md bg-accent3 px-8 py-4 text-center shadow-sm md:py-6 lg:px-16">
            <p className={`text-lg font-semibold md:mb-2 md:text-5xl ${colorClass}`}>
              {prefix}
              {formatRank(range)}
            </p>
            <p className="text-text/60 text-xs md:text-sm">Top {percentageRange}%</p>
          </div>
          <div className="w-fit self-center justify-self-center rounded-b-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pb-1 md:text-sm lg:px-12 lg:text-base">
            {data.range_total.toLocaleString("en-GB")} pts
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RangeRankCard;
