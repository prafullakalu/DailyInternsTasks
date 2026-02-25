import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async () => {
        const res = await axiosInstance.get("/users")
        return res.data
    }
)

const usersSlice = createSlice({
    name: "users",
    initialState: {
        list: []
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.list = action.payload
        })
    }
})

export default usersSlice.reducer