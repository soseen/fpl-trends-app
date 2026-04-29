import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PlayerImpact, PlayerImpactGwBreakdown } from "src/queries/getTeamImpact";
import { formatRankDelta, rankImpactColorClass, POINTS_HAUL_THRESHOLD } from "./format";

type Props = {
  player: PlayerImpact;
  showRankImpact: boolean;
};

// FPL defcon thresholds (per GW): outfield = 10 / 12 / 12 (DEF / MID / FWD)
// for the +2 bonus. GKs have clean-sheet/saves rules instead — defcon
// scoring isn't applied to them, so the chip is hidden for keepers.
const ELEMENT_TYPE_GK = 1;
const ELEMENT_TYPE_DEF = 2;
const ELEMENT_TYPE_MID = 3;
const ELEMENT_TYPE_FWD = 4;

const defconThreshold = (elementType: number): number =>
  elementType === ELEMENT_TYPE_DEF ? 10 : 12;

// Tiny inline stat chip used to render the per-GW match-event breakdown.
// Same visual rhythm as the row-level stat chips on `player-impact-row`,
// so the eye reads them as the same kind of data.
const Chip: React.FC<{
  label: string;
  value: number;
  tone?: string;
  title: string;
}> = ({ label, value, tone, title }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={`inline-flex items-center gap-1 rounded-sm bg-accent3/60 px-1.5 py-[1px] text-[10px] ${
          tone ?? "text-text/80"
        }`}
      >
        <span className="text-[9px] uppercase text-text/50">{label}</span>
        <span className="font-semibold">{value}</span>
      </span>
    </TooltipTrigger>
    <TooltipContent>{title}</TooltipContent>
  </Tooltip>
);

// Renders the relevant match events for a GW. Shows only what's
// position-relevant and non-zero: a forward who didn't get any defcons
// just won't have a D chip, a defender who got a CS will have CS:1, etc.
// The defcon chip is the only one that always renders for outfielders
// (it's the headline FPL stat now), and turns green when the threshold
// for the player's position was met (= +2 bonus awarded).
const EventChips: React.FC<{
  row: PlayerImpactGwBreakdown;
  elementType: number;
}> = ({ row, elementType }) => {
  if (row.minutes === 0) {
    return <span className="text-[10px] text-text/40">DNP</span>;
  }
  const isGk = elementType === ELEMENT_TYPE_GK;
  const isDef = elementType === ELEMENT_TYPE_DEF;
  const isMid = elementType === ELEMENT_TYPE_MID;
  const isFwd = elementType === ELEMENT_TYPE_FWD;
  const isOutfield = !isGk;

  const defconCount = row.defensive_contribution;
  const defconMet = isOutfield && defconCount >= defconThreshold(elementType);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {row.goals > 0 && (
        <Chip
          label="G"
          value={row.goals}
          tone="text-emerald-400"
          title={`${row.goals} goal${row.goals === 1 ? "" : "s"}`}
        />
      )}
      {row.assists > 0 && (
        <Chip
          label="A"
          value={row.assists}
          tone="text-emerald-400"
          title={`${row.assists} assist${row.assists === 1 ? "" : "s"}`}
        />
      )}
      {(isGk || isDef) && row.clean_sheets > 0 && (
        <Chip
          label="CS"
          value={row.clean_sheets}
          tone="text-emerald-400"
          title="Clean sheet (+4 pts)"
        />
      )}
      {isMid && row.clean_sheets > 0 && (
        <Chip
          label="CS"
          value={row.clean_sheets}
          tone="text-emerald-400"
          title="Clean sheet (+1 pt for midfielders)"
        />
      )}
      {/* Forwards: clean sheets don't earn pts, so we don't show the chip. */}
      {isOutfield && (
        <Chip
          label="D"
          value={defconCount}
          tone={defconMet ? "text-emerald-400" : "text-text/60"}
          title={
            defconMet
              ? `Defensive contributions: ${defconCount} (≥ ${defconThreshold(elementType)} threshold met → +2 bonus)`
              : `Defensive contributions: ${defconCount} (threshold ${defconThreshold(elementType)} not met)`
          }
        />
      )}
      {isGk && row.saves > 0 && (
        <Chip
          label="Sv"
          value={row.saves}
          tone={row.saves >= 3 ? "text-emerald-400" : "text-text/60"}
          title={
            row.saves >= 3
              ? `${row.saves} saves (every 3 = +1 pt)`
              : `${row.saves} save${row.saves === 1 ? "" : "s"} (3+ = +1 pt)`
          }
        />
      )}
      {(isGk || isDef) && row.goals_conceded >= 2 && (
        <Chip
          label="GC"
          value={row.goals_conceded}
          tone="text-rose-400"
          title="Goals conceded (every 2 = -1 pt)"
        />
      )}
      {row.bonus > 0 && (
        <Chip
          label="B"
          value={row.bonus}
          tone="text-amber-400"
          title="Bonus points (BPS top 3)"
        />
      )}
      {/* Suppress unused-var lints for branches we don't currently render. */}
      {/* (isFwd flag retained for future per-position chip variants) */}
      {isFwd && null}
    </div>
  );
};

