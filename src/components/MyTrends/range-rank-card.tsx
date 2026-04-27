import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagerRangeRank } from "src/queries/getManagerRangeRank";
import type { ManagerTrajectory } from "src/queries/getManagerTrajectory";
import RankTrajectoryChart from "./rank-trajectory-chart";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";

type Props = {
  data: ManagerRangeRank;
  trajectory?: ManagerTrajectory | null;
  startGw: number;
  endGw: number;
};

const formatRank = (rank: number | null): string =>
  rank === null ? "—" : rank.toLocaleString("en-GB");

const RangeRankCard: React.FC<Props> = ({ data, trajectory, startGw, endGw }) => {
  const { totalPlayers } = useSelector((state: RootState) => state.totalPlayers);
  const overall = data.overall_rank;
  const range = data.range_rank;

  // Color reflects trajectory: did this GW range improve or worsen the user's
  // cumulative overall rank? Compare overall rank entering the range vs
  // overall rank leaving it. Neutral when there is no "before" (range starts
  // at GW 1) or either endpoint is missing.
  const before = data.overall_rank_before;
  const after = data.overall_rank_after;
  let colorClass = "text-text";
  if (before !== null && after !== null) {
    if (after < before) colorClass = "text-emerald-400";
    else if (after > before) colorClass = "text-rose-400";
  }

  const percentageOverall =
    totalPlayers > 0 ? Math.ceil(((overall ?? 0) / totalPlayers) * 10000) / 100 : 0;
  const percentageRange =
    totalPlayers > 0 ? Math.ceil(((range ?? 0) / totalPlayers) * 10000) / 100 : 0;

  const prefix = data.confidence === "exact" ? "" : "≈ ";
  const rangeLabel = startGw === endGw ? `GW ${startGw}` : `GWs ${startGw}–${endGw}`;

  return (
    <Card className="text-md flex w-full flex-col rounded-sm bg-accent2 p-1 pb-8 text-text shadow-md md:text-base lg:pb-8 lg:text-xl">
      <CardHeader className="mb-4 w-full rounded-md bg-accent5 p-2 shadow-md md:mb-8">
        <CardTitle className="text-base shadow-sm md:text-lg lg:text-2xl">
          My rank
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-2 md:px-4">
        <div className="grid grid-cols-9 gap-2">
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
        </div>

        {trajectory && trajectory.gws.length > 0 && (
          <RankTrajectoryChart
            data={trajectory}
            startGw={startGw}
            endGw={endGw}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RangeRankCard;
