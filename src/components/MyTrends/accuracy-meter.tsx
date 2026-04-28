import { FaSpinner } from "react-icons/fa";

type Props = {
  stratum: 1 | 2 | 3 | null;
  sampleSize: number;
  isLoading: boolean;
};

// Sample size at which we'd consider the rank estimate fully reliable, per
// stratum. These mirror the populate-managers cron's design targets so the
// meter reflects "how close is the cron to a complete pass" rather than a
// loose ratio that saturates after a few runs.
//   - Stratum 1: full census of the top 10k (200 pages × 50)
//   - Stratum 2: 1-in-5 sampling of 90k = 18k, headroom for re-passes
//   - Stratum 3: 50k random probes — bumped from 10k after observed error
//     was ~25% rather than the theoretical ~3%. Each probe at 50k weighs
//     ~250 ranks instead of ~1,240, so sample skew translates into much
//     less rank noise.
const TARGET_SAMPLE: Record<1 | 2 | 3, number> = {
  1: 10_000,
  2: 25_000,
  3: 50_000,
};

const computeAccuracy = (stratum: 1 | 2 | 3 | null, sampleSize: number): number => {
  if (stratum === null || sampleSize <= 0) return 0;
  const ratio = sampleSize / TARGET_SAMPLE[stratum];
  return Math.min(100, Math.round(ratio * 100));
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
      <div className="text-text/70 flex items-center gap-2 text-xs md:text-sm">
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
    <div
      className="text-text/80 flex items-center gap-2 text-xs md:text-sm"
      title={tooltip}
    >
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
  );
};

export default AccuracyMeter;
