import type { FC } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type {
  ActiveChip,
  TransferImpactEvent,
  TransferImpactPair,
} from "src/queries/getManagerTransfers";
import ImpactPill from "../shared/impact-pill";
import TransferPlayerTile from "./transfer-player-tile";

type Props = {
  event: TransferImpactEvent;
};

const formatNet = (n: number): string => {
  if (n === 0) return "0 pts";
  return `${n > 0 ? "+" : ""}${n} pts`;
};

const netPillClass = (n: number): string => {
  if (n > 0) return "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40";
  if (n < 0) return "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/40";
  return "bg-accent4/40 text-text/70 ring-1 ring-text/15";
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

const ChipBadge: FC<{ chip: NonNullable<ActiveChip> }> = ({ chip }) => (
  <span
    className={clsx(
      "rounded-sm px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
      CHIP_BADGE_CLASS[chip],
    )}
  >
    {CHIP_LABEL[chip]}
  </span>
);

const formatTransferCount = (count: number): string =>
  `${count} transfer${count === 1 ? "" : "s"}`;

const TransferCountBadge: FC<{ count: number }> = ({ count }) => (
  <span className="text-[10px] font-normal text-text/60 sm:text-xs">
    {formatTransferCount(count)}
  </span>
);

// More than 5 pairs in a single GW (typically wildcard / free hit) is
// the threshold where a flat OUT -> IN row becomes hard to scan. We
// switch to one row per position with its own gain pill.
const POSITION_GROUP_THRESHOLD = 5;
const POSITION_LABEL: Record<number, string> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
};
const POSITION_ORDER = [1, 2, 3, 4];

type PositionGroup = {
  position: number;
  pairs: TransferImpactPair[];
  groupNet: number;
};

const groupPairsByPosition = (pairs: TransferImpactPair[]): PositionGroup[] => {
  const byPos = new Map<number, TransferImpactPair[]>();
  for (const p of pairs) {
    const pos = p.player_in.element_type;
    const list = byPos.get(pos) ?? [];
    list.push(p);
    byPos.set(pos, list);
  }
  return POSITION_ORDER.filter((pos) => byPos.has(pos)).map((pos) => {
    const list = byPos.get(pos) ?? [];
    return {
      position: pos,
      pairs: list,
      groupNet: list.reduce((acc, p) => acc + p.net_points, 0),
    };
  });
};

const TransferPlayers: FC<{ pairs: TransferImpactPair[] }> = ({ pairs }) => {
  // Split larger position groups evenly: four becomes 2 + 2, five becomes 3 + 2.
  const splitAt = Math.ceil(pairs.length / 2);
  const rows =
    pairs.length > 3 ? [pairs.slice(0, splitAt), pairs.slice(splitAt)] : [pairs];

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 xs:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3">
      <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-center gap-1.5 xs:justify-end sm:gap-2"
          >
            {row.map((pair) => (
              <TransferPlayerTile
                key={pair.player_out.player_id}
                player={pair.player_out}
                side="out"
              />
            ))}
          </div>
        ))}
      </div>
      <ArrowRight
        className="h-5 w-5 rotate-90 justify-self-center text-text/70 xs:rotate-0 sm:h-6 sm:w-6"
        aria-hidden
      />
      <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-center gap-1.5 xs:justify-start sm:gap-2"
          >
            {row.map((pair) => (
              <TransferPlayerTile
                key={pair.player_in.player_id}
                player={pair.player_in}
                side="in"
                soldGw={pair.in_sold_gw}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const TransferEventCard: FC<Props> = ({ event }) => {
  const {
    gw,
    pairs,
    chip,
    gross_net_points,
    hits_cost,
    combined_net_points,
    combined_rank_impact,
    bench_boost_points,
  } = event;

  const useGrouped = pairs.length > POSITION_GROUP_THRESHOLD;
  const isBenchBoost = chip === "bboost";
  const isBenchBoostOnly = pairs.length === 0 && isBenchBoost;
  const showBenchFooter =
    isBenchBoost && !isBenchBoostOnly && bench_boost_points !== null;
  const showRank = combined_rank_impact !== null;

  return (
    <Card className="flex flex-col overflow-hidden border-accent4 bg-primary/40 shadow-md">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 bg-accent5/80 px-3 py-1.5 sm:py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text sm:text-sm md:text-base">
            GW {gw}
          </span>
          {chip && <ChipBadge chip={chip} />}
          {pairs.length > 0 && <TransferCountBadge count={pairs.length} />}
        </div>
        <div className="flex items-center gap-2">
          {!isBenchBoostOnly && (
            <ImpactPill
              points={combined_net_points}
              pointsSubtitle={
                hits_cost > 0
                  ? `${formatNet(gross_net_points)} - ${hits_cost}`
                  : undefined
              }
              rankImpact={showRank ? combined_rank_impact : null}
              rankTitle="Estimated rank swing from base transfer points. Captaincy is shown separately."
              title="Estimated transfer impact in base points and rank"
            />
          )}
          {isBenchBoostOnly && (
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/40 sm:text-sm md:text-base">
              +{bench_boost_points ?? 0} bench pts
            </span>
          )}
        </div>
      </div>

      {isBenchBoostOnly && (
        <div className="flex items-center justify-center gap-2 px-3 py-3 text-center text-[11px] text-text/60 sm:text-xs">
          <span>
            Bench scored {bench_boost_points ?? 0} pts. Not counted toward transfer total.
          </span>
        </div>
      )}

      {!isBenchBoostOnly && useGrouped ? (
        <div className="flex flex-col gap-2 px-3 py-3 sm:gap-3 sm:py-4">
          {groupPairsByPosition(pairs).map(
            ({ position, pairs: groupPairs, groupNet }) => (
              <div
                key={position}
                className="grid grid-cols-1 items-center gap-2 border-t border-accent4/40 pt-2 first:border-t-0 first:pt-0 xs:grid-cols-[4rem_minmax(0,1fr)_4rem] sm:gap-3"
              >
                <span className="w-10 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-text/70 sm:text-xs">
                  {POSITION_LABEL[position]}
                </span>
                <TransferPlayers pairs={groupPairs} />
                <span
                  className={clsx(
                    "justify-self-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold xs:justify-self-end sm:text-xs",
                    netPillClass(groupNet),
                  )}
                >
                  {formatNet(groupNet)}
                </span>
              </div>
            ),
          )}
        </div>
      ) : !isBenchBoostOnly ? (
        <div className="px-3 py-3 sm:py-4">
          <TransferPlayers pairs={pairs} />
        </div>
      ) : null}

      {showBenchFooter && (
        <div className="border-t border-accent4/40 px-3 py-2 text-center text-[10px] text-emerald-300/80 sm:text-xs">
          Bench Boost added +{bench_boost_points} pts (not counted toward transfer total)
        </div>
      )}
    </Card>
  );
};

export default TransferEventCard;
