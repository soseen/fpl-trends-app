import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { type TeamData } from "src/queries/types";
import { type RootState } from "src/redux/store";

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
      avgNPXGAFullSeason:
        team.team_history.reduce((sum, gw) => sum + gw.teamNPXGA, 0) /
          team.team_history.length || 0,
      avgNPXGFullSeason:
        team.team_history.reduce((sum, gw) => sum + gw.teamNPXG, 0) /
          team.team_history.length || 0,
      fullSeasonRank: 0,
    }));
  }, [list]);

  const teams = useMemo(() => {
    const sortedByFullSeason = [...processedTeams]
      .filter(Boolean)
      .sort((a, b) =>
        isDefensiveStats
          ? a!.avgNPXGAFullSeason - b!.avgNPXGAFullSeason
          : b!.avgNPXGFullSeason - a!.avgNPXGFullSeason,
      );

    sortedByFullSeason.forEach((team, index) => {
      if (team) {
        team.fullSeasonRank = index + 1;
      }
    });

    const sortedByCurrentRange = [...sortedByFullSeason]
      .map((team) => {
        const { team_history: history } = team as TeamData;

        const selectedGameweeks = history.filter(
          (gw) => gw.round >= startGameweek && gw.round <= endGameweek,
        );

        const selectedStatTotal = selectedGameweeks.reduce(
          (sum, gw) => sum + (isDefensiveStats ? gw.teamNPXGA : gw.teamNPXG),
          0,
        );
        const avg = selectedStatTotal / selectedGameweeks.length || 0;

        return {
          ...team,
          avg,
          gamesPlayed: selectedGameweeks.length,
          totalCleanSheets: selectedGameweeks.filter((gw) => gw.goals_conceded === 0)
            .length,
          totalGoals: selectedGameweeks.reduce((sum, gw) => sum + gw.goals, 0),
        };
      })
      .sort((a, b) => (isDefensiveStats ? a!.avg - b!.avg : b!.avg - a!.avg));

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
