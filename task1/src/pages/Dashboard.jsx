import KpiCard from "../components/ui/KpiCard"
import RevenueChart from "../components/charts/RevenueChart"
import RecentActivity from "../components/ui/RecentActivity"
import { useSelector } from "react-redux"

function Dashboard() {
  const employees = useSelector(state => state.employees.employees)

  return (
    <div className="space-y-6">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-6 rounded-xl text-black">
        <h1 className="text-2xl font-bold">Good morning{employees.length ? ", team" : ""}</h1>
        <p className="mt-2 text-sm opacity-50">Here’s what’s happening with your product today.</p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Employees"
          value={employees.length}
          className="bg-white/80 dark:bg-white/20 text-gray-900 dark:text-gray-100"
        />
        <KpiCard
          title="Active"
          value={employees.filter(e => e.status === "Active").length}
          className="bg-white/80 dark:bg-white/20 text-gray-900 dark:text-gray-100"
        />
        <KpiCard
          title="On Leave"
          value={employees.filter(e => e.status === "On Leave").length}
          className="bg-white/80 dark:bg-white/20 text-gray-900 dark:text-gray-100"
        />
        <KpiCard
          title="Departments"
          value="5"
          className="bg-white/80 dark:bg-white/20 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* CHART */}
      <RevenueChart />

      {/* RECENT ACTIVITY */}
      <RecentActivity />
    </div>
  )
}

export default Dashboard