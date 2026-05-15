import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { type RootState } from "src/redux/store";
import { type RankedFootballer } from "../types";
import FootballerImage from "src/components/FootballerImage/footballer-image";
import { useDimensions } from "src/hooks/use-dimensions";
import { removeAccents } from "src/utils/strings";

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

  const suggestedFootballers = useMemo(() => {
    const normalizedSearch = removeAccents(search.toLowerCase());
    return sortedFootballers
      .filter((f) => {
        const normalizedSearchSource = removeAccents(
          [f.web_name, f.first_name, f.second_name, f.teamName, f.teams?.short_name]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        );

        return (
          normalizedSearchSource.includes(normalizedSearch) &&
          !selectedFootballers.find((existing) => f.id === existing?.id)
        );
      })
      .slice(0, isMD ? 20 : 10);
  }, [search, sortedFootballers, selectedFootballers]);

  const onSearch = useCallback((value: string) => setSearch(value), []);

  return (
    <Command className="w-full pb-2" shouldFilter={false}>
      <CommandInput
        className="h-10 w-full bg-accent3 p-2 text-sm text-text"
        placeholder="Search player..."
        value={search}
        onValueChange={onSearch}
      />
      <CommandList className="mt-2 overflow-y-auto">
        <CommandGroup>
          {suggestedFootballers.length > 0 ? (
            suggestedFootballers.map((f) => (
              <CommandItem
                key={f.id}
                value={`${f.id}-${f.web_name}`}
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
              </CommandItem>
            ))
          ) : (
            <p className="text-muted-foreground text-center text-sm">No players found</p>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default CompareToolSearchCommand;
