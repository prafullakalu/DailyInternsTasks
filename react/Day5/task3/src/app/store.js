import {configureStore} from "@reduxjs/toolkit"
import userReducer from "../feture/userSlice";



export const store = configureStore({
    reducer: {
        users:userReducer
    }
})