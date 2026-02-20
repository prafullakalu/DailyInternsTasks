import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0,
  history: []
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment(state) {
      state.history.push(state.count);
      state.count += 1;
    },
    decrement(state) {
      state.history.push(state.count);
      state.count -= 1;
    },
    reset(state) {
      state.history.push(state.count);
      state.count = 0;
    },
    setValue(state, action) {
      state.history.push(state.count);
      state.count = Number(action.payload);
    }
  }
});

export const { increment, decrement, reset, setValue } =
  counterSlice.actions;

export default counterSlice.reducer;