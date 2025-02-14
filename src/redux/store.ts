import { configureStore } from "@reduxjs/toolkit";
import footballersSlice from "./slices/footballersSlice";
import teamsSlice from "./slices/teamsSlice";
import totalPlayersSlice from "./slices/totalPlayersSlice";
import eventsSlice from "./slices/eventsSlice";
import gameweeksSlice, { initializeGameweekRange } from "./slices/gameweeksSlice";
import footballersGameweekStatsSlice from "./slices/footballersGameweekStatsSlice";

export const store = configureStore({
  reducer: {
    footballers: footballersSlice,
    teams: teamsSlice,
    gameweeks: gameweeksSlice,
    events: eventsSlice,
    totalPlayers: totalPlayersSlice,
    footballersGameweekStats: footballersGameweekStatsSlice
  },
});

const initializeGameweeks = () => {
  const state = store.getState();
  const footballers = state.footballers.list;

  if (footballers.length > 0) {
    const firstPlayer = footballers[0];
    const fixtureEvents = firstPlayer.footballer_fixtures.map((fixture) => fixture.event);
    const nextGameweek = Math.min(...fixtureEvents);
    const lastCompletedGameweek = nextGameweek - 1;

    store.dispatch(initializeGameweekRange(lastCompletedGameweek));
  }
};

store.subscribe(() => {
  if (store.getState().footballers.list.length > 0 && store.getState().gameweeks.maxGameweek === 0) {
    initializeGameweeks();
  }
});

// Infer types for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
