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
import type {
  AccessorKeyColumnDefBase,
  ColumnFilter,
  ColumnFiltersState,
  IdIdentifier,
  Table,
} from "@tanstack/react-table";
import clsx from "clsx";
import type React from "react";
import { useCallback, useMemo } from "react";
import { TiDelete } from "react-icons/ti";
import { useSelector } from "react-redux";
import { FootballerPosition } from "src/queries/types";
import type { RootState } from "src/redux/store";
import PlayersTablePagination from "./players-table-pagination";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { useDimensions } from "src/hooks/use-dimensions";
import { removeAccents } from "src/utils/strings";

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
  const { isMD } = useDimensions();

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
      <div className="mb-2 flex w-full flex-col gap-3 text-text md:mb-4 md:flex-row md:items-start md:gap-4">
        <div className="flex flex-1 flex-col items-center gap-3 md:items-stretch md:gap-3">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Input
              className="h-6 w-fit min-w-[185px] border-transparent bg-accent3 p-2 text-xs text-text focus:outline-none md:h-8 md:min-w-[300px] md:text-sm"
              onChange={(e) => setFilterProperty(0, removeAccents(e.target.value))}
              placeholder="Search player..."
              value={columnFilters[0]?.value as string}
            />
            <div className="flex flex-col gap-1">
              <Select
                onValueChange={(value) =>
                  setFilterProperty(2, value === "none" ? "" : value)
                }
                value={columnFilters[2].value as string}
              >
                <SelectTrigger className="h-6 w-[106px] border-transparent bg-magenta px-2 py-1 text-text sm:w-[120px] md:h-8">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent
                  sideOffset={5}
                  className="w-[106px] cursor-pointer border-transparent bg-magenta sm:w-[120px]"
                >
                  <SelectItem
                    className="outline-non cursor-pointer flex-nowrap items-center px-2 py-[2px] text-sm text-text hover:bg-magenta3 md:py-1"
                    value="none"
                  >
                    -----
                  </SelectItem>
                  {list.map((team) => (
                    <SelectItem
                      key={team.id}
                      className="outline-non cursor-pointer flex-nowrap items-center overflow-hidden overflow-ellipsis whitespace-nowrap px-2 py-[2px] text-sm leading-5 text-text hover:bg-magenta3 md:py-1"
                      value={team.name}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ToggleGroup
            type="multiple"
            className="grid w-fit grid-cols-[auto_auto_auto_auto] gap-0.5 rounded-md border-[2px] border-secondary bg-accent3 p-1"
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
                    className="flex h-6 items-center justify-start gap-1 justify-self-stretch rounded-md bg-transparent px-1.5 py-0.5 text-left text-[10px] text-text sm:h-auto sm:gap-1.5 sm:px-2 sm:py-1 sm:text-xs"
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 shrink-0 rounded-full md:h-2 md:w-2",
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
        <div className="flex flex-col items-center gap-3 md:items-end md:gap-3">
          <ToggleGroup
            type="multiple"
            className="flex justify-start gap-1 md:self-end"
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
                    "flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] sm:h-9 sm:min-w-[44px] sm:px-3 sm:py-1 sm:text-xs md:text-sm lg:px-4",
                    (columnFilters[3].value as number[]).includes(
                      FootballerPosition[key as keyof typeof FootballerPosition],
                    )
                      ? "bg-magenta data-[state=on]:bg-magenta"
                      : "bg-secondary",
                  )}
                >
                  {key}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            <div className="flex w-[180px] flex-col gap-1">
              <Label className="text-xs sm:text-sm">
                Max ownership: {(columnFilters[1].value as number[])[1]} %
              </Label>
              <Slider
                key={`ownership-${isClearState}`}
                defaultValue={[(columnFilters[1].value as number[])[1]]}
                max={100}
                min={1}
                step={1}
                onValueCommit={(value) => setFilterProperty(1, [0, value[0]])}
              />
            </div>
            <div className="flex w-[180px] flex-col gap-1">
              <Label className="text-xs sm:text-sm">
                Max price: £
                {(((columnFilters[4]?.value as number[])?.[1] ?? 150) / 10).toFixed(1)}m
              </Label>
              <Slider
                key={`price-${isClearState}`}
                defaultValue={[(columnFilters[4]?.value as number[])?.[1] ?? 150]}
                max={150}
                min={35}
                step={1}
                onValueCommit={(value) => setFilterProperty(4, [0, value[0]])}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-2 flex w-full justify-center md:justify-start">
        <Button
          className="flex items-center rounded-md bg-accent3 px-1 py-1 text-xs text-text disabled:opacity-20 sm:text-sm md:px-2"
          disabled={isClearState}
          onClick={resetFilters}
        >
          <TiDelete className="flex h-4 w-4 items-center justify-center text-magenta sm:h-6 sm:w-6" />
          Reset filters & sorting
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        {!isMD && (
          <p className="text-xs italic text-text">
            Press shift + column header to sort by multiple columns
          </p>
        )}
        <div className="ml-auto">
          <PlayersTablePagination table={table} />
        </div>
      </div>
    </div>
  );
};

export default PlayersTableFilters;
