import { useDispatch, useSelector } from "react-redux"
import { toggleTheme } from "../features/theme/themeSlice"
import { useEffect } from "react"

function Settings() {
  const dispatch = useDispatch()
  const mode = useSelector(state => state.theme.mode)

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [mode])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      <div className=" dark:bg-indigo-900 p-6 rounded-xl shadow-soft flex justify-between items-center">
        <span>Dark Mode ({mode})</span>
        <button
          onClick={() => dispatch(toggleTheme())}
          className="bg-violet-200 hover:bg-violet-700 text-black px-4 py-2 rounded-lg transition"
        >
          Toggle
        </button>
      </div>
    </div>
  )
}

export default Settings