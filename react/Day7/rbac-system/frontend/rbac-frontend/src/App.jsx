import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "./pages/Dashboard"
import Unauthorized from "./pages/Unauthorized"
import ProtectedRoute from "./routes/ProtectedRoute"
import PermissionRoute from "./routes/PermissionRoute"
import MainLayout from "./layouts/MainLayout"
import UsersPage from "./features/users/UsersPage"
import RolesPage from "./features/roles/RolesPage"
import EmployeesPage from "./features/employees/EmployeesPage"
import ProjectsPage from "./features/projects/ProjectsPage"

const App = () => {
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
            </Routes>
        </BrowserRouter>
    )
}

export default App