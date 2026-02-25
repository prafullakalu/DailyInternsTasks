import axiosInstance from "../../api/axiosInstance"

export const createProject = (payload) => axiosInstance.post("/projects", payload)
export const updateProject = (id, payload) => axiosInstance.patch(`/projects/${id}`, payload)
export const deleteProject = (id) => axiosInstance.delete(`/projects/${id}`)
