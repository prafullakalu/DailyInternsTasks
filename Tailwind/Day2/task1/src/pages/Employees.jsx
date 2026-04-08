import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import {
  deleteEmployee,
  setSearch,
  setDepartmentFilter,
  setStatusFilter,
  setPage,
} from "../features/employees/employeeSlice"
import EmployeeModal from "../components/employees/EmployeeModal"
import Skeleton from "../components/ui/Skeleton"
import KpiCard from "../components/ui/KpiCard"

function Employees() {
  const dispatch = useDispatch()

  const {
    employees,
    search,
    departmentFilter,
    statusFilter,
    currentPage,
    itemsPerPage,
  } = useSelector(state => state.employees)

  const [editingEmployee, setEditingEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (employees.length < 1) {
      dispatch({ type: "employees/loadInitial" })
    }
  }, [employees.length, dispatch])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // KPI counts
  const totalEmployees = employees.length
  const activeCount = employees.filter(e => e.status === "Active").length
  const leaveCount = employees.filter(e => e.status === "On Leave").length
  const terminatedCount = employees.filter(e => e.status === "Terminated").length

  const filtered = employees
    .filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(e => departmentFilter === "All" || e.department === departmentFilter)
    .filter(e => statusFilter === "All" || e.status === statusFilter)

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const paginated = filtered.slice(start, start + itemsPerPage)

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl md:text-3xl font-bold dark:text-white">
          Employee Management
        </h2>

        <button
          onClick={() => setEditingEmployee({})}
          className="w-full md:w-auto px-5 py-3 rounded-xl text-white font-semibold
          bg-gradient-to-r from-blue-600 to-indigo-700
          transition hover:scale-105"
        >
          + Add Employee
        </button>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Employees"
          value={totalEmployees}
          className="bg-gradient-to-br from-blue-600 to-indigo-700"
        />
        <KpiCard
          title="Active"
          value={activeCount}
          className="bg-gradient-to-br from-green-600 to-emerald-700"
        />
        <KpiCard
          title="On Leave"
          value={leaveCount}
          className="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <KpiCard
          title="Terminated"
          value={terminatedCount}
          className="bg-gradient-to-br from-red-600 to-rose-700"
        />
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl
      bg-white dark:bg-[#0F172A] shadow-md">
        <input
          placeholder="Search..."
          className="p-3 rounded-xl bg-gray-100 dark:bg-[#1E293B]
          dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => dispatch(setSearch(e.target.value))}
        />

        <select
          className="p-3 rounded-xl bg-gray-100 dark:bg-[#1E293B]
          dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={departmentFilter}
          onChange={e => dispatch(setDepartmentFilter(e.target.value))}
        >
          <option>All</option>
          <option>IT</option>
          <option>HR</option>
          <option>Finance</option>
          <option>Marketing</option>
        </select>

        <select
          className="p-3 rounded-xl bg-gray-100 dark:bg-[#1E293B]
          dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={e => dispatch(setStatusFilter(e.target.value))}
        >
          <option>All</option>
          <option>Active</option>
          <option>On Leave</option>
          <option>Terminated</option>
          <option>Probation</option>
        </select>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block rounded-2xl overflow-hidden bg-white dark:bg-[#0F172A] shadow-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#1E293B]">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Department</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="border-t dark:border-[#1E293B]">
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              : paginated.map(emp => (
                  <tr key={emp.id} className="border-t dark:border-[#1E293B]">
                    <td className="p-4">{emp.firstName} {emp.lastName}</td>
                    <td className="p-4">{emp.email}</td>
                    <td className="p-4">{emp.department}</td>
                    <td className="p-4">{emp.role}</td>
                    <td className="p-4">{emp.status}</td>
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => dispatch(deleteEmployee(emp.id))}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] shadow-md space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          : paginated.map(emp => (
              <div
                key={emp.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] shadow-md space-y-2"
              >
                <div className="font-semibold text-lg dark:text-white">
                  {emp.firstName} {emp.lastName}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {emp.email}
                </div>

                <div className="flex justify-between text-sm">
                  <span>{emp.department}</span>
                  <span>{emp.role}</span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                    {emp.status}
                  </span>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingEmployee(emp)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch(deleteEmployee(emp.id))}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {editingEmployee !== null && (
        <EmployeeModal
          employee={editingEmployee}
          close={() => setEditingEmployee(null)}
        />
      )}
    </div>
  )
}

export default Employees