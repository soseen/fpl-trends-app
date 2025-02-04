import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

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

const gameweeksSlice = createSlice({
  name: "gameweeks",
  initialState,
  reducers: {
    setGameweekRange: (state, action: PayloadAction<{ start: number; end: number }>) => {
      state.startGameweek = action.payload.start;
      state.endGameweek = action.payload.end;
    },
    initializeGameweekRange: (state, action: PayloadAction<number>) => {
      state.maxGameweek = action.payload;
      state.endGameweek = action.payload;
      state.startGameweek = Math.max(1, action.payload - 3);
    },
  },
});

export const { setGameweekRange, initializeGameweekRange } = gameweeksSlice.actions;
export default gameweeksSlice.reducer;

export const selectGameweekRange = (state: RootState) => state.gameweeks;
