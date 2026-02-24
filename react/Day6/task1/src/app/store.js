import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { createStateSyncMiddleware, initStateWithPrevTab } from 'redux-state-sync'


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)


export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      createStateSyncMiddleware()
    )
})


initStateWithPrevTab(store)


export const persistor = persistStore(store)