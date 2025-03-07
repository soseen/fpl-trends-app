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
      .filter((footballer) =>  footballer.maxOwnership <= 10 && footballer.element_type !== FootballerPosition.MGR
      )
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, isMD ? 4 : 5);

    return differentials;
  }, [footballers, startGameweek, endGameweek, isMD, events]);

  return { bestDifferentials };
};
