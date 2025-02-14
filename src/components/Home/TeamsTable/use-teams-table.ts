import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { TeamData } from "src/queries/types";
import { RootState } from "src/redux/store";

export const useTeamsTable = () => {
  const { list } = useSelector((state: RootState) => state.teams);
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const [isDefensiveStats, setIsDefensiveStats] = useState(true);

  const onSelectValueChange = useCallback((value: string) => {
    setIsDefensiveStats(value === "defensive" ? true : false);
  }, []);

  const processedTeams = useMemo(() => {
    if (!list.length) return [];

    return [...list].map((team) => ({
      ...team,
      avgXGCFullSeason:
        team.history.reduce((sum, gw) => sum + gw.teamXGC, 0) / team.history.length || 0,
      avgXGSFullSeason:
        team.history.reduce((sum, gw) => sum + gw.teamXGS, 0) / team.history.length || 0,
      fullSeasonRank: 0
    }));
  }, [list]);

  const teams = useMemo(() => {
    const sortedByFullSeason = [...processedTeams]
      .filter(Boolean)
      .sort((a, b) =>
        isDefensiveStats
          ? a!.avgXGCFullSeason - b!.avgXGCFullSeason
          : b!.avgXGSFullSeason - a!.avgXGSFullSeason,
      );

    sortedByFullSeason.forEach((team, index) => {
      if (team) {
        team.fullSeasonRank = index + 1;
      }
    });

    const sortedByCurrentRange = [...sortedByFullSeason]
      .map((team) => {
        const { history } = team as TeamData;

        const selectedGameweeks = history.filter(
          (gw) => gw.round >= startGameweek && gw.round <= endGameweek,
        );

        const selectedStatTotal = selectedGameweeks.reduce((sum, gw) => sum + (isDefensiveStats ? gw.teamXGC : gw.teamXGS), 0);
        const avg = selectedStatTotal / selectedGameweeks.length || 0;

        return {
          ...team,
          avg,
          totalCleanSheets: selectedGameweeks.filter((gw) => gw.goals_conceded === 0).length,
          totalGoals: selectedGameweeks.reduce((sum, gw) => sum + gw.goals, 0)
        }
      })
      .sort((a, b) => isDefensiveStats ? (a!.avg - b!.avg) : (b!.avg - a!.avg));

    return sortedByCurrentRange
      .map((team, index) => ({
        ...team,
        currentRank: index + 1,
      }))
      .filter(Boolean);
  }, [startGameweek, endGameweek, processedTeams, isDefensiveStats]);

  return {
    teams,
    isDefensiveStats,
    onSelectValueChange,
  };
};
