import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AccessorKeyColumnDefBase,
  ColumnFilter,
  ColumnFiltersState,
  IdIdentifier,
  Table,
} from "@tanstack/react-table";
import clsx from "clsx";
import React, { useCallback, useMemo } from "react";
import { TiDelete } from "react-icons/ti";
import { useSelector } from "react-redux";
import { FootballerPosition } from "src/queries/types";
import { RootState } from "src/redux/store";
import PlayersTablePagination from "./players-table-pagination";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

type Props = {
  columnFilters: ColumnFilter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  columnVisibility: Partial<Record<keyof FootballerWithGameweekStats, boolean>>;
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof FootballerWithGameweekStats, boolean>>>
  >;
  resetFilters: () => void;
  isClearState: boolean;
  table: Table<FootballerWithGameweekStats>;
  playersTableColumns: (
    | (AccessorKeyColumnDefBase<FootballerWithGameweekStats, string> &
        Partial<IdIdentifier<FootballerWithGameweekStats, string>>)
    | (AccessorKeyColumnDefBase<any> & Partial<any>)
  )[];
};

const IGNORED_COLUMN_VISIBILITY_KEYS = ["web_name", "teamName"];

const PlayersTableFilters = ({
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  resetFilters,
  isClearState,
  table,
  playersTableColumns,
}: Props) => {
  const { list } = useSelector((state: RootState) => state.teams);
  const setFilterProperty = useCallback(
    (index: number, value: string | number | number[] | string[]) => {
      setColumnFilters((prev) => prev.map((v, i) => (i === index ? { ...v, value } : v)));
    },
    [setColumnFilters],
  );
  const hiddenColumnKeysArray = useMemo(
    () => Object.keys(columnVisibility)?.map((key) => key),
    [columnVisibility],
  );

  const modifyColumnVisibility = useCallback(
    (value: string[]) => {
      const modifiedColumnVisibility = value.reduce(
        (obj, key) => ({ ...obj, [key]: false }),
        {},
      );
      setColumnVisibility(modifiedColumnVisibility);
    },
    [columnVisibility],
  );

  return (
    <div className="mt-4 w-full flex-col">
      <div className="mb-2 flex w-full flex-col gap-2 text-text md:mb-4 md:flex-row md:gap-4 lg:items-end">
        <div className="flex items-center justify-between gap-2 md:justify-start">
          <Input
            className="h-6 w-fit min-w-[185px] bg-accent3 p-2 text-xs text-text focus:outline-none md:h-8 md:min-w-[300px] md:text-sm"
            onChange={(e) => setFilterProperty(0, e.target.value)}
            placeholder="Search player..."
          />
          <div className="flex flex-col gap-1">
            <Select
              onValueChange={(value) =>
                setFilterProperty(2, value === "none" ? "" : value)
              }
              value={columnFilters[2].value as string}
            >
              <SelectTrigger className="h-6 w-[100px] bg-magenta px-2 py-1 text-text sm:w-[120px] md:h-8">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent
                sideOffset={5}
                className="w-[100px] cursor-pointer bg-magenta sm:w-[120px]"
              >
                <SelectItem
                  className="outline-non cursor-pointer flex-nowrap items-center px-2 py-1 text-text"
                  value="none"
                >
                  -----
                </SelectItem>
                {list.map((team) => (
                  <SelectItem
                    key={team.id}
                    className="outline-non cursor-pointer flex-nowrap items-center px-2 py-1 text-text"
                    value={team.name}
                  >
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between gap-2 md:ml-auto md:justify-start lg:gap-4">
          <ToggleGroup
            type="multiple"
            className="flex justify-start gap-2"
            defaultValue={["1", "2", "3", "4"]}
            value={(columnFilters[3].value as number[]).map((v) => v.toString())}
            onValueChange={(value) =>
              setFilterProperty(
                3,
                value.map((v) => parseInt(v)).sort((a, b) => a - b),
              )
            }
          >
            {Object.values(FootballerPosition)
              .filter((value) => typeof value === "string" && value !== "MGR")
              .map((key) => (
                <ToggleGroupItem
                  key={key}
                  value={FootballerPosition[
                    key as keyof typeof FootballerPosition
                  ].toString()}
                  className={clsx(
                    "flex w-8 items-center justify-center rounded-md p-1 text-[8px] sm:w-10 md:text-xs lg:p-2",
                    (columnFilters[3].value as number[]).includes(
                      FootballerPosition[key as keyof typeof FootballerPosition],
                    )
                      ? "bg-magenta"
                      : "bg-secondary",
                  )}
                >
                  {key}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
          <div className="flex w-fit flex-col gap-1">
            <Label className="text-xs sm:text-sm">
              Max ownership: {(columnFilters[1].value as number[])[1]} %
            </Label>
            <Slider
              key={`${isClearState}`}
              defaultValue={[(columnFilters[1].value as number[])[1]]}
              max={100}
              min={1}
              step={1}
              onValueCommit={(value) => setFilterProperty(1, [0, value[0]])}
            />
          </div>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <Button
          className="flex items-center rounded-md bg-accent3 px-1 py-1 text-xs text-text disabled:opacity-20 sm:text-sm md:px-2"
          disabled={isClearState}
          onClick={resetFilters}
        >
          <TiDelete className="flex h-4 w-4 items-center justify-center text-magenta sm:h-6 sm:w-6" />
          Reset filters & sorting
        </Button>
        <ToggleGroup
          type="multiple"
          className="grid grid-cols-4 grid-rows-2 gap-1 rounded-md border-[2px] border-secondary bg-accent3 p-1 md:gap-2"
          value={hiddenColumnKeysArray}
          onValueChange={modifyColumnVisibility}
        >
          {playersTableColumns
            .filter(
              (col) =>
                !IGNORED_COLUMN_VISIBILITY_KEYS.includes(col.accessorKey as string),
            )
            .map((col, index) => {
              return (
                <ToggleGroupItem
                  key={index}
                  value={col.accessorKey as string}
                  className="flex items-center gap-1 justify-self-start bg-transparent px-0 text-left text-xs text-text md:gap-2"
                >
                  <span
                    className={clsx(
                      "h-1 w-1 rounded-full md:h-2 md:w-2",
                      hiddenColumnKeysArray.includes(col?.accessorKey as string)
                        ? "bg-text"
                        : "bg-magenta",
                    )}
                  />
                  {col?.header}
                </ToggleGroupItem>
              );
            })}
        </ToggleGroup>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs italic text-text">
          Press shift + column header to sort by multiple columns
        </p>
        <PlayersTablePagination table={table} />
      </div>
    </div>
  );
};

export default PlayersTableFilters;
