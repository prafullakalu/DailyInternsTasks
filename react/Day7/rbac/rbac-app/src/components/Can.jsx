import usePermission from '../hooks/usePermission'


export default function Can({ permission, adminOnly, children, fallback = null }) {
  const { can, isAdmin } = usePermission()
  if (adminOnly)  return isAdmin ? children : fallback
  if (permission) return can(permission) ? children : fallback
  return children
}