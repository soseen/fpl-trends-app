import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { useDimensions } from "src/hooks/use-dimensions";
import {
  AdditionalStats,
  FootballerWithGameweekStats,
} from "src/redux/slices/footballersGameweekStatsSlice";
import { RootState } from "src/redux/store";

type SelectedStatKey = keyof Pick<
  AdditionalStats,
  "xGIPerGame" | "goalsPerGame" | "assistsPerGame" | "minPerGame" | "xGCPerGame"
>;

export type RankedFootballer = Omit<FootballerWithGameweekStats, SelectedStatKey> & {
  [K in SelectedStatKey]: { value: number | string; rank: number };
};

export const COMPARE_TOOL_STAT_KEYS: Array<{ key: SelectedStatKey; label: string }> = [
  { key: "goalsPerGame", label: "Goals/g" },
  { key: "assistsPerGame", label: "Assists/g" },
  { key: "xGIPerGame", label: "xGI/g" },
  { key: "xGCPerGame", label: "xGC/g" },
  { key: "minPerGame", label: "Min/g" },
];

export const useCompareTool = () => {
  const { isMD } = useDimensions();
  const { setFootballer } = useFootballerDetailsContext();
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );

  const [selectedFootballers, setSelectedFootballers] = useState<
    (FootballerWithGameweekStats | null)[]
  >([null, null]);

  useEffect(() => {
    setSelectedFootballers((current) =>
      current.map((f) => footballers.find((footballer) => footballer.id === f?.id) ?? f),
    );
  }, [footballers]);

  const canAddNewCard = useMemo(
    () => selectedFootballers.length < (isMD ? 3 : 4),
    [selectedFootballers, isMD],
  );

  const addFootballer = useCallback(
    (footballerToAdd: FootballerWithGameweekStats, index: number) => {
      setSelectedFootballers((current) =>
        current.map((footballer, i) => (index === i ? footballerToAdd : footballer)),
      );
    },
    [setSelectedFootballers],
  );

  const removeFootballer = useCallback(
    (footballerToRemove: RankedFootballer) => {
      setSelectedFootballers((current) =>
        current.map((footballer) =>
          footballer?.id === footballerToRemove.id ? null : footballer,
        ),
      );
    },
    [setSelectedFootballers],
  );

  const openFootballersProfile = useCallback(
    (footballerToDisplay: RankedFootballer) => {
      const footballerObject = footballers.find((f) => f.id === footballerToDisplay.id);
      setFootballer(footballerObject ?? null);
    },
    [footballers],
  );

  const footballersComparisonArray: (RankedFootballer | null)[] = useMemo(() => {
    const validFootballers = selectedFootballers.filter(
      Boolean,
    ) as FootballerWithGameweekStats[];

    const rankedFootballers: RankedFootballer[] = validFootballers.map((footballer) => {
      const updatedStats: Record<
        SelectedStatKey,
        { value: number | string; rank: number; label: string }
      > = {} as any;

      COMPARE_TOOL_STAT_KEYS.forEach((stat) => {
        // Convert stat values to numbers for sorting
        const sortedByKey = [...validFootballers].sort((a, b) => {
          const aValue = parseFloat(a[stat.key] as string) || 0;
          const bValue = parseFloat(b[stat.key] as string) || 0;

          // Sort `xGCPerGame` in ascending order, others in descending order
          return stat.key === "xGCPerGame" ? aValue - bValue : bValue - aValue;
        });

        // Assign ranks while handling ties
        const rankMap = new Map<number, number>(); // Stores rank for each unique value
        let rank = 1;

        sortedByKey.forEach((player, index) => {
          const playerValue = parseFloat(player[stat.key] as string) || 0;

          // If the value is already ranked, reuse the rank
          if (!rankMap.has(playerValue)) {
            rankMap.set(playerValue, rank);
          }

          updatedStats[stat.key] = {
            value: footballer[stat.key],
            rank: rankMap.get(parseFloat(footballer[stat.key] as string) || 0) ?? rank,
            label: stat.label,
          };

          // Increment rank only if the next value is different
          if (index < sortedByKey.length - 1) {
            const nextValue = parseFloat(sortedByKey[index + 1][stat.key] as string) || 0;
            if (playerValue !== nextValue) {
              rank++;
            }
          }
        });
      });

      return {
        ...footballer,
        ...updatedStats,
      };
    });

    return selectedFootballers.map((f) => {
      const ranked = rankedFootballers.find((rankedF) => f?.id === rankedF?.id);
      return ranked ?? null;
    });
  }, [selectedFootballers]);

  return {
    footballersComparisonArray,
    setSelectedFootballers,
    canAddNewCard,
    addFootballer,
    removeFootballer,
    openFootballersProfile,
  };
};
