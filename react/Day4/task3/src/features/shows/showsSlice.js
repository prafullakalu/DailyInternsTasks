import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch shows
export const fetchShows = createAsyncThunk(
  "shows/fetchShows",
  async (searchTerm) => {
    const response = await fetch(
      `https://api.tvmaze.com/search/shows?q=${searchTerm}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    return data.map((item) => item.show);
  }
);

const initialState = {
  shows: [],
  loading: false,
  error: null
};

const showsSlice = createSlice({
  name: "shows",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShows.fulfilled, (state, action) => {
        state.loading = false;
        state.shows = action.payload;
      })
      .addCase(fetchShows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default showsSlice.reducer;