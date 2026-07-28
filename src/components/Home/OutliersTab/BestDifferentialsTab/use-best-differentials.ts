import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useDimensions } from "src/hooks/use-dimensions";
import { type RootState } from "src/redux/store";
import { FootballerPosition } from "src/queries/types";
import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";

export const useBestDifferentials = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { events } = useSelector((state: RootState) => state.events);
  const isPreseason = useSelector((state: RootState) => state.gameweeks.isPreseason);
  const { isMD } = useDimensions();

  const bestDifferentials: FootballerWithGameweekStats[] = useMemo(() => {
    if (!footballers.length || (!isPreseason && !events.length)) return [];

    const differentials = footballers
      .filter(
        (footballer) =>
          footballer.maxOwnership <= 10 &&
          footballer.element_type !== FootballerPosition.MGR,
      )
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, isMD ? 4 : 5);

    return differentials;
  }, [footballers, isMD, events, isPreseason]);

  return { bestDifferentials };
};
