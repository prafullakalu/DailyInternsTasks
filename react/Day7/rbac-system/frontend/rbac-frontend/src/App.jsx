import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
// App.jsx lives under src/, so pages are in ./pages
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Unauthorized from "./pages/Unauthorized"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./routes/ProtectedRoute"
import PermissionRoute from "./routes/PermissionRoute"
import MainLayout from "./layouts/MainLayout"
import UsersPage from "./features/users/UsersPage"
import RolesPage from "./features/roles/RolesPage"
import EmployeesPage from "./features/employees/EmployeesPage"
import ProjectsPage from "./features/projects/ProjectsPage"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchRoles } from "./features/roles/rolesSlice"
import { fetchPermissions } from "./features/permissions/permissionsSlice"

const App = () => {
    const dispatch = useDispatch()
    const token = useSelector((state) => state.auth.token)

    // load roles & permissions once user is authenticated
    useEffect(() => {
        if (token) {
            dispatch(fetchRoles())
            dispatch(fetchPermissions())
        }
    }, [token, dispatch])

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    <Route
                        path="users"
                        element={
                            <PermissionRoute moduleName="users" action="view">
                                <UsersPage />
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="roles"
                        element={
                            <PermissionRoute moduleName="roles" action="view">
                                <RolesPage />
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="employees"
                        element={
                            <PermissionRoute moduleName="employees" action="view">
                                <EmployeesPage />
                            </PermissionRoute>
                        }
                    />

                    <Route
                        path="projects"
                        element={
                            <PermissionRoute moduleName="projects" action="view">
                                <ProjectsPage />
                            </PermissionRoute>
                        }
                    />
                </Route>

                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App