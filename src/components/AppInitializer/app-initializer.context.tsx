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

type AppInitializerProvider = {
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

export const AppInitializerProvider = ({ children }: AppInitializerProvider) => {
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
  const gameweeksCount = endGameweek - startGameweek + 1;

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
          (h) => h.round >= startGameweek && h.round <= endGameweek,
        );
        const additionalInfo = historyInRange.reduce(
          (acc, val) => {
            const gameweekEvent = events.find((e) => e.id === val.round);
            const ownershipPercent =
              (val.selected / (gameweekEvent?.ranked_count ?? totalPlayers)) * 100;

            return {
              totalPoints: acc.totalPoints + val.total_points,
              totalGoals: acc.totalGoals + val.goals_scored,
              totalAssists: acc.totalAssists + val.assists,
              totalCleanSheets: acc.totalCleanSheets + val.clean_sheets,
              totalSaves: acc.totalSaves + val.saves,
              totalXGI: acc.totalXGI + parseFloat(val.expected_goal_involvements),
              xGIPerGame: (
                (acc.totalXGI + parseFloat(val.expected_goal_involvements)) /
                gameweeksCount
              ).toFixed(2),
              teamName: footballer.teams.name,
              maxOwnership: Math.max(ownershipPercent, acc.maxOwnership),
            };
          },

          {
            totalPoints: 0,
            totalGoals: 0,
            totalAssists: 0,
            totalCleanSheets: 0,
            totalSaves: 0,
            totalXGI: 0,
            xGIPerGame: "0.00",
            teamName: "",
            maxOwnership: 0,
          },
        );

        return { ...footballer, ...additionalInfo };
      })
      .filter((f) => f.element_type !== FootballerPosition.manager);

    dispatch(setEnrichedFootballers(enrichedFootballers));
  }, [dispatch, list, startGameweek, endGameweek]);

  const appStatus = useMemo(() => {
    const statuses = [status, teamsStatus, totalPlayersStatus];
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
