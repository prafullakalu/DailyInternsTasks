import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer        from './slices/authSlice'
import usersReducer       from './slices/usersSlice'
import employeesReducer   from './slices/employeesSlice'
import projectsReducer    from './slices/projectsSlice'
import permissionsReducer from './slices/permissionsSlice'

const persistConfig = {
  key:       'rbac_v2',
  storage,
  whitelist: ['auth'],   
}

const rootReducer = combineReducers({
  auth:        authReducer,
  users:       usersReducer,
  employees:   employeesReducer,
  projects:    projectsReducer,
  permissions: permissionsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)