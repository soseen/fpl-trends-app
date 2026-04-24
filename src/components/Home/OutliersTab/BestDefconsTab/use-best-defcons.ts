import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerPosition } from "src/queries/types";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { RootState } from "src/redux/store";
import { getDefconThreshold } from "src/utils/defcon";

const MIN_GAMES_IN_RANGE = 3;

export const useBestDefcons = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const { isMD } = useDimensions();

  const bestDefcons: FootballerWithGameweekStats[] = useMemo(() => {
    return [...footballers]
      .filter((f) => {
        // only positions that earn defcons, with enough games to avoid small-sample noise
        if (getDefconThreshold(f.element_type) === null) return false;
        if (f.element_type === FootballerPosition.MGR) return false;
        const gamesPlayed = f.history.filter(
          (h) =>
            h.round >= startGameweek &&
            h.round <= endGameweek &&
            h.team_a_score !== null &&
            h.team_h_score !== null,
        ).length;
        return gamesPlayed >= MIN_GAMES_IN_RANGE;
      })
      .sort((a, b) => parseFloat(b.defconsPerGame) - parseFloat(a.defconsPerGame))
      .slice(0, isMD ? 4 : 5);
  }, [footballers, startGameweek, endGameweek, isMD]);

  return { bestDefcons };
};
