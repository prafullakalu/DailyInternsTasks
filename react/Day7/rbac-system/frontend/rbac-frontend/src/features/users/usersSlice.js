import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async () => {
        const res = await axiosInstance.get("/users")
        return res.data
    }
)

export const createUser = createAsyncThunk(
    "users/createUser",
    async (user) => {
        const res = await axiosInstance.post("/users", user)
        return res.data
    }
)

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ id, user }) => {
        const res = await axiosInstance.patch(`/users/${id}`, user)
        return res.data
    }
)

export const deleteUser = createAsyncThunk(
    "users/deleteUser",
    async (id) => {
        await axiosInstance.delete(`/users/${id}`)
        return id
    }
)

const usersSlice = createSlice({
    name: "users",
    initialState: {
        list: []
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.list = action.payload
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.list.push(action.payload)
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const idx = state.list.findIndex(u => u.id === action.payload.id)
                if (idx !== -1) state.list[idx] = action.payload
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.list = state.list.filter(u => u.id !== action.payload)
            })
    }
})

export default usersSlice.reducer