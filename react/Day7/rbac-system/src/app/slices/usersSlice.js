import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as userService from '../../services/userService'

export const fetchUsers  = createAsyncThunk('users/fetch',  async (_, { rejectWithValue }) => {
  try { return await userService.getUsers() } catch (e) { return rejectWithValue(e.message) }
})
export const createUser  = createAsyncThunk('users/create', async (data, { rejectWithValue }) => {
  try { return await userService.createUser(data) } catch (e) { return rejectWithValue(e.message) }
})
export const updateUser  = createAsyncThunk('users/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await userService.updateUser(id, data) } catch (e) { return rejectWithValue(e.message) }
})
export const deleteUser  = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try { return await userService.deleteUser(id) } catch (e) { return rejectWithValue(e.message) }
})

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchUsers.pending,   (s) => { s.loading = true })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchUsers.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createUser.fulfilled, (s, a) => { s.list.push(a.payload) })
      .addCase(updateUser.fulfilled, (s, a) => { s.list = s.list.map(u => u.id === a.payload.id ? a.payload : u) })
      .addCase(deleteUser.fulfilled, (s, a) => { s.list = s.list.filter(u => u.id !== a.payload) })
  },
})
export default usersSlice.reducer