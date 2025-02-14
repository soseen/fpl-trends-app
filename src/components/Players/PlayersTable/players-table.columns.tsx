"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Footballer } from "src/queries/types";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

export const playersTableColumns: ColumnDef<FootballerWithGameweekStats>[] = [
  {
    accessorKey: "teamName",
    header: "Team",
  },
  {
    accessorKey: "web_name",
    header: "Name",
  },
  {
    accessorKey: "assists",
    header: "assists",
  },
  {
    accessorKey: "total_points",
    header: "points",
  },
];
