import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import ProtectedRoute from "./ProtectedRoute"
import Layout from "../components/layout/Layout"

const Dashboard = lazy(() => import("../pages/Dashboard"))
const Employees = lazy(() => import("../pages/Employees"))
const Settings = lazy(() => import("../pages/Settings"))
const Login = lazy(() => import("../pages/Login"))

function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </Suspense>
  )
}

export default AppRoutes