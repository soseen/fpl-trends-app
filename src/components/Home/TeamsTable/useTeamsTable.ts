import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { TeamData } from "src/queries/types";
import { RootState } from "src/redux/store";

export const useTeamsTable = () => {
  const { list } = useSelector((state: RootState) => state.teams);
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks
  );
  const [isDefensiveStats, setIsDefensiveStats] = useState(true);

  const onSelectValueChange = useCallback((value: string) => {
    setIsDefensiveStats(value === "defensive" ? true : false);
  }, []);

  const teams = useMemo(() => {
    if (!list.length) return [];

    const sortedByFullSeason = [...list]
      .map((team) => {
        const { history } = team;
        if (!history || history.length === 0) return null;

        return {
          ...team,
          avgXGCFullSeason:
            history.reduce((sum, gw) => sum + gw.teamXGC, 0) / history.length || 0,
          fullSeasonRank: 0
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.avgXGCFullSeason - b!.avgXGCFullSeason);

    sortedByFullSeason.forEach((team, index) => {
        if(team) {
            team.fullSeasonRank = index + 1;
        }
    });

    const sortedByCurrentRange = [...sortedByFullSeason]
      .map((team) => {
        const { history } = team as TeamData;
        if (!history) return null;

        const selectedGameweeks = history.filter(
          (gw) => gw.round >= startGameweek && gw.round <= endGameweek
        );

        const totalXGC = selectedGameweeks.reduce((sum, gw) => sum + gw.teamXGC, 0);
        const avgXGC = totalXGC / selectedGameweeks.length || 0;

        return {
          ...team,
          avgXGC,
          totalCleanSheets: selectedGameweeks.filter((gw) => gw.goals_conceded === 0)
            .length,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.avgXGC - b!.avgXGC);

    return sortedByCurrentRange.map((team, index) => ({
      ...team,
      currentRank: index + 1, // Current ranking based on selected range
    })).filter(Boolean);
  }, [list, startGameweek, endGameweek]);

  return {
    teams,
    isDefensiveStats,
    onSelectValueChange,
  };
};
