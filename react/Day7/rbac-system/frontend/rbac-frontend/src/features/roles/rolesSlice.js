import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async () => {
    const res = await axiosInstance.get("/roles")
    return res.data
  }
)

const rolesSlice = createSlice({
  name: "roles",
  initialState: {
    list: []
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRoles.fulfilled, (state, action) => {
      state.list = action.payload
    })
  }
})

export default rolesSlice.reducer