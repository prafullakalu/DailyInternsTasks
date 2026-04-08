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
    <header className="
      h-16
      backdrop-blur-lg
      bg-white/10 dark:bg-white/5
      border-b border-white/20
      shadow-lg
      flex items-center justify-between
      px-4
      text-gray-900 dark:text-white
    ">

      <button
        className="md:hidden bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
        onClick={() => dispatch(toggleMobileMenu())}
      >
        <Menu className="text-gray-900 dark:text-white" />
      </button>

      <h1 className="font-semibold text-lg tracking-wide">
        Employee Admin
      </h1>

      <div className="flex items-center gap-4">

        <button
          onClick={() => dispatch(toggleNotification())}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          <Bell className="text-gray-900 dark:text-white" />
        </button>

        <button
          onClick={handleLogout}
          className="
            text-sm
            bg-gradient-to-r from-blue-600 to-indigo-700
            hover:opacity-90
            text-white
            px-4 py-1.5
            rounded-lg
            transition
          "
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar