import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"

import authReducer from "../features/auth/authSlice"
import todoReducer from "../features/todos/todoSlice"
import counterReducer from "../features/counter/counterSlice"


const rootReducer = combineReducers({
    auth: authReducer,
    todos: todoReducer,
    counter: counterReducer
})


const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "todos",]
} 


const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
  reducer: persistedReducer
})

export const persistor = persistStore(store)