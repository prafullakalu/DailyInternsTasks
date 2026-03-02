import { useSelector, useDispatch } from "react-redux"
import { toggleSidebar } from "../../features/ui/uiSlice"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Settings } from "lucide-react"

function Sidebar() {
  const dispatch = useDispatch()
  const isCollapsed = useSelector(
    state => state.ui.isSidebarCollapsed
  )
  const isMobileOpen = useSelector(state => state.ui.isMobileMenuOpen)

  // toggle helper for mobile clicking backdrop
  const closeMobile = () => dispatch({ type: "ui/toggleMobileMenu" })

  return (
    <>
      {/* mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-64
          flex-col
          bg-white/20 dark:bg-indigo-900
          text-gray-900 dark:text-gray-100
          shadow-soft
          transition-transform duration-300 z-40
          md:static md:flex md:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
      <div className="p-4 font-bold text-lg border-b">
        Admin
      </div>

      <nav className="flex-1 p-4 space-y-4">
        <NavLink to="/" className={({isActive}) =>
            `flex items-center gap-3 py-2 px-3 rounded ${isActive ? 'bg-indigo-200 dark:bg-indigo-700' : ''}`
          }>
          <LayoutDashboard size={20} />
          {!isCollapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/employees" className={({isActive}) =>
            `flex items-center gap-3 py-2 px-3 rounded ${isActive ? 'bg-indigo-200 dark:bg-indigo-700' : ''}`
          }>
          <Users size={20} />
          {!isCollapsed && "Employees"}
        </NavLink>

        <NavLink to="/settings" className={({isActive}) =>
            `flex items-center gap-3 py-2 px-3 rounded ${isActive ? 'bg-indigo-200 dark:bg-indigo-700' : ''}`
          }>
          <Settings size={20} />
          {!isCollapsed && "Settings"}
        </NavLink>
      </nav>

      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-4 border-t text-sm text-black"
      >
        Toggle
      </button>
    </aside>
  </>
  )
}

export default Sidebar