import type React from "react";
import clsx from "clsx";

type Props = {
  totalNet: number;
  totalTransfers: number;
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

const TransferImpactSummary: React.FC<Props> = ({ totalNet, totalTransfers }) => {
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
      <span className="text-xs text-text/70 md:text-sm lg:text-base">
        from {totalTransfers} transfer{totalTransfers === 1 ? "" : "s"}
      </span>
    </div>
  );
};

export default TransferImpactSummary;
