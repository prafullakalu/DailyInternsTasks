import { configureStore } from "@reduxjs/toolkit"
import uiReducer from "../feture/uiSlice"

export const store = configureStore({
  reducer: {
    ui: uiReducer
  }
})