import type { ColumnFiltersState, ColumnSort } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "src/redux/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import PlayersTableSkeleton from "./players-table.skeleton";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

import clsx from "clsx";
import { usePlayersTableColumns } from "./use-players-table-columns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import PlayersTableFilters from "./players-table-filters";
import { useTableFiltersFromParams } from "./use-table-filters-from-params";
import PlayersTablePagination from "./players-table-pagination";

const DEFAULT_SORTING = [{ desc: true, id: "totalPoints" }];
const areFilterValuesEqual = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const getColumnGroupClasses = (columnIndex: number, isEvenRow?: boolean) => {
  const startsStatGroup = columnIndex > 0;
  const isFirstColumn = columnIndex === 0;
  const isHighlightedColumn = !isFirstColumn && columnIndex % 2 === 1;

  return {
    groupDivider:
      startsStatGroup &&
      "border-l border-l-accent3/80 shadow-[-4px_0_8px_-10px_rgb(0_0_0_/_0.8)]",
    headerTone: isFirstColumn
      ? "bg-accent3"
      : isHighlightedColumn
        ? "bg-accent4"
        : "bg-accent5",
    cellTone: isFirstColumn
      ? isEvenRow
        ? "bg-accent2"
        : "bg-primary"
      : isHighlightedColumn
        ? isEvenRow
          ? "bg-accent4/65"
          : "bg-accent4/45"
        : isEvenRow
          ? "bg-primary"
          : "bg-accent5",
  };
};

export const FILTERS_DEFAULT_STATE: ColumnFiltersState = [
  { id: "web_name", value: "" },
  { id: "maxOwnership", value: [0, 100] },
  { id: "teamName", value: "" },
  { id: "element_type", value: [1, 2, 3, 4] },
  { id: "now_cost", value: [0, 150] },
];

const PlayersTable = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { status } = useAppInitContext();
  const { playersTableColumns } = usePlayersTableColumns();
  const { defaultFilters, sortingFromParams } = useTableFiltersFromParams();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilters);
  const [sorting, setSorting] = useState<ColumnSort[]>(
    sortingFromParams ?? DEFAULT_SORTING,
  );
  const [columnVisibility, setColumnVisibility] = useState<
    Partial<Record<keyof FootballerWithGameweekStats, boolean>>
  >({
    points_per_game: false,
    savesPerGame: false,
    totalSaves: false,
    teamName: false,
    goalsPerGame: false,
    assistsPerGame: false,
    totalXGI: false,
    totalDefcons: false,
    element_type: false,
  });

  const isClearState = useMemo(() => {
    const isDefaultSorting =
      sorting.length === DEFAULT_SORTING.length &&
      sorting.every((sortingValue) => {
        const defaultSorting = DEFAULT_SORTING.find((s) => s.id === sortingValue.id);
        return defaultSorting
          ? areFilterValuesEqual(sortingValue.desc, defaultSorting.desc)
          : false;
      });

    const isDefaultFilters =
      columnFilters.length === FILTERS_DEFAULT_STATE.length &&
      columnFilters.every((filter) => {
        const defaultFilter = FILTERS_DEFAULT_STATE.find((f) => f.id === filter.id);
        return defaultFilter
          ? areFilterValuesEqual(filter.value, defaultFilter.value)
          : false;
      });

    return isDefaultSorting && isDefaultFilters;
  }, [sorting, columnFilters]);

  const resetFilters = useCallback(() => {
    setSorting(DEFAULT_SORTING);
    setColumnFilters(FILTERS_DEFAULT_STATE);
  }, [setColumnFilters]);

  const table = useReactTable<FootballerWithGameweekStats>({
    data: footballers,
    columns: playersTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 20,
      },
    },
    enableMultiSort: true,
    maxMultiSortColCount: 2,
  });

  if (status === AppInitStatus.loading) return <PlayersTableSkeleton />;
  return (
    <div className="w-full">
      <PlayersTableFilters
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        resetFilters={resetFilters}
        isClearState={isClearState}
        playersTableColumns={playersTableColumns as any}
        table={table}
      />
      <div className="mb-2 w-full overflow-x-auto rounded-md border border-accent4 shadow-md md:mb-4">
        <Table className="w-max min-w-full table-auto border-separate border-spacing-0 bg-accent2 text-xs text-text md:text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="p-2">
                {headerGroup.headers.map((header, columnIndex) => {
                  const isSorted = !!header.column.getIsSorted();
                  const columnGroupClasses = getColumnGroupClasses(columnIndex);
                  const isFirstColumn = columnIndex === 0;

                  return (
                    <TableHead
                      key={header.id}
                      className={clsx(
                        "sticky top-0 z-20 cursor-pointer whitespace-nowrap border-b-2 border-r border-b-accent border-r-accent3/80 px-2 py-2 text-text last:border-r-0 md:px-3",
                        columnGroupClasses.headerTone,
                        columnGroupClasses.groupDivider,
                        isFirstColumn &&
                          "left-0 z-30 min-w-40 max-w-48 border-r-2 border-r-accent md:min-w-44 md:max-w-52",
                        isSorted && "bg-magenta3 text-white",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      <span className="flex items-center gap-1.5 md:gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getIsSorted() === "asc" ? (
                          <FaArrowUp className="text-xs" />
                        ) : (
                          ""
                        )}
                        {header.column.getIsSorted() === "desc" ? (
                          <FaArrowDown className="text-xs" />
                        ) : (
                          ""
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, id) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell, columnIndex) => {
                    const columnGroupClasses = getColumnGroupClasses(
                      columnIndex,
                      id % 2 === 0,
                    );
                    const isFirstColumn = columnIndex === 0;

                    return (
                      <TableCell
                        key={cell.id}
                        className={clsx(
                          "whitespace-nowrap border-b border-r border-b-accent3 border-r-accent3/80 px-2 py-2 last:border-r-0 md:px-3",
                          columnGroupClasses.cellTone,
                          columnGroupClasses.groupDivider,
                          isFirstColumn &&
                            "sticky left-0 z-10 min-w-40 max-w-48 border-r-2 border-r-accent md:min-w-44 md:max-w-52",
                          cell.column.getIsSorted() && "bg-magenta3/90 text-white",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={playersTableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full justify-end">
        <PlayersTablePagination table={table} />
      </div>
    </div>
  );
};

export default PlayersTable;
