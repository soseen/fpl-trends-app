import type React from "react";
import clsx from "clsx";

type Props = {
  totalNet: number;
  totalTransfers: number;
  // null when totalTransfers === 0 — render an empty-state copy instead
  // of a misleading "0 / 0" rate.
  avgNetPerTransfer: number | null;
};

const formatSigned = (n: number, decimals = 0): string => {
  if (n === 0) return decimals > 0 ? "0.0 pts" : "0 pts";
  const formatted = n.toFixed(decimals);
  return `${n > 0 ? "+" : ""}${formatted} pts`;
};

const totalToneClass = (n: number): string => {
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-rose-400";
  return "text-text/60";
};

// Headline block: big colored total at the top, transfer count + average
// per transfer on a quieter line below. Keeps with the user's stated
// priority — "the total should be the main part, individual diffs are
// secondary visual context".
const TransferImpactSummary: React.FC<Props> = ({
  totalNet,
  totalTransfers,
  avgNetPerTransfer,
}) => {
  if (totalTransfers === 0) {
    return (
      <div className="text-text/70 flex flex-col items-center gap-1 py-2 text-center text-sm md:text-base">
        <span>No transfers in this range.</span>
        <span className="text-text/50 text-xs md:text-sm">
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
      <span className="text-text/70 text-xs md:text-sm lg:text-base">
        from {totalTransfers} transfer{totalTransfers === 1 ? "" : "s"}
        {avgNetPerTransfer !== null && (
          <>
            {" · "}
            <span className={clsx("font-semibold", totalToneClass(avgNetPerTransfer))}>
              {formatSigned(avgNetPerTransfer, 1)}
            </span>{" "}
            avg per transfer
          </>
        )}
      </span>
    </div>
  );
};

export default TransferImpactSummary;
