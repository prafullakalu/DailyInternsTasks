import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"

import authReducer from "../features/auth/authSlice"
import usersReducer from "../features/users/usersSlice"
import rolesReducer from "../features/roles/rolesSlice"
import employeesReducer from "../features/employees/employeesSlice"
import projectsReducer from "../features/projects/projectsSlice"

const rootReducer = combineReducers({
    auth: authReducer,
    users: usersReducer,
    roles: rolesReducer,
    employees: employeesReducer,
    projects: projectsReducer
})

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer
})

export const persistor = persistStore(store)