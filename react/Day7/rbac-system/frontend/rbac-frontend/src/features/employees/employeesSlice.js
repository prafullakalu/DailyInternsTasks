import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchEmployees = createAsyncThunk("employees/fetchEmployees", async () => {
  const res = await axiosInstance.get("/employees")
  return res.data
})

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (employee) => {
    const res = await axiosInstance.post("/employees", employee)
    return res.data
  }
)

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, employee }) => {
    const res = await axiosInstance.patch(`/employees/${id}`, employee)
    return res.data
  }
)

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id) => {
    await axiosInstance.delete(`/employees/${id}`)
    return id
  }
)

const employeesSlice = createSlice({
  name: "employees",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.list = action.payload
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e.id !== action.payload)
      })
  }
})

export default employeesSlice.reducer
