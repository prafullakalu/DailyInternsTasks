import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchProjects = createAsyncThunk("projects/fetchProjects", async () => {
  const res = await axiosInstance.get("/projects")
  return res.data
})

const projectsSlice = createSlice({
  name: "projects",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.list = action.payload
    })
  }
})

export default projectsSlice.reducer
