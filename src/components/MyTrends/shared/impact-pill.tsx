import type React from "react";
import clsx from "clsx";
import { formatRankDelta, rankImpactColorClass } from "../TeamImpact/format";

type Props = {
  points: number;
  pointsLabel?: string;
  pointsSubtitle?: React.ReactNode;
  pointsTitle?: string;

  rankImpact: number | null;
  rankTitle?: string;

  title?: string;
  className?: string;
};

const formatNet = (n: number): string => {
  const value = Number.isInteger(n) ? `${n}` : n.toFixed(1);
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${value} pts`;
};

const pointsToneClass = (n: number): string => {
  if (n > 0) return "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40";
  if (n < 0) return "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40";
  return "bg-accent4/40 text-text/70 ring-1 ring-text/15";
};

const ImpactPill: React.FC<Props> = ({
  points,
  pointsLabel = "points",
  pointsSubtitle,
  pointsTitle,
  rankImpact,
  rankTitle,
  title,
  className,
}) => (
  <div
    className={clsx(
      "inline-flex overflow-hidden rounded-md border border-accent4 bg-accent4/30 shadow-sm",
      className,
    )}
    title={title}
  >
    <div
      className={clsx(
        "flex min-w-[4.25rem] flex-col items-center justify-center px-2.5 py-1",
        pointsToneClass(points),
      )}
      title={pointsTitle}
    >
      <span className="text-[9px] font-medium uppercase leading-none opacity-75">
        {pointsLabel}
      </span>
      <span className="text-xs font-bold tabular-nums leading-tight sm:text-sm">
        {formatNet(points)}
      </span>
      {pointsSubtitle != null && (
        <span className="text-[9px] font-medium leading-none opacity-70">
          {pointsSubtitle}
        </span>
      )}
    </div>
    {rankImpact !== null && (
      <div
        className="flex min-w-[4.75rem] flex-col items-center justify-center border-l border-accent4 px-2.5 py-1"
        title={rankTitle}
      >
        <span className="text-[9px] font-medium uppercase leading-none text-text/50">
          rank
        </span>
        <span
          className={clsx(
            "text-xs font-bold tabular-nums leading-tight sm:text-sm",
            rankImpactColorClass(rankImpact),
          )}
        >
          {formatRankDelta(rankImpact)}
        </span>
      </div>
    )}
  </div>
);

export default ImpactPill;
