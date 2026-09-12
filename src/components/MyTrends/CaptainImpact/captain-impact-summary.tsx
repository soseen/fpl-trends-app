import type React from "react";
import clsx from "clsx";
import { formatRankDelta } from "../TeamImpact/format";

type Props = {
  totalUser: number;
  totalTop10k: number;
  totalTemplate: number;
  totalDiffVsTop10k: number;
  totalDiffVsTemplate: number;
  rankImpactVsTemplate: number | null;
  rankImpactVsTop10k: number | null;
  matchedTop10kCount: number;
  matchedTemplateCount: number;
  totalGws: number;
};

const formatSigned = (n: number): string => {
  const value = Number.isInteger(n) ? `${n}` : n.toFixed(1);
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${value} pts`;
};

const formatPoints = (n: number): string => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

const totalToneClass = (n: number): string => {
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-rose-400";
  return "text-text/60";
};

const CaptainImpactSummary: React.FC<Props> = ({
  totalUser,
  totalTop10k,
  totalTemplate,
  totalDiffVsTop10k,
  totalDiffVsTemplate,
  rankImpactVsTemplate,
  rankImpactVsTop10k,
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

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-4">
        <Column label="You" value={totalUser} />
        <Column
          label="Average"
          value={totalTemplate}
          diff={totalDiffVsTemplate}
          rankImpact={rankImpactVsTemplate}
          matched={matchedTemplateCount}
          totalGws={totalGws}
        />
        <Column
          label="Top 10k"
          value={totalTop10k}
          diff={totalDiffVsTop10k}
          rankImpact={rankImpactVsTop10k}
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
  diff?: number;
  rankImpact?: number | null;
  matched?: number;
  totalGws?: number;
};

const Column: React.FC<ColumnProps> = ({
  label,
  value,
  diff,
  rankImpact,
  matched,
  totalGws,
}) => (
  <div className="flex flex-col items-center gap-0.5 text-center">
    <span className="text-[10px] font-semibold uppercase tracking-wide text-text/60 sm:text-xs">
      {label}
    </span>
    <span className="text-base font-semibold text-text sm:text-lg md:text-xl">
      {formatPoints(value)} pts
    </span>
    {typeof diff === "number" && (
      <span className={clsx("text-[10px] sm:text-xs", totalToneClass(diff))}>
        {formatSigned(diff)}
      </span>
    )}
    {rankImpact !== undefined && (
      <span
        title="Estimated rank movement from the weighted captain points difference over the selected range"
        className={clsx(
          "text-[9px] sm:text-[10px]",
          rankImpact == null ? "text-text/50" : totalToneClass(Math.round(rankImpact)),
        )}
      >
        {rankImpact == null
          ? "Rank unavailable"
          : Math.round(Math.abs(rankImpact)) === 0
            ? "No rank change"
            : `Est. ${
                Math.abs(rankImpact) < 50
                  ? Math.round(Math.abs(rankImpact))
                  : formatRankDelta(Math.abs(rankImpact)).replace(/^\+/, "")
              } ranks ${rankImpact > 0 ? "gained" : "lost"}`}
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
