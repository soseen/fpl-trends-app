import type { ManagerRangeRank } from "src/queries/getManagerRangeRank";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  data: ManagerRangeRank;
  startGw: number;
  endGw: number;
};

// Treat any non-positive / null / undefined value as "no rank yet" so
// boot-state and unranked users render as "—". A real rank from FPL is
// always >= 1.
const formatRank = (rank: number | null | undefined): string =>
  typeof rank === "number" && rank > 0 ? rank.toLocaleString("en-GB") : "—";

const RangeRankCard: React.FC<Props> = ({ data, startGw, endGw }) => {
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
    <div className="grid grid-cols-9 gap-2">
      <div className="col-span-4">
        <div className="w-fit self-center justify-self-center rounded-t-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pt-1 md:text-sm lg:px-12 lg:text-base">
          Overall
        </div>
        <div className="w-fit min-w-[80%] flex-col items-center self-center justify-self-center rounded-md bg-accent3 px-8 py-4 text-center shadow-sm md:py-6 lg:px-16">
          <p className="text-base font-semibold md:mb-2 md:text-5xl">
            {formatRank(overall)}
          </p>
          <p className="text-xs text-text/60 md:text-sm">Top {percentageOverall}%</p>
        </div>
        <div className="w-fit self-center justify-self-center rounded-b-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pb-1 md:text-sm lg:px-12 lg:text-base">
          {(data.total_points ?? 0)?.toLocaleString("en-GB")} pts
        </div>
      </div>
      <div className="col-span-1 h-full w-[1px] self-center justify-self-center bg-accent4" />
      <div className="col-span-4">
        <div className="w-fit self-center justify-self-center rounded-t-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pt-1 md:text-sm lg:px-12 lg:text-base">
          {rangeLabel}
        </div>
        <div className="w-fit min-w-[80%] flex-col items-center self-center justify-self-center rounded-md bg-accent3 px-8 py-4 text-center shadow-sm md:py-6 lg:px-16">
          <p
            className={`flex-nowrap text-base font-semibold md:mb-2 md:text-5xl ${colorClass}`}
          >
            {prefix}
            {formatRank(range)}
          </p>
          <p className="text-xs text-text/60 md:text-sm">Top {percentageRange}%</p>
          {/* Side-by-side ground-truth: FPL publishes the cumulative
              overall rank at end_gw for any startGw=1 query, so the
              estimator's `range_rank` should converge on it as the
              sample matures. Showing both lets the operator eyeball
              estimator quality without leaving the page. Hidden when
              FPL hasn't published one (partial ranges, unranked user). */}
          {data.range_rank_official !== null && data.range_rank_official !== range && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="mt-1 cursor-help text-[10px] text-text/50 md:text-xs">
                  FPL: {formatRank(data.range_rank_official)}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Cumulative overall rank reported directly by FPL for the end of the range.
                Treat this as the ground-truth our estimator is trying to match.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="w-fit self-center justify-self-center rounded-b-md bg-magenta px-2 text-center text-sm text-text md:px-8 md:pb-1 md:text-sm lg:px-12 lg:text-base">
          {data.range_total?.toLocaleString("en-GB")} pts
        </div>
      </div>
    </div>
  );
};

export default RangeRankCard;
