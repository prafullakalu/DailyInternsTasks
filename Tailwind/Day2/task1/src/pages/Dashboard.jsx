import KpiCard from "../components/ui/KpiCard"
import RevenueChart from "../components/charts/RevenueChart"
import RecentActivity from "../components/ui/RecentActivity"
import { useSelector } from "react-redux"

function Dashboard() {
  const employees = useSelector(state => state.employees.employees)

  const activeCount = employees.filter(e => e.status === "Active").length
  const leaveCount = employees.filter(e => e.status === "On Leave").length

  return (
    <div className="space-y-8 ">

      {/* PREMIUM HEADER */}
      <div className="rounded-3xl p-10 text-white 
        bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#2563EB]
        shadow-2xl">

        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back{employees.length ? ", team" : ""}
        </h1>

        <p className="mt-4 text-blue-200 text-lg">
          Monitor performance, manage employees, and track productivity in one place.
        </p>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <KpiCard
          title="Total Employees"
          value={employees.length}
          className="rounded-2xl p-6 text-white
            bg-gradient-to-br from-[#2563EB] to-[#1E40AF]
            shadow-xl hover:scale-105 transition-all duration-300"
        />

        <KpiCard
          title="Active"
          value={activeCount}
          className="rounded-2xl p-6 text-white
            bg-gradient-to-br from-[#059669] to-[#047857]
            shadow-xl hover:scale-105 transition-all duration-300"
        />

        <KpiCard
          title="On Leave"
          value={leaveCount}
          className="rounded-2xl p-6 text-white
            bg-gradient-to-br from-[#F59E0B] to-[#D97706]
            shadow-xl hover:scale-105 transition-all duration-300"
        />

        <KpiCard
          title="Departments"
          value="5"
          className="rounded-2xl p-6 text-white
            bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]
            shadow-xl hover:scale-105 transition-all duration-300"
        />

      </div>

      {/* CHART SECTION */}
      <div className="rounded-3xl p-8 
        bg-[#0F172A] text-white 
        shadow-2xl">

        <h2 className="text-xl font-semibold mb-6 text-blue-300">
          Revenue Overview
        </h2>

        <RevenueChart />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="rounded-3xl p-8 
        bg-[#111827] text-black 
        shadow-2xl">

        <h2 className="text-xl font-semibold mb-6 text-black-400">
          Recent Activity
        </h2>

        <RecentActivity />
      </div>

    </div>
  )
}

export default Dashboard