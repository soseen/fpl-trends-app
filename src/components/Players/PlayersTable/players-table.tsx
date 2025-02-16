import {
  ColumnFiltersState,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
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
import { usePlayersTable } from "./use-players-table";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import PlayersTableFilters from "./players-table-filters";

const filtersClearState: ColumnFiltersState = [
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
  const { playersTableColumns } = usePlayersTable();
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(filtersClearState);

  const [sorting, setSorting] = useState<ColumnSort[]>([
    { desc: true, id: "totalPoints" },
  ]);

  const table = useReactTable<FootballerWithGameweekStats>({
    data: footballers,
    columns: playersTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting, columnFilters, columnVisibility: { teamName: false } },
    enableMultiSort: true,
    maxMultiSortColCount: 2,
  });

  if (status === AppInitStatus.loading) return <PlayersTableSkeleton />;

  return (
    <div className="w-full">
      <PlayersTableFilters
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
      <div className="w-full overflow-x-auto rounded-md border-2 border-accent3 shadow-md">
        <Table className="max-w-[100vw] overflow-scroll bg-accent2 text-xs text-text md:text-sm lg:text-base">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="p-2">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-1 cursor-pointer rounded-md border-b-2 border-accent3 p-1 md:p-2"
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
                        "border-b-[1px] border-accent3 p-1 md:p-2",
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
    </div>
  );
};

export default PlayersTable;
