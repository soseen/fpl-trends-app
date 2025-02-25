import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TeamData } from "src/queries/types";
import { AsyncThunkStatus } from "../types";
import { getTeamsData } from "src/queries/getTeams";

type FootballersState = {
  list: TeamData[];
  status: AsyncThunkStatus;
  error: string | null;
};

const initialState: FootballersState = {
  list: [],
  status: AsyncThunkStatus.idle,
  error: null,
};

export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getTeamsData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<TeamData[]>) => {
      state.list = action.payload;
    },
    addTeam: (state, action: PayloadAction<TeamData>) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.status = AsyncThunkStatus.loading;
      })
      .addCase(fetchTeams.fulfilled, (state, action: PayloadAction<TeamData[]>) => {
        state.status = AsyncThunkStatus.success;
        state.list = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.status = AsyncThunkStatus.failed;
        state.error = action.payload as string;
      });
  },
});

export const { setTeams, addTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
