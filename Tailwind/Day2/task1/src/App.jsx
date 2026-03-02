import AppRoutes from "./routes/AppRoutes"
import { useSelector } from "react-redux"
import { useEffect } from "react"

function App() {
  const mode = useSelector(state => state.theme.mode)

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [mode])

  return <AppRoutes />
}

export default App