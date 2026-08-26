import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "src/redux/store";
import { type Footballer } from "src/queries/types";

export type AdditionalStats = {
  totalPoints: number;
  totalGoals: number;
  totalNonPenaltyGoals: number;
  totalAssists: number;
  totalCleanSheets: number;
  totalSaves: number;
  totalNpxGI: number;
  npxGIPerGame: string;
  npxGIPer90: string;
  totalXA: number;
  xAPerGame: string;
  xAPer90: string;
  totalNpxG: number;
  npxGPerGame: string;
  npxGPer90: string;
  totalXGC: number;
  xGCPerGame: string;
  xGCPer90: string;
  pointsPerGame: number;
  pointsPer90: number;
  goalsPerGame: number;
  goalsPer90: number;
  assistsPerGame: number;
  assistsPer90: number;
  savesPerGame: number;
  teamName: string;
  maxOwnership: number;
  totalMinutes: number;
  minPerGame: number;
  totalBonus: number;
  totalHauls: number;
  totalDefconBonuses: number;
  totalDefcons: number;
  defconsPerGame: string;
  defconsPer90: string;
};

export type FootballerWithGameweekStats = Footballer & AdditionalStats;

type FootballersStatsState = {
  footballers: FootballerWithGameweekStats[];
};

const initialState: FootballersStatsState = {
  footballers: [],
};

const footballersGameweekStatsSlice = createSlice({
  name: "footballersGameweekStats",
  initialState,
  reducers: {
    setEnrichedFootballers: (
      state,
      action: PayloadAction<FootballerWithGameweekStats[]>,
    ) => {
      state.footballers = action.payload;
    },
  },
});

export const { setEnrichedFootballers } = footballersGameweekStatsSlice.actions;

export const selectEnrichedFootballers = (state: RootState) =>
  state.footballersGameweekStats.footballers;

export default footballersGameweekStatsSlice.reducer;
