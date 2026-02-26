import { useSelector } from 'react-redux'
import { useCallback } from 'react'


export default function usePermission() {
  const permissions = useSelector((s) => s.auth.permissions) ?? []
  const user        = useSelector((s) => s.auth.user)

  const can = useCallback(
    (perm) => Array.isArray(permissions) && permissions.includes(perm),
    [permissions]
  )

  return {
    can,
    permissions,
    isAdmin: user?.role === 'admin',
    role:    user?.role ?? null,
    user,
  }
}