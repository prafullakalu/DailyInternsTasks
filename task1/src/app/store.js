import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"

import authReducer from "../features/auth/authSlice"
import employeeReducer from "../features/employees/employeeSlice"
import uiReducer from "../features/ui/uiSlice"
import themeReducer from "../features/theme/themeSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  employees: employeeReducer,
  ui: uiReducer,
  theme: themeReducer,
})

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "employees", "theme"],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
})

export const persistor = persistStore(store)