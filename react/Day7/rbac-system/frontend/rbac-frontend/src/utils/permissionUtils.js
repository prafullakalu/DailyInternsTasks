export const hasPermission = (permissions, moduleName, action) => {
    const module = permissions.find((p) => p.module === moduleName)
    if (!module) return false
    return module.actions.includes(action)
}