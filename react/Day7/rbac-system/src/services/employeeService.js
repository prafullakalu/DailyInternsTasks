
import http from './http'

export async function getEmployees() {
  const res = await http.get('/employees')
  return res.data
}

export async function getEmployeeById(id) {
  const res = await http.get(`/employees/${id}`)
  return res.data
}

export async function createEmployee(data) {
  const res = await http.post('/employees', data)
  return res.data
}

export async function updateEmployee(id, data) {
  const res = await http.patch(`/employees/${id}`, data)
  return res.data
}

export async function deleteEmployee(id) {
  await http.delete(`/employees/${id}`)
  return id
}