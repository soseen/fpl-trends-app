import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { RootState } from "src/redux/store";

export const useBestXGIFootballers = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const { isMD } = useDimensions();

  const bestXGIFootballers: FootballerWithGameweekStats[] = useMemo(
    () => [...footballers].sort((a, b) => parseFloat(b.xGIPerGame) - parseFloat(a.xGIPerGame)).slice(0, isMD ? 4 : 5),
    [footballers, startGameweek, endGameweek, isMD],
  );
  return { bestXGIFootballers };
};
