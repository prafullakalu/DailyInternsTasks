import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as employeeService from '../../services/employeeService'

export const fetchEmployees = createAsyncThunk('employees/fetch', async (_, { rejectWithValue }) => {
  try { return await employeeService.getEmployees() } catch (e) { return rejectWithValue(e.message) }
})
export const createEmployee = createAsyncThunk('employees/create', async (data, { rejectWithValue }) => {
  try { return await employeeService.createEmployee(data) } catch (e) { return rejectWithValue(e.message) }
})
export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await employeeService.updateEmployee(id, data) } catch (e) { return rejectWithValue(e.message) }
})
export const deleteEmployee = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try { return await employeeService.deleteEmployee(id) } catch (e) { return rejectWithValue(e.message) }
})
const employeesSlice = createSlice({
  name: 'employees',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchEmployees.pending, (s) => { s.loading = true })
      .addCase(fetchEmployees.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchEmployees.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createEmployee.fulfilled, (s, a) => { s.list.push(a.payload) })
      .addCase(updateEmployee.fulfilled, (s, a) => { s.list = s.list.map(e => e.id === a.payload.id ? a.payload : e) })
      .addCase(deleteEmployee.fulfilled, (s, a) => { s.list = s.list.filter(e => e.id !== a.payload) })
  },
})
export default employeesSlice.reducer