import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { trackingService } from "./trackingService"

const initialState = {
  items: [],
  isLoading: false,
  isError: false,
  message: "",
}

export const fetchTracking = createAsyncThunk(
  "tracking/fetch",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await trackingService.getTracking(token)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
  }
)

export const addTrackingItem = createAsyncThunk(
  "tracking/add",
  async (data, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await trackingService.addTracking(data, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
  }
)

export const updateTrackingItem = createAsyncThunk(
  "tracking/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      return await trackingService.updateTracking(id, data, token)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
  }
)

export const deleteTrackingItem = createAsyncThunk(
  "tracking/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token
      await trackingService.deleteTracking(id, token)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
  }
)

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTracking.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(addTrackingItem.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateTrackingItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        )
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteTrackingItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        )
      })
  },
})

export default trackingSlice.reducer