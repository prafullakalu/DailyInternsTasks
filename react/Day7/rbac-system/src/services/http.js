
import axios from 'axios'

const API_BASE = 'http://localhost:3001'

const http = axios.create({ baseURL: API_BASE })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('rbac_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default http