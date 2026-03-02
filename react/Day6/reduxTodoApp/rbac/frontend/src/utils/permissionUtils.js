export const hasPermission = (permissions = [], moduleName, action) => {
  if (!Array.isArray(permissions)) return false
  return permissions.some((p) => p.module === moduleName && p.action === action)
}
