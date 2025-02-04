import { configureStore } from "@reduxjs/toolkit";
import footballersSlice from "./slices/footballersSlice";
import teamsSlice from "./slices/teamsSlice";
import gameweeksSlice, { initializeGameweekRange } from "./slices/gameweeksSlice";

export const store = configureStore({
  reducer: {
    footballers: footballersSlice,
    teams: teamsSlice,
    gameweeks: gameweeksSlice,
  },
});

const initializeGameweeks = () => {
  const state = store.getState();
  const footballers = state.footballers.list;

  if (footballers.length > 0) {
    const firstPlayer = footballers[0];
    console.log(firstPlayer);
    const fixtureEvents = firstPlayer.footballer_fixtures.map((fixture) => fixture.event);
    console.log(fixtureEvents);
    const nextGameweek = Math.min(...fixtureEvents);
    console.log(nextGameweek);
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
