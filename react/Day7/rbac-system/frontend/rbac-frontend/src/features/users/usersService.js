import axiosInstance from "../../api/axiosInstance"

export const createUser = (payload) => axiosInstance.post("/users", payload)
export const updateUser = (id, payload) => axiosInstance.patch(`/users/${id}`, payload)
export const deleteUser = (id) => axiosInstance.delete(`/users/${id}`)
