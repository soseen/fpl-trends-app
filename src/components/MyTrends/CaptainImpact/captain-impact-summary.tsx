import type React from "react";
import clsx from "clsx";
import { formatRankDelta, rankImpactColorClass } from "../TeamImpact/format";

type Props = {
  totalUser: number;
  totalTop10k: number;
  totalTemplate: number;
  totalDiffVsTop10k: number;
  totalDiffVsTemplate: number;
  totalRankImpact: number | null;
  matchedTop10kCount: number;
  matchedTemplateCount: number;
  totalGws: number;
};

const formatSigned = (n: number): string => {
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${n} pts`;
};

const totalToneClass = (n: number): string => {
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-rose-400";
  return "text-text/60";
};

// Big diff-vs-top-10k headline (mirrors Transfer Impact's headline
// total) followed by a clean three-column comparison: YOU / AVERAGE
// / TOP 10K. The columns disambiguate the headline — each carries
// its own absolute total, diff vs you, and match rate — so we can
// drop any explanatory subtitle and let the number sit on its own.
const CaptainImpactSummary: React.FC<Props> = ({
  totalUser,
  totalTop10k,
  totalTemplate,
  totalDiffVsTop10k,
  totalDiffVsTemplate,
  totalRankImpact,
  matchedTop10kCount,
  matchedTemplateCount,
  totalGws,
}) => {
  if (totalGws === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-2 text-center text-sm text-text/70 md:text-base">
        <span>No captain picks in this range.</span>
      </div>
    );
  }

  const hasRankImpact = totalRankImpact != null;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <span
        className={clsx(
          "text-3xl font-semibold leading-none md:text-5xl lg:text-6xl",
          hasRankImpact
            ? rankImpactColorClass(totalRankImpact)
            : totalToneClass(totalDiffVsTop10k),
        )}
      >
        {hasRankImpact
          ? formatRankDelta(totalRankImpact)
          : formatSigned(totalDiffVsTop10k)}
      </span>
      <span className="text-xs text-text/70 md:text-sm">
        {hasRankImpact
          ? `captaincy rank impact · ${formatSigned(totalDiffVsTop10k)} vs Top 10k`
          : "points vs Top 10k"}
      </span>
      <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-4">
        <Column label="You" value={totalUser} />
        <Column
          label="Average"
          value={totalTemplate}
          diff={totalDiffVsTemplate}
          matched={matchedTemplateCount}
          totalGws={totalGws}
        />
        <Column
          label="Top 10k"
          value={totalTop10k}
          diff={totalDiffVsTop10k}
          matched={matchedTop10kCount}
          totalGws={totalGws}
        />
      </div>
    </div>
  );
};

type ColumnProps = {
  label: string;
  value: number;
  // Diff and matched are only meaningful for the reference columns
  // (Average / Top 10k) — for the You column they're omitted.
  diff?: number;
  matched?: number;
  totalGws?: number;
};

const Column: React.FC<ColumnProps> = ({ label, value, diff, matched, totalGws }) => (
  <div className="flex flex-col items-center gap-0.5 text-center">
    <span className="text-[10px] font-semibold uppercase tracking-wide text-text/60 sm:text-xs">
      {label}
    </span>
    <span className="text-base font-semibold text-text sm:text-lg md:text-xl">
      {value} pts
    </span>
    {typeof diff === "number" && (
      <span className={clsx("text-[10px] sm:text-xs", totalToneClass(diff))}>
        {formatSigned(diff)}
      </span>
    )}
    {typeof matched === "number" && typeof totalGws === "number" && (
      <span className="text-[9px] text-text/50 sm:text-[10px]">
        matched {matched}/{totalGws}
      </span>
    )}
  </div>
);

export default CaptainImpactSummary;
