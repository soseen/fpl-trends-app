import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AsyncThunkStatus } from "../types";
import { getTotalPlayersData } from "src/queries/getTotalPlayers";

type FootballersState = {
  totalPlayers: number;
  status: AsyncThunkStatus;
  error: string | null;
}

const initialState: FootballersState = {
  totalPlayers: 0,
  status: AsyncThunkStatus.idle,
  error: null,
};

export const fetchTotalPlayers = createAsyncThunk(
  "totalPlayers/fetchTotalPlayers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getTotalPlayersData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const totalPlayersSlice = createSlice({
  name: "totalPlayers",
  initialState,
  reducers: {
    setTotalPlayers: (state, action: PayloadAction<number>) => {
      state.totalPlayers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalPlayers.pending, (state) => {
        state.status = AsyncThunkStatus.loading;
      })
      .addCase(
        fetchTotalPlayers.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = AsyncThunkStatus.success;
          state.totalPlayers = action.payload;
        },
      )
      .addCase(fetchTotalPlayers.rejected, (state, action) => {
        state.status = AsyncThunkStatus.failed;
        state.error = action.payload as string;
      });
  },
});

export const { setTotalPlayers } = totalPlayersSlice.actions;
export default totalPlayersSlice.reducer;
