import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  value: 0,
  locked: false
}

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      if (!state.locked) {
        state.value += 1
      }
    },
    decrement: (state) => {
      if (!state.locked) {
        state.value -= 1
      }
    },
    reset: (state) => {
      state.value = 0
    },
    toggleLock: (state) => {
      state.locked = !state.locked
    }
  }
})

export const { increment, decrement, reset, toggleLock } = counterSlice.actions
export default counterSlice.reducer