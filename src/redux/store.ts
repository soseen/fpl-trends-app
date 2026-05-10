import { configureStore } from "@reduxjs/toolkit";
import footballersSlice from "./slices/footballersSlice";
import teamsSlice from "./slices/teamsSlice";
import totalPlayersSlice from "./slices/totalPlayersSlice";
import eventsSlice from "./slices/eventsSlice";
import gameweeksSlice, { initializeGameweekRange } from "./slices/gameweeksSlice";
import footballersGameweekStatsSlice from "./slices/footballersGameweekStatsSlice";
import { AsyncThunkStatus } from "./types";

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

const latestIngestedEvent = () => {
  const events = store.getState().events.events;
  if (events.length === 0) return 0;

  const current = events.find((event) => event.is_current);
  if (current) return current.id;

  return Math.max(
    0,
    ...events
      .filter((event) => event.finished)
      .map((event) => event.id),
  );
};

const latestCompletedFixtureGameweek = () => {
  const state = store.getState();
  const footballers = state.footballers.list;

  if (footballers.length === 0) return 0;

  const firstPlayer = footballers[0];
  if (!firstPlayer) return 0;

  const fixtureEvents = firstPlayer.footballer_fixtures.map((fixture) => fixture.event);
  if (fixtureEvents.length === 0) return 0;

  const nextGameweek = Math.min(...fixtureEvents);
  return Math.max(1, nextGameweek - 1);
};

const initializeGameweeks = () => {
  const eventsStatus = store.getState().events.status;
  const eventMax = latestIngestedEvent();
  if (eventMax > 0) {
    store.dispatch(initializeGameweekRange(eventMax));
    return;
  }

  if (eventsStatus !== AsyncThunkStatus.failed) return;

  const maxGameweek = latestCompletedFixtureGameweek();
  if (maxGameweek > 0) {
    store.dispatch(initializeGameweekRange(maxGameweek));
  }
};

store.subscribe(() => {
  if (store.getState().gameweeks.maxGameweek === 0) {
    initializeGameweeks();
  }
});

// Infer types for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
