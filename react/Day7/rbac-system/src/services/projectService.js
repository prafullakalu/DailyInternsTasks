
import http from './http'

export async function getProjects() {
  const res = await http.get('/projects')
  return res.data
}

export async function getProjectById(id) {
  const res = await http.get(`/projects/${id}`)
  return res.data
}

export async function createProject(data) {
  const res = await http.post('/projects', data)
  return res.data
}

export async function updateProject(id, data) {
  const res = await http.patch(`/projects/${id}`, data)
  return res.data
}

export async function deleteProject(id) {
  await http.delete(`/projects/${id}`)
  return id
}