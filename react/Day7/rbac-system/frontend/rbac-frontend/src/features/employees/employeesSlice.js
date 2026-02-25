import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchEmployees = createAsyncThunk("employees/fetchEmployees", async () => {
  const res = await axiosInstance.get("/employees")
  return res.data
})

const employeesSlice = createSlice({
  name: "employees",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.list = action.payload
    })
  }
})

export default employeesSlice.reducer