// The chip that sits next to the points cell in the per-GW table.
// Folds the role information (B / C / TC) into the same column as the
// points value, so the previous standalone "Role" column can be dropped.
type MultiplierChip = { label: string; className: string; tooltip: string } | null;

const multiplierChip = (mult: number): MultiplierChip => {
  if (mult === 0)
    return {
      label: "B",
      className: "bg-accent4 text-text/60",
      tooltip: "Benched — points didn't count toward your score",
    };
  if (mult === 2)
    return {
      label: "C",
      className: "bg-magenta text-white",
      tooltip: "Captained — points doubled",
    };
  if (mult === 3)
    return {
      label: "TC",
      className: "bg-magenta text-white",
      tooltip: "Triple captain — points tripled",
    };
  return null;
};

// What the user actually got from this player on this GW: 0 if benched
// (multiplier === 0), otherwise raw_points × multiplier.
const effectivePoints = (mult: number, raw: number): number =>
  mult === 0 ? 0 : raw * mult;

const PlayerImpactDetail: React.FC<Props> = ({ player, showRankImpact }) => {
  return (
    <div className="overflow-x-auto">
      <Table className="border-transparent text-xs sm:text-sm">
        <TableHeader>
          <TableRow className="border-b border-accent4 hover:bg-transparent">
            <TableHead className="h-7 px-1.5 text-text/70 sm:px-2">GW</TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              Pts
            </TableHead>
            <TableHead className="h-7 px-1.5 text-text/70 sm:px-2">Events</TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              Own%
            </TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              EO
            </TableHead>
            <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
              Excess
            </TableHead>
            {showRankImpact && (
              <TableHead className="h-7 px-1.5 text-right text-text/70 sm:px-2">
                Rank
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {player.per_gw.map((row) => {
            const benched = row.multiplier === 0;
            const pts = effectivePoints(row.multiplier, row.points);
            const big = !benched && pts >= POINTS_HAUL_THRESHOLD;
            const chip = multiplierChip(row.multiplier);

            const ptsValue = (
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${
                  big ? "text-emerald-400" : benched ? "text-text/40" : "text-text"
                }`}
              >
                {chip && (
                  <span
                    className={`rounded-sm px-1.5 py-[1px] text-[10px] font-semibold ${chip.className}`}
                  >
                    {chip.label}
                  </span>
                )}
                {pts}
              </span>
            );

            return (
              <TableRow
                key={row.gw}
                className="border-b border-accent4 hover:bg-transparent"
              >
                <TableCell className="px-1.5 py-1.5 text-text/80 sm:px-2">
                  {row.gw}
                </TableCell>
                <TableCell className="px-1.5 py-1.5 text-right sm:px-2">
                  {chip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{ptsValue}</TooltipTrigger>
                      <TooltipContent>{chip.tooltip}</TooltipContent>
                    </Tooltip>
                  ) : big ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{ptsValue}</TooltipTrigger>
                      <TooltipContent>
                        Big GW haul ({POINTS_HAUL_THRESHOLD}+ pts)
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    ptsValue
                  )}
                </TableCell>
                <TableCell className="px-1.5 py-1.5 sm:px-2">
                  <EventChips row={row} elementType={player.element_type} />
                </TableCell>
                <TableCell className="px-1.5 py-1.5 text-right text-text/80 sm:px-2">
                  {(row.ownership_pct * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="px-1.5 py-1.5 text-right text-text/80 sm:px-2">
                  {(row.eo * 100).toFixed(1)}%
                </TableCell>
                <TableCell
                  className={`px-1.5 py-1.5 text-right sm:px-2 ${
                    row.excess > 0
                      ? "text-emerald-400"
                      : row.excess < 0
                        ? "text-rose-400"
                        : "text-text/60"
                  }`}
                >
                  {row.excess >= 0 ? "+" : ""}
                  {row.excess.toFixed(1)}
                </TableCell>
                {showRankImpact && (
                  <TableCell
                    className={`px-1.5 py-1.5 text-right font-semibold sm:px-2 ${rankImpactColorClass(
                      row.rank_impact_gw,
                    )}`}
                  >
                    {formatRankDelta(row.rank_impact_gw)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayerImpactDetail;
