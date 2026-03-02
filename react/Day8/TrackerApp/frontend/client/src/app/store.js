import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage" // default localStorage for web
import authReducer from "../features/auth/authSlice"
import trackingReducer from "../features/auth/trackingSlice"

// 1️⃣ persist config
const persistConfig = {
  key: "root",    // unique key for localStorage
  storage,        // storage type
  whitelist: ["auth"], // only persist auth slice
}

// 2️⃣ root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  tracking: trackingReducer,
})

// 3️⃣ persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 4️⃣ store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
})

// 5️⃣ persistor
export const persistor = persistStore(store)