import React, { useState } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RankedFootballer } from "../types";
import { FaPlus } from "react-icons/fa";
import CompareToolSearchCommand from "./compare-tool-search-command";

type Props = {
  index: number;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
};

const CompareToolSearchDrawer = ({
  index,
  selectedFootballers,
  addFootballer,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="flex w-fit items-center justify-around gap-1 bg-magenta p-1 px-1 text-xs text-text md:h-8 md:gap-2 md:p-2 md:px-4 md:text-sm"
        onClick={() => setOpen(true)}
      >
        Add <FaPlus />
      </Button>

      <Drawer open={open} onClose={() => setOpen(false)} direction="bottom">
        <DrawerContent className="inset-0 z-[300] h-screen w-screen overflow-hidden px-4 pt-3 text-text">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Search Footballer</h2>
            <Button variant="ghost" className="p-0" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <CompareToolSearchCommand
            selectedFootballers={selectedFootballers}
            addFootballer={addFootballer}
            onAdd={() => setOpen(false)}
            index={index}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CompareToolSearchDrawer;
