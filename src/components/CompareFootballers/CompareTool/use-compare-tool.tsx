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
  { key: "goalsPerGame", label: "Goals/g" },
  { key: "assistsPerGame", label: "Assists/g" },
  { key: "xGIPerGame", label: "xGI/g" },
  { key: "xGCPerGame", label: "xGC/g" },
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

  // const footballersComparisonArray: (RankedFootballer | null)[] = useMemo(() => {
  //   const validFootballers = selectedFootballers.filter(
  //     Boolean,
  //   ) as FootballerWithGameweekStats[];

  //   const rankedFootballers: RankedFootballer[] = validFootballers.map((footballer) => {
  //     const updatedStats: Record<
  //       SelectedStatKey,
  //       { value: number | string; rank: number; label: string }
  //     > = {} as any;

  //     COMPARE_TOOL_STAT_KEYS.forEach((stat) => {
  //       // Convert stat values to numbers for sorting
  //       const sortedByKey = [...validFootballers].sort((a, b) => {
  //         const aValue = parseFloat(a[stat.key] as string) || 0;
  //         const bValue = parseFloat(b[stat.key] as string) || 0;

  //         // Sort `xGCPerGame` in ascending order, others in descending order
  //         return stat.key === "xGCPerGame" ? aValue - bValue : bValue - aValue;
  //       });

  //       // Assign ranks while handling ties
  //       const rankMap = new Map<number, number>(); // Stores rank for each unique value
  //       let rank = 1;

  //       sortedByKey.forEach((player, index) => {
  //         const playerValue = parseFloat(player[stat.key] as string) || 0;

  //         // If the value is already ranked, reuse the rank
  //         if (!rankMap.has(playerValue)) {
  //           rankMap.set(playerValue, rank);
  //         }

  //         updatedStats[stat.key] = {
  //           value: footballer[stat.key],
  //           rank: rankMap.get(parseFloat(footballer[stat.key] as string) || 0) ?? rank,
  //           label: stat.label,
  //         };

  //         // Increment rank only if the next value is different
  //         if (index < sortedByKey.length - 1) {
  //           const nextValue = parseFloat(sortedByKey[index + 1][stat.key] as string) || 0;
  //           if (playerValue !== nextValue) {
  //             rank++;
  //           }
  //         }
  //       });
  //     });

  //     return {
  //       ...footballer,
  //       ...updatedStats,
  //     };
  //   });

  //   return selectedFootballers.map((f) => {
  //     const ranked = rankedFootballers.find((rankedF) => f?.id === rankedF?.id);
  //     return ranked ?? null;
  //   });
  // }, [selectedFootballers]);

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

    const mostMinutes = [...validFootballers].sort(
      (a, b) =>
        ((b?.minPerGame.value as number) ?? 0) - ((a?.minPerGame.value as number) ?? 0),
    )[0];
    const bestFinisher = [...validFootballers].sort(
      (a, b) => (a?.finishingRank.rank ?? 99) - (b?.finishingRank.rank ?? 99),
    )[0];
    const bestFixtures = [...validFootballers].sort(
      (a, b) =>
        (a?.fixtureDifficultyRank.rank ?? 99) - (b?.fixtureDifficultyRank.rank ?? 99),
    )[0];
    const bestDefender = [...validFootballers]
      .filter(
        (f) =>
          f.history.filter((h) => h.round >= startGameweek && h.round <= endGameweek)
            .length > 0,
      )
      ?.sort(
        (a, b) =>
          (parseFloat((a?.xGCPerGame?.value as string) ?? "0") ?? 0) -
          (parseFloat(b?.xGCPerGame?.value as string) ?? "0"),
      )[0];
    const bestAttacker = [...validFootballers].sort(
      (a, b) =>
        parseFloat((b?.xGSPerGame as string) ?? 0) -
        parseFloat((a?.xGSPerGame as string) ?? 0),
    )[0];
    const mostDifferential = [...validFootballers].sort(
      (a, b) =>
        parseFloat(a?.selected_by_percent ?? "0") -
        parseFloat(b?.selected_by_percent ?? "0"),
    )[0];

    const highScoringGames = [...validFootballers].sort((a, b) => {
      const aHistory = a?.history.filter(
        (game) => game.round >= startGameweek && game.round <= endGameweek,
      );
      const aGoals = aHistory.length
        ? aHistory.reduce(
            (sum, game) => sum + ((game.team_h_score ?? 0) + (game.team_a_score ?? 0)),
            0,
          ) / aHistory.length
        : 0;

      const bHistory = b?.history.filter(
        (game) => game.round >= startGameweek && game.round <= endGameweek,
      );
      const bGoals = bHistory.length
        ? bHistory.reduce(
            (sum, game) => sum + ((game.team_h_score ?? 0) + (game.team_a_score ?? 0)),
            0,
          ) / bHistory.length
        : 0;

      return bGoals - aGoals;
    })[0];

    const lowScoringGames = [...validFootballers].sort((a, b) => {
      const aHistory = a?.history.filter(
        (game) => game.round >= startGameweek && game.round <= endGameweek,
      );
      const aGoals = aHistory.length
        ? aHistory.reduce(
            (sum, game) => sum + ((game.team_h_score ?? 0) + (game.team_a_score ?? 0)),
            0,
          ) / aHistory.length
        : 0;

      const bHistory = b?.history.filter(
        (game) => game.round >= startGameweek && game.round <= endGameweek,
      );
      const bGoals = bHistory.length
        ? bHistory.reduce(
            (sum, game) => sum + ((game.team_h_score ?? 0) + (game.team_a_score ?? 0)),
            0,
          ) / bHistory.length
        : 0;

      return aGoals - bGoals;
    })[0];

    // Count how many times a player has scored 9+ points in a game
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

    // Find max haul count
    const maxHaulCount = Math.max(...haulsCount.map((entry) => entry.haulCount));

    // Find the player whose **team** scored the most goals
    const bestAttackingTeam = [...validFootballers].sort((a, b) => {
      const aTotalTeamGoals =
        a?.history
          .filter((game) => game.round >= startGameweek && game.round <= endGameweek)
          .reduce(
            (sum, game) =>
              sum +
              (a.team === game.opponent_team
                ? (game.team_a_score ?? 0)
                : (game.team_h_score ?? 0)),
            0,
          ) ?? 0;

      const bTotalTeamGoals =
        b?.history
          .filter((game) => game.round >= startGameweek && game.round <= endGameweek)
          .reduce(
            (sum, game) =>
              sum +
              (b.team === game.opponent_team
                ? (game.team_a_score ?? 0)
                : (game.team_h_score ?? 0)),
            0,
          ) ?? 0;

      return bTotalTeamGoals - aTotalTeamGoals; // More goals = better rank
    })[0];

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
        isBestMinutes: footballer.id === mostMinutes?.id,
        isBestFinisher: footballer.id === bestFinisher?.id,
        isBestFixtures: footballer.id === bestFixtures?.id,
        isBestDefender: footballer.id === bestDefender?.id,
        isBestAttacker: footballer.id === bestAttacker?.id,
        isDifferential: footballer.id === mostDifferential?.id,
        isBestHighScoringGames: footballer.id === highScoringGames?.id,
        isBestLowScoringGames: footballer.id === lowScoringGames?.id,
        isMostHauls: { value: haulCount === maxHaulCount, count: haulCount },
        isBestAttackingTeam: footballer.id === bestAttackingTeam?.id,
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
