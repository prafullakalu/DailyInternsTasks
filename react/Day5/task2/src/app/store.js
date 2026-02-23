import { configureStore } from "@reduxjs/toolkit"
import deleteRowReducer from "../feture/deleterowSlice"

export const store = configureStore({
  reducer: {
    deleteRow: deleteRowReducer
  }
})