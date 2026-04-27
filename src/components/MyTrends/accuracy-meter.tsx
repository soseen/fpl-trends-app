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
//   - Stratum 2: 1-in-5 sampling of 90k = 18k (360 pages × 50)
//   - Stratum 3: 10k random probes — gives ~3% margin at 95% confidence
const TARGET_SAMPLE: Record<1 | 2 | 3, number> = {
  1: 10_000,
  2: 18_000,
  3: 10_000,
};

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
      <div className="text-text/70 flex items-center gap-2 text-xs md:text-sm">
        <FaSpinner className="h-3.5 w-3.5 animate-spin text-magenta" />
        <span>Loading…</span>
      </div>
    );
  }

  const pct = computeAccuracy(stratum, sampleSize);
  const bars = bucketFor(pct);
  const fillColor = colorFor(bars);

  return (
    <div
      className="text-text/80 flex items-center gap-2 text-xs md:text-sm"
      title={`Estimate based on ${sampleSize.toLocaleString("en-GB")} sampled managers in your stratum.`}
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
