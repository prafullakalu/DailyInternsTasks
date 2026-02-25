import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, thunkAPI) => {
        try {
            const res = await axiosInstance.post("/login", credentials)
            return res.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: null,
        user: null,
        permissions: []
    },
    reducers: {
        logout: (state) => {
            state.token = null
            state.user = null
            state.permissions = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.token = action.payload.token
            state.user = action.payload.user
            state.permissions = action.payload.permissions
        })
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer