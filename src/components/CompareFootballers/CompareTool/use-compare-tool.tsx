import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFootballerDetailsContext } from "src/components/FootballerDetails/footballer-details.context";
import { useDimensions } from "src/hooks/use-dimensions";
import { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { RootState } from "src/redux/store";
import { BestAttributes, RankedFootballer, SelectedStatKey } from "./types";
import { rankStats } from "./rankings/rankStats";
import { rankFinishing } from "./rankings/rankFinishing";
import { rankFixtures } from "./rankings/rankFixtures";

export const COMPARE_TOOL_STAT_KEYS: Array<{ key: SelectedStatKey; label: string }> = [
  { key: "goalsPer90", label: "Goals/90" },
  { key: "assistsPer90", label: "Assists/90" },
  { key: "xGIPer90", label: "xGI/90" },
  { key: "xGCPer90", label: "xGC/g" },
  { key: "minPerGame", label: "Min/g" },
];

export const useCompareTool = () => {
  const { startGameweek, endGameweek, maxGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
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

  const validFootballers = useMemo(
    () => selectedFootballers.filter(Boolean),
    [selectedFootballers],
  ) as FootballerWithGameweekStats[];

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
    const rankedFootballers = validFootballers.map((footballer) => {
      const updatedStats: Record<
        SelectedStatKey | "finishingRank" | "fixtureDifficultyRank",
        { value: number | string; rank: number; label: string }
      > = {} as any;

      // Rank standard stats
      COMPARE_TOOL_STAT_KEYS.forEach((stat) => {
        updatedStats[stat.key] = rankStats(validFootballers, stat.key)(footballer);
      });

      // Rank finishing
      updatedStats["finishingRank"] = rankFinishing(validFootballers)(footballer);

      // Rank fixtures
      updatedStats["fixtureDifficultyRank"] = rankFixtures(
        validFootballers,
        maxGameweek,
      )(footballer);

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

  const bestAttributes = useMemo(() => {
    const validFootballers = footballersComparisonArray.filter(
      Boolean,
    ) as RankedFootballer[];
    const best: BestAttributes = {};

    // Find max/min values for different attributes
    const maxMinutes = Math.max(
      ...validFootballers.map((f) => (f?.minPerGame?.value as number) ?? 0),
    );
    const bestFinishers = Math.min(
      ...validFootballers.map((f) => f?.finishingRank?.rank ?? 99),
    );
    const bestFixtures = Math.min(
      ...validFootballers.map((f) => f?.fixtureDifficultyRank?.rank ?? 99),
    );
    const bestDefenderValue = Math.min(
      ...validFootballers
        .filter((f) =>
          f.history.some((h) => h.round >= startGameweek && h.round <= endGameweek),
        )
        .map((f) => parseFloat(f?.xGCPer90?.value as string) ?? 0),
    );
    const bestAttackerValue = Math.max(
      ...validFootballers.map((f) => parseFloat(f?.xGSPer90 as string) ?? 0),
    );
    const mostDifferentialValue = Math.min(
      ...validFootballers.map((f) => parseFloat(f?.selected_by_percent ?? "0")),
    );

    // Find all players that match the best values
    const mostMinutesPlayers = validFootballers.filter(
      (f) => ((f?.minPerGame?.value as number) ?? 0) === maxMinutes,
    );
    const bestFinishersPlayers = validFootballers.filter(
      (f) => (f?.finishingRank?.rank ?? 99) === bestFinishers,
    );
    const bestFixturesPlayers = validFootballers.filter(
      (f) => (f?.fixtureDifficultyRank?.rank ?? 99) === bestFixtures,
    );
    const bestDefendersPlayers = validFootballers.filter(
      (f) => (parseFloat(f?.xGCPer90?.value as string) ?? 0) === bestDefenderValue,
    );
    const bestAttackersPlayers = validFootballers.filter(
      (f) => parseFloat(f?.xGSPer90 as string) ?? 0 === bestAttackerValue,
    );
    const mostDifferentialPlayers = validFootballers.filter(
      (f) => parseFloat(f?.selected_by_percent ?? "0") === mostDifferentialValue,
    );

    // Find max haul count
    const haulsCount = validFootballers.map((footballer) => ({
      footballer,
      haulCount:
        footballer?.history.filter(
          (game) =>
            game.round >= startGameweek &&
            game.round <= endGameweek &&
            game.total_points >= 9,
        ).length ?? 0,
    }));
    const maxHaulCount = Math.max(...haulsCount.map((entry) => entry.haulCount));

    // Find high and low scoring games
    const calculateAvgGoals = (footballer: RankedFootballer) => {
      const games = footballer.history.filter(
        (game) => game.round >= startGameweek && game.round <= endGameweek,
      );
      return games.length
        ? games.reduce(
            (sum, game) => sum + ((game.team_h_score ?? 0) + (game.team_a_score ?? 0)),
            0,
          ) / games.length
        : 0;
    };

    const maxHighScoringGames = Math.max(...validFootballers.map(calculateAvgGoals));
    const minLowScoringGames = Math.min(...validFootballers.map(calculateAvgGoals));

    const highScoringGamesPlayers = validFootballers.filter(
      (f) => calculateAvgGoals(f) === maxHighScoringGames,
    );
    const lowScoringGamesPlayers = validFootballers.filter(
      (f) => calculateAvgGoals(f) === minLowScoringGames,
    );

    // Find best attacking team
    const bestAttackingTeamValue = Math.max(
      ...validFootballers.map((f) =>
        f?.history
          .filter((game) => game.round >= startGameweek && game.round <= endGameweek)
          .reduce(
            (sum, game) =>
              sum +
              (f.team === game.opponent_team
                ? (game.team_a_score ?? 0)
                : (game.team_h_score ?? 0)),
            0,
          ),
      ),
    );
    const bestAttackingTeamPlayers = validFootballers.filter(
      (f) =>
        f?.history
          .filter((game) => game.round >= startGameweek && game.round <= endGameweek)
          .reduce(
            (sum, game) =>
              sum +
              (f.team === game.opponent_team
                ? (game.team_a_score ?? 0)
                : (game.team_h_score ?? 0)),
            0,
          ) === bestAttackingTeamValue,
    );
    haulsCount.forEach(({ footballer, haulCount }) => {
      if (!footballer) return;

      const gamesPlayed = footballer.history.filter(
        (game) => game.round >= startGameweek && game.round <= endGameweek,
      );
      const totalGoals = gamesPlayed.reduce(
        (sum, game) => sum + ((game.team_h_score ?? 0) + (game.team_a_score ?? 0)),
        0,
      );

      const returns = gamesPlayed.reduce(
        (sum, game) => sum + game.goals_scored + game.assists,
        0,
      );

      const avgGoals = gamesPlayed.length > 0 ? totalGoals / gamesPlayed.length : 0;

      const totalTeamGoals = gamesPlayed.reduce(
        (sum, game) =>
          sum + (game.was_home ? (game.team_h_score ?? 0) : (game.team_a_score ?? 0)),
        0,
      );

      best[footballer.id] = {
        isBestMinutes: mostMinutesPlayers.includes(footballer),
        isBestFinisher: bestFinishersPlayers.includes(footballer),
        isBestFixtures: bestFixturesPlayers.includes(footballer),
        isBestDefender: bestDefendersPlayers.includes(footballer),
        isBestAttacker: bestAttackersPlayers.includes(footballer),
        isDifferential: mostDifferentialPlayers.includes(footballer),
        isBestHighScoringGames: highScoringGamesPlayers.includes(footballer),
        isBestLowScoringGames: lowScoringGamesPlayers.includes(footballer),
        isMostHauls: {
          value:
            haulsCount.find((entry) => entry.footballer === footballer)?.haulCount ===
            maxHaulCount,
          count: haulCount ?? 0,
        },
        isBestAttackingTeam: bestAttackingTeamPlayers.includes(footballer),
        avgGoalsPerGame: avgGoals,
        totalTeamGoals: totalTeamGoals,
        returns,
      };
    });

    return best;
  }, [footballersComparisonArray]);

  return {
    footballersComparisonArray,
    setSelectedFootballers,
    canAddNewCard,
    validFootballers,
    addFootballer,
    removeFootballer,
    openFootballersProfile,
    bestAttributes,
  };
};
