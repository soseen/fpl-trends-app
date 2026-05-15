import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "src/redux/slices/eventsSlice";
import { fetchFootballersData } from "src/redux/slices/footballersSlice";
import { fetchTeams } from "src/redux/slices/teamsSlice";
import { fetchTotalPlayers } from "src/redux/slices/totalPlayersSlice";
import { AppDispatch, RootState } from "src/redux/store";
import { AsyncThunkStatus } from "src/redux/types";
import { setEnrichedFootballers } from "src/redux/slices/footballersGameweekStatsSlice";
import { FootballerPosition } from "src/queries/types";
import { hasDefconBonus } from "src/utils/defcon";

type AppInitializerProviderProps = {
  children: React.ReactNode;
};

export enum AppInitStatus {
  loading = "loading",
  error = "error",
  idle = "idle",
}

type AppInitializerState = {
  status: AppInitStatus;
};

const AppInitializerContext = createContext<AppInitializerState>({
  status: AppInitStatus.loading,
});

const parseStat = (value: string | number | null | undefined): number => {
  const parsed = typeof value === "number" ? value : parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeDivide = (numerator: number, denominator: number): number =>
  denominator > 0 ? numerator / denominator : 0;

const formatRate = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(2) : "0.00";

export const AppInitializerProvider = ({ children }: AppInitializerProviderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, list } = useSelector((state: RootState) => state.footballers);
  const { status: teamsStatus } = useSelector((state: RootState) => state.teams);
  const { status: totalPlayersStatus, totalPlayers } = useSelector(
    (state: RootState) => state.totalPlayers,
  );
  const { startGameweek, endGameweek } = useSelector(
    (state: RootState) => state.gameweeks,
  );
  const { status: eventsStatus, events } = useSelector(
    (state: RootState) => state.events,
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFootballersData());
    }
    if (teamsStatus === "idle") {
      dispatch(fetchTeams());
    }
    if (totalPlayersStatus === "idle") {
      dispatch(fetchTotalPlayers());
    }
    if (eventsStatus === "idle") {
      dispatch(fetchEvents());
    }
  }, [dispatch, status, teamsStatus, totalPlayersStatus, eventsStatus]);

  useEffect(() => {
    if (!list.length) return;

    const enrichedFootballers = list
      .map((footballer) => {
        const historyInRange = footballer.history.filter(
          (h) =>
            h.round >= startGameweek &&
            h.round <= endGameweek &&
            h.team_a_score !== null &&
            h.team_h_score !== null,
        );
        const finishedFixturesCount = historyInRange.length;
        const appearancesCount = historyInRange.filter((h) => h.minutes > 0).length;

        const totalDefconBonuses = historyInRange.filter((h) =>
          hasDefconBonus(h, footballer.element_type),
        ).length;

        const totalDefcons = historyInRange.reduce(
          (sum, h) => sum + (h.defensive_contribution ?? 0),
          0,
        );
        const totalMinutes = historyInRange.reduce((sum, h) => sum + h.minutes, 0);
        const minutesPer90 = totalMinutes / 90;
        const defconsPerGame = formatRate(
          safeDivide(totalDefcons, appearancesCount),
        );
        const defconsPer90 = formatRate(safeDivide(totalDefcons, minutesPer90));

        const additionalInfo = historyInRange.reduce(
          (acc, val) => {
            const gameweekEvent = events.find((e) => e.id === val.round);
            const ownershipPercent =
              (val.selected / (gameweekEvent?.ranked_count ?? totalPlayers)) * 100;
            const per90Count = (acc.totalMinutes + val.minutes) / 90;
            const totalPoints = acc.totalPoints + val.total_points;
            const totalGoals = acc.totalGoals + val.goals_scored;
            const totalAssists = acc.totalAssists + val.assists;
            const totalSaves = acc.totalSaves + val.saves;
            const totalXGI =
              acc.totalXGI + parseStat(val.expected_goal_involvements);
            const expectedAssists =
              val.expected_assists === undefined || val.expected_assists === null
                ? Math.max(
                    0,
                    parseStat(val.expected_goal_involvements) -
                      parseStat(val.expected_goals),
                  )
                : parseStat(val.expected_assists);
            const totalXA = acc.totalXA + expectedAssists;
            const totalXGS = acc.totalXGS + parseStat(val.expected_goals);
            const totalXGC =
              acc.totalXGC + parseStat(val.expected_goals_conceded);
            const accumulatedMinutes = acc.totalMinutes + val.minutes;

            return {
              totalPoints,
              pointsPerGame: safeDivide(totalPoints, appearancesCount),
              pointsPer90: safeDivide(totalPoints, per90Count),
              totalGoals,
              goalsPerGame: safeDivide(totalGoals, appearancesCount),
              goalsPer90: safeDivide(totalGoals, per90Count),
              totalAssists,
              assistsPerGame: safeDivide(totalAssists, appearancesCount),
              assistsPer90: safeDivide(totalAssists, per90Count),
              totalCleanSheets: acc.totalCleanSheets + val.clean_sheets,
              totalSaves,
              savesPerGame: safeDivide(totalSaves, appearancesCount),
              totalXGI,
              xGIPerGame: formatRate(safeDivide(totalXGI, appearancesCount)),
              xGIPer90: formatRate(safeDivide(totalXGI, per90Count)),
              totalXA,
              xAPerGame: formatRate(safeDivide(totalXA, appearancesCount)),
              xAPer90: formatRate(safeDivide(totalXA, per90Count)),
              totalXGS,
              xGSPerGame: formatRate(safeDivide(totalXGS, appearancesCount)),
              xGSPer90: formatRate(safeDivide(totalXGS, per90Count)),
              totalXGC,
              xGCPerGame: formatRate(safeDivide(totalXGC, appearancesCount)),
              xGCPer90: formatRate(safeDivide(totalXGC, per90Count)),
              teamName: footballer.teams.name,
              maxOwnership: Math.max(ownershipPercent, acc.maxOwnership),
              totalMinutes: accumulatedMinutes,
              minPerGame: safeDivide(accumulatedMinutes, finishedFixturesCount),
              totalBonus: acc.totalBonus + val.bonus,
              totalHauls: acc.totalHauls + (val.total_points >= 9 ? 1 : 0),
            };
          },
          {
            totalPoints: 0,
            pointsPerGame: 0,
            pointsPer90: 0,
            totalGoals: 0,
            goalsPerGame: 0,
            goalsPer90: 0,
            totalAssists: 0,
            assistsPerGame: 0,
            assistsPer90: 0,
            totalCleanSheets: 0,
            totalSaves: 0,
            savesPerGame: 0,
            totalXGI: 0,
            xGIPerGame: "0.00",
            xGIPer90: "0.00",
            totalXA: 0,
            xAPerGame: "0.00",
            xAPer90: "0.00",
            totalXGS: 0,
            xGSPerGame: "0.00",
            xGSPer90: "0.00",
            totalXGC: 0,
            xGCPerGame: "0.00",
            xGCPer90: "0.00",
            teamName: "",
            maxOwnership: 0,
            minPerGame: 0,
            totalMinutes: 0,
            totalBonus: 0,
            totalHauls: 0,
          },
        );

        return {
          ...footballer,
          ...additionalInfo,
          totalDefconBonuses,
          totalDefcons,
          defconsPerGame,
          defconsPer90,
        };
      })
      .filter((f) => f.element_type !== FootballerPosition.MGR);

    dispatch(setEnrichedFootballers(enrichedFootballers));
  }, [
    dispatch,
    events,
    list,
    startGameweek,
    endGameweek,
    totalPlayers,
  ]);

  const appStatus = useMemo(() => {
    const statuses = [status, teamsStatus, totalPlayersStatus, eventsStatus];
    if (statuses.includes(AsyncThunkStatus.failed)) {
      return AppInitStatus.error;
    } else if (
      statuses.includes(AsyncThunkStatus.loading) ||
      statuses.includes(AsyncThunkStatus.idle)
    ) {
      return AppInitStatus.loading;
    } else {
      return AppInitStatus.idle;
    }
  }, [status, teamsStatus, totalPlayersStatus, eventsStatus]);

  return (
    <AppInitializerContext.Provider value={{ status: appStatus }}>
      {children}
    </AppInitializerContext.Provider>
  );
};

export const useAppInitContext = () => {
  const context = useContext(AppInitializerContext);
  if (!context) {
    throw new Error("useAppInitContext must be used within AppInitializerProvider");
  }
  return context;
};
