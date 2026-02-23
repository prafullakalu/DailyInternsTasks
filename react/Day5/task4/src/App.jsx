import { Routes, Route } from "react-router-dom"
import LayoutShell from "./components/LayoutShell"
import Dashboard from "./pages/Dashboard"
import Settings from "./pages/Settings"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LayoutShell />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App