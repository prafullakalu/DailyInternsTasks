import axiosInstance from "../../api/axiosInstance"

export const createEmployee = (payload) => axiosInstance.post("/employees", payload)
export const updateEmployee = (id, payload) => axiosInstance.patch(`/employees/${id}`, payload)
export const deleteEmployee = (id) => axiosInstance.delete(`/employees/${id}`)
