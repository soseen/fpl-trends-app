import { createColumnHelper } from "@tanstack/react-table";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React from "react";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import { FaUserCircle } from "react-icons/fa";
import { FootballerPosition } from "src/queries/types";

export const usePlayersTable = () => {
  const columnHelper = createColumnHelper<FootballerWithGameweekStats>();

  const playersTableColumns = [
    columnHelper.accessor("web_name", {
      header: "Player",
      cell: (info) => {
        const footballer = info.row.original;
        const [imageError, setImageError] = React.useState(false);

        return (
          <div className="flex w-fit flex-nowrap items-center justify-center gap-4">
            {imageError ? (
              <FaUserCircle className="h-6 w-6 text-accent shadow-md md:h-12 md:w-12" /> // ✅ React Icon as Fallback
            ) : (
              <img
                src={getFootballersImage(footballer.code)}
                className="h-6 w-6 rounded-full object-contain md:h-12 md:w-12"
                alt={footballer.web_name}
                onError={() => setImageError(true)} // ✅ When error occurs, switch to icon
              />
            )}
            <img
              src={getTeamsBadge(footballer.team_code)}
              className="hidden h-6 w-6 object-contain md:block"
              alt={footballer.web_name}
            />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {footballer.web_name}
            </span>
          </div>
        );
      },
      enableSorting: false,
      size: 250,
    }),
    columnHelper.accessor("totalPoints", {
      header: "Points",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("element_type", {
      header: "Position",
      cell: (info) => (
        <p>
          {Object.keys(FootballerPosition).find(
            (key) =>
              FootballerPosition[key as keyof typeof FootballerPosition] ===
              info.getValue(),
          )}
        </p>
      ),
      filterFn: (row, columnId, filterValue) =>
        (filterValue as number[]).includes(row.getValue(columnId)),
    }),
    columnHelper.accessor("totalGoals", {
      header: "Goals",
      cell: (info) => <p>{info.getValue()}</p>,
      enableMultiSort: true,
    }),
    columnHelper.accessor("totalAssists", {
      header: "Assists",
      cell: (info) => <p>{info.getValue()}</p>,
      enableMultiSort: true,
    }),
    columnHelper.accessor("totalCleanSheets", {
      header: "Cleansheets",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("xGIPerGame", {
      header: "xGI/game",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("totalSaves", {
      header: "Saves",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("maxOwnership", {
      header: "Max ownership",
      cell: (info) => <p>{info.getValue().toFixed(2)}%</p>,
    }),
    columnHelper.accessor("teamName", {
      header: "Team",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
  ];

  return { playersTableColumns };
};
