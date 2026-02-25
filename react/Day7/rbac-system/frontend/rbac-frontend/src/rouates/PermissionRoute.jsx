import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { hasPermission } from "../utils/permissionUtils"

const PermissionRoute = ({ moduleName, action, children }) => {
    const permissions = useSelector((state) => state.auth.permissions)

    const allowed = hasPermission(permissions, moduleName, action)

    if (!allowed) {
        return <Navigate to="/unauthorized" />
    }

    return children
}

export default PermissionRoute