import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import React from "react";
import { FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

type Props = {
  table: Table<FootballerWithGameweekStats>;
};

const PlayersTablePagination = ({ table }: Props) => {
  return (
    <div className="flex w-fit items-center justify-center gap-1 whitespace-nowrap text-text md:gap-2">
      <Button
        className="p-0 disabled:opacity-20"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <FaChevronLeft />
      </Button>
      <p className="text-center text-xs sm:text-sm lg:text-base">
        Page: {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </p>
      <Button
        className="p-0 disabled:opacity-20"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <FaChevronRight />
      </Button>
    </div>
  );
};

export default PlayersTablePagination;
