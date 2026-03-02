
import http from './http'


export async function getPermissionDefinitions() {
  const res = await http.get('/permissionDefinitions')
  return res.data
}


export async function getAllRolePermissions() {
  const res = await http.get('/permissions')
  return res.data
}


export async function getRolePermissions(role) {
  const res = await http.get(`/permissions?role=${role}`)
  return res.data[0] ?? null
}

/**
 * Update the permission list for a role entry.
 * @param {string} id - the permission record id (e.g. "1")
 * @param {string[]} permissions - full updated permissions array
 */
export async function updateRolePermissions(id, permissions) {
  const res = await http.patch(`/permissions/${id}`, { permissions })
  return res.data
}

export async function addPermissionDefinition(data) {
  const res = await http.post('/permissionDefinitions', data)
  return res.data
}


export async function deletePermissionDefinition(id) {
  await http.delete(`/permissionDefinitions/${id}`)
  return id
}