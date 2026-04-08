import { useSelector, useDispatch } from "react-redux"
import { toggleSidebar, toggleMobileMenu } from "../../features/ui/uiSlice"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Settings } from "lucide-react"

function Sidebar() {
  const dispatch = useDispatch()
  const isCollapsed = useSelector(state => state.ui.isSidebarCollapsed)
  const isMobileOpen = useSelector(state => state.ui.isMobileMenuOpen)

  const closeMobile = () => dispatch(toggleMobileMenu())

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0
          flex flex-col
          backdrop-blur-xl
          bg-white/10 dark:bg-white/5
          border-r border-white/20
          shadow-2xl
          text-gray-900 dark:text-gray-100
          transition-all duration-300
          z-40
          md:static md:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >

        {/* Logo Section */}
        <div className="p-4 font-bold text-lg border-b border-white/20">
          {!isCollapsed ? "Admin Panel" : "AP"}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `
              flex items-center gap-3 py-2 px-3 rounded-xl transition
              hover:bg-white/20
              ${isActive ? "bg-white/30" : ""}
              `
            }
          >
            <LayoutDashboard size={20} />
            {!isCollapsed && "Dashboard"}
          </NavLink>

          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `
              flex items-center gap-3 py-2 px-3 rounded-xl transition
              hover:bg-white/20
              ${isActive ? "bg-white/30" : ""}
              `
            }
          >
            <Users size={20} />
            {!isCollapsed && "Employees"}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `
              flex items-center gap-3 py-2 px-3 rounded-xl transition
              hover:bg-white/20
              ${isActive ? "bg-white/30" : ""}
              `
            }
          >
            <Settings size={20} />
            {!isCollapsed && "Settings"}
          </NavLink>
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="
            p-4 border-t border-white/20
            text-sm
            hover:bg-white/20
            transition text-black
          "
        >
          Toggle
        </button>

      </aside>
    </>
  )
}

export default Sidebar