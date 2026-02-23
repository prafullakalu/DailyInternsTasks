import { configureStore } from "@reduxjs/toolkit"
import counterReducer from "../feture/counterSlice"

export const store = configureStore({
  //root reducer
  reducer: {
    counter: counterReducer
  }
})