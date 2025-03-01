import React, { useCallback, useMemo, useState } from "react";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { Button } from "@/components/ui/button";
import { FaCheck, FaPlus } from "react-icons/fa";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { useDimensions } from "src/hooks/use-dimensions";
import { RankedFootballer } from "./use-compare-tool";

type Props = {
  index: number;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
};

const CompareToolSearch = ({ index, selectedFootballers, addFootballer }: Props) => {
  const { isMD } = useDimensions();
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sortedFootballers = useMemo(
    () => [...footballers].sort((a, b) => b?.totalPoints - a?.totalPoints),
    [footballers],
  );

  const suggestedFootballers = useMemo(() => {
    return [...sortedFootballers]
      .filter((f) => {
        if (f.web_name === "M.Salah") {
          console.log(f.web_name);
          console.log(search);
          console.log(f.web_name.includes(search));
        }

        return (
          f.web_name.includes(search) &&
          !selectedFootballers.find((existing) => f.id === existing?.id)
        );
      })
      .slice(0, 10);
  }, [search, sortedFootballers, selectedFootballers]);

  const onSearch = useCallback(
    (value: string) => {
      setSearch(value);
    },
    [setSearch],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex w-fit items-center justify-around gap-1 bg-magenta p-1 px-1 text-xs text-text md:h-8 md:gap-2 md:p-2 md:px-4 md:text-sm"
        >
          {isMD ? "Add" : "Add Footballer"}
          <FaPlus />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="relative w-fit min-w-0 cursor-pointer bg-accent3 p-2 text-xs text-text md:w-[250px] md:text-sm"
        align="center"
      >
        <Command>
          <CommandInput
            className="h-6 w-fit min-w-[185px] bg-accent3 p-2 text-xs text-text md:h-8 md:min-w-[250px] md:text-sm"
            placeholder="Search player..."
            value={search}
            onValueChange={onSearch}
          />
          <CommandList>
            <CommandGroup>
              {suggestedFootballers.map((f) => {
                const isSelected = !!selectedFootballers.find(
                  (value) => value?.id === f.id,
                );
                return (
                  <CommandItem
                    key={f.id}
                    value={f.web_name}
                    onSelect={() => addFootballer(f, index)}
                    className="rounded-sm py-[1px] hover:bg-magenta"
                  >
                    <FootballerImage
                      code={f.code}
                      className="rounded-none md:h-7 md:w-7"
                    />
                    {f.web_name}
                    {isSelected && <FaCheck className="ml-auto" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CompareToolSearch;
