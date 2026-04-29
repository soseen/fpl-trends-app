import { FaSpinner } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  stratum: 1 | 2 | 3 | null;
  sampleSize: number;
  isLoading: boolean;
};

// Sample size at which we'd consider the rank estimate fully reliable, per
// stratum. These mirror the populate-managers cron's design targets so the
// meter reflects "how close is the cron to a complete pass" rather than a
// loose ratio that saturates after a few runs.
//   - Stratum 1: full census of the top 10k
//   - Stratum 2: ~45k unique probes per stride-2 pass, plus accumulated
//     re-tagged movers from stratum 1
//   - Stratum 3: 150k random probes — at this size each probe weighs
//     ~80 ranks instead of the original ~1,240, so a single sample skew
//     barely moves the estimate.
const TARGET_SAMPLE: Record<1 | 2 | 3, number> = {
  1: 10_000,
  2: 50_000,
  3: 150_000,
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

const AccuracyMeter: React.FC<Props> = ({ stratum, sampleSize, isLoading }) => {
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
  const tooltip =
    stratum === null
      ? "No rank data yet for this manager."
      : `Estimate based on ${sampleSize.toLocaleString("en-GB")} probes in your stratum. Target: ${target.toLocaleString("en-GB")} for full accuracy. Sample grows automatically as the data refresh runs.`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs text-text/80 md:text-sm">
          <span>Accuracy {pct}%</span>
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
