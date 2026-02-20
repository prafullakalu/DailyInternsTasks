import { configureStore } from "@reduxjs/toolkit";
import showsReducer from "../features/shows/showsSlice";

export const store = configureStore({
  reducer: {
    shows: showsReducer
  }
});