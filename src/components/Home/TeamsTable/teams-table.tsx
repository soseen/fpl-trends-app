import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { useTeamsTable } from "./useTeamsTable";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTeamsBadge } from "src/utils/images";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import TeamsTableSkeleton from "./teams-table.skeleton";

const TeamsTable = () => {
  const { teams, isDefensiveStats, onSelectValueChange } = useTeamsTable();
  const { status } = useAppInitContext();

  if (status === AppInitStatus.loading) return <TeamsTableSkeleton />;

  return (
    <div className="flex w-fit flex-col text-text">
      <div className="mb-4 flex flex-shrink flex-grow-0 items-center justify-between">
        <h2 className="text-xs text-text md:text-lg">
          {isDefensiveStats ? "Best Defenses" : "Best Attacks"}
        </h2>
        <Select defaultValue="defensive" onValueChange={onSelectValueChange}>
          <SelectTrigger className="w-[120px] bg-magenta px-2 py-1 text-text">
            <SelectValue placeholder="Stats Type" />
          </SelectTrigger>
          <SelectContent sideOffset={5} className="w-[120px] cursor-pointer bg-magenta">
            <SelectItem
              className="outline-non cursor-pointer px-2 py-1 text-text"
              value="attacking"
            >
              Attacking
            </SelectItem>
            <SelectItem
              className="cursor-pointer px-2 py-1 text-text outline-none"
              value="defensive"
            >
              Defensive
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table className="w-auto rounded-md bg-secondary px-4 py-6 shadow-xl md:px-6">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] px-4 py-2">#</TableHead>
            <TableHead className="px-4 py-2">Team</TableHead>
            <TableHead className="px-4 py-2 text-right">Avg xGC</TableHead>
            <TableHead className="px-4 py-2 text-right">Clean Sheets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => {
            const xGCDiff = (team.avgXGC ?? 0) - (team.avgXGCFullSeason ?? 0);
            const rankingDiff = (team.fullSeasonRank ?? 0) - (index + 1);

            return (
              <TableRow
                style={index % 2 === 0 ? { backgroundColor: "--var(accent)" } : {}}
                key={team?.name}
              >
                {/* Position */}
                <TableCell className="px-4 py-2 text-center font-medium">
                  {index + 1}
                </TableCell>

                {/* Team Name & Badge */}
                <TableCell className="px-4 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <img
                      src={getTeamsBadge(team?.code)}
                      alt={team?.short_name}
                      className="h-4 w-4 object-contain"
                    />
                    {team?.name}
                    {rankingDiff !== 0 && (
                      <span
                        className={`text-sm ${rankingDiff > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {rankingDiff > 0 ? (
                          <FaArrowUp className="mx-1 inline" />
                        ) : (
                          <FaArrowDown className="mx-1 inline" />
                        )}
                        {Math.abs(rankingDiff)}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Avg xGC */}
                <TableCell className="px-4 py-2 text-right">
                  {team?.avgXGC?.toFixed(2)}
                  {xGCDiff !== 0 && (
                    <span
                      className={`text-sm ${xGCDiff < 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {xGCDiff < 0 ? (
                        <FaArrowUp className="mx-1 inline" />
                      ) : (
                        <FaArrowDown className="mx-1 inline" />
                      )}
                      {Math.abs(xGCDiff).toFixed(2)}
                    </span>
                  )}
                </TableCell>

                {/* Clean Sheets */}
                <TableCell className="px-4 py-2 text-right">
                  {team?.totalCleanSheets}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamsTable;
