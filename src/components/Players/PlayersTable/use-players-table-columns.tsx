import { createColumnHelper } from "@tanstack/react-table";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import React from "react";
import { FootballerPosition } from "src/queries/types";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { Button } from "@/components/ui/button";
import FootballerImage from "src/components/FootballerImage/footballer-image";

export const usePlayersTableColumns = () => {
  const { setFootballer } = useFootballerDetailsContext();
  const columnHelper = createColumnHelper<FootballerWithGameweekStats>();

  const playersTableColumns = [
    columnHelper.accessor("web_name", {
      header: "Player",
      cell: (info) => {
        const footballer = info.row.original;

        return (
          <Button
            className="flex w-fit flex-nowrap items-center justify-center gap-4 bg-transparent p-0"
            onClick={() => setFootballer(footballer)}
          >
            <FootballerImage
              code={footballer.code}
              className="h-7 w-7 rounded-none lg:h-14 lg:w-14"
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
