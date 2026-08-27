import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FaSpinner } from "react-icons/fa";

type Props = {
  stratum: 1 | 2 | 3 | null;
  sampleSize: number;
  isLoading: boolean;
  sampleStatus?: "final" | "refreshing" | "stale";
};

// Design sample targets used to present a deliberately coarse confidence
// level. They are not probabilities and should never be shown as percentages.
const TARGET_SAMPLE: Record<1 | 2 | 3, number> = {
  1: 10_000,
  2: 50_000,
  3: 50_000,
};

const bucketFor = (stratum: 1 | 2 | 3 | null, sampleSize: number): 1 | 2 | 3 => {
  if (stratum === null || sampleSize <= 0) return 1;
  const coverage = sampleSize / TARGET_SAMPLE[stratum];
  if (coverage >= 0.66) return 3;
  if (coverage >= 0.33) return 2;
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

  const bars = bucketFor(stratum, sampleSize);
  const fillColor = colorFor(bars);
  const target = stratum === null ? 0 : TARGET_SAMPLE[stratum];
  const isRefreshing = sampleStatus === "refreshing";
  const isStale = sampleStatus === "stale";
  const confidence = bars === 3 ? "High" : bars === 2 ? "Medium" : "Low";
  const label = isStale
    ? "Updating"
    : isRefreshing
      ? "Refreshing"
      : `${confidence} confidence`;
  const tooltip = isStale
    ? "The latest finished gameweek sample is being reset before ranks are shown."
    : stratum === null
      ? "No rank data yet for this manager."
      : `Estimate based on ${sampleSize.toLocaleString("en-GB")} nearby-rank samples. The target sample is ${target.toLocaleString("en-GB")}, refreshed after each gameweek finalizes.`;

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
