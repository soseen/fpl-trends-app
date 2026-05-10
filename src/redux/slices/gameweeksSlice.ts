import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface GameweekState {
  startGameweek: number;
  endGameweek: number;
  maxGameweek: number;
}

const initialState: GameweekState = {
  startGameweek: 0,
  endGameweek: 0,
  maxGameweek: 0,
};

const defaultStartGameweek = (maxGameweek: number): number =>
  Math.max(1, maxGameweek - 4);

const gameweeksSlice = createSlice({
  name: "gameweeks",
  initialState,
  reducers: {
    setGameweekRange: (state, action: PayloadAction<{ start: number; end: number }>) => {
      state.startGameweek = action.payload.start;
      state.endGameweek = action.payload.end;
    },
    initializeGameweekRange: (state, action: PayloadAction<number>) => {
      const maxGameweek = action.payload;
      if (maxGameweek < 1) return;

      state.maxGameweek = maxGameweek;
      state.endGameweek = maxGameweek;
      state.startGameweek = defaultStartGameweek(maxGameweek);
    },
  },
});

export const { setGameweekRange, initializeGameweekRange } = gameweeksSlice.actions;
export default gameweeksSlice.reducer;

export const selectGameweekRange = (state: RootState) => state.gameweeks;
