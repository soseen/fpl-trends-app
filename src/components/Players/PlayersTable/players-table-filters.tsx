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
import { ColumnFilter, ColumnFiltersState } from "@tanstack/react-table";
import clsx from "clsx";
import React, { MouseEventHandler, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { FootballerPosition } from "src/queries/types";
import { RootState } from "src/redux/store";

type Props = {
  columnFilters: ColumnFilter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
};

const PlayersTableFilters = ({ columnFilters, setColumnFilters }: Props) => {
  const { list } = useSelector((state: RootState) => state.teams);
  const setFilterProperty = useCallback(
    (index: number, value: string | number | number[] | string[]) => {
      setColumnFilters((prev) => prev.map((v, i) => (i === index ? { ...v, value } : v)));
    },
    [setColumnFilters],
  );

  return (
    <div className="mb-2 flex w-full items-end gap-2 text-text md:mb-4 md:gap-4">
      <Input
        className="h-6 w-fit min-w-[300px] bg-accent3 p-2 text-text focus:outline-none md:h-8"
        onChange={(e) => setFilterProperty(0, e.target.value)}
        placeholder="Search player..."
      />
      <div className="flex flex-col gap-1">
        <Select
          onValueChange={(value) => setFilterProperty(2, value === "none" ? "" : value)}
          value={columnFilters[2].value as string}
        >
          <SelectTrigger className="h-6 w-[120px] bg-magenta px-2 py-1 text-text md:h-8">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent sideOffset={5} className="w-[120px] cursor-pointer bg-magenta">
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
      <div className="ml-auto flex gap-2 md:gap-4">
        <ToggleGroup
          type="multiple"
          className="flex gap-2"
          defaultValue={["1", "2", "3", "4"]}
          onValueChange={(value) =>
            setFilterProperty(
              3,
              value.map((v) => parseInt(v)),
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
                  "flex min-w-10 rounded-md p-2 text-[8px] md:text-xs",
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
        <div className="flex flex-col gap-1">
          <Label>Max ownership: {(columnFilters[1].value as number[])[1]} %</Label>
          <Slider
            defaultValue={[100]}
            max={100}
            min={1}
            step={1}
            onValueCommit={(value) => setFilterProperty(1, [0, value[0]])}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayersTableFilters;
