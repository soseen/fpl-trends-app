import React, { useState } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { RankedFootballer } from "../types";
import CompareToolSearchCommand from "./compare-tool-search-command";
type Props = {
  index: number;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
};

const CompareToolSearchPopover = ({
  index,
  selectedFootballers,
  addFootballer,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex w-fit items-center justify-around gap-1 bg-magenta p-1 px-1 text-xs text-text md:h-8 md:gap-2 md:p-2 md:px-4 md:text-sm"
        >
          Add Footballer
          <FaPlus />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="relative w-fit min-w-0 cursor-pointer bg-accent3 p-2 text-xs text-text md:w-[250px] md:text-sm"
        align="center"
      >
        <CompareToolSearchCommand
          selectedFootballers={selectedFootballers}
          addFootballer={addFootballer}
          onAdd={() => setOpen(false)}
          index={index}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CompareToolSearchPopover;
