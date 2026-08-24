import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerPosition } from "src/queries/types";
import { type FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { type RootState } from "src/redux/store";
import { getDefconThreshold } from "src/utils/defcon";
import { getHistoryPastForSeason } from "src/utils/preseason";

const MIN_GAMES_IN_RANGE = 3;

export const useBestDefcons = () => {
  const { footballers } = useSelector(
    (state: RootState) => state.footballersGameweekStats,
  );
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const { isMD } = useDimensions();
  const { isPreseason, analysisSeasonLabel } = useSelector(
    (state: RootState) => state.gameweeks,
  );

  const bestDefcons: FootballerWithGameweekStats[] = useMemo(() => {
    const gameweeksInRange = Math.max(1, endGameweek - startGameweek + 1);
    const minGamesRequired = isPreseason
      ? MIN_GAMES_IN_RANGE
      : Math.min(MIN_GAMES_IN_RANGE, gameweeksInRange);

    return [...footballers]
      .filter((f) => {
        // only positions that earn defcons, with enough appearances to avoid small-sample noise
        if (getDefconThreshold(f.element_type) === null) return false;
        if (f.element_type === FootballerPosition.MGR) return false;
        const appearances = isPreseason
          ? (getHistoryPastForSeason(f, analysisSeasonLabel)?.starts ?? 0)
          : f.history.filter(
              (h) =>
                h.round >= startGameweek &&
                h.round <= endGameweek &&
                h.team_a_score !== null &&
                h.team_h_score !== null &&
                h.minutes > 0,
            ).length;
        return appearances >= minGamesRequired;
      })
      .sort((a, b) => parseFloat(b.defconsPerGame) - parseFloat(a.defconsPerGame))
      .slice(0, isMD ? 4 : 5);
  }, [footballers, startGameweek, endGameweek, isMD, isPreseason, analysisSeasonLabel]);

  return { bestDefcons };
};
