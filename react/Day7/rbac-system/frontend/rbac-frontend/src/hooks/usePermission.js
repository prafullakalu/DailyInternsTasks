import { useSelector } from "react-redux"
import { hasPermission } from "../utils/permissionUtils"

// returns boolean indicating whether the current user has the given permission
export const usePermission = (moduleName, action) => {
    const permissions = useSelector((state) => state.auth.permissions)
    return hasPermission(permissions, moduleName, action)
}

// optionally a hook that returns the full permission list
export const usePermissions = () => {
    return useSelector((state) => state.auth.permissions)
}
