// permissions coming from backend are an array of objects like:
// { id: "1", module: "users", action: "view" }
// helper checks if user has a perm matching both module and action
export const hasPermission = (permissions = [], moduleName, action) => {
    if (!Array.isArray(permissions)) return false
    return permissions.some(
        (p) => p.module === moduleName && p.action === action
    )
}

// optional utility: group permissions by module for UI convenience
export const groupPermissionsByModule = (permissions = []) => {
    return permissions.reduce((acc, p) => {
        if (!acc[p.module]) acc[p.module] = []
        if (!acc[p.module].includes(p.action)) acc[p.module].push(p.action)
        return acc
    }, {})
}
