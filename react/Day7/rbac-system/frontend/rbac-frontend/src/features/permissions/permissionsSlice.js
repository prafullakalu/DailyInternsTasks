import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async () => {
    const res = await axiosInstance.get("/permissions")
    return res.data
  }
)

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchPermissions.fulfilled, (state, action) => {
      state.list = action.payload
    })
  }
})

export default permissionsSlice.reducer