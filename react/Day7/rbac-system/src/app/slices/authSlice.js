<<<<<<< HEAD:react/Day7/rbac/rbac-app/src/app/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  login as loginService, 
  logout as logoutService,
  fetchCurrentUserFromDb
} from '../../services/authService'
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await loginService(email, password)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

export const verifyUserThunk = createAsyncThunk(
  'auth/verifyUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth
      return await fetchCurrentUserFromDb(token)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    token:       null,
    permissions: [],  
    loading:     false,
    error:       null,
  },
  reducers: {
    logoutAction(state) {
      logoutService()
      state.user        = null
      state.token       = null
      state.permissions = []
      state.error       = null
    },
    clearError(state) {
      state.error = null
    },
 
    refreshMyPermissions(state, action) {
      state.permissions = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading     = false
        s.user        = a.payload.user
        s.token       = a.payload.token
        s.permissions = a.payload.permissions
      })
      .addCase(loginThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
.addCase(verifyUserThunk.fulfilled, (state, action) => {
  state.user = action.payload.user
  state.permissions = action.payload.permissions
})
.addCase(verifyUserThunk.rejected, (state) => {
  state.user = null
  state.token = null
  state.permissions = []
})
  },
})

export const { logoutAction, clearError, refreshMyPermissions } = authSlice.actions
=======
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login as loginService, logout as logoutService } from '../../services/authService'

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await loginService(email, password)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    token:       null,
    permissions: [],  
    loading:     false,
    error:       null,
  },
  reducers: {
    logoutAction(state) {
      logoutService()
      state.user        = null
      state.token       = null
      state.permissions = []
      state.error       = null
    },
    clearError(state) {
      state.error = null
    },
 
    refreshMyPermissions(state, action) {
      state.permissions = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading     = false
        s.user        = a.payload.user
        s.token       = a.payload.token
        s.permissions = a.payload.permissions
      })
      .addCase(loginThunk.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
  },
})

export const { logoutAction, clearError, refreshMyPermissions } = authSlice.actions
>>>>>>> 38101e840b293e4b78a5ff5ec3e466443e4416ea:react/Day7/rbac-system/src/app/slices/authSlice.js
export default authSlice.reducer