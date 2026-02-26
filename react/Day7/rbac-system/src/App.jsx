import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isTokenValid } from './services/authService'
import ProtectedRoute   from './routes/ProtectedRoute'
import AppLayout        from './components/AppLayout'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import UsersPage        from './pages/UsersPage'
import EmployeesPage    from './pages/EmployeesPage'
import ProjectsPage     from './pages/ProjectsPage'
import RolesPage        from './pages/RolesPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function AuthRedirect({ children }) {
  const { user, token } = useSelector((s) => s.auth)
  if (user && isTokenValid(token)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"        element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected — all need login */}
        <Route path="/dashboard" element={
          <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
        } />

        {/* Users — needs viewUser permission */}
        <Route path="/users" element={
          <ProtectedRoute permission="viewUser"><AppLayout><UsersPage /></AppLayout></ProtectedRoute>
        } />

        {/* Employees — guarded by viewEmployee permission */}
        <Route path="/employees" element={
          <ProtectedRoute permission="viewEmployee"><AppLayout><EmployeesPage /></AppLayout></ProtectedRoute>
        } />

        {/* Projects — guarded by viewProject permission */}
        <Route path="/projects" element={
          <ProtectedRoute permission="viewProject"><AppLayout><ProjectsPage /></AppLayout></ProtectedRoute>
        } />

        {/* Role Permissions — only users with managePermissions can access */}
        <Route path="/roles" element={
          <ProtectedRoute permission="managePermissions"><AppLayout><RolesPage /></AppLayout></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}