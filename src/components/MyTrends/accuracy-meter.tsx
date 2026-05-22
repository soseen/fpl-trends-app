import { FaSpinner } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  stratum: 1 | 2 | 3 | null;
  sampleSize: number;
  isLoading: boolean;
  sampleStatus?: "final" | "refreshing" | "stale";
};

// Sample size at which we'd consider the rank estimate fully reliable, per
// stratum. These mirror the populate-managers cron's design targets so the
// meter reflects "how close is the cron to a complete pass" rather than a
// loose ratio that saturates after a few runs.
//   - Stratum 1: full census of the top 10k
//   - Stratum 2: ~45k unique probes per pass, plus accumulated re-tagged
//     movers from stratum 1
//   - Stratum 3: matches the backend cron's STRATUM_C_TARGET_MANAGERS env
//     (default 50k). Each probe weighs ~240 ranks at this sample size,
//     so some sampling noise is expected even at 99%.
const TARGET_SAMPLE: Record<1 | 2 | 3, number> = {
  1: 10_000,
  2: 50_000,
  3: 50_000,
};

// Cap at 99 deliberately. Hitting the design sample target doesn't mean the
// estimate is *exactly* right — there's always residual stratum-3 sampling
// noise plus a slight stale-tag drift between cron passes. Showing "100%"
// would over-promise accuracy we cannot guarantee. 99% is the honest
// ceiling: "as good as our pipeline gets, never literally perfect."
const ACCURACY_CAP = 99;

const computeAccuracy = (stratum: 1 | 2 | 3 | null, sampleSize: number): number => {
  if (stratum === null || sampleSize <= 0) return 0;
  const ratio = sampleSize / TARGET_SAMPLE[stratum];
  return Math.min(ACCURACY_CAP, Math.round(ratio * 100));
};

const bucketFor = (pct: number): 1 | 2 | 3 => {
  if (pct >= 66) return 3;
  if (pct >= 33) return 2;
  return 1;
};

const colorFor = (bars: 1 | 2 | 3): string => {
  if (bars === 3) return "bg-emerald-400";
  if (bars === 2) return "bg-amber-400";
  return "bg-rose-400";
};

const AccuracyMeter: React.FC<Props> = ({
  stratum,
  sampleSize,
  isLoading,
  sampleStatus = "final",
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-text/70 md:text-sm">
        <FaSpinner className="h-3.5 w-3.5 animate-spin text-magenta" />
        <span>Loading…</span>
      </div>
    );
  }

  const pct = computeAccuracy(stratum, sampleSize);
  const bars = bucketFor(pct);
  const fillColor = colorFor(bars);
  const target = stratum === null ? 0 : TARGET_SAMPLE[stratum];
  const isRefreshing = sampleStatus === "refreshing";
  const isStale = sampleStatus === "stale";
  const label = isStale
    ? "Updating"
    : isRefreshing
      ? `Refreshing ${pct}%`
      : `Accuracy ${pct}%`;
  const tooltip = isStale
    ? "The latest finished gameweek sample is being reset before ranks are shown."
    : stratum === null
      ? "No rank data yet for this manager."
      : `Estimate based on ${sampleSize.toLocaleString("en-GB")} probes in your stratum. Target: ${target.toLocaleString("en-GB")} for full accuracy. The sample is refreshed after each gameweek finalizes.`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs text-text/80 md:text-sm">
          {isStale || isRefreshing ? (
            <FaSpinner className="h-3.5 w-3.5 animate-spin text-magenta" />
          ) : null}
          <span>{label}</span>
          <div className="flex items-end gap-[2px]" aria-hidden>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-[5px] rounded-sm ${i <= bars ? fillColor : "bg-accent4/50"}`}
                style={{ height: `${4 + i * 3}px` }}
              />
            ))}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

export default AccuracyMeter;
