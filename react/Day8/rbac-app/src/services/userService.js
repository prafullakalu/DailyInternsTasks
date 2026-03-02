
import bcrypt from 'bcryptjs'
import http from './http'

export async function getUsers() {
  const res = await http.get('/users')
  return res.data
}

export async function getUserById(id) {
  const res = await http.get(`/users/${id}`)
  return res.data
}

export async function createUser(data) {
  const hashed = await bcrypt.hash(data.password, 10)
  const res = await http.post('/users', { ...data, password: hashed })
  return res.data
}

export async function updateUser(id, data) {
  const payload = { ...data }
  if (data.password) {
    payload.password = await bcrypt.hash(data.password, 10)
  } else {
    delete payload.password 
  }
  const res = await http.patch(`/users/${id}`, payload)
  return res.data
}

export async function deleteUser(id) {
  await http.delete(`/users/${id}`)
  return id
}