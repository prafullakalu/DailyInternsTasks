import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isTokenValid } from '../services/authService'
import usePermission from '../hooks/usePermission'


export default function ProtectedRoute({ children, permission, adminOnly }) {
  const { token } = useSelector((s) => s.auth)
  const { can, isAdmin, user } = usePermission()

  if (!user || !isTokenValid(token)) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin)         return <Navigate to="/unauthorized" replace />
  if (permission && !can(permission)) return <Navigate to="/unauthorized" replace />

  return children
}