import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeamsTable } from "./use-teams-table";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getTeamsBadge } from "src/utils/images";
import TeamsTableSkeleton from "./teams-table.skeleton";
import clsx from "clsx";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";
import { AsyncThunkStatus } from "src/redux/types";

const TeamsTable = () => {
  const { teams, isDefensiveStats, onStatsTypeChange } = useTeamsTable();
  const [gpTooltipOpen, setGpTooltipOpen] = useState(false);
  const teamsStatus = useSelector((state: RootState) => state.teams.status);
  const { isPreseason, analysisSeasonLabel } = useSelector(
    (state: RootState) => state.gameweeks,
  );

  if (teamsStatus === AsyncThunkStatus.loading || teamsStatus === AsyncThunkStatus.idle) {
    return <TeamsTableSkeleton />;
  }

  if (isPreseason) {
    return (
      <div className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-md border border-accent4/70 bg-secondary px-5 text-center text-text shadow-xl">
        <h2 className="text-sm font-semibold md:text-lg">Team Rankings</h2>
        <p className="mt-2 max-w-sm text-xs leading-5 text-text/60 md:text-sm">
          Player totals from {analysisSeasonLabel ?? "the previous season"} are available,
          but team rankings need the archived gameweek feed. They will return with
          current-season match data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col text-text">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs text-text md:text-base">Team Rankings</h2>
        <ToggleGroup
          type="single"
          value={isDefensiveStats ? "defensive" : "attacking"}
          onValueChange={onStatsTypeChange}
          aria-label="Team ranking stats"
          className="shrink-0 gap-0 rounded-md border border-accent4 bg-accent5 p-0.5"
        >
          {[
            { value: "defensive", label: "Defensive" },
            { value: "attacking", label: "Attacking" },
          ].map(({ value, label }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="h-7 rounded px-2 text-[11px] text-text/60 hover:bg-accent3 hover:text-text data-[state=on]:bg-magenta data-[state=on]:text-white md:text-xs"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Table className="table-fixed rounded-md bg-secondary text-[13px] tabular-nums shadow-xl sm:text-sm">
        <colgroup>
          <col className="w-7" />
          <col />
          <col className="w-7" />
          <col className="w-[104px]" />
          <col className="w-14" />
        </colgroup>
        <TableHeader>
          <TableRow className="border-accent4 bg-accent5/50 hover:bg-accent5/50">
            <TableHead scope="col" className="px-1.5 py-2 text-right text-text/60">
              #
            </TableHead>
            <TableHead scope="col" className="px-1.5 py-2 text-text/80">
              Team
            </TableHead>
            <TableHead scope="col" className="px-1.5 py-2 text-right text-text/60">
              <Tooltip open={gpTooltipOpen} onOpenChange={setGpTooltipOpen}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="GP: games played in the selected gameweek range"
                    onPointerDown={(event) => {
                      // Keep Radix from closing before the click toggles the tooltip.
                      event.preventDefault();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      setGpTooltipOpen((open) => !open);
                    }}
                    className="rounded-sm underline decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-magenta"
                  >
                    GP
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Games played in the selected gameweek range
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead scope="col" className="px-1.5 py-2 text-right text-text/80">
              <div className="grid grid-cols-[1fr_3rem] items-center gap-1">
                <span>{isDefensiveStats ? "npxGA" : "npxG"}</span>
                <span className="text-[10px] font-normal text-text/50">Δ season</span>
              </div>
            </TableHead>
            <TableHead scope="col" className="px-1.5 py-2 text-right text-text/80">
              {isDefensiveStats ? "Clean Sheets" : "Goals Scored"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => {
            const diff = Number(
              (
                (team?.avg ?? 0) -
                (isDefensiveStats
                  ? (team.avgNPXGAFullSeason ?? 0)
                  : (team.avgNPXGFullSeason ?? 0))
              ).toFixed(2),
            );
            const rankingDiff = (team.fullSeasonRank ?? 0) - (index + 1);
            const isImproved = isDefensiveStats ? diff < 0 : diff > 0;

            return (
              <TableRow
                className={clsx(
                  "border-accent4/40 hover:bg-accent4/40",
                  index % 2 === 0 && "bg-accent3/60",
                )}
                key={team?.name}
              >
                <TableCell className="px-1.5 py-2 text-right text-text/50">
                  {index + 1}
                </TableCell>

                <TableCell className="px-1.5 py-2 text-left">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <img
                      src={getTeamsBadge(team?.code)}
                      alt={team?.short_name}
                      className="h-4 w-4 shrink-0 object-contain"
                    />
                    <span className="min-w-0 flex-1 truncate" title={team.name}>
                      <span className="lg:hidden xl:inline">{team.name}</span>
                      <span className="hidden lg:inline xl:hidden">
                        {team.short_name}
                      </span>
                    </span>
                    {rankingDiff !== 0 && (
                      <span
                        className={clsx(
                          "inline-flex w-7 shrink-0 items-center justify-end gap-0.5 text-[10px] md:text-xs",
                          rankingDiff > 0 ? "text-emerald-300/80" : "text-rose-300/80",
                        )}
                        aria-label={`${Math.abs(rankingDiff)} places ${rankingDiff > 0 ? "higher" : "lower"} than the full-season ranking`}
                      >
                        {rankingDiff > 0 ? (
                          <FaArrowUp className="h-2.5 w-2.5" aria-hidden />
                        ) : (
                          <FaArrowDown className="h-2.5 w-2.5" aria-hidden />
                        )}
                        {Math.abs(rankingDiff)}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-1.5 py-2 text-right text-text/60">
                  {team?.gamesPlayed}
                </TableCell>

                <TableCell className="px-1.5 py-2 text-right">
                  <div className="grid grid-cols-[1fr_3rem] items-center gap-1">
                    <span className="font-semibold text-white/90">
                      {team?.avg?.toFixed(2)}
                    </span>
                    {diff !== 0 ? (
                      <span
                        className={clsx(
                          "inline-flex items-center justify-end gap-0.5 text-[10px] md:text-xs",
                          isImproved ? "text-emerald-300/80" : "text-rose-300/80",
                        )}
                        aria-label={`${Math.abs(diff).toFixed(2)} ${diff > 0 ? "above" : "below"} the season average`}
                      >
                        {isImproved ? (
                          <FaArrowUp className="h-2.5 w-2.5" aria-hidden />
                        ) : (
                          <FaArrowDown className="h-2.5 w-2.5" aria-hidden />
                        )}
                        {Math.abs(diff).toFixed(2)}
                      </span>
                    ) : (
                      <span
                        className="text-[10px] text-text/40 md:text-xs"
                        aria-label="Same as the season average"
                      >
                        —
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-1.5 py-2 text-right font-medium text-white/90">
                  {isDefensiveStats ? team?.totalCleanSheets : team?.totalGoals}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <p className="mt-2 text-[10px] text-text/60 md:text-xs">
        Arrows compare rank and per-game averages with the full season.
      </p>
    </div>
  );
};

export default TeamsTable;
