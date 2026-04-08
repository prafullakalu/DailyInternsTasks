import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as projectService from '../../services/projectService'

export const fetchProjects  = createAsyncThunk('projects/fetch',  async (_, { rejectWithValue }) => {
  try { return await projectService.getProjects() } catch (e) { return rejectWithValue(e.message) }
})
export const createProject  = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try { return await projectService.createProject(data) } catch (e) { return rejectWithValue(e.message) }
})
export const updateProject  = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await projectService.updateProject(id, data) } catch (e) { return rejectWithValue(e.message) }
})
export const deleteProject  = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try { return await projectService.deleteProject(id) } catch (e) { return rejectWithValue(e.message) }
})

const projectsSlice = createSlice({
  name: 'projects',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchProjects.pending,   (s) => { s.loading = true })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchProjects.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(createProject.fulfilled, (s, a) => { s.list.push(a.payload) })
      .addCase(updateProject.fulfilled, (s, a) => { s.list = s.list.map(p => p.id === a.payload.id ? a.payload : p) })
      .addCase(deleteProject.fulfilled, (s, a) => { s.list = s.list.filter(p => p.id !== a.payload) })
  },
})
export default projectsSlice.reducer