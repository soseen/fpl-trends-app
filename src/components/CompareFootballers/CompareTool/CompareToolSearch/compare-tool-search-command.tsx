import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { RootState } from "src/redux/store";
import { RankedFootballer } from "../types";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { FaCheck } from "react-icons/fa";
import { useDimensions } from "src/hooks/use-dimensions";

type Props = {
  index: number;
  selectedFootballers: (RankedFootballer | null)[];
  addFootballer: (footballerToAdd: FootballerWithGameweekStats, index: number) => void;
  onAdd: () => void;
};

const CompareToolSearchCommand = ({
  index,
  selectedFootballers,
  addFootballer,
  onAdd,
}: Props) => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { isMD } = useDimensions();
  const [search, setSearch] = useState("");

  const sortedFootballers = useMemo(
    () => [...footballers].sort((a, b) => b?.totalPoints - a?.totalPoints),
    [footballers],
  );

  const suggestedFootballers = useMemo(
    () =>
      sortedFootballers
        .filter(
          (f) =>
            f.web_name.toLowerCase().includes(search.toLowerCase()) &&
            !selectedFootballers.find((existing) => f.id === existing?.id),
        )
        .slice(0, isMD ? 20 : 10),
    [search, sortedFootballers, selectedFootballers],
  );

  const onSearch = useCallback((value: string) => setSearch(value), []);

  return (
    <Command className="w-full pb-2">
      <CommandInput
        className="h-10 w-full bg-accent3 p-2 text-sm text-text"
        placeholder="Search player..."
        value={search}
        onValueChange={onSearch}
      />
      <CommandList className="mt-2 overflow-y-auto">
        <CommandGroup>
          {suggestedFootballers.length > 0 ? (
            suggestedFootballers.map((f) => {
              const isSelected = !!selectedFootballers.find(
                (value) => value?.id === f.id,
              );
              return (
                <CommandItem
                  key={f.id}
                  value={f.web_name}
                  onSelect={() => {
                    addFootballer(f, index);
                    onAdd();
                  }}
                  className="flex items-center gap-4 rounded-sm p-1 text-sm hover:bg-magenta"
                >
                  <FootballerImage
                    code={f.code}
                    className="h-10 w-auto rounded-none md:h-7 md:w-auto lg:h-9"
                  />
                  {f.web_name}
                  {isSelected && <FaCheck className="ml-auto text-green-500" />}
                </CommandItem>
              );
            })
          ) : (
            <p className="text-muted-foreground text-center text-sm">No players found</p>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default CompareToolSearchCommand;
