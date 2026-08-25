import { createColumnHelper } from "@tanstack/react-table";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { FootballerPosition } from "src/queries/types";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { Button } from "@/components/ui/button";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { removeAccents } from "src/utils/strings";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";

export const usePlayersTableColumns = () => {
  const { setFootballer } = useFootballerDetailsContext();
  const isPreseason = useSelector((state: RootState) => state.gameweeks.isPreseason);
  const columnHelper = createColumnHelper<FootballerWithGameweekStats>();

  const playersTableColumns = [
    columnHelper.accessor("web_name", {
      header: "Player",
      cell: (info) => {
        const footballer = info.row.original;

        return (
          <Button
            className="flex h-fit w-fit flex-nowrap items-center justify-center gap-4 bg-transparent p-0"
            onClick={() => setFootballer(footballer)}
          >
            <FootballerImage
              code={footballer.code}
              teamCode={footballer.team_code}
              className="h-7 w-7 rounded-none lg:h-14 lg:w-14"
            />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {footballer.web_name}
            </span>
          </Button>
        );
      },
      enableSorting: false,
      size: 180,
      filterFn: (row, columnId, filterValue) => {
        const normalizedName = removeAccents(
          (row.getValue(columnId) as string).toLowerCase(),
        );
        const normalizedSearch = removeAccents(filterValue.toLowerCase());

        return normalizedName.includes(normalizedSearch);
      },
    }),
    columnHelper.accessor("totalPoints", {
      header: "Points",
      cell: (info) => <p>{info.getValue()}</p>,
      size: 72,
    }),
    columnHelper.accessor("now_cost", {
      header: "Price",
      cell: (info) => <p>£{(info.getValue() / 10).toFixed(1)}m</p>,
      enableMultiSort: true,
      size: 78,
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
      size: 88,
    }),
    columnHelper.accessor("totalGoals", {
      header: "Goals",
      cell: (info) => <p>{info.getValue()}</p>,
      enableMultiSort: true,
      size: 72,
    }),
    columnHelper.accessor("goalsPerGame", {
      header: "G/game",
      cell: (info) => <p>{info.getValue().toFixed(1)}</p>,
      enableMultiSort: true,
      size: 82,
    }),
    columnHelper.accessor("totalAssists", {
      header: "Assists",
      cell: (info) => <p>{info.getValue()}</p>,
      enableMultiSort: true,
      size: 76,
    }),
    columnHelper.accessor("assistsPerGame", {
      header: "A/game",
      cell: (info) => <p>{info.getValue().toFixed(1)}</p>,
      enableMultiSort: true,
      size: 82,
    }),
    columnHelper.accessor("totalCleanSheets", {
      header: "Cleansheets",
      cell: (info) => <p>{info.getValue()}</p>,
      size: 104,
    }),
    columnHelper.accessor("defconsPerGame", {
      header: "Defcons/g",
      cell: (info) => <p>{info.getValue()}</p>,
      sortingFn: (a, b, columnId) =>
        parseFloat(a.getValue(columnId)) - parseFloat(b.getValue(columnId)),
      enableMultiSort: true,
      size: 94,
    }),
    columnHelper.accessor("totalDefcons", {
      header: "Defcons",
      cell: (info) => <p>{info.getValue()}</p>,
      enableMultiSort: true,
      size: 84,
    }),
    columnHelper.accessor("xGSPerGame", {
      header: "xG/game",
      cell: (info) => <p>{info.getValue()}</p>,
      sortingFn: (a, b, columnId) =>
        parseFloat(a.getValue(columnId)) - parseFloat(b.getValue(columnId)),
      enableMultiSort: true,
      size: 86,
    }),
    columnHelper.accessor("xAPerGame", {
      header: "xA/game",
      cell: (info) => <p>{info.getValue()}</p>,
      sortingFn: (a, b, columnId) =>
        parseFloat(a.getValue(columnId)) - parseFloat(b.getValue(columnId)),
      enableMultiSort: true,
      size: 86,
    }),
    columnHelper.accessor("totalXGI", {
      header: "xGI",
      cell: (info) => <p>{info.getValue().toFixed(2)}</p>,
      enableMultiSort: true,
      size: 68,
    }),
    columnHelper.accessor("xGIPerGame", {
      header: "xGI/game",
      cell: (info) => <p>{info.getValue()}</p>,
      size: 86,
    }),
    columnHelper.accessor("minPerGame", {
      header: "Min/game",
      cell: (info) => <p>{info.getValue().toFixed(0)}</p>,
      size: 86,
    }),
    columnHelper.accessor("totalSaves", {
      header: "Saves",
      cell: (info) => <p>{info.getValue()}</p>,
      size: 72,
    }),
    columnHelper.accessor("savesPerGame", {
      header: "Saves/game",
      cell: (info) => <p>{info.getValue()}</p>,
      size: 96,
    }),
    columnHelper.accessor("maxOwnership", {
      header: isPreseason ? "Current ownership" : "Max ownership",
      cell: (info) => <p>{info.getValue().toFixed(2)}%</p>,
      size: isPreseason ? 140 : 120,
    }),
    columnHelper.accessor("teamName", {
      header: "Team",
      cell: (info) => <p>{info.getValue()}</p>,
      size: 110,
    }),
  ];

  return { playersTableColumns };
};
