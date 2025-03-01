import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AsyncThunkStatus } from "../types";
import { Event } from "src/queries/types";
import { getEventsData } from "src/queries/getEvents";

type  EventsState = {
  events: Event[];
  status: AsyncThunkStatus;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  status: AsyncThunkStatus.idle,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEventsData();
      return data;
    } catch (error: any) {
      console.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = AsyncThunkStatus.loading;
      })
      .addCase(
        fetchEvents.fulfilled,
        (state, action: PayloadAction<Event[]>) => {
          state.status = AsyncThunkStatus.success;
          state.events = action.payload;
        },
      )
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = AsyncThunkStatus.failed;
        state.error = action.payload as string;
      });
  },
});

export const { setEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
