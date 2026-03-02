import { Link } from "react-router-dom"
import { LayoutDashboard, Users, Settings } from "lucide-react"

function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-indigo-900 shadow-soft flex justify-around p-3">
      <Link to="/">
        <LayoutDashboard size={20} />
      </Link>
      <Link to="/employees">
        <Users size={20} />
      </Link>
      <Link to="/settings">
        <Settings size={20} />
      </Link>
    </div>
  )
}

export default BottomNav