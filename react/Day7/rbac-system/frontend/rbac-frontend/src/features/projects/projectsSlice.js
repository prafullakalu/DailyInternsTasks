import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchProjects = createAsyncThunk("projects/fetchProjects", async () => {
  const res = await axiosInstance.get("/projects")
  return res.data
})

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (project) => {
    const res = await axiosInstance.post("/projects", project)
    return res.data
  }
)

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, project }) => {
    const res = await axiosInstance.patch(`/projects/${id}`, project)
    return res.data
  }
)

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id) => {
    await axiosInstance.delete(`/projects/${id}`)
    return id
  }
)

const projectsSlice = createSlice({
  name: "projects",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.list = action.payload
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload)
      })
  }
})

export default projectsSlice.reducer
