import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { playersTableColumns } from "./players-table.columns";
import { Footballer } from "src/queries/types";
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

const PlayersTable = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { status } = useAppInitContext();

  const table = useReactTable<FootballerWithGameweekStats>({
    data: footballers,
    columns: playersTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (status === AppInitStatus.loading) return <PlayersTableSkeleton />;

  return (
    <div className="w-full">
      <Table className="rounded-md bg-secondary text-text shadow-xl">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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
  );
};

export default PlayersTable;
