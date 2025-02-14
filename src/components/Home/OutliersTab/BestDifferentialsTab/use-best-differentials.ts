import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useDimensions } from "src/hooks/use-dimensions";
import { RootState } from "src/redux/store";
import { FootballerPosition } from "src/queries/types";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

export const useBestDifferentials = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks
  );
  const { events } = useSelector((state: RootState) => state.events);
  const { isMD } = useDimensions();

  const bestDifferentials: FootballerWithGameweekStats[] = useMemo(() => {
    if (!footballers.length || !events.length) return [];

    const differentials = footballers
      .filter((footballer) => {
        const historyInRange = footballer.history.filter(
          (h) => h.round >= startGameweek && h.round <= endGameweek
        );

        const maxOwnership = historyInRange.reduce((max, h) => {
          const gameweekEvent = events.find((e) => e.id === h.round);
          if (!gameweekEvent) return max;


          const ownershipPercent = (h.selected / gameweekEvent.ranked_count) * 100;
          return Math.max(max, ownershipPercent);
        }, 0);

        // Player is a differential if he was always under 10% ownership
        return maxOwnership <= 10 && Object.values(FootballerPosition).includes(footballer.element_type);
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, isMD ? 6 : 5);

    return differentials;
  }, [footballers, startGameweek, endGameweek, isMD, events]);

  return { bestDifferentials };
};
