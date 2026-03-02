import { useDispatch } from "react-redux"
import { toggleMobileMenu, toggleNotification } from "../../features/ui/uiSlice"
import { Menu, Bell } from "lucide-react"
import { logout } from "../../features/auth/authSlice"
import { useNavigate } from "react-router-dom"

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header className="h-16 bg-black-300 dark:bg-indigo-900 shadow-soft flex items-center justify-between px-4 text-gray-900 dark:text-white">
      
      <button
        className="md:hidden bg-indigo-200 dark:bg-indigo-700 p-2 rounded"
        onClick={() => dispatch(toggleMobileMenu())}
      >
        <Menu className="text-indigo-900 dark:text-white" />
      </button>

      <h1 className="font-semibold text-lg">
        Employee Admin
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleNotification())}
          className="p-2 rounded-full bg-indigo-200 dark:bg-indigo-500"
        >
          <Bell className="text-indigo-900 dark:text-indigo" />
        </button>

        <button
          onClick={handleLogout}
          className="text-sm bg-primary text-white px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar