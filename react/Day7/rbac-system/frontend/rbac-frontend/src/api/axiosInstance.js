import axios from "axios"
import { store } from "../app/store"

const axiosInstance = axios.create({
    // json-server backend listens on port 3001
    baseURL: "http://localhost:3001"
})

axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.token

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default axiosInstance