
import bcrypt from 'bcryptjs'
import http from './http'


export function createToken(user) {
  const payload = {
    id:    user.id,
    email: user.email,
    role:  user.role,
    exp:   Date.now() + 24 * 60 * 60 * 1000,
  }
  return btoa(JSON.stringify(payload))
}

export function decodeToken(token) {
  try { return JSON.parse(atob(token)) } catch { return null }
}

export function isTokenValid(token) {
  if (!token) return false
  const d = decodeToken(token)
  return !!(d && d.exp > Date.now())
}


export async function login(email, password) {
  const res = await http.get(`/users?email=${encodeURIComponent(email)}`)
  const user = res.data[0]
  if (!user) throw new Error('No account found with that email.')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Incorrect password.')

  const permRes = await http.get(`/permissions?role=${user.role}`)
  const permissions = permRes.data[0]?.permissions ?? []

  const token = createToken(user)
  localStorage.setItem('rbac_token', token)

  return { user, permissions, token }
}

export function logout() {
  localStorage.removeItem('rbac_token')
}