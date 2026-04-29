import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerImpact } from "src/queries/getTeamImpact";
import { formatRankDelta, rankImpactColorClass, POINTS_HAUL_THRESHOLD } from "./format";

type Props = {
  player: PlayerImpact;
  showRankImpact: boolean;
};

// Per-GW breakdown shown when an accordion row is expanded. Mirrors the
// columns LiveFPL surfaces per GW: multiplier, raw points, ownership, EO,
// excess (signed pts above field), and the rank places attributed to that
// player from that GW.
const multiplierLabel = (mult: number): string => {
  if (mult === 0) return "B";
  if (mult === 2) return "C";
  if (mult === 3) return "TC";
  return "✓";
};

const PlayerImpactDetail: React.FC<Props> = ({ player, showRankImpact }) => {
  return (
    <div className="overflow-x-auto">
      <Table className="text-[11px] sm:text-xs">
        <TableHeader>
          <TableRow className="border-b border-accent4 hover:bg-transparent">
            <TableHead className="text-text/70 h-7 px-1.5 sm:px-2">GW</TableHead>
            <TableHead className="text-text/70 h-7 px-1.5 text-right sm:px-2">
              Role
            </TableHead>
            <TableHead className="text-text/70 h-7 px-1.5 text-right sm:px-2">
              Pts
            </TableHead>
            <TableHead className="text-text/70 h-7 px-1.5 text-right sm:px-2">
              Own%
            </TableHead>
            <TableHead className="text-text/70 h-7 px-1.5 text-right sm:px-2">
              EO
            </TableHead>
            <TableHead className="text-text/70 h-7 px-1.5 text-right sm:px-2">
              Excess
            </TableHead>
            {showRankImpact && (
              <TableHead className="text-text/70 h-7 px-1.5 text-right sm:px-2">
                Rank
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {player.per_gw.map((row) => (
            <TableRow
              key={row.gw}
              className="border-accent4/40 border-b hover:bg-transparent"
            >
              <TableCell className="text-text/80 px-1.5 py-1.5 sm:px-2">
                {row.gw}
              </TableCell>
              <TableCell className="px-1.5 py-1.5 text-right text-text sm:px-2">
                {multiplierLabel(row.multiplier)}
              </TableCell>
              <TableCell
                className={`px-1.5 py-1.5 text-right font-semibold sm:px-2 ${
                  row.points >= POINTS_HAUL_THRESHOLD ? "text-emerald-400" : "text-text"
                }`}
                title={
                  row.points >= POINTS_HAUL_THRESHOLD
                    ? `Big GW haul (${POINTS_HAUL_THRESHOLD}+ pts)`
                    : undefined
                }
              >
                {row.points}
              </TableCell>
              <TableCell className="text-text/80 px-1.5 py-1.5 text-right sm:px-2">
                {(row.ownership_pct * 100).toFixed(1)}
              </TableCell>
              <TableCell className="text-text/80 px-1.5 py-1.5 text-right sm:px-2">
                {row.eo.toFixed(2)}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayerImpactDetail;
