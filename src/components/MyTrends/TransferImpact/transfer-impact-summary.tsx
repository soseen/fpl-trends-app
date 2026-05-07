import type React from "react";
import clsx from "clsx";
import { formatRankDelta, rankImpactColorClass } from "../TeamImpact/format";

type Props = {
  totalNet: number;
  totalTransfers: number;
  totalRankImpact: number | null;
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

const TransferImpactSummary: React.FC<Props> = ({
  totalNet,
  totalTransfers,
  totalRankImpact,
}) => {
  if (totalTransfers === 0 && totalNet === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-2 text-center text-sm text-text/70 md:text-base">
        <span>No transfers in this range.</span>
        <span className="text-xs text-text/50 md:text-sm">
          Make a swap and check back to see the impact.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-2 text-center">
      <span
        className={clsx(
          "text-3xl font-semibold leading-none md:text-5xl lg:text-6xl",
          totalToneClass(totalNet),
        )}
      >
        {formatSigned(totalNet)}
      </span>
      {totalRankImpact != null && (
        <span className="rounded-full bg-accent4/30 px-2.5 py-0.5 text-xs sm:text-sm">
          rank{" "}
          <span className={rankImpactColorClass(totalRankImpact)}>
            {formatRankDelta(totalRankImpact)}
          </span>
        </span>
      )}
      <span className="text-xs text-text/70 md:text-sm lg:text-base">
        {totalTransfers} transfer{totalTransfers === 1 ? "" : "s"} made total
      </span>
    </div>
  );
};

export default TransferImpactSummary;
