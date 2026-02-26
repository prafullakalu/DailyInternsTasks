import { useSelector } from "react-redux"

// returns auth slice (token, user, permissions)
export const useAuth = () => {
    return useSelector((state) => state.auth)
}
