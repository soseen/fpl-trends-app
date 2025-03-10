import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "src/redux/store";
import { Footballer } from "src/queries/types";

export type AdditionalStats = {
  totalPoints: number;
  totalGoals: number;
  totalAssists: number;
  totalCleanSheets: number;
  totalSaves: number;
  totalXGI: number;
  xGIPerGame: string;
  xGIPer90: string;
  totalXGS: number;
  xGSPerGame: string;
  xGSPer90: string;
  totalXGC: number;
  xGCPerGame: string;
  xGCPer90: string;
  pointsPerGame: number;
  goalsPerGame: number;
  goalsPer90: number;
  assistsPerGame: number;
  assistsPer90: number;
  savesPerGame: number;
  teamName: string;
  maxOwnership: number;
  totalMinutes: number;
  minPerGame: number;
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
    setEnrichedFootballers: (state, action: PayloadAction<FootballerWithGameweekStats[]>) => {
      state.footballers = action.payload;
    },
  },
});

export const { setEnrichedFootballers } = footballersGameweekStatsSlice.actions;

export const selectEnrichedFootballers = (state: RootState) => state.footballersGameweekStats.footballers;

export default footballersGameweekStatsSlice.reducer;
