import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import BottomNav from "./BottomNav"
import NotificationPanel from "./NotificationPanel"

function Layout() {
  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-secondary flex overflow-x-hidden text-gray-900 dark:text-gray-100">
      
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <NotificationPanel />

      <BottomNav />
    </div>
  )
}

export default Layout