import {
  ColumnFilter,
  ColumnFiltersState,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
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
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

import clsx from "clsx";
import { usePlayersTableColumns } from "./use-players-table-columns";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import PlayersTableFilters from "./players-table-filters";
import { useTableFiltersFromParams } from "./use-table-filters-from-params";
import { isEqual } from "lodash";
import PlayersTablePagination from "./players-table-pagination";

const DEFAULT_SORTING = [{ desc: true, id: "totalPoints" }];

export const FILTERS_DEFAULT_STATE: ColumnFiltersState = [
  { id: "web_name", value: "" },
  { id: "maxOwnership", value: [0, 100] },
  { id: "teamName", value: "" },
  { id: "element_type", value: [1, 2, 3, 4] },
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
  });

  const isClearState = useMemo(() => {
    const isDefaultSorting =
      sorting.length === DEFAULT_SORTING.length &&
      sorting.every((sortingValue) => {
        const defaultSorting = DEFAULT_SORTING.find((s) => s.id === sortingValue.id);
        return defaultSorting ? isEqual(sortingValue.desc, defaultSorting.desc) : false;
      });

    const isDefaultFilters =
      columnFilters.length === FILTERS_DEFAULT_STATE.length &&
      columnFilters.every((filter) => {
        const defaultFilter = FILTERS_DEFAULT_STATE.find((f) => f.id === filter.id);
        return defaultFilter ? isEqual(filter.value, defaultFilter.value) : false;
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
      <div className="mb-2 w-full overflow-x-auto rounded-md border-2 border-accent3 shadow-md md:mb-4">
        <Table className="max-w-[100vw] overflow-scroll bg-accent2 text-xs text-text md:text-sm lg:text-base">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="p-2">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-1 cursor-pointer rounded-md border-b-2 border-accent3 px-1 py-1 md:px-2"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      <span className="flex items-center gap-2">
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={clsx(
                        id % 2 === 0 ? "bg-primary" : "bg-accent2",
                        "border-b-[1px] border-accent3 px-1 py-1 md:px-2",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
