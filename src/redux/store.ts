import { configureStore } from "@reduxjs/toolkit";
import footballersSlice from "./slices/footballersSlice";
import teamsSlice from "./slices/teamsSlice";
import totalPlayersSlice from "./slices/totalPlayersSlice";
import eventsSlice from "./slices/eventsSlice";
import gameweeksSlice, {
  initializeGameweekRange,
  initializePreseasonRange,
} from "./slices/gameweeksSlice";
import footballersGameweekStatsSlice from "./slices/footballersGameweekStatsSlice";
import { AsyncThunkStatus } from "./types";
import { getPreseasonSeasonLabel } from "src/utils/preseason";

export const store = configureStore({
  reducer: {
    footballers: footballersSlice,
    teams: teamsSlice,
    gameweeks: gameweeksSlice,
    events: eventsSlice,
    totalPlayers: totalPlayersSlice,
    footballersGameweekStats: footballersGameweekStatsSlice,
  },
});

const latestIngestedEvent = () => {
  const events = store.getState().events.events;
  if (events.length === 0) return 0;

  const current = events.find(
    (event) => event.is_current && event.finished && event.data_checked,
  );
  if (current) return current.id;

  return Math.max(
    0,
    ...events
      .filter((event) => event.finished && event.data_checked)
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
  return Math.max(0, nextGameweek - 1);
};

const initializeGameweeks = () => {
  const state = store.getState();
  const eventsStatus = state.events.status;
  const eventMax = latestIngestedEvent();
  if (eventMax > 0) {
    store.dispatch(initializeGameweekRange(eventMax));
    return;
  }

  if (
    [AsyncThunkStatus.success, AsyncThunkStatus.failed].includes(eventsStatus) &&
    state.footballers.status === AsyncThunkStatus.success
  ) {
    const fixtureMax = latestCompletedFixtureGameweek();
    if (fixtureMax > 0) {
      store.dispatch(initializeGameweekRange(fixtureMax));
      return;
    }

    const seasonLabel = getPreseasonSeasonLabel(state.footballers.list);
    if (seasonLabel) {
      store.dispatch(initializePreseasonRange({ seasonLabel }));
      return;
    }
  }

  if (eventsStatus !== AsyncThunkStatus.failed) return;

  const maxGameweek = latestCompletedFixtureGameweek();
  if (maxGameweek > 0) {
    store.dispatch(initializeGameweekRange(maxGameweek));
  }
};

store.subscribe(() => {
  const { maxGameweek, isPreseason } = store.getState().gameweeks;
  if (maxGameweek === 0 && !isPreseason) {
    initializeGameweeks();
  }
});

// Infer types for better TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
