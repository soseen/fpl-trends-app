import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React from "react";
import { getFootballersImage, getTeamsBadge } from "src/utils/images";
import { FaUserCircle } from "react-icons/fa";
import { FootballerPosition } from "src/queries/types";
import { useFootballerDetailsContext } from "src/components/FootballerDetailsContext/footballer-details.context";
import { Button } from "@/components/ui/button";

export const usePlayersTableColumns = () => {
  const { setFootballer } = useFootballerDetailsContext();
  const columnHelper = createColumnHelper<FootballerWithGameweekStats>();

  const playersTableColumns = [
    columnHelper.accessor("web_name", {
      header: "Player",
      cell: (info) => {
        const footballer = info.row.original;
        const [imageError, setImageError] = React.useState(false);

        return (
          <Button
            className="flex w-fit flex-nowrap items-center justify-center gap-4 bg-transparent p-0"
            onClick={() => setFootballer(footballer)}
          >
            {imageError ? (
              <FaUserCircle className="h-5 w-5 text-accent shadow-md md:h-[42px] md:w-[42px]" />
            ) : (
              <img
                src={getFootballersImage(footballer.code)}
                className="h-6 w-6 rounded-full object-contain md:h-[42px] md:w-[42px]"
                alt={footballer.web_name}
                onError={() => setImageError(true)}
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
          </Button>
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
    columnHelper.accessor("goalsPerGame", {
      header: "G/game",
      cell: (info) => <p>{info.getValue().toFixed(1)}</p>,
      enableMultiSort: true,
    }),
    columnHelper.accessor("totalAssists", {
      header: "Assists",
      cell: (info) => <p>{info.getValue()}</p>,
      enableMultiSort: true,
    }),
    columnHelper.accessor("assistsPerGame", {
      header: "A/game",
      cell: (info) => <p>{info.getValue().toFixed(1)}</p>,
      enableMultiSort: true,
    }),
    columnHelper.accessor("totalCleanSheets", {
      header: "Cleansheets",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("totalXGI", {
      header: "xGI",
      cell: (info) => <p>{info.getValue().toFixed(2)}</p>,
      enableMultiSort: true,
    }),
    columnHelper.accessor("xGIPerGame", {
      header: "xGI/game",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("minPerGame", {
      header: "Min/game",
      cell: (info) => <p>{info.getValue().toFixed(0)}</p>,
    }),
    columnHelper.accessor("totalSaves", {
      header: "Saves",
      cell: (info) => <p>{info.getValue()}</p>,
    }),
    columnHelper.accessor("savesPerGame", {
      header: "Saves/game",
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
