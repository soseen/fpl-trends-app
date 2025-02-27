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
import { MdClose as CloseIcon } from "react-icons/md";

type Props = {
  selectedFootballers: FootballerWithGameweekStats[];
  setSelectedFootballers: React.Dispatch<
    React.SetStateAction<FootballerWithGameweekStats[]>
  >;
};

const CompareToolSearch = ({ selectedFootballers, setSelectedFootballers }: Props) => {
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
    return [...sortedFootballers].filter((f) => f.web_name.includes(search)).slice(0, 10);
  }, [search, sortedFootballers, selectedFootballers]);

  const onSearch = useCallback(
    (value: string) => {
      setSearch(value);
    },
    [setSearch],
  );

  const removeFromSelection = useCallback(
    (footballerToRemove: FootballerWithGameweekStats) => {
      setSelectedFootballers((existing) =>
        existing.filter((footballer) => footballer.id !== footballerToRemove.id),
      );
    },
    [setSelectedFootballers],
  );

  const handleSelect = useCallback(
    (footballerToAdd: FootballerWithGameweekStats, isSelected: boolean) => {
      if (!footballerToAdd) return;

      if (isSelected) {
        removeFromSelection(footballerToAdd);
      } else {
        setSelectedFootballers((existing) => {
          const isLimitReached = existing.length === 2;

          if (isLimitReached) {
            return [...existing.slice(1), footballerToAdd]; // Remove first item, add new one at the end
          }

          return [...existing, footballerToAdd]; // Just add if limit isn't reached
        });
      }

      setOpen(false);
      setSearch("");
    },
    [setSelectedFootballers],
  );

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex h-6 w-fit min-w-[185px] items-center justify-around gap-2 bg-accent3 p-2 px-0 text-xs text-text md:h-8 md:min-w-[250px] md:text-sm"
          >
            Add Footballers...
            <FaPlus />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-fit min-w-0 cursor-pointer bg-accent3 p-2 text-xs text-text md:w-[250px] md:text-sm"
          align="start"
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
                    (value) => value.id === f.id,
                  );
                  return (
                    <CommandItem
                      key={f.id}
                      value={f.web_name}
                      onSelect={() => handleSelect(f, isSelected)}
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
      <div className="flex items-center gap-2">
        {selectedFootballers.map((footballer) => (
          <div className="flex items-center gap-2 rounded-md bg-magenta2 px-2 py-[2px] text-text">
            {footballer.web_name}
            <Button
              onClick={() => removeFromSelection(footballer)}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-magenta p-0 hover:opacity-80"
            >
              <CloseIcon />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareToolSearch;
