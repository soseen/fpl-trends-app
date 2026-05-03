import type React from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type {
  ActiveChip,
  TransferImpactEvent,
} from "src/queries/getManagerTransfers";
import TransferPlayerTile from "./transfer-player-tile";

type Props = {
  event: TransferImpactEvent;
};

const formatNet = (n: number): string => {
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${n} pts`;
};

const netPillClass = (n: number): string => {
  if (n > 0) return "bg-emerald-500/20 text-emerald-300";
  if (n < 0) return "bg-rose-500/20 text-rose-300";
  return "bg-accent4/40 text-text/70";
};

const CHIP_LABEL: Record<NonNullable<ActiveChip>, string> = {
  wildcard: "Wildcard",
  freehit: "Free Hit",
  bboost: "Bench Boost",
  "3xc": "Triple Captain",
  manager: "Assistant Manager",
};

// Each chip gets its own tint so they're visually distinct from the
// neutral GW header strip.
const CHIP_BADGE_CLASS: Record<NonNullable<ActiveChip>, string> = {
  wildcard: "bg-cyan-500/25 text-cyan-200",
  freehit: "bg-amber-500/25 text-amber-200",
  bboost: "bg-emerald-500/25 text-emerald-200",
  "3xc": "bg-magenta/30 text-magenta",
  manager: "bg-text/15 text-text/80",
};

const ChipBadge: React.FC<{ chip: NonNullable<ActiveChip> }> = ({ chip }) => (
  <span
    className={clsx(
      "rounded-sm px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
      CHIP_BADGE_CLASS[chip],
    )}
  >
    {CHIP_LABEL[chip]}
  </span>
);

const TransferEventCard: React.FC<Props> = ({ event }) => {
  const { gw, pairs, chip, bench_boost_points, gross_net_points, hits_cost, combined_net_points } =
    event;

  const isBenchBoost = chip === "bboost";

  return (
    <Card className="flex flex-col overflow-hidden border-accent4 bg-primary/40 shadow-md">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 bg-accent5/80 px-3 py-1.5 sm:py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text sm:text-sm md:text-base">
            GW {gw}
          </span>
          {chip && <ChipBadge chip={chip} />}
          {!isBenchBoost && pairs.length > 1 && (
            <span className="text-text/60 text-[10px] font-normal sm:text-xs">
              {pairs.length} transfers
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Hits formula: only show when there's a real hit AND we're
              displaying a transfer comparison (not on BB GWs, where
              hits are intentionally suppressed per the user's spec). */}
          {!isBenchBoost && hits_cost > 0 && (
            <span className="text-text/60 text-[10px] sm:text-xs">
              <span className={gross_net_points >= 0 ? "text-emerald-300" : "text-rose-300"}>
                {formatNet(gross_net_points)}
              </span>{" "}
              − {hits_cost} ={" "}
            </span>
          )}
          <span
            className={clsx(
              "rounded-md px-2 py-0.5 text-xs font-semibold sm:text-sm md:text-base",
              netPillClass(combined_net_points),
            )}
          >
            {formatNet(combined_net_points)}
          </span>
        </div>
      </div>

      {/* Bench-boost: skip the OUT/IN comparison entirely (per the user's
          spec — comparing against the previous team's bench is unfair).
          Show a centred bench-points headline + a brief explainer. */}
      {isBenchBoost ? (
        <div className="flex flex-col items-center gap-1 px-3 py-4 text-center">
          <span className="text-text/70 text-[10px] uppercase tracking-wide sm:text-xs">
            Bench points
          </span>
          <span className="text-2xl font-semibold text-emerald-300 sm:text-3xl md:text-4xl">
            +{bench_boost_points ?? 0} pts
          </span>
          <span className="text-text/50 px-2 text-[10px] sm:text-xs">
            All four bench players counted this GW.
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 px-3 py-3 xs:flex-row xs:justify-center sm:gap-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {pairs.map((pair) => (
              <TransferPlayerTile
                key={`out-${pair.player_out.player_id}-${gw}`}
                player={pair.player_out}
                side="out"
              />
            ))}
          </div>

          <ArrowRight
            className="h-5 w-5 shrink-0 rotate-90 text-text/70 xs:rotate-0 sm:h-6 sm:w-6"
            aria-hidden
          />

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {pairs.map((pair) => (
              <TransferPlayerTile
                key={`in-${pair.player_in.player_id}-${gw}`}
                player={pair.player_in}
                side="in"
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TransferEventCard;
