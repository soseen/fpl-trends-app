import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFootballersData } from "src/queries/getFootballers";
import { AsyncThunkStatus } from "../types";
import { Footballer } from "src/queries/types";

type  FootballersState = {
  list: Footballer[];
  status: AsyncThunkStatus;
  error: string | null;
}

const initialState: FootballersState = {
  list: [],
  status: AsyncThunkStatus.idle,
  error: null,
};

export const fetchFootballersData = createAsyncThunk(
  "footballers/fetchFootballers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getFootballersData();
      return data;
    } catch (error: any) {
      console.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const footballersSlice = createSlice({
  name: "footballers",
  initialState,
  reducers: {
    setFootballers: (state, action: PayloadAction<Footballer[]>) => {
      state.list = action.payload;
    },
    addFootballer: (state, action: PayloadAction<Footballer>) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFootballersData.pending, (state) => {
        state.status = AsyncThunkStatus.loading;
      })
      .addCase(
        fetchFootballersData.fulfilled,
        (state, action: PayloadAction<Footballer[]>) => {
          state.status = AsyncThunkStatus.success;
          state.list = action.payload;
        },
      )
      .addCase(fetchFootballersData.rejected, (state, action) => {
        state.status = AsyncThunkStatus.failed;
        state.error = action.payload as string;
      });
  },
});

export const { setFootballers, addFootballer } = footballersSlice.actions;
export default footballersSlice.reducer;
