import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { useTeamsTable } from "./use-teams-table";
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
    <div className="flex w-full flex-col text-text">
      <div className="mb-4 flex flex-shrink flex-grow-0 items-center justify-between">
        <h2 className="text-xs text-text md:text-lg">Team Rankings</h2>
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

      <Table className="rounded-md bg-secondary px-4 py-6 text-sm shadow-xl md:px-6 md:text-base">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] p-2">#</TableHead>
            <TableHead className="p-2">Team</TableHead>
            <TableHead className="p-2 text-right">
              {isDefensiveStats ? "Avg xGC" : "Avg xGS"}
            </TableHead>
            <TableHead className="p-2 text-right">
              {isDefensiveStats ? "Clean Sheets" : "Goals Scored"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => {
            const diff =
              (team?.avg ?? 0) -
              (isDefensiveStats
                ? (team.avgXGCFullSeason ?? 0)
                : (team.avgXGSFullSeason ?? 0));
            const rankingDiff = (team.fullSeasonRank ?? 0) - (index + 1);

            return (
              <TableRow className={index % 2 === 0 ? "bg-accent3" : ""} key={team?.name}>
                <TableCell className="p-2 text-left font-medium">{index + 1}</TableCell>

                <TableCell className="p-2 text-left">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <img
                      src={getTeamsBadge(team?.code)}
                      alt={team?.short_name}
                      className="h-4 w-4 object-contain lg:h-5 lg:w-5"
                    />
                    <p>{team?.name}</p>
                    {rankingDiff !== 0 && (
                      <span
                        className={`text-sm ${rankingDiff > 0 ? "text-green-500" : "text-red-500"} flex items-center`}
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

                <TableCell className="flex items-center justify-end p-2 text-right">
                  <p>{team?.avg?.toFixed(2)}</p>
                  {diff !== 0 && (
                    <span
                      className={`text-sm ${diff < 0 ? "text-green-500" : "text-red-500"} flex items-center`}
                    >
                      {diff < 0 ? (
                        <FaArrowUp className="mx-1 inline" />
                      ) : (
                        <FaArrowDown className="mx-1 inline" />
                      )}
                      <p>{Math.abs(diff).toFixed(2)}</p>
                    </span>
                  )}
                </TableCell>

                <TableCell className="p-2 text-right">
                  {isDefensiveStats ? team?.totalCleanSheets : team?.totalGoals}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <p className="mt-2 text-xs italic md:text-sm">
        * presented data is compared with the season's total
      </p>
    </div>
  );
};

export default TeamsTable;
